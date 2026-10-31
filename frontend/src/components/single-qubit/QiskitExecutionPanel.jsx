import React from "react";

export default function QiskitExecutionPanel({ operations, code, result, loading, error, onRun }) {
  const canRun = operations.length > 0 && !loading;
  return (
    <section style={styles.section}>
      <div style={styles.headingRow}>
        <h3 style={styles.heading}>// LIVE PYTHON / QISKIT PROGRAM</h3>
        <span style={styles.engine}>QISKIT + AER</span>
      </div>
      <p style={styles.copy}>
        This Python program is generated from the current playground circuit. Every gate, wire index, parameter, and execution setting updates with your design. Run sends the same structured circuit to the Python Qiskit + Aer service.
      </p>
      <button type="button" style={styles.button} disabled={!canRun} onClick={onRun}>
        {loading ? "Running Python on Qiskit…" : "Run Python on Qiskit · 1,000 shots"}
      </button>
      <div style={styles.codeFrame}><div style={styles.codeHeader}><strong>circuit.py</strong><span>Generated live from this circuit</span></div><pre style={styles.code}>{code}</pre></div>
      {!operations.length && <p style={styles.hint}>Add one or more gates in the circuit composer to populate the Python program and enable execution.</p>}
      {error && <div role="alert" style={styles.error}>{error}</div>}
      {result && (
        <div aria-live="polite" style={styles.results}>
          <div style={styles.resultHeading}>
            <strong>Execution result</strong>
            <span>{result.engine || "qiskit-aer"} · {result.shots.toLocaleString()} shots</span>
          </div>
          <p style={styles.hint}>This is the captured output from the Python Qiskit execution, including the values printed by the generated program.</p>
          <div style={styles.stdoutFrame}>
            <div style={styles.stdoutHeader}><strong>PYTHON OUTPUT / STDOUT</strong><span>Actual backend output</span></div>
            <pre style={styles.stdout}>{result.stdout || "The service returned no console output."}</pre>
          </div>
          <p style={styles.hint}>Structured results are also shown below for easier inspection. Bit strings follow Qiskit ordering: q0 is the rightmost bit.</p>
          <div style={styles.grid}>
            {result.statevector.map((item) => (
              <div key={item.index} style={styles.metric}>
                <span style={styles.metricLabel}>Amplitude {item.bitstring}</span>
                <strong>{item.re.toFixed(5)} {item.im < 0 ? "−" : "+"} {Math.abs(item.im).toFixed(5)}i</strong>
                <span style={styles.metricValue}>P({item.bitstring}) = {(item.probability * 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <div style={styles.counts}>
            <strong>Measured counts</strong>
            {Object.entries(result.counts).sort(([a], [b]) => a.localeCompare(b)).map(([bits, count]) => (
              <span key={bits}>|{bits}⟩: {count} ({(count / result.shots * 100).toFixed(1)}%)</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const styles = {
  stdoutFrame: { background: "#050911", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "3px", overflow: "hidden" },
  stdoutHeader: { display: "flex", justifyContent: "space-between", gap: "0.5rem", padding: "0.6rem 0.75rem", color: "#a7f3d0", background: "#080d18", fontFamily: "monospace", fontSize: "0.7rem" },
  stdout: { margin: 0, padding: "0.9rem", maxHeight: "360px", overflow: "auto", whiteSpace: "pre", color: "#d1fae5", fontFamily: "Consolas, Fira Code, Monaco, monospace", fontSize: "0.72rem", lineHeight: 1.6 },
  codeFrame: { background: "#050911", border: "1px solid rgba(6,182,212,0.16)", borderRadius: "3px", overflow: "hidden" },
  codeHeader: { display: "flex", justifyContent: "space-between", gap: "0.5rem", padding: "0.6rem 0.75rem", color: "#67e8f9", background: "#080d18", fontFamily: "monospace", fontSize: "0.7rem" },
  code: { margin: 0, padding: "0.9rem", maxHeight: "420px", overflow: "auto", whiteSpace: "pre", color: "#d1fae5", fontFamily: "Consolas, Fira Code, Monaco, monospace", fontSize: "0.72rem", lineHeight: 1.6 },
  section: { display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1.25rem", background: "#0b0f19", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "4px" },
  headingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" },
  heading: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.08em", margin: 0 },
  engine: { color: "#67e8f9", fontSize: "0.68rem", fontFamily: "monospace" },
  copy: { color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.5, margin: 0 },
  button: { alignSelf: "flex-start", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.6)", color: "#d1fae5", padding: "0.7rem 0.9rem", borderRadius: "4px", fontFamily: "monospace", cursor: "pointer" },
  hint: { color: "#6b7280", fontSize: "0.75rem", lineHeight: 1.5, margin: 0 },
  error: { color: "#fecaca", background: "rgba(127,29,29,0.2)", border: "1px solid rgba(248,113,113,0.3)", padding: "0.75rem", fontSize: "0.8rem", lineHeight: 1.5 },
  results: { display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.85rem", background: "#030712", border: "1px solid rgba(6,182,212,0.15)" },
  resultHeading: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", color: "#e5e7eb", fontSize: "0.82rem", fontFamily: "monospace" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem" },
  metric: { display: "flex", flexDirection: "column", gap: "0.35rem", padding: "0.7rem", background: "#0b0f19", color: "#e5e7eb", fontFamily: "monospace", fontSize: "0.78rem", overflowWrap: "anywhere" },
  metricLabel: { color: "#67e8f9", fontSize: "0.7rem" },
  metricValue: { color: "#a7f3d0", fontSize: "0.72rem" },
  counts: { display: "flex", flexWrap: "wrap", gap: "0.75rem", color: "#d1d5db", fontFamily: "monospace", fontSize: "0.78rem" },
};
