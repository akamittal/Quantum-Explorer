import React, { useEffect, useRef, useState } from "react";

const lessons = {
  gate: {
    title: "What is a quantum gate?",
    summary: "A quantum gate is an operation that changes a qubit's state. Think of it as a carefully controlled move—not a classical AND or OR gate.",
    sections: [
      ["Why it matters", "Quantum algorithms are built by applying gates in a chosen order. Each gate changes the state, so the sequence determines what can happen when we measure."],
      ["Notation", "Gates are usually shown as short labels such as H, X or Z inside boxes on a circuit. In mathematics, a gate is represented by a matrix."],
      ["Tiny example", "Start with |0⟩ and apply X. The state changes to |1⟩. Apply X once more and it returns to |0⟩."],
      ["Where it is used", "Gates are the basic instructions in quantum algorithms for simulation, search, optimization and other quantum-computing experiments."]
    ],
  },
  "gate-h": {
    title: "H — Hadamard gate",
    summary: "The Hadamard gate turns |0⟩ into an equal superposition of |0⟩ and |1⟩. It is a common way to give a qubit two possible measurement outcomes.",
    sections: [
      ["Notation", "H, often drawn as a box marked H. Its matrix is 1/√2 × [[1, 1], [1, −1]]."],
      ["Tiny example", "H|0⟩ = (|0⟩ + |1⟩)/√2. Measuring this state gives 0 or 1 with 50% probability each."],
      ["Why it matters", "It creates the kind of superposition that many quantum algorithms use. Superposition alone does not guarantee a speed-up; the rest of the algorithm matters too."],
      ["Where it is used", "Preparing superpositions, quantum search, and many introductory circuits."]
    ],
  },
  "gate-x": {
    title: "X — Pauli-X gate",
    summary: "The X gate flips the computational-basis states: |0⟩ becomes |1⟩, and |1⟩ becomes |0⟩. It is the closest quantum equivalent to a classical NOT operation on these two states.",
    sections: [
      ["Notation", "X, drawn as a box marked X. Its matrix is [[0, 1], [1, 0]]."],
      ["Tiny example", "X|0⟩ = |1⟩. Applying X twice returns the original state."],
      ["Important detail", "For a general superposition, X swaps the amplitudes of |0⟩ and |1⟩; it is more than a classical bit flip."],
      ["Where it is used", "Preparing |1⟩, manipulating qubits, and building larger circuits."]
    ],
  },
  "gate-y": {
    title: "Y — Pauli-Y gate",
    summary: "The Y gate changes a qubit in a way that combines a bit flip with a phase change. The phase matters when quantum states later interfere.",
    sections: [
      ["Notation", "Y, with matrix [[0, −i], [i, 0]], where i is the imaginary unit."],
      ["Tiny example", "Y|0⟩ = i|1⟩. The extra factor i is a phase; by itself it does not change measurement probabilities, but phases can matter in later gates."],
      ["Where it is used", "Quantum-state manipulation, quantum error correction, and describing rotations around the Bloch sphere's Y axis."]
    ],
  },
  "gate-z": {
    title: "Z — Pauli-Z gate",
    summary: "The Z gate leaves |0⟩ alone and changes the sign of |1⟩. That sign is a phase, which can affect interference later.",
    sections: [
      ["Notation", "Z, with matrix [[1, 0], [0, −1]]."],
      ["Tiny example", "Z|0⟩ = |0⟩ and Z|1⟩ = −|1⟩. Measuring either basis state immediately gives the same outcome as before."],
      ["Why it matters", "A phase change may be invisible in a direct measurement but can change the result after another gate, such as H."],
      ["Where it is used", "Phase manipulation, quantum error correction, and circuit construction."]
    ],
  },
  "gate-s": {
    title: "S — phase gate",
    summary: "The S gate adds a 90° (π/2 radians) phase to the |1⟩ part of a state while leaving the |0⟩ part unchanged.",
    sections: [
      ["Notation", "S = diag(1, i). It is sometimes called the √Z gate because applying it twice gives Z."],
      ["Tiny example", "S|0⟩ = |0⟩ and S|1⟩ = i|1⟩."],
      ["Where it is used", "Controlling relative phase in circuits and building up more complex quantum operations."]
    ],
  },
  "gate-t": {
    title: "T — T gate",
    summary: "The T gate adds a 45° (π/4 radians) phase to the |1⟩ part of a state. Small phase changes can become important when gates combine.",
    sections: [
      ["Notation", "T = diag(1, e^(iπ/4)). Four T gates in a row have the same effect as Z."],
      ["Tiny example", "T does not change the measurement probabilities of a state immediately, but it can change later interference."],
      ["Where it is used", "Universal quantum circuits and fault-tolerant quantum computing."]
    ],
  },
  reset: {
    title: "Reset a qubit",
    summary: "Reset prepares the qubit in |0⟩ again, regardless of its current state. In this playground it is a simulator action, not one of the reversible gates above.",
    sections: [
      ["Notation", "Often shown as a reset symbol or an instruction to prepare |0⟩; notation varies by circuit tool."],
      ["Tiny example", "If the qubit is currently |1⟩ or in a superposition, reset returns the simulator to |0⟩."],
      ["Why it matters", "Experiments need a known starting state so results can be compared reliably."]
    ],
  },
  circuit: {
    title: "What is a quantum circuit?",
    summary: "A quantum circuit is a recipe: apply a sequence of quantum gates in a specific order, then often measure the result.",
    sections: [
      ["Notation", "Each box is a gate, and the line represents a qubit. Read the circuit from left to right."],
      ["Tiny example", "H → H returns |0⟩ to |0⟩ when starting from |0⟩. The order and combination of gates matter."],
      ["Why it matters", "A single gate is a building block; circuits combine building blocks into useful computations."],
      ["Where it is used", "Expressing and running quantum algorithms on simulators and quantum hardware."]
    ],
  },
  measurement: {
    title: "What is measurement?",
    summary: "Measurement asks a qubit for a classical result. In this playground, the result is 0 or 1, chosen according to the state's probabilities.",
    sections: [
      ["Notation", "P(0) and P(1) mean the probabilities of observing 0 and 1. They add up to 100% for a valid one-qubit state."],
      ["Tiny example", "For (|0⟩ + |1⟩)/√2, each result has a 50% chance. A single measurement gives one result, not both."],
      ["What are shots?", "A shot is one run of the experiment. Repeating 100 shots gives a count of how often 0 and 1 appeared; random variation is normal."],
      ["Where it is used", "Reading the output of quantum circuits and estimating probabilities from repeated runs."]
    ],
  },
  amplitude: {
    title: "What is an amplitude?",
    summary: "An amplitude is a number that describes a qubit's state. Unlike an ordinary probability, an amplitude can be negative or complex.",
    sections: [
      ["Notation", "A one-qubit state is written |ψ⟩ = α|0⟩ + β|1⟩. α is the amplitude for 0 and β is the amplitude for 1."],
      ["How it connects to probability", "The probability is the squared size of an amplitude: P(0) = |α|² and P(1) = |β|². For a normalized state, these probabilities add to 1."],
      ["Tiny example", "If α = 1/√2 and β = 1/√2, both outcomes have probability 1/2."],
      ["Why it matters", "Amplitudes carry phase information. When gates combine paths, amplitudes can reinforce or cancel each other—this is quantum interference."]
    ],
  },
  superposition: {
    title: "What is superposition?",
    summary: "Superposition means a qubit's state can combine |0⟩ and |1⟩ with different amplitudes. It is not simply a classical bit secretly being both values.",
    sections: [
      ["Notation", "|ψ⟩ = α|0⟩ + β|1⟩, where |α|² + |β|² = 1 for a valid state."],
      ["Tiny example", "H applied to |0⟩ creates (|0⟩ + |1⟩)/√2, giving 50% probability for either measurement result."],
      ["Why it matters", "Quantum algorithms use amplitudes and interference to shape the likelihood of different answers. Superposition by itself is not a guarantee of faster computation."]
    ],
  },
  bloch: {
    title: "What is the Bloch sphere?",
    summary: "The Bloch sphere is a picture of a single qubit's pure state. A point on its surface represents a state; moving the point helps visualize how gates change it.",
    sections: [
      ["Notation", "The north and south poles usually represent |0⟩ and |1⟩. Other surface points represent superpositions."],
      ["Angles", "θ (theta) sets the position from top to bottom; φ (phi) sets the angle around the vertical axis."],
      ["Tiny example", "The H gate moves |0⟩ from the north pole to the equator, representing an equal-probability superposition."],
      ["Important detail", "The sphere is a visualization of state, not a literal picture of a tiny physical ball."]
    ],
  },
  angles: {
    title: "What are θ and φ?",
    summary: "Theta (θ) and phi (φ) are angles used to describe a single-qubit state on the Bloch sphere.",
    sections: [
      ["Notation", "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩ for a pure one-qubit state."],
      ["Intuition", "θ controls the balance between the |0⟩ and |1⟩ probabilities. φ controls their relative phase."],
      ["Tiny example", "Changing θ can change the measurement probabilities; changing φ alone keeps those probabilities the same but can change later interference."]
    ],
  },
  qiskit: {
    title: "What is Qiskit?",
    summary: "Qiskit is an open-source software toolkit for creating and working with quantum circuits.",
    sections: [
      ["Why it matters", "It lets developers describe circuits in code and connect quantum-computing ideas to simulators or supported hardware services."],
      ["Notation", "In Python, a circuit can be created with QuantumCircuit, gates such as h(0) can be applied, and measurements can be added."],
      ["This playground", "The panel shows example Qiskit code for the current state. Code shown here is an example; it is not the same as submitting a job to real quantum hardware."]
    ],
  },
};

