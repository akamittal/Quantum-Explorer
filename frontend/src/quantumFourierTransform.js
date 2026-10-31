const TAU = 2 * Math.PI;

function add(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
function multiply(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
function scale(a, value) { return { re: a.re * value, im: a.im * value }; }
function polar(angle) { return { re: Math.cos(angle), im: Math.sin(angle) }; }
function normalize(state) {
  const norm = Math.sqrt(state.reduce((sum, value) => sum + value.re ** 2 + value.im ** 2, 0));
  if (!Number.isFinite(norm) || norm < 1e-14) throw new RangeError("The input state must have a finite, non-zero norm.");
  return state.map((value) => scale(value, 1 / norm));
}

export function basisState(numQubits, integer) {
  validateQubits(numQubits);
  const dimension = 2 ** numQubits;
  if (!Number.isInteger(integer) || integer < 0 || integer >= dimension) throw new RangeError("Basis index is outside the register.");
  return Array.from({ length: dimension }, (_, index) => ({ re: index === integer ? 1 : 0, im: 0 }));
}

function validateQubits(numQubits) {
  if (!Number.isInteger(numQubits) || numQubits < 1 || numQubits > 8) throw new RangeError("QFT supports 1 to 8 qubits in the current Qiskit service.");
}

export function qftState(input, inverse = false) {
  if (!Array.isArray(input) || input.length < 2 || (input.length & (input.length - 1)) !== 0) {
    throw new TypeError("A QFT input must be a power-of-two statevector with at least two amplitudes.");
  }
  const numQubits = Math.log2(input.length);
  validateQubits(numQubits);
  const state = normalize(input.map((value) => {
    if (!value || !Number.isFinite(value.re) || !Number.isFinite(value.im)) throw new TypeError("Every amplitude must have finite real and imaginary parts.");
    return { re: value.re, im: value.im };
  }));
  const sign = inverse ? -1 : 1;
  const normalization = 1 / Math.sqrt(state.length);
  return state.map((_, output) => {
    let amplitude = { re: 0, im: 0 };
    for (let inputIndex = 0; inputIndex < state.length; inputIndex += 1) {
      const angle = sign * TAU * inputIndex * output / state.length;
      amplitude = add(amplitude, multiply(state[inputIndex], polar(angle)));
    }
    return scale(amplitude, normalization);
  });
}

export function buildQftOperations(numQubits, inverse = false) {
  validateQubits(numQubits);
  const forward = [];
  // q0 is the least-significant bit. Work from the most-significant wire down.
  for (let target = numQubits - 1; target >= 0; target -= 1) {
    forward.push({ name: "H", qubit: target });
    for (let control = target - 1; control >= 0; control -= 1) {
      forward.push({
        name: "CP",
        control,
        target,
        theta: Math.PI / (2 ** (target - control)),
      });
    }
  }
  for (let left = 0; left < Math.floor(numQubits / 2); left += 1) {
    forward.push({ name: "SWAP", first: left, second: numQubits - 1 - left });
  }
  if (!inverse) return forward;
  return forward.reverse().map((operation) => {
    if (operation.name === "CP") return { ...operation, theta: -operation.theta };
    return operation;
  });
}

export function createInputState(numQubits, mode = "basis", basisIndex = 0) {
  validateQubits(numQubits);
  const dimension = 2 ** numQubits;
  if (mode === "basis") return basisState(numQubits, basisIndex);
  if (mode === "uniform") {
    const amplitude = 1 / Math.sqrt(dimension);
    return Array.from({ length: dimension }, () => ({ re: amplitude, im: 0 }));
  }
  if (mode === "alternating") {
    const amplitude = 1 / Math.sqrt(dimension);
    return Array.from({ length: dimension }, (_, index) => ({ re: index % 2 ? -amplitude : amplitude, im: 0 }));
  }
  throw new TypeError("Unknown QFT input preset.");
}

export function stateDiagnostics(state) {
  return state.map((amplitude, index) => {
    const probability = amplitude.re ** 2 + amplitude.im ** 2;
    return {
      index,
      bitstring: index.toString(2).padStart(Math.log2(state.length), "0"),
      re: amplitude.re,
      im: amplitude.im,
      probability,
      phase: probability < 1e-14 ? 0 : Math.atan2(amplitude.im, amplitude.re),
    };
  });
}

export function qftComplexMultiply(a, b) { return multiply(a, b); }
