import React from "react";
import EducationHelp from "../EducationHelp";
import MathRenderer from "../../MathRenderer";

export default function ConceptHero() {
  return (
    <div style={styles.blockContainer}>
      <section style={styles.contentSection}>
        <h2 style={styles.mainTitle}>Chapter 1: Why quantum computing?</h2>
        <p style={styles.paragraphText}>
          Your phone and laptop use ordinary computers. They are amazing at sending messages, running games and storing photos. But nature has a difficult side: working out how atoms and molecules behave can be incredibly hard for ordinary computers.
        </p>
        <p style={styles.paragraphText}>
          Scientists are building <strong>quantum computers</strong> to explore some of these problems in a different way. They will not make every task faster, and today's machines are still developing—but they may help us understand new materials, chemistry and other tough problems.
        </p>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionHeader}>FIRST, MEET THE BIT</h3>
          <EducationHelp topic="bit" />
        </div>
        <p style={styles.paragraphText}>
          An ordinary computer stores information using <strong>bits</strong>. Imagine a tiny switch: it is OFF (0) or ON (1). Everything from photos to videos is built from lots of these simple 0s and 1s.
        </p>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionHeader}>NOW, MEET THE QUBIT</h3>
          <EducationHelp topic="qubit" />
        </div>
        <p style={styles.paragraphText}>
          A quantum computer uses <strong>qubits</strong>. Like a bit, a qubit gives us 0 or 1 when we measure it. But before we measure it, a qubit can be prepared in a quantum state that gives different chances of seeing those answers.
        </p>
        <p style={styles.paragraphText}>
          Imagine a spinning coin: while it spins, the simple heads-or-tails picture doesn't tell the whole story. A qubit isn't literally a spinning coin, but the comparison helps us picture why it is different from an ordinary bit.
        </p>
        <div style={styles.sectionTitleRow}>
          <h3 style={styles.sectionHeader}>A FIRST LOOK AT THE SYMBOLS</h3>
          <EducationHelp topic="amplitude" />
        </div>
        <p style={styles.paragraphText}>
          Scientists write a qubit's state like this:
        </p>
        <MathRenderer formula="\lvert\psi\rangle = \alpha\lvert0\rangle + \beta\lvert1\rangle" displayMode={true} />
        <p style={styles.paragraphText}>
          You don't need to memorise this. For now, just know that α and β help describe the chances of seeing 0 or 1. We'll explore those chances using the controls below.
        </p>
        <div style={styles.thematicInsightBox}>
          <span style={styles.insightTitle}>YOUR FIRST EXPERIMENT</span>
          <p style={styles.insightContent}>
            Change the qubit, try a gate, and measure it. Open any <strong>i</strong> icon for a friendly explanation. You can learn the symbols as you go.
          </p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  blockContainer: { display: "flex", flexDirection: "column", gap: "2rem" },
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  mainTitle: { color: "#f9fafb", fontSize: "1.4rem", fontWeight: "700", margin: "0 0 0.5rem" },
  sectionTitleRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.5rem" },
  sectionHeader: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.1em", margin: 0 },
  paragraphText: { color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.75", margin: 0, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.3rem" },
  thematicInsightBox: { backgroundColor: "rgba(6, 182, 212, 0.06)", borderLeft: "3px solid #06b6d4", padding: "1rem 1.25rem", marginTop: "0.5rem" },
  insightTitle: { color: "#06b6d4", fontSize: "0.7rem", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "0.05em" },
  insightContent: { color: "#e2e8f0", fontSize: "0.9rem", margin: "0.35rem 0 0", lineHeight: "1.6" },
};
