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
- [x] **1.3 Multi-Qubit Matrix Operators & Phase Dynamics:** Full two-qubit 4×4 matrix derivations, tensor-lifted single-qubit gates, controlled-operator matrices, unitary norm proof, interactive complex-amplitude phase maps, relative-phase interference presets, editable gate sequences, and Qiskit verification.
- [x] **1.4 Quantum Entanglement Space:** Full derivations of separability, Bell-state preparation, partial trace, reduced density matrices, Schmidt decomposition, von Neumann entropy and concurrence; interactive verification of all four Bell states, Z/X-basis parity correlations, continuous Schmidt-angle entanglement, live complex-amplitude and density-matrix diagnostics, and Qiskit execution.

### 🧮 Module 2: Algebraic & Oracle-Based Algorithms

- [x] **2.1 Deutsch's Algorithm:** 1-bit balance vs. constant classification, black-box mathematical oracle matrix injection, and step-by-step global phase-kickback visual flowcharts.
- [x] **2.2 Deutsch–Jozsa Algorithm (three-input oracle):** Editable constant/balanced truth tables, reversible multi-controlled-X oracle synthesis, full Hadamard/phase-kickback derivation, exact output probabilities, and Qiskit execution.
- [x] **2.3 Bernstein–Vazirani Algorithm (three-bit hidden string):** Editable secret bits, reversible CNOT parity oracle, complete phase-kickback and Hadamard cancellation derivation, exact statevector recovery for all eight secrets, and Qiskit execution.

### 📊 Module 3: Advanced Transform & Number Theory Systems

- [x] **3.1 The Quantum Fourier Transform (QFT):** Exact discrete Fourier transform derivation, roots-of-unity and unitarity proofs, binary phase factorization, controlled-phase gate decomposition, bit-reversal swaps, inverse QFT, interactive complex phase spectrum, and Qiskit verification across 2–4 qubits. Mapping from spatial computational matrix amplitudes to phase frequency spectrum grids, optimized to run in O(n²) time blocks.
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

Quantum Explorer can execute circuits with a separate Python service powered by Qiskit and Qiskit Aer. **Three processes are involved when using the Qiskit button:**

1. React/Vite serves the browser application.
2. Node.js/Express exposes the `/api/qiskit/*` endpoints and forwards requests.
3. Python/FastAPI runs the circuit with Qiskit and Aer.

The browser calls Node.js, not Python directly. Keep all three processes running while using **Run on Qiskit · 1,000 shots**.

### 1. Install dependencies

Install Node.js 18 or newer and Python 3.10 or newer. From the repository root:

```bash
npm install
python -m venv .venv
```

Activate the Python virtual environment.

**Windows PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**
```bat
.venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source .venv/bin/activate
```

Install the Python dependencies (with the virtual environment activated):

```bash
pip install -r services/qiskit/requirements.txt
```

### 2. Start all services

Open three terminals from the repository root.

**Terminal 1 - Python Qiskit service:**

```bash
uvicorn app:app --app-dir services/qiskit --host 127.0.0.1 --port 8000
```

The service health endpoint is `http://127.0.0.1:8000/health`.

**Terminal 2 - Node.js backend and React frontend:**

```bash
npm run dev
```

This starts the Express API on `http://127.0.0.1:3000` and Vite on `http://localhost:5173`.

**Terminal 3 - Your browser:**

Open `http://localhost:5173`. Keep the first two terminals running. The Express backend uses `http://127.0.0.1:8000` as the default Python service address. If your Python service uses another address, set `QISKIT_SERVICE_URL` in the backend environment before starting Node.

If the Node backend is running on a port other than 3000, configure the Vite proxy target with `VITE_BACKEND_URL` (for example, `http://127.0.0.1:3001`) before starting the frontend.

### 3. Run a circuit

In the single-qubit module, add one or more gates using the **+ H**, **+ X**, **+ Y**, **+ Z**, **+ S**, or **+ T** controls in the **Compose a Circuit** section. Then click **Run on Qiskit · 1,000 shots**. The separate single-gate controls update the local demonstration state; they do not add gates to the Qiskit circuit queue.

In the multi-qubit module, add gates to the circuit using its gate controls, or load a preset such as **Load Bell state**. Then use the Qiskit execution panel.

In **Module 1.4: Quantum Entanglement Space**, select any of the four Bell states, switch between Z- and X-basis correlation checks, or move the Schmidt-angle slider to create a partially entangled state. The Qiskit panel executes the same preparation circuit and includes the basis-change gates selected for the measurement. The button remains disabled while the circuit is empty or a request is already running.

In **Module 3.1: Quantum Fourier Transform**, change the register size, select a computational-basis or superposition input, and compare forward and inverse transforms. The complex phase wheel displays the amplitude phases, while the Qiskit panel executes the matching Hadamard, controlled-phase and wire-swap circuit.

The Node backend exposes:

