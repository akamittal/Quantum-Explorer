# 🚀 Quantum Explorer

An industry-grade, interactive full-stack monorepo designed to visually simulate, derive, and analyze the complete landscape of quantum algorithms and quantum error correction frameworks.

Author: **Akash Mittal**

---

## 🏛️ Architecture Overview

The platform is designed around a decoupled, performance-focused monorepo pattern using **npm Workspaces**:

- **`/frontend`**: A sub-millisecond Hot-Module Replacement web engine built with **Vite, React, and TailwindCSS**. Real-time multidimensional states are simulated via **Three.js** and **React Three Fiber (R3F)** to render interactive 3D Bloch Spheres and lattice planes.
- **`/backend`**: A decoupled mathematical processing engine built on **Node.js, Express, and Math.js** to handle complex numbers, Kronecker tensor products, and high-dimensional unitary linear transformations.

---

## 🎯 Strategic Product Scope & Roadmap Tracker

Below is the verified master engineering catalog of the platform. Items marked with `[x]` represent completed modules pushed to the main production branch.

### 🧪 Module 1: The Qubit Foundations & State Mechanics

- [x] **1.1 Immersive Quantum Entrance Portal:** Math-driven GPU accelerated particle background, synchronized text alignment cadence, global Sanskrit/IAST Romanization, and user access override tokens.
- [x] **1.2 The Single Qubit Studio & Bloch Sphere Viewport:** Split-view dashboard workspace hosting formal linear algebra derivations, live complex amplitude telemetry tracking (α, β), and a real-time responsive 3D vector arrow visualization engine.
- [ ] **1.3 Multi-Qubit Matrix Operators & Phase Dynamics:** Real-time multi-qubit state space grids, complex multi-gate pulse overrides, and interactive 3D Wavefunction Phase-Bar configurations.
- [ ] **1.4 Quantum Entanglement Space:** Non-local connection modeling, visual verification pipelines for all 4 fundamental **Bell States**, and Entanglement Entropy numerical readouts.

### 🧮 Module 2: Algebraic & Oracle-Based Algorithms

- [ ] **2.1 Deutsch's Algorithm:** 1-bit balance vs. constant classification, black-box mathematical oracle matrix injection, and step-by-step global phase-kickback visual flowcharts.
- [ ] **2.2 Deutsch-Jozza Algorithm:** Scaling oracle evaluation up to n-bit input fields, proving exponential quantum query reduction.
- [ ] **2.3 Bernstein-Vazirani Algorithm:** Hidden parity string bitstring extraction in exactly 1 quantum pass vs. n classical passes.

### 📊 Module 3: Advanced Transform & Number Theory Systems

- [ ] **3.1 The Quantum Fourier Transform (QFT):** Mapping from spatial computational matrix amplitudes to phase frequency spectrum grids, optimized to run in O(n²) time blocks.
- [ ] **3.2 Quantum Phase Estimation (QPE):** Unitary matrix eigenvalue digital extractor subsystem layout.
- [ ] **3.3 Shor's Factoring Cryptanalysis Framework:** High-dimensional mathematical spiral engine visually demonstrating period-finding mechanics to audit RSA architecture safety keys.

### 🎯 Module 4: Geometric Search & Amplitude Amplification

- [ ] **4.1 Grover's Database Search Algorithm:** Quadratic unstructured database query optimizer with 3D geometric state subspace vector tilting animations.
- [ ] **4.2 Quantum Counting System:** Hybrid algorithm combining Grover iterations with QPE tracking parameters.

### 🔬 Module 5: Near-Term NISQ Era & Variational Hybrid Networks

- [ ] **5.1 Variational Quantum Eigensolver (VQE):** 3D Molecular Potential Energy Surface optimization tracking landscape.
- [ ] **5.2 Quantum Approximate Optimization Algorithm (QAOA):** Combinatorial NP-hard logistical graph path solvers.

### 🧠 Module 6: Quantum Machine Learning (QML) Architectures

- [ ] **6.1 The HHL Linear Matrix Equation Solver:** Exponentially accelerated system mapping workspace for massive datasets (Ax = b).
- [ ] **6.2 Quantum Support Vector Machines (QSVM):** Projecting scattered multi-dimensional inputs onto a 3D separating quantum feature hyperplane grid.

### 🛡️ Module 7: Fault-Tolerant Quantum Error Correction (QEC)

- [ ] **7.1 The 3-Qubit Repetition Code Ensembles:** Multi-physical qubit mapping matrices to isolate and resolve live X/Z hardware noise.
- [ ] **7.2 Topological Surface Code Crystals:** Interactive, rotating 2D/3D crystal vertex grid arrays simulating real-time syndrome error path calculations and stabilizer field fixes.

---

## ⚡ Quick Start & Environmental Bootstrapping

Ensure you have [Node.js (v18+)](https://nodejs.org) installed on your machine.

### 1. Installation

Clone the repository and install all localized and global package dependencies using the single root workspace engine:

```bash
npm install
```

### 2. Execution

Spin up both the Node.js backend computational engine and the Vite local frontend preview server concurrently using our centralized workspace route:

```bash
npm run dev
```

The application will launch on your local interface nodes (Frontend: `http://localhost:5173`, Backend: `http://localhost:3000`).

---


## Qiskit execution service

Quantum Explorer can execute circuits through a separate Python service using Qiskit and Qiskit Aer. The browser talks only to the existing Express backend; the Express server forwards requests to the private Qiskit service. The Python service is not exposed directly to the browser.

### Start the services locally

Install the JavaScript workspace dependencies:

```bash
npm install
```

Start the Qiskit service in a separate terminal:

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r services/qiskit/requirements.txt
uvicorn app:app --app-dir services/qiskit --host 127.0.0.1 --port 8000
```

Start the existing Node backend and frontend as usual:

```bash
npm run dev
```

Configure the Express-to-Qiskit connection with `QISKIT_SERVICE_URL=http://127.0.0.1:8000` in the backend environment when using a non-default address. The Node backend exposes:

- `GET /api/qiskit/health` to check service availability.
- `POST /api/qiskit/execute` to execute a circuit and return statevector amplitudes, exact probabilities, and sampled measurement counts.

Example request body:

```json
{
  "num_qubits": 1,
  "operations": [
    { "name": "H", "qubit": 0 },
    { "name": "RY", "qubit": 0, "theta": 0.4 }
  ],
  "shots": 2048
}
```

Supported gates are I, H, X, Y, Z, S, T, RX, RY, RZ, and CX/CNOT. Rotation angles are in radians. The service currently limits circuits to 8 qubits, 256 operations, and 100,000 shots by default; limits can be lowered with `QISKIT_MAX_QUBITS` and `QISKIT_MAX_SHOTS`.

**Qubit ordering:** Qiskit uses q0 as the least-significant bit. Returned basis labels are displayed as `|q[n-1]...q1q0>`, so q0 is the rightmost bit. The response includes this convention explicitly.

### Validate both engines

Run the service unit tests and JavaScript-to-Qiskit statevector cross-check:

```bash
cd services/qiskit
pytest -q
cd ../..
uvicorn app:app --host 127.0.0.1 --port 8000
# In another terminal, from the repository root:
node scripts/qiskit-cross-check.mjs
```

The cross-check compares seven representative single-qubit circuits and allows physically irrelevant global phase while requiring matching state probabilities. CI runs these checks independently from the frontend browser tests.

## 📜 License

This project is licensed under the MIT License.
