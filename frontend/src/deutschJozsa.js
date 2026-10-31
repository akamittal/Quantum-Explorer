import { createZeroRegister, runMultiQubitCircuit } from "./multiQubitCircuit.js";

export const DEUTSCH_JOZSA_INPUT_QUBITS = 3;
export const DEUTSCH_JOZSA_TARGET_QUBIT = DEUTSCH_JOZSA_INPUT_QUBITS;
export const DEUTSCH_JOZSA_INPUT_COUNT = 2 ** DEUTSCH_JOZSA_INPUT_QUBITS;

export const DEUTSCH_JOZSA_ORACLES = {
  constant0: {
    label: "Constant zero",
    description: "The oracle returns 0 for all eight inputs.",
    truthTable: Array(8).fill(0),
  },
  constant1: {
    label: "Constant one",
    description: "The oracle returns 1 for all eight inputs.",
    truthTable: Array(8).fill(1),
  },
  firstBit: {
    label: "First displayed bit",
    description: "The output equals the most-significant input bit. Exactly four inputs return 1.",
    truthTable: Array.from({ length: 8 }, (_, x) => (x >> 2) & 1),
  },
  lastBit: {
    label: "Last displayed bit",
    description: "The output equals q0, the rightmost input bit. Exactly four inputs return 1.",
    truthTable: Array.from({ length: 8 }, (_, x) => x & 1),
  },
  parity: {
    label: "Three-bit parity",
    description: "The output is 1 when the input contains an odd number of 1 bits.",
    truthTable: Array.from({ length: 8 }, (_, x) => ((x & 1) ^ ((x >> 1) & 1) ^ ((x >> 2) & 1))),
  },
};

function validateTruthTable(truthTable) {
  if (!Array.isArray(truthTable) || truthTable.length !== DEUTSCH_JOZSA_INPUT_COUNT ||
      truthTable.some((value) => value !== 0 && value !== 1)) {
    throw new TypeError("The Deutsch-Jozsa oracle must contain exactly eight binary outputs.");
  }
}

function xOperation(target) {
  return { name: "X", target };
}

/**
 * Compile an arbitrary three-input Boolean truth table into a reversible
 * oracle. Each marked input pattern controls one MCX on the target.
 * Zero-valued input bits are implemented with X gates around the MCX.
 */
export function buildDeutschJozsaOracleOperations(truthTable) {
  validateTruthTable(truthTable);
  const controls = [0, 1, 2];
  const operations = [];
  truthTable.forEach((output, input) => {
    if (output === 0) return;
    const openControls = controls.filter((qubit) => ((input >> qubit) & 1) === 0);
    openControls.forEach((qubit) => operations.push(xOperation(qubit)));
    operations.push({ name: "MCX", controls, target: DEUTSCH_JOZSA_TARGET_QUBIT });
    [...openControls].reverse().forEach((qubit) => operations.push(xOperation(qubit)));
  });
  return operations;
}

export function buildDeutschJozsaOperations(truthTable) {
  validateTruthTable(truthTable);
  const preparation = [
    xOperation(DEUTSCH_JOZSA_TARGET_QUBIT),
    ...Array.from({ length: DEUTSCH_JOZSA_INPUT_QUBITS + 1 }, (_, target) => ({ name: "H", target })),
  ];
  const oracle = buildDeutschJozsaOracleOperations(truthTable);
  const readout = Array.from({ length: DEUTSCH_JOZSA_INPUT_QUBITS }, (_, target) => ({ name: "H", target }));
  return { preparation, oracle, readout, operations: [...preparation, ...oracle, ...readout] };
}

function registerProbabilities(state) {
  return state.amplitudes.map((amplitude) => amplitude.re ** 2 + amplitude.im ** 2);
}

function inputDistribution(state) {
  const probabilities = registerProbabilities(state);
  return Array.from({ length: DEUTSCH_JOZSA_INPUT_COUNT }, (_, input) =>
    probabilities[input] + probabilities[input + (1 << DEUTSCH_JOZSA_TARGET_QUBIT)]);
}

export function runDeutschJozsa(truthTable) {
  validateTruthTable(truthTable);
  const circuit = buildDeutschJozsaOperations(truthTable);
  const initial = createZeroRegister(DEUTSCH_JOZSA_INPUT_QUBITS + 1);
  const prepared = runMultiQubitCircuit(initial, circuit.preparation);
  const afterOracle = runMultiQubitCircuit(prepared, circuit.oracle);
  const final = runMultiQubitCircuit(afterOracle, circuit.readout);
  const outputs = inputDistribution(final);
  const ones = truthTable.reduce((sum, value) => sum + value, 0);
  const classification = ones === 0 || ones === DEUTSCH_JOZSA_INPUT_COUNT
    ? "constant"
    : ones === DEUTSCH_JOZSA_INPUT_COUNT / 2 ? "balanced" : "promise-violated";
  return {
    ...circuit,
    states: { initial, prepared, afterOracle, final },
    outputProbabilities: outputs,
    zeroInputProbability: outputs[0],
    numberOfOnes: ones,
    classification,
    oracleQueries: 1,
    truthTable: [...truthTable],
  };
}
