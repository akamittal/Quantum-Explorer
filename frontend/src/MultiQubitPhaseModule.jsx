import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import AIAssistant from "./AIAssistant";
import {
  applyGateToRegister,
  applyCNOT,
  applyCZ,
  applySWAP,
  createZeroRegister,
  runMultiQubitCircuit,
  getRegisterProbabilities,
  sampleRegisterMeasurements,
} from "./multiQubitCircuit";

const ZERO = () => createZeroRegister(2);
const COMPLEX_ZERO = { re: 0, im: 0 };
const clamp = (value) => Math.max(-1, Math.min(1, value));
const magnitude = (a) => Math.hypot(a.re, a.im);
const phase = (a) => Math.atan2(a.im, a.re);
const degrees = (radians) => radians * 180 / Math.PI;
const basis = ["00", "01", "10", "11"];

const GATES = [
  { name: "H", label: "H", target: 0, detail: "Hadamard on q0" },
  { name: "H", label: "H", target: 1, detail: "Hadamard on q1" },
  { name: "X", label: "X", target: 0, detail: "Pauli-X on q0" },
  { name: "Y", label: "Y", target: 0, detail: "Pauli-Y on q0" },
  { name: "Z", label: "Z", target: 0, detail: "Pauli-Z on q0" },
  { name: "S", label: "S", target: 0, detail: "S phase on q0" },
  { name: "T", label: "T", target: 0, detail: "T phase on q0" },
  { name: "RZ", label: "Rz(π/2)", target: 0, theta: Math.PI / 2, detail: "Quarter-turn Z rotation on q0" },
  { name: "CNOT", label: "CX 0→1", control: 0, target: 1, detail: "CNOT: q0 controls q1" },
  { name: "CNOT", label: "CX 1→0", control: 1, target: 0, detail: "CNOT: q1 controls q0" },
  { name: "CZ", label: "CZ", first: 0, second: 1, detail: "Controlled-Z" },
  { name: "SWAP", label: "SWAP", first: 0, second: 1, detail: "Exchange q0 and q1" },
];

function applyOperation(state, operation) {
  switch (operation.name) {
    case "CNOT":
    case "CX":
      return applyCNOT(state, operation.control, operation.target);
    case "CZ":
      return applyCZ(state, operation.first, operation.second);
    case "SWAP":
      return applySWAP(state, operation.first, operation.second);
    default:
      return applyGateToRegister(state, operation.target, operation);
  }
}

function describeOperation(operation) {
  if (["CNOT", "CX"].includes(operation.name)) return `CX(q${operation.control} → q${operation.target})`;
  if (operation.name === "CZ" || operation.name === "SWAP") return operation.name;
  if (["RX", "RY", "RZ"].includes(operation.name)) return `${operation.name}(q${operation.target}, ${operation.theta.toFixed(3)} rad)`;
  return `${operation.name}(q${operation.target})`;
}

function Equation({ children }) {
  return <div style={styles.equation}><MathRenderer formula={children} displayMode /></div>;
}

function Lesson({ number, title, children }) {
  return <section style={styles.lesson}>
    <h2 style={styles.lessonTitle}>// {number} {title}</h2>
    {children}
  </section>;
}

function PhaseGlyph({ amplitude, label }) {
  const r = magnitude(amplitude);
  const angle = phase(amplitude);
  const cx = 54, cy = 48, radius = 31;
  const x = cx + Math.cos(angle) * radius * r;
  const y = cy - Math.sin(angle) * radius * r;
  const active = r > 1e-8;
  return <div style={styles.phaseCell}>
    <svg viewBox="0 0 108 96" role="img" aria-label={`${label} amplitude phase ${active ? degrees(angle).toFixed(1) + " degrees" : "undefined"}`}>
      <circle cx={cx} cy={cy} r={radius} fill="#081321" stroke="#334155" />
      <path d={`M ${cx-radius-5} ${cy} H ${cx+radius+5} M ${cx} ${cy-radius-5} V ${cy+radius+5}`} stroke="#475569" strokeWidth="1" />
      <path d={`M ${cx} ${cy} L ${x} ${y}`} stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" />
      {active && <circle cx={x} cy={y} r="3.8" fill="#67e8f9" stroke="#ecfeff" />}
      <text x="54" y="91" textAnchor="middle" fill="#64748b" fontSize="7">REAL →</text>
      <text x="5" y="10" fill="#64748b" fontSize="7">IM ↑</text>
    </svg>
    <b>{`|${label}⟩`}</b>
    <span style={styles.phaseValue}>{active ? `${degrees(angle).toFixed(1)}°` : "no phase"}</span>
    <small style={styles.muted}>|a| = {r.toFixed(3)}</small>
  </div>;
}

