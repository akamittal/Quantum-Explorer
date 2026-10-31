import { test, expect } from "@playwright/test";

async function openWorkspace(page) {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: /BYPASS INTRODUCTION/i }).click();
  await expect(page.getByText(/QUANTUM ENGINE \/\/ MAIN CONTAINER WORKSPACE/i)).toBeVisible();
  return pageErrors;
}

test("intro can be bypassed and the single-qubit workspace loads", async ({ page }) => {
  const pageErrors = await openWorkspace(page);
  await expect(
    page.getByRole("heading", { name: /FROM KET NOTATION TO COLUMN VECTORS/i })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Hadamard", exact: true })).toBeVisible();
  await expect(page.getByText(/Loading Bloch sphere/i)).toHaveCount(0, { timeout: 15000 });
  expect(pageErrors).toEqual([]);
});

test("Hadamard updates the displayed state and expected probabilities", async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole("button", { name: "Hadamard", exact: true }).click();
  await expect(page.getByText(/POLAR ANGLE/i)).toBeVisible();
  await expect(page.getByText(/50\.0%/).first()).toBeVisible();
  await expect(page.getByText(/100\.0%/)).toHaveCount(0);
});

test("Pauli-X flips the measured basis state and reset returns to |0>", async ({ page }) => {
  await openWorkspace(page);
  await page.getByRole("button", { name: "Pauli-X", exact: true }).click();
  await expect(page.getByText(/POLAR ANGLE/i)).toBeVisible();
  await page.getByRole("button", { name: "Reset to |0⟩", exact: true }).click();
  await expect(page.getByText(/100\.0%/).first()).toBeVisible();
});

test("measurement shots display observed counts that sum to requested shots", async ({ page }) => {
  await openWorkspace(page);
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

test("Deutsch algorithm classifies all four oracle functions in the new module", async ({ page }) => {
  const pageErrors = await openWorkspace(page);
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await page.getByRole("button", { name: /M3\.1: Deutsch's Algorithm/i }).click();
  await expect(page.getByRole("heading", { name: "Deutsch's algorithm" })).toBeVisible();

  await page.getByRole("button", { name: /MENU INDEX/i }).click();
  await expect(page.getByRole("button", { name: /M2.1: Multi-Qubit Systems/i })).toBeVisible();
  await page.getByRole("button", { name: /MENU INDEX/i }).click();
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

test("AI Quantum Tutor opens, receives workspace context, and displays its answer", async ({ page }) => {
  const pageErrors = await openWorkspace(page);
  let requestPayload;
  await page.route("**/api/ai/chat", async (route) => {
    requestPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ reply: "A qubit is a two-level quantum system.", model: "gemini-test" })
    });
  });

  await page.getByRole("button", { name: "Open AI Quantum Tutor" }).click();
  await expect(page.getByRole("complementary", { name: "AI Quantum Tutor" } )).toBeVisible();
  await expect(page.getByRole("complementary", { name: "AI Quantum Tutor" })).toHaveCSS("z-index", "2147483001");
  await page.getByPlaceholder("Ask your quantum question…").fill("What is a qubit?");
  await page.getByRole("button", { name: /SEND QUESTION/i }).click();
  await expect(page.getByText("A qubit is a two-level quantum system.")).toBeVisible();
  expect(requestPayload.message).toBe("What is a qubit?");
  expect(requestPayload.context.module).toBe("Single-Qubit Studio");
  expect(requestPayload.context.simulator.blochVector).toBeTruthy();
  expect(pageErrors).toEqual([]);
});

test("AI Quantum Tutor accepts a screenshot and sends it as multimodal input", async ({ page }) => {
  await openWorkspace(page);
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
