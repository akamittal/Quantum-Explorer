import assert from "node:assert/strict";
import { runSingleQubitCircuit } from "../frontend/src/quantumCircuit.js";
import { basisState, buildQftOperations, qftState } from "../frontend/src/quantumFourierTransform.js";
import { buildQpeOperations, qpeState } from "../frontend/src/quantumPhaseEstimation.js";

const baseUrl = process.env.QISKIT_SERVICE_URL || "http://127.0.0.1:8000";
const cases = [
  [{ name: "H" }],
  [{ name: "X" }],
  [{ name: "Y" }],
  [{ name: "S" }, { name: "H" }],
  [{ name: "H" }, { name: "T" }, { name: "RX", theta: Math.PI / 5 }],
  [{ name: "RY", theta: Math.PI / 3 }, { name: "RZ", theta: -Math.PI / 7 }],
  [{ name: "H" }, { name: "Z" }, { name: "H" }, { name: "RX", theta: 0.73 }],
];

function magnitude(value) {
  return Math.hypot(value.re, value.im);
}

for (const operations of cases) {
  const response = await fetch(`${baseUrl}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      num_qubits: 1,
      shots: 2048,
      operations: operations.map((operation) => ({ ...operation, qubit: 0 })),
    }),
  });
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const qiskit = JSON.parse(responseText);
  const jsState = runSingleQubitCircuit(
    { alpha: { re: 1, im: 0 }, beta: { re: 0, im: 0 } },
    operations,
  );
  const js = [jsState.alpha, jsState.beta];
  const q = qiskit.statevector.map(({ re, im }) => ({ re, im }));

  // Statevectors may differ by a physically irrelevant global phase.
  const overlap = {
    re: js.reduce((sum, value, i) => sum + value.re * q[i].re + value.im * q[i].im, 0),
    im: js.reduce((sum, value, i) => sum + value.re * q[i].im - value.im * q[i].re, 0),
  };
  const overlapMagnitude = magnitude(overlap);
  assert.ok(Math.abs(overlapMagnitude - 1) < 1e-9, "statevectors must agree up to global phase");
  for (let i = 0; i < 2; i += 1) {
    const jsProbability = js[i].re ** 2 + js[i].im ** 2;
    assert.ok(Math.abs(jsProbability - qiskit.statevector[i].probability) < 1e-10);
  }
}

console.log(`Qiskit/JavaScript cross-check passed for ${cases.length} single-qubit circuits.`);


// Verify the decomposed multi-qubit QFT against the direct DFT statevector.
for (const numQubits of [2, 3, 4]) {
  const dimension = 2 ** numQubits;
  for (const basisIndex of [0, 1, Math.floor(dimension / 2) + 1, dimension - 1]) {
    const operations = [
      ...Array.from({ length: numQubits }, (_, qubit) => qubit)
        .filter((qubit) => (basisIndex >> qubit) & 1)
        .map((qubit) => ({ name: "X", qubit })),
      ...buildQftOperations(numQubits),
    ];
    const response = await fetch(`${baseUrl}/execute`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ num_qubits: numQubits, shots: 128, operations }),
    });
    const responseText = await response.text();
    assert.equal(response.status, 200, responseText);
    const qiskit = JSON.parse(responseText);
    const expected = qftState(basisState(numQubits, basisIndex));
    const actual = qiskit.statevector.map(({ re, im }) => ({ re, im }));
    const overlap = expected.reduce((sum, value, index) => ({
      re: sum.re + value.re * actual[index].re + value.im * actual[index].im,
      im: sum.im + value.re * actual[index].im - value.im * actual[index].re,
    }), { re: 0, im: 0 });
    assert.ok(Math.abs(magnitude(overlap) - 1) < 1e-9, `QFT statevector mismatch for n=${numQubits}, x=${basisIndex}`);
    expected.forEach((value, index) => {
      assert.ok(Math.abs(value.re ** 2 + value.im ** 2 - qiskit.statevector[index].probability) < 1e-10);
    });
  }
}

console.log("Qiskit/JavaScript cross-check passed for QFT circuits with 2, 3, and 4 qubits.");


// Verify phase kickback and inverse-QFT eigenphase extraction against Qiskit.
for (const [countingQubits, phase] of [[2, 1 / 4], [3, 3 / 8], [4, 5 / 16], [4, 0.3]]) {
  const operations = buildQpeOperations(countingQubits, phase);
  const response = await fetch(`${baseUrl}/execute`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      num_qubits: countingQubits + 1,
      shots: 256,
      operations,
    }),
  });
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const qiskit = JSON.parse(responseText);
  const countingState = qpeState(countingQubits, phase);
  const expected = [
    ...Array.from({ length: countingState.length }, () => ({ re: 0, im: 0 })),
    ...countingState,
  ];
  const actual = qiskit.statevector.map(({ re, im }) => ({ re, im }));
  const overlap = expected.reduce((sum, value, index) => ({
    re: sum.re + value.re * actual[index].re + value.im * actual[index].im,
    im: sum.im + value.re * actual[index].im - value.im * actual[index].re,
  }), { re: 0, im: 0 });
  assert.ok(Math.abs(magnitude(overlap) - 1) < 1e-9, `QPE statevector mismatch for m=${countingQubits}, phase=${phase}`);
  expected.forEach((value, index) => {
    assert.ok(Math.abs(value.re ** 2 + value.im ** 2 - qiskit.statevector[index].probability) < 1e-10);
  });
}

console.log("Qiskit/JavaScript cross-check passed for exact and non-exact QPE phases with 2, 3, and 4 counting qubits.");
