import React from "react";
import MathRenderer from "../../MathRenderer";

export default function ConceptHero() {
  return (
    <div style={styles.blockContainer}>
      {/* 1.0 THE CORE QUANTUM PARADIGM */}
      <section style={styles.contentSection}>
        <h2 style={styles.mainTitle}>
          Module 1.1: The Single Qubit & Spatial State Space
        </h2>
        <h3 style={styles.sectionHeader}>
          // 1.0 THE PHYSICAL CONCEPT OF A QUBIT
        </h3>
        <p style={styles.paragraphText}>
          A classical bit operates as an absolute discrete system—a microscopic
          transistor channel is either completely blocking current (Binary 0) or
          passing current (Binary 1).
        </p>
        <p style={styles.paragraphText}>
          A Quantum Bit, or <strong>qubit</strong>, breaks this classic paradigm
          by operating within a continuous, two-dimensional complex vector space
          called a <strong>Hilbert Space</strong>{" "}
          <MathRenderer
            formula="\mathcal{H}_{\mathbb{C}}^2"
            displayMode={false}
          />
          . This structural shift unlocks the property of linear{" "}
          <strong>Superposition</strong>, allowing the system to hold components
          of both computational realities simultaneously.
        </p>
        <div style={styles.thematicInsightBox}>
          <span style={styles.insightTitle}>THE ENTERPRISE ADVANTAGE</span>
          <p style={styles.insightContent}>
            By calculating through a continuum of states before measurement, a
            quantum architecture explores exponentially larger mathematical
            problem landscapes, serving as the foundational engine for
            accelerated cryptography and data systems.
          </p>
        </div>
      </section>

      {/* 2.0 THEParadox OF OBSERVATION */}
      <section style={styles.contentSection}>
        <h3 style={styles.sectionHeader}>
          // 2.0 THE PARADOX OF MEASUREMENT & WAVEFUNCTION COLLAPSE
        </h3>
        <p style={styles.paragraphText}>
          Superposition is a state of raw mathematical potential. It exists only
          as long as the system remains completely isolated from the
          environment.{" "}
          <strong>Superposition cannot be directly observed.</strong>
        </p>
        <p style={styles.paragraphText}>
          The split second an external physical instrument measures or interacts
          with the qubit, the wave function instantly <strong>collapses</strong>{" "}
          into a deterministic classical state of either 0 or 1. Which state it
          collapses into is entirely probabilistic, derived from the squared
          absolute values of the complex amplitudes:
        </p>
        <MathRenderer
          formula="\lvert\alpha\rvert^2 + \lvert\beta\rvert^2 = 1"
          displayMode={true}
        />
      </section>
    </div>
  );
}

const styles = {
  blockContainer: { display: "flex", flexDirection: "column", gap: "2.5rem" },
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  mainTitle: {
    color: "#f9fafb",
    fontSize: "1.4rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
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
  thematicInsightBox: {
    backgroundColor: "rgba(6, 182, 212, 0.03)",
    borderLeft: "3px solid #06b6d4",
    padding: "1rem 1.25rem",
    marginTop: "0.5rem",
  },
  insightTitle: {
    color: "#06b6d4",
    fontSize: "0.7rem",
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: "0.05em",
  },
  insightContent: {
    color: "#d1d5db",
    fontSize: "0.85rem",
    margin: "0.35rem 0 0 0",
    lineHeight: "1.5",
  },
};
