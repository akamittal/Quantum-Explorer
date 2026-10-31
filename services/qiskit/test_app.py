import math
import pytest
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
    assert "Circuit:" in data["stdout"]
    assert "Statevector:" in data["stdout"]
    assert "Exact basis probabilities:" in data["stdout"]
    assert "Measurement counts (4000 shots):" in data["stdout"]
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


def test_controlled_z_and_swap_match_expected_basis_actions():
    cz = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [{"name": "H", "qubit": 0}, {"name": "H", "qubit": 1}, {"name": "CZ", "first": 0, "second": 1}],
        "shots": 100,
    })
    assert cz.status_code == 200
    cz_state = cz.json()["statevector"]
    assert cz_state[3]["re"] == pytest.approx(-0.5)
    assert cz_state[3]["im"] == pytest.approx(0.0)

    swap = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [{"name": "X", "qubit": 0}, {"name": "SWAP", "first": 0, "second": 1}],
        "shots": 100,
    })
    assert swap.status_code == 200
    probabilities = swap.json()["probabilities"]
    assert probabilities["10"] == pytest.approx(1.0)
    assert probabilities["01"] == pytest.approx(0.0)


def test_multi_controlled_x_gate_matches_three_control_truth_condition():
    response = client.post("/execute", json={
        "num_qubits": 4,
        "operations": [
            {"name": "X", "qubit": 0},
            {"name": "X", "qubit": 1},
            {"name": "X", "qubit": 2},
            {"name": "MCX", "controls": [0, 1, 2], "target": 3},
        ],
        "shots": 100,
    })
    assert response.status_code == 200
    probabilities = response.json()["probabilities"]
    assert probabilities["1111"] == pytest.approx(1.0)
    assert probabilities["0111"] == pytest.approx(0.0)


def test_multi_controlled_x_rejects_invalid_control_lists():
    duplicate = client.post("/execute", json={
        "num_qubits": 3,
        "operations": [{"name": "MCX", "controls": [0, 0], "target": 2}],
    })
    target_is_control = client.post("/execute", json={
        "num_qubits": 3,
        "operations": [{"name": "MCX", "controls": [0, 2], "target": 2}],
    })
    out_of_range = client.post("/execute", json={
        "num_qubits": 3,
        "operations": [{"name": "MCX", "controls": [0, 3], "target": 2}],
    })
    assert duplicate.status_code == 422
    assert target_is_control.status_code == 422
    assert out_of_range.status_code == 422


def test_controlled_gate_rejects_same_or_out_of_range_wires():
    same_wire = client.post("/execute", json={
        "num_qubits": 2, "operations": [{"name": "SWAP", "first": 0, "second": 0}]
    })
    out_of_range = client.post("/execute", json={
        "num_qubits": 2, "operations": [{"name": "CZ", "first": 0, "second": 2}]
    })
    assert same_wire.status_code == 422
    assert out_of_range.status_code == 422
