import React, { useMemo, useState } from "react";
import MathRenderer from "./MathRenderer";
import AIAssistant from "./AIAssistant";
import QiskitExecutionPanel from "./components/single-qubit/QiskitExecutionPanel";
import { executeWithQiskit } from "./qiskitApi";
import { generateQiskitPythonCode } from "./qiskitCode";
import { createZeroRegister, getRegisterProbabilities, runMultiQubitCircuit } from "./multiQubitCircuit";
import { analyzeTwoQubitEntanglement, BELL_STATE_PRESETS } from "./twoQubitEntanglement";

const BASIS = ["00", "01", "10", "11"];
const BELL_INFO = {
  "Phi+": { symbol: "Φ⁺", ket: "(|00⟩ + |11⟩) / √2", z: "same", x: "same", description: "The two qubits have matching Z outcomes and matching X outcomes." },
  "Phi-": { symbol: "Φ⁻", ket: "(|00⟩ − |11⟩) / √2", z: "same", x: "opposite", description: "The relative minus sign is invisible to Z-basis probabilities, but appears as opposite X outcomes." },
  "Psi+": { symbol: "Ψ⁺", ket: "(|01⟩ + |10⟩) / √2", z: "opposite", x: "same", description: "The computational bits are opposite, while X-basis outcomes match." },
  "Psi-": { symbol: "Ψ⁻", ket: "(|01⟩ − |10⟩) / √2", z: "opposite", x: "opposite", description: "Both complementary measurement settings give opposite outcomes. This is the singlet Bell state." },
};
const ZERO = () => createZeroRegister(2);
const cloneOperations = (operations) => operations.map((operation) => ({ ...operation }));
const complexText = (value) => value.re.toFixed(3) + (value.im < 0 ? " − " : " + ") + Math.abs(value.im).toFixed(3) + "i";
const percent = (value) => (value * 100).toFixed(1) + "%";

function Eq({ children }) {
  return <div style={s.equation}><MathRenderer formula={children} displayMode /></div>;
}
function Section({ number, title, children }) {
  return <section style={s.section}><h2 style={s.sectionTitle}>// {number} {title}</h2>{children}</section>;
}
function Metric({ label, value, note }) {
  return <div style={s.metric}><span style={s.metricLabel}>{label}</span><strong style={s.metricValue}>{value}</strong>{note && <small style={s.muted}>{note}</small>}</div>;
}
function AmplitudeMap({ state }) {
  const probabilities = getRegisterProbabilities(state);
  return <div style={s.amplitudeGrid}>
    {state.amplitudes.map((amplitude, index) => {
      const probability = probabilities[index];
      const phase = Math.atan2(amplitude.im, amplitude.re) * 180 / Math.PI;
      const magnitude = Math.hypot(amplitude.re, amplitude.im);
      const angle = phase * Math.PI / 180;
      const x = 42 + Math.cos(angle) * magnitude * 28;
      const y = 42 - Math.sin(angle) * magnitude * 28;
      return <div key={BASIS[index]} style={s.amplitudeCard}>
        <svg viewBox="0 0 84 84" role="img" aria-label={BASIS[index] + " amplitude magnitude " + magnitude.toFixed(3) + " phase " + phase.toFixed(1) + " degrees"} style={s.argand}>
          <circle cx="42" cy="42" r="29" fill="none" stroke="#1e3a4a" strokeDasharray="3 4" />
          <path d="M8 42H76 M42 8V76" stroke="#334155" />
          {magnitude > 0.000001 && <line x1="42" y1="42" x2={x} y2={y} stroke="#34d399" strokeWidth="2.8" />}
          <circle cx={x} cy={y} r="3.2" fill="#67e8f9" />
        </svg>
        <b>|{BASIS[index]}⟩</b>
        <strong>{percent(probability)}</strong>
        <small>{complexText(amplitude)}</small>
        <small style={s.muted}>{magnitude < 1e-8 ? "phase undefined" : phase.toFixed(1) + "° phase"}</small>
      </div>;
    })}
  </div>;
}
function EntanglementLink({ bellName }) {
  const info = BELL_INFO[bellName] || BELL_INFO["Phi+"];
  return <div style={s.linkFrame}>
    <svg viewBox="0 0 720 190" role="img" aria-label={"Two separated qubits connected by one joint entangled state, " + info.symbol} style={{ width: "100%" }}>
      <defs>
        <linearGradient id="entanglement-link-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="50%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
        <filter id="entanglement-link-glow"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <path d="M142 86 C250 8 470 8 578 86" fill="none" stroke="url(#entanglement-link-gradient)" strokeWidth="3" filter="url(#entanglement-link-glow)" />
      <path d="M142 102 C250 180 470 180 578 102" fill="none" stroke="#155e75" strokeWidth="1.5" strokeDasharray="5 7" />
      <circle cx="110" cy="94" r="42" fill="#0b2533" stroke="#22d3ee" strokeWidth="2" />
      <circle cx="610" cy="94" r="42" fill="#0b2533" stroke="#22d3ee" strokeWidth="2" />
      <text x="110" y="101" textAnchor="middle" fill="#cffafe" fontSize="22" fontWeight="700">q0</text>
      <text x="610" y="101" textAnchor="middle" fill="#cffafe" fontSize="22" fontWeight="700">q1</text>
      <rect x="273" y="63" width="174" height="58" rx="12" fill="#071525" stroke="#166534" />
      <text x="360" y="86" textAnchor="middle" fill="#a7f3d0" fontSize="12" fontFamily="monospace">ONE JOINT STATE</text>
      <text x="360" y="105" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="700">{info.symbol}</text>
      <text x="110" y="158" textAnchor="middle" fill="#94a3b8" fontSize="11">50/50 locally</text>
      <text x="610" y="158" textAnchor="middle" fill="#94a3b8" fontSize="11">50/50 locally</text>
    </svg>
    <p style={s.smallCopy}>The connecting curve represents shared quantum correlations, not a physical message travelling between the qubits. Neither endpoint can choose its random local result.</p>
  </div>;
}

