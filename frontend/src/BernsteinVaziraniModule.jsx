import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import { executeWithQiskit } from "./qiskitApi";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { generateQiskitPythonCode } from "./qiskitCode";
import AIAssistant from "./AIAssistant";
import { BERNSTEIN_VAZIRANI_INPUT_QUBITS, runBernsteinVazirani } from "./bernsteinVazirani";

const bitString = (bits) => bits.join("");
const Equation = ({ formula }) => <div style={styles.equation}><MathRenderer formula={formula} displayMode /></div>;

export default function BernsteinVaziraniModule({ onNavigate }) {
  const [secret, setSecret] = useState([1, 0, 1]);
  const [shots, setShots] = useState(1000);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);
  const result = useMemo(() => runBernsteinVazirani(secret), [secret]);
  const pythonCode = useMemo(() => generateQiskitPythonCode({
    numQubits: BERNSTEIN_VAZIRANI_INPUT_QUBITS + 1, operations: result.operations, shots,
  }), [result.operations, shots]);

  const toggleSecretBit = (index) => {
    setSecret((current) => current.map((bit, position) => position === index ? 1 - bit : bit));
    setQiskitResult(null);
    setQiskitError("");
  };
  const chooseSecret = (value) => {
    setSecret(value.toString(2).padStart(3, "0").split("").map(Number));
    setQiskitResult(null);
    setQiskitError("");
  };
  const runOnQiskit = async () => {
    if (qiskitLoading) return;
    setQiskitLoading(true);
    setQiskitError("");
    setQiskitResult(null);
    try {
      const operations = result.operations.map((operation) => operation.name === "CX"
        ? { name: "CX", control: operation.control, target: operation.target }
        : { name: operation.name.toUpperCase(), qubit: operation.target });
      setQiskitResult(await executeWithQiskit({
        num_qubits: BERNSTEIN_VAZIRANI_INPUT_QUBITS + 1, operations, shots,
      }));
    } catch (error) {
      setQiskitError(error.message || "Qiskit execution failed.");
    } finally {
      setQiskitLoading(false);
    }
  };

  return <main style={styles.workspace}>
    <header style={styles.header}>
      <button type="button" style={styles.navButton} onClick={() => onNavigate?.("3.2")}>← DEUTSCH–JOZSA</button>
      <span style={styles.eyebrow}>QUANTUM ALGORITHMS // MODULE 2.3</span>
      <span style={styles.tag}>BERNSTEIN–VAZIRANI</span>
    </header>
    <div style={styles.content}>
      <section style={styles.hero}>
        <span style={styles.eyebrow}>ONE QUERY · THREE SECRET BITS · EXACT RECOVERY</span>
        <h1 style={styles.title}>Bernstein–Vazirani algorithm</h1>
        <p style={styles.copy}>A black-box function hides a bit string. Each query reveals only the parity of the input bits selected by that hidden string. A quantum circuit uses phase kickback and interference to recover every bit in one oracle query.</p>
        <div style={styles.metrics}>
          <div><strong>1</strong><span>quantum oracle query</span></div>
          <div><strong>3</strong><span>classical queries in the deterministic basis-query model</span></div>
          <div><strong>100%</strong><span>ideal success probability</span></div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.1 THE HIDDEN BIT STRING</h2>
        <p style={styles.copy}>The unknown secret is s = s₂s₁s₀. The oracle accepts a three-bit input x = x₂x₁x₀ and returns the bitwise inner product modulo 2. Multiplication is ordinary bit multiplication; addition is XOR, so pairs of 1s cancel in even parity.</p>
        <Equation formula={String.raw`f_s(x)=s\cdot x\pmod 2=s_0x_0\oplus s_1x_1\oplus s_2x_2`} />
        <p style={styles.copy}>For example, if s = 101 and x = 110, then only the first displayed bit contributes: 1×1 ⊕ 0×1 ⊕ 1×0 = 1. The oracle returns one parity bit, not the secret itself.</p>
        <div style={styles.secretCard}>
          <div><span style={styles.label}>HIDDEN STRING s₂s₁s₀</span><strong style={styles.secret}>{bitString(secret)}</strong></div>
          <div style={styles.bitControls}>{secret.map((bit, index) => <button key={index} type="button" aria-pressed={Boolean(bit)} aria-label={`Toggle secret bit s${2-index}`} onClick={() => toggleSecretBit(index)} style={{...styles.bitButton, ...(bit ? styles.bitOn : {})}}>s{2-index}: {bit}</button>)}</div>
          <div style={styles.presets}>{[0,1,2,3,4,5,6,7].map((value) => <button key={value} type="button" aria-pressed={Number(bitString(secret)) === value} onClick={() => chooseSecret(value)} style={{...styles.preset, ...(Number(bitString(secret)) === value ? styles.presetActive : {})}}>s = {value.toString(2).padStart(3,"0")}</button>)}</div>
        </div>
        <h3 style={styles.subheading}>Inspect the oracle truth table</h3>
        <p style={styles.copy}>Each row evaluates the parity function for one possible input. Toggle the secret above and every output is recalculated.</p>
        <div style={styles.table}>
          <div style={styles.tableHead}><span>INPUT x</span><span>BIT PRODUCTS</span><span>fₛ(x)</span></div>
          {Array.from({length:8},(_,value)=>value).map((value)=>{
            const x=value.toString(2).padStart(3,"0").split("").map(Number);
            const products=secret.map((bit,index)=>bit*x[index]);
            const output=products.reduce((sum,bit)=>sum^bit,0);
            return <div key={value} style={styles.tableRow}><code>{x.join("")}</code><span>{products.join(" ⊕ ")}</span><strong>{output}</strong></div>;
          })}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.2 MAKE THE FUNCTION REVERSIBLE</h2>
        <p style={styles.copy}>A quantum gate must be reversible. We therefore keep the input x and XOR the function result into a separate target bit y:</p>
        <Equation formula={String.raw`U_{f_s}|x,y\rangle=|x,\ y\oplus f_s(x)\rangle`} />
        <p style={styles.copy}>For a secret bit sᵢ = 1, the corresponding input qubit controls a CNOT into the target. If sᵢ = 0, that CNOT is absent. The target therefore receives the XOR of exactly the selected input bits.</p>
        <div style={styles.circuit}>
          <svg viewBox="0 0 820 270" width="100%" role="img" aria-label="Bernstein Vazirani circuit: target X and Hadamard preparation, one CNOT from each secret one-bit input to the target, final Hadamards on the input register, and measurement">
            {[0,1,2,3].map((q)=><g key={q}><text x="15" y={50+q*52} fill={q===3?"#c4b5fd":"#67e8f9"} fontSize="13" fontFamily="monospace">q{q}{q===3?" · target":" · input"}</text><line x1="115" y1={45+q*52} x2="795" y2={45+q*52} stroke="#475569" strokeWidth="2"/></g>)}
            {[0,1,2,3].map((q)=><g key={q}><rect x="175" y={27+q*52} width="36" height="36" rx="4" fill="#0b1720" stroke="#34d399" strokeWidth="2"/><text x="193" y={51+q*52} fill="#d1fae5" textAnchor="middle" fontSize="14">H</text></g>)}
            <rect x="325" y="18" width="185" height="205" rx="5" fill="#10252b" stroke="#22d3ee" strokeWidth="2"/>
            <text x="417" y="105" fill="#a5f3fc" textAnchor="middle" fontSize="19" fontFamily="monospace">U_fₛ</text><text x="417" y="130" fill="#94a3b8" textAnchor="middle" fontSize="11">CNOTs for sᵢ = 1</text>
            {secret.map((bit,index)=>bit?<g key={index}><line x1="417" y1={45+(2-index)*52} x2="417" y2="201" stroke="#22d3ee" strokeWidth="1.5"/><circle cx="417" cy={45+(2-index)*52} r="5" fill="#22d3ee"/><circle cx="417" cy="201" r="8" fill="none" stroke="#22d3ee" strokeWidth="2"/><path d="M409 201H425 M417 193V209" stroke="#22d3ee" strokeWidth="2"/></g>:null)}
            {[0,1,2].map((q)=><g key={q}><rect x="580" y={27+q*52} width="36" height="36" rx="4" fill="#0b1720" stroke="#34d399" strokeWidth="2"/><text x="598" y={51+q*52} fill="#d1fae5" textAnchor="middle" fontSize="14">H</text><rect x="690" y={27+q*52} width="36" height="36" rx="4" fill="#172033" stroke="#a78bfa" strokeWidth="2"/><text x="708" y={51+q*52} fill="#ddd6fe" textAnchor="middle" fontSize="13">M</text></g>)}
            <text x="193" y="255" fill="#94a3b8" textAnchor="middle" fontSize="11">Prepare |+⟩³|−⟩</text><text x="417" y="255" fill="#94a3b8" textAnchor="middle" fontSize="11">Secret-dependent oracle</text><text x="650" y="255" fill="#94a3b8" textAnchor="middle" fontSize="11">Interference + readout</text>
          </svg>
          <p style={styles.note}>The highlighted CNOT connections update when the hidden string changes. The oracle is one invocation even though its reversible circuit contains up to three CNOT gates.</p>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.3 DERIVE THE ANSWER STEP BY STEP</h2>
        <p style={styles.copy}>Begin with the input register in |000⟩ and the target in |1⟩:</p>
        <Equation formula={String.raw`|\psi_0\rangle=|000\rangle|1\rangle`} />
        <p style={styles.copy}>Hadamard gates create an equal superposition over every possible input and prepare the target in the minus state:</p>
        <Equation formula={String.raw`|\psi_1\rangle=\frac{1}{\sqrt8}\sum_{x\in\{0,1\}^3}|x\rangle|{-}\rangle,qquad |{-}\rangle=\frac{|0\rangle-|1\rangle}{\sqrt2}`} />
        <p style={styles.copy}>The reversible oracle flips the target when fₛ(x)=1. But |−⟩ is an eigenstate of X with eigenvalue −1. A target flip therefore changes only the sign of that input term:</p>
        <Equation formula={String.raw`U_{f_s}|x\rangle|{-}\rangle=(-1)^{f_s(x)}|x\rangle|{-}\rangle`} />
        <Equation formula={String.raw`|\psi_2\rangle=\frac{1}{\sqrt8}\sum_x(-1)^{s\cdot x}|x\rangle|{-}\rangle`} />
        <p style={styles.copy}>Apply the final Hadamard to each input qubit. The identity below follows by applying H separately to each bit and multiplying the resulting signs:</p>
        <Equation formula={String.raw`H^{\otimes3}|x\rangle=\frac{1}{\sqrt8}\sum_{z\in\{0,1\}^3}(-1)^{x\cdot z}|z\rangle`} />
        <p style={styles.copy}>Collect the amplitude of an arbitrary output z. The two parity exponents combine by XOR, which is addition modulo two:</p>
        <Equation formula={String.raw`A(z)=\frac18\sum_x(-1)^{s\cdot x+x\cdot z}=\frac18\sum_x(-1)^{(s\oplus z)\cdot x}`} />
        <p style={styles.copy}>If z=s, every exponent is zero and all eight terms add. If z differs from s in at least one bit, pair each x with the string obtained by flipping that differing bit. The two terms have opposite signs and cancel. Therefore:</p>
        <Equation formula={String.raw`A(z)=\begin{cases}1,&z=s\\0,&z\ne s\end{cases}\qquad\Longrightarrow\qquad |\psi_3\rangle=|s\rangle|{-}\rangle`} />
        <p style={styles.copy}>The measurement returns the hidden string exactly in the ideal circuit. No guessing and no repeated sampling are needed to identify s.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.4 LOCAL STATEVECTOR RESULT</h2>
        <div style={styles.resultCard}><span style={styles.label}>RECOVERED HIDDEN STRING</span><strong style={styles.recovered}>{result.recoveredSecret ? bitString(result.recoveredSecret) : "No deterministic output"}</strong><p style={styles.copy}>Selected secret: {bitString(secret)}. Ideal recovery probability: {(result.successProbability*100).toFixed(4)}%.</p></div>
        <div style={styles.probabilities}>{result.outputProbabilities.map((probability,index)=><div key={index} style={styles.probability}><div><code>{index.toString(2).padStart(3,"0")}</code><b>{(probability*100).toFixed(2)}%</b></div><div style={styles.track}><div style={{...styles.fill,width:(probability*100)+"%"}}/></div></div>)}</div>
        <p style={styles.note}>Probabilities are calculated from the complex statevector, then summed over the target-qubit outcomes. They are not hard-coded from the selected secret.</p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.5 RUN THE SAME CIRCUIT WITH QISKIT</h2>
        <p style={styles.copy}>The generated Python circuit uses the same preparation, CNOT oracle, and final Hadamard operations as the local simulator. Qiskit returns an exact statevector and sampled measurement counts.</p>
        <label style={styles.shotsLabel}>Measurement shots <select style={styles.select} value={shots} onChange={(event)=>{setShots(Number(event.target.value));setQiskitResult(null);}}><option value={100}>100</option><option value={1000}>1,000</option><option value={10000}>10,000</option></select></label>
        <QiskitExecutionPanel operations={result.operations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={runOnQiskit} shots={shots}/>
      </section>

      <section style={styles.section}>
        <h2 style={styles.heading}>// 2.3.6 QUERY COMPLEXITY: WHAT IS BEING COUNTED?</h2>
        <p style={styles.copy}>A classical deterministic algorithm can recover all three secret bits by querying the three standard basis inputs 100, 010, and 001. Their outputs are s₂, s₁, and s₀ respectively. In this restricted query model, three queries suffice and are necessary because each query returns only one bit. The quantum algorithm obtains all three bits with one call to the reversible oracle.</p>
        <Equation formula={String.raw`Q_{\mathrm{classical}}=n=3,\qquad Q_{\mathrm{quantum}}=1`} />
        <p style={styles.note}>This is an oracle-query comparison. It does not claim that total runtime or physical hardware cost is reduced by a factor of three. The quantum oracle acts coherently on a superposition, and its implementation cost is not free.</p>
      </section>
    </div>
    <AIAssistant moduleTitle="Bernstein–Vazirani Algorithm" lessonContext="Three-input Bernstein–Vazirani algorithm. Hidden bit string s, parity oracle f_s(x)=s dot x mod 2, reversible XOR oracle, phase kickback, Hadamard transform, cancellation proof, exact one-query recovery, and classical basis-query lower bound." simulatorContext={{secret, recoveredSecret:result.recoveredSecret, successProbability:result.successProbability, outputProbabilities:result.outputProbabilities, oracleOperations:result.oracle, qiskitResult}}/>
  </main>;
}

