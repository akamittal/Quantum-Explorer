import assert from "node:assert/strict";
import { runSingleQubitCircuit } from "../frontend/src/quantumCircuit.js";

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