function CircuitDiagram({ bellName }) {
  return <div style={s.circuitFrame}>
    <div style={s.circuitLabel}>BELL-PAIR PREPARATION · {BELL_INFO[bellName].symbol}</div>
    <svg viewBox="0 0 620 164" role="img" aria-label={"Circuit preparing Bell state " + bellName} style={{ width: "100%" }}>
      <text x="18" y="50" fill="#67e8f9" fontSize="14" fontFamily="monospace">q1</text>
      <text x="18" y="116" fill="#67e8f9" fontSize="14" fontFamily="monospace">q0</text>
      <path d="M48 46H594 M48 112H594" stroke="#64748b" strokeWidth="1.5" />
      <rect x="90" y="91" width="42" height="42" rx="6" fill="#123b43" stroke="#34d399" />
      <text x="111" y="117" textAnchor="middle" fill="#d1fae5" fontSize="18" fontWeight="700">H</text>
      <path d="M275 46V112" stroke="#34d399" strokeWidth="2" />
      <circle cx="275" cy="112" r="5" fill="#34d399" />
      <circle cx="275" cy="46" r="14" fill="none" stroke="#34d399" strokeWidth="2" />
      <path d="M275 32V60 M261 46H289" stroke="#34d399" strokeWidth="2" />
      {bellName === "Psi+" || bellName === "Psi-" ? <g><rect x="350" y="25" width="42" height="42" rx="6" fill="#123b43" stroke="#34d399" /><text x="371" y="51" textAnchor="middle" fill="#d1fae5" fontSize="18" fontWeight="700">X</text></g> : null}
      {bellName === "Phi-" || bellName === "Psi-" ? <g><rect x="420" y="25" width="42" height="42" rx="6" fill="#3b2c19" stroke="#fbbf24" /><text x="441" y="51" textAnchor="middle" fill="#fef3c7" fontSize="18" fontWeight="700">Z</text></g> : null}
      <text x="420" y="43" fill="#94a3b8" fontSize="11">target</text>
      <text x="420" y="109" fill="#94a3b8" fontSize="11">control</text>
      <text x="48" y="151" fill="#64748b" fontSize="10">q0 is the rightmost bit in |q1q0⟩ and controls the CNOT</text>
    </svg>
  </div>;
}

