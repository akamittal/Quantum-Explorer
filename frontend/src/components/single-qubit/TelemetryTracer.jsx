import React from "react";
import MathRenderer from "../../MathRenderer";
import EducationHelp from "../EducationHelp";

export default function TelemetryTracer({
  theta,
  phi,
  x,
  y,
  z,
  alpha,
  beta,
  probZero,
  probOne,
}) {
  return (
    <section style={styles.contentSection}>
      <h3 style={styles.sectionHeader}>
        // 5.0 LIVE STEP-BY-STEP BREAKDOWN TELEMETRY
      </h3>

      {/* STEP 1 Block */}
      <div style={styles.mathStepCard}>
        <span style={styles.stepTitle}>
          [STEP 1] State Vector Parametrization
        </span>
        <EducationHelp topic="angles" />
        <p style={styles.stepExplanationText}>
          A qubit's state can be described by its amplitudes or by two angles. Theta (θ) sets the vertical position; phi (φ) sets the direction around the sphere:
        </p>
        <div style={styles.mathOutputArea}>
          <MathRenderer
            formula="\\(\\lvert\\Psi\\rangle = \\cos(\\theta/2)\\lvert0\\rangle + e^{i\\phi}\\sin(\\theta/2)\\lvert1\\rangle\\)"
            displayMode={true}
          />
          <MathRenderer
            formula={`= \\cos(${theta}^\\circ/2)\\lvert0\\rangle + e^{i\\cdot ${phi}^\\circ}\\sin(${theta}^\\circ/2)\\lvert1\\rangle`}
            displayMode={true}
          />
          <MathRenderer
            formula={`= ${alpha.re.toFixed(4)}\\lvert0\\rangle + (${beta.re.toFixed(4)} + ${beta.im.toFixed(4)}i)\\lvert1\\rangle`}
            displayMode={true}
          />
        </div>
      </div>

      {/* STEP 2 Block */}
      <div style={styles.mathStepCard}>
        <span style={styles.stepTitle}>
          [STEP 2] Measurement Probabilities
        </span>
        <EducationHelp topic="measurement" />
        <p style={styles.stepExplanationText}>
          Square the size of each amplitude to find the chance of measuring 0 or 1. These probabilities add up to 100% for a valid qubit state:
        </p>
        <div style={styles.mathOutputArea}>
          <MathRenderer
            formula={`\\text{P}(0) = \\lvert\\alpha\\rvert^2 = (${alpha.re.toFixed(4)})^2 + (${alpha.im.toFixed(4)})^2 = ${probZero.toFixed(1)}\\%`}
            displayMode={true}
          />
          <div style={{ margin: "0.25rem 0" }} />
          <MathRenderer
            formula={`\\text{P}(1) = \\lvert\\beta\\rvert^2 = (${beta.re.toFixed(4)})^2 + (${beta.im.toFixed(4)})^2 = ${probOne.toFixed(1)}\\%`}
            displayMode={true}
          />
        </div>
      </div>

      {/* STEP 3 Block */}
      <div style={styles.mathStepCard}>
        <span style={styles.stepTitle}>
          [STEP 3] Bloch-Sphere Coordinates
        </span>
        <EducationHelp topic="bloch" />
        <p style={styles.stepExplanationText}>
          These three coordinates locate the qubit on the Bloch sphere. They give us a visual way to see how the state changes when a gate is applied:
        </p>
        <div style={styles.mathOutputArea}>
          <MathRenderer
            formula={`x = \\sin(\\theta)\\cos(\\phi) = \\sin(${theta}^\\circ)\\cos(${phi}^\\circ) = ${x.toFixed(4)}`}
            displayMode={true}
          />
          <div style={{ margin: "0.35rem 0" }} />
          <MathRenderer
            formula={`y = \\sin(\\theta)\\sin(\\phi) = \\sin(${theta}^\\circ)\\sin(${phi}^\\circ) = ${y.toFixed(4)}`}
            displayMode={true}
          />
          <div style={{ margin: "0.35rem 0" }} />
          <MathRenderer
            formula={`z = \\cos(\\theta) = \\cos(${theta}^\\circ) = ${z.toFixed(4)}`}
            displayMode={true}
          />
        </div>
      </div>
    </section>
  );
}

const styles = {
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  sectionHeader: {
    color: "#10b981",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    letterSpacing: "0.12em",
    margin: 0,
  },
  mathStepCard: {
    backgroundColor: "#0b0f19",
    padding: "1.5rem",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  stepTitle: {
    color: "#06b6d4",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  stepExplanationText: {
    color: "#9ca3af",
    fontSize: "0.875rem",
    lineHeight: "1.5",
    margin: 0,
  },
  mathOutputArea: {
    borderTop: "1px solid rgba(255,255,255,0.02)",
    paddingTop: "0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
};
