import React, { useState } from "react";
import ConceptHero from "./components/single-qubit/ConceptHero";
import GateMatrixGuide from "./components/single-qubit/GateMatrixGuide";
import AmplitudeSandbox from "./components/single-qubit/AmplitudeSandbox";
import ParameterSliders from "./components/single-qubit/ParameterSliders";
import TelemetryTracer from "./components/single-qubit/TelemetryTracer";
import QiskitConsole from "./components/single-qubit/QiskitConsole";
import { getMeasurementProbabilities } from "./quantumMath";

const COMPOSER_GATES = ["H", "X", "Y", "Z", "S", "T"];

export default function SingleQubitModule({
  stateVariables,
  onAngleSliderAdjustment,
  onAlphaInputChange,
  onGateApply,
  onCircuitRun,
  onMeasureShots,
  measurementResult,
}) {
  const { theta, phi, x, y, z, alpha, beta } = stateVariables;
  const [queuedGates, setQueuedGates] = useState([]);
  const probabilities = getMeasurementProbabilities(alpha, beta);
  const probZero = probabilities.zero * 100;
  const probOne = probabilities.one * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      <ConceptHero />
      <GateMatrixGuide />
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

      <section style={styles.gateSection}>
        <h3 style={styles.sectionHeader}>// 4.1 COMPOSE A CIRCUIT</h3>
        <p style={styles.helpText}>
          Add gates in order, then run the whole circuit from |0⟩. The circuit engine
          applies each unitary operation to the previous state.
        </p>
        <div style={styles.gateRow}>
          {COMPOSER_GATES.map((gate) => (
            <button
              key={gate}
              type="button"
              style={styles.gateButton}
              onClick={() => setQueuedGates((current) => [...current, gate])}
            >
              + {gate}
            </button>
          ))}
        </div>
        <div style={styles.circuitSequence} aria-live="polite">
          {queuedGates.length ? queuedGates.join(" → ") : "Your circuit is empty"}
        </div>
        <div style={styles.gateRow}>
          <button
            type="button"
            style={styles.primaryButton}
            disabled={!queuedGates.length || !onCircuitRun}
            onClick={() => onCircuitRun?.(queuedGates.map((name) => ({ name })))}
          >
            Run circuit from |0⟩
          </button>
          <button type="button" style={styles.gateButton} onClick={() => setQueuedGates([])}>
            Clear circuit
          </button>
        </div>
      </section>

      <section style={styles.gateSection}>
        <h3 style={styles.sectionHeader}>// 4.2 MEASUREMENT SHOTS</h3>
        <p style={styles.helpText}>
          Sample the current state 100 times in the computational basis. Counts vary
          between runs, while the underlying probabilities are determined by the state.
        </p>
        <button type="button" style={styles.primaryButton} onClick={() => onMeasureShots?.(100)} disabled={!onMeasureShots}>
          Measure 100 shots
        </button>
        {measurementResult && (
          <div style={styles.measurementResult} aria-live="polite">
            <strong>Observed counts</strong>
            <span>|0⟩: {measurementResult.zero} ({(measurementResult.zero / measurementResult.shots * 100).toFixed(1)}%)</span>
            <span>|1⟩: {measurementResult.one} ({(measurementResult.one / measurementResult.shots * 100).toFixed(1)}%)</span>
            <span style={styles.mutedText}>
              Expected: P(0) {(measurementResult.probabilityZero * 100).toFixed(1)}% · P(1) {(measurementResult.probabilityOne * 100).toFixed(1)}%
            </span>
          </div>
        )}
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
  primaryButton: { background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.6)", color: "#d1fae5", padding: "0.65rem 0.85rem", borderRadius: "4px", fontFamily: "monospace", cursor: "pointer" },
  circuitSequence: { minHeight: "2.5rem", display: "flex", alignItems: "center", padding: "0.75rem", background: "#030712", border: "1px dashed rgba(6,182,212,0.25)", color: "#67e8f9", fontFamily: "monospace", overflowWrap: "anywhere" },
  measurementResult: { display: "flex", flexDirection: "column", gap: "0.4rem", padding: "0.75rem", background: "#030712", color: "#e5e7eb", fontFamily: "monospace", fontSize: "0.85rem" },
  mutedText: { color: "#9ca3af", fontSize: "0.75rem", lineHeight: 1.5 },
};
