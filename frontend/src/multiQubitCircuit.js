/**
 * Pure state-vector simulator for small multi-qubit registers.
 *
 * Basis convention: basis labels are displayed as |q(n-1)...q1 q0>.
 * Qubit 0 is the least-significant (rightmost) bit, matching Qiskit's
 * little-endian qubit indexing. Amplitudes are complex { re, im } objects.
 *
 * This educational simulator is intentionally limited to 12 qubits (4096
 * amplitudes). It is not intended to replace optimized quantum simulators.
 */
import { getSingleQubitGateMatrix } from "./quantumCircuit.js";

const MAX_QUBITS = 12;
const zero = () => ({ re: 0, im: 0 });
const one = () => ({ re: 1, im: 0 });
const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const multiply = (a, b) => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const magnitudeSquared = (a) => a.re * a.re + a.im * a.im;

function validateQubitCount(numQubits) {
  if (!Number.isSafeInteger(numQubits) || numQubits < 1 || numQubits > MAX_QUBITS) {
    throw new RangeError(`numQubits must be an integer from 1 to ${MAX_QUBITS}.`);
  }
}

function validateState(state) {
  if (!state || !Array.isArray(state.amplitudes)) {
    throw new TypeError("A state with an amplitudes array is required.");
  }
  validateQubitCount(state.numQubits);
  if (state.amplitudes.length !== 2 ** state.numQubits) {
    throw new RangeError("Amplitude count must equal 2 ** numQubits.");
  }
  let norm = 0;
  for (let index = 0; index < state.amplitudes.length; index += 1) {
    const amplitude = state.amplitudes[index];
    if (!amplitude || !Number.isFinite(amplitude.re) || !Number.isFinite(amplitude.im)) {
      throw new TypeError(`amplitudes[${index}] must have finite re and im components.`);
    }
    norm += magnitudeSquared(amplitude);
  }
  if (!(norm > 0) || !Number.isFinite(norm)) {
    throw new RangeError("A quantum state must have finite, non-zero total amplitude.");
  }
}

function validateQubitIndex(state, qubitIndex) {
  if (!Number.isSafeInteger(qubitIndex) || qubitIndex < 0 || qubitIndex >= state.numQubits) {
    throw new RangeError(`qubitIndex must be from 0 to ${state.numQubits - 1}.`);
  }
}

function cloneState(state) {
  return {
    numQubits: state.numQubits,
    amplitudes: state.amplitudes.map(({ re, im }) => ({ re, im })),
  };
}

/** Create |00...0> for a register of the requested size. */
export function createZeroRegister(numQubits) {
  validateQubitCount(numQubits);
  const amplitudes = Array.from({ length: 2 ** numQubits }, zero);
  amplitudes[0] = one();
  return { numQubits, amplitudes };
}

/**
 * Create a computational-basis state from a bit string such as "101".
 * The string is written in display order |q(n-1)...q0>; q0 is rightmost.
 */
export function createBasisRegister(numQubits, bitString) {
  validateQubitCount(numQubits);
  if (typeof bitString !== "string" || !new RegExp(`^[01]{${numQubits}}$`).test(bitString)) {
    throw new TypeError(`bitString must contain exactly ${numQubits} binary digits.`);
  }
  const basisIndex = Number.parseInt(bitString, 2);
  const state = createZeroRegister(numQubits);
  state.amplitudes[0] = zero();
  state.amplitudes[basisIndex] = one();
  return state;
}

/** Apply any supported 2x2 single-qubit gate to one register wire. */
export function applyGateToRegister(state, qubitIndex, operation) {
  validateState(state);
  validateQubitIndex(state, qubitIndex);
  const matrix = getSingleQubitGateMatrix(operation);
  const result = cloneState(state);
  const mask = 1 << qubitIndex;

  for (let base = 0; base < state.amplitudes.length; base += 1) {
    if ((base & mask) !== 0) continue;
    const zeroInput = state.amplitudes[base];
    const oneInput = state.amplitudes[base | mask];
    result.amplitudes[base] = add(
      multiply(matrix[0][0], zeroInput),
      multiply(matrix[0][1], oneInput),
    );
    result.amplitudes[base | mask] = add(
      multiply(matrix[1][0], zeroInput),
      multiply(matrix[1][1], oneInput),
    );
  }
  return result;
}

/** Controlled-NOT: flip target only when control is |1>. */
export function applyCNOT(state, controlQubit, targetQubit) {
  validateState(state);
  validateQubitIndex(state, controlQubit);
  validateQubitIndex(state, targetQubit);
  if (controlQubit === targetQubit) {
    throw new RangeError("CNOT control and target must be different qubits.");
  }
  const result = cloneState(state);
  const controlMask = 1 << controlQubit;
  const targetMask = 1 << targetQubit;
  for (let index = 0; index < state.amplitudes.length; index += 1) {
    if ((index & controlMask) !== 0 && (index & targetMask) === 0) {
      const paired = index | targetMask;
      [result.amplitudes[index], result.amplitudes[paired]] = [
        result.amplitudes[paired],
        result.amplitudes[index],
      ];
    }
  }
  return result;
}

