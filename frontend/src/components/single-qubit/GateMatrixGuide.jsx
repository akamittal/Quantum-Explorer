import React from "react";
import MathRenderer from "../../MathRenderer";

const gateLessons = [
  {
    name: "Identity gate (I)",
    purpose: "Leaves the qubit unchanged.",
    matrix: String.raw`I = \begin{bmatrix}1&0\\0&1\\end{bmatrix}`,
    action: String.raw`I\lvert\psi\rangle =
\begin{bmatrix}1&0\\0&1\\end{bmatrix}
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=\lvert\psi\rangle`,
  },
  {
    name: "Hadamard gate (H)",
    purpose: "Creates an equal superposition from either basis state (with a relative sign for |1⟩).",
    matrix: String.raw`H=\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\\end{bmatrix}`,
    action: String.raw`H\lvert0\rangle =
\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\\end{bmatrix}
\begin{bmatrix}1\0\end{bmatrix}
=\frac{1}{\sqrt2}\begin{bmatrix}1\1\end{bmatrix}
=\frac{\lvert0\rangle+\lvert1\rangle}{\sqrt2}
=\lvert+\rangle`,
    second: String.raw`H\lvert1\rangle =
\frac{1}{\sqrt2}\begin{bmatrix}1&1\\1&-1\\end{bmatrix}
\begin{bmatrix}0\1\end{bmatrix}
=\frac{1}{\sqrt2}\begin{bmatrix}1\-1\end{bmatrix}
=\frac{\lvert0\rangle-\lvert1\rangle}{\sqrt2}
=\lvert-\rangle`,
  },
  {
    name: "Pauli-X gate (X)",
    purpose: "Flips |0⟩ to |1⟩ and |1⟩ to |0⟩. It is the quantum NOT gate.",
    matrix: String.raw`X=\begin{bmatrix}0&1\\1&0\\end{bmatrix}`,
    action: String.raw`X\lvert0\rangle =
\begin{bmatrix}0&1\\1&0\\end{bmatrix}
\begin{bmatrix}1\0\end{bmatrix}
=\begin{bmatrix}0\1\end{bmatrix}=\lvert1\rangle`,
    second: String.raw`X\lvert1\rangle =
\begin{bmatrix}0&1\\1&0\\end{bmatrix}
\begin{bmatrix}0\1\end{bmatrix}
=\begin{bmatrix}1\0\end{bmatrix}=\lvert0\rangle`,
  },
  {
    name: "Pauli-Y gate (Y)",
    purpose: "Flips the basis state and adds a phase factor. The imaginary number i is part of the result.",
    matrix: String.raw`Y=\begin{bmatrix}0&-i\\i&0\\end{bmatrix}`,
    action: String.raw`Y\lvert0\rangle =
\begin{bmatrix}0&-i\\i&0\\end{bmatrix}
\begin{bmatrix}1\0\end{bmatrix}
=\begin{bmatrix}0\i\end{bmatrix}=i\lvert1\rangle`,
    second: String.raw`Y\lvert1\rangle =
\begin{bmatrix}0&-i\\i&0\\end{bmatrix}
\begin{bmatrix}0\1\end{bmatrix}
=\begin{bmatrix}-i\0\end{bmatrix}=-i\lvert0\rangle`,
  },
  {
    name: "Pauli-Z gate (Z)",
    purpose: "Keeps |0⟩ unchanged and flips the sign of the |1⟩ amplitude. This is a phase flip, not a bit flip.",
    matrix: String.raw`Z=\begin{bmatrix}1&0\\0&-1\\end{bmatrix}`,
    action: String.raw`Z\lvert\psi\rangle =
\begin{bmatrix}1&0\\0&-1\\end{bmatrix}
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=\begin{bmatrix}\alpha\-\beta\end{bmatrix}
=\alpha\lvert0\rangle-\beta\lvert1\rangle`,
  },
  {
    name: "S gate",
    purpose: "Adds a 90° (π/2) phase to the |1⟩ component and leaves |0⟩ unchanged.",
    matrix: String.raw`S=\begin{bmatrix}1&0\\0&i\\end{bmatrix}`,
    action: String.raw`S\lvert\psi\rangle =
\begin{bmatrix}1&0\\0&i\\end{bmatrix}
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=\begin{bmatrix}\alpha\i\beta\end{bmatrix}
=\alpha\lvert0\rangle+i\beta\lvert1\rangle`,
  },
  {
    name: "T gate",
    purpose: "Adds a 45° (π/4) phase to the |1⟩ component.",
    matrix: String.raw`T=\begin{bmatrix}1&0\\0&e^{i\pi/4}\\end{bmatrix}
=\begin{bmatrix}1&0\\0&\frac{1+i}{\sqrt2}\\end{bmatrix}`,
    action: String.raw`T\lvert\psi\rangle =
\begin{bmatrix}1&0\\0&e^{i\pi/4}\\end{bmatrix}
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=\begin{bmatrix}\alpha\e^{i\pi/4}\beta\end{bmatrix}`,
  },
];

