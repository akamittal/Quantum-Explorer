import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import AIAssistant from "./AIAssistant";
import { DEUTSCH_ORACLES, runDeutschAlgorithm } from "./deutschAlgorithm";

function Equation({ formula }) {
  return <div style={styles.equation}><MathRenderer formula={formula} displayMode /></div>;
}

export default function DeutschAlgorithmModule({ onNavigate }) {
  const [oracle, setOracle] = useState("identity");
  const [shots, setShots] = useState(1000);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);
  const result = useMemo(() => runDeutschAlgorithm(oracle), [oracle]);
  const operations = result.operations;
  const pythonCode = useMemo(() => generateQiskitPythonCode({ numQubits: 2, operations, shots }), [operations, shots]);

  const runOnQiskit = async () => {
    if (qiskitLoading) return;
    setQiskitLoading(true);
    setQiskitError("");
    setQiskitResult(null);
    try {
      const qiskitOperations = operations.map((operation) => {
        if (["CX", "CNOT"].includes(operation.name.toUpperCase())) return { name: "CX", control: operation.control, target: operation.target };
        return { name: operation.name.toUpperCase(), qubit: operation.target, theta: operation.theta };
      });
      const response = await executeWithQiskit({ num_qubits: 2, operations: qiskitOperations, shots });
      setQiskitResult(response);
    } catch (error) {
      setQiskitError(error.message || "Qiskit execution failed.");
    } finally {
      setQiskitLoading(false);
    }
  };

  const oracleInfo = DEUTSCH_ORACLES[oracle];
  const inputZero = result.inputProbabilities.zero;
  const inputOne = result.inputProbabilities.one;
  const oracleTarget = oracle === "constant1" || oracle === "not" ? "X" : "—";
  const oracleControl = oracle === "identity" || oracle === "not" ? "CNOT control" : "—";

  return (
    <main style={styles.workspace}>
      <header style={styles.header}>
        <button type="button" onClick={() => onNavigate?.("1.1")} style={styles.indexButton}>← MODULE INDEX</button>
        <span style={styles.eyebrow}>QUANTUM ALGORITHMS // MODULE 3.1</span>
        <span style={styles.headerTag}>DEUTSCH'S ALGORITHM</span>
      </header>
      <div style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.eyebrow}>ONE QUERY. ONE BIT OF GLOBAL INFORMATION.</span>
          <h1 style={styles.title}>Deutsch's algorithm</h1>
          <p style={styles.copy}>Determine whether a hidden one-bit Boolean function is constant or balanced. A classical deterministic method needs two function calls in the worst case. The ideal quantum circuit needs one oracle call.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.1 THE QUESTION</h2>
          <p style={styles.copy}>The oracle implements a function f(x), where x is either 0 or 1. You are promised that f is one of only two types:</p>
          <div style={styles.twoColumns}>
            <div style={styles.infoCard}><strong>Constant</strong><Equation formula={String.raw`f(0)=f(1)`} /><p style={styles.copy}>Both inputs produce the same output.</p></div>
            <div style={styles.infoCard}><strong>Balanced</strong><Equation formula={String.raw`f(0)\ne f(1)`} /><p style={styles.copy}>The two inputs produce different outputs.</p></div>
          </div>
          <p style={styles.copy}>There are exactly four possible functions. Select one to act as the hidden oracle:</p>
          <div style={styles.oracleGrid}>
            {Object.entries(DEUTSCH_ORACLES).map(([key, info]) => (
              <button key={key} type="button" onClick={() => { setOracle(key); setQiskitResult(null); setQiskitError(""); }}
                aria-pressed={oracle === key}
                style={{ ...styles.oracleButton, ...(oracle === key ? styles.oracleActive : {}) }}>
                <strong>{info.label}</strong><span>{info.kind.toUpperCase()}</span>
                <small>{key === "constant0" ? "0 → 0 · 1 → 0" : key === "constant1" ? "0 → 1 · 1 → 1" : key === "identity" ? "0 → 0 · 1 → 1" : "0 → 1 · 1 → 0"}</small>
              </button>
            ))}
          </div>
          <p style={styles.note}>{oracleInfo.description}</p>
          <Equation formula={String.raw`U_f|x,y\rangle=|x,\ y\oplus f(x)\rangle`} />
          <p style={styles.copy}>The oracle keeps the input x and flips the target y only when f(x)=1. The symbol ⊕ means addition modulo 2, so 1 ⊕ 1 = 0.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.2 PREPARE THE TWO QUBITS</h2>
          <p style={styles.copy}>q0 is the input x. q1 is the target y. Start with |0⟩ on q0 and |1⟩ on q1. Apply a Hadamard gate to both qubits.</p>
          <Equation formula={String.raw`|\psi_0\rangle=|0\rangle_{q0}|1\rangle_{q1}`} />
          <Equation formula={String.raw`H|0\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2},\qquad H|1\rangle=\frac{|0\rangle-|1\rangle}{\sqrt2}`} />
          <Equation formula={String.raw`|\psi_1\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2}\otimes\frac{|0\rangle-|1\rangle}{\sqrt2}`} />
          <p style={styles.copy}>The target becomes |−⟩. It has equal measurement probabilities for 0 and 1, but the minus sign is important: it lets the oracle's answer become a phase on the input.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.3 PHASE KICKBACK: THE ORACLE'S EFFECT</h2>
          <Equation formula={String.raw`U_f\bigl(|x\rangle|{-}\rangle\bigr)=(-1)^{f(x)}|x\rangle|{-}\rangle`} />
          <p style={styles.copy}>Because X|−⟩ = −|−⟩, flipping the target contributes a minus sign. The target returns to the same |−⟩ state, while the input's amplitude picks up the phase (−1) raised to f(x). This is called phase kickback.</p>
          <Equation formula={String.raw`|\psi_2\rangle=\frac{(-1)^{f(0)}|0\rangle+(-1)^{f(1)}|1\rangle}{\sqrt2}\otimes|{-}\rangle`} />
          <p style={styles.copy}>For a constant function, both input terms have the same sign. For a balanced function, their signs are opposite. The final Hadamard converts this relative sign into a definite computational-basis result.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.4 FINAL HADAMARD AND ANSWER</h2>
          <Equation formula={String.raw`H\frac{|0\rangle+|1\rangle}{\sqrt2}=|0\rangle,\qquad H\frac{|0\rangle-|1\rangle}{\sqrt2}=|1\rangle`} />
          <div style={styles.answerCard}>
            <span style={styles.eyebrow}>SIMULATOR'S CLASSIFICATION</span>
            <strong style={styles.answer}>{result.classification.toUpperCase()}</strong>
            <p style={styles.copy}>{result.classification === "constant" ? "The input qubit is measured as 0 with certainty." : "The input qubit is measured as 1 with certainty."}</p>
            <div style={styles.probabilityRow}>
              <span>q0 = 0 <b>{(inputZero * 100).toFixed(1)}%</b></span>
              <div style={styles.track}><div style={{ ...styles.fill, width: (inputZero * 100) + "%" }} /></div>
              <span>q0 = 1 <b>{(inputOne * 100).toFixed(1)}%</b></span>
              <div style={styles.track}><div style={{ ...styles.fill, width: (inputOne * 100) + "%" }} /></div>
            </div>
          </div>
          <p style={styles.copy}>Notice that the target qubit is not needed to read the answer. Measure q0 only. One oracle query distinguishes the two promised classes with certainty in the ideal circuit.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.5 LIVE TWO-QUBIT CIRCUIT</h2>
          <div style={styles.circuitCard}>
            <div style={styles.wire}><b>q1 · target</b><span>X</span><span>H</span><span>{oracleTarget}</span><i /></div>
            <div style={styles.wire}><b>q0 · input</b><span>H</span><span>{oracleControl}</span><span>H</span><i /></div>
            <p style={styles.note}>The oracle is built from X and CNOT gates. Its exact gate sequence is shown in the generated program below.</p>
            <div style={styles.amplitudes}>
              {result.state.amplitudes.map((amplitude, index) => {
                const probability = amplitude.re * amplitude.re + amplitude.im * amplitude.im;
                return <div key={index}><code>{["|00⟩", "|01⟩", "|10⟩", "|11⟩"][index]}</code><span>{amplitude.re.toFixed(3)} {amplitude.im < 0 ? "−" : "+"} {Math.abs(amplitude.im).toFixed(3)}i</span><b>{(probability * 100).toFixed(1)}%</b></div>;
              })}
            </div>
          </div>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.1.6 RUN THE SAME CIRCUIT IN PYTHON / QISKIT</h2>
          <p style={styles.copy}>The code is generated from the selected oracle and exact gate sequence. Change the oracle above and the Python program updates automatically.</p>
          <label style={styles.shotsLabel}>Measurement shots
            <select value={shots} onChange={(event) => { setShots(Number(event.target.value)); setQiskitResult(null); }} style={styles.select}>
              <option value={100}>100</option><option value={1000}>1,000</option><option value={10000}>10,000</option>
            </select>
          </label>
          <QiskitExecutionPanel operations={operations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={runOnQiskit} />
        </section>
      </div>
      <AIAssistant
        moduleTitle="Deutsch's Algorithm"
        lessonContext="Constant versus balanced one-bit Boolean functions, oracle construction, Hadamard preparation, phase kickback, final Hadamard and one-query classification."
        simulatorContext={{
          oracle,
          oracleDescription: oracleInfo.description,
          classification: result.classification,
          inputProbabilities: result.inputProbabilities,
          operations
        }}
      />
    </main>
  );
}

