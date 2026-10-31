import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import { applyCNOT, applyCZ, applyGateToRegister, applySWAP, createZeroRegister, getQubitProbabilities, getRegisterProbabilities, runMultiQubitCircuit, sampleRegisterMeasurements } from "./multiQubitCircuit";

const initial = () => createZeroRegister(2);
const mag2 = (v) => v.re * v.re + v.im * v.im;

function localBloch(state, q) {
  const a = state.amplitudes;
  const pairs = q === 0 ? [[0, 1], [2, 3]] : [[0, 2], [1, 3]];
  let p0 = 0, p1 = 0, re = 0, im = 0;
  pairs.forEach(([i, j]) => {
    p0 += mag2(a[i]); p1 += mag2(a[j]);
    re += a[i].re * a[j].re + a[i].im * a[j].im;
    im += a[i].im * a[j].re - a[i].re * a[j].im;
  });
  const n = p0 + p1;
  return { x: 2 * re / n, y: -2 * im / n, z: (p0 - p1) / n };
}

function Eq({ value }) {
  return <div style={s.eq}><MathRenderer formula={value} displayMode /></div>;
}
function Lesson({ id, title, children }) {
  return <section style={s.lesson}><h3 style={s.heading}>// {id} {title}</h3>{children}</section>;
}
function Sphere({ vector, name }) {
  const x = 105 + (vector.x - vector.y * 0.35) * 65, y = 105 - vector.z * 65 - vector.y * 0.2 * 65;
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  return <div style={s.sphereCard}>
    <b style={s.sphereTitle}>{name}</b>
    <svg viewBox="0 0 210 210" style={{ width: "100%", maxWidth: 210 }} role="img" aria-label={name + " local Bloch vector (projected view)"}>
      <circle cx="105" cy="105" r="65" fill="rgba(6,182,212,.035)" stroke="#155e75" />
      <ellipse cx="105" cy="105" rx="65" ry="21" fill="none" stroke="#164e63" strokeDasharray="4 4" />
      <path d="M40 105H170 M105 40V170" stroke="#334155" />
      {length > .01 && <line x1="105" y1="105" x2={x} y2={y} stroke="#34d399" strokeWidth="3" />}
      <circle cx={x} cy={y} r="5" fill={length < .01 ? "#f59e0b" : "#34d399"} stroke="#ecfdf5" />
      <text x="105" y="25" fill="#94a3b8" textAnchor="middle" fontSize="10">|0⟩</text>
      <text x="105" y="190" fill="#94a3b8" textAnchor="middle" fontSize="10">|1⟩</text>
    </svg>
    <span style={s.vectorText}>x {vector.x.toFixed(2)} · y {vector.y.toFixed(2)} · z {vector.z.toFixed(2)}</span>
    <span style={s.muted}>{length < .01 ? "Centre: locally maximally mixed" : "Vector length " + length.toFixed(2)}</span>
  </div>;
}

