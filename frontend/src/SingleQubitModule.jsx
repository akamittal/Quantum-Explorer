import React from "react";
import ConceptHero from "./components/single-qubit/ConceptHero";
import AmplitudeSandbox from "./components/single-qubit/AmplitudeSandbox";
import ParameterSliders from "./components/single-qubit/ParameterSliders";
import TelemetryTracer from "./components/single-qubit/TelemetryTracer";
import QiskitConsole from "./components/single-qubit/QiskitConsole";
import { getMeasurementProbabilities } from "./quantumMath";

export default function SingleQubitModule({
  stateVariables,
  onAngleSliderAdjustment,
  onAlphaInputChange,
  onGateApply,
}) {
  const { theta, phi, x, y, z, alpha, beta } = stateVariables;
  const probabilities = getMeasurementProbabilities(alpha, beta);
  const probZero = probabilities.zero * 100;
  const probOne = probabilities.one * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      <ConceptHero />
      <AmplitudeSandbox alpha={alpha} beta={beta} onAlphaInputChange={onAlphaInputChange} />

      <section style={styles.gateSection}>
        <h3 style={styles.sectionHeader}>// 4.0 APPLY A SINGLE-QUBIT GATE</h3>
        <p style={styles.helpText}>
          Apply a gate to the current state. The amplitudes, probability readout,
          and Bloch vector update together.
        </p>
        <div style={styles.gateRow}>
          {[
            ["H", "Hadamard"],
            ["X", "Pauli-X"],
            ["Z", "Pauli-Z"],
            ["RESET", "Reset to |0⟩"],
          ].map(([gate, label]) => (
            <button key={gate} type="button" onClick={() => onGateApply?.(gate)} disabled={!onGateApply} style={styles.gateButton}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <ParameterSliders theta={theta} phi={phi} onAngleSliderAdjustment={onAngleSliderAdjustment} />
      <TelemetryTracer theta={theta} phi={phi} x={x} y={y} z={z} alpha={alpha} beta={beta} probZero={probZero} probOne={probOne} />
      <QiskitConsole theta={theta} phi={phi} />
    </div>
  );
}

const styles = {
  gateSection: { display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem", backgroundColor: "#0b0f19", border: "1px solid rgba(6,182,212,0.15)", borderRadius: "4px" },
  sectionHeader: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.08em", margin: 0 },
  helpText: { color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 },
  gateRow: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  gateButton: { background: "#111827", border: "1px solid rgba(6,182,212,0.35)", color: "#e5e7eb", padding: "0.65rem 0.85rem", borderRadius: "4px", fontFamily: "monospace", cursor: "pointer" },
};