const styles = {
  workspace: { width: "100vw", height: "100vh", overflow: "auto", background: "#030712", color: "#e5e7eb", fontFamily: "system-ui, sans-serif" },
  header: { minHeight: "3.5rem", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", background: "#0b0f19", borderBottom: "1px solid rgba(6,182,212,.15)", position: "sticky", top: 0, zIndex: 80 },
  eyebrow: { color: "#6b7280", fontFamily: "monospace", fontSize: ".68rem", letterSpacing: ".1em" },
  headerTag: { color: "#10b981", fontFamily: "monospace", fontSize: ".72rem" },
  indexButton: { background: "transparent", border: "1px solid #334155", color: "#9ca3af", padding: ".4rem .65rem", fontFamily: "monospace", fontSize: ".68rem", cursor: "pointer" },
  content: { width: "min(100% - 2rem, 980px)", margin: "0 auto", padding: "2rem 0 5rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  hero: { padding: "2rem 0 1rem", borderBottom: "1px solid rgba(6,182,212,.16)" },
  title: { margin: ".6rem 0", fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#f8fafc", letterSpacing: "-.04em" },
  lesson: { padding: "1.4rem", background: "#0b0f19", border: "1px solid rgba(6,182,212,.13)", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "1rem" },
  heading: { color: "#10b981", fontSize: ".78rem", letterSpacing: ".08em", fontFamily: "monospace", margin: 0 },
  copy: { color: "#9ca3af", fontSize: ".9rem", lineHeight: 1.7, margin: 0 },
  equation: { overflowX: "auto", padding: ".7rem", background: "#050911", borderLeft: "2px solid rgba(16,185,129,.55)", color: "#d1fae5" },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: ".75rem" },
  infoCard: { padding: "1rem", background: "#050911", border: "1px solid rgba(6,182,212,.12)", display: "flex", flexDirection: "column", gap: ".6rem", color: "#e5e7eb" },
  oracleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: ".65rem" },
  oracleButton: { textAlign: "left", display: "flex", flexDirection: "column", gap: ".4rem", padding: ".9rem", background: "#050911", border: "1px solid #263244", color: "#cbd5e1", cursor: "pointer", minHeight: "100px" },
  oracleActive: { border: "1px solid #10b981", background: "rgba(16,185,129,.08)", color: "#d1fae5" },
  note: { color: "#67e8f9", fontSize: ".78rem", lineHeight: 1.6, margin: 0 },
  answerCard: { padding: "1.2rem", border: "1px solid rgba(16,185,129,.35)", background: "rgba(16,185,129,.06)", display: "flex", flexDirection: "column", gap: ".65rem" },
  answer: { color: "#6ee7b7", fontFamily: "monospace", fontSize: "1.7rem" },
  probabilityRow: { display: "grid", gridTemplateColumns: "90px 1fr", gap: ".5rem .8rem", alignItems: "center", color: "#cbd5e1", fontSize: ".78rem" },
  track: { height: "7px", background: "#1f2937", borderRadius: "5px", overflow: "hidden" },
  fill: { height: "100%", background: "#10b981", borderRadius: "5px" },
  circuitCard: { padding: "1rem", background: "#050911", border: "1px solid rgba(6,182,212,.14)", display: "flex", flexDirection: "column", gap: "1rem", overflowX: "auto" },
  wire: { minWidth: "560px", display: "grid", gridTemplateColumns: "120px repeat(3, 100px) 1fr", alignItems: "center", gap: ".5rem", position: "relative", color: "#cbd5e1", fontFamily: "monospace", fontSize: ".75rem" },
  amplitudes: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: ".5rem" },
  shotsLabel: { display: "flex", alignItems: "center", gap: ".75rem", color: "#9ca3af", fontSize: ".8rem" },
  select: { padding: ".5rem", color: "#d1fae5", background: "#050911", border: "1px solid #334155" },
};
