import React from "react";
import EducationHelp from "../EducationHelp";
import MathRenderer from "../../MathRenderer";

export default function ConceptHero() {
  return (
    <div style={styles.blockContainer}>
      <section style={styles.contentSection}>
        <h2 style={styles.mainTitle}>Chapter 1: Why quantum computing?</h2>
        <p style={styles.paragraphText}>
          Your phone and laptop use ordinary computers. They are amazing at sending messages, running games and storing photos. But nature has a difficult side: working out how atoms and molecules behave can be incredibly hard for ordinary computers.
        </p>
        <p style={styles.paragraphText}>
          Scientists are building <strong>quantum computers</strong> to explore some of these problems in a different way. They will not make every task faster, and today's machines are still developing, but they may help us understand new materials, chemistry and other tough problems.
        </p>
        <div style={styles.sectionTitleRow}><h3 style={styles.sectionHeader}>FIRST, MEET THE BIT</h3><EducationHelp topic="bit" /></div>
        <p style={styles.paragraphText}>
          An ordinary computer stores information using <strong>bits</strong>. Imagine a tiny switch: it is OFF (0) or ON (1). Everything from photos to videos is built from lots of these simple 0s and 1s.
        </p>
        <div style={styles.sectionTitleRow}><h3 style={styles.sectionHeader}>NOW, MEET THE QUBIT</h3><EducationHelp topic="qubit" /></div>
        <p style={styles.paragraphText}>
          A quantum computer uses <strong>qubits</strong>. Like a bit, a qubit gives us 0 or 1 when we measure it. But before we measure it, a qubit can be prepared in a quantum state that gives different chances of seeing those answers.
        </p>
        <p style={styles.paragraphText}>
          Imagine a spinning coin: while it spins, the simple heads-or-tails picture doesn't tell the whole story. A qubit isn't literally a spinning coin, but the comparison helps us picture why it is different from an ordinary bit.
        </p>
        <div style={styles.sectionTitleRow}><h3 style={styles.sectionHeader}>A FIRST LOOK AT THE SYMBOLS</h3><EducationHelp topic="amplitude" /></div>
        <p style={styles.paragraphText}>Scientists write a qubit's state like this:</p>
        <MathRenderer formula="\lvert\psi\rangle = \alpha\lvert0\rangle + \beta\lvert1\rangle" displayMode={true} />
        <p style={styles.paragraphText}>
          You don't need to memorise this. For now, just know that α and β help describe the chances of seeing 0 or 1. We'll explore those chances using the controls below.
        </p>
        <section style={styles.deepDiveSection} aria-labelledby="state-foundations-title">
          <div style={styles.sectionTitleRow}>
            <h3 id="state-foundations-title" style={styles.sectionHeader}>UNDERSTAND THE QUBIT STATE, STEP BY STEP</h3>
          </div>
          <p style={styles.paragraphText}>A qubit state is a vector written as a weighted sum of two reference states. The weights are amplitudes, and they may be complex numbers.</p>
          <MathRenderer formula={String.raw`\lvert\psi\rangle=\alpha\lvert0\rangle+\beta\lvert1\rangle=\begin{bmatrix}\alpha\\\beta\end{bmatrix}`} displayMode={true} />
          <article style={styles.derivationCard}>
            <strong style={styles.derivationTitle}>1. WHY THE AMPLITUDES MUST BE NORMALIZED</strong>
            <p style={styles.paragraphText}>When we measure in the computational basis, the only possible outcomes are 0 and 1. The Born rule says that each probability is the squared magnitude of its amplitude:</p>
            <MathRenderer formula={String.raw`P(0)=|\alpha|^2,\qquad P(1)=|\beta|^2`} displayMode={true} />
            <p style={styles.paragraphText}>Since one of these two outcomes must occur, their probabilities must add to one. Substituting the Born rule gives the normalization condition:</p>
            <MathRenderer formula={String.raw`P(0)+P(1)=1\quad\Longrightarrow\quad |\alpha|^2+|\beta|^2=1`} displayMode={true} />
            <p style={styles.paragraphText}>For a complex amplitude α = a + bi, its squared magnitude is α*α. Multiplying by its complex conjugate removes the imaginary cross terms:</p>
            <MathRenderer formula={String.raw`|\alpha|^2=(a-bi)(a+bi)=a^2+b^2`} displayMode={true} />
            <p style={styles.paragraphText}>Normalization is therefore the mathematical statement that all possible measurement probabilities add up to 100%.</p>
          </article>
          <article style={styles.derivationCard}>
            <strong style={styles.derivationTitle}>2. WORK THROUGH A NUMERICAL EXAMPLE</strong>
            <p style={styles.paragraphText}>Consider α = 1/√2 and β = i/√2. Calculate the probability of each outcome separately:</p>
            <MathRenderer formula={String.raw`P(0)=|1/\sqrt2|^2=\frac12`} displayMode={true} />
            <MathRenderer formula={String.raw`P(1)=|i/\sqrt2|^2=\frac{i^*i}{2}=\frac{(-i)(i)}{2}=\frac12`} displayMode={true} />
            <MathRenderer formula={String.raw`P(0)+P(1)=\frac12+\frac12=1`} displayMode={true} />
            <p style={styles.paragraphText}>A large number of identical preparations would produce approximately 50% zero outcomes and 50% one outcomes. A single measurement still gives one result, not both.</p>
          </article>
          <article style={styles.derivationCard}>
            <strong style={styles.derivationTitle}>3. WHY PROBABILITIES ALONE DO NOT DESCRIBE A QUBIT</strong>
            <p style={styles.paragraphText}>These two states have identical probabilities when measured immediately in the 0/1 basis:</p>
            <MathRenderer formula={String.raw`|+\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2},\qquad |i+\rangle=\frac{|0\rangle+i|1\rangle}{\sqrt2}`} displayMode={true} />
            <MathRenderer formula={String.raw`P_+(0)=P_{i+}(0)=\frac12,\qquad P_+(1)=P_{i+}(1)=\frac12`} displayMode={true} />
            <p style={styles.paragraphText}>The states are nevertheless different because the relative phase between the amplitudes differs. A later gate can make this phase difference change the measurement probabilities. This is the key reason amplitudes contain more information than probabilities alone.</p>
            <p style={styles.paragraphText}>Multiplying the entire state by the same phase factor changes no physical prediction. Changing the phase of only one component can matter.</p>
          </article>
          <article style={styles.geometryCard}>
            <strong style={styles.derivationTitle}>4. CONNECT THE STATE TO THE BLOCH SPHERE</strong>
            <p style={styles.paragraphText}>Ignoring an unobservable global phase, every pure single-qubit state can be written using two angles:</p>
            <MathRenderer formula={String.raw`|\psi\rangle=\cos\left(\frac{\theta}{2}\right)|0\rangle+e^{i\phi}\sin\left(\frac{\theta}{2}\right)|1\rangle`} displayMode={true} />
            <svg viewBox="0 0 520 218" role="img" aria-label="Bloch sphere sketch showing polar angle theta from the positive z axis and azimuthal angle phi around the equator" style={{width:"100%",maxWidth:"520px",display:"block",margin:"0 auto"}}>
              <circle cx="150" cy="106" r="76" fill="rgba(6,182,212,.035)" stroke="#0e7490" strokeWidth="1.5"/>
              <ellipse cx="150" cy="106" rx="76" ry="23" fill="none" stroke="#155e75" strokeDasharray="5 4"/>
              <path d="M150 18V194 M64 106H236" stroke="#475569" strokeWidth="1.2"/>
              <path d="M150 106L202 49" stroke="#34d399" strokeWidth="3"/>
              <path d="M150 106L150 30" stroke="#64748b" strokeDasharray="3 3"/>
              <path d="M150 59 A47 47 0 0 1 181 72" fill="none" stroke="#fbbf24" strokeWidth="2"/>
              <circle cx="202" cy="49" r="4.5" fill="#34d399"/>
              <text x="150" y="12" fill="#cbd5e1" textAnchor="middle" fontSize="11">|0⟩ · +Z</text>
              <text x="150" y="210" fill="#cbd5e1" textAnchor="middle" fontSize="11">|1⟩ · −Z</text>
              <text x="244" y="110" fill="#cbd5e1" fontSize="11">+X</text>
              <text x="207" y="43" fill="#34d399" fontSize="11">state</text>
              <text x="170" y="75" fill="#fbbf24" fontSize="12">θ</text>
              <text x="292" y="55" fill="#67e8f9" fontSize="12">θ: polar angle</text>
              <text x="292" y="82" fill="#cbd5e1" fontSize="11">0° = |0⟩ at the top</text>
              <text x="292" y="103" fill="#cbd5e1" fontSize="11">90° = equator</text>
              <text x="292" y="124" fill="#cbd5e1" fontSize="11">180° = |1⟩ at the bottom</text>
              <text x="292" y="162" fill="#67e8f9" fontSize="12">φ: azimuthal angle</text>
              <text x="292" y="183" fill="#cbd5e1" fontSize="11">sets direction around equator</text>
            </svg>
            <p style={styles.paragraphText}>The corresponding coordinates are x = sin(θ) cos(φ), y = sin(θ) sin(φ), and z = cos(θ). The polar angle controls the measurement probabilities:</p>
            <MathRenderer formula={String.raw`P(0)=\cos^2(\theta/2),\qquad P(1)=\sin^2(\theta/2)`} displayMode={true} />
            <p style={styles.paragraphText}>The azimuthal angle φ changes the relative phase but not these two probabilities. It still changes the state and can be detected by choosing a suitable later gate and measurement basis.</p>
          </article>
          <article style={styles.derivationCard}>
            <strong style={styles.derivationTitle}>5. CHECK THE IDEA</strong>
            <p style={styles.paragraphText}>For |ψ⟩ = (|0⟩ + i|1⟩)/√2, the probabilities are 50% and 50%. Replacing i with −1 keeps those immediate probabilities the same, but changes the relative phase. The resulting state is |−⟩ rather than |i+⟩. A later operation can reveal the difference.</p>
          </article>
        </section>
        <div style={styles.thematicInsightBox}>
          <span style={styles.insightTitle}>YOUR FIRST EXPERIMENT</span>
          <p style={styles.insightContent}>Change the qubit, try a gate, and measure it. Open any <strong>i</strong> icon for a friendly explanation. You can learn the symbols as you go.</p>
        </div>
      </section>
    </div>
  );
}

