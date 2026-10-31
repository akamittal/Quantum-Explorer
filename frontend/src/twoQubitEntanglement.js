/**
 * Exact two-qubit pure-state entanglement diagnostics.
 *
 * Basis order is |q1 q0> = |00>, |01>, |10>, |11>; q0 is the
 * least-significant/rightmost bit, matching multiQubitCircuit.js and Qiskit.
 * The formulas below are for normalized pure bipartite two-qubit states.
 */

const magnitudeSquared = ({ re, im }) => re * re + im * im;
const multiply = (a, b) => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const conjugate = ({ re, im }) => ({ re, im: -im });
const subtract = (a, b) => ({ re: a.re - b.re, im: a.im - b.im });
const add = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const abs = ({ re, im }) => Math.hypot(re, im);
const clamp01 = (value) => Math.max(0, Math.min(1, value));

function validateTwoQubitState(state) {
  if (!state || state.numQubits !== 2 || !Array.isArray(state.amplitudes) || state.amplitudes.length !== 4) {
    throw new TypeError("A two-qubit state with four complex amplitudes is required.");
  }
  const norm = state.amplitudes.reduce((sum, amplitude) => {
    if (!amplitude || !Number.isFinite(amplitude.re) || !Number.isFinite(amplitude.im)) {
      throw new TypeError("Every amplitude must have finite real and imaginary components.");
    }
    return sum + magnitudeSquared(amplitude);
  }, 0);
  if (!Number.isFinite(norm) || Math.abs(norm - 1) > 1e-8) {
    throw new RangeError("The two-qubit state must be normalized before entanglement analysis.");
  }
}

function reducedDensityMatrix(diagonalZero, diagonalOne, offDiagonal) {
  const determinant = Math.max(0, diagonalZero * diagonalOne - magnitudeSquared(offDiagonal));
  const discriminant = Math.sqrt(Math.max(0, 1 - 4 * determinant));
  const eigenvalues = [clamp01((1 + discriminant) / 2), clamp01((1 - discriminant) / 2)];
  const entropy = eigenvalues.reduce((sum, value) => value > 1e-15 ? sum - value * Math.log2(value) : sum, 0);
  const purity = diagonalZero ** 2 + diagonalOne ** 2 + 2 * magnitudeSquared(offDiagonal);
  return {
    matrix: [
      [{ re: diagonalZero, im: 0 }, offDiagonal],
      [conjugate(offDiagonal), { re: diagonalOne, im: 0 }],
    ],
    eigenvalues,
    determinant,
    entropy,
    purity,
  };
}

/**
 * Compute both one-qubit reduced density matrices, Schmidt spectrum,
 * von Neumann entropy, purity and pure-state concurrence.
 */
export function analyzeTwoQubitEntanglement(state) {
  validateTwoQubitState(state);
  const [a, b, c, d] = state.amplitudes;

  // Trace out q1 to retain q0. Group amplitudes by q0's basis value.
  const q0 = reducedDensityMatrix(
    magnitudeSquared(a) + magnitudeSquared(c),
    magnitudeSquared(b) + magnitudeSquared(d),
    add(multiply(a, conjugate(b)), multiply(c, conjugate(d))),
  );

  // Trace out q0 to retain q1. Group amplitudes by q1's basis value.
  const q1 = reducedDensityMatrix(
    magnitudeSquared(a) + magnitudeSquared(b),
    magnitudeSquared(c) + magnitudeSquared(d),
    add(multiply(a, conjugate(c)), multiply(b, conjugate(d))),
  );

  const determinantAmplitude = subtract(multiply(a, d), multiply(b, c));
  const concurrence = clamp01(2 * abs(determinantAmplitude));
  const entropy = (q0.entropy + q1.entropy) / 2;
  const tolerance = 1e-8;

  return {
    q0,
    q1,
    entropy,
    purity: (q0.purity + q1.purity) / 2,
    schmidtProbabilities: q0.eigenvalues,
    schmidtCoefficients: q0.eigenvalues.map(Math.sqrt),
    concurrence,
    isEntangled: concurrence > tolerance,
    isMaximallyEntangled: Math.abs(entropy - 1) < tolerance,
    isProductState: concurrence <= tolerance,
  };
}

/** Bell-state preparation circuits, with q0 as the control of the CNOT. */
export const BELL_STATE_PRESETS = Object.freeze({
  "Phi+": Object.freeze([
    Object.freeze({ name: "H", target: 0 }),
    Object.freeze({ name: "CNOT", control: 0, target: 1 }),
  ]),
  "Phi-": Object.freeze([
    Object.freeze({ name: "H", target: 0 }),
    Object.freeze({ name: "CNOT", control: 0, target: 1 }),
    Object.freeze({ name: "Z", target: 1 }),
  ]),
  "Psi+": Object.freeze([
    Object.freeze({ name: "H", target: 0 }),
    Object.freeze({ name: "CNOT", control: 0, target: 1 }),
    Object.freeze({ name: "X", target: 1 }),
  ]),
  "Psi-": Object.freeze([
    Object.freeze({ name: "H", target: 0 }),
    Object.freeze({ name: "CNOT", control: 0, target: 1 }),
    Object.freeze({ name: "X", target: 1 }),
    Object.freeze({ name: "Z", target: 1 }),
  ]),
});

export const BELL_STATE_LABELS = Object.freeze({
  "Phi+": "|\\Phi^+\\rangle = (|00\\rangle + |11\\rangle)/\\sqrt{2}",
  "Phi-": "|\\Phi^-\\rangle = (|00\\rangle - |11\\rangle)/\\sqrt{2}",
  "Psi+": "|\\Psi^+\\rangle = (|01\\rangle + |10\\rangle)/\\sqrt{2}",
  "Psi-": "|\\Psi^-\\rangle = (|01\\rangle - |10\\rangle)/\\sqrt{2}",
});
