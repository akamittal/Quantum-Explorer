import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import AIAssistant from "./AIAssistant";
import { buildQpeOperations, estimateEigenphase } from "./quantumPhaseEstimation";

const Eq = ({ formula }) => <div style={s.equation}><MathRenderer formula={formula} displayMode /></div>;
const bits = (value, width) => value.toString(2).padStart(width, "0");
const percent = (value) => (value * 100).toFixed(2) + "%";

function QpeCircuit({ countingQubits, phase }) {
  const operations = buildQpeOperations(countingQubits, phase);
  const width = Math.max(760, 150 + operations.length * 46);
  const y = (q) => 48 + q * 58;
  return <div style={s.circuitWrap}>
    <svg viewBox={"0 0 " + width + " " + (105 + countingQubits * 58)} role="img" aria-label="Complete QPE circuit with target preparation, Hadamards, controlled phase powers, inverse QFT rotations and swaps" style={{ width: "100%", minWidth: 680 }}>
      <text x="14" y="18" fill="#67e8f9" fontSize="10">COUNTING REGISTER · q0 LEAST SIGNIFICANT · TARGET q{countingQubits}</text>
      {Array.from({ length: countingQubits + 1 }, (_, q) => <g key={q}>
        <text x="16" y={y(q) + 4} fill="#94a3b8" fontSize="11">{q === countingQubits ? "target" : "q" + q}</text>
        <line x1="72" y1={y(q)} x2={width - 22} y2={y(q)} stroke="#475569" />
      </g>)}
      {operations.map((op, index) => {
        const x = 110 + index * 46;
        if (op.name === "H" || op.name === "X") {
          const cy = y(op.qubit), color = op.name === "H" ? "#34d399" : "#fbbf24";
          return <g key={index}>
            <rect x={x-15} y={cy-15} width="30" height="30" rx="4" fill={op.name === "H" ? "#123b43" : "#382b13"} stroke={color}/>
            <text x={x} y={cy+4} fill={op.name === "H" ? "#d1fae5" : "#fde68a"} textAnchor="middle" fontSize="12">{op.name}</text>
          </g>;
        }
        if (op.name === "CP") {
          const top = Math.min(y(op.control), y(op.target)), bottom = Math.max(y(op.control), y(op.target));
          return <g key={index}>
            <line x1={x} y1={top} x2={x} y2={bottom} stroke="#22d3ee"/>
            <circle cx={x} cy={y(op.control)} r="4.5" fill="#22d3ee"/>
            <circle cx={x} cy={y(op.target)} r="11" fill="#102333" stroke="#22d3ee"/>
            <text x={x} y={y(op.target)+4} fill="#cffafe" textAnchor="middle" fontSize="10">P</text>
            <text x={x} y={top-9} fill="#67e8f9" textAnchor="middle" fontSize="8">{(op.theta/Math.PI).toFixed(2)}π</text>
          </g>;
        }
        if (op.name === "SWAP") {
          const top = Math.min(y(op.first),y(op.second)), bottom = Math.max(y(op.first),y(op.second));
          return <g key={index}>
            <line x1={x} y1={top} x2={x} y2={bottom} stroke="#fbbf24"/>
            {[op.first,op.second].map((q)=><g key={q}>
              <circle cx={x} cy={y(q)} r="9" fill="#382b13" stroke="#fbbf24"/>
              <path d={"M"+(x-4)+" "+(y(q)-4)+"l8 8m0 -8l-8 8"} stroke="#fde68a"/>
            </g>)}
          </g>;
        }
        return null;
      })}
    </svg>
    <p style={s.note}>Every gate is drawn in execution order. Controlled-phase labels show their angle in multiples of π; the final SWAP gates correct the inverse-QFT bit order.</p>
  </div>;
}

function ProbabilityBars({ diagnostics, selectedIndex }) {
  return <div style={s.dataCard}>
    <h3 style={s.subheading}>MEASURED PHASE REGISTER · EXACT PROBABILITIES</h3>
    {diagnostics.map((item) => <div key={item.index} style={s.probabilityRow}>
      <div style={s.probabilityLabel}><code>|{item.bitstring}⟩</code><span>{percent(item.probability)}</span></div>
      <div style={s.track}><div style={{ ...s.fill, width: percent(item.probability), background: item.index === selectedIndex ? "#34d399" : "#0e7490" }}/></div>
    </div>)}
  </div>;
}

