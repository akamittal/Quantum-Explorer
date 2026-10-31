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

test("generates multi-controlled X gates with their complete control list", () => {
  const code = generateQiskitPythonCode({
    numQubits: 4,
    operations: [{ name: "MCX", controls: [0, 1, 2], target: 3 }],
  });
  assert.match(code, /qc\.mcx\(\[0, 1, 2\], 3\)/);
  assert.throws(() => generateQiskitPythonCode({
    numQubits: 3, operations: [{ name: "MCX", controls: [0, 2], target: 2 }],
  }), /invalid MCX/);
});

test("rejects invalid circuit dimensions, shots, and qubit indices", () => {
  assert.throws(() => generateQiskitPythonCode({ numQubits: 9 }), /1 to 8/);
  assert.throws(() => generateQiskitPythonCode({ shots: 0 }), /1 to 100,000/);
  assert.throws(() => generateQiskitPythonCode({ numQubits: 1, operations: [{ name: "H", target: 1 }] }), /invalid target qubit/);
});

test("generates controlled-phase gates with a finite angle and rejects invalid phase gates", () => {
  const code = generateQiskitPythonCode({
    numQubits: 3,
    operations: [{ name: "CP", control: 0, target: 2, theta: Math.PI / 4 }],
  });
  assert.match(code, /qc\\.cp\\(0\\.7853981633974483, 0, 2\\)/);
  assert.throws(() => generateQiskitPythonCode({
    numQubits: 2, operations: [{ name: "CP", control: 0, target: 1 }],
  }), /finite phase angle/);
  assert.throws(() => generateQiskitPythonCode({
    numQubits: 2, operations: [{ name: "CP", control: 1, target: 1, theta: 1 }],
  }), /invalid CP/);
});