function AmplitudeInspector({ state }) {
  const probabilities = getRegisterProbabilities(state);
  return <div style={styles.inspectorSection}>
    <div style={styles.inspectorHeading}>COMPLEX AMPLITUDE PHASE MAP</div>
    <p style={styles.smallCopy}>Each arrow is one complex amplitude a = x + iy. Its length is |a| and its direction is arg(a). A zero amplitude has no defined phase.</p>
    <div style={styles.phaseGrid}>
      {state.amplitudes.map((amplitude, index) => <PhaseGlyph key={basis[index]} amplitude={amplitude} label={basis[index]} />)}
    </div>
    <div style={styles.inspectorHeading}>JOINT STATEVECTOR AND PROBABILITIES</div>
    {state.amplitudes.map((amplitude, index) => {
      const p = probabilities[index];
      return <div key={basis[index]} style={styles.amplitudeRow}>
        <code>|{basis[index]}⟩</code>
        <div style={styles.barTrack}><div style={{ ...styles.probabilityBar, width: `${p * 100}%` }} /></div>
        <span>{(p * 100).toFixed(1)}%</span>
        <small>{amplitude.re.toFixed(3)} {amplitude.im < 0 ? "−" : "+"} {Math.abs(amplitude.im).toFixed(3)}i</small>
      </div>;
    })}
    <div style={styles.normLine}>Σ |aᵢ|² = {probabilities.reduce((sum, p) => sum + p, 0).toFixed(6)}</div>
  </div>;
}

function matrixForGate(name) {
  const matrices = {
    H: String.raw`\\frac{1}{\\sqrt2}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}`,
    X: String.raw`\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}`,
    Y: String.raw`\\begin{bmatrix}0&-i\\\\i&0\\end{bmatrix}`,
    Z: String.raw`\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}`,
    S: String.raw`\\begin{bmatrix}1&0\\\\0&i\\end{bmatrix}`,
    T: String.raw`\\begin{bmatrix}1&0\\\\0&e^{i\\pi/4}\\end{bmatrix}`,
  };
  return matrices[name];
}