const styles = {
  workspace:{minHeight:"100vh",background:"#030712",color:"#e5e7eb",paddingBottom:"5rem",fontFamily:"system-ui,sans-serif"},
  header:{minHeight:58,display:"flex",alignItems:"center",gap:"1rem",padding:"0 1.25rem",borderBottom:"1px solid rgba(6,182,212,.18)",background:"#080e18",flexWrap:"wrap"},
  navButton:{background:"transparent",border:"1px solid rgba(16,185,129,.35)",color:"#a7f3d0",padding:".5rem .7rem",fontFamily:"monospace",fontSize:".68rem",cursor:"pointer"},
  eyebrow:{color:"#67e8f9",fontFamily:"monospace",fontSize:".65rem",letterSpacing:".1em"},
  tag:{marginLeft:"auto",color:"#6ee7b7",fontFamily:"monospace",fontSize:".68rem"},
  content:{width:"min(1050px,calc(100% - 2rem))",margin:"0 auto"},
  hero:{padding:"3.5rem 0 2rem",borderBottom:"1px solid rgba(148,163,184,.12)"},
  title:{margin:".6rem 0 1rem",color:"#f8fafc",fontSize:"clamp(2rem,5vw,3.5rem)",letterSpacing:"-.04em",lineHeight:1.05},
  copy:{color:"#cbd5e1",fontSize:".94rem",lineHeight:1.8,margin:".8rem 0"},
  metrics:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:".7rem",marginTop:"1.5rem"},
  section:{padding:"2rem 0",borderBottom:"1px solid rgba(148,163,184,.12)"},
  heading:{color:"#6ee7b7",fontFamily:"monospace",fontSize:".78rem",letterSpacing:".08em",margin:"0 0 1rem"},
  subheading:{color:"#a5f3fc",fontSize:"1rem",marginTop:"1.4rem"},
  equation:{overflowX:"auto",margin:"1rem 0",padding:".9rem 1rem",border:"1px solid rgba(34,211,238,.14)",background:"rgba(8,20,31,.7)",borderRadius:4,color:"#e0f2fe"},
  secretCard:{padding:"1rem",background:"#0b1420",border:"1px solid #263648",display:"grid",gap:"1rem"},
  label:{color:"#67e8f9",fontFamily:"monospace",fontSize:".68rem",letterSpacing:".08em"},
  secret:{display:"block",fontSize:"2rem",letterSpacing:".35em",color:"#6ee7b7",fontFamily:"monospace",marginTop:".4rem"},
  bitControls:{display:"flex",gap:".5rem",flexWrap:"wrap"},
  bitButton:{padding:".55rem .8rem",background:"#111c2a",border:"1px solid #334155",color:"#cbd5e1",cursor:"pointer",fontFamily:"monospace"},
  bitOn:{borderColor:"#10b981",color:"#6ee7b7",background:"rgba(16,185,129,.1)"},
  presets:{display:"flex",gap:".45rem",flexWrap:"wrap"},
  preset:{padding:".45rem .6rem",background:"#080f19",border:"1px solid #334155",color:"#94a3b8",cursor:"pointer",fontFamily:"monospace",fontSize:".72rem"},
  presetActive:{borderColor:"#10b981",color:"#6ee7b7"},
  table:{border:"1px solid #263648",background:"#080f19",marginTop:"1rem"},
  tableHead:{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",padding:".65rem .8rem",color:"#94a3b8",fontFamily:"monospace",fontSize:".65rem",borderBottom:"1px solid #263648"},
  tableRow:{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",padding:".55rem .8rem",borderBottom:"1px solid rgba(51,65,85,.45)",alignItems:"center",color:"#cbd5e1"},
  circuit:{overflowX:"auto",padding:"1rem",background:"#080f19",border:"1px solid #263648",borderRadius:5},
  note:{color:"#94a3b8",fontSize:".78rem",lineHeight:1.65,margin:".8rem 0"},
  resultCard:{padding:"1.2rem",background:"#0b1420",border:"1px solid #1e3a4a",borderRadius:5},
  recovered:{display:"block",fontSize:"2rem",fontFamily:"monospace",color:"#6ee7b7",margin:".5rem 0"},
  probabilities:{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:".7rem",marginTop:"1rem"},
  probability:{padding:".7rem",background:"#080f19",border:"1px solid #263648"},
  track:{height:6,background:"#1e293b",marginTop:".45rem",overflow:"hidden"},
  fill:{height:"100%",background:"#10b981",transition:"width .2s ease"},
  shotsLabel:{display:"flex",alignItems:"center",gap:".75rem",color:"#cbd5e1",fontSize:".8rem",margin:"1rem 0"},
  select:{padding:".45rem .6rem",background:"#0b1420",border:"1px solid #334155",color:"#e5e7eb"},
};
