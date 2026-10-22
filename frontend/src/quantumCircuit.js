/**
 * Pure single-qubit circuit simulator.
 *
 * State convention: |psi> = alpha|0> + beta|1>, with complex amplitudes
 * represented as { re, im }. The module has no UI or browser dependencies.
 */

const COMPLEX_ZERO = Object.freeze({ re: 0, im: 0 });
const COMPLEX_ONE = Object.freeze({ re: 1, im: 0 });
const SQRT_HALF = 1 / Math.sqrt(2);

const complex = (re, im = 0) => ({ re, im });
const add = (a, b) => complex(a.re + b.re, a.im + b.im);
const multiply = (a, b) =>
  complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const scale = (a, scalar) => complex(a.re * scalar, a.im * scalar);
const magnitudeSquared = (value) => value.re * value.re + value.im * value.im;

function assertComplex(value, label) {
  if (
    !value ||
    !Number.isFinite(value.re) ||
    !Number.isFinite(value.im)
  ) {
    throw new TypeError(`${label} must have finite re and im components.`);
  }
}

function assertState(state) {
  if (!state || typeof state !== "object") {
    throw new TypeError("A state with alpha and beta amplitudes is required.");
  }
  assertComplex(state.alpha, "state.alpha");
  assertComplex(state.beta, "state.beta");
  if (magnitudeSquared(state.alpha) + magnitudeSquared(state.beta) <= 0) {
    throw new RangeError("A quantum state cannot have zero total amplitude.");
  }
}

function rotationAngle(operation) {
  if (!Number.isFinite(operation.theta)) {
    throw new TypeError(`Gate ${operation.name} requires a finite theta parameter in radians.`);
  }
  return operation.theta;
}

/** Return a 2x2 complex matrix for a supported single-qubit gate. */
export function getSingleQubitGateMatrix(operation) {
  const normalized =
    typeof operation === "string"
      ? { name: operation }
      : operation;
  if (!normalized || typeof normalized.name !== "string") {
    throw new TypeError("A gate name is required.");
  }

  const name = normalized.name.toUpperCase();
  const z = COMPLEX_ZERO;
  const one = COMPLEX_ONE;
  const minusOne = complex(-1, 0);
  const i = complex(0, 1);

  switch (name) {
    case "I":
      return [[one, z], [z, one]];
    case "H":
      return [
        [complex(SQRT_HALF), complex(SQRT_HALF)],
        [complex(SQRT_HALF), complex(-SQRT_HALF)],
      ];
    case "X":
      return [[z, one], [one, z]];
    case "Y":
      return [[z, complex(0, -1)], [i, z]];
    case "Z":
      return [[one, z], [z, minusOne]];
    case "S":
      return [[one, z], [z, i]];
    case "T": {
      const angle = Math.PI / 4;
      return [[one, z], [z, complex(Math.cos(angle), Math.sin(angle))]];
    }
    case "RX": {
      const half = rotationAngle(normalized) / 2;
      const cosine = Math.cos(half);
      const negativeISine = complex(0, -Math.sin(half));
      return [
        [complex(cosine), negativeISine],
        [negativeISine, complex(cosine)],
      ];
    }
    case "RY": {
      const half = rotationAngle(normalized) / 2;
      const cosine = Math.cos(half);
      const sine = Math.sin(half);
      return [
        [complex(cosine), complex(-sine)],
        [complex(sine), complex(cosine)],
      ];
    }
    case "RZ": {
      const half = rotationAngle(normalized) / 2;
      return [
        [complex(Math.cos(half), -Math.sin(half)), z],
        [z, complex(Math.cos(half), Math.sin(half))],
      ];
    }
    default:
      throw new RangeError(`Unsupported single-qubit gate: ${normalized.name}`);
  }
}

/** Apply one unitary gate to a single-qubit state. */
export function applySingleQubitGate(state, operation) {
  assertState(state);
  const matrix = getSingleQubitGateMatrix(operation);
  const alpha = add(
    multiply(matrix[0][0], state.alpha),
    multiply(matrix[0][1], state.beta),
  );
  const beta = add(
    multiply(matrix[1][0], state.alpha),
    multiply(matrix[1][1], state.beta),
  );
  return { alpha, beta };
}

/** Execute an ordered list of gates against an initial state. */
export function runSingleQubitCircuit(initialState, operations) {
  assertState(initialState);
  if (!Array.isArray(operations)) {
    throw new TypeError("Circuit operations must be an array.");
  }
  return operations.reduce(
    (state, operation) => applySingleQubitGate(state, operation),
    {
      alpha: { ...initialState.alpha },
      beta: { ...initialState.beta },
    },
  );
}

/** Return normalized Born-rule probabilities, even for a non-unit input vector. */
export function getStateProbabilities(state) {
  assertState(state);
  const zeroWeight = magnitudeSquared(state.alpha);
  const oneWeight = magnitudeSquared(state.beta);
  const total = zeroWeight + oneWeight;
  return {
    zero: zeroWeight / total,
    one: oneWeight / total,
  };
}

/**
 * Simulate repeated computational-basis measurements.
 * Inject rng in tests to make sampling deterministic; production defaults to Math.random.
 */
export function sampleMeasurements(state, shots = 1024, rng = Math.random) {
  if (!Number.isSafeInteger(shots) || shots < 1) {
    throw new RangeError("shots must be a positive safe integer.");
  }
  if (typeof rng !== "function") {
    throw new TypeError("rng must be a function returning values in [0, 1).");
  }

  const probabilities = getStateProbabilities(state);
  let zero = 0;
  let one = 0;
  for (let shot = 0; shot < shots; shot += 1) {
    const value = rng();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("rng must return values in [0, 1).");
    }
    if (value < probabilities.zero) zero += 1;
    else one += 1;
  }

  return {
    shots,
    zero,
    one,
    probabilityZero: probabilities.zero,
    probabilityOne: probabilities.one,
  };
}
