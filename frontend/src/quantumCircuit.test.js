import test from "node:test";
import assert from "node:assert/strict";
import {
  applySingleQubitGate,
  getSingleQubitGateMatrix,
  getStateProbabilities,
  runSingleQubitCircuit,
  sampleMeasurements,
} from "./quantumCircuit.js";

const closeTo = (actual, expected, epsilon = 1e-10) => {
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `expected ${actual} to be close to ${expected}`,
  );
};
const zeroState = () => ({
  alpha: { re: 1, im: 0 },
  beta: { re: 0, im: 0 },
});
const normSquared = (state) =>
  state.alpha.re ** 2 + state.alpha.im ** 2 +
  state.beta.re ** 2 + state.beta.im ** 2;
const complexMultiply = (a, b) => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const complexConjugate = (a) => ({ re: a.re, im: -a.im });

function assertUnitary(matrix, epsilon = 1e-10) {
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      let sum = { re: 0, im: 0 };
      for (let k = 0; k < 2; k += 1) {
        const term = complexMultiply(
          complexConjugate(matrix[k][row]),
          matrix[k][column],
        );
        sum = { re: sum.re + term.re, im: sum.im + term.im };
      }
      closeTo(sum.re, row === column ? 1 : 0, epsilon);
      closeTo(sum.im, 0, epsilon);
    }
  }
}

test("every supported gate has a unitary matrix", () => {
  const gates = ["I", "H", "X", "Y", "Z", "S", "T"];
  const rotations = ["RX", "RY", "RZ"].flatMap((name) =>
    [-2 * Math.PI, -Math.PI / 3, 0, Math.PI / 7, Math.PI, 4 * Math.PI].map(
      (theta) => ({ name, theta }),
    ),
  );
  for (const gate of [...gates, ...rotations]) {
    assertUnitary(getSingleQubitGateMatrix(gate));
  }
});

test("X maps |0> to |1> and X twice returns |0>", () => {
  const state = applySingleQubitGate(zeroState(), "X");
  closeTo(state.alpha.re, 0);
  closeTo(state.alpha.im, 0);
  closeTo(state.beta.re, 1);
  closeTo(state.beta.im, 0);
  const restored = applySingleQubitGate(state, "X");
  closeTo(restored.alpha.re, 1);
  closeTo(restored.beta.re, 0);
});

test("H creates an equal superposition from |0>", () => {
  const state = runSingleQubitCircuit(zeroState(), [{ name: "H" }]);
  const probabilities = getStateProbabilities(state);
  closeTo(probabilities.zero, 0.5);
  closeTo(probabilities.one, 0.5);
});

test("H followed by H returns |0>", () => {
  const state = runSingleQubitCircuit(zeroState(), ["H", "H"]);
  closeTo(state.alpha.re, 1);
  closeTo(state.alpha.im, 0);
  closeTo(state.beta.re, 0);
  closeTo(state.beta.im, 0);
});

test("H-Z-H is equivalent to X on |0>", () => {
  const state = runSingleQubitCircuit(zeroState(), ["H", "Z", "H"]);
  closeTo(state.alpha.re, 0);
  closeTo(state.beta.re, 1);
  closeTo(state.beta.im, 0);
});

test("phase gates change phase without changing computational probabilities", () => {
  const state = runSingleQubitCircuit(zeroState(), ["H", "S", "T"]);
  const probabilities = getStateProbabilities(state);
  closeTo(probabilities.zero, 0.5);
  closeTo(probabilities.one, 0.5);
  closeTo(normSquared(state), 1);
});

test("all gates preserve the norm of a general normalized complex state", () => {
  const initial = {
    alpha: { re: 0.3, im: 0.4 },
    beta: { re: Math.sqrt(0.75), im: 0 },
  };
  closeTo(normSquared(initial), 1);
  const operations = [
    "I", "H", "X", "Y", "Z", "S", "T",
    { name: "RX", theta: Math.PI / 5 },
    { name: "RY", theta: -Math.PI / 3 },
    { name: "RZ", theta: 2.4 },
  ];
  for (const operation of operations) {
    const next = applySingleQubitGate(initial, operation);
    closeTo(normSquared(next), 1, 2e-10);
  }
  const sequence = runSingleQubitCircuit(initial, operations);
  closeTo(normSquared(sequence), 1, 5e-10);
});

test("rotation gates require finite angles and use the expected RY probabilities", () => {
  assert.throws(() => getSingleQubitGateMatrix({ name: "RX" }), /theta/);
  assert.throws(() => getSingleQubitGateMatrix({ name: "RY", theta: NaN }), /theta/);
  const state = runSingleQubitCircuit(zeroState(), [
    { name: "RY", theta: Math.PI / 3 },
  ]);
  const probabilities = getStateProbabilities(state);
  closeTo(probabilities.zero + probabilities.one, 1);
  closeTo(probabilities.one, 0.25);
});

test("measurement sampling follows Born-rule probabilities with a seeded RNG", () => {
  const state = runSingleQubitCircuit(zeroState(), [
    { name: "RY", theta: 2 * Math.asin(Math.sqrt(0.3)) },
  ]);
  let seed = 0x12345678;
  const seededRandom = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const shots = 20000;
  const result = sampleMeasurements(state, shots, seededRandom);
  closeTo(result.probabilityOne, 0.3, 1e-10);
  assert.equal(result.zero + result.one, shots);
  assert.ok(Math.abs(result.one / shots - 0.3) < 0.015);
  assert.ok(Math.abs(result.zero / shots - 0.7) < 0.015);
});

test("measurement handles deterministic basis states and exact shot totals", () => {
  const resultZero = sampleMeasurements(zeroState(), 100, () => 0.999);
  assert.equal(resultZero.zero, 100);
  assert.equal(resultZero.one, 0);
  const resultOne = sampleMeasurements(
    applySingleQubitGate(zeroState(), "X"),
    100,
    () => 0,
  );
  assert.equal(resultOne.zero, 0);
  assert.equal(resultOne.one, 100);
});

test("measurement rejects invalid shot counts and RNG values", () => {
  assert.throws(() => sampleMeasurements(zeroState(), 0), /shots/);
  assert.throws(() => sampleMeasurements(zeroState(), 1, () => 1), /\[0, 1\)/);
  assert.throws(() => sampleMeasurements(zeroState(), 1, () => -0.1), /\[0, 1\)/);
});

test("invalid states and unknown gates fail clearly", () => {
  assert.throws(
    () => applySingleQubitGate({ alpha: { re: 0, im: 0 }, beta: { re: 0, im: 0 } }, "H"),
    /zero total amplitude/,
  );
  assert.throws(() => applySingleQubitGate(zeroState(), "BOGUS"), /Unsupported/);
});
