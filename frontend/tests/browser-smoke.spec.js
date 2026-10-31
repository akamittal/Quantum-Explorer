import { test, expect } from "@playwright/test";

async function openWorkspace(page, testInfo) {
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on("pageerror", (error) => pageErrors.push(error.stack || error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /BYPASS INTRODUCTION/i }).click();

  const workspaceHeading = page.getByText(/QUANTUM ENGINE \/\/ MAIN CONTAINER WORKSPACE/i);
  try {
    await expect(workspaceHeading).toBeVisible({ timeout: 10000 });
  } catch (error) {
    const diagnostics = {
      url: page.url(),
      title: await page.title().catch(() => "<title unavailable>"),
      bodyText: await page.locator("body").innerText().catch(() => "<body unavailable>"),
      pageErrors,
      consoleErrors,
      failedRequests,
    };
    await page.screenshot({
      path: testInfo.outputPath("workspace-startup-failure.png"),
      fullPage: true,
    }).catch(() => {});
    throw new Error(
      `Workspace did not render after bypass. Browser diagnostics:\n${JSON.stringify(diagnostics, null, 2)}\nOriginal assertion: ${error.message}`
    );
  }
  return pageErrors;
}

test("intro can be bypassed and the single-qubit workspace loads", async ({ page }, testInfo) => {
  const pageErrors = await openWorkspace(page, testInfo);
  await expect(page.getByRole("heading", { name: /FROM KET NOTATION TO COLUMN VECTORS/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hadamard", exact: true })).toBeVisible();
  await expect(page.getByText(/Loading Bloch sphere/i)).toHaveCount(0, { timeout: 15000 });
  expect(pageErrors).toEqual([]);
});

test("Hadamard updates the displayed state and expected probabilities", async ({ page }, testInfo) => {
  await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: "Hadamard", exact: true }).click();
  await expect(page.getByText("POLAR ANGLE (θ - VERTICAL TILT)", { exact: true })).toBeVisible();
  await expect(page.getByText(/50\.0%/).first()).toBeVisible();
  await expect(page.getByText(/100\.0%/)).toHaveCount(0);
});

test("Pauli-X flips the measured basis state and reset returns to |0>", async ({ page }, testInfo) => {
  await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: "Pauli-X", exact: true }).click();
  await expect(page.getByText("POLAR ANGLE (θ - VERTICAL TILT)", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset to |0⟩", exact: true }).click();
  await expect(page.getByText(/100\.0%/).first()).toBeVisible();
});

test("measurement shots display observed counts that sum to requested shots", async ({ page }, testInfo) => {
  await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: "Hadamard", exact: true }).click();
  await page.getByRole("button", { name: "Measure 100 shots", exact: true }).click();
  const result = page.locator('[aria-live="polite"]').filter({ hasText: "Observed counts" });
  await expect(result).toBeVisible();
  const text = await result.innerText();
  const zero = Number(text.match(/\|0⟩: (\d+)/)?.[1]);
  const one = Number(text.match(/\|1⟩: (\d+)/)?.[1]);
  expect(zero + one).toBe(100);
  await expect(result).toContainText("Expected:");
});