export default function MultiQubitModule({ onNavigate }) {
  const [state, setState] = useState(initial);
  const [history, setHistory] = useState([]);
  const [circuitOperations, setCircuitOperations] = useState([]);
  const [view, setView] = useState("bloch");
  const [shots, setShots] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);
  const pythonCode = useMemo(() => generateQiskitPythonCode({ numQubits: state.numQubits, operations: circuitOperations, shots: 1000 }), [state.numQubits, circuitOperations]);
  const probabilities = useMemo(() => getRegisterProbabilities(state), [state]);
  const vectors = useMemo(() => [localBloch(state, 0), localBloch(state, 1)], [state]);
  const apply = (label, operation, fn) => { setState((old) => fn(old)); setHistory((old) => [...old, label]); setCircuitOperations((old) => [...old, operation]); setShots(null); setQiskitResult(null); setQiskitError(""); };
  const reset = () => { setState(initial()); setHistory([]); setCircuitOperations([]); setShots(null); setQiskitResult(null); setQiskitError(""); };
  const bell = () => {
    setState(runMultiQubitCircuit(initial(), [{ name: "H", target: 0 }, { name: "CNOT", control: 0, target: 1 }]));
    setHistory(["H(q0)", "CNOT(q0 → q1)"]); setCircuitOperations([{ name: "H", target: 0 }, { name: "CNOT", control: 0, target: 1 }]); setShots(null); setQiskitResult(null); setQiskitError("");
  };
  const product = () => {
    setState(runMultiQubitCircuit(initial(), [{ name: "H", target: 0 }, { name: "H", target: 1 }]));
    setHistory(["H(q0)", "H(q1)"]); setCircuitOperations([{ name: "H", target: 0 }, { name: "H", target: 1 }]); setShots(null); setQiskitResult(null); setQiskitError("");
  };
  const basis = ["00", "01", "10", "11"];
  const handleRunOnQiskit = async () => {
    if (!circuitOperations.length || qiskitLoading) return;
    setQiskitLoading(true); setQiskitError(""); setQiskitResult(null);
    try {
      const operations = circuitOperations.map((operation) => {
        if (["CNOT", "CX"].includes(operation.name.toUpperCase())) return { name: "CX", control: operation.control, target: operation.target };
        if (["CZ", "SWAP"].includes(operation.name.toUpperCase())) return { name: operation.name.toUpperCase(), first: operation.first, second: operation.second };
        return { name: operation.name.toUpperCase(), qubit: operation.target, theta: operation.theta };
      });
      const result = await executeWithQiskit({ num_qubits: state.numQubits, operations, shots: 1000 });
      setQiskitResult(result);
    } catch (error) { setQiskitError(error.message || "Qiskit execution failed."); }
    finally { setQiskitLoading(false); }
  };
  return <div style={s.workspace}>
    <header style={s.header}><button style={s.menuButton} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "CLOSE INDEX ✕" : "MENU INDEX ☰"}</button><span style={s.eyebrow}>QUANTUM ENGINE // MULTI-QUBIT WORKSPACE</span><span style={s.headerTag}>M2.1 ACTIVE</span></header>
    {menuOpen && <aside style={s.sidebar}><span style={s.eyebrow}>CORE MAP REPOSITORY</span><button style={s.navItem} onClick={() => { setMenuOpen(false); onNavigate?.("1.1"); }}> [ ] M1.1: Single Qubit State Space</button><button style={{...s.navItem,color:"#10b981"}} onClick={() => setMenuOpen(false)}>[x] M2.1: Multi-Qubit Systems</button></aside>}
    <div style={s.contentGrid}><div style={s.module}>
    <header style={s.hero}>
      <div style={s.topbar}><span style={s.eyebrow}>MODULE 2 // MULTI-QUBIT SYSTEMS</span></div>
      <h1 style={s.title}>From one qubit to a quantum register</h1>
      <p style={s.copy}>A register has one joint state vector. Its qubits can be independent, correlated, or entangled. Learn the mathematics, then build states gate by gate.</p>
    </header>

    <Lesson id="2.1" title="WHAT DOES MULTI-QUBIT MEAN?">
      <p style={s.copy}>One qubit has two computational basis states. Two qubits have four joint basis states because each can be 0 or 1 in the basis description.</p>
      <Eq value={String.raw`\{|00\rangle,\ |01\rangle,\ |10\rangle,\ |11\rangle\}`} />
      <p style={s.copy}>We display q1 on the left and q0 on the right. Qubit 0 is the least-significant bit, matching Qiskit's indexing. Thus |01⟩ means q1=0 and q0=1.</p>
    </Lesson>

    <Lesson id="2.2" title="TENSOR PRODUCTS: COMBINING TWO QUBITS">
      <p style={s.copy}>The tensor product combines the state spaces of two systems. It is not ordinary addition. Write the q1 state first and the q0 state second to match the basis order used here.</p>
      <Eq value={String.raw`|\psi\rangle_{q1}=\alpha|0\rangle+\beta|1\rangle,\quad |\phi\rangle_{q0}=\gamma|0\rangle+\delta|1\rangle`} />
      <Eq value={String.raw`|\Psi\rangle=|\psi\rangle\otimes|\phi\rangle=\alpha\gamma|00\rangle+\alpha\delta|01\rangle+\beta\gamma|10\rangle+\beta\delta|11\rangle`} />
      <p style={s.copy}>Distribute each term in the first ket across both terms in the second ket. In column-vector form, this is the Kronecker product:</p>
      <Eq value={String.raw`\begin{bmatrix}\alpha\\\beta\end{bmatrix}\otimes\begin{bmatrix}\gamma\\\delta\end{bmatrix}=\begin{bmatrix}\alpha\gamma\\\alpha\delta\\\beta\gamma\\\beta\delta\end{bmatrix}`} />
    </Lesson>

    <Lesson id="2.3" title="THE GENERAL TWO-QUBIT STATE">
      <p style={s.copy}>A general pure two-qubit state can assign an independent complex amplitude to each joint basis state. It does not have to be a tensor product of two single-qubit states.</p>
      <Eq value={String.raw`|\Psi\rangle=a|00\rangle+b|01\rangle+c|10\rangle+d|11\rangle=\begin{bmatrix}a\\b\\c\\d\end{bmatrix}`} />
      <Eq value={String.raw`|a|^2+|b|^2+|c|^2+|d|^2=1,\quad P(00)=|a|^2,\ P(01)=|b|^2,\ P(10)=|c|^2,\ P(11)=|d|^2`} />
      <p style={s.copy}>The normalization equation says all four joint measurement probabilities add to 100%.</p>
    </Lesson>

    <Lesson id="2.4" title="HOW A GATE ACTS ON ONE WIRE">
      <p style={s.copy}>A one-qubit gate is still a 2 × 2 matrix. The full two-qubit operation is 4 × 4. With our |q1q0⟩ ordering, H⊗I acts on q1 and I⊗H acts on q0.</p>
      <Eq value={String.raw`H\otimes I=\frac{1}{\sqrt2}\begin{bmatrix}1&0&1&0\\0&1&0&1\\1&0&-1&0\\0&1&0&-1\end{bmatrix}`} />
      <Eq value={String.raw`I\otimes H=\frac{1}{\sqrt2}\begin{bmatrix}1&1&0&0\\1&-1&0&0\\0&0&1&1\\0&0&1&-1\end{bmatrix}`} />
      <Eq value={String.raw`(I\otimes H)|00\rangle=\frac{|00\rangle+|01\rangle}{\sqrt2},\quad (H\otimes I)|00\rangle=\frac{|00\rangle+|10\rangle}{\sqrt2}`} />
    </Lesson>

    <Lesson id="2.5" title="CONTROLLED GATES: CNOT, CZ AND SWAP">
      <p style={s.copy}>CNOT flips the target only when the control is 1. Here q0 controls q1. The basis-state mapping is |00⟩→|00⟩, |01⟩→|11⟩, |10⟩→|10⟩, |11⟩→|01⟩.</p>
      <Eq value={String.raw`CNOT_{q0\to q1}=\begin{bmatrix}1&0&0&0\\0&0&0&1\\0&0&1&0\\0&1&0&0\end{bmatrix}`} />
      <p style={s.copy}>CZ leaves basis labels unchanged but changes the sign of the |11⟩ amplitude. SWAP exchanges the two wire values.</p>
      <Eq value={String.raw`CZ=\operatorname{diag}(1,1,1,-1),\quad SWAP=\begin{bmatrix}1&0&0&0\\0&0&1&0\\0&1&0&0\\0&0&0&1\end{bmatrix}`} />
    </Lesson>

    <Lesson id="2.6" title="PRODUCT STATES AND ENTANGLEMENT">
      <p style={s.copy}>For a pure two-qubit state, arrange the amplitudes in a 2 × 2 coefficient matrix. It is a product state exactly when that matrix has rank one, meaning its determinant is zero.</p>
      <Eq value={String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix},\qquad ad-bc=0\quad\text{(product state)}`} />
      <p style={s.copy}>If ad−bc is nonzero, the pure state is entangled: no pair of single-qubit state vectors can reproduce its four amplitudes using a tensor product. Two independent Hadamard superpositions are not entangled.</p>
    </Lesson>

    <Lesson id="2.7" title="BUILD A BELL STATE STEP BY STEP">
      <p style={s.copy}>Start with |00⟩. Apply H to q0, then use q0 as the CNOT control and q1 as its target.</p>
      <Eq value={String.raw`|00\rangle\xrightarrow{H(q0)}\frac{|00\rangle+|01\rangle}{\sqrt2}\xrightarrow{CNOT(q0\to q1)}\frac{|00\rangle+|11\rangle}{\sqrt2}`} />
      <p style={s.copy}>The result is a Bell state. Joint measurement always gives matching bits: 00 or 11, each with 50% probability. 01 and 10 cannot occur.</p>
      <div style={s.buttons}><button style={s.primary} onClick={bell}>Load Bell state</button><button style={s.secondary} onClick={product}>Compare independent H gates</button></div>
    </Lesson>

    <Lesson id="2.8" title="WHY THE WHOLE STATE DOES NOT FIT ON ONE BLOCH SPHERE">
      <p style={s.copy}>The Bloch sphere from Module 1 describes one qubit. For a multi-qubit register we can calculate each qubit's reduced state by mathematically ignoring the other qubit. These local summaries do not contain all the joint correlations.</p>
      <p style={s.copy}>For a Bell state, either qubit alone has density matrix I/2. Its local Bloch vector is (0,0,0), at the centre. This does not mean it is |0⟩ or that the register has no quantum information. It means either qubit alone is maximally mixed.</p>
      <Eq value={String.raw`\rho_{q0}=\rho_{q1}=\frac12 I=\frac12\begin{bmatrix}1&0\\0&1\end{bmatrix},\quad (x,y,z)=(0,0,0)`} />
      <p style={s.copy}>We therefore need three linked views: each qubit's local Bloch sphere, the global amplitude vector, and the joint measurement correlations.</p>
    </Lesson>

    <Lesson id="2.9" title="MEASUREMENT AND MARGINAL PROBABILITIES">
      <p style={s.copy}>A joint measurement samples one complete bit string. A marginal probability is the sum of joint outcomes that share the selected qubit's value. For example:</p>
      <Eq value={String.raw`P(q0=0)=P(00)+P(10)=|a|^2+|c|^2,\quad P(q0=1)=|b|^2+|d|^2`} />
      <p style={s.copy}>The two local marginals can look identical for a product state and an entangled state. The joint outcomes reveal the difference.</p>
    </Lesson>

    <Lesson id="2.10" title="THREE QUBITS: THE GHZ EXAMPLE">
      <p style={s.copy}>Three qubits have eight basis states. Each extra qubit doubles the number of amplitudes. A GHZ state spreads one superposition across three wires:</p>
      <Eq value={String.raw`|000\rangle\xrightarrow{H(q0)}\frac{|000\rangle+|001\rangle}{\sqrt2}\xrightarrow{CNOT(q0,q1)}\frac{|000\rangle+|011\rangle}{\sqrt2}\xrightarrow{CNOT(q1,q2)}\frac{|000\rangle+|111\rangle}{\sqrt2}`} />
      <p style={s.copy}>The simulator engine supports up to 12 qubits. This first visual lesson focuses on two so every amplitude and correlation remains readable.</p>
    </Lesson>

    <Lesson id="2.11" title="BUILD AND MEASURE A TWO-QUBIT CIRCUIT">
      <div style={s.circuit}>
        <div style={s.wireRow}><b>q1</b><div style={s.wire} /><span>control / target</span></div>
        <div style={s.wireRow}><b>q0</b><div style={s.wire} /><span>least-significant wire</span></div>
        <div style={s.buttons}>
          <button style={s.gate} onClick={() => apply("H(q0)", { name: "H", target: 0 }, x => applyGateToRegister(x,0,"H"))}>H q0</button>
          <button style={s.gate} onClick={() => apply("H(q1)", { name: "H", target: 1 }, x => applyGateToRegister(x,1,"H"))}>H q1</button>
          <button style={s.gate} onClick={() => apply("X(q0)", { name: "X", target: 0 }, x => applyGateToRegister(x,0,"X"))}>X q0</button>
          <button style={s.gate} onClick={() => apply("Z(q0)", { name: "Z", target: 0 }, x => applyGateToRegister(x,0,"Z"))}>Z q0</button>
          <button style={s.gate} onClick={() => apply("CNOT(q0→q1)", { name: "CNOT", control: 0, target: 1 }, x => applyCNOT(x,0,1))}>CNOT 0→1</button>
          <button style={s.gate} onClick={() => apply("CNOT(q1→q0)", { name: "CNOT", control: 1, target: 0 }, x => applyCNOT(x,1,0))}>CNOT 1→0</button>
          <button style={s.gate} onClick={() => apply("CZ", { name: "CZ", first: 0, second: 1 }, x => applyCZ(x,0,1))}>CZ</button>
          <button style={s.gate} onClick={() => apply("SWAP", { name: "SWAP", first: 0, second: 1 }, x => applySWAP(x,0,1))}>SWAP</button>
        </div>
        <div style={s.history}><small>GATE HISTORY</small><br />{history.length ? history.join(" → ") : "Empty circuit: initial state |00⟩"}</div>
        <div style={s.buttons}>
          <button style={s.primary} onClick={bell}>Bell circuit</button>
          <button style={s.secondary} onClick={product}>Independent H</button>
          <button style={s.secondary} onClick={reset}>Reset</button>
          <button style={s.primary} onClick={() => setShots(sampleRegisterMeasurements(state,1000))}>Measure 1000 shots</button>
        </div>
        {shots && <div style={s.shotResult}><b>Observed counts from 1000 shots</b>{Object.entries(shots.counts).map(([k,v]) => <span key={k}>|{k}⟩: {v} ({(v/10).toFixed(1)}%)</span>)}</div>}
      </div>
    </Lesson>

    <Lesson id="2.12" title="THE SAME BELL CIRCUIT IN QISKIT">
      <p style={s.copy}>The code below creates the same circuit you built above. Qiskit numbers qubits from zero and displays classical bit strings with q0 at the right. The statevector is inspected before measurement, then a separate measured copy is sampled.</p>
      <QiskitExecutionPanel operations={circuitOperations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={handleRunOnQiskit} />
      <p style={s.copy}>This program is regenerated from the current circuit above. Load the Bell preset, add gates, change their order, or reset the register and the Python source will follow. The Run button executes the matching circuit in the Python Qiskit + Aer service.</p>
    </Lesson>
  </div><MultiQubitInspector state={state} mode={view} onModeChange={setView} /></div></div>;
}

function MultiQubitInspector({ state, mode, onModeChange }) {
  const probabilities = getRegisterProbabilities(state);
  const vectors = [localBloch(state,0), localBloch(state,1)];
  const basis = ["00","01","10","11"];
  return <div style={s.inspector}>
    <span style={s.eyebrow}>REGISTER OBSERVATION</span>
    <div style={s.buttons}>
      {["bloch","amplitudes","correlations"].map(v => <button key={v} style={mode===v?s.primary:s.secondary} onClick={() => onModeChange(v)}>{v}</button>)}
    </div>
    {mode === "bloch" && <>
      <p style={s.copy}>Local reduced states only. These spheres do not encode the complete joint state.</p>
      <div style={s.spheres}><Sphere vector={vectors[0]} name="QUBIT 0" /><Sphere vector={vectors[1]} name="QUBIT 1" /></div>
      <p style={s.note}>For a Bell state, each local vector is at the centre, while the pair still has perfect correlations.</p>
    </>}
    {mode === "amplitudes" && <div style={s.readout}>
      <p style={s.copy}>The four complex amplitudes are the full pure-state vector. Bar lengths show probabilities; the complex values retain phase information.</p>
      {state.amplitudes.map((a,i) => <div key={i} style={s.resultRow}><code>|{basis[i]}⟩</code><div style={s.track}><div style={{...s.fill,width:(probabilities[i]*100)+"%"}} /></div><span>{(probabilities[i]*100).toFixed(1)}%</span><small>{a.re.toFixed(3)} {a.im<0?"−":"+"} {Math.abs(a.im).toFixed(3)}i</small></div>)}
    </div>}
    {mode === "correlations" && <div style={s.readout}>
      <p style={s.copy}>A joint measurement records both bits in the same shot. Compare these outcomes with each qubit's marginal probabilities.</p>
      {basis.map((b,i) => <div key={b} style={s.resultRow}><code>|{b}⟩</code><div style={s.track}><div style={{...s.fill,width:(probabilities[i]*100)+"%"}} /></div><span>{(probabilities[i]*100).toFixed(1)}%</span></div>)}
      <p style={s.note}>q0: P(0) {(getQubitProbabilities(state,0).zero*100).toFixed(1)}%, P(1) {(getQubitProbabilities(state,0).one*100).toFixed(1)}%. q1: P(0) {(getQubitProbabilities(state,1).zero*100).toFixed(1)}%, P(1) {(getQubitProbabilities(state,1).one*100).toFixed(1)}%.</p>
    </div>}
  </div>;
}

const s = {
  workspace:{display:"flex",flexDirection:"column",width:"100vw",height:"100vh",overflow:"hidden",background:"#030712",fontFamily:"system-ui, sans-serif"},
  header:{height:"3.5rem",flex:"0 0 3.5rem",display:"flex",alignItems:"center",gap:"1rem",padding:"0 1.5rem",background:"#0b0f19",borderBottom:"1px solid rgba(6,182,212,.15)",zIndex:80},
  menuButton:{background:"#10b981",color:"#030712",border:0,padding:".4rem .85rem",fontFamily:"monospace",fontSize:".75rem",fontWeight:"bold",cursor:"pointer",borderRadius:"2px"},
  headerTag:{marginLeft:"auto",color:"#06b6d4",fontFamily:"monospace",fontSize:".7rem"},
  sidebar:{position:"fixed",top:"3.5rem",left:0,width:"22rem",height:"calc(100vh - 3.5rem)",zIndex:90,display:"flex",flexDirection:"column",gap:"1rem",padding:"2rem",boxSizing:"border-box",background:"#0b0f19",borderRight:"1px solid rgba(6,182,212,.2)"},
  navItem:{textAlign:"left",background:"transparent",border:0,color:"#9ca3af",fontFamily:"monospace",fontSize:".82rem",padding:".5rem 0",cursor:"pointer"},
  contentGrid:{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(360px,45%)",flex:1,minHeight:0,overflow:"hidden"},
  module:{display:"flex",flexDirection:"column",gap:"2rem",color:"#e5e7eb",padding:"2rem",overflowY:"auto",minWidth:0,fontFamily:"system-ui, sans-serif"},
  topbar:{display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap"},
  codeFrame:{background:"#050911",border:"1px solid rgba(6,182,212,.2)",borderRadius:"4px",overflow:"hidden"},
  codeHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:".65rem .85rem",background:"#0b0f19",color:"#9ca3af",fontFamily:"monospace",fontSize:".75rem"},
  code:{margin:0,padding:"1rem",overflowX:"auto",whiteSpace:"pre",fontFamily:"Consolas, Fira Code, Monaco, monospace",fontSize:".75rem",lineHeight:1.6,color:"#d1fae5"},
  hero:{display:"flex",flexDirection:"column",gap:".8rem",paddingBottom:"1.5rem",borderBottom:"1px solid rgba(6,182,212,.2)"},
  eyebrow:{color:"#10b981",fontSize:".7rem",fontFamily:"monospace",letterSpacing:".12em"},
  title:{color:"#f8fafc",fontSize:"1.8rem",lineHeight:1.2,margin:0},
  lesson:{display:"flex",flexDirection:"column",gap:".85rem"},
  heading:{color:"#10b981",fontSize:".78rem",fontFamily:"monospace",letterSpacing:".07em",margin:0},
  copy:{color:"#b6c2d1",fontSize:".88rem",lineHeight:1.7,margin:0},
  eq:{overflowX:"auto",maxWidth:"100%",padding:".25rem 0",color:"#f1f5f9"},
  note:{color:"#cbd5e1",background:"rgba(6,182,212,.06)",borderLeft:"2px solid #06b6d4",padding:".85rem 1rem",fontSize:".82rem",lineHeight:1.65},
  buttons:{display:"flex",flexWrap:"wrap",gap:".5rem"},
  primary:{background:"rgba(16,185,129,.14)",border:"1px solid rgba(16,185,129,.65)",color:"#d1fae5",padding:".6rem .75rem",fontFamily:"monospace",fontSize:".72rem",cursor:"pointer"},
  secondary:{background:"#111827",border:"1px solid #334155",color:"#cbd5e1",padding:".6rem .75rem",fontFamily:"monospace",fontSize:".72rem",cursor:"pointer"},
  gate:{background:"#111827",border:"1px solid rgba(6,182,212,.35)",color:"#e5e7eb",padding:".55rem .65rem",fontFamily:"monospace",fontSize:".72rem",cursor:"pointer"},
  circuit:{display:"flex",flexDirection:"column",gap:"1rem",padding:"1rem",background:"#080d18",border:"1px solid rgba(6,182,212,.2)"},
  wireRow:{display:"grid",gridTemplateColumns:"2rem minmax(20px,1fr) minmax(100px,1fr)",alignItems:"center",gap:".5rem",color:"#67e8f9",fontFamily:"monospace",fontSize:".75rem"},
  wire:{height:"2px",background:"#64748b"},
  history:{color:"#67e8f9",background:"#030712",padding:".8rem",fontFamily:"monospace",fontSize:".75rem",lineHeight:1.7,overflowWrap:"anywhere"},
  shotResult:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:".5rem",padding:".8rem",background:"#030712",fontFamily:"monospace",fontSize:".78rem"},
  inspector:{display:"flex",flexDirection:"column",gap:"1rem",width:"100%",height:"100%",overflowY:"auto",padding:"1.25rem",boxSizing:"border-box",background:"#030712"},
  spheres:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:".5rem"},
  sphereCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:".35rem",minWidth:0,padding:".6rem",background:"#0b0f19",border:"1px solid rgba(6,182,212,.15)"},
  sphereTitle:{color:"#67e8f9",fontFamily:"monospace",fontSize:".7rem"},
  vectorText:{color:"#cbd5e1",fontSize:".65rem",fontFamily:"monospace"},
  muted:{color:"#94a3b8",fontSize:".68rem"},
  readout:{display:"flex",flexDirection:"column",gap:".8rem"},
  resultRow:{display:"grid",gridTemplateColumns:"2.5rem minmax(40px,1fr) 3rem",alignItems:"center",gap:".5rem",fontSize:".72rem",color:"#d1fae5"},
  track:{height:".55rem",background:"#1e293b",overflow:"hidden"},
  fill:{height:"100%",background:"#10b981"},
};
