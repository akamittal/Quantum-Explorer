import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCNOT,
  applyMCX,
  applyCZ,
  applyGateToRegister,
  applySWAP,
  createBasisRegister,
  createZeroRegister,
  getQubitProbabilities,
  getRegisterProbabilities,
  runMultiQubitCircuit,
  sampleRegisterMeasurements,
} from "./multiQubitCircuit.js";

const closeTo = (actual, expected, epsilon = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be close to ${expected}`);
};
const probabilityMap = (state) => Object.fromEntries(
  getRegisterProbabilities(state).map((probability, index) => [
    index.toString(2).padStart(state.numQubits, "0"),
    probability,
  ]),
);

test("basis register uses display-order bit strings with q0 on the right", () => {
  const state = createBasisRegister(3, "101");
  closeTo(state.amplitudes[5].re, 1);
  closeTo(state.amplitudes[5].im, 0);
  assert.equal(state.amplitudes[0].re, 0);
});

test("H on either wire changes only that wire", () => {
  const q0 = applyGateToRegister(createZeroRegister(2), 0, "H");
  const q1 = applyGateToRegister(createZeroRegister(2), 1, "H");
  const p0 = probabilityMap(q0);
  const p1 = probabilityMap(q1);
  closeTo(p0["00"], 0.5);
  closeTo(p0["01"], 0.5);
  closeTo(p0["10"], 0);
  closeTo(p1["00"], 0.5);
  closeTo(p1["10"], 0.5);
  closeTo(p1["01"], 0);
});

test("H plus CNOT creates the Bell state (|00> + |11>) / sqrt(2)", () => {
  const state = runMultiQubitCircuit(createZeroRegister(2), [
    { name: "H", target: 0 },
    { name: "CNOT", control: 0, target: 1 },
  ]);
  const probabilities = probabilityMap(state);
  closeTo(probabilities["00"], 0.5);
  closeTo(probabilities["11"], 0.5);
  closeTo(probabilities["01"], 0);
  closeTo(probabilities["10"], 0);
  closeTo(getQubitProbabilities(state, 0).one, 0.5);
  closeTo(getQubitProbabilities(state, 1).one, 0.5);
});

test("independent Hadamards create four equally likely outcomes, not a Bell pair", () => {
  const state = runMultiQubitCircuit(createZeroRegister(2), [
    { name: "H", target: 0 },
    { name: "H", target: 1 },
  ]);
  getRegisterProbabilities(state).forEach((probability) => closeTo(probability, 0.25));
});

test("MCX flips the target only when all controls are one", () => {
  const input = createBasisRegister(4, "0111");
  const state = applyMCX(input, [0, 1, 2], 3);
  closeTo(state.amplitudes[15].re, 1);
  closeTo(state.amplitudes[7].re, 0);
  const unchanged = applyMCX(createBasisRegister(4, "0101"), [0, 1, 2], 3);
  closeTo(unchanged.amplitudes[5].re, 1);
});

test("MCX validates controls and target", () => {
  const state = createZeroRegister(3);
  assert.throws(() => applyMCX(state, [], 2), /at least one control/);
  assert.throws(() => applyMCX(state, [0, 0], 2), /unique/);
  assert.throws(() => applyMCX(state, [0, 2], 2), /cannot also be a control/);
  assert.throws(() => applyMCX(state, [0, 3], 2), /qubitIndex/);
});

test("CZ adds a phase only to the |11> amplitude", () => {
  const input = createBasisRegister(2, "11");
  const state = applyCZ(input, 0, 1);
  closeTo(state.amplitudes[3].re, -1);
  closeTo(state.amplitudes[3].im, 0);
  closeTo(getRegisterProbabilities(state)[3], 1);
});

test("SWAP exchanges the selected wire values", () => {
  const input = createBasisRegister(2, "01");
  const state = applySWAP(input, 0, 1);
  closeTo(state.amplitudes[2].re, 1);
  closeTo(state.amplitudes[1].re, 0);
});

test("three-qubit circuit creates a GHZ state", () => {
  const state = runMultiQubitCircuit(createZeroRegister(3), [
    { name: "H", target: 0 },
    { name: "CNOT", control: 0, target: 1 },
    { name: "CNOT", control: 1, target: 2 },
  ]);
  const probabilities = probabilityMap(state);
  closeTo(probabilities["000"], 0.5);
  closeTo(probabilities["111"], 0.5);
  closeTo(probabilities["001"], 0);
  closeTo(probabilities["110"], 0);
});

test("register measurement sampling returns reproducible bit-string counts", () => {
  const state = runMultiQubitCircuit(createZeroRegister(2), [
    { name: "H", target: 0 },
    { name: "CNOT", control: 0, target: 1 },
  ]);
  const values = [0.1, 0.9, 0.2, 0.8];
  let index = 0;
  const result = sampleRegisterMeasurements(state, values.length, () => values[index++]);
  assert.deepEqual(result.counts, { "00": 2, "01": 0, "10": 0, "11": 2 });
});

test("invalid qubit counts, wires, gates and operation lists fail clearly", () => {
  assert.throws(() => createZeroRegister(0), /numQubits/);
  assert.throws(() => createZeroRegister(13), /numQubits/);
  assert.throws(() => createBasisRegister(2, "2x"), /bitString/);
  assert.throws(() => applyGateToRegister(createZeroRegister(2), 2, "H"), /qubitIndex/);
  assert.throws(() => applyCNOT(createZeroRegister(2), 0, 0), /different/);
  assert.throws(() => applyCZ(createZeroRegister(2), 0, 0), /different/);
  assert.throws(() => applySWAP(createZeroRegister(2), 1, 1), /different/);
  assert.throws(() => runMultiQubitCircuit(createZeroRegister(2), "H"), /array/);
  assert.throws(() => runMultiQubitCircuit(createZeroRegister(2), [{ name: "NOPE", target: 0 }]), /Unsupported/);
});

test("T changes relative phase without changing immediate computational probabilities", () => {
  const state = runMultiQubitCircuit(createZeroRegister(2), [
    { name: "H", target: 0 },
    { name: "T", target: 0 },
  ]);
  const probabilities = getRegisterProbabilities(state);
  closeTo(probabilities[0], 0.5);
  closeTo(probabilities[1], 0.5);
  closeTo(state.amplitudes[1].re, Math.SQRT1_2 / Math.SQRT2);
  closeTo(state.amplitudes[1].im, Math.SQRT1_2 / Math.SQRT2);
});

test("a later Hadamard converts T-gate relative phase into measurable interference", () => {
  const state = runMultiQubitCircuit(createZeroRegister(2), [
    { name: "H", target: 0 },
    { name: "T", target: 0 },
    { name: "H", target: 0 },
  ]);
  const probabilities = getRegisterProbabilities(state);
  closeTo(probabilities[0], (1 + Math.SQRT1_2) / 2);
  closeTo(probabilities[1], (1 - Math.SQRT1_2) / 2);
  closeTo(probabilities[2], 0);
  closeTo(probabilities[3], 0);
});