- `GET /api/qiskit/health` - checks whether the Python Qiskit service can be reached through Node.
- `POST /api/qiskit/execute` - executes a circuit and returns statevector amplitudes, exact probabilities, and sampled measurement counts.

You can check the complete connection in a browser by opening `http://localhost:3000/api/qiskit/health`. A healthy response should contain `"status":"ok"` and identify the Qiskit + Aer engine. If this endpoint reports that the service is unavailable, check that the Python terminal is still running and that `QISKIT_SERVICE_URL` points to it.

Example request body:

```json
{
  "num_qubits": 2,
  "operations": [
    { "name": "H", "qubit": 0 },
    { "name": "CX", "control": 0, "target": 1 }
  ],
  "shots": 1000
}
```

Supported gates are I/ID, H, X, Y, Z, S, T, RX, RY, RZ, CX/CNOT, CP (controlled phase), MCX (multi-controlled X), CZ, and SWAP. CP takes a finite phase angle in radians. Rotation angles are in radians. MCX operations provide a list of control-qubit indices and one distinct target-qubit index. The service currently limits circuits to 8 qubits, 256 operations, and 100,000 shots by default; limits can be lowered with `QISKIT_MAX_QUBITS` and `QISKIT_MAX_SHOTS`.

**Qubit ordering:** Qiskit uses q0 as the least-significant bit. Returned basis labels are displayed as `|q[n-1]...q1q0>`, so q0 is the rightmost bit.

### 4. Validate the Qiskit service

With the Python virtual environment activated:

```bash
cd services/qiskit
pytest -q
cd ../..
```

To cross-check the JavaScript single-qubit simulator against Qiskit, start the Python service in one terminal and run this from the repository root in another:

```bash
node scripts/qiskit-cross-check.mjs
```

The cross-check compares representative single-qubit circuits and allows physically irrelevant global phase while requiring matching state probabilities. CI runs these checks independently from the frontend browser tests.

## 🤖 AI Quantum Tutor

The AI Quantum Tutor is available from the single-qubit, multi-qubit, matrix/phase, entanglement, and algorithm workspaces through the **ASK AI TUTOR** control. It sends the current module and relevant simulator snapshot with the learner's question, so explanations can refer to the selected oracle, gate sequence, amplitudes, probabilities, Bloch coordinates, and other available state.

### Configure the AI provider

The AI provider is called only by the Node backend. The Gemini API key must never be placed in frontend environment variables, exposed in browser code, or committed to source control.

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with your Google account.
2. Select **Create API key** and follow the prompts to create a key for a Google Cloud project.
3. Copy the generated key. Treat it like a password; do not paste it into source files, screenshots, issues, or chat conversations.
4. From the repository root, copy `backend/.env.example` to `backend/.env`.
   - PowerShell: `Copy-Item backend/.env.example backend/.env`
   - macOS/Linux: `cp backend/.env.example backend/.env`
5. Open `backend/.env` and replace the placeholder with your key:
   `GEMINI_API_KEY=your-actual-api-key`
6. Set `GEMINI_MODEL=gemini-3.8-flash`. If you already created `backend/.env` during the earlier tutor setup, update the existing value there; changing `.env.example` does not change your local `.env`.
7. Optionally set `GEMINI_TIMEOUT_MS=90000` (the backend allows up to 180 seconds) if you need a longer response window. The tutor uses a low thinking level to reduce unnecessary latency.
8. Restart the Node backend so it loads the new environment variables.

The `.env` file is ignored by Git. Do not remove it from `.gitignore`, and never commit the real key. If a key is accidentally exposed, revoke it in Google AI Studio and create a replacement.

Example backend environment:

```dotenv
GEMINI_API_KEY=your-google-ai-studio-key
GEMINI_MODEL=gemini-3.8-flash
```

The chat endpoint is `POST /api/ai/chat`. It accepts a question, bounded conversation history, and lesson/simulator context. Requests are limited to 20 per IP address per minute in this initial implementation. The tutor does not execute code or change the simulator; use the Qiskit execution panel for actual circuit execution.

**Data handling:** Questions, the recent conversation sent with the request, and the supplied lesson/simulator context are sent from the backend to Google's Gemini API to generate a reply. The current implementation keeps chat history in frontend memory only; it is not saved to a Quantum Explorer database. Do not submit passwords, API keys, or other secrets in tutor conversations. Google's API terms and data handling policies apply to provider requests.

The AI Tutor supports screenshot input: drag a PNG/JPEG/WebP/GIF into the tutor panel, click the screenshot drop area to browse, or paste an image with Ctrl+V. Add a question or send the default request to have Gemini inspect the image alongside the current lesson/simulator context. Screenshots are limited to 6 MB. The provider request timeout defaults to 90 seconds and can be adjusted with `GEMINI_TIMEOUT_MS` (10–180 seconds).

---

## 📜 License

This project is licensed under the MIT License.
