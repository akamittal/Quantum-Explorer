import React from "react";
import EducationHelp from "../EducationHelp";

/**
 * Production-Grade Qiskit Code Execution Reference Panel
 * Path: /frontend/src/components/single-qubit/QiskitConsole.jsx
 */
export default function QiskitConsole({ theta, phi }) {
  // Generate the dynamic Qiskit parameters string on the fly based on sandbox sliders
  const thetaRad = ((theta * Math.PI) / 180).toFixed(4);
  const phiRad = ((phi * Math.PI) / 180).toFixed(4);

  const qiskitCodeBlock = `from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# 1. Initialize a 1-Qubit Quantum Circuit Node
qc = QuantumCircuit(1)

# 2. Parameterize the State via U3 Rotation Gate 
# Formula: U3(theta, phi, lambda)
# Current angles: theta = ${theta}° (${thetaRad} rad), phi = ${phi}° (${phiRad} rad)
qc.u(${thetaRad}, ${phiRad}, 0, 0)

# 3. Extract the Underlying Hilbert State Vector Amplitudes
state = Statevector.from_instruction(qc)
print("State Vector (α, β):", state.data)

# 4. Append Measurement Operation to Collapse the Wavefunction
qc.measure_all()`;

  return (
    <section style={styles.contentSection}>
      <div style={styles.sectionTitleRow}>
        <h3 style={styles.sectionHeader}>// QISKIT CODE EXAMPLE</h3>
        <EducationHelp topic="qiskit" />
      </div>
      <p style={styles.paragraphText}>
        The exact, production-grade Python code to instantiate, parameterize,
        and analyze this identical system state vector using the{" "}
        <strong>IBM Qiskit SDK v1.x</strong> architecture:
      </p>

      <div style={styles.codeConsoleFrame}>
        <div style={styles.consoleHeaderTop}>
          <span style={styles.consoleTitle}>quantum_state_playground.py</span>
          <span style={styles.langBadge}>PYTHON // QISKIT</span>
        </div>
        <pre style={styles.codeDisplayArea}>{qiskitCodeBlock}</pre>
      </div>
    </section>
  );
}

const styles = {
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  sectionTitleRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.55rem" },
  sectionHeader: {
    color: "#10b981",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    letterSpacing: "0.12em",
    margin: 0,
  },
  paragraphText: {
    color: "#9ca3af",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    margin: 0,
  },
  codeConsoleFrame: {
    backgroundColor: "#050911",
    borderRadius: "6px",
    border: "1px solid rgba(6, 182, 212, 0.2)",
    overflow: "hidden",
    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.7)",
  },
  consoleHeaderTop: {
    backgroundColor: "#0b0f19",
    padding: "0.6rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  consoleTitle: {
    color: "#9ca3af",
    fontSize: "0.75rem",
    fontFamily: "monospace",
  },
  langBadge: {
    color: "#06b6d4",
    fontSize: "0.7rem",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  codeDisplayArea: {
    margin: 0,
    padding: "1.25rem",
    color: "#e5e7eb",
    fontFamily: "Consolas, Fira Code, Monaco, monospace",
    fontSize: "0.85rem",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    overflowX: "auto",
  },
};
