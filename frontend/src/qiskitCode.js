const SINGLE_QUBIT_GATES = new Set(["I", "ID", "H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ"]);

function pythonNumber(value) {
  if (!Number.isFinite(value)) throw new TypeError("Rotation angles must be finite numbers.");
  return Number(value).toString();
}

/** Build a complete, runnable Qiskit program from the exact playground circuit. */
export function generateQiskitPythonCode({ numQubits = 1, operations = [], shots = 1000 } = {}) {
  if (!Number.isInteger(numQubits) || numQubits < 1 || numQubits > 8) throw new RangeError("Qiskit examples support 1 to 8 qubits.");
  if (!Number.isInteger(shots) || shots < 1 || shots > 100000) throw new RangeError("Shots must be an integer from 1 to 100,000.");
  const lines = [
    "# Install dependencies: pip install qiskit qiskit-aer",
    "from qiskit import QuantumCircuit",
    "from qiskit.quantum_info import Statevector",
    "from qiskit_aer import AerSimulator",
    "",
    "NUM_QUBITS = " + numQubits,
    "SHOTS = " + shots,
    "qc = QuantumCircuit(NUM_QUBITS)",
    "",
    "# Gates are applied in the same order as the playground.",
  ];
  operations.forEach((operation, index) => {
    const name = (typeof operation === "string" ? operation : operation.name || "").toUpperCase();
    const qubit = typeof operation === "string" ? 0 : (operation.qubit ?? operation.target);
    if (SINGLE_QUBIT_GATES.has(name)) {
      if (!Number.isInteger(qubit) || qubit < 0 || qubit >= numQubits) throw new RangeError("Operation " + index + ": invalid target qubit.");
      if (["RX", "RY", "RZ"].includes(name)) {
        if (!Number.isFinite(operation.theta)) throw new TypeError("Operation " + index + ": " + name + " needs a finite theta in radians.");
        lines.push("qc." + name.toLowerCase() + "(" + pythonNumber(operation.theta) + ", " + qubit + ")");
      } else lines.push("qc." + (name === "I" || name === "ID" ? "id" : name.toLowerCase()) + "(" + qubit + ")");
      return;
    }
    if (name === "CX" || name === "CNOT") {
      const control = operation.control, target = operation.target;
      if (!Number.isInteger(control) || !Number.isInteger(target) || control === target || control < 0 || target < 0 || control >= numQubits || target >= numQubits) throw new RangeError("Operation " + index + ": invalid CX control/target.");
      lines.push("qc.cx(" + control + ", " + target + ")"); return;
    }
    if (name === "CZ" || name === "SWAP") {
      const first = operation.first, second = operation.second;
      if (!Number.isInteger(first) || !Number.isInteger(second) || first === second || first < 0 || second < 0 || first >= numQubits || second >= numQubits) throw new RangeError("Operation " + index + ": invalid " + name + " qubit pair.");
      lines.push("qc." + name.toLowerCase() + "(" + first + ", " + second + ")"); return;
    }
    throw new TypeError("Operation " + index + ": unsupported gate " + (name || "(empty)") + ".");
  });
  if (!operations.length) lines.push("# Add gates in the playground to populate this circuit.");
  lines.push("", "# Inspect the exact state before measurement.", "state = Statevector.from_instruction(qc)",
    'print("Circuit:")', "print(qc.draw())", 'print("Statevector:")', "print(state)",
    'print("Exact basis probabilities:")', "print(state.probabilities_dict())", "",
    "# Measure a copy so the statevector above remains unmeasured.",
    "measured_circuit = qc.copy()", "measured_circuit.measure_all()",
    "simulator = AerSimulator()", "result = simulator.run(measured_circuit, shots=SHOTS).result()",
    'print(f"Measurement counts ({SHOTS} shots):")', "print(result.get_counts())");
  return lines.join("\n");
}