import test from "node:test";
import assert from "node:assert/strict";
import { createZeroRegister, runMultiQubitCircuit } from "./multiQubitCircuit.js";
import {
  analyzeTwoQubitEntanglement,
  BELL_STATE_PRESETS,
} from "./twoQubitEntanglement.js";

const closeTo = (actual, expected, epsilon = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be close to ${expected}`);
};
const run = (operations) => runMultiQubitCircuit(createZeroRegister(2), operations);

test("all four Bell circuits produce maximally entangled states", () => {
  for (const [name, operations] of Object.entries(BELL_STATE_PRESETS)) {
    const state = run(operations);
    const result = analyzeTwoQubitEntanglement(state);
    const rootHalf = Math.SQRT1_2;
    const expectedAmplitudes = {
      "Phi+": [rootHalf, 0, 0, rootHalf],
      "Phi-": [rootHalf, 0, 0, -rootHalf],
      "Psi+": [0, rootHalf, rootHalf, 0],
      "Psi-": [0, rootHalf, -rootHalf, 0],
    }[name];
    state.amplitudes.forEach((amplitude, index) => {
      closeTo(amplitude.re, expectedAmplitudes[index]);
      closeTo(amplitude.im, 0);
    });
    assert.equal(result.isEntangled, true, name);
    assert.equal(result.isMaximallyEntangled, true, name);
    assert.equal(result.isProductState, false, name);
    closeTo(result.entropy, 1, 1e-7);
    closeTo(result.q0.entropy, 1, 1e-7);
    closeTo(result.q1.entropy, 1, 1e-7);
    closeTo(result.q0.purity, 0.5, 1e-7);
    closeTo(result.q1.purity, 0.5, 1e-7);
    closeTo(result.concurrence, 1, 1e-7);
    closeTo(result.schmidtProbabilities[0], 0.5, 1e-7);
    closeTo(result.schmidtProbabilities[1], 0.5, 1e-7);
    closeTo(result.q0.matrix[0][0].re, 0.5, 1e-7);
    closeTo(result.q0.matrix[1][1].re, 0.5, 1e-7);
    closeTo(result.q0.matrix[0][1].re, 0);
    closeTo(result.q0.matrix[0][1].im, 0);
  }
});

test("a product superposition has pure local states and zero entanglement", () => {
  const state = run([
    { name: "H", target: 0 },
    { name: "H", target: 1 },
  ]);
  const result = analyzeTwoQubitEntanglement(state);
  assert.equal(result.isProductState, true);
  assert.equal(result.isEntangled, false);
  assert.equal(result.isMaximallyEntangled, false);
  closeTo(result.entropy, 0);
  closeTo(result.q0.purity, 1);
  closeTo(result.q1.purity, 1);
  closeTo(result.concurrence, 0);
  closeTo(result.schmidtProbabilities[0], 1);
  closeTo(result.schmidtProbabilities[1], 0);
});

test("partially entangled Schmidt states return binary entropy and concurrence", () => {
  const theta = Math.PI / 6;
  const state = {
    numQubits: 2,
    amplitudes: [
      { re: Math.cos(theta), im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: Math.sin(theta), im: 0 },
    ],
  };
  const result = analyzeTwoQubitEntanglement(state);
  const p = Math.cos(theta) ** 2;
  const expectedEntropy = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
  closeTo(result.entropy, expectedEntropy);
  closeTo(result.concurrence, Math.sin(2 * theta));
  closeTo(result.q0.matrix[0][0].re, p);
  closeTo(result.q0.matrix[1][1].re, 1 - p);
});

test("complex relative phase does not change Bell entanglement", () => {
  const state = {
    numQubits: 2,
    amplitudes: [
      { re: Math.SQRT1_2, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: 0 },
      { re: 0, im: Math.SQRT1_2 },
    ],
  };
  const result = analyzeTwoQubitEntanglement(state);
  closeTo(result.entropy, 1, 1e-7);
  closeTo(result.concurrence, 1, 1e-7);
});

test("both reduced density matrices are Hermitian and share the Schmidt spectrum", () => {
  const state = run([
    { name: "H", target: 0 },
    { name: "RY", target: 1, theta: Math.PI / 3 },
    { name: "CNOT", control: 0, target: 1 },
    { name: "T", target: 0 },
  ]);
  const result = analyzeTwoQubitEntanglement(state);
  for (const reduced of [result.q0, result.q1]) {
    closeTo(reduced.matrix[0][1].re, reduced.matrix[1][0].re);
    closeTo(reduced.matrix[0][1].im, -reduced.matrix[1][0].im);
    closeTo(reduced.eigenvalues[0] + reduced.eigenvalues[1], 1);
  }
  closeTo(result.q0.eigenvalues[0], result.q1.eigenvalues[0]);
  closeTo(result.q0.eigenvalues[1], result.q1.eigenvalues[1]);
});

test("entanglement analysis rejects invalid and non-normalized states", () => {
  assert.throws(() => analyzeTwoQubitEntanglement(null), /two-qubit state/);
  assert.throws(() => analyzeTwoQubitEntanglement({ numQubits: 2, amplitudes: [{ re: 1, im: 0 }] }), /two-qubit state/);
  assert.throws(() => analyzeTwoQubitEntanglement({
    numQubits: 2,
    amplitudes: Array.from({ length: 4 }, () => ({ re: 1, im: 0 })),
  }), /normalized/);
});
