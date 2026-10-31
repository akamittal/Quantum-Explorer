import { createZeroRegister, runMultiQubitCircuit } from "./multiQubitCircuit.js";

export const BERNSTEIN_VAZIRANI_INPUT_QUBITS = 3;
export const BERNSTEIN_VAZIRANI_TARGET_QUBIT = BERNSTEIN_VAZIRANI_INPUT_QUBITS;
export const BERNSTEIN_VAZIRANI_INPUT_COUNT = 2 ** BERNSTEIN_VAZIRANI_INPUT_QUBITS;

function validateSecret(secret) {
  if (!Array.isArray(secret) || secret.length !== BERNSTEIN_VAZIRANI_INPUT_QUBITS ||
      secret.some((bit) => bit !== 0 && bit !== 1)) {
    throw new TypeError("The hidden string must contain exactly three binary bits.");
  }
}

export function buildBernsteinVaziraniOracleOperations(secret) {
  validateSecret(secret);
  return secret.flatMap((bit, displayedIndex) => bit
    ? [{ name: "CX", control: BERNSTEIN_VAZIRANI_INPUT_QUBITS - 1 - displayedIndex, target: BERNSTEIN_VAZIRANI_TARGET_QUBIT }]
    : []);
}

export function buildBernsteinVaziraniOperations(secret) {
  validateSecret(secret);
  const preparation = [
    { name: "X", target: BERNSTEIN_VAZIRANI_TARGET_QUBIT },
    ...Array.from({ length: BERNSTEIN_VAZIRANI_INPUT_QUBITS + 1 }, (_, target) => ({ name: "H", target })),
  ];
  const oracle = buildBernsteinVaziraniOracleOperations(secret);
  const readout = Array.from({ length: BERNSTEIN_VAZIRANI_INPUT_QUBITS }, (_, target) => ({ name: "H", target }));
  return { preparation, oracle, readout, operations: [...preparation, ...oracle, ...readout] };
}

function probabilities(state) {
  return state.amplitudes.map((amplitude) => amplitude.re ** 2 + amplitude.im ** 2);
}

function inputProbabilities(state) {
  const basis = probabilities(state);
  return Array.from({ length: BERNSTEIN_VAZIRANI_INPUT_COUNT }, (_, index) =>
    basis[index] + basis[index + (1 << BERNSTEIN_VAZIRANI_TARGET_QUBIT)]);
}

const BERNSTEIN_VAZIRY_INPUT_COUNT = BERNSTEIN_VAZIRANI_INPUT_COUNT;

export function runBernsteinVazirani(secret) {
  validateSecret(secret);
  const circuit = buildBernsteinVaziraniOperations(secret);
  const initial = createZeroRegister(BERNSTEIN_VAZIRANI_INPUT_QUBITS + 1);
  const prepared = runMultiQubitCircuit(initial, circuit.preparation);
  const afterOracle = runMultiQubitCircuit(prepared, circuit.oracle);
  const final = runMultiQubitCircuit(afterOracle, circuit.readout);
  const outputProbabilities = inputProbabilities(final);
  const recoveredIndex = outputProbabilities.findIndex((probability) => probability > 1 - 1e-9);
  return {
    ...circuit,
    states: { initial, prepared, afterOracle, final },
    outputProbabilities,
    recoveredSecret: recoveredIndex < 0 ? null : recoveredIndex.toString(2).padStart(BERNSTEIN_VAZIRANI_INPUT_QUBITS, "0").split("").map(Number),
    secret: [...secret],
    oracleQueries: 1,
    successProbability: recoveredIndex < 0 ? 0 : outputProbabilities[recoveredIndex],
  };
}
