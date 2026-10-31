import test from "node:test";
import assert from "node:assert/strict";
import {
  BERNSTEIN_VAZIRANI_INPUT_COUNT,
  buildBernsteinVaziraniOracleOperations,
  buildBernsteinVaziraniOperations,
  runBernsteinVazirani,
} from "./bernsteinVazirani.js";
import { generateQiskitPythonCode } from "./qiskitCode.js";

const closeTo = (actual, expected, epsilon = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be close to ${expected}`);

test("recovers every possible three-bit secret with certainty in one oracle query", () => {
  for (let value = 0; value < BERNSTEIN_VAZIRANI_INPUT_COUNT; value += 1) {
    const secret = value.toString(2).padStart(3, "0").split("").map(Number);
    const result = runBernsteinVazirani(secret);
    assert.deepEqual(result.recoveredSecret, secret);
    assert.equal(result.oracleQueries, 1);
    closeTo(result.successProbability, 1);
    closeTo(result.outputProbabilities.reduce((sum, probability) => sum + probability, 0), 1);
    result.outputProbabilities.forEach((probability, index) => closeTo(probability, index === value ? 1 : 0));
  }
});

test("the oracle contains one CNOT for each set bit and none for zero bits", () => {
  assert.deepEqual(buildBernsteinVaziraniOracleOperations([1, 0, 1]), [
    { name: "CX", control: 0, target: 3 },
    { name: "CX", control: 2, target: 3 },
  ]);
  assert.deepEqual(buildBernsteinVaziraniOracleOperations([0, 0, 0]), []);
  const circuit = buildBernsteinVaziraniOperations([1, 1, 0]);
  assert.equal(circuit.operations.length, circuit.preparation.length + circuit.oracle.length + circuit.readout.length);
});

test("generated Qiskit program uses the same CNOT oracle", () => {
  const result = runBernsteinVazirani([1, 0, 1]);
  const code = generateQiskitPythonCode({ numQubits: 4, operations: result.operations, shots: 1000 });
  assert.match(code, /qc\.cx\(0, 3\)/);
  assert.match(code, /qc\.cx\(2, 3\)/);
  assert.doesNotMatch(code, /qc\.mcx/);
});

test("invalid hidden strings are rejected", () => {
  assert.throws(() => runBernsteinVazirani([0, 1]), /exactly three/);
  assert.throws(() => runBernsteinVazirani([0, 1, 2]), /binary bits/);
});
