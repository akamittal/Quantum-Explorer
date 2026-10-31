import test from "node:test";
import assert from "node:assert/strict";
import {
  DEUTSCH_JOZSA_INPUT_COUNT,
  DEUTSCH_JOZSA_ORACLES,
  buildDeutschJozsaOracleOperations,
  buildDeutschJozsaOperations,
  runDeutschJozsa,
} from "./deutschJozsa.js";

const closeTo = (actual, expected, epsilon = 1e-9) => {
  assert.ok(Math.abs(actual - expected) < epsilon, `expected ${actual} to be close to ${expected}`);
};

test("provides constant and balanced three-input oracle examples", () => {
  assert.equal(DEUTSCH_JOZSA_ORACLES.constant0.truthTable.length, DEUTSCH_JOZSA_INPUT_COUNT);
  assert.equal(DEUTSCH_JOZSA_ORACLES.constant1.truthTable.reduce((a, b) => a + b, 0), 8);
  for (const key of ["firstBit", "lastBit", "parity"]) {
    assert.equal(DEUTSCH_JOZSA_ORACLES[key].truthTable.reduce((a, b) => a + b, 0), 4);
  }
});

test("one query classifies both constant functions with certainty", () => {
  for (const oracle of ["constant0", "constant1"]) {
    const result = runDeutschJozsa(DEUTSCH_JOZSA_ORACLES[oracle].truthTable);
    assert.equal(result.classification, "constant");
    closeTo(result.zeroInputProbability, 1);
    closeTo(result.outputProbabilities.reduce((a, b) => a + b, 0), 1);
    result.outputProbabilities.slice(1).forEach((probability) => closeTo(probability, 0));
    assert.equal(result.oracleQueries, 1);
  }
});

test("one query classifies nontrivial balanced functions with certainty", () => {
  for (const oracle of ["firstBit", "lastBit", "parity"]) {
    const result = runDeutschJozsa(DEUTSCH_JOZSA_ORACLES[oracle].truthTable);
    assert.equal(result.classification, "balanced");
    closeTo(result.zeroInputProbability, 0);
    closeTo(result.outputProbabilities.reduce((a, b) => a + b, 0), 1);
  }
});

test("the parity oracle returns the corresponding hidden bit mask", () => {
  const result = runDeutschJozsa(DEUTSCH_JOZSA_ORACLES.parity.truthTable);
  closeTo(result.outputProbabilities[7], 1);
  result.outputProbabilities.forEach((probability, index) => {
    if (index !== 7) closeTo(probability, 0);
  });
});

test("the full oracle is compiled from open and closed controls", () => {
  const truthTable = [0, 1, 0, 0, 0, 0, 0, 0];
  const operations = buildDeutschJozsaOracleOperations(truthTable);
  assert.equal(operations.filter((operation) => operation.name === "MCX").length, 1);
  assert.deepEqual(operations.filter((operation) => operation.name === "X").map((operation) => operation.target), [1, 2, 2, 1]);
  const circuit = buildDeutschJozsaOperations(truthTable);
  assert.equal(circuit.operations.length, circuit.preparation.length + circuit.oracle.length + circuit.readout.length);
});

test("a truth table outside the constant-or-balanced promise is identified", () => {
  const result = runDeutschJozsa([1, 1, 1, 0, 0, 0, 0, 0]);
  assert.equal(result.classification, "promise-violated");
  assert.ok(result.zeroInputProbability > 0 && result.zeroInputProbability < 1);
});

test("invalid truth tables are rejected", () => {
  assert.throws(() => runDeutschJozsa([0, 1]), /exactly eight/);
  assert.throws(() => runDeutschJozsa([0, 0, 0, 0, 0, 0, 0, 2]), /binary outputs/);
});
