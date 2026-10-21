/**
 * Small, UI-independent helpers for single-qubit calculations.
 * Amplitudes are represented as { re, im } objects.
 */

/** Return Born-rule measurement probabilities (not percentages). */
export function getMeasurementProbabilities(alpha, beta) {
  const probability = ({ re, im }) => re * re + im * im;
  return {
    zero: probability(alpha),
    one: probability(beta),
  };
}

/** Return Bloch-sphere coordinates for a normalized pure qubit state. */
export function getBlochCoordinates(alpha, beta) {
  const alphaAbsSquared = alpha.re * alpha.re + alpha.im * alpha.im;
  const betaAbsSquared = beta.re * beta.re + beta.im * beta.im;

  return {
    x: 2 * (alpha.re * beta.re + alpha.im * beta.im),
    y: 2 * (alpha.re * beta.im - alpha.im * beta.re),
    z: alphaAbsSquared - betaAbsSquared,
  };
}
