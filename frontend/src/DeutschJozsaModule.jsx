import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import AIAssistant from "./AIAssistant";
import {
  DEUTSCH_JOZSA_INPUT_QUBITS,
  DEUTSCH_JOZSA_ORACLES,
  runDeutschJozsa,
} from "./deutschJozsa";

function Equation({ formula }) {
  return <div style={styles.equation}><MathRenderer formula={formula} displayMode /></div>;
}

const bitString = (value) => value.toString(2).padStart(DEUTSCH_JOZSA_INPUT_QUBITS, "0");

export default function DeutschJozsaModule({ onNavigate }) {
  const [truthTable, setTruthTable] = useState(DEUTSCH_JOZSA_ORACLES.firstBit.truthTable);
  const [selectedPreset, setSelectedPreset] = useState("firstBit");
  const [shots, setShots] = useState(1000);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);

  const result = useMemo(() => runDeutschJozsa(truthTable), [truthTable]);
  const pythonCode = useMemo(() => generateQiskitPythonCode({
    numQubits: DEUTSCH_JOZSA_INPUT_QUBITS + 1,
    operations: result.operations,
    shots,
  }), [result.operations, shots]);

  const choosePreset = (name) => {
    setSelectedPreset(name);
    setTruthTable([...DEUTSCH_JOZSA_ORACLES[name].truthTable]);
    setQiskitResult(null);
    setQiskitError("");
  };

  const toggleTruthValue = (index) => {
    setSelectedPreset("custom");
    setTruthTable((current) => current.map((value, position) => position === index ? 1 - value : value));
    setQiskitResult(null);
    setQiskitError("");
  };

  const runOnQiskit = async () => {
    if (qiskitLoading) return;
    setQiskitLoading(true);
    setQiskitError("");
    setQiskitResult(null);
    try {
      const operations = result.operations.map((operation) => {
        if (operation.name === "MCX") {
          return { name: "MCX", controls: operation.controls, target: operation.target };
        }
        if (["CX", "CNOT"].includes(operation.name.toUpperCase())) {
          return { name: "CX", control: operation.control, target: operation.target };
        }
        return { name: operation.name.toUpperCase(), qubit: operation.target, theta: operation.theta };
      });
      const response = await executeWithQiskit({
        num_qubits: DEUTSCH_JOZSA_INPUT_QUBITS + 1,
        operations,
        shots,
      });
      setQiskitResult(response);
    } catch (error) {
      setQiskitError(error.message || "Qiskit execution failed.");
    } finally {
      setQiskitLoading(false);
    }
  };

  const classicalWorstCase = 2 ** (DEUTSCH_JOZSA_INPUT_QUBITS - 1) + 1;

  return (
    <main style={styles.workspace}>
      <header style={styles.header}>
        <button type="button" onClick={() => setMenuOpen((value) => !value)} style={styles.menuButton}>
          {menuOpen ? "CLOSE INDEX ✕" : "MENU INDEX ☰"}
        </button>
        <button type="button" onClick={() => onNavigate?.("3.1")} style={styles.indexButton}>← DEUTSCH</button>
        <span style={styles.eyebrow}>QUANTUM ALGORITHMS // MODULE 3.2</span>
        <span style={styles.headerTag}>DEUTSCH–JOZSA</span>
      </header>

      {menuOpen && <aside style={styles.sidebar} aria-label="Module navigation">
        <span style={styles.eyebrow}>ALGORITHM INDEX</span>
        <button type="button" style={styles.navItem} onClick={() => { setMenuOpen(false); onNavigate?.("1.1"); }}>M1.1: Single-Qubit Foundations</button>
        <button type="button" style={styles.navItem} onClick={() => { setMenuOpen(false); onNavigate?.("2.1"); }}>M2.1: Multi-Qubit Systems</button>
        <button type="button" style={styles.navItem} onClick={() => { setMenuOpen(false); onNavigate?.("3.1"); }}>M3.1: Deutsch's Algorithm</button>
        <button type="button" style={{ ...styles.navItem, color: "#10b981" }} onClick={() => setMenuOpen(false)}>[x] M3.2: Deutsch–Jozsa Algorithm</button>
        <button type="button" style={styles.navItem} onClick={() => { setMenuOpen(false); onNavigate?.("2.3"); }}>M2.3: Bernstein–Vazirani Algorithm</button>
      </aside>}

      <div style={styles.content}>
        <section style={styles.hero}>
          <span style={styles.eyebrow}>ONE ORACLE QUERY · THREE INPUT QUBITS · EIGHT POSSIBLE INPUTS</span>
          <h1 style={styles.title}>Deutsch–Jozsa algorithm</h1>
          <p style={styles.copy}>
            Determine whether a hidden Boolean function is constant or balanced.
            For three input bits, a classical deterministic method can need five
            queries in the worst case. The quantum circuit uses one oracle query.
          </p>
          <div style={styles.metricRow}>
            <div style={styles.metric}><strong>1</strong><span>quantum oracle query</span></div>
            <div style={styles.metric}><strong>{classicalWorstCase}</strong><span>classical worst-case queries</span></div>
            <div style={styles.metric}><strong>3 + 1</strong><span>input qubits + target qubit</span></div>
          </div>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.1 THE PROMISE PROBLEM</h2>
          <p style={styles.copy}>
            The oracle computes a Boolean function f(x), where x is a three-bit
            string. There are eight possible inputs. We are promised that f belongs
            to one of two classes:
          </p>
          <div style={styles.twoColumns}>
            <article style={styles.infoCard}>
              <strong>Constant function</strong>
              <Equation formula={String.raw`f(x)=0\ \text{for every }x\quad\text{or}\quad f(x)=1\ \text{for every }x`} />
              <p style={styles.copy}>All eight inputs produce the same output. The truth table contains zero or eight ones.</p>
            </article>
            <article style={styles.infoCard}>
              <strong>Balanced function</strong>
              <Equation formula={String.raw`\sum_{x\in\{0,1\}^3}f(x)=4`} />
              <p style={styles.copy}>Exactly four inputs produce 1 and the other four produce 0.</p>
            </article>
          </div>
          <p style={styles.copy}>
            The promise matters. The algorithm is designed to distinguish these
            two classes. A truth table with one, two, three, five, six or seven
            ones is outside the promise, so the usual constant-versus-balanced
            conclusion is not justified.
          </p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.2 BUILD THE HIDDEN ORACLE</h2>
          <p style={styles.copy}>
            Select a preset, or edit each output bit yourself. The input labels are
            written q2q1q0, with q0 as the least-significant bit. The target is q3.
            Changing one truth-table cell changes the oracle itself, not just its label.
          </p>
          <div style={styles.presetGrid}>
            {Object.entries(DEUTSCH_JOZSA_ORACLES).map(([key, oracle]) => (
              <button key={key} type="button" aria-pressed={selectedPreset === key}
                onClick={() => choosePreset(key)}
                style={{ ...styles.presetButton, ...(selectedPreset === key ? styles.presetActive : {}) }}>
                <strong>{oracle.label}</strong><small>{oracle.description}</small>
              </button>
            ))}
          </div>
          <div style={styles.truthTable}>
            <div style={styles.truthHeader}><strong>INPUT x</strong><strong>ORACLE OUTPUT f(x)</strong><strong>EDIT</strong></div>
            {truthTable.map((value, index) => (
              <div key={index} style={styles.truthRow}>
                <code>|{bitString(index)}⟩</code>
                <strong style={{ color: value ? "#6ee7b7" : "#93c5fd" }}>{value}</strong>
                <button type="button" onClick={() => toggleTruthValue(index)} aria-label={`Toggle f(${bitString(index)})`}
                  style={styles.toggleButton}>Toggle</button>
              </div>
            ))}
          </div>
          <p style={styles.note}>{selectedPreset === "custom" ? "Custom truth table. " : ""}{result.numberOfOnes} of 8 inputs currently return 1.</p>
          <div style={styles.promiseStatus}>
            <strong>{result.classification === "constant" ? "CONSTANT PROMISE SATISFIED" : result.classification === "balanced" ? "BALANCED PROMISE SATISFIED" : "PROMISE VIOLATED"}</strong>
            <span>{result.classification === "promise-violated" ? "This function is neither constant nor balanced. The circuit still runs, but its output cannot be interpreted as a guaranteed answer to the promise problem." : "This truth table belongs to the promised function class."}</span>
          </div>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.3 THE CIRCUIT AND REGISTER ORDER</h2>
          <p style={styles.copy}>
            The first three wires are the input register. The fourth wire is the
            target. We prepare the target in |1⟩, then apply Hadamard gates to all
            four qubits. The oracle is applied once. Finally, Hadamard gates are
            applied to the three input wires and those wires are measured.
          </p>
          <div style={styles.diagramCard}>
            <svg viewBox="0 0 900 310" width="100%" role="img" aria-label="Deutsch-Jozsa circuit with three input qubits, one target qubit, Hadamard preparation, a single oracle block, final Hadamards on the input register, and measurement of the input register">
              {[0,1,2,3].map((q) => <g key={q}>
                <text x="22" y={63 + q * 58} fill={q === 3 ? "#c4b5fd" : "#67e8f9"} fontSize="14" fontFamily="monospace">q{q}{q === 3 ? " · target" : " · input"}</text>
                <line x1="125" y1={58 + q * 58} x2="865" y2={58 + q * 58} stroke="#475569" strokeWidth="2" />
              </g>)}
              {[0,1,2,3].map((q) => <g key={q}>
                <rect x="205" y={39 + q * 58} width="38" height="38" rx="4" fill="#0b1720" stroke="#34d399" strokeWidth="2" />
                <text x="224" y={64 + q * 58} fill="#d1fae5" textAnchor="middle" fontSize="15" fontWeight="bold">H</text>
              </g>)}
              <rect x="390" y="34" width="145" height="220" rx="6" fill="#10252b" stroke="#22d3ee" strokeWidth="2" />
              <text x="462" y="126" fill="#a5f3fc" textAnchor="middle" fontSize="20" fontFamily="monospace">U_f</text>
              <text x="462" y="151" fill="#94a3b8" textAnchor="middle" fontSize="11" fontFamily="monospace">ONE QUERY</text>
              <text x="462" y="176" fill="#94a3b8" textAnchor="middle" fontSize="10" fontFamily="monospace">TRUTH-TABLE ORACLE</text>
              <g fill="#22d3ee">
                <circle cx="462" cy="58" r="5" /><circle cx="462" cy="116" r="5" /><circle cx="462" cy="174" r="5" />
              </g>
              <circle cx="462" cy="232" r="9" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <path d="M462 223V241 M453 232H471" stroke="#22d3ee" strokeWidth="2" />
              {[0,1,2].map((q) => <g key={q}>
                <rect x="650" y={39 + q * 58} width="38" height="38" rx="4" fill="#0b1720" stroke="#34d399" strokeWidth="2" />
                <text x="669" y={64 + q * 58} fill="#d1fae5" textAnchor="middle" fontSize="15" fontWeight="bold">H</text>
                <rect x="760" y={40 + q * 58} width="38" height="36" rx="4" fill="#172033" stroke="#a78bfa" strokeWidth="2" />
                <text x="779" y={64 + q * 58} fill="#ddd6fe" textAnchor="middle" fontSize="14" fontWeight="bold">M</text>
              </g>)}
              <text x="224" y="294" fill="#94a3b8" textAnchor="middle" fontSize="11">Prepare |+⟩|+⟩|+⟩|−⟩</text>
              <text x="462" y="294" fill="#94a3b8" textAnchor="middle" fontSize="11">Reversible oracle</text>
              <text x="724" y="294" fill="#94a3b8" textAnchor="middle" fontSize="11">Interference + readout</text>
            </svg>
            <p style={styles.note}>The oracle is compiled from the selected truth table. Each marked input pattern activates a multi-controlled X on the target; X gates around the controls implement the required zero-controls.</p>
          </div>
          <Equation formula={String.raw`U_f|x,y\rangle=|x,\ y\oplus f(x)\rangle`} />
          <p style={styles.copy}>
            This mapping is reversible: the input x is preserved, while the target
            y is flipped exactly when f(x)=1. A quantum oracle must be unitary, so
            it cannot simply erase x and replace y with f(x).
          </p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.4 DERIVE THE STATE AFTER EACH STAGE</h2>
          <p style={styles.copy}>Start with three input qubits in |000⟩ and the target in |1⟩:</p>
          <Equation formula={String.raw`|\psi_0\rangle=|000\rangle|1\rangle`} />
          <p style={styles.copy}>Apply H to each qubit. The target becomes |−⟩, while the input register becomes an equal superposition of all eight bit strings:</p>
          <Equation formula={String.raw`H^{\otimes 3}|000\rangle=\frac{1}{\sqrt8}\sum_{x\in\{0,1\}^3}|x\rangle`} />
          <Equation formula={String.raw`H|1\rangle=|{-}\rangle=\frac{|0\rangle-|1\rangle}{\sqrt2}`} />
          <Equation formula={String.raw`|\psi_1\rangle=\frac{1}{\sqrt8}\sum_{x\in\{0,1\}^3}|x\rangle|{-}\rangle`} />
          <p style={styles.copy}>The oracle acts on each input basis state. Because the target is |−⟩, flipping it contributes a minus sign. The target returns to |−⟩, and the function value is written into the phase of each input term:</p>
          <Equation formula={String.raw`U_f|x\rangle|{-}\rangle=(-1)^{f(x)}|x\rangle|{-}\rangle`} />
          <Equation formula={String.raw`|\psi_2\rangle=\frac{1}{\sqrt8}\sum_x(-1)^{f(x)}|x\rangle|{-}\rangle`} />
          <p style={styles.copy}>Now apply H to all three input qubits. For an input basis state |x⟩, the amplitude of output |z⟩ is determined by the parity of the bitwise inner product x·z:</p>
          <Equation formula={String.raw`H^{\otimes 3}|x\rangle=\frac{1}{\sqrt8}\sum_{z\in\{0,1\}^3}(-1)^{x\cdot z}|z\rangle`} />
          <p style={styles.copy}>Substitute this into the complete state and collect the coefficient of each |z⟩:</p>
          <Equation formula={String.raw`|\psi_3\rangle=\frac{1}{8}\sum_{z\in\{0,1\}^3}\left[\sum_{x\in\{0,1\}^3}(-1)^{f(x)+x\cdot z}\right]|z\rangle|{-}\rangle`} />
          <p style={styles.copy}>For z=000, the inner product x·z is always zero. The amplitude of |000⟩ is therefore the average of eight signs:</p>
          <Equation formula={String.raw`A(000)=\frac18\sum_x(-1)^{f(x)}=\frac{N_0-N_1}{8}`} />
          <div style={styles.twoColumns}>
            <article style={styles.infoCard}><strong>Constant</strong>
              <Equation formula={String.raw`N_1=0\Rightarrow A(000)=+1\qquad N_1=8\Rightarrow A(000)=-1`} />
              <p style={styles.copy}>The probability of measuring 000 is one. The global minus sign for constant one does not change a measurement probability.</p>
            </article>
            <article style={styles.infoCard}><strong>Balanced</strong>
              <Equation formula={String.raw`N_0=N_1=4\Rightarrow A(000)=0`} />
              <p style={styles.copy}>Four positive and four negative contributions cancel exactly. The input register cannot be measured as 000.</p>
            </article>
          </div>
          <p style={styles.copy}>That cancellation is the key. The circuit does not read all eight oracle outputs separately. It makes their phases interfere, then checks whether the all-zero input outcome has vanished.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.5 SIMULATE THE FINAL INPUT REGISTER</h2>
          <div style={styles.resultCard}>
            <span style={styles.eyebrow}>IDEAL STATEVECTOR CLASSIFICATION</span>
            <strong style={styles.resultTitle}>{result.classification === "promise-violated" ? "NO PROMISE-BASED ANSWER" : result.classification.toUpperCase()}</strong>
            <p style={styles.copy}>
              {result.classification === "constant"
                ? "The input register is |000⟩ with certainty. The selected function is constant."
                : result.classification === "balanced"
                  ? "The |000⟩ outcome has exactly zero probability. Every possible measurement result is non-zero."
                  : "The selected truth table is outside the promise. A non-zero probability of 000 is not enough to classify it as constant."}
            </p>
            <div style={styles.zeroProbability}>
              <span>P(input = 000)</span><strong>{(result.zeroInputProbability * 100).toFixed(4)}%</strong>
            </div>
          </div>
          <div style={styles.probabilityGrid}>
            {result.outputProbabilities.map((probability, index) => (
              <div key={index} style={styles.probabilityItem}>
                <div><code>{bitString(index)}</code><b>{(probability * 100).toFixed(2)}%</b></div>
                <div style={styles.track}><div style={{ ...styles.fill, width: (probability * 100) + "%" }} /></div>
              </div>
            ))}
          </div>
          <p style={styles.note}>The bars show exact simulator probabilities, not one random sample. For a balanced oracle, several non-zero output strings may appear; the algorithm only requires that 000 is impossible.</p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.6 EXECUTE THE SAME CIRCUIT WITH QISKIT</h2>
          <p style={styles.copy}>This program is generated from the same operation list used by the local statevector simulator. It includes the oracle's multi-controlled X gates and open-control X gates. Qiskit calculates the statevector first, then samples a measured copy.</p>
          <label style={styles.shotsLabel}>Measurement shots
            <select value={shots} onChange={(event) => { setShots(Number(event.target.value)); setQiskitResult(null); }} style={styles.select}>
              <option value={100}>100</option><option value={1000}>1,000</option><option value={10000}>10,000</option>
            </select>
          </label>
          <QiskitExecutionPanel operations={result.operations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={runOnQiskit} shots={shots} />
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.7 WHAT DOES THE QUERY ADVANTAGE MEAN?</h2>
          <p style={styles.copy}>
            A classical deterministic algorithm must inspect enough distinct
            inputs to rule out the possibility that the remaining unseen inputs
            contain the opposite output. For n=3, after four identical answers,
            a fifth query is still needed to distinguish a constant function from
            a balanced one.
          </p>
          <Equation formula={String.raw`Q_{\mathrm{classical,worst}}=2^{n-1}+1=5\quad(n=3)`} />
          <Equation formula={String.raw`Q_{\mathrm{quantum}}=1\quad\text{oracle query}`} />
          <p style={styles.note}>
            This is an oracle-query comparison under the promise, not a claim that
            every real-world quantum computation is five times faster. It counts
            calls to the unknown function and does not include hardware noise,
            gate synthesis cost, or state-preparation overhead.
          </p>
        </section>

        <section style={styles.lesson}>
          <h2 style={styles.heading}>// 3.2.8 CHECK YOUR UNDERSTANDING</h2>
          <ul style={styles.checkList}>
            <li>Why must the target start in |1⟩ before the Hadamard?</li>
            <li>Why does a target flip become a phase of −1?</li>
            <li>Why is the probability of 000 zero for every balanced truth table?</li>
            <li>What fails when the truth table is neither constant nor balanced?</li>
            <li>Why does the quantum circuit still need three input qubits to represent eight possible inputs?</li>
          </ul>
        </section>
      </div>

      <AIAssistant
        moduleTitle="Deutsch–Jozsa Algorithm"
        lessonContext="Three-input Deutsch–Jozsa algorithm. Promise problem for constant versus balanced Boolean functions; reversible truth-table oracle; multi-controlled X decomposition; Hadamard preparation; phase kickback; Walsh-Hadamard amplitude formula; zero-output cancellation; classical query lower bound."
        simulatorContext={{
          inputQubits: DEUTSCH_JOZSA_INPUT_QUBITS,
          truthTable,
          classification: result.classification,
          oracleOperations: result.oracle,
          outputProbabilities: result.outputProbabilities,
          zeroInputProbability: result.zeroInputProbability,
          qiskitResult,
        }}
      />
    </main>
  );
}

