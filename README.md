# 🚀 Quantum Explorer

An industry-grade, interactive full-stack monorepo designed to visually simulate, derive, and analyze the complete landscape of quantum algorithms and quantum error correction frameworks.

Author: **Akash Mittal**

---

## 🏛️ Architecture Overview

The platform is designed around a decoupled, performance-focused monorepo pattern using **npm Workspaces**:

*   **`/frontend`**: A sub-millisecond Hot-Module Replacement web engine built with **Vite, React, and TailwindCSS**. Real-time multidimensional states are simulated via **Three.js** and **React Three Fiber (R3F)** to render interactive 3D Bloch Spheres and lattice planes.
*   **`/backend`**: A decoupled mathematical processing engine built on **Node.js, Express, and Math.js** to handle complex numbers, Kronecker tensor products, and high-dimensional unitary linear transformations.

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

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for parameters.