export default function MultiQubitPhaseModule({ onNavigate }) {
  const [state, setState] = useState(ZERO);
  const [operations, setOperations] = useState([]);
  const [rotation, setRotation] = useState(Math.PI / 2);
  const [shots, setShots] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);

  const qiskitOperations = useMemo(() => operations.map((op) => {
    if (["CNOT", "CX"].includes(op.name)) return { name: "CX", control: op.control, target: op.target };
    if (["CZ", "SWAP"].includes(op.name)) return { name: op.name, first: op.first, second: op.second };
    return { name: op.name, qubit: op.target, theta: op.theta };
  }), [operations]);
  const pythonCode = useMemo(() => generateQiskitPythonCode({
    numQubits: 2, operations: qiskitOperations, shots: 1000,
  }), [qiskitOperations]);

  const clearExecution = () => {
    setShots(null);
    setQiskitResult(null);
    setQiskitError("");
  };

  const appendGate = (gate) => {
    const operation = { ...gate };
    setState((previous) => applyOperation(previous, operation));
    setOperations((previous) => [...previous, operation]);
    clearExecution();
  };

  const reset = () => {
    setState(ZERO());
    setOperations([]);
    clearExecution();
  };

  const loadCircuit = (name) => {
    const presets = {
      "Independent superposition": [
        { name: "H", target: 0 }, { name: "H", target: 1 },
      ],
      "Bell state": [
        { name: "H", target: 0 }, { name: "CNOT", control: 0, target: 1 },
      ],
      "Phase without probability change": [
        { name: "H", target: 0 }, { name: "T", target: 0 },
      ],
      "Phase interference": [
        { name: "H", target: 0 }, { name: "T", target: 0 }, { name: "H", target: 0 },
      ],
      "CZ phase pattern": [
        { name: "H", target: 0 }, { name: "H", target: 1 }, { name: "CZ", first: 0, second: 1 },
      ],
    };
    const nextOperations = presets[name];
    setState(runMultiQubitCircuit(ZERO(), nextOperations));
    setOperations(nextOperations);
    clearExecution();
  };

  const addRotation = () => appendGate({ name: "RZ", target: 0, theta: rotation });
  const runOnQiskit = async () => {
    if (!operations.length || qiskitLoading) return;
    setQiskitLoading(true);
    setQiskitError("");
    setQiskitResult(null);
    try {
      const result = await executeWithQiskit({
        num_qubits: 2, operations: qiskitOperations, shots: 1000,
      });
      setQiskitResult(result);
    } catch (error) {
      setQiskitError(error.message || "Qiskit execution failed.");
    } finally {
      setQiskitLoading(false);
    }
  };

  const probabilities = getRegisterProbabilities(state);
  const phaseCircuit = operations.map(describeOperation).join(" → ") || "No gates yet. Initial state is |00⟩.";

  return <div style={styles.workspace}>
    <header style={styles.header}>
      <button style={styles.menuButton} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "CLOSE INDEX ✕" : "MENU INDEX ☰"}</button>
      <span style={styles.eyebrow}>QUANTUM ENGINE // MATRIX & PHASE STUDIO</span>
      <span style={styles.headerTag}>M1.3 ACTIVE</span>
    </header>
    {menuOpen && <aside style={styles.sidebar}>
      <span style={styles.eyebrow}>CORE MAP REPOSITORY</span>
      <button style={styles.navItem} onClick={() => onNavigate?.("1.1")}>M1.1: Single-Qubit State Space</button>
      <button style={styles.navItem} onClick={() => onNavigate?.("1.2")}>M1.2: Multi-Qubit Systems</button>
      <button style={styles.navItem} onClick={() => onNavigate?.("2.1")}>M2.1: Deutsch's Algorithm</button>
      <button style={styles.navItem} onClick={() => onNavigate?.("2.2")}>M2.2: Deutsch–Jozsa</button>
      <button style={styles.navItem} onClick={() => onNavigate?.("2.3")}>M2.3: Bernstein–Vazirani</button>
      <button style={styles.navItem} onClick={() => setMenuOpen(false)}>M1.3: Matrix & Phase Studio</button>
    </aside>}

    <main style={styles.mainGrid}>
      <article style={styles.lessonPane}>
        <section style={styles.hero}>
          <span style={styles.eyebrow}>MODULE 1.3 // MULTI-QUBIT MATRIX OPERATORS</span>
          <h1 style={styles.title}>How matrices transform a quantum register</h1>
          <p style={styles.copy}>A gate does not simply change a bit. It transforms a vector of complex amplitudes. This studio follows every amplitude through the matrix multiplication, then shows how phase changes can alter later interference without changing an immediate measurement probability.</p>
        </section>

        <Lesson number="1.3.1" title="THE REGISTER IS A VECTOR, NOT A COLLECTION OF SEPARATE PROBABILITIES">
          <p style={styles.copy}>For two qubits, use the basis order |q1q0⟩ = |00⟩, |01⟩, |10⟩, |11⟩. The rightmost bit is q0, the least-significant bit. The state is one four-entry complex column vector:</p>
          <Equation>{String.raw`|\\psi\\rangle=a|00\\rangle+b|01\\rangle+c|10\\rangle+d|11\\rangle=\\begin{bmatrix}a\\\\b\\\\c\\\\d\\end{bmatrix},\\quad |a|^2+|b|^2+|c|^2+|d|^2=1`}</Equation>
          <p style={styles.copy}>The four squared magnitudes are the probabilities for the four joint outcomes. But the vector also stores phase, which the probability list alone cannot show. That missing information is why the same measurement probabilities can lead to different results after a later gate.</p>
        </Lesson>

        <Lesson number="1.3.2" title="LIFT A ONE-QUBIT GATE INTO THE FOUR-DIMENSIONAL REGISTER">
          <p style={styles.copy}>If a gate U acts on q1 while q0 is untouched, the full operator is U ⊗ I. If it acts on q0, the full operator is I ⊗ U. The tensor product creates a 4 × 4 matrix, so the gate acts on the complete register vector.</p>
          <Equation>{String.raw`H\\otimes I=\\frac{1}{\\sqrt2}\\begin{bmatrix}1&0&1&0\\\\0&1&0&1\\\\1&0&-1&0\\\\0&1&0&-1\\end{bmatrix},\\quad I\\otimes H=\\frac{1}{\\sqrt2}\\begin{bmatrix}1&1&0&0\\\\1&-1&0&0\\\\0&0&1&1\\\\0&0&1&-1\\end{bmatrix}`}</Equation>
          <p style={styles.copy}>Example: apply H to q0 from |00⟩. The vector is multiplied by I ⊗ H. Only the two entries whose q1 bit is zero receive amplitude, producing an equal superposition of |00⟩ and |01⟩.</p>
          <Equation>{String.raw`(I\\otimes H)\\begin{bmatrix}1\\\\0\\\\0\\\\0\\end{bmatrix}=\\frac{1}{\\sqrt2}\\begin{bmatrix}1\\\\1\\\\0\\\\0\\end{bmatrix}=\\frac{|00\\rangle+|01\\rangle}{\\sqrt2}`}</Equation>
        </Lesson>

        <Lesson number="1.3.3" title="THE CONTROLLED OPERATORS ARE FOUR-BY-FOUR MATRICES TOO">
          <p style={styles.copy}>CNOT is a permutation matrix: it moves amplitudes between basis slots according to the control rule. With q0 as control and q1 as target, |00⟩ and |10⟩ stay fixed while |01⟩ and |11⟩ exchange places.</p>
          <Equation>{String.raw`CNOT_{q0\\to q1}=\\begin{bmatrix}1&0&0&0\\\\0&0&0&1\\\\0&0&1&0\\\\0&1&0&0\\end{bmatrix}`}</Equation>
          <p style={styles.copy}>CZ is diagonal. It leaves three basis amplitudes unchanged and multiplies the |11⟩ amplitude by −1. SWAP exchanges the q0 and q1 labels. These matrices are unitary, so they preserve total probability.</p>
          <Equation>{String.raw`CZ=\\operatorname{diag}(1,1,1,-1),\\quad SWAP=\\begin{bmatrix}1&0&0&0\\\\0&0&1&0\\\\0&1&0&0\\\\0&0&0&1\\end{bmatrix}`}</Equation>
        </Lesson>

        <Lesson number="1.3.4" title="WHY A UNITARY MATRIX PRESERVES TOTAL PROBABILITY">
          <p style={styles.copy}>A valid closed-system quantum gate U satisfies U†U = I. The dagger means transpose and complex conjugate. If the input vector is |ψ⟩ and the output is U|ψ⟩, its squared norm is unchanged:</p>
          <Equation>{String.raw`\\langle\\psi'|\\psi'\\rangle=\\langle\\psi|U^\\dagger U|\\psi\\rangle=\\langle\\psi|I|\\psi\\rangle=1`}</Equation>
          <p style={styles.copy}>This is not an extra probability correction performed after the gate. It follows directly from the matrix being unitary. A matrix that fails U†U = I cannot represent an ideal deterministic gate on a closed register.</p>
        </Lesson>

        <Lesson number="1.3.5" title="PHASE IS THE DIRECTION OF A COMPLEX AMPLITUDE">
          <p style={styles.copy}>An amplitude a = x + iy is a point in the complex plane. Its length is |a| = √(x² + y²), and its angle is φ = atan2(y,x). The probability of its basis outcome is |a|². Changing only the angle leaves that probability unchanged.</p>
          <Equation>{String.raw`a=re^{i\\phi}=r(\\cos\\phi+i\\sin\\phi),\\quad P=|a|^2=r^2`}</Equation>
          <p style={styles.copy}>The phase of an entire state can be shifted by the same angle without changing any physical prediction. Relative phase between basis amplitudes is different: a later gate can combine amplitudes, making that phase observable through interference.</p>
        </Lesson>

        <Lesson number="1.3.6" title="S AND T GATES ROTATE PHASE WITHOUT CHANGING MAGNITUDE">
          <p style={styles.copy}>The S gate adds π/2 to the phase of the |1⟩ component. The T gate adds π/4. They do not change either component's magnitude, so applying one immediately before computational-basis measurement does not change the probabilities. They do change the state and can change the result of a later Hadamard.</p>
          <Equation>{String.raw`S=\\begin{bmatrix}1&0\\\\0&i\\end{bmatrix},\\quad T=\\begin{bmatrix}1&0\\\\0&e^{i\\pi/4}\\end{bmatrix}`}</Equation>
          <p style={styles.copy}>For a concrete example, start with |+⟩ = (|0⟩ + |1⟩)/√2. T changes it to (|0⟩ + e^(iπ/4)|1⟩)/√2. Both outcomes still have probability 1/2. Apply H next and the interference converts the phase difference into unequal probabilities:</p>
          <Equation>{String.raw`H T |+\\rangle=\\frac{(1+e^{i\\pi/4})|0\\rangle+(1-e^{i\\pi/4})|1\\rangle}{2}`}</Equation>
          <Equation>{String.raw`P(0)=\\frac{1+\\cos(\\pi/4)}{2}\\approx0.8536,\\quad P(1)=\\frac{1-\\cos(\\pi/4)}{2}\\approx0.1464`}</Equation>
          <p style={styles.copy}>The phase was not directly visible in the first measurement basis. The final H mixed the two amplitudes, so their relative phase affected constructive and destructive interference.</p>
        </Lesson>

        <Lesson number="1.3.7" title="READ THE LIVE PHASE MAP">
          <p style={styles.copy}>The right-hand inspector draws each of the four amplitudes as an arrow in its own complex plane. Arrow length is amplitude magnitude; angle is phase. The probability bar is the squared arrow length. Try the presets below, then inspect how phase can move while probability bars remain fixed.</p>
          <div style={styles.presetRow}>
            {["Independent superposition", "Bell state", "Phase without probability change", "Phase interference", "CZ phase pattern"].map((name) =>
              <button key={name} style={styles.presetButton} onClick={() => loadCircuit(name)}>{name}</button>
            )}
          </div>
        </Lesson>

        <Lesson number="1.3.8" title="BUILD A REGISTER OPERATOR SEQUENCE">
          <p style={styles.copy}>Every click appends one matrix operation to the circuit and applies it to the statevector. The order matters: in a sequence U3U2U1|ψ⟩, U1 acts first. The code panel below is generated from this exact operation list.</p>
          <div style={styles.gateGrid}>
            {GATES.map((gate, index) => <button key={index} style={styles.gateButton} title={gate.detail} onClick={() => appendGate(gate)}>{gate.label}</button>)}
          </div>
          <div style={styles.rotationRow}>
            <label htmlFor="phase-rotation">Rz angle on q0 (radians)</label>
            <input id="phase-rotation" type="range" min={-Math.PI} max={Math.PI} step={Math.PI / 16} value={rotation} onChange={(event) => setRotation(Number(event.target.value))} />
            <code>{rotation.toFixed(3)}</code>
            <button style={styles.gateButton} onClick={addRotation}>Apply Rz</button>
          </div>
          <div style={styles.circuitHistory}>
            <b>GATE ORDER</b>
            <p>{phaseCircuit}</p>
            <div style={styles.actionRow}>
              <button style={styles.secondaryButton} onClick={reset}>Reset to |00⟩</button>
              <button style={styles.secondaryButton} onClick={() => setShots(sampleRegisterMeasurements(state, 1000))}>Measure 1,000 shots</button>
            </div>
            {shots && <div style={styles.shotOutput}>Observed counts: {Object.entries(shots.counts).filter(([, count]) => count > 0).map(([key, count]) => `|${key}⟩: ${count}`).join(" · ")}</div>}
          </div>
        </Lesson>

        <Lesson number="1.3.9" title="VERIFY THE SAME CIRCUIT WITH QISKIT">
          <p style={styles.copy}>The Python source is regenerated from the live gate sequence. Qiskit computes the statevector before measurement, reports exact basis probabilities, then samples a separate measured copy. This lets you compare the browser simulator with an independent quantum software stack.</p>
          <QiskitExecutionPanel operations={qiskitOperations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={runOnQiskit} />
        </Lesson>
      </article>

      <aside style={styles.inspectorPane}>
        <div style={styles.inspectorTop}>
          <span style={styles.eyebrow}>LIVE REGISTER TELEMETRY</span>
          <span style={styles.stateLabel}>2 QUBITS · 4 AMPLITUDES</span>
        </div>
        <AmplitudeInspector state={state} />
        <div style={styles.inspectorSection}>
          <div style={styles.inspectorHeading}>CURRENT CIRCUIT</div>
          <p style={styles.smallCopy}>{operations.length} gate{operations.length === 1 ? "" : "s"} applied in order.</p>
          <div style={styles.operationList}>{operations.length ? operations.map((op, index) => <div key={index}>{index + 1}. {describeOperation(op)}</div>) : "Waiting for first gate."}</div>
          <div style={styles.normLine}>Total probability: {probabilities.reduce((sum, p) => sum + p, 0).toFixed(6)}</div>
        </div>
      </aside>
    </main>
    <AIAssistant
      moduleTitle="Multi-Qubit Matrix Operators and Phase Dynamics"
      lessonContext="Two-qubit 4x4 matrix operators, tensor products, unitary matrices, complex amplitude phase, S and T gates, relative phase, interference, and Qiskit execution."
      simulatorContext={{ numQubits: 2, amplitudes: state.amplitudes, probabilities, operations, phaseAngles: state.amplitudes.map((a) => magnitude(a) ? phase(a) : null) }}
    />
  </div>;
}

