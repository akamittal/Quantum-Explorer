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

test("X maps |0> to |1>", () => {
  const state = applySingleQubitGate(zeroState(), "X");
  closeTo(state.alpha.re, 0);
  closeTo(state.alpha.im, 0);
  closeTo(state.beta.re, 1);
  closeTo(state.beta.im, 0);
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

test("phase gates preserve measurement probabilities", () => {
  const state = runSingleQubitCircuit(zeroState(), ["H", "S", "T"]);
  const probabilities = getStateProbabilities(state);
  closeTo(probabilities.zero, 0.5);
  closeTo(probabilities.one, 0.5);
});

test("rotation gates require a finite angle and preserve norm", () => {
  assert.throws(() => getSingleQubitGateMatrix({ name: "RX" }), /theta/);
  const state = runSingleQubitCircuit(zeroState(), [
    { name: "RY", theta: Math.PI / 3 },
  ]);
  const probabilities = getStateProbabilities(state);
  closeTo(probabilities.zero + probabilities.one, 1);
  closeTo(probabilities.one, 0.25);
});

test("measurement sampling follows probabilities and supports injected RNG", () => {
  const state = runSingleQubitCircuit(zeroState(), ["H"]);
  const values = [0.1, 0.9, 0.2, 0.8, 0.3, 0.7];
  let index = 0;
  const result = sampleMeasurements(state, values.length, () => values[index++]);
  assert.equal(result.shots, 6);
  assert.equal(result.zero, 3);
  assert.equal(result.one, 3);
  closeTo(result.probabilityZero, 0.5);
  closeTo(result.probabilityOne, 0.5);
});

test("measurement rejects invalid shot counts and RNG values", () => {
  assert.throws(() => sampleMeasurements(zeroState(), 0), /shots/);
  assert.throws(() => sampleMeasurements(zeroState(), 1, () => 1), /\[0, 1\)/);
});

test("invalid states and unknown gates fail clearly", () => {
  assert.throws(
    () => applySingleQubitGate({ alpha: { re: 0, im: 0 }, beta: { re: 0, im: 0 } }, "H"),
    /zero total amplitude/,
  );
  assert.throws(() => applySingleQubitGate(zeroState(), "BOGUS"), /Unsupported/);
});