test("Deutsch algorithm classifies all four oracle functions in the new module", async ({ page }, testInfo) => {
  const pageErrors = await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await page.getByRole("button", { name: /M3\.1: Deutsch's Algorithm/i }).click();
  await expect(page.getByRole("heading", { name: "Deutsch's algorithm" })).toBeVisible();

  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await expect(page.getByRole("button", { name: /M2.1: Multi-Qubit Systems/i })).toBeVisible();
  await page.getByRole("button", { name: /CLOSE INDEX/i }).click();
  await expect(page.getByText(/Apply the final Hadamard to each input term/i)).toBeVisible();
  await expect(page.getByText("BALANCED", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /^Constant 0 CONSTANT/ }).click();
  await expect(page.locator("section").filter({ hasText: "SIMULATOR'S CLASSIFICATION" }).getByText("CONSTANT", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Constant 1 CONSTANT/ }).click();
  await expect(page.locator("strong").filter({ hasText: "CONSTANT" }).first()).toBeVisible();
  await page.getByRole("button", { name: /Balanced: f\(x\)=1−x/i }).click();
  await expect(page.locator("section").filter({ hasText: "SIMULATOR'S CLASSIFICATION" }).getByText("BALANCED", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("Deutsch-Jozsa builds a truth-table oracle, explains the promise, and runs through Qiskit", async ({ page }, testInfo) => {
  const pageErrors = await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await page.getByRole("button", { name: /M3\.1: Deutsch's Algorithm/i }).click();
  await expect(page.getByRole("heading", { name: "Deutsch's algorithm" })).toBeVisible();
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await page.getByRole("button", { name: /M3\.2: Deutsch–Jozsa Algorithm/i }).click();

  await expect(page.getByRole("heading", { name: "Deutsch–Jozsa algorithm" })).toBeVisible();
  await expect(page.getByText("BALANCED PROMISE SATISFIED")).toBeVisible();
  await expect(page.locator("pre").filter({ hasText: "qc.mcx([0, 1, 2], 3)" })).toBeVisible();

  await page.getByRole("button", { name: "Toggle f(000)" }).click();
  await expect(page.getByText("PROMISE VIOLATED")).toBeVisible();
  await page.getByRole("button", { name: /Three-bit parity/i }).click();
  await expect(page.getByText("BALANCED PROMISE SATISFIED")).toBeVisible();

  let requestPayload;
  await page.route("**/api/qiskit/execute", async (route) => {
    requestPayload = route.request().postDataJSON();
    const statevector = Array.from({ length: 16 }, (_, index) => ({
      index,
      bitstring: index.toString(2).padStart(4, "0"),
      re: index === 7 ? Math.SQRT1_2 : index === 15 ? -Math.SQRT1_2 : 0,
      im: 0,
      probability: index === 7 || index === 15 ? 0.5 : 0,
    }));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        engine: "qiskit-aer",
        shots: 1000,
        stdout: "Circuit:\nDeutsch-Jozsa oracle\nStatevector:",
        statevector,
        counts: { "0111": 500, "1111": 500 },
      }),
    });
  });
  await page.getByRole("button", { name: /Run Python on Qiskit/i }).click();
  await expect(page.getByText("Execution result")).toBeVisible();
  expect(requestPayload.num_qubits).toBe(4);
  expect(requestPayload.operations.some((operation) => operation.name === "MCX" && operation.controls.length === 3)).toBe(true);
  expect(pageErrors).toEqual([]);
});

test("AI Quantum Tutor opens, receives workspace context, and displays its answer", async ({ page }, testInfo) => {
  const pageErrors = await openWorkspace(page, testInfo);
  let requestPayload;
  await page.route("**/api/ai/chat", async (route) => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: "A qubit is a two-level quantum system.", model: "gemini-test" }) });
  });
  await page.getByRole("button", { name: "Open AI Quantum Tutor" }).click();
  await expect(page.getByRole("complementary", { name: "AI Quantum Tutor" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "AI Quantum Tutor" })).toHaveCSS("z-index", "2147483001");
  await page.getByPlaceholder("Ask your quantum question…").fill("What is a qubit?");
  await page.getByRole("button", { name: /SEND QUESTION/i }).click();
  await expect(page.getByText("A qubit is a two-level quantum system.")).toBeVisible();
  expect(requestPayload.message).toBe("What is a qubit?");
  expect(requestPayload.context.module).toBe("Single-Qubit Studio");
  expect(requestPayload.context.simulator.blochVector).toBeTruthy();
  expect(pageErrors).toEqual([]);
});

test("AI Quantum Tutor accepts a screenshot and sends it as multimodal input", async ({ page }, testInfo) => {
  await openWorkspace(page, testInfo);
  let requestPayload;
  await page.route("**/api/ai/chat", async (route) => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: "I can read the screenshot.", model: "gemini-test" }) });
  });
  await page.getByRole("button", { name: "Open AI Quantum Tutor" }).click();
  await page.locator('input[aria-label="Choose screenshot"]').setInputFiles({
    name: "quantum-circuit.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pXcAAAAASUVORK5CYII=", "base64")
  });
  await expect(page.getByAltText("Screenshot preview")).toBeVisible();
  await page.getByPlaceholder("What should I explain in this screenshot?").fill("Explain this circuit.");
  await page.getByRole("button", { name: /SEND QUESTION/i }).click();
  await expect(page.getByText("I can read the screenshot.")).toBeVisible();
  expect(requestPayload.image.mimeType).toBe("image/png");
  expect(requestPayload.image.data.length).toBeGreaterThan(20);
});


test("Bernstein–Vazirani recovers an editable hidden string and runs the same CNOT circuit in Qiskit", async ({ page }, testInfo) => {
  const pageErrors = await openWorkspace(page, testInfo);
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await page.getByRole("button", { name: /M2\.3: Bernstein–Vazirani Algorithm/i }).click();
  await expect(page.getByRole("heading", { name: "Bernstein–Vazirani algorithm" })).toBeVisible();
  await expect(page.getByText("101", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("RECOVERED HIDDEN STRING")).toBeVisible();
  await expect(page.locator("pre").filter({ hasText: "qc.cx(2, 3)" })).toBeVisible();
  await page.getByRole("button", { name: "Toggle secret bit s2" }).click();
  await expect(page.getByText("001", { exact: true }).first()).toBeVisible();

  let requestPayload;
  await page.route("**/api/qiskit/execute", async (route) => {
    requestPayload = route.request().postDataJSON();
    const statevector = Array.from({ length: 16 }, (_, index) => ({
      index, bitstring: index.toString(2).padStart(4, "0"),
      re: index === 1 ? Math.SQRT1_2 : index === 9 ? -Math.SQRT1_2 : 0,
      im: 0, probability: index === 1 || index === 9 ? 0.5 : 0,
    }));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      engine: "qiskit-aer", shots: 1000, stdout: "Circuit:\\nBernstein-Vazirani oracle\\nStatevector:",
      statevector, counts: { "0001": 1000 },
    }) });
  });
  await page.getByRole("button", { name: /Run Python on Qiskit/i }).click();
  await expect(page.getByText("Execution result")).toBeVisible();
  expect(requestPayload.num_qubits).toBe(4);
  expect(requestPayload.operations.some((operation) => operation.name === "CX" && operation.control === 2 && operation.target === 3)).toBe(true);
  expect(pageErrors).toEqual([]);
});
