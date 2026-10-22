import React from "react";
import MathRenderer from "../../MathRenderer";
import EducationHelp from "../EducationHelp";

export default function AmplitudeSandbox({ alpha, beta, onAlphaInputChange }) {
  return (
    <section style={styles.contentSection}>
      <div style={styles.sectionTitleRow}>
        <h3 style={styles.sectionHeader}>// 3.0 EXPLORE AMPLITUDES</h3>
        <EducationHelp topic="amplitude" />
      </div>
      <p style={styles.paragraphText}>
        Move the slider to change the |0⟩ amplitude. The |1⟩ amplitude adjusts so the two probabilities still add up to 100%:
      </p>

      <div style={styles.amplitudePlaygroundSliderBox}>
        <div style={styles.sliderHeaderMeta}>
          <span style={styles.amplitudeInputLabel}>
            EDIT REAL VALUE α (|0⟩ Coefficient)
          </span>
          <span style={styles.amplitudeInputValue}>{alpha.re.toFixed(4)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.0001"
          value={alpha.re}
          onChange={(e) => onAlphaInputChange(parseFloat(e.target.value))}
          style={styles.htmlSliderInput}
        />
      </div>

      <div style={styles.mathBlock}>
        <span style={styles.liveStateLabel}>// STATE DECOMPOSITION CORE:</span>
        <MathRenderer
          formula={`\\alpha = ${alpha.re.toFixed(4)}`}
          displayMode={false}
        />
        <MathRenderer
          formula={`\\beta = ${beta.im.toFixed(4)}i`}
          displayMode={false}
        />

        <div style={styles.dividerLine}>
          <MathRenderer
            formula="\(\lvert\Psi\rangle = \alpha\lvert0\rangle + \beta\lvert1\rangle\)"
            displayMode={true}
          />
          <MathRenderer
            formula={`= ${alpha.re.toFixed(4)}\\lvert0\\rangle + ${beta.im.toFixed(4)}i\\lvert1\\rangle`}
            displayMode={true}
          />
        </div>

        <div style={styles.dividerLine}>
          <MathRenderer
            formula="\(\text{Normalization} = \lvert\alpha\rvert^2 + \lvert\beta\rvert^2 = 1\)"
            displayMode={true}
          />
          <MathRenderer
            formula={`= (${alpha.re.toFixed(4)})^2 + (${beta.im.toFixed(4)})^2 = 1.0000`}
            displayMode={true}
          />
        </div>
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
  amplitudePlaygroundSliderBox: {
    backgroundColor: "#0b0f19",
    padding: "1.25rem",
    borderRadius: "4px",
    border: "1px solid rgba(6,182,212,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  amplitudeInputLabel: {
    color: "#e5e7eb",
    fontSize: "0.75rem",
    fontFamily: "monospace",
  },
  amplitudeInputValue: {
    color: "#10b981",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  htmlSliderInput: { width: "100%", accentColor: "#10b981", cursor: "pointer" },
  liveStateLabel: {
    color: "#6b7280",
    fontSize: "0.7rem",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
    display: "block",
    marginBottom: "0.5rem",
  },
  mathBlock: {
    backgroundColor: "#0b0f19",
    padding: "1.5rem",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  dividerLine: {
    marginTop: "1.5rem",
    borderTop: "1px solid rgba(255,255,255,0.02)",
    paddingTop: "1rem",
  },
};
