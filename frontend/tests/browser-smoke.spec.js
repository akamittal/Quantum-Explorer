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
