import test from "node:test";
import assert from "node:assert/strict";
import {
  buildQpeOperations,
  createQpePhaseState,
  estimateEigenphase,
  qpeDiagnostics,
  qpeState,
} from "./quantumPhaseEstimation.js";

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected}`);
}

test("phase-kickback state has uniform magnitude and the expected controlled-power phase", () => {
  const state = createQpePhaseState(3, 0.3125);
  assert.equal(state.length, 8);
  state.forEach((amplitude, integer) => {
    close(Math.hypot(amplitude.re, amplitude.im), 1 / Math.sqrt(8));
    const expected = 2 * Math.PI * 0.3125 * integer;
    close(amplitude.re, Math.cos(expected) / Math.sqrt(8));
    close(amplitude.im, Math.sin(expected) / Math.sqrt(8));
  });
});

test("a binary-representable eigenphase is recovered exactly by inverse QFT", () => {
  const result = estimateEigenphase(4, 5 / 16);
  assert.equal(result.index, 5);
  assert.equal(result.bitstring, "0101");
  close(result.estimate, 5 / 16);
  close(result.probability, 1);
  result.diagnostics.forEach((item) => close(item.probability, item.index === 5 ? 1 : 0));
});

test("non-binary eigenphases produce a normalized, peaked distribution", () => {
  const result = estimateEigenphase(4, 0.3);
  close(result.diagnostics.reduce((sum, item) => sum + item.probability, 0), 1);
  assert.equal(result.index, 5);
  assert.ok(result.probability > 0.8);
  assert.ok(result.circularError <= 1 / 16);
});

test("increasing counting precision sharpens the eigenphase estimate", () => {
  const coarse = estimateEigenphase(3, 0.3);
  const fine = estimateEigenphase(5, 0.3);
  assert.ok(fine.circularError <= coarse.circularError);
  assert.equal(fine.diagnostics.length, 32);
});

test("QPE circuit prepares the target eigenstate, applies controlled powers, then inverse QFT", () => {
  const operations = buildQpeOperations(3, 0.25);
  assert.deepEqual(operations.slice(0, 4), [
    { name: "X", qubit: 3 },
    { name: "H", qubit: 0 },
    { name: "H", qubit: 1 },
    { name: "H", qubit: 2 },
  ]);
  const controlled = operations.filter((operation) => operation.name === "CP").slice(0, 3);
  controlled.forEach((operation, qubit) => {
    assert.equal(operation.control, qubit);
    assert.equal(operation.target, 3);
    close(operation.theta, 2 * Math.PI * 0.25 * 2 ** qubit);
  });
  assert.equal(operations.filter((operation) => operation.name === "SWAP").length, 1);
  assert.deepEqual(operations.slice(-2).map((operation) => operation.name), ["CP", "H"]);
});

test("QPE statevector agrees with diagnostics for an exactly representable phase", () => {
  const state = qpeState(3, 3 / 8);
  const diagnostics = qpeDiagnostics(3, 3 / 8);
  assert.equal(state.length, 8);
  assert.equal(diagnostics[3].bitstring, "011");
  close(diagnostics[3].probability, 1);
  diagnostics.forEach((item, index) => close(item.probability, index === 3 ? 1 : 0));
});

test("QPE rejects invalid counting registers and eigenphases", () => {
  assert.throws(() => createQpePhaseState(1, 0.2), /2 to 7/);
  assert.throws(() => qpeState(8, 0.2), /2 to 7/);
  assert.throws(() => buildQpeOperations(3, -0.1), /interval/);
  assert.throws(() => estimateEigenphase(3, 1), /interval/);
});
