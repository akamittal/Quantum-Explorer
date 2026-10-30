"""Qiskit execution service for Quantum Explorer.

The API deliberately returns Qiskit's native computational-basis ordering:
index 0 is |00...0>, and displayed bitstrings are q[n-1]...q[0].
"""
from __future__ import annotations

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
    return {
        "engine": "qiskit-aer",
        "num_qubits": payload.num_qubits,
        "qubit_order": "q[n-1]...q[1]q[0] (q0 is least-significant/rightmost)",
        "shots": payload.shots,
        "statevector": amplitudes,
        "probabilities": {item["bitstring"]: item["probability"] for item in amplitudes},
        "counts": dict(counts),
    }