const styles = {
  blockContainer: { display: "flex", flexDirection: "column", gap: "2rem" },
  contentSection: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  mainTitle: { color: "#f9fafb", fontSize: "1.4rem", fontWeight: "700", margin: "0 0 0.5rem" },
  sectionTitleRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.5rem" },
  sectionHeader: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.1em", margin: 0 },
  paragraphText: { color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.75", margin: 0, whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" },
  deepDiveSection: { display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(6,182,212,0.18)" },
  derivationCard: { display: "flex", flexDirection: "column", gap: "0.65rem", padding: "1rem", background: "rgba(11,15,25,0.82)", border: "1px solid rgba(6,182,212,0.18)", borderRadius: "4px" },
  geometryCard: { display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem", background: "rgba(11,15,25,0.82)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "4px" },
  derivationTitle: { color: "#67e8f9", fontSize: "0.76rem", fontFamily: "monospace", letterSpacing: "0.06em" },
  thematicInsightBox: { backgroundColor: "rgba(6, 182, 212, 0.06)", borderLeft: "3px solid #06b6d4", padding: "1rem 1.25rem", marginTop: "0.5rem" },
  insightTitle: { color: "#06b6d4", fontSize: "0.7rem", fontFamily: "monospace", fontWeight: "bold", letterSpacing: "0.05em" },
  insightContent: { color: "#e2e8f0", fontSize: "0.9rem", margin: "0.35rem 0 0", lineHeight: "1.6" },
};
