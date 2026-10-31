import { qftState, stateDiagnostics, buildQftOperations } from "./quantumFourierTransform.js";

const TAU = 2 * Math.PI;

function validateCountingQubits(countingQubits) {
  if (!Number.isInteger(countingQubits) || countingQubits < 2 || countingQubits > 7) {
    throw new RangeError("QPE supports 2 to 7 counting qubits in this interactive lesson.");
  }
}

function validatePhase(phase) {
  if (!Number.isFinite(phase) || phase < 0 || phase >= 1) {
    throw new RangeError("The eigenphase must be in the interval [0, 1).");
  }
}

/** Counting register after Hadamards and controlled powers of U. */
export function createQpePhaseState(countingQubits, phase) {
  validateCountingQubits(countingQubits);
  validatePhase(phase);
  const dimension = 2 ** countingQubits;
  const magnitude = 1 / Math.sqrt(dimension);
  return Array.from({ length: dimension }, (_, integer) => {
    const angle = TAU * phase * integer;
    return { re: magnitude * Math.cos(angle), im: magnitude * Math.sin(angle) };
  });
}

/** Apply inverse QFT to the phase-kickback state. */
export function qpeState(countingQubits, phase) {
  return qftState(createQpePhaseState(countingQubits, phase), true);
}

/**
 * q0 is the least-significant counting bit; q[countingQubits] is the target.
 * The target is |1>, an eigenstate of U = P(2π phase).
 */
export function buildQpeOperations(countingQubits, phase) {
  validateCountingQubits(countingQubits);
  validatePhase(phase);
  const target = countingQubits;
  const operations = [{ name: "X", qubit: target }];
  for (let qubit = 0; qubit < countingQubits; qubit += 1) {
    operations.push({ name: "H", qubit });
  }
  for (let qubit = 0; qubit < countingQubits; qubit += 1) {
    operations.push({
      name: "CP",
      control: qubit,
      target,
      theta: TAU * phase * (2 ** qubit),
    });
  }
  operations.push(...buildQftOperations(countingQubits, true));
  return operations;
}

export function qpeDiagnostics(countingQubits, phase) {
  return stateDiagnostics(qpeState(countingQubits, phase));
}

export function estimateEigenphase(countingQubits, phase) {
  const diagnostics = qpeDiagnostics(countingQubits, phase);
  const mostLikely = diagnostics.reduce((best, item) => item.probability > best.probability ? item : best);
  const estimate = mostLikely.index / (2 ** countingQubits);
  const rawError = Math.abs(estimate - phase);
  return {
    estimate,
    index: mostLikely.index,
    bitstring: mostLikely.bitstring,
    probability: mostLikely.probability,
    circularError: Math.min(rawError, 1 - rawError),
    diagnostics,
  };
}
