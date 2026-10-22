import React from "react";
import EducationHelp from "../EducationHelp";
import MathRenderer from "../../MathRenderer";

export default function ConceptHero() {
  return (
    <div style={styles.blockContainer}>
      <section style={styles.contentSection}>
        <h2 style={styles.mainTitle}>Module 1.1: Meet the Qubit</h2>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionHeader}>THE BASIC IDEA</h3>
          <EducationHelp topic="superposition" />
        </div>
        <p style={styles.paragraphText}>
          A <strong>qubit</strong> is the basic unit of quantum information. Like a classical bit, a measurement gives 0 or 1—but before measurement, its state can combine both possibilities.
        </p>
        <p style={styles.paragraphText}>
          We write a qubit's state as <MathRenderer formula="\\lvert\\psi\\rangle = \\alpha\\lvert0\\rangle + \\beta\\lvert1\\rangle" displayMode={false} />. The numbers α and β are called <strong>amplitudes</strong>; their squared magnitudes give the measurement probabilities.
          <EducationHelp topic="amplitude" label="Learn about quantum amplitudes" />
        </p>
        <div style={styles.thematicInsightBox}>
          <span style={styles.insightTitle}>TRY IT</span>
          <p style={styles.insightContent}>
            Move the amplitude slider below, apply a gate, and measure the qubit. Open an <strong>i</strong> icon whenever you want a short explanation.
          </p>
        </div>
      </section>
      <section style={styles.contentSection}>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionHeader}>WHAT DOES MEASUREMENT DO?</h3>
          <EducationHelp topic="measurement" />
        </div>
        <p style={styles.paragraphText}>
          Measurement turns the quantum state into a classical result—0 or 1. For a superposition, the outcome is probabilistic. Repeating the experiment helps us estimate the probabilities.
        </p>
        <MathRenderer formula="|\\alpha|^2 + |\\beta|^2 = 1" displayMode={true} />
      </section>
    </div>
  );
}

const styles = {
  blockContainer: { display: "flex", flexDirection: "column", gap: "2rem" },
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  mainTitle: { color: "#f9fafb", fontSize: "1.4rem", fontWeight: "700", margin: "0 0 0.5rem" },
  sectionTitleRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.55rem" },
  sectionHeader: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.12em", margin: 0 },
  paragraphText: { color: "#9ca3af", fontSize: "0.95rem", lineHeight: "1.65", margin: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.3rem" },
  thematicInsightBox: { backgroundColor: "rgba(6, 182, 212, 0.03)", borderLeft: "3px solid #06b6d4", padding: "1rem 1.25rem", marginTop: "0.5rem" },
  insightTitle: { color: "#06b6d4", fontSize: "0.7rem", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "0.05em" },
  insightContent: { color: "#d1d5db", fontSize: "0.85rem", margin: "0.35rem 0 0", lineHeight: "1.5" },
};