function Equation({ formula }) {
  return <div style={styles.equation}><MathRenderer formula={formula} displayMode /></div>;
}

export default function GateMatrixGuide() {
  return (
    <section style={styles.container}>
      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.0 FROM KET NOTATION TO COLUMN VECTORS</h3>
        <p style={styles.copy}>
          A qubit has two computational basis states. We write each ket as a
          two-entry column vector. The top entry is the amplitude of |0⟩ and the
          bottom entry is the amplitude of |1⟩.
        </p>
        <div style={styles.twoColumns}>
          <div style={styles.stateCard}>
            <strong style={styles.stateName}>Zero state</strong>
            <Equation formula={String.raw`\lvert0\rangle=\begin{bmatrix}1\0\end{bmatrix}`} />
            <span style={styles.copy}>100% amplitude for |0⟩, zero for |1⟩.</span>
          </div>
          <div style={styles.stateCard}>
            <strong style={styles.stateName}>One state</strong>
            <Equation formula={String.raw`\lvert1\rangle=\begin{bmatrix}0\1\end{bmatrix}`} />
            <span style={styles.copy}>Zero amplitude for |0⟩, 100% for |1⟩.</span>
          </div>
        </div>
        <p style={styles.copy}>
          A general qubit is a weighted combination of these two basis states.
          The weights α and β can be complex numbers and are called amplitudes.
        </p>
        <Equation formula={String.raw`\lvert\psi\rangle=\alpha\lvert0\rangle+\beta\lvert1\rangle
=\begin{bmatrix}\alpha\\beta\end{bmatrix},\qquad
|\alpha|^2+|\beta|^2=1`} />
      </div>

      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.1 HOW MATRIX MULTIPLICATION APPLIES A GATE</h3>
        <p style={styles.copy}>
          A single-qubit gate is a 2 × 2 matrix. Multiply its first row by the
          state column to get the new top amplitude, then its second row to get
          the new bottom amplitude. In compact form:
        </p>
        <Equation formula={String.raw`\begin{bmatrix}a&b\c&d\\end{bmatrix}
\begin{bmatrix}\alpha\\beta\end{bmatrix}
=
\begin{bmatrix}a\alpha+b\beta\c\alpha+d\beta\end{bmatrix}`} />
        <p style={styles.note}>
          The order matters: the gate matrix goes on the left, and the state
          column goes on the right. The output is another state column.
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.2 GATE MATRICES AND THEIR DERIVATIONS</h3>
        <p style={styles.copy}>
          Work through each example. For a basis input, multiplying by a
          matrix selects one of its columns. For a general input, both columns
          contribute, weighted by α and β.
        </p>
        {gateLessons.map((gate) => (
          <article key={gate.name} style={styles.gateCard}>
            <h4 style={styles.gateName}>{gate.name}</h4>
            <p style={styles.copy}>{gate.purpose}</p>
            <span style={styles.label}>GATE MATRIX</span>
            <Equation formula={gate.matrix} />
            <span style={styles.label}>APPLY THE GATE</span>
            <Equation formula={gate.action} />
            {gate.second && <Equation formula={gate.second} />}
          </article>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.3 SEE EVERY MULTIPLICATION STEP</h3>
        <p style={styles.copy}>
          A matrix does not act by magic. Each output entry is one row of the
          matrix multiplied by the input column. We keep the two rows separate
          so you can see exactly where every amplitude comes from.
        </p>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example A: Hadamard on any qubit</h4>
          <p style={styles.copy}>
            Start with |ψ⟩ = α|0⟩ + β|1⟩. The column vector is [α, β]ᵀ.
            The first output entry comes from the first row of H; the second
            comes from its second row.
          </p>
          <Equation formula={"H\\lvert\\psi\\rangle=\\frac{1}{\\sqrt{2}}\\begin{bmatrix}1&1\\\\1&-1\\end{bmatrix}\\begin{bmatrix}\\alpha\\\\\\beta\\end{bmatrix}"} />
          <Equation formula={"=\\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\cdot\\alpha+1\\cdot\\beta\\\\1\\cdot\\alpha+(-1)\\cdot\\beta\\end{bmatrix}"} />
          <Equation formula={"=\\begin{bmatrix}(\\alpha+\\beta)/\\sqrt{2}\\\\(\\alpha-\\beta)/\\sqrt{2}\\end{bmatrix}=\\frac{\\alpha+\\beta}{\\sqrt{2}}\\lvert0\\rangle+\\frac{\\alpha-\\beta}{\\sqrt{2}}\\lvert1\\rangle"} />
          <p style={styles.note}>
            The new zero amplitude is (α + β)/√2. The new one amplitude is
            (α − β)/√2. Both old amplitudes contribute to both new amplitudes.
            Their plus or minus signs can make them reinforce or cancel.
          </p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example B: why H followed by H restores the input</h4>
          <p style={styles.copy}>
            Apply H a second time to the two amplitudes we just found. The
            second H receives the output of the first H, not the original α and β.
          </p>
          <Equation formula={"H^2\\lvert\\psi\\rangle=H\\begin{bmatrix}(\\alpha+\\beta)/\\sqrt{2}\\\\(\\alpha-\\beta)/\\sqrt{2}\\end{bmatrix}"} />
          <Equation formula={"=\\frac{1}{\\sqrt{2}}\\begin{bmatrix}(\\alpha+\\beta)/\\sqrt{2}+(\\alpha-\\beta)/\\sqrt{2}\\\\(\\alpha+\\beta)/\\sqrt{2}-(\\alpha-\\beta)/\\sqrt{2}\\end{bmatrix}"} />
          <Equation formula={"=\\frac{1}{2}\\begin{bmatrix}\\alpha+\\beta+\\alpha-\\beta\\\\\\alpha+\\beta-\\alpha+\\beta\\end{bmatrix}=\\frac{1}{2}\\begin{bmatrix}2\\alpha\\\\2\\beta\\end{bmatrix}=\\begin{bmatrix}\\alpha\\\\\\beta\\end{bmatrix}"} />
          <p style={styles.note}>
            The β terms cancel in the top entry, and the α terms cancel in
            the bottom entry. Therefore H² = I: two Hadamard gates return every
            input qubit to its starting state.
          </p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example C: a phase change becomes measurable after H</h4>
          <p style={styles.copy}>
            Compare |+⟩ and |−⟩. They have the same 50/50 measurement
            probabilities in the computational basis, but their relative
            signs differ. A later gate can reveal that difference.
          </p>
          <Equation formula={"Z\\lvert+\\rangle=Z\\frac{\\lvert0\\rangle+\\lvert1\\rangle}{\\sqrt{2}}=\\frac{\\lvert0\\rangle-\\lvert1\\rangle}{\\sqrt{2}}=\\lvert-\\rangle"} />
          <Equation formula={"H\\lvert+\\rangle=H\\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\1\\end{bmatrix}=\\begin{bmatrix}1\\\\0\\end{bmatrix}=\\lvert0\\rangle"} />
          <Equation formula={"H\\lvert-\\rangle=H\\frac{1}{\\sqrt{2}}\\begin{bmatrix}1\\\\-1\\end{bmatrix}=\\begin{bmatrix}0\\\\1\\end{bmatrix}=\\lvert1\\rangle"} />
          <p style={styles.note}>
            Before the final H, |+⟩ and |−⟩ each give 0 or 1 with 50% chance.
            After H, they give different certain outcomes. The relative sign
            changes how amplitudes combine in the next gate. This is interference.
          </p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example D: X and Z on a general state</h4>
          <p style={styles.copy}>
            X exchanges the two amplitudes. Z keeps the first and changes the
            sign of the second. This is the difference between a bit flip and
            a phase flip.
          </p>
          <Equation formula={"X\\lvert\\psi\\rangle=\\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}\\begin{bmatrix}\\alpha\\\\\\beta\\end{bmatrix}=\\begin{bmatrix}0\\alpha+1\\beta\\\\1\\alpha+0\\beta\\end{bmatrix}=\\begin{bmatrix}\\beta\\\\\\alpha\\end{bmatrix}"} />
          <Equation formula={"Z\\lvert\\psi\\rangle=\\begin{bmatrix}1&0\\\\0&-1\\end{bmatrix}\\begin{bmatrix}\\alpha\\\\\\beta\\end{bmatrix}=\\begin{bmatrix}1\\alpha+0\\beta\\\\0\\alpha-1\\beta\\end{bmatrix}=\\begin{bmatrix}\\alpha\\\\-\\beta\\end{bmatrix}"} />
        </article>
      </div>

      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.4 ROTATION GATES</h3>
        <p style={styles.copy}>
          Rotation gates turn the state around one of the Bloch-sphere axes.
          Their angle θ is measured in radians in these matrix formulas.
        </p>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Rotation around X (RX)</h4>
          <Equation formula={String.raw`R_X(\theta)=
\begin{bmatrix}
\cos(\theta/2)&-i\sin(\theta/2)\\
-i\sin(\theta/2)&\cos(\theta/2)
\end{bmatrix}`} />
          <Equation formula={String.raw`R_X(\theta)\begin{bmatrix}\alpha\\beta\end{bmatrix}
=
\begin{bmatrix}
\cos(\theta/2)\alpha-i\sin(\theta/2)\beta\\
-i\sin(\theta/2)\alpha+\cos(\theta/2)\beta
\end{bmatrix}`} />
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Rotation around Y (RY)</h4>
          <Equation formula={String.raw`R_Y(\theta)=
\begin{bmatrix}
\cos(\theta/2)&-\sin(\theta/2)\\
\sin(\theta/2)&\cos(\theta/2)
\end{bmatrix}`} />
          <Equation formula={String.raw`R_Y(\theta)\begin{bmatrix}\alpha\\beta\end{bmatrix}
=
\begin{bmatrix}
\cos(\theta/2)\alpha-\sin(\theta/2)\beta\\
\sin(\theta/2)\alpha+\cos(\theta/2)\beta
\end{bmatrix}`} />
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Rotation around Z (RZ)</h4>
          <Equation formula={String.raw`R_Z(\theta)=
\begin{bmatrix}
e^{-i\theta/2}&0\\
0&e^{i\theta/2}
\end{bmatrix}`} />
          <Equation formula={String.raw`R_Z(\theta)\begin{bmatrix}\alpha\\beta\end{bmatrix}
=
\begin{bmatrix}
e^{-i\theta/2}\alpha\\
e^{i\theta/2}\beta
\end{bmatrix}`} />
        </article>
        <p style={styles.note}>
          RX, RY and RZ are parameterized gates. In the playground, enter the
          angle in degrees; the simulator converts it to radians for the matrix.
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.heading}>// 3.4 WHY ROTATION GATES HAVE THIS MATRIX FORM</h3>
        <p style={styles.copy}>
          Rotation gates are derived from Pauli matrices, not memorized as unrelated formulas.
          For an axis a, the definition is Rₐ(θ) = exp(−iθσₐ/2), where θ is in radians.
          We derive this exponential into a 2 × 2 matrix step by step.
        </p>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Step 1: Verify the Pauli-matrix identity</h4>
          <Equation formula={String.raw`X=\begin{bmatrix}0&1\\1&0\end{bmatrix},\quad Y=\begin{bmatrix}0&-i\\i&0\end{bmatrix},\quad Z=\begin{bmatrix}1&0\\0&-1\end{bmatrix}`} />
          <Equation formula={String.raw`X^2=\begin{bmatrix}0&1\\1&0\end{bmatrix}\begin{bmatrix}0&1\\1&0\end{bmatrix}=\begin{bmatrix}1&0\\0&1\end{bmatrix}=I`} />
          <Equation formula={String.raw`Y^2=\begin{bmatrix}0&-i\\i&0\end{bmatrix}\begin{bmatrix}0&-i\\i&0\end{bmatrix}=\begin{bmatrix}(-i)i&0\\0&i(-i)\end{bmatrix}=I`} />
          <Equation formula={String.raw`Z^2=\begin{bmatrix}1&0\\0&-1\end{bmatrix}\begin{bmatrix}1&0\\0&-1\end{bmatrix}=I`} />
          <p style={styles.note}>Each Pauli matrix squares to identity: σ² = I. Consequently σ³ = σ, σ⁴ = I, and the powers continue alternating. This is what lets us simplify the exponential.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Step 2: Expand the exponential as a power series</h4>
          <p style={styles.copy}>The matrix exponential is defined by the same series as a scalar exponential. Substitute A = −iθσ/2 into the series.</p>
          <Equation formula={String.raw`e^A=I+A+\frac{A^2}{2!}+\frac{A^3}{3!}+\frac{A^4}{4!}+\cdots`} />
          <Equation formula={String.raw`e^{-i\theta\sigma/2}=I-\frac{i\theta}{2}\sigma+\frac{(-i\theta/2)^2}{2!}\sigma^2+\frac{(-i\theta/2)^3}{3!}\sigma^3+\cdots`} />
          <p style={styles.copy}>Replace every even power of σ with I and every odd power with σ. Then collect the identity terms and the σ terms separately.</p>
          <Equation formula={String.raw`=I\left[1-\frac{(\theta/2)^2}{2!}+\frac{(\theta/2)^4}{4!}-\cdots\right]-i\sigma\left[\frac{\theta}{2}-\frac{(\theta/2)^3}{3!}+\frac{(\theta/2)^5}{5!}-\cdots\right]`} />
          <p style={styles.copy}>The first bracket is the Taylor series for cosine. The second bracket is the Taylor series for sine. This identifies each part without skipping the intermediate algebra.</p>
          <Equation formula={String.raw`\cos x=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots,\qquad \sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots`} />
          <Equation formula={String.raw`\boxed{e^{-i\theta\sigma/2}=\cos(\theta/2)I-i\sin(\theta/2)\sigma}`} />
          <p style={styles.note}>The half-angle comes directly from the θ/2 in the exponent. The cosine multiplies identity, and the sine multiplies the Pauli matrix with the factor −i.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Step 3: Substitute each Pauli matrix</h4>
          <p style={styles.copy}>Let c = cos(θ/2) and s = sin(θ/2). For each axis, calculate cI − isσ. The entries below show the identity contribution and the Pauli contribution added together.</p>
          <span style={styles.label}>X-AXIS</span>
          <Equation formula={String.raw`R_X(\theta)=cI-isX=\begin{bmatrix}c&0\\0&c\end{bmatrix}+\begin{bmatrix}0&-is\\-is&0\end{bmatrix}=\boxed{\begin{bmatrix}c&-is\\-is&c\end{bmatrix}}`} />
          <span style={styles.label}>Y-AXIS</span>
          <Equation formula={String.raw`R_Y(\theta)=cI-isY=\begin{bmatrix}c&0\\0&c\end{bmatrix}+\begin{bmatrix}0&-s\\s&0\end{bmatrix}=\boxed{\begin{bmatrix}c&-s\\s&c\end{bmatrix}}`} />
          <span style={styles.label}>Z-AXIS</span>
          <Equation formula={String.raw`R_Z(\theta)=cI-isZ=\begin{bmatrix}c-is&0\\0&c+is\end{bmatrix}=\boxed{\begin{bmatrix}e^{-i\theta/2}&0\\0&e^{i\theta/2}\end{bmatrix}}`} />
          <p style={styles.copy}>For Z, Euler’s formula e^{ix} = cos(x) + i sin(x) gives c − is = e^{−iθ/2} and c + is = e^{iθ/2}.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Step 4: Apply each rotation to a general state</h4>
          <p style={styles.copy}>Multiply each matrix row by the input column. The first row gives the new |0⟩ amplitude; the second row gives the new |1⟩ amplitude.</p>
          <Equation formula={String.raw`R_X(\theta)\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}c&-is\\-is&c\end{bmatrix}\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}c\alpha-is\beta\\-is\alpha+c\beta\end{bmatrix}`} />
          <Equation formula={String.raw`R_Y(\theta)\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}c&-s\\s&c\end{bmatrix}\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}c\alpha-s\beta\\s\alpha+c\beta\end{bmatrix}`} />
          <Equation formula={String.raw`R_Z(\theta)\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}e^{-i\theta/2}&0\\0&e^{i\theta/2}\end{bmatrix}\begin{bmatrix}\alpha\\\beta\end{bmatrix}=\begin{bmatrix}e^{-i\theta/2}\alpha\\e^{i\theta/2}\beta\end{bmatrix}`} />
          <p style={styles.note}>X and Y can mix amplitudes. Z leaves their magnitudes in place but changes their phases in opposite directions, changing the relative phase between the two basis components.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example 1: RX(90°) acting on |0⟩</h4>
          <p style={styles.copy}>Convert 90° to π/2 radians. The half-angle is π/4, and cos(π/4) = sin(π/4) = 1/√2. Multiplication by |0⟩ selects the first matrix column.</p>
          <Equation formula={String.raw`R_X(\pi/2)|0\rangle=\begin{bmatrix}1/\sqrt2&-i/\sqrt2\\-i/\sqrt2&1/\sqrt2\end{bmatrix}\begin{bmatrix}1\\0\end{bmatrix}=\begin{bmatrix}1/\sqrt2\\-i/\sqrt2\end{bmatrix}`} />
          <Equation formula={String.raw`|\psi_{out}\rangle=\frac{1}{\sqrt2}|0\rangle-\frac{i}{\sqrt2}|1\rangle,\qquad P(0)=P(1)=\frac12`} />
          <p style={styles.copy}>Both outcomes have 50% probability. The factor −i is still important: it records the relative phase and places the Bloch vector along −Y, rather than +X.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example 2: RY(90°) acting on |0⟩</h4>
          <Equation formula={String.raw`R_Y(\pi/2)|0\rangle=\begin{bmatrix}1/\sqrt2&-1/\sqrt2\\1/\sqrt2&1/\sqrt2\end{bmatrix}\begin{bmatrix}1\\0\end{bmatrix}=\begin{bmatrix}1/\sqrt2\\1/\sqrt2\end{bmatrix}`} />
          <Equation formula={String.raw`|\psi_{out}\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2}=|+\rangle`} />
          <p style={styles.copy}>This also gives 50/50 measurement probabilities, but the amplitudes are both positive real numbers. Its Bloch vector points along +X. Compare this with RX above: same probabilities, different quantum state.</p>
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Worked example 3: RZ(90°) acting on |+⟩</h4>
          <p style={styles.copy}>Start with |+⟩ = (|0⟩ + |1⟩)/√2. A Z rotation multiplies the upper and lower amplitudes by opposite phase factors.</p>
          <Equation formula={String.raw`R_Z(\pi/2)|+\rangle=\frac{1}{\sqrt2}\begin{bmatrix}e^{-i\pi/4}\\e^{i\pi/4}\end{bmatrix}=e^{-i\pi/4}\frac{|0\rangle+i|1\rangle}{\sqrt2}`} />
          <p style={styles.copy}>The common factor e^{−iπ/4} is global phase and has no observable effect. The remaining i on only the |1⟩ component is relative phase and is physically meaningful.</p>
          <Equation formula={String.raw`P(0)=\left|\frac{e^{-i\pi/4}}{\sqrt2}\right|^2=\frac12,\qquad P(1)=\left|\frac{e^{i\pi/4}}{\sqrt2}\right|^2=\frac12`} />
        </article>
        <article style={styles.gateCard}>
          <h4 style={styles.gateName}>Step 5: Why a half-angle in amplitudes gives a full Bloch-sphere rotation</h4>
          <p style={styles.copy}>A pure state can be parameterized as cos(ϑ/2)|0⟩ + e^{iφ}sin(ϑ/2)|1⟩. The Bloch-sphere coordinates use ϑ and φ, while the state amplitudes use their half-angles. Therefore the operator parameter θ rotates the Bloch vector through θ, even though its matrix contains θ/2.</p>
          <div style={styles.rotationDiagram} role="img" aria-label="Schematic Bloch sphere showing a state vector turning through angle theta around an axis">
            <svg viewBox="0 0 340 190" width="100%" height="190" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="170" cy="94" rx="78" ry="78" fill="none" stroke="#475569" strokeWidth="1.5" />
              <ellipse cx="170" cy="94" rx="78" ry="27" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M170 10 V178 M80 94 H260" stroke="#64748b" strokeWidth="1" strokeDasharray="3 4" />
              <path d="M170 94 L221 38" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
              <path d="M170 94 L245 94" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              <path d="M205 55 Q222 66 229 82" fill="none" stroke="#fbbf24" strokeWidth="2" />
              <path d="M224 77 L229 83 L232 75" fill="none" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="170" cy="94" r="3" fill="#e5e7eb" />
              <text x="224" y="32" fill="#34d399" fontSize="11">Initial state</text>
              <text x="248" y="98" fill="#22d3ee" fontSize="11">After θ</text>
              <text x="210" y="66" fill="#fbbf24" fontSize="11">θ</text>
              <text x="176" y="14" fill="#94a3b8" fontSize="10">axis</text>
            </svg>
          </div>
          <p style={styles.copy}>Rotations around different axes generally do not commute. Applying X then Y need not produce the same state as applying Y then X.</p>
          <Equation formula={String.raw`R_X(\theta)R_Y(\varphi)\ne R_Y(\varphi)R_X(\theta)\quad\text{in general}`} />
        </article>
        <p style={styles.note}>The playground accepts angles in degrees for convenience. The mathematical definitions use radians, so 90° is converted to π/2 before evaluating the matrix.</p>
      </div>

            <div style={styles.section}>
        <h3 style={styles.heading}>// 3.5 FROM AMPLITUDES TO MEASUREMENT</h3>
        <p style={styles.copy}>
          A gate changes amplitudes, not by directly choosing a measurement
          result. The probability of measuring 0 is the squared magnitude of α;
          the probability of measuring 1 is the squared magnitude of β.
        </p>
        <Equation formula={String.raw`P(0)=|\alpha|^2,\qquad P(1)=|\beta|^2,
\qquad P(0)+P(1)=1`} />
        <p style={styles.copy}>
          For example, after H is applied to |0⟩, both amplitudes are
          1/√2. The probabilities are therefore 1/2 and 1/2. A measurement
          gives either 0 or 1, with equal chances; it does not return both.
        </p>
      </div>
    </section>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: "2rem" },
  section: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  heading: { color: "#10b981", fontSize: "0.8rem", fontFamily: "monospace", letterSpacing: "0.08em", margin: 0 },
  copy: { color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 },
  note: { color: "#cbd5e1", background: "rgba(6,182,212,0.06)", borderLeft: "2px solid #06b6d4", padding: "0.8rem 1rem", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "0.75rem" },
  stateCard: { background: "#0b0f19", border: "1px solid rgba(6,182,212,0.18)", padding: "1rem", borderRadius: "4px", display: "flex", flexDirection: "column", gap: "0.5rem" },
  stateName: { color: "#e5e7eb", fontSize: "0.9rem" },
  equation: { overflowX: "auto", maxWidth: "100%", color: "#e5e7eb", padding: "0.25rem 0" },
  gateCard: { display: "flex", flexDirection: "column", gap: "0.65rem", background: "#0b0f19", border: "1px solid rgba(255,255,255,0.07)", padding: "1rem", borderRadius: "4px" },
  rotationDiagram: { width: "100%", maxWidth: "420px", alignSelf: "center", background: "#030712", border: "1px solid rgba(6,182,212,0.16)", borderRadius: "4px", padding: "0.5rem" },
  gateName: { color: "#e5e7eb", fontSize: "1rem", margin: 0 },
  label: { color: "#06b6d4", fontFamily: "monospace", fontSize: "0.68rem", letterSpacing: "0.08em" },
};
