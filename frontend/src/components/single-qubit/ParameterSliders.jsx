import React from "react";

export default function ParameterSliders({
  theta,
  phi,
  onAngleSliderAdjustment,
}) {
  return (
    <section style={styles.contentSection}>
      <h3 style={styles.sectionHeader}>
        // 4.0 REAL-TIME PARAMETER AGENT (PLAYGROUND)
      </h3>
      <div style={styles.sliderWorkspace}>
        <div style={styles.sliderRow}>
          <div style={styles.sliderHeaderMeta}>
            <span style={styles.sliderName}>
              POLAR ANGLE (θ - VERTICAL TILT)
            </span>
            <span style={styles.sliderValueDisplay}>{theta}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            value={theta}
            onChange={(e) =>
              onAngleSliderAdjustment("theta", parseInt(e.target.value))
            }
            style={styles.htmlSliderInput}
          />
        </div>
        <div style={styles.sliderRow}>
          <div style={styles.sliderHeaderMeta}>
            <span style={styles.sliderName}>
              AZIMUTHAL PHASE ANGLE (φ - HORIZONTAL PHASING)
            </span>
            <span style={styles.sliderValueDisplay}>{phi}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={phi}
            onChange={(e) =>
              onAngleSliderAdjustment("phi", parseInt(e.target.value))
            }
            style={styles.htmlSliderInput}
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
  sliderWorkspace: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    backgroundColor: "#0b0f19",
    padding: "1.5rem",
    borderRadius: "4px",
  },
  sliderRow: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  sliderHeaderMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderName: {
    color: "#e5e7eb",
    fontSize: "0.75rem",
    fontFamily: "monospace",
  },
  sliderValueDisplay: {
    color: "#06b6d4",
    fontSize: "0.85rem",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  htmlSliderInput: { width: "100%", accentColor: "#10b981", cursor: "pointer" },
};
