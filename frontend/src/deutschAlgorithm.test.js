import { describe, expect, it } from "vitest";
import { buildDeutschOperations, DEUTSCH_ORACLES, runDeutschAlgorithm } from "./deutschAlgorithm.js";

describe("Deutsch algorithm", () => {
  it("defines all four valid one-bit oracle functions", () => {
    expect(Object.keys(DEUTSCH_ORACLES)).toEqual(["constant0", "constant1", "identity", "not"]);
  });
  it.each(["constant0", "constant1"])("%s is classified as constant", (oracle) => {
    const result = runDeutschAlgorithm(oracle);
    expect(result.classification).toBe("constant");
    expect(result.inputProbabilities.zero).toBeCloseTo(1);
    expect(result.inputProbabilities.one).toBeCloseTo(0);
  });
  it.each(["identity", "not"])("%s is classified as balanced", (oracle) => {
    const result = runDeutschAlgorithm(oracle);
    expect(result.classification).toBe("balanced");
    expect(result.inputProbabilities.zero).toBeCloseTo(0);
    expect(result.inputProbabilities.one).toBeCloseTo(1);
  });
  it("builds the expected oracle operations for each function", () => {
    expect(buildDeutschOperations("constant0").filter((op) => op.name === "CNOT")).toHaveLength(0);
    expect(buildDeutschOperations("constant1").filter((op) => op.name === "X")).toHaveLength(2);
    expect(buildDeutschOperations("identity").filter((op) => op.name === "CNOT")).toHaveLength(1);
    expect(buildDeutschOperations("not").filter((op) => op.name === "CNOT")).toHaveLength(1);
  });
  it("rejects unknown oracle names", () => {
    expect(() => buildDeutschOperations("unknown")).toThrow(RangeError);
  });
});