function PhaseWheel({ diagnostics }) {
  const c = 125, radius = 91;
  return <div style={s.dataCard}>
    <h3 style={s.subheading}>PHASE-KICKBACK AMPLITUDES</h3>
    <svg viewBox="0 0 250 250" role="img" aria-label="Complex plane showing phase-kickback amplitudes" style={{ width: "100%", maxWidth: 290 }}>
      <circle cx={c} cy={c} r={radius} fill="none" stroke="#334155" strokeDasharray="4 5"/>
      <path d={"M18 "+c+"H232 M"+c+" 18V232"} stroke="#475569"/>
      {diagnostics.map((item) => {
        const magnitude = Math.sqrt(item.probability), x = c + radius*magnitude*Math.cos(item.phase), y = c - radius*magnitude*Math.sin(item.phase);
        return <g key={item.index}><line x1={c} y1={c} x2={x} y2={y} stroke="#34d399"/><circle cx={x} cy={y} r="3.5" fill="#67e8f9"/></g>;
      })}
    </svg>
    <p style={s.note}>Before inverse QFT, every counting amplitude has equal length. Its angle advances by 2πφ for each integer basis index.</p>
  </div>;
}

export default function QuantumPhaseEstimationModule({ onNavigate }) {
  const [countingQubits, setCountingQubits] = useState(4);
  const [phase, setPhase] = useState(0.3125);
  const [shots, setShots] = useState(4096);
  const [result, setResult] = useState(null), [loading, setLoading] = useState(false), [error, setError] = useState("");
  const analysis = useMemo(() => estimateEigenphase(countingQubits, phase), [countingQubits, phase]);
  const operations = useMemo(() => buildQpeOperations(countingQubits, phase), [countingQubits, phase]);
  const code = useMemo(() => generateQiskitPythonCode({ numQubits: countingQubits+1, operations, shots }), [countingQubits, operations, shots]);
  const invalidate = () => { setResult(null); setError(""); };
  const run = async () => {
    if (loading) return;
    setLoading(true); setError(""); setResult(null);
    try { setResult(await executeWithQiskit({ num_qubits: countingQubits+1, operations, shots })); }
    catch (exception) { setError(exception.message || "Qiskit execution failed."); }
    finally { setLoading(false); }
  };
  const sampled = result?.counts ? Object.entries(result.counts).reduce((totals,[key,count]) => {
    const phaseBits = key.replace(/\\s/g,"").slice(-countingQubits), index = Number.parseInt(phaseBits,2);
    totals[index] = (totals[index] || 0) + count; return totals;
  },{}) : null;
  return <main style={s.workspace}>
    <header style={s.header}>
      <button style={s.nav} onClick={() => onNavigate?.("qft")}>← QUANTUM FOURIER TRANSFORM</button>
      <span style={s.eyebrow}>ADVANCED TRANSFORM SYSTEMS // MODULE 3.2</span>
      <strong style={s.tag}>QUANTUM PHASE ESTIMATION</strong>
    </header>
    <div style={s.content}>
      <section style={s.hero}>
        <span style={s.eyebrow}>EIGENVALUES · PHASE KICKBACK · INVERSE QFT</span>
        <h1 style={s.title}>Quantum Phase Estimation</h1>
        <p style={s.copy}>A unitary operation can rotate an eigenstate by a complex phase. Quantum Phase Estimation (QPE) turns that otherwise hidden phase into a binary measurement. The same idea powers quantum phase estimation in chemistry, quantum simulation, and the period-finding step behind Shor's algorithm.</p>
        <div style={s.metrics}>
          <div style={s.metric}><b>U|u⟩ = e²πiφ|u⟩</b><span>eigenvalue to estimate</span></div>
          <div style={s.metric}><b>m counting qubits</b><span>phase precision register</span></div>
          <div style={s.metric}><b>1 / 2ᵐ</b><span>phase grid spacing</span></div>
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.1 THE PROBLEM: A UNITARY'S EIGENPHASE</h2>
        <p style={s.copy}>A unitary matrix U preserves vector lengths and inner products. Its eigenvector |u⟩ is a state that keeps its direction after U acts. Only a complex number, the eigenvalue, changes its phase:</p>
        <Eq formula={"U|u\\rangle=\\lambda|u\\rangle,\\qquad |\\lambda|=1,\\qquad \\lambda=e^{2\\pi i\\phi}"}/>
        <p style={s.copy}>The real number φ is the eigenphase, defined modulo one. QPE estimates φ in the interval [0, 1). The eigenstate is an input resource: this first implementation uses a one-qubit phase gate whose eigenstate |1⟩ has the selected eigenphase.</p>
        <Eq formula={"P(2\\pi\\phi)=\\begin{bmatrix}1&0\\0&e^{2\\pi i\\phi}\\end{bmatrix},\\qquad P(2\\pi\\phi)|1\\rangle=e^{2\\pi i\\phi}|1\\rangle"}/>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.2 PHASE KICKBACK: WHY A COUNTING REGISTER LEARNS THE PHASE</h2>
        <p style={s.copy}>Prepare m counting qubits in |0⟩ and the target in its eigenstate |u⟩. Hadamards create an equal superposition of all integers j from 0 to N−1, where N = 2ᵐ:</p>
        <Eq formula={"|0\\rangle^{\\otimes m}|u\\rangle\\xrightarrow{H^{\\otimes m}}\\frac1{\\sqrt N}\\sum_{j=0}^{N-1}|j\\rangle|u\\rangle"}/>
        <p style={s.copy}>The circuit applies controlled powers U, U², U⁴, and so on. If the counting register contains integer j, the target experiences Uʲ. Because |u⟩ is an eigenstate, Uʲ multiplies it by the eigenvalue raised to j:</p>
        <Eq formula={"U^j|u\\rangle=(e^{2\\pi i\\phi})^j|u\\rangle=e^{2\\pi i j\\phi}|u\\rangle"}/>
        <Eq formula={"\\frac1{\\sqrt N}\\sum_{j=0}^{N-1}e^{2\\pi i j\\phi}|j\\rangle|u\\rangle"}/>
        <p style={s.copy}>The target returns to the same eigenstate. The phase has been transferred into the relative phases of the counting register. This is phase kickback. No measurement has happened yet.</p>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.3 THE CONTROLLED-POWER CIRCUIT</h2>
        <p style={s.copy}>Write j in binary. A counting qubit qₖ contributes 2ᵏ to j when it is |1⟩. Therefore its controlled operation must apply U raised to 2ᵏ. For our phase-gate example, that controlled power is exactly one controlled-phase gate:</p>
        <Eq formula={"U^{2^k}=P(2\\pi\\phi\\,2^k),\\qquad CP(2\\pi\\phi\\,2^k)_{q_k,t}"}/>
        <p style={s.copy}>The least-significant counting wire q0 controls U¹; q1 controls U²; q2 controls U⁴. The target wire is qₘ and begins in |1⟩. This gives a real, executable Qiskit circuit rather than an abstract oracle placeholder.</p>
        <QpeCircuit countingQubits={countingQubits} phase={phase}/>
        <Eq formula={"\\prod_{k=0}^{m-1}e^{2\\pi i\\phi\\,2^k b_k}=e^{2\\pi i\\phi\\sum_k2^kb_k}=e^{2\\pi i\\phi j}"}/>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.4 INVERSE QFT: TURN PHASE INTO BITS</h2>
        <p style={s.copy}>After phase kickback, the counting register contains a phase ramp. If φ has an exact m-bit binary representation, φ = a/N, each amplitude has phase 2πaj/N. The inverse QFT maps that phase ramp to the single basis state |a⟩:</p>
        <Eq formula={"|\\Phi_\\phi\\rangle=\\frac1{\\sqrt N}\\sum_{j=0}^{N-1}e^{2\\pi i j\\phi}|j\\rangle"}/>
        <Eq formula={"QFT_N^\\dagger|\\Phi_{a/N}\\rangle=|a\\rangle,\\qquad a\\in\\{0,\\ldots,N-1\\}"}/>
        <p style={s.copy}>For example, φ = 5/16 = 0.0101₂. Four counting qubits return the bit string 0101 with probability one in an ideal noiseless circuit. The output integer divided by 16 is the phase estimate.</p>
        <Eq formula={"0.0101_2=0/2+1/4+0/8+1/16=5/16=0.3125"}/>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.5 WHEN THE PHASE DOES NOT FIT THE REGISTER</h2>
        <p style={s.copy}>Most phases do not have exactly m binary digits. Then inverse QFT produces a probability distribution instead of one certain answer. The amplitude for observing integer k is a finite geometric sum:</p>
        <Eq formula={"A_k=\\frac1N\\sum_{j=0}^{N-1}e^{2\\pi i j(\\phi-k/N)}"}/>
        <Eq formula={"P(k)=|A_k|^2=\\frac1{N^2}\\left|\\frac{1-e^{2\\pi iN(\\phi-k/N)}}{1-e^{2\\pi i(\\phi-k/N)}}\\right|^2"}/>
        <Eq formula={"P(k)=\\left[\\frac{\\sin(\\pi N(\\phi-k/N))}{N\\sin(\\pi(\\phi-k/N))}\\right]^2"}/>
        <p style={s.copy}>The most likely integer is normally the nearest grid point to Nφ. More counting qubits make the grid finer. The output is an estimate, not a promise that every phase is recovered exactly.</p>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.6 INTERACTIVE EIGENPHASE LABORATORY</h2>
        <p style={s.copy}>Change the eigenphase and counting-register size. The statevector and probability distribution update immediately, before any sampling noise is introduced.</p>
        <div style={s.controls}>
          <div>
            <label style={s.label}>COUNTING REGISTER</label>
            <div style={s.buttonRow}>{[2,3,4,5,6].map((value) => <button key={value} aria-pressed={countingQubits===value} style={{...s.choice,...(countingQubits===value?s.selected:{})}} onClick={() => {setCountingQubits(value);invalidate();}}>{value} qubits</button>)}</div>
          </div>
          <div>
            <label style={s.label} htmlFor="qpe-phase">TRUE EIGENPHASE φ = {phase.toFixed(4)}</label>
            <input id="qpe-phase" aria-label="True eigenphase" type="range" min="0" max="0.999" step="0.001" value={phase} style={s.range} onChange={(event) => {setPhase(Number(event.target.value));invalidate();}}/>
            <div style={s.scaleLabels}><span>0 · eigenvalue +1</span><span>0.5 · eigenvalue −1</span><span>1 · wraps to +1</span></div>
            <div style={s.presets}>
              <button style={s.choice} onClick={() => {setPhase(5/16);invalidate();}}>Exact binary · 5/16</button>
              <button style={s.choice} onClick={() => {setPhase(0.3);invalidate();}}>Non-exact · 0.3</button>
              <button style={s.choice} onClick={() => {setPhase(1/3);invalidate();}}>Repeating · 1/3</button>
              <button style={s.choice} onClick={() => {setPhase(0.618);invalidate();}}>Irrational-like · 0.618</button>
            </div>
          </div>
        </div>
        <div style={s.metrics}>
          <div style={s.metric}><b>{analysis.bitstring}</b><span>most likely measured bits</span></div>
          <div style={s.metric}><b>{analysis.estimate.toFixed(6)}</b><span>estimated eigenphase</span></div>
          <div style={s.metric}><b>{percent(analysis.probability)}</b><span>probability of the best result</span></div>
          <div style={s.metric}><b>{analysis.circularError.toFixed(6)}</b><span>circular phase error</span></div>
        </div>
        <div style={s.columns}>
          <PhaseWheel diagnostics={analysis.diagnostics}/>
          <ProbabilityBars diagnostics={analysis.diagnostics} selectedIndex={analysis.index}/>
        </div>
        <div style={s.dataCard}>
          <h3 style={s.subheading}>BINARY ESTIMATE AND PRECISION</h3>
          <p style={s.copy}>Measured integer: <strong>{analysis.index}</strong> = <code>{analysis.bitstring}</code>₂. Divide by N = {2**countingQubits} to obtain {analysis.index}/{2**countingQubits} = {analysis.estimate.toFixed(6)}.</p>
          <p style={s.note}>The phase grid spacing is 1/N = {(1/2**countingQubits).toFixed(6)}. The nearest-grid estimate can differ from the true phase by up to half a grid interval when rounded to the nearest point. Probabilities describe the ideal circuit; hardware noise and finite shots change observed frequencies.</p>
        </div>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.7 WHAT IF THE TARGET IS A SUPERPOSITION OF EIGENSTATES?</h2>
        <p style={s.copy}>A unitary has an orthonormal eigenbasis. If the target is prepared as a superposition of eigenstates, QPE becomes a measurement of which eigenphase component is present. The probability of observing an eigenphase is the squared magnitude of its coefficient:</p>
        <Eq formula={"|\\psi\\rangle=\\sum_r c_r|u_r\\rangle,\\qquad U|u_r\\rangle=e^{2\\pi i\\phi_r}|u_r\\rangle"}/>
        <Eq formula={"\\operatorname{QPE}\\left(\\frac1{\\sqrt N}\\sum_j|j\\rangle|\\psi\\rangle\\right)=\\sum_r c_r|\\widetilde{\\phi_r}\\rangle|u_r\\rangle"}/>
        <p style={s.copy}>In the ideal exact case, the phase register and eigenstate become correlated. Measuring the phase register samples eigenphase φᵣ with probability |cᵣ|². This lesson starts with one known eigenstate so the phase-estimation mechanism can be isolated and inspected.</p>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.8 COST, PRECISION AND APPLICATIONS</h2>
        <p style={s.copy}>An m-qubit counting register resolves phase on a grid of N = 2ᵐ points. The inverse QFT uses m Hadamards, m(m−1)/2 controlled-phase gates and floor(m/2) swaps. QPE additionally needs controlled U powers with exponents 1, 2, 4, …, 2ᵐ⁻¹.</p>
        <Eq formula={"N=2^m,\\qquad \\Delta\\phi=1/N=2^{-m}"}/>
        <p style={s.copy}>The cost of implementing U raised to large powers depends on the physical problem. A black-box model may count controlled-U calls; a gate-level model must account for the cost of building those powers. Approximate inverse QFT can reduce small rotations, but it changes the error distribution.</p>
        <ul style={s.list}>
          <li><strong>Quantum chemistry:</strong> estimate molecular energy eigenvalues from controlled time-evolution operators.</li>
          <li><strong>Quantum simulation:</strong> measure eigenphases of a simulated evolution operator.</li>
          <li><strong>Order finding:</strong> recover periodic structure used by Shor's factoring algorithm.</li>
          <li><strong>Amplitude estimation:</strong> use phase estimation on a Grover-like iterate to estimate probabilities.</li>
        </ul>
      </section>

      <section style={s.section}>
        <h2 style={s.heading}>// 3.2.9 EXECUTE THE FULL CIRCUIT WITH QISKIT + AER</h2>
        <p style={s.copy}>This sends the actual controlled-phase gate sequence and inverse-QFT gates to Qiskit. The backend returns the full complex statevector, exact basis probabilities and finite-shot measurement counts. The target eigenstate is included in the response; the phase-register counts are grouped below.</p>
        <label style={s.label}>MEASUREMENT SHOTS <select style={s.select} value={shots} onChange={(event) => {setShots(Number(event.target.value));invalidate();}}><option value={512}>512</option><option value={4096}>4,096</option><option value={16384}>16,384</option></select></label>
        <QiskitExecutionPanel operations={operations} code={code} result={result} loading={loading} error={error} onRun={run} shots={shots}/>
        {sampled && <div style={{...s.dataCard,marginTop:"1rem"}}>
          <h3 style={s.subheading}>SAMPLED PHASE-REGISTER COUNTS</h3>
          {Array.from({length:2**countingQubits},(_,index)=>({index,count:sampled[index]||0})).map((item)=><div key={item.index} style={s.probabilityRow}>
            <div style={s.probabilityLabel}><code>{bits(item.index,countingQubits)}</code><span>{item.count} shots</span></div>
            <div style={s.track}><div style={{...s.fill,width:percent(item.count/shots)}}/></div>
          </div>)}
        </div>}
      </section>
    </div>
    <AIAssistant moduleTitle="Quantum Phase Estimation" lessonContext="Derive QPE from U|u>=exp(2πiφ)|u>. Prepare counting Hadamards and target eigenstate |1> of P(2πφ), apply controlled U^(2^k) operations by controlled-phase gates, derive phase kickback, apply inverse QFT, explain exact binary phases versus non-exact probability distributions using the finite geometric sum, eigenstate superpositions, precision and applications. q0 is the least-significant counting bit; target is q_m." simulatorContext={{countingQubits,phase,operations,idealEstimate:analysis.estimate,mostLikelyBits:analysis.bitstring,probability:analysis.probability,distribution:analysis.diagnostics,qiskitResult:result}}/>
  </main>;
}