const gateAliases = { h: "gate-h", x: "gate-x", y: "gate-y", z: "gate-z", s: "gate-s", t: "gate-t", reset: "reset" };

export default function EducationHelp({ topic = "gate", label = "Learn about this concept" }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);
  const triggerRef = useRef(null);
  const lessonKey = lessons[topic] ? topic : (gateAliases[topic.toLowerCase()] || topic);
  const lesson = lessons[lessonKey] || lessons.gate;

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={label}
        onClick={() => setOpen(true)}
        style={styles.infoButton}
      >
        i
      </button>
      {open && (
        <div
          style={styles.backdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`lesson-title-${lessonKey}`}
            style={styles.dialog}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const focusable = event.currentTarget.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
              );
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (!first || !last) return;
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <div style={styles.dialogHeader}>
              <div>
                <div style={styles.eyebrow}>QUANTUM EXPLORER · QUICK GUIDE</div>
                <h2 id={`lesson-title-${lessonKey}`} style={styles.title}>{lesson.title}</h2>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close explanation" style={styles.closeButton}>×</button>
            </div>
            <p style={styles.summary}>{lesson.summary}</p>
            <div style={styles.sections}>
              {lesson.sections.map(([heading, body]) => (
                <div key={heading} style={styles.lessonSection}>
                  <h3 style={styles.sectionTitle}>{heading}</h3>
                  <p style={styles.sectionBody}>{body}</p>
                </div>
              ))}
            </div>
            <div style={styles.footer}>
              <span>Short explanation · No prior quantum knowledge needed</span>
              <button type="button" onClick={() => setOpen(false)} style={styles.doneButton}>Back to experiment</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

const styles = {
  infoButton: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: "1.35rem", height: "1.35rem", padding: 0, flex: "0 0 auto",
    borderRadius: "50%", border: "1px solid rgba(103,232,249,0.65)",
    background: "rgba(8,145,178,0.12)", color: "#67e8f9", fontSize: "0.8rem",
    fontWeight: 700, lineHeight: 1, cursor: "pointer", fontFamily: "system-ui, sans-serif",
  },
  backdrop: {
    position: "fixed", inset: 0, zIndex: 10000, display: "flex",
    alignItems: "center", justifyContent: "center", padding: "1rem",
    background: "rgba(2,6,23,0.82)", backdropFilter: "blur(5px)",
  },
  dialog: {
    width: "min(100%, 42rem)", maxHeight: "min(85vh, 52rem)", overflowY: "auto",
    padding: "clamp(1rem, 3vw, 1.75rem)", borderRadius: "12px",
    border: "1px solid rgba(103,232,249,0.25)", background: "#0b1220",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)", color: "#e5e7eb",
  },
  dialogHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  eyebrow: { color: "#67e8f9", fontSize: "0.68rem", letterSpacing: "0.13em", fontFamily: "monospace", marginBottom: "0.5rem" },
  title: { color: "#f8fafc", fontSize: "clamp(1.25rem, 3vw, 1.7rem)", lineHeight: 1.25, margin: 0 },
  closeButton: { width: "2rem", height: "2rem", flex: "0 0 auto", borderRadius: "6px", border: "1px solid #334155", background: "#111827", color: "#e5e7eb", fontSize: "1.5rem", cursor: "pointer" },
  summary: { color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.65, margin: "1.25rem 0", padding: "1rem", borderLeft: "3px solid #22d3ee", background: "rgba(8,145,178,0.08)" },
  sections: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))", gap: "0.85rem" },
  lessonSection: { padding: "0.9rem", border: "1px solid rgba(148,163,184,0.16)", borderRadius: "8px", background: "rgba(15,23,42,0.65)" },
  sectionTitle: { margin: "0 0 0.45rem", color: "#6ee7b7", fontSize: "0.8rem", letterSpacing: "0.04em" },
  sectionBody: { margin: 0, color: "#cbd5e1", fontSize: "0.88rem", lineHeight: 1.65 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem", color: "#94a3b8", fontSize: "0.75rem" },
  doneButton: { border: "1px solid rgba(16,185,129,0.6)", background: "rgba(16,185,129,0.12)", color: "#d1fae5", padding: "0.6rem 0.85rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 },
};