/** Controlled-Z: multiply amplitudes by -1 when both selected qubits are |1>. */
export function applyCZ(state, firstQubit, secondQubit) {
  validateState(state);
  validateQubitIndex(state, firstQubit);
  validateQubitIndex(state, secondQubit);
  if (firstQubit === secondQubit) {
    throw new RangeError("CZ must act on two different qubits.");
  }
  const result = cloneState(state);
  const firstMask = 1 << firstQubit;
  const secondMask = 1 << secondQubit;
  for (let index = 0; index < result.amplitudes.length; index += 1) {
    if ((index & firstMask) !== 0 && (index & secondMask) !== 0) {
      result.amplitudes[index] = {
        re: -result.amplitudes[index].re,
        im: -result.amplitudes[index].im,
      };
    }
  }
  return result;
}

/** Swap the quantum states carried by two register wires. */
export function applySWAP(state, firstQubit, secondQubit) {
  validateState(state);
  validateQubitIndex(state, firstQubit);
  validateQubitIndex(state, secondQubit);
  if (firstQubit === secondQubit) {
    throw new RangeError("SWAP must act on two different qubits.");
  }
  const result = cloneState(state);
  const firstMask = 1 << firstQubit;
  const secondMask = 1 << secondQubit;
  for (let index = 0; index < state.amplitudes.length; index += 1) {
    const firstIsOne = (index & firstMask) !== 0;
    const secondIsOne = (index & secondMask) !== 0;
    if (!firstIsOne && secondIsOne) {
      const paired = index ^ firstMask ^ secondMask;
      [result.amplitudes[index], result.amplitudes[paired]] = [
        result.amplitudes[paired],
        result.amplitudes[index],
      ];
    }
  }
  return result;
}

/** Execute an ordered circuit. Operations: { name:"H", target:0 }, { name:"CNOT", control:0, target:1 }, { name:"CZ", first:0, second:1 }, { name:"SWAP", first:0, second:1 }. */
export function runMultiQubitCircuit(initialState, operations) {
  validateState(initialState);
  if (!Array.isArray(operations)) {
    throw new TypeError("Circuit operations must be an array.");
  }
  return operations.reduce((state, operation) => {
    if (!operation || typeof operation.name !== "string") {
      throw new TypeError("Each circuit operation must have a name.");
    }
    switch (operation.name.toUpperCase()) {
      case "CNOT":
      case "CX":
        return applyCNOT(state, operation.control, operation.target);
      case "CZ":
        return applyCZ(state, operation.first, operation.second);
      case "SWAP":
        return applySWAP(state, operation.first, operation.second);
      default:
        return applyGateToRegister(state, operation.target, operation);
    }
  }, cloneState(initialState));
}

/** Return probabilities for every computational-basis outcome in display order. */
export function getRegisterProbabilities(state) {
  validateState(state);
  const weights = state.amplitudes.map(magnitudeSquared);
  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((weight) => weight / total);
}

/** Return marginal P(0), P(1) for one selected qubit. */
export function getQubitProbabilities(state, qubitIndex) {
  validateState(state);
  validateQubitIndex(state, qubitIndex);
  const mask = 1 << qubitIndex;
  const probabilities = { zero: 0, one: 0 };
  const basisProbabilities = getRegisterProbabilities(state);
  basisProbabilities.forEach((probability, index) => {
    if ((index & mask) === 0) probabilities.zero += probability;
    else probabilities.one += probability;
  });
  return probabilities;
}

/** Sample complete register measurements, e.g. "00", "11". */
export function sampleRegisterMeasurements(state, shots = 1024, rng = Math.random) {
  if (!Number.isSafeInteger(shots) || shots < 1) {
    throw new RangeError("shots must be a positive safe integer.");
  }
  if (typeof rng !== "function") throw new TypeError("rng must be a function.");
  const probabilities = getRegisterProbabilities(state);
  const counts = Object.fromEntries(probabilities.map((_, index) => [
    index.toString(2).padStart(state.numQubits, "0"),
    0,
  ]));
  for (let shot = 0; shot < shots; shot += 1) {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("rng must return values in [0, 1).");
    }
    let cumulative = 0;
    let selected = probabilities.length - 1;
    for (let index = 0; index < probabilities.length; index += 1) {
      cumulative += probabilities[index];
      if (value < cumulative) {
        selected = index;
        break;
      }
    }
    const key = selected.toString(2).padStart(state.numQubits, "0");
    counts[key] += 1;
  }
  return { shots, counts, probabilities };
}
