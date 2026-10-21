# Module 1.2: Single-Qubit Unitary Matrix Operators

## 🏛️ 1.0 What is a Quantum Gate?

In classical architectures, logic gates (such as `NOT`, `AND`, `OR`) manipulate electrical voltage potentials representing discrete binary states (`0` or `1`) via physical transistor switches.

A Quantum Gate does not switch transistors. Because a qubit occupies a continuous wave profile inside a **Hilbert Space**, a quantum gate is a physical, non-destructive **geometric rotation** applied to the system's probability cloud.

### The Unitary Preservation Law

Classical gates like `AND` or `OR` are lossy—you cannot reconstruct two initial inputs from a single `0` output. Quantum mechanics mandates that all physical state transformations must be perfectly reversible. Therefore, every quantum gate is represented by a **Unitary Matrix** (U), satisfying the condition:
\[U^\dagger U = I\]

This mathematical property guarantees that applying a gate acts as a pure geometric rotation. It preserves the inner product (angles between states) and maintains the total system probability at exactly 100% (|α|² + |β|² = 1), ensuring no quantum information is leaked or destroyed.

## 🧮 2.0 Vector Representations & Linear State Space Mapping

To perform linear algebra on a qubit, we map its basis states to orthonormal column vectors:

- **The Ground State (\(\vert0\rangle\)):** \[\begin{bmatrix} 1 \\ 0 \end{bmatrix}\] \(\implies\) 100% chance of measuring 0.
- **The Excited State (\(\vert1\rangle\)):** \[\begin{bmatrix} 0 \\ 1 \end{bmatrix}\] \(\implies\) 100% chance of measuring 1.

When writing a general superposition state vector \(\vert\Psi\rangle = \alpha\vert0\rangle + \beta\vert1\rangle\), we are executing a vector addition:
\[\vert\Psi\rangle = \alpha \begin{bmatrix} 1 \\ 0 \end{bmatrix} + \beta \begin{bmatrix} 0 \\ 1 \end{bmatrix} = \begin{bmatrix} \alpha \\ \beta \end{bmatrix}\]

### Tracing the Superposition Fraction Allocation

When a Hadamard (H) gate acts on a ground state vector, it yields the state:
\[\frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 1 \end{bmatrix} = \begin{bmatrix} \frac{1}{\sqrt{2}} \\ \frac{1}{\sqrt{2}} \end{bmatrix}\]

Expanding this back into basis components via linear vector decomposition proves how the vector splits:
\[\begin{bmatrix} \frac{1}{\sqrt{2}} \\ \frac{1}{\sqrt{2}} \end{bmatrix} = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 \\ 0 \end{bmatrix} + \frac{1}{\sqrt{2}}\begin{bmatrix} 0 \\ 1 \end{bmatrix} = \frac{\vert0\rangle + \vert1\rangle}{\sqrt{2}} = \vert+\rangle\]

## ⚡ 3.0 The Unitary Gate Operator Catalog

- **Hadamard (H):** Rotates the vector 180° around the diagonal X+Z axis. It acts as the randomness engine, shifting certain computational bases into a 50/50 superposition.
  \[H = \frac{1}{\sqrt{2}}\begin{bmatrix} 1 & 1 \\ 1 & -1 \end{bmatrix}\]
- **Pauli-X (X):** Rotates the vector 180° around the horizontal X-axis. It acts as the quantum `NOT` gate, flipping state amplitudes completely (\(\vert0\rangle \leftrightarrow \vert1\rangle\)).
  \[X = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix}\]
- **Pauli-Z (Z):** Rotates the vector 180° around the vertical Z-axis. It acts as a phase-flip engine, inverting the sign of the relative phase angle without changing measurement probabilities.
  \[Z = \begin{bmatrix} 1 & 0 \\ 0 & -1 \end{bmatrix}\]
