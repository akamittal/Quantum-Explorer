import math
from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health_reports_qiskit_engine():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["engine"] == "Qiskit + Aer"


def test_hadamard_statevector_and_measurement_distribution():
    response = client.post("/execute", json={
        "num_qubits": 1, "operations": [{"name": "H", "qubit": 0}], "shots": 4000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["qubit_order"].startswith("q[n-1]")
    assert data["probabilities"]["0"] == pytest.approx(0.5)
    assert data["probabilities"]["1"] == pytest.approx(0.5)
    assert sum(data["counts"].values()) == 4000
    assert abs(data["counts"].get("0", 0) / 4000 - 0.5) < 0.05


def test_rotation_gate_matches_expected_probabilities():
    response = client.post("/execute", json={
        "num_qubits": 1,
        "operations": [{"name": "RY", "qubit": 0, "theta": math.pi / 3}],
        "shots": 100,
    })
    assert response.status_code == 200
    assert response.json()["probabilities"]["1"] == pytest.approx(0.25)


def test_qiskit_little_endian_order_for_cnot():
    response = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [{"name": "H", "qubit": 0}, {"name": "CX", "control": 0, "target": 1}],
        "shots": 200,
    })
    assert response.status_code == 200
    probabilities = response.json()["probabilities"]
    assert probabilities["00"] == pytest.approx(0.5)
    assert probabilities["11"] == pytest.approx(0.5)
    assert probabilities["01"] == pytest.approx(0.0)


def test_invalid_gate_and_rotation_are_rejected():
    bad_gate = client.post("/execute", json={"num_qubits": 1, "operations": [{"name": "BOGUS", "qubit": 0}]})
    bad_angle = client.post("/execute", json={"num_qubits": 1, "operations": [{"name": "RX", "qubit": 0}]})
    assert bad_gate.status_code == 422
    assert bad_angle.status_code == 422


def test_shot_and_qubit_limits_are_enforced():
    assert client.post("/execute", json={"num_qubits": 0}).status_code == 422
    assert client.post("/execute", json={"num_qubits": 1, "shots": 100001}).status_code == 422
