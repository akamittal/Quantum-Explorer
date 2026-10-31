import test from "node:test";
import assert from "node:assert/strict";
import { buildDeutschOperations, DEUTSCH_ORACLES, runDeutschAlgorithm } from "./deutschAlgorithm.js";

  test("defines all four valid one-bit oracle functions", () => {
    assert.deepEqual(Object.keys(DEUTSCH_ORACLES), ["constant0", "constant1", "identity", "not"]);
  });
  for (const oracle of ["constant0", "constant1"]) test(`${oracle} is classified as constant`, () => {
    const result = runDeutschAlgorithm(oracle);
    assert.equal(result.classification, "constant");
    assert.ok(Math.abs(result.inputProbabilities.zero - 1) < 1e-10);
    assert.ok(Math.abs(result.inputProbabilities.one) < 1e-10);
  });
  for (const oracle of ["identity", "not"]) test(`${oracle} is classified as balanced`, () => {
    const result = runDeutschAlgorithm(oracle);
    assert.equal(result.classification, "balanced");
    assert.ok(Math.abs(result.inputProbabilities.zero) < 1e-10);
    assert.ok(Math.abs(result.inputProbabilities.one - 1) < 1e-10);
  });
  test("builds the expected oracle operations for each function", () => {
    assert.equal(buildDeutschOperations("constant0").filter((op) => op.name === "CNOT").length, 0);
    assert.equal(buildDeutschOperations("constant1").filter((op) => op.name === "X").length, 2);
    assert.equal(buildDeutschOperations("identity").filter((op) => op.name === "CNOT").length, 1);
    assert.equal(buildDeutschOperations("not").filter((op) => op.name === "CNOT").length, 1);
  });
  test("rejects unknown oracle names", () => {
    assert.throws(() => buildDeutschOperations("unknown"), RangeError);
  });
