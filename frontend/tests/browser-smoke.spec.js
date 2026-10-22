import { test, expect } from "@playwright/test";

test("intro can be bypassed and the single-qubit workspace loads", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: /BYPASS INTRODUCTION/i }).click();

  await expect(page.getByText(/QUANTUM ENGINE \/\/ MAIN CONTAINER WORKSPACE/i)).toBeVisible();
  await expect(page.getByText(/Module 1\.1: The Single Qubit/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Hadamard/i })).toBeVisible();
  await expect(page.getByText(/IBM QISKIT CODE BLUEPRINT/i)).toBeVisible();
  await expect(page.getByText(/Loading Bloch sphere/i)).toHaveCount(0, { timeout: 15000 });
  expect(pageErrors).toEqual([]);
});

test("applying Hadamard updates the single-qubit readout", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /BYPASS INTRODUCTION/i }).click();

  await page.getByRole("button", { name: /Hadamard/i }).click();
  await expect(page.getByText(/POLAR ANGLE/i)).toBeVisible();
  await expect(page.getByText(/50\.0%/).first()).toBeVisible();
});