const styles = {
  workspace: { width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "#030712", color: "#e5e7eb", fontFamily: "system-ui, sans-serif" },
  header: { flex: "0 0 3.5rem", height: "3.5rem", display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.25rem", background: "#0b0f19", borderBottom: "1px solid rgba(6,182,212,.18)", zIndex: 80 },
  menuButton: { background: "#10b981", color: "#030712", border: 0, borderRadius: 2, padding: ".45rem .8rem", fontFamily: "monospace", fontWeight: 700, fontSize: ".72rem", cursor: "pointer" },
  eyebrow: { color: "#10b981", fontFamily: "monospace", fontSize: ".68rem", letterSpacing: ".11em" },
  headerTag: { marginLeft: "auto", color: "#67e8f9", fontFamily: "monospace", fontSize: ".68rem" },
  sidebar: { position: "fixed", top: "3.5rem", left: 0, zIndex: 90, width: "22rem", height: "calc(100vh - 3.5rem)", display: "flex", flexDirection: "column", gap: ".8rem", padding: "1.5rem", boxSizing: "border-box", background: "#0b0f19", borderRight: "1px solid rgba(6,182,212,.2)" },
  navItem: { textAlign: "left", color: "#cbd5e1", background: "transparent", border: 0, padding: ".5rem 0", cursor: "pointer", fontFamily: "monospace", fontSize: ".78rem" },
  mainGrid: { flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 42%)", overflow: "hidden" },
  lessonPane: { minWidth: 0, overflowY: "auto", padding: "1.8rem 2rem 4rem", display: "flex", flexDirection: "column", gap: "2.1rem" },
  hero: { display: "flex", flexDirection: "column", gap: ".75rem", paddingBottom: "1.4rem", borderBottom: "1px solid rgba(6,182,212,.2)" },
  title: { margin: 0, color: "#f8fafc", fontSize: "1.85rem", lineHeight: 1.2 },
  copy: { margin: 0, color: "#b6c2d1", fontSize: ".88rem", lineHeight: 1.72 },
  lesson: { display: "flex", flexDirection: "column", gap: ".85rem" },
  lessonTitle: { margin: 0, color: "#67e8f9", fontFamily: "monospace", fontSize: ".76rem", letterSpacing: ".06em" },
  equation: { color: "#f1f5f9", maxWidth: "100%", overflowX: "auto", padding: ".2rem 0" },
  presetRow: { display: "flex", flexWrap: "wrap", gap: ".5rem" },
  presetButton: { background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.4)", color: "#d1fae5", padding: ".55rem .7rem", cursor: "pointer", fontSize: ".7rem" },
  gateGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(78px,1fr))", gap: ".5rem" },
  gateButton: { background: "#111827", border: "1px solid rgba(6,182,212,.38)", color: "#cffafe", padding: ".65rem .45rem", cursor: "pointer", fontFamily: "monospace", fontSize: ".72rem" },
  rotationRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: ".7rem", color: "#cbd5e1", fontSize: ".75rem" },
  circuitHistory: { padding: ".9rem", background: "#080d18", border: "1px solid rgba(6,182,212,.2)", color: "#cbd5e1", fontFamily: "monospace", fontSize: ".74rem", overflowWrap: "anywhere" },
  actionRow: { display: "flex", gap: ".5rem", flexWrap: "wrap" },
  secondaryButton: { background: "#111827", border: "1px solid #475569", color: "#cbd5e1", padding: ".55rem .7rem", cursor: "pointer", fontSize: ".7rem" },
  shotOutput: { marginTop: ".7rem", color: "#a7f3d0" },
  inspectorPane: { overflowY: "auto", minWidth: 0, padding: "1.25rem", background: "#050a13", borderLeft: "1px solid rgba(6,182,212,.16)", display: "flex", flexDirection: "column", gap: "1rem" },
  inspectorTop: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem", flexWrap: "wrap" },
  stateLabel: { color: "#64748b", fontFamily: "monospace", fontSize: ".62rem" },
  inspectorSection: { display: "flex", flexDirection: "column", gap: ".7rem", padding: ".85rem", background: "#0b0f19", border: "1px solid rgba(6,182,212,.16)" },
  inspectorHeading: { color: "#10b981", fontFamily: "monospace", fontSize: ".67rem", letterSpacing: ".08em" },
  smallCopy: { margin: 0, color: "#94a3b8", fontSize: ".73rem", lineHeight: 1.6 },
  phaseGrid: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: ".25rem" },
  phaseCell: { display: "flex", minWidth: 0, flexDirection: "column", alignItems: "center", gap: ".2rem", padding: ".25rem", background: "#07111e", color: "#cffafe", fontSize: ".65rem" },
  phaseValue: { color: "#67e8f9", fontFamily: "monospace", fontSize: ".68rem" },
  muted: { color: "#64748b", fontSize: ".62rem" },
  amplitudeRow: { display: "grid", gridTemplateColumns: "2.5rem minmax(35px,1fr) 2.8rem minmax(90px,1.2fr)", gap: ".4rem", alignItems: "center", color: "#cbd5e1", fontSize: ".68rem" },
  barTrack: { height: ".5rem", background: "#1e293b", overflow: "hidden" },
  probabilityBar: { height: "100%", background: "#10b981" },
  normLine: { color: "#a7f3d0", fontFamily: "monospace", fontSize: ".68rem" },
  operationList: { display: "flex", flexDirection: "column", gap: ".3rem", color: "#cbd5e1", fontSize: ".7rem", overflowWrap: "anywhere" },
};
