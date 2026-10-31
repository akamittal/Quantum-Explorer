import test from "node:test";
import assert from "node:assert/strict";
import { generateQiskitPythonCode } from "./qiskitCode.js";

test("generates a complete one-qubit Python program from the selected gate sequence", () => {
  const code = generateQiskitPythonCode({ numQubits: 1, operations: ["H", "X", "S"], shots: 500 });
  assert.match(code, /qc = QuantumCircuit\(NUM_QUBITS\)/);
  assert.match(code, /qc\.h\(0\)/);
  assert.match(code, /qc\.x\(0\)/);
  assert.match(code, /qc\.s\(0\)/);
  assert.match(code, /shots=SHOTS/);
  assert.match(code, /state\.probabilities_dict\(\)/);
  assert.match(code, /measure_all\(\)/);
});

test("generates multi-qubit controlled, phase, swap, and rotation operations in order", () => {
  const code = generateQiskitPythonCode({
    numQubits: 3,
    operations: [
      { name: "H", target: 2 },
      { name: "RY", target: 1, theta: Math.PI / 3 },
      { name: "CNOT", control: 1, target: 0 },
      { name: "CZ", first: 0, second: 2 },
      { name: "SWAP", first: 1, second: 2 },
    ],
  });
  const positions = ["qc.h(2)", "qc.ry(1.0471975511965976, 1)", "qc.cx(1, 0)", "qc.cz(0, 2)", "qc.swap(1, 2)"].map((line) => code.indexOf(line));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(code, /QuantumCircuit\(NUM_QUBITS\)/);
});

test("rejects invalid circuit dimensions, shots, and qubit indices", () => {
  assert.throws(() => generateQiskitPythonCode({ numQubits: 9 }), /1 to 8/);
  assert.throws(() => generateQiskitPythonCode({ shots: 0 }), /1 to 100,000/);
  assert.throws(() => generateQiskitPythonCode({ numQubits: 1, operations: [{ name: "H", target: 1 }] }), /invalid target qubit/);
});
