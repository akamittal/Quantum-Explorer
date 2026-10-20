import React from "react";

export default function QuantumWorkspaceLayout({
  LeftContent,
  RightContent,
  onToggleMenu,
  menuOpenText,
}) {
  return (
    <div style={styles.workspaceViewport}>
      {/* LINKED TELEMETRY HEADER NAVIGATION BAR */}
      <header style={styles.telemetryHeader}>
        <div style={styles.headerLeft}>
          {/* Integrated menu action token component follows strict grid layout bounds */}
          <button onClick={onToggleMenu} style={styles.integratedMenuButton}>
            {menuOpenText}
          </button>
          <span style={styles.pulseIndicator} />
          <span style={styles.systemTitle}>
            QUANTUM ENGINE // MAIN CONTAINER WORKSPACE
          </span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.telemetryTag}>HILBERT CONFIG: M1.1 ACTIVE</span>
          <span style={styles.telemetryTag}>FLOAT TOLERANCE: 1e-5</span>
        </div>
      </header>

      <div style={styles.panelGridContainer}>
        <section style={styles.leftScrollPanel}>
          <div style={styles.panelContentWrapper}>{LeftContent}</div>
        </section>
        <section style={styles.rightFixedPanel}>
          <div style={styles.fixedContainerShield}>{RightContent}</div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  workspaceViewport: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#030712",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "sans-serif",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  telemetryHeader: {
    height: "3.5rem",
    backgroundColor: "#0b0f19",
    borderBottom: "1px solid rgba(6, 182, 212, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    zIndex: 50,
    boxSizing: "border-box",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "1rem" },
  integratedMenuButton: {
    backgroundColor: "#10b981",
    color: "#030712",
    border: "none",
    padding: "0.4rem 0.85rem",
    fontFamily: "monospace",
    fontSize: "0.75rem",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "2px",
    transition: "background-color 0.2s ease",
  },
  pulseIndicator: {
    width: "8px",
    height: "8px",
    backgroundColor: "#10b981",
    borderRadius: "50%",
    boxShadow: "0 0 10px #10b981",
  },
  systemTitle: {
    color: "#f9fafb",
    fontSize: "0.8rem",
    fontWeight: "600",
    letterSpacing: "0.12em",
    fontFamily: "monospace",
  },
  headerRight: { display: "flex", gap: "1.5rem" },
  telemetryTag: {
    color: "#06b6d4",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },
  panelGridContainer: {
    flex: 1,
    display: "flex",
    width: "100vw",
    height: "calc(100vh - 3.5rem)",
    overflow: "hidden",
  },
  leftScrollPanel: {
    width: "45%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    backgroundColor: "#070b14",
    boxSizing: "border-box",
  },
  panelContentWrapper: {
    padding: "2.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
  },
  rightFixedPanel: {
    width: "55%",
    height: "100%",
    backgroundColor: "#030712",
    position: "relative",
    boxSizing: "border-box",
  },
  fixedContainerShield: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
};