const styles = {
  workspace: { minHeight: "100vh", background: "#030712", color: "#e5e7eb", paddingBottom: "5rem", fontFamily: "system-ui, sans-serif" },
  header: { minHeight: "58px", display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.25rem", borderBottom: "1px solid rgba(6,182,212,.18)", background: "#080e18", flexWrap: "wrap" },
  menuButton: { background: "transparent", border: "1px solid #334155", color: "#cbd5e1", padding: ".5rem .7rem", fontFamily: "monospace", fontSize: ".68rem", cursor: "pointer" },
  indexButton: { background: "transparent", border: "1px solid rgba(16,185,129,.35)", color: "#a7f3d0", padding: ".5rem .7rem", fontFamily: "monospace", fontSize: ".68rem", cursor: "pointer" },
  eyebrow: { color: "#67e8f9", fontFamily: "monospace", fontSize: ".65rem", letterSpacing: ".1em" },
  headerTag: { marginLeft: "auto", color: "#6ee7b7", fontFamily: "monospace", fontSize: ".68rem", letterSpacing: ".08em" },
  sidebar: { position: "fixed", zIndex: 100, top: 58, left: 0, width: "min(340px, 90vw)", height: "calc(100vh - 58px)", display: "flex", flexDirection: "column", gap: ".75rem", padding: "1.5rem", boxSizing: "border-box", background: "#0b111d", borderRight: "1px solid rgba(6,182,212,.2)", boxShadow: "12px 0 30px rgba(0,0,0,.35)" },
  navItem: { textAlign: "left", background: "transparent", border: 0, color: "#94a3b8", padding: ".65rem .25rem", fontFamily: "monospace", fontSize: ".75rem", cursor: "pointer" },
  content: { width: "min(1100px, calc(100% - 2rem))", margin: "0 auto" },
  hero: { padding: "3.5rem 0 2rem", borderBottom: "1px solid rgba(148,163,184,.12)" },
  title: { margin: ".6rem 0 1rem", color: "#f8fafc", fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-.04em", lineHeight: 1.05 },
  copy: { color: "#cbd5e1", fontSize: ".94rem", lineHeight: 1.8, margin: ".8rem 0" },
  lesson: { padding: "2rem 0", borderBottom: "1px solid rgba(148,163,184,.12)" },
  heading: { color: "#6ee7b7", fontFamily: "monospace", fontSize: ".78rem", letterSpacing: ".08em", margin: "0 0 1rem" },
  equation: { overflowX: "auto", margin: "1rem 0", padding: ".9rem 1rem", border: "1px solid rgba(34,211,238,.14)", background: "rgba(8,20,31,.7)", borderRadius: "4px", color: "#e0f2fe" },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: ".8rem", margin: "1rem 0" },
  infoCard: { padding: "1rem", background: "#0b1420", border: "1px solid #243448", borderRadius: "5px", minWidth: 0 },
  metricRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: ".7rem", marginTop: "1.5rem" },
  metric: { padding: ".85rem 1rem", background: "#0b1420", border: "1px solid #1e3a4a", display: "flex", flexDirection: "column", gap: ".3rem" },
  presetGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: ".65rem", margin: "1rem 0" },
  presetButton: { display: "flex", flexDirection: "column", gap: ".45rem", textAlign: "left", padding: ".8rem", background: "#0b1420", border: "1px solid #334155", color: "#d1d5db", cursor: "pointer" },
  presetActive: { borderColor: "#10b981", background: "rgba(16,185,129,.09)" },
  truthTable: { border: "1px solid #263648", background: "#080f19", marginTop: "1rem" },
  truthHeader: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: ".6rem .8rem", color: "#94a3b8", fontFamily: "monospace", fontSize: ".63rem", borderBottom: "1px solid #263648" },
  truthRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", alignItems: "center", padding: ".5rem .8rem", borderBottom: "1px solid rgba(51,65,85,.45)" },
  toggleButton: { justifySelf: "start", padding: ".3rem .55rem", background: "#111c2a", border: "1px solid #334155", color: "#a7f3d0", fontSize: ".68rem", cursor: "pointer" },
  note: { color: "#94a3b8", fontSize: ".78rem", lineHeight: 1.65, margin: ".8rem 0" },
  promiseStatus: { display: "flex", flexDirection: "column", gap: ".4rem", padding: ".9rem 1rem", borderLeft: "3px solid #10b981", background: "#0b1420", color: "#cbd5e1", fontSize: ".8rem", lineHeight: 1.6 },
  diagramCard: { overflowX: "auto", padding: "1rem", background: "#080f19", border: "1px solid #263648", borderRadius: "5px" },
  resultCard: { padding: "1.2rem", background: "#0b1420", border: "1px solid #1e3a4a", borderRadius: "5px" },
  resultTitle: { display: "block", color: "#6ee7b7", fontFamily: "monospace", fontSize: "1.5rem", marginTop: ".5rem" },
  zeroProbability: { display: "flex", justifyContent: "space-between", gap: "1rem", paddingTop: ".8rem", borderTop: "1px solid #263648", color: "#94a3b8" },
  probabilityGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: ".7rem", marginTop: "1rem" },
  probabilityItem: { padding: ".7rem", background: "#080f19", border: "1px solid #263648" },
  track: { height: "6px", background: "#1e293b", marginTop: ".45rem", overflow: "hidden" },
  fill: { height: "100%", background: "#10b981", transition: "width .2s ease" },
  shotsLabel: { display: "flex", alignItems: "center", gap: ".75rem", color: "#cbd5e1", fontSize: ".8rem", margin: "1rem 0" },
  select: { padding: ".45rem .6rem", background: "#0b1420", border: "1px solid #334155", color: "#e5e7eb" },
  checkList: { color: "#cbd5e1", lineHeight: 2, paddingLeft: "1.3rem" },
};
