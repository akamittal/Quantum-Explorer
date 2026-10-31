"""Qiskit execution service for Quantum Explorer.

The API deliberately returns Qiskit's native computational-basis ordering:
index 0 is |00...0>, and displayed bitstrings are q[n-1]...q[0].
"""
from __future__ import annotations

import io
import math
import os
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

app = FastAPI(title="Quantum Explorer Qiskit Service", version="1.0.0")
simulator = AerSimulator()
MAX_QUBITS = int(os.getenv("QISKIT_MAX_QUBITS", "8"))
MAX_SHOTS = int(os.getenv("QISKIT_MAX_SHOTS", "100000"))


class Operation(BaseModel):
    name: str = Field(min_length=1, max_length=8)
    qubit: int | None = None
    control: int | None = None
    target: int | None = None
    theta: float | None = None
    first: int | None = None
    second: int | None = None
    controls: list[int] | None = None


class ExecuteRequest(BaseModel):
    num_qubits: int = Field(ge=1, le=MAX_QUBITS)
    operations: list[Operation] = Field(default_factory=list, max_length=256)
    shots: int = Field(default=1024, ge=1, le=MAX_SHOTS)


def build_circuit(payload: ExecuteRequest) -> QuantumCircuit:
    circuit = QuantumCircuit(payload.num_qubits)
    single = {"I": "id", "ID": "id", "H": "h", "X": "x", "Y": "y",
              "Z": "z", "S": "s", "T": "t", "RX": "rx", "RY": "ry", "RZ": "rz"}
    for index, operation in enumerate(payload.operations):
        name = operation.name.upper()
        try:
            if name in single:
                if operation.qubit is None or not 0 <= operation.qubit < payload.num_qubits:
                    raise ValueError("a valid qubit index is required")
                method = getattr(circuit, single[name])
                if name in {"RX", "RY", "RZ"}:
                    if operation.theta is None or not math.isfinite(operation.theta):
                        raise ValueError(f"{name} requires a finite theta in radians")
                    method(operation.theta, operation.qubit)
                else:
                    method(operation.qubit)
            elif name in {"CX", "CNOT"}:
                control, target = operation.control, operation.target
                if control is None or target is None or control == target:
                    raise ValueError("CX requires distinct control and target qubits")
                if not (0 <= control < payload.num_qubits and 0 <= target < payload.num_qubits):
                    raise ValueError("CX qubit indices are out of range")
                circuit.cx(control, target)
            elif name == "MCX":
                controls, target = operation.controls, operation.target
                if controls is None or len(controls) < 1:
                    raise ValueError("MCX requires at least one control qubit")
                if len(set(controls)) != len(controls):
                    raise ValueError("MCX control qubits must be unique")
                if target is None or target in controls:
                    raise ValueError("MCX requires a target distinct from every control")
                if any(not 0 <= control < payload.num_qubits for control in controls):
                    raise ValueError("MCX control qubit indices are out of range")
                if not 0 <= target < payload.num_qubits:
                    raise ValueError("MCX target qubit index is out of range")
                circuit.mcx(controls, target)
            elif name in {"CZ", "SWAP"}:
                first, second = operation.first, operation.second
                if first is None or second is None or first == second:
                    raise ValueError(f"{name} requires two distinct qubit indices")
                if not (0 <= first < payload.num_qubits and 0 <= second < payload.num_qubits):
                    raise ValueError(f"{name} qubit indices are out of range")
                getattr(circuit, name.lower())(first, second)
            else:
                raise ValueError(f"unsupported gate: {operation.name}")
        except (AttributeError, ValueError) as exc:
            raise HTTPException(status_code=422, detail=f"operation {index}: {exc}") from exc
    return circuit


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "engine": "Qiskit + Aer", "qiskit_version": __import__("qiskit").__version__}


@app.post("/execute")
def execute(payload: ExecuteRequest) -> dict[str, Any]:
    circuit = build_circuit(payload)
    state = Statevector.from_instruction(circuit)
    probabilities = state.probabilities()
    measured = circuit.copy()
    measured.measure_all()
    try:
        result = simulator.run(measured, shots=payload.shots).result()
        counts = result.get_counts()
    except Exception as exc:  # pragma: no cover - defensive backend boundary
        raise HTTPException(status_code=502, detail="Qiskit Aer execution failed") from exc

    amplitudes = []
    for index, amplitude in enumerate(state.data):
        amplitudes.append({
            "index": index,
            "bitstring": format(index, f"0{payload.num_qubits}b"),
            "re": float(amplitude.real),
            "im": float(amplitude.imag),
            "probability": float(probabilities[index]),
        })
    # Capture the print output represented by the generated standalone Python example.
    output = io.StringIO()
    # Write only to this request's buffer. redirect_stdout changes process-global
    # sys.stdout and can mix output when concurrent requests execute in threads.
    print("Circuit:", file=output)
    print(circuit.draw(), file=output)
    print("Statevector:", file=output)
    print(state, file=output)
    print("Exact basis probabilities:", file=output)
    print(state.probabilities_dict(), file=output)
    print(f"Measurement counts ({payload.shots} shots):", file=output)
    print(counts, file=output)

    return {
        "engine": "qiskit-aer",
        "stdout": output.getvalue(),
        "num_qubits": payload.num_qubits,
        "qubit_order": "q[n-1]...q[1]q[0] (q0 is least-significant/rightmost)",
        "shots": payload.shots,
        "statevector": amplitudes,
        "probabilities": {item["bitstring"]: item["probability"] for item in amplitudes},
        "counts": dict(counts),
    }
