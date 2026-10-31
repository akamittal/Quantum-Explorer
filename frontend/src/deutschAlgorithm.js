import { createZeroRegister, runMultiQubitCircuit, getQubitProbabilities } from "./multiQubitCircuit.js";

export const DEUTSCH_ORACLES = {
  constant0: { label: "Constant 0", kind: "constant", value: 0, description: "f(0)=0 and f(1)=0. The oracle leaves the target unchanged." },
  constant1: { label: "Constant 1", kind: "constant", value: 1, description: "f(0)=1 and f(1)=1. The oracle flips the target for either input." },
  identity: { label: "Balanced: f(x)=x", kind: "balanced", description: "f(0)=0 and f(1)=1. The oracle flips the target only when x=1." },
  not: { label: "Balanced: f(x)=1−x", kind: "balanced", description: "f(0)=1 and f(1)=0. The oracle flips the target only when x=0." },
};

export function buildDeutschOperations(oracle = "identity") {
  if (!Object.prototype.hasOwnProperty.call(DEUTSCH_ORACLES, oracle)) {
    throw new RangeError("Choose one of the four Deutsch oracle functions.");
  }
  const operations = [
    { name: "X", target: 1 },
    { name: "H", target: 0 },
    { name: "H", target: 1 },
  ];
  if (oracle === "constant1" || oracle === "not") operations.push({ name: "X", target: 1 });
  if (oracle === "identity" || oracle === "not") {
    operations.push({ name: "CNOT", control: 0, target: 1 });
  }
  operations.push({ name: "H", target: 0 });
  return operations;
}

export function runDeutschAlgorithm(oracle = "identity") {
  const operations = buildDeutschOperations(oracle);
  const state = runMultiQubitCircuit(createZeroRegister(2), operations);
  const inputProbabilities = getQubitProbabilities(state, 0);
  const isConstant = inputProbabilities.zero > 1 - 1e-9;
  return {
    state,
    operations,
    inputProbabilities,
    classification: isConstant ? "constant" : "balanced",
    measuredInput: isConstant ? 0 : 1,
  };
}