export default function EntanglementModule({ onNavigate }) {
  const [bellName, setBellName] = useState("Phi+");
  const [operations, setOperations] = useState(cloneOperations(BELL_STATE_PRESETS["Phi+"]));
  const [customTheta, setCustomTheta] = useState(Math.PI / 4);
  const [measurementBasis, setMeasurementBasis] = useState("Z");
  const [menuOpen, setMenuOpen] = useState(false);
  const [qiskitLoading, setQiskitLoading] = useState(false);
  const [qiskitError, setQiskitError] = useState("");
  const [qiskitResult, setQiskitResult] = useState(null);

  const state = useMemo(() => runMultiQubitCircuit(ZERO(), operations), [operations]);
  const diagnostics = useMemo(() => analyzeTwoQubitEntanglement(state), [state]);
  const probabilities = useMemo(() => getRegisterProbabilities(state), [state]);
  const measurementOperations = useMemo(() => measurementBasis === "X"
    ? [...operations, { name: "H", target: 0 }, { name: "H", target: 1 }]
    : operations, [operations, measurementBasis]);
  const measurementState = useMemo(() => runMultiQubitCircuit(ZERO(), measurementOperations), [measurementOperations]);
  const measurementProbabilities = useMemo(() => getRegisterProbabilities(measurementState), [measurementState]);
  const sameParity = measurementProbabilities[0] + measurementProbabilities[3];
  const oppositeParity = measurementProbabilities[1] + measurementProbabilities[2];
  const isBellPreset = Boolean(BELL_STATE_PRESETS[bellName]);
  const bellInfo = BELL_INFO[bellName] || null;
  const qiskitOperations = useMemo(() => measurementOperations.map((operation) => {
    if (["CNOT", "CX"].includes(operation.name.toUpperCase())) return { name: "CX", control: operation.control, target: operation.target };
    if (["CZ", "SWAP"].includes(operation.name.toUpperCase())) return { name: operation.name.toUpperCase(), first: operation.first, second: operation.second };
    return { name: operation.name.toUpperCase(), qubit: operation.target, theta: operation.theta };
  }), [measurementOperations]);
  const pythonCode = useMemo(() => generateQiskitPythonCode({ numQubits: 2, operations: qiskitOperations, shots: 1000 }), [qiskitOperations]);

  const clearExecution = () => { setQiskitResult(null); setQiskitError(""); };
  const loadBell = (name) => {
    setBellName(name);
    setOperations(cloneOperations(BELL_STATE_PRESETS[name]));
    setMeasurementBasis("Z");
    clearExecution();
  };
  const loadPartial = (value) => {
    const theta = Number(value);
    setCustomTheta(theta);
    setBellName("Partial");
    setOperations([
      { name: "RY", target: 0, theta: 2 * theta },
      { name: "CNOT", control: 0, target: 1 },
    ]);
    setMeasurementBasis("Z");
    clearExecution();
  };
  const loadProduct = () => {
    setBellName("Product");
    setOperations([{ name: "H", target: 0 }, { name: "H", target: 1 }]);
    setMeasurementBasis("Z");
    clearExecution();
  };
  const runOnQiskit = async () => {
    if (!measurementOperations.length || qiskitLoading) return;
    setQiskitLoading(true);
    setQiskitError("");
    setQiskitResult(null);
    try {
      const result = await executeWithQiskit({ num_qubits: 2, operations: qiskitOperations, shots: 1000 });
      setQiskitResult(result);
    } catch (error) {
      setQiskitError(error.message || "Qiskit execution failed.");
    } finally {
      setQiskitLoading(false);
    }
  };

  return <div style={s.workspace}>
    <header style={s.header}>
      <button style={s.menuButton} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "CLOSE INDEX ✕" : "MENU INDEX ☰"}</button>
      <span style={s.eyebrow}>QUANTUM ENGINE // ENTANGLEMENT LABORATORY</span>
      <span style={s.headerTag}>M1.4 ACTIVE</span>
    </header>
    {menuOpen && <aside style={s.sidebar}>
      <span style={s.eyebrow}>CORE MAP REPOSITORY</span>
      <button style={s.navItem} onClick={() => onNavigate?.("1.1")}>M1.1: Single-Qubit State Space</button>
      <button style={s.navItem} onClick={() => onNavigate?.("2.1")}>M2.1: Multi-Qubit Systems</button>
      <button style={s.navItem} onClick={() => onNavigate?.("1.3")}>M1.3: Matrix Operators & Phase</button>
      <button style={{ ...s.navItem, color: "#34d399" }} onClick={() => setMenuOpen(false)}>[x] M1.4: Quantum Entanglement Space</button>
      <button style={s.navItem} onClick={() => onNavigate?.("3.1")}>M3.1: Deutsch's Algorithm</button>
      <button style={s.navItem} onClick={() => onNavigate?.("3.2")}>M3.2: Deutsch–Jozsa</button>
      <button style={s.navItem} onClick={() => onNavigate?.("2.3")}>M2.3: Bernstein–Vazirani</button>
    </aside>}

    <main style={s.main}>
      <article style={s.lessonPane}>
        <section style={s.hero}>
          <span style={s.eyebrow}>MODULE 1.4 // QUANTUM ENTANGLEMENT SPACE</span>
          <h1 style={s.title}>When two qubits become one quantum system</h1>
          <p style={s.copy}>Entanglement is not simply two qubits having matching values. It is a property of their joint quantum state: the whole can be precisely described even when neither qubit has its own pure state. Build each Bell state, inspect its amplitudes, trace out one qubit, and measure the correlations.</p>
        </section>

        <Section number="1.4.1" title="A PRODUCT STATE CAN BE WRITTEN AS TWO INDEPENDENT STATES">
          <p style={s.copy}>A two-qubit pure state is separable when it can be factored into one state for q1 and one state for q0. If |u⟩ = u0|0⟩ + u1|1⟩ and |v⟩ = v0|0⟩ + v1|1⟩, their tensor product has amplitudes with a specific factorized structure.</p>
          <Eq>{"|\\psi\\rangle = (u_0|0\\rangle+u_1|1\\rangle)\\otimes(v_0|0\\rangle+v_1|1\\rangle)"}</Eq>
          <Eq>{"= u_0v_0|00\\rangle + u_0v_1|01\\rangle + u_1v_0|10\\rangle + u_1v_1|11\\rangle"}</Eq>
          <p style={s.copy}>For amplitudes a, b, c, d in the |q1q0⟩ basis, a product state must satisfy ad − bc = 0. For a normalized pure two-qubit state, a non-zero value means it is entangled. This gives us an exact algebraic test, not a visual guess.</p>
          <Eq>{"ad-bc=0 \\quad\\Longleftrightarrow\\quad \\text{separable pure state}"}</Eq>
        </Section>

        <Section number="1.4.2" title="CREATE ENTANGLEMENT WITH A HADAMARD AND A CNOT">
          <p style={s.copy}>Start with |00⟩. A Hadamard on q0 creates an equal superposition of |00⟩ and |01⟩. The CNOT uses q0 as its control and flips q1 only in the branch where q0 is 1. The two branches become |00⟩ and |11⟩.</p>
          <Eq>{"|00\\rangle \\xrightarrow{H_0} \\frac{|00\\rangle+|01\\rangle}{\\sqrt{2}} \\xrightarrow{CX_{0\\to1}} \\frac{|00\\rangle+|11\\rangle}{\\sqrt{2}}"}</Eq>
          <p style={s.copy}>The result is the Bell state Φ⁺. The amplitudes of |01⟩ and |10⟩ are exactly zero. Measuring both qubits in the computational basis produces 00 or 11, each with probability one half.</p>
          <CircuitDiagram bellName={isBellPreset ? bellName : "Phi+"} />
        </Section>

        <Section number="1.4.3" title="THE FOUR BELL STATES ARE FOUR DISTINCT ENTANGLED STATES">
          <p style={s.copy}>The four Bell states form an orthonormal basis for the two-qubit state space. Local X and Z operations change which Bell state is prepared. The sign between the two terms is a relative phase, so it cannot be read from computational-basis probabilities alone.</p>
          <div style={s.bellGrid}>
            {Object.entries(BELL_INFO).map(([name, info]) => <button key={name} type="button" onClick={() => loadBell(name)} aria-label={"Load Bell state " + name} aria-pressed={bellName === name} style={{ ...s.bellCard, borderColor: bellName === name ? "#34d399" : "#1e3a4a", background: bellName === name ? "rgba(16,185,129,.1)" : "rgba(15,23,42,.72)" }}>
              <strong>{info.symbol}</strong><code>{info.ket}</code><small>{name === "Phi+" ? "same Z · same X" : name === "Phi-" ? "same Z · opposite X" : name === "Psi+" ? "opposite Z · same X" : "opposite Z · opposite X"}</small>
            </button>)}
          </div>
          <p style={s.copy}>{bellInfo ? bellInfo.description : "The current state is not one of the four Bell basis states."}</p>
          <EntanglementLink bellName={bellName} />
          <Eq>{"\\langle B_i|B_j\\rangle=\\delta_{ij}, \\quad i,j\\in\\{\\Phi^+,\\Phi^-,\\Psi^+,\\Psi^-\\}"}</Eq>
          <p style={s.copy}>Orthogonality means an ideal measurement in the Bell basis can distinguish these four states perfectly. The two local measurement settings below reveal their different correlation patterns without requiring a joint Bell-basis measurement.</p>
        </Section>

        <Section number="1.4.4" title="WHY A SINGLE QUBIT DOES NOT HAVE A PURE STATE">
          <p style={s.copy}>A subsystem is described by a density matrix. For a pure joint state |Ψ⟩, the full density operator is ρ = |Ψ⟩⟨Ψ|. To describe q0 alone, trace over q1: sum the diagonal blocks associated with q1 = 0 and q1 = 1. In the basis |q1q0⟩, this produces the following matrix.</p>
          <Eq>{"|\\Psi\\rangle=a|00\\rangle+b|01\\rangle+c|10\\rangle+d|11\\rangle"}</Eq>
          <Eq>{"\\rho_{q0}=\\operatorname{Tr}_{q1}(\\rho)=\\begin{bmatrix}|a|^2+|c|^2 & a b^*+c d^*\\\\a^*b+c^*d & |b|^2+|d|^2\\end{bmatrix}"}</Eq>
          <p style={s.copy}>For q1, trace out q0 instead. The two reduced matrices have the same eigenvalues for every pure bipartite state. Those eigenvalues are the Schmidt probabilities. If both are one half, each individual qubit is maximally mixed even though the pair is in a perfectly known pure state.</p>
          <Eq>{"\\rho_{q1}=\\begin{bmatrix}|a|^2+|b|^2 & a c^*+b d^*\\\\a^*c+b^*d & |c|^2+|d|^2\\end{bmatrix}"}</Eq>
          <p style={s.copy}>See the partial trace as an actual block-matrix operation. For Φ⁺, the joint density matrix has only four non-zero entries. Tracing out q1 adds the q1 = 0 block and the q1 = 1 block, leaving a diagonal 50/50 state for q0.</p>
          <Eq>{"\\rho_{\\Phi^+}=\\frac{1}{2}\\begin{bmatrix}1&0&0&1\\\\0&0&0&0\\\\0&0&0&0\\\\1&0&0&1\\end{bmatrix}"}</Eq>
          <Eq>{"\\rho_{q0}=\\operatorname{Tr}_{q1}(\\rho_{\\Phi^+})=\\begin{bmatrix}1/2&0\\\\0&1/2\\end{bmatrix}"}</Eq>
          <p style={s.copy}>The joint density matrix is a rank-one projector because the pair is in a pure state. The reduced matrix has rank two. This is the precise mathematical statement that the pair is pure as a whole while either qubit alone is mixed.</p>
        </Section>

        <Section number="1.4.5" title="ENTANGLEMENT ENTROPY FROM THE SCHMIDT EIGENVALUES">
          <p style={s.copy}>Diagonalize either reduced density matrix. Its eigenvalues λ₁ and λ₂ are non-negative and sum to one. The von Neumann entropy of either subsystem is the Shannon entropy of those eigenvalues, measured here in bits.</p>
          <Eq>{"S(\\rho_{q0})=-\\operatorname{Tr}(\\rho_{q0}\\log_2\\rho_{q0})=-\\sum_{i=1}^{2}\\lambda_i\\log_2\\lambda_i"}</Eq>
          <p style={s.copy}>For a pure two-qubit state, this entropy is zero exactly when the state is a product. It reaches one bit when both Schmidt probabilities are one half. The concurrence C = 2|ad − bc| is another pure-state entanglement measure, ranging from zero to one.</p>
          <Eq>{"C=2|ad-bc|=2\\sqrt{\\det(\\rho_{q0})}, \\qquad 0\\leq C\\leq1"}</Eq>
          <p style={s.copy}>The Schmidt decomposition writes every pure bipartite state as a sum of paired orthonormal local states. The squared Schmidt coefficients are exactly the eigenvalues of either reduced density matrix. For two qubits, concurrence determines those two eigenvalues:</p>
          <Eq>{"|\\Psi\\rangle=\\sqrt{\\lambda_+}|u_+\\rangle|v_+\\rangle+\\sqrt{\\lambda_-}|u_-\\rangle|v_-\\rangle"}</Eq>
          <Eq>{"\\lambda_\\pm=\\frac{1\\pm\\sqrt{1-C^2}}{2}, \\quad \\lambda_+ + \\lambda_-=1"}</Eq>
          <p style={s.copy}>A product state has Schmidt spectrum (1, 0), entropy 0 and concurrence 0. A Bell state has spectrum (1/2, 1/2), entropy 1 bit, concurrence 1 and local purity 1/2. The two reduced states always have the same non-zero eigenvalues because they are the two sides of one pure bipartite state.</p>
          <p style={s.copy}>The live diagnostics below compute the reduced matrices, their eigenvalues, entropy, purity and concurrence directly from the current complex amplitudes. The calculation does not infer entanglement from measurement correlations alone.</p>
        </Section>

        <Section number="1.4.6" title="LOCAL RANDOMNESS, GLOBAL CORRELATION">
          <p style={s.copy}>Each Bell pair gives a 50/50 result on either qubit by itself. Yet when the two records are compared, the pair outcomes are perfectly correlated or anti-correlated. Change the measurement basis from Z to X by applying a Hadamard to each qubit before measuring. The X setting exposes the relative sign that the Z setting cannot distinguish.</p>
          <div style={s.basisControls}>
            <button type="button" onClick={() => { setMeasurementBasis("Z"); clearExecution(); }} aria-pressed={measurementBasis === "Z"} style={{ ...s.basisButton, ...(measurementBasis === "Z" ? s.selectedButton : {}) }}>Z BASIS · COMPUTATIONAL</button>
            <button type="button" onClick={() => { setMeasurementBasis("X"); clearExecution(); }} aria-pressed={measurementBasis === "X"} style={{ ...s.basisButton, ...(measurementBasis === "X" ? s.selectedButton : {}) }}>X BASIS · HADAMARD THEN Z</button>
          </div>
          <div style={s.parityPanel}>
            <Metric label="P(q0 = 0)" value={percent(measurementProbabilities[0] + measurementProbabilities[2])} note="q0 marginal" />
            <Metric label="P(q1 = 0)" value={percent(measurementProbabilities[0] + measurementProbabilities[1])} note="q1 marginal" />
            <Metric label="Same outcomes" value={percent(sameParity)} note="00 or 11" />
            <Metric label="Opposite outcomes" value={percent(oppositeParity)} note="01 or 10" />
          </div>
          <div style={s.probabilityList}>
            {BASIS.map((bitString, index) => <div key={bitString} style={s.probabilityRow}><code>|{bitString}⟩</code><div style={s.track}><div style={{ ...s.fill, width: percent(measurementProbabilities[index]) }} /></div><strong>{percent(measurementProbabilities[index])}</strong></div>)}
          </div>
          <p style={s.copy}>A Bell state does not let one observer control the random local outcome. The correlations become visible only after the two observers compare their classical records. Entanglement therefore does not provide a faster-than-light messaging channel.</p>
        </Section>

        <Section number="1.4.7" title="MOVE CONTINUOUSLY FROM A PRODUCT STATE TO A BELL PAIR">
          <p style={s.copy}>Use a Schmidt-angle family of states to see that entanglement is not simply on or off. A rotation RY(2θ) prepares cos(θ)|0⟩ + sin(θ)|1⟩ on q0. A CNOT then correlates q1 with q0.</p>
          <Eq>{"|\\Psi(\\theta)\\rangle=\\cos\\theta|00\\rangle+\\sin\\theta|11\\rangle, \\quad 0\\leq\\theta\\leq\\frac{\\pi}{4}"}</Eq>
          <Eq>{"S(\\theta)=-\\cos^2\\theta\\log_2(\\cos^2\\theta)-\\sin^2\\theta\\log_2(\\sin^2\\theta)"}</Eq>
          <div style={s.sliderPanel}>
            <label htmlFor="schmidt-angle">Schmidt angle θ: {(customTheta * 180 / Math.PI).toFixed(1)}°</label>
            <input id="schmidt-angle" type="range" min="0" max={Math.PI / 4} step={Math.PI / 180} value={customTheta} onChange={(event) => loadPartial(event.target.value)} style={{ width: "100%", accentColor: "#34d399" }} />
            <div style={s.rangeEnds}><span>0° · product state</span><span>45° · Bell state</span></div>
            <button type="button" style={s.secondaryButton} onClick={loadProduct}>Load independent |+⟩ ⊗ |+⟩ product state</button>
          </div>
          <p style={s.copy}>Worked value: at θ = 30°, the state is (√3/2)|00⟩ + (1/2)|11⟩. The Schmidt probabilities are 0.75 and 0.25, the entropy is approximately 0.8113 bits, and concurrence is √3/2 ≈ 0.8660. At θ = 45°, both Schmidt probabilities become 0.5 and the state reaches one full bit of entanglement entropy.</p>
          <Eq>{"C(\\theta)=\\sin(2\\theta), \\quad S(30^\\circ)=-0.75\\log_2(0.75)-0.25\\log_2(0.25)\\approx0.8113"}</Eq>
          <p style={s.copy}>The slider controls the Schmidt coefficients directly. Entanglement entropy rises smoothly from zero to one bit, while concurrence rises from zero to one. The global state remains pure throughout.</p>
        </Section>

        <Section number="1.4.8" title="LIVE ENTANGLEMENT DIAGNOSTICS">
          <div style={s.metricsGrid}>
            <Metric label="ENTANGLEMENT ENTROPY" value={diagnostics.entropy.toFixed(4) + " bits"} note="0 = product · 1 = maximally entangled" />
            <Metric label="CONCURRENCE" value={diagnostics.concurrence.toFixed(4)} note="Pure two-qubit entanglement measure" />
            <Metric label="LOCAL PURITY" value={diagnostics.purity.toFixed(4)} note="Tr(ρ²), one means locally pure" />
            <Metric label="SCHMIDT SPECTRUM" value={diagnostics.schmidtProbabilities.map((value) => value.toFixed(3)).join(" / ")} note="Eigenvalues of either reduced state" />
          </div>
          <div style={s.statusLine}>
            <span style={{ ...s.statusDot, background: diagnostics.isMaximallyEntangled ? "#34d399" : diagnostics.isEntangled ? "#fbbf24" : "#64748b" }} />
            <strong>{diagnostics.isMaximallyEntangled ? "MAXIMALLY ENTANGLED PURE STATE" : diagnostics.isEntangled ? "PARTIALLY ENTANGLED PURE STATE" : "SEPARABLE PRODUCT PURE STATE"}</strong>
          </div>
          <AmplitudeMap state={state} />
          <div style={s.densityGrid}>
            {[["q0 reduced density matrix", diagnostics.q0], ["q1 reduced density matrix", diagnostics.q1]].map(([label, reduced]) => <div key={label} style={s.densityCard}>
              <strong>{label}</strong>
              <div style={s.matrix}>
                {reduced.matrix.map((row, rowIndex) => <div key={rowIndex} style={s.matrixRow}>{row.map((value, columnIndex) => <code key={columnIndex}>{complexText(value)}</code>)}</div>)}
              </div>
              <small style={s.muted}>Eigenvalues: {reduced.eigenvalues.map((value) => value.toFixed(4)).join(", ")}</small>
              <small style={s.muted}>Entropy: {reduced.entropy.toFixed(4)} bits · purity: {reduced.purity.toFixed(4)}</small>
            </div>)}
          </div>
          <div style={s.statevector}>
            <strong>JOINT PURE STATE · BASIS ORDER |q1q0⟩</strong>
            {state.amplitudes.map((amplitude, index) => <div key={BASIS[index]}><code>|{BASIS[index]}⟩</code><span>{complexText(amplitude)}</span><small>{percent(probabilities[index])}</small></div>)}
            <small style={s.muted}>Σ |aᵢ|² = {probabilities.reduce((sum, value) => sum + value, 0).toFixed(6)}</small>
          </div>
        </Section>

        <Section number="1.4.9" title="VERIFY THE SAME CIRCUIT WITH QISKIT + AER">
          <p style={s.copy}>The Python program below is generated from the selected state preparation and measurement basis. In X-basis mode, the two Hadamard gates are included before measurement. Qiskit returns the exact statevector and finite-shot counts so the simulator can be independently checked.</p>
          <QiskitExecutionPanel operations={qiskitOperations} code={pythonCode} result={qiskitResult} loading={qiskitLoading} error={qiskitError} onRun={runOnQiskit} shots={1000} />
        </Section>
      </article>

      <aside style={s.inspector}>
        <div style={s.inspectorHeader}><span>LIVE LAB</span><strong>{bellInfo ? bellInfo.symbol : bellName.toUpperCase()}</strong></div>
        <div style={s.selectorGrid}>
          {Object.entries(BELL_INFO).map(([name, info]) => <button key={name} type="button" onClick={() => loadBell(name)} aria-pressed={bellName === name} style={{ ...s.selectorButton, ...(bellName === name ? s.selectedButton : {}) }}>{info.symbol}</button>)}
        </div>
        <div style={s.inspectorBlock}>
          <span style={s.inspectorLabel}>CURRENT STATE</span>
          <strong>{bellInfo ? bellInfo.ket : bellName === "Partial" ? "cos(θ)|00⟩ + sin(θ)|11⟩" : "|+⟩ ⊗ |+⟩"}</strong>
          <span style={s.muted}>{operations.map((operation) => operation.name === "CNOT" ? "CX(" + operation.control + "→" + operation.target + ")" : operation.name + "(" + operation.target + ")").join("  →  ")}</span>
        </div>
        <CircuitDiagram bellName={isBellPreset ? bellName : "Phi+"} />
        <div style={s.inspectorBlock}>
          <span style={s.inspectorLabel}>SUBSYSTEM CHECK</span>
          <div style={s.localStatus}><span>q0</span><strong>{diagnostics.q0.entropy.toFixed(3)} bits</strong></div>
          <div style={s.localStatus}><span>q1</span><strong>{diagnostics.q1.entropy.toFixed(3)} bits</strong></div>
          <p style={s.smallCopy}>For a pure bipartite state, both reduced entropies are equal. A maximally entangled pair has one bit of entropy on each side.</p>
        </div>
        <div style={s.inspectorBlock}>
          <span style={s.inspectorLabel}>CORRELATION SIGNATURE</span>
          <div style={s.localStatus}><span>Z basis</span><strong>{bellInfo ? bellInfo.z.toUpperCase() : "LIVE"}</strong></div>
          <div style={s.localStatus}><span>X basis</span><strong>{bellInfo ? bellInfo.x.toUpperCase() : "LIVE"}</strong></div>
          <p style={s.smallCopy}>Each Bell state's two parity checks identify its correlation pattern.</p>
        </div>
        <button type="button" style={s.resetButton} onClick={() => loadBell("Phi+")}>RESET TO Φ⁺ BELL STATE</button>
      </aside>
    </main>
    <AIAssistant moduleTitle="Quantum Entanglement Laboratory" lessonContext="Two-qubit pure-state separability, four Bell states, CNOT entanglement preparation, partial trace, reduced density matrices, Schmidt decomposition, von Neumann entanglement entropy, concurrence, complementary X/Z basis correlations, and Qiskit verification." simulatorContext={{ bellName, operations, amplitudes: state.amplitudes, probabilities, reducedQubit0: diagnostics.q0, reducedQubit1: diagnostics.q1, entanglementEntropyBits: diagnostics.entropy, concurrence: diagnostics.concurrence, measurementBasis, measurementProbabilities, sameParity, oppositeParity }} />
  </div>;
}

