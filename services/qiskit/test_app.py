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

def test_all_four_bell_states_have_expected_joint_probabilities_and_x_correlations():
    bell_circuits = {
        "Phi+": [
            {"name": "H", "qubit": 0},
            {"name": "CX", "control": 0, "target": 1},
        ],
        "Phi-": [
            {"name": "H", "qubit": 0},
            {"name": "CX", "control": 0, "target": 1},
            {"name": "Z", "qubit": 1},
        ],
        "Psi+": [
            {"name": "H", "qubit": 0},
            {"name": "CX", "control": 0, "target": 1},
            {"name": "X", "qubit": 1},
        ],
        "Psi-": [
            {"name": "H", "qubit": 0},
            {"name": "CX", "control": 0, "target": 1},
            {"name": "X", "qubit": 1},
            {"name": "Z", "qubit": 1},
        ],
    }
    expected_z = {
        "Phi+": ("00", "11"),
        "Phi-": ("00", "11"),
        "Psi+": ("01", "10"),
        "Psi-": ("01", "10"),
    }
    expected_x = {
        "Phi+": ("00", "11"),
        "Phi-": ("01", "10"),
        "Psi+": ("00", "11"),
        "Psi-": ("01", "10"),
    }

    for name, preparation in bell_circuits.items():
        z_response = client.post("/execute", json={
            "num_qubits": 2, "operations": preparation, "shots": 2000
        })
        assert z_response.status_code == 200, name
        z_probabilities = z_response.json()["probabilities"]
        for bitstring in ("00", "01", "10", "11"):
            expected = 0.5 if bitstring in expected_z[name] else 0.0
            assert z_probabilities[bitstring] == pytest.approx(expected), name

        x_response = client.post("/execute", json={
            "num_qubits": 2,
            "operations": preparation + [
                {"name": "H", "qubit": 0},
                {"name": "H", "qubit": 1},
            ],
            "shots": 2000,
        })
        assert x_response.status_code == 200, name
        x_probabilities = x_response.json()["probabilities"]
        for bitstring in ("00", "01", "10", "11"):
            expected = 0.5 if bitstring in expected_x[name] else 0.0
            assert x_probabilities[bitstring] == pytest.approx(expected), name


def test_partial_schmidt_state_has_exact_qiskit_probabilities():
    theta = math.pi / 6
    response = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [
            {"name": "RY", "qubit": 0, "theta": 2 * theta},
            {"name": "CX", "control": 0, "target": 1},
        ],
        "shots": 1000,
    })
    assert response.status_code == 200
    probabilities = response.json()["probabilities"]
    assert probabilities["00"] == pytest.approx(math.cos(theta) ** 2)
    assert probabilities["11"] == pytest.approx(math.sin(theta) ** 2)
    assert probabilities["01"] == pytest.approx(0.0)
    assert probabilities["10"] == pytest.approx(0.0)


def test_controlled_phase_applies_exact_complex_phase_and_rejects_invalid_angles():
    response = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [
            {"name": "X", "qubit": 0},
            {"name": "X", "qubit": 1},
            {"name": "CP", "control": 0, "target": 1, "theta": math.pi / 2},
        ],
        "shots": 100,
    })
    assert response.status_code == 200
    state = response.json()["statevector"]
    assert state[3]["re"] == pytest.approx(0.0, abs=1e-10)
    assert state[3]["im"] == pytest.approx(1.0)

    missing_angle = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [{"name": "CP", "control": 0, "target": 1}],
    })
    same_wire = client.post("/execute", json={
        "num_qubits": 2,
        "operations": [{"name": "CP", "control": 0, "target": 0, "theta": 1.0}],
    })
    assert missing_angle.status_code == 422
    assert same_wire.status_code == 422