const s = {
  workspace:{minHeight:"100vh",background:"#030712",color:"#e5e7eb",paddingBottom:"5rem",fontFamily:"system-ui,sans-serif"},
  header:{minHeight:58,display:"flex",alignItems:"center",gap:"1rem",padding:"0 1.25rem",borderBottom:"1px solid rgba(6,182,212,.18)",background:"#080e18",flexWrap:"wrap"},
  nav:{background:"transparent",border:"1px solid rgba(16,185,129,.35)",color:"#a7f3d0",padding:".5rem .7rem",fontFamily:"monospace",fontSize:".68rem",cursor:"pointer"},
  eyebrow:{color:"#67e8f9",fontFamily:"monospace",fontSize:".65rem",letterSpacing:".1em"},
  tag:{marginLeft:"auto",color:"#6ee7b7",fontFamily:"monospace",fontSize:".68rem"},
  content:{width:"min(1120px,calc(100% - 2rem))",margin:"0 auto"},
  hero:{padding:"3.5rem 0 2rem",borderBottom:"1px solid rgba(148,163,184,.12)"},
  title:{margin:".6rem 0 1rem",color:"#f8fafc",fontSize:"clamp(2rem,5vw,3.5rem)",letterSpacing:"-.04em",lineHeight:1.05},
  copy:{color:"#cbd5e1",fontSize:".94rem",lineHeight:1.8,margin:".8rem 0"},
  metrics:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:".7rem",marginTop:"1.5rem"},
  metric:{padding:"1rem",background:"#0b1420",border:"1px solid #263648",display:"flex",flexDirection:"column",gap:".35rem"},
  section:{padding:"2rem 0",borderBottom:"1px solid rgba(148,163,184,.12)"},
  heading:{color:"#6ee7b7",fontFamily:"monospace",fontSize:".78rem",letterSpacing:".08em",margin:"0 0 1rem"},
  subheading:{color:"#a5f3fc",fontSize:".95rem",margin:"0 0 .8rem"},
  equation:{overflowX:"auto",margin:"1rem 0",padding:".9rem 1rem",border:"1px solid rgba(34,211,238,.14)",background:"rgba(8,20,31,.7)",borderRadius:4,color:"#e0f2fe"},
  note:{color:"#94a3b8",fontSize:".75rem",lineHeight:1.65,margin:".7rem 0"},
  circuitWrap:{overflowX:"auto",padding:"1rem",background:"#080f19",border:"1px solid #263648",borderRadius:5,margin:"1rem 0"},
  controls:{display:"grid",gap:"1.2rem",padding:"1.2rem",background:"#0b1420",border:"1px solid #263648",borderRadius:5,margin:"1rem 0"},
  label:{display:"block",color:"#67e8f9",fontFamily:"monospace",fontSize:".68rem",letterSpacing:".07em",marginBottom:".5rem"},
  buttonRow:{display:"flex",flexWrap:"wrap",gap:".5rem"},
  choice:{padding:".55rem .8rem",background:"#080f19",border:"1px solid #334155",color:"#cbd5e1",cursor:"pointer",fontSize:".78rem"},
  selected:{borderColor:"#10b981",color:"#6ee7b7",background:"rgba(16,185,129,.1)"},
  range:{width:"100%",accentColor:"#10b981"},
  scaleLabels:{display:"flex",justifyContent:"space-between",gap:".5rem",color:"#94a3b8",fontSize:".68rem",marginTop:".3rem"},
  presets:{display:"flex",flexWrap:"wrap",gap:".5rem",marginTop:".7rem"},
  select:{padding:".5rem .65rem",background:"#0b1420",border:"1px solid #334155",color:"#e5e7eb"},
  columns:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,390px),1fr))",gap:".8rem",margin:"1rem 0"},
  dataCard:{minWidth:0,padding:"1rem",background:"#0b1420",border:"1px solid #263648",borderRadius:5},
  probabilityRow:{display:"grid",gap:".3rem",margin:".6rem 0"},
  probabilityLabel:{display:"flex",justifyContent:"space-between",color:"#cbd5e1",fontSize:".75rem"},
  track:{height:7,background:"#1e293b",overflow:"hidden"},
  fill:{height:"100%",background:"#10b981",transition:"width .2s ease"},
  list:{color:"#cbd5e1",fontSize:".9rem",lineHeight:1.9,paddingLeft:"1.2rem"},
};