const s = {
  workspace: { minHeight: "100vh", color: "#e2e8f0", background: "#030712", fontFamily: "Inter, system-ui, sans-serif", paddingBottom: "4rem" },
  header: { height: "58px", display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.5rem", borderBottom: "1px solid rgba(34,211,238,.16)", background: "#070d18", position: "sticky", top: 0, zIndex: 80 },
  menuButton: { background: "transparent", border: "1px solid #164e63", color: "#67e8f9", borderRadius: "6px", padding: ".5rem .7rem", fontFamily: "monospace", cursor: "pointer", fontSize: ".72rem" },
  eyebrow: { color: "#67e8f9", fontSize: ".68rem", letterSpacing: ".15em", fontFamily: "monospace" },
  headerTag: { marginLeft: "auto", color: "#34d399", border: "1px solid #065f46", borderRadius: "4px", padding: ".3rem .5rem", fontSize: ".68rem", fontFamily: "monospace" },
  sidebar: { position: "fixed", top: "58px", left: 0, zIndex: 90, width: "min(340px, 90vw)", height: "calc(100vh - 58px)", overflowY: "auto", background: "#0b1220", borderRight: "1px solid #164e63", padding: "1.5rem", display: "flex", flexDirection: "column", gap: ".85rem", boxSizing: "border-box" },
  navItem: { textAlign: "left", color: "#cbd5e1", background: "transparent", border: "none", padding: ".55rem .2rem", cursor: "pointer", fontSize: ".82rem" },
  main: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: "1.2rem", maxWidth: "1500px", margin: "0 auto", padding: "1.3rem", alignItems: "start" },
  lessonPane: { minWidth: 0, display: "flex", flexDirection: "column", gap: "1rem" },
  hero: { padding: "2rem", background: "linear-gradient(135deg, rgba(8,47,73,.55), rgba(15,23,42,.7))", border: "1px solid #164e63", borderRadius: "12px" },
  title: { color: "#f8fafc", fontSize: "clamp(1.8rem, 4vw, 3rem)", lineHeight: 1.12, margin: ".9rem 0", maxWidth: "900px" },
  copy: { color: "#cbd5e1", fontSize: ".94rem", lineHeight: 1.75, margin: ".65rem 0" },
  smallCopy: { color: "#94a3b8", fontSize: ".78rem", lineHeight: 1.6, margin: ".5rem 0" },
  muted: { color: "#94a3b8", fontSize: ".72rem", lineHeight: 1.5 },
  section: { padding: "1.5rem 1.7rem", background: "rgba(10,17,31,.82)", border: "1px solid rgba(51,65,85,.7)", borderRadius: "10px" },
  sectionTitle: { color: "#67e8f9", fontSize: ".78rem", fontFamily: "monospace", letterSpacing: ".06em", margin: "0 0 1rem" },
  equation: { overflowX: "auto", padding: ".7rem .9rem", margin: ".8rem 0", background: "rgba(2,6,23,.7)", borderLeft: "2px solid #0e7490", borderRadius: "4px", color: "#e2e8f0" },
  bellGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: ".7rem", margin: "1rem 0" },
  bellCard: { color: "#e2e8f0", border: "1px solid", borderRadius: "8px", padding: "1rem", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: ".55rem", minWidth: 0 },
  basisControls: { display: "flex", flexWrap: "wrap", gap: ".6rem", margin: "1rem 0" },
  basisButton: { border: "1px solid #334155", background: "#0b1220", color: "#94a3b8", borderRadius: "6px", padding: ".65rem .8rem", cursor: "pointer", fontSize: ".72rem", fontFamily: "monospace" },
  selectedButton: { borderColor: "#34d399", color: "#a7f3d0", background: "rgba(16,185,129,.1)" },
  parityPanel: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: ".6rem", margin: "1rem 0" },
  metric: { display: "flex", flexDirection: "column", gap: ".4rem", padding: ".8rem", border: "1px solid #1e3a4a", borderRadius: "7px", background: "rgba(15,23,42,.65)", minWidth: 0 },
  metricLabel: { color: "#67e8f9", fontSize: ".62rem", fontFamily: "monospace", letterSpacing: ".04em" },
  metricValue: { color: "#f8fafc", fontSize: "1.05rem", overflowWrap: "anywhere" },
  probabilityList: { display: "flex", flexDirection: "column", gap: ".55rem" },
  probabilityRow: { display: "grid", gridTemplateColumns: "50px minmax(0,1fr) 58px", alignItems: "center", gap: ".6rem", fontSize: ".8rem" },
  track: { height: "8px", borderRadius: "8px", background: "#1e293b", overflow: "hidden" },
  fill: { height: "100%", borderRadius: "8px", background: "#34d399" },
  sliderPanel: { padding: "1rem", border: "1px solid #1e3a4a", borderRadius: "8px", background: "#080f1d", display: "flex", flexDirection: "column", gap: ".7rem", color: "#cbd5e1" },
  rangeEnds: { display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: ".7rem" },
  secondaryButton: { border: "1px solid #155e75", borderRadius: "6px", background: "transparent", color: "#a5f3fc", padding: ".6rem", cursor: "pointer", alignSelf: "flex-start" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: ".7rem" },
  statusLine: { display: "flex", alignItems: "center", gap: ".6rem", margin: "1rem 0", color: "#a7f3d0", fontSize: ".72rem", fontFamily: "monospace" },
  statusDot: { width: "9px", height: "9px", borderRadius: "50%", boxShadow: "0 0 12px currentColor" },
  amplitudeGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: ".6rem", margin: "1rem 0" },
  amplitudeCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: ".25rem", padding: ".55rem .25rem", background: "#080f1d", border: "1px solid #1e3a4a", borderRadius: "8px", minWidth: 0, fontSize: ".7rem", textAlign: "center" },
  argand: { width: "100%", maxWidth: "105px" },
  densityGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: ".7rem", margin: "1rem 0" },
  densityCard: { minWidth: 0, padding: ".8rem", border: "1px solid #1e3a4a", borderRadius: "8px", background: "#080f1d", display: "flex", flexDirection: "column", gap: ".55rem" },
  matrix: { borderLeft: "1px solid #64748b", borderRight: "1px solid #64748b", padding: ".5rem", display: "flex", flexDirection: "column", gap: ".5rem", width: "fit-content", maxWidth: "100%" },
  matrixRow: { display: "flex", gap: ".6rem", flexWrap: "wrap" },
  statevector: { padding: ".8rem", background: "#080f1d", border: "1px solid #1e3a4a", borderRadius: "8px", display: "flex", flexDirection: "column", gap: ".5rem", overflowX: "auto" },
  inspector: { position: "sticky", top: "76px", minWidth: 0, display: "flex", flexDirection: "column", gap: ".8rem", padding: "1rem", background: "#080f1d", border: "1px solid #164e63", borderRadius: "10px", maxHeight: "calc(100vh - 90px)", overflowY: "auto" },
  inspectorHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#67e8f9", fontFamily: "monospace", fontSize: ".72rem" },
  selectorGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: ".35rem" },
  selectorButton: { padding: ".55rem .2rem", background: "#0f172a", color: "#cbd5e1", border: "1px solid #334155", borderRadius: "5px", cursor: "pointer" },
  inspectorBlock: { display: "flex", flexDirection: "column", gap: ".5rem", padding: ".8rem", border: "1px solid #1e3a4a", borderRadius: "7px" },
  inspectorLabel: { color: "#67e8f9", fontFamily: "monospace", fontSize: ".62rem" },
  localStatus: { display: "flex", justifyContent: "space-between", color: "#cbd5e1", fontSize: ".78rem" },
  resetButton: { border: "1px solid #065f46", background: "rgba(16,185,129,.1)", color: "#a7f3d0", borderRadius: "6px", padding: ".7rem", cursor: "pointer", fontFamily: "monospace", fontSize: ".7rem" },
  linkFrame: { margin: "1rem 0", padding: ".8rem", background: "#050b16", border: "1px solid #1e3a4a", borderRadius: "8px", overflow: "hidden" },
  circuitFrame: { background: "#050b16", border: "1px solid #1e3a4a", borderRadius: "8px", padding: ".7rem", overflow: "hidden" },
  circuitLabel: { color: "#94a3b8", fontSize: ".62rem", fontFamily: "monospace", marginBottom: ".3rem" },
};