def test_three_qubit_qft_decomposition_matches_the_discrete_fourier_transform():
    for basis_index in (0, 1, 3, 5, 7):
        operations = []
        for target in range(2, -1, -1):
            operations.append({"name": "H", "qubit": target})
            for control in range(target - 1, -1, -1):
                operations.append({
                    "name": "CP",
                    "control": control,
                    "target": target,
                    "theta": math.pi / (2 ** (target - control)),
                })
        operations.append({"name": "SWAP", "first": 0, "second": 2})
        response = client.post("/execute", json={
            "num_qubits": 3,
            "operations": [{"name": "X", "qubit": q} for q in range(3) if (basis_index >> q) & 1] + operations,
            "shots": 100,
        })
        assert response.status_code == 200
        state = response.json()["statevector"]
        for output_index, amplitude in enumerate(state):
            angle = 2 * math.pi * basis_index * output_index / 8
            assert amplitude["re"] == pytest.approx(math.cos(angle) / math.sqrt(8), abs=1e-10)
            assert amplitude["im"] == pytest.approx(math.sin(angle) / math.sqrt(8), abs=1e-10)



def test_three_counting_qubit_qpe_recovers_exact_eigenphase():
    phase = 3 / 8
    operations = [
        {"name": "X", "qubit": 3},
        {"name": "H", "qubit": 0},
        {"name": "H", "qubit": 1},
        {"name": "H", "qubit": 2},
        {"name": "CP", "control": 0, "target": 3, "theta": 2 * math.pi * phase},
        {"name": "CP", "control": 1, "target": 3, "theta": 2 * math.pi * phase * 2},
        {"name": "CP", "control": 2, "target": 3, "theta": 2 * math.pi * phase * 4},
        {"name": "SWAP", "first": 0, "second": 2},
        {"name": "H", "qubit": 0},
        {"name": "CP", "control": 0, "target": 1, "theta": -math.pi / 2},
        {"name": "H", "qubit": 1},
        {"name": "CP", "control": 0, "target": 2, "theta": -math.pi / 4},
        {"name": "CP", "control": 1, "target": 2, "theta": -math.pi / 2},
        {"name": "H", "qubit": 2},
    ]
    response = client.post("/execute", json={
        "num_qubits": 4, "operations": operations, "shots": 2048
    })
    assert response.status_code == 200
    data = response.json()
    state = data["statevector"]
    for index, amplitude in enumerate(state):
        expected = 1.0 if index == 11 else 0.0
        assert amplitude["re"] == pytest.approx(expected, abs=1e-10)
        assert amplitude["im"] == pytest.approx(0.0, abs=1e-10)
    assert data["probabilities"]["1011"] == pytest.approx(1.0)
    assert sum(data["counts"].values()) == 2048


def test_non_binary_qpe_phase_has_normalized_distribution():
    phase = 0.3
    counting_qubits = 4
    operations = [{"name": "X", "qubit": 4}]
    operations.extend({"name": "H", "qubit": qubit} for qubit in range(counting_qubits))
    operations.extend({
        "name": "CP", "control": qubit, "target": 4,
        "theta": 2 * math.pi * phase * (2 ** qubit),
    } for qubit in range(counting_qubits))
    operations.extend([
        {"name": "SWAP", "first": 1, "second": 2},
        {"name": "SWAP", "first": 0, "second": 3},
        {"name": "H", "qubit": 0},
        {"name": "CP", "control": 0, "target": 1, "theta": -math.pi / 2},
        {"name": "CP", "control": 0, "target": 2, "theta": -math.pi / 4},
        {"name": "CP", "control": 0, "target": 3, "theta": -math.pi / 8},
        {"name": "H", "qubit": 1},
        {"name": "CP", "control": 1, "target": 2, "theta": -math.pi / 2},
        {"name": "CP", "control": 1, "target": 3, "theta": -math.pi / 4},
        {"name": "H", "qubit": 2},
        {"name": "CP", "control": 2, "target": 3, "theta": -math.pi / 2},
        {"name": "H", "qubit": 3},
    ])
    response = client.post("/execute", json={
        "num_qubits": 5, "operations": operations, "shots": 256
    })
    assert response.status_code == 200
    probabilities = response.json()["probabilities"]
    assert sum(probabilities.values()) == pytest.approx(1.0)
    assert probabilities["10101"] == max(probabilities.values())
