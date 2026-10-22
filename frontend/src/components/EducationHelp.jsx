import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const lessons = {
  "why-quantum": {
    title: "Why are people building quantum computers?",
    summary: "Ordinary computers are brilliant at everyday jobs. But nature has some puzzles that are extremely hard to calculate, such as how tiny particles and molecules behave. Quantum computers are a new kind of machine designed to explore some of those puzzles.",
    sections: [
      ["Start with a familiar computer", "Your phone stores photos, plays videos and follows instructions using bits. A bit is like a tiny switch: it is 0 or 1."],
      ["Nature plays by different rules", "Atoms and other tiny things do not always behave like everyday objects. Quantum computers use special rules from the tiny world to process information in a different way."],
      ["What might they help with?", "Researchers are exploring chemistry and materials, and some carefully chosen maths problems. Quantum computers will not make every app or calculation faster, and today's machines are still limited."],
      ["What we'll do here", "We'll start with one tiny piece of quantum information, try simple actions on it, and watch how the possible measurement results change."]
    ],
  },
  bit: {
    title: "First, what is a bit?",
    summary: "A bit is the smallest piece of information in an ordinary computer. Imagine a light switch: it can be OFF (0) or ON (1).",
    sections: [
      ["Why it matters", "Photos, messages and games are all stored and processed using huge numbers of bits."],
      ["Tiny example", "If a bit stores 1, reading it gives 1. If it stores 0, reading it gives 0."],
      ["Notation", "We write the two possibilities as 0 and 1. A quantum computer also needs to give us ordinary 0s and 1s when we read its answer."]
    ],
  },
  qubit: {
    title: "So, what is a qubit?",
    summary: "A qubit is the quantum version of a bit. A normal bit is like a switch that is OFF or ON. A qubit can be prepared in a quantum state that gives different chances of reading 0 or 1.",
    sections: [
      ["Picture it", "Imagine a spinning coin. While it spins, saying it is simply heads or tails misses something about what is happening. A qubit is not literally a spinning coin, but the picture reminds us that its state before we read it is different from an ordinary bit."],
      ["What happens when we read it?", "A measurement gives one result: 0 or 1. If we prepare the same state and repeat the experiment many times, we can see how often each result appears."],
      ["Notation", "We write the two basic outcomes as |0⟩ and |1⟩. The symbols α and β describe the qubit's state and help calculate the chances of each result."],
      ["Why it matters", "Quantum algorithms carefully change a qubit before reading it. The trick is to arrange those changes so useful answers become more likely."]
    ],
  },
  gate: {
    title: "What is a quantum gate?",
    summary: "A gate is an action we choose to perform on a qubit—like choosing the next move in a recipe. Different gates change the qubit in different ways.",
    sections: [
      ["Why it matters", "A quantum computer doesn't solve a problem with one magic button. We arrange many small actions in an order, then read the result."],
      ["Try a simple one: X", "Imagine the two labels 0 and 1 on opposite sides of a card. The X gate swaps them: 0 becomes 1, and 1 becomes 0."],
      ["What does the symbol look like?", "In a circuit, a gate is usually drawn as a small box on a line, with a letter such as X or H inside it."],
      ["Where it is used", "Gates are the building blocks used to create quantum-computing experiments and algorithms."]
    ],
  },
  "gate-h": {
    title: "H — the Hadamard gate",
    summary: "Let's start with a qubit set to 0. The H gate changes it into a state where a later measurement has an equal chance of giving 0 or 1.",
    sections: [
      ["Picture it", "Imagine an arrow pointing straight up. For this starting state, H moves the state to a balanced direction on the Bloch-sphere picture—halfway between the top and the side. The picture is a guide to the qubit's state, not a tiny arrow inside the machine."],
      ["Try it", "Start at |0⟩ and apply H. Measure many times: you should see roughly half 0s and half 1s. With only a few tries, the counts may not split perfectly."],
      ["Notation", "The gate is labelled H. For this example: H|0⟩ = (|0⟩ + |1⟩)/√2."],
      ["Why it matters", "H is a common way to prepare a qubit so both measurement outcomes are possible. What happens next depends on which other gates we apply."]
    ],
  },
  "gate-x": {
    title: "X — the flip gate",
    summary: "The X gate swaps 0 and 1, like flipping a switch from OFF to ON or ON to OFF.",
    sections: [
      ["Try it", "Start at |0⟩ and press X. The qubit becomes |1⟩. Press X again and it returns to |0⟩."],
      ["One extra detail", "If the qubit is in a mixture of possibilities, X swaps the roles of the 0 and 1 parts too."],
      ["Notation", "The gate is labelled X and is often compared to the NOT operation in an ordinary computer."]
    ],
  },
  "gate-y": {
    title: "Y — another kind of turn",
    summary: "Y is another basic gate. On the simple starting state |0⟩, it takes the qubit to |1⟩, while also changing information that can affect later quantum actions.",
    sections: [
      ["A useful picture", "Think of a state as having more information than just which result is most likely. Some of that extra information only shows its effect when we apply another gate before reading the result."],
      ["Try it", "Apply Y to |0⟩, then measure: the result is 1. The extra quantum detail becomes more interesting when Y is combined with other gates."],
      ["Notation", "The gate is labelled Y. You do not need to memorise its matrix to experiment with it."]
    ],
  },
  "gate-z": {
    title: "Z — a hidden change",
    summary: "Z can make a change that you cannot spot by measuring a simple 0 or 1 state right away. But another gate can turn that hidden change into a visible difference.",
    sections: [
      ["Picture it", "Imagine two routes that meet again. Changing how one route lines up with the other can make their effects add together or cancel. Quantum scientists call this interference; the 'phase' is part of what controls the alignment."],
      ["Try a short recipe", "Start at |0⟩, apply H, then Z, then H again. The final measurement gives 1. If you leave Z out, H followed by H returns you to 0."],
      ["Notation", "The gate is labelled Z. You can understand the experiment first and learn the mathematical details later."]
    ],
  },
  "gate-s": {
    title: "S — a smaller phase change",
    summary: "S changes how the |1⟩ part of a qubit lines up with the |0⟩ part. You won't always see this change in an immediate measurement, but it can affect what happens next.",
    sections: [
      ["Picture it", "Think of two waves arriving at the same place. If one wave is shifted, the waves may combine differently. Quantum states have a similar kind of alignment."],
      ["Try it", "Apply S to |0⟩ and measure: you'll still get 0. To see why S matters, combine it with other gates and compare the results."],
      ["Notation", "The gate is labelled S. Applying it twice has the same effect as applying Z."]
    ],
  },
  "gate-t": {
    title: "T — a delicate phase change",
    summary: "T makes a smaller change to the alignment of the qubit's quantum parts. It can matter when several gates are combined.",
    sections: [
      ["Picture it", "Like turning a dial by a small amount, one small change may be hard to notice alone, but a sequence of changes can make a difference."],
      ["Try it", "Apply T and compare experiments with and without it, especially when other gates follow."],
      ["Notation", "The gate is labelled T. There is no need to memorise its formula to begin exploring."]
    ],
  },
  reset: {
    title: "Start over: reset",
    summary: "Reset puts the qubit back into the starting state |0⟩ so you can run the same experiment again.",
    sections: [
      ["Everyday comparison", "It is like pressing the reset button on a toy before trying a new experiment."],
      ["Why it matters", "If every test starts from a known state, you can compare what different gates do fairly."],
      ["One detail", "Reset is a simulator action here, not the same kind of reversible gate as X or H."]
    ],
  },
  circuit: {
    title: "What is a quantum circuit?",
    summary: "A circuit is a recipe made from gates. The order matters: each action works on the state left by the action before it.",
    sections: [
      ["Read it like a recipe", "Start on the left and follow the gates in order. At the end, you can measure the qubit to see a 0 or 1."],
      ["Tiny example", "Start at |0⟩, apply H, then H again. The second H undoes the first for this starting state, so measurement returns 0."],
      ["Why it matters", "Bigger quantum tasks are built by joining simple steps into circuits."]
    ],
  },
  measurement: {
    title: "What does measurement mean?",
    summary: "Measurement is when we ask the qubit for an ordinary answer. In this experiment, that answer is 0 or 1.",
    sections: [
      ["One try", "A single measurement gives one result—not a list of every possible result."],
      ["What are shots?", "A shot is one run of the experiment. If you measure 100 times, you get 100 results to count."],
      ["Why counts vary", "If a qubit has a 50% chance of each result, 100 shots will often be close to 50 zeros and 50 ones, but not always exactly."],
      ["Notation", "P(0) means the chance of getting 0; P(1) means the chance of getting 1. Together they make 100%."]
    ],
  },
  amplitude: {
    title: "What is an amplitude?",
    summary: "An amplitude is a number used to describe a qubit's state. It is not itself the same as the chance of seeing 0 or 1—but it helps us calculate that chance.",
    sections: [
      ["A simple comparison", "Think of an amplitude as an ingredient in a recipe for the measurement chances. The size of the ingredient matters, and quantum calculations also keep track of how different parts line up."],
      ["Notation", "We often write the state as α|0⟩ + β|1⟩. Alpha (α) goes with 0; beta (β) goes with 1."],
      ["How we get the chance", "For each amplitude, take its size squared. That gives the chance of the matching result. For a valid qubit, the two chances add up to 100%."],
      ["You can explore this", "Move the sliders and watch the chance of 0 and 1 change. You can learn the symbols gradually; you do not need to memorise them first."]
    ],
  },
  superposition: {
    title: "What is superposition?",
    summary: "Superposition means the qubit is prepared in a quantum state that can give different results when measured. It is not just an ordinary bit whose value we haven't checked.",
    sections: [
      ["Picture it", "A spinning coin is a helpful starting image: while it spins, the simple heads-or-tails picture feels incomplete. A qubit is not literally a spinning coin, but its state before measurement also needs a richer description."],
      ["Try it", "Start at |0⟩ and apply H. The qubit is now in a state with a 50% chance of measuring 0 and a 50% chance of measuring 1."],
      ["Why it matters", "Quantum algorithms combine gates so that different possibilities can reinforce or cancel each other, helping some problems become easier to solve."]
    ],
  },
  bloch: {
    title: "What is the Bloch sphere?",
    summary: "The Bloch sphere is a 3D map that helps us draw the state of one qubit. The dot shows the state in a picture; it is not a tiny ball inside the computer.",
    sections: [
      ["How to read it", "The top represents |0⟩ and the bottom represents |1⟩. Points around the middle represent other states."],
      ["Imagine moving a marker", "When you apply a gate, the marker may move. Watching it move helps you build intuition about how the qubit changed."],
      ["Why it matters", "Some changes are easy to see on the sphere even when the measurement chances stay the same."]
    ],
  },
  angles: {
    title: "What are theta and phi?",
    summary: "Theta (θ) and phi (φ) are two angles that tell us where the state appears on the Bloch sphere.",
    sections: [
      ["Picture it", "Imagine pointing to a spot on a globe. One angle tells you how far down from the top to go; the other tells you which direction to turn around the globe."],
      ["What changes?", "Changing theta usually changes the chances of measuring 0 or 1. Changing phi can change how the quantum parts line up, even when those chances stay the same."],
      ["You can experiment", "Move each slider and watch the dot and the measurement chances. You can understand the picture before learning the equations."]
    ],
  },
  qiskit: {
    title: "What is Qiskit?",
    summary: "Qiskit is a set of programming tools people use to describe quantum circuits in Python.",
    sections: [
      ["Everyday comparison", "If the circuit builder is a visual recipe, Qiskit lets you write that recipe as code."],
      ["A tiny example", "A line like qc.h(0) means: apply the H gate to qubit number 0 in the circuit."],
      ["Important note", "This panel shows example code. Showing code is not the same as sending it to a real quantum computer."]
    ],
  },
};

const aliases = { h: "gate-h", x: "gate-x", y: "gate-y", z: "gate-z", s: "gate-s", t: "gate-t", reset: "reset" };

export default function EducationHelp({ topic = "gate", label = "Learn about this concept" }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const key = lessons[topic] ? topic : (aliases[topic.toLowerCase()] || topic);
  const lesson = lessons[key] || lessons.gate;

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

  const dialog = open ? (
    <div style={styles.backdrop} onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpen(false);
    }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`lesson-title-${key}`}
        style={styles.dialog}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = event.currentTarget.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}
      >
        <div style={styles.dialogHeader}>
          <div>
            <div style={styles.eyebrow}>QUANTUM EXPLORER · LET'S FIGURE IT OUT</div>
            <h2 id={`lesson-title-${key}`} style={styles.title}>{lesson.title}</h2>
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
          <span>Curious is enough. You don't need to memorise anything.</span>
          <button type="button" onClick={() => setOpen(false)} style={styles.doneButton}>Back to exploring</button>
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button ref={triggerRef} type="button" aria-label={label} title={label} onClick={() => setOpen(true)} style={styles.infoButton}>i</button>
      {open && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}

const styles = {
  infoButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.35rem", height: "1.35rem", padding: 0, flex: "0 0 auto", borderRadius: "50%", border: "1px solid rgba(103,232,249,0.65)", background: "rgba(8,145,178,0.12)", color: "#67e8f9", fontSize: "0.8rem", fontWeight: 700, lineHeight: 1, cursor: "pointer", fontFamily: "system-ui, sans-serif" },
  backdrop: { position: "fixed", inset: 0, zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(2,6,23,0.86)", backdropFilter: "blur(5px)", isolation: "isolate" },
  dialog: { position: "relative", zIndex: 2147483647, width: "min(100%, 42rem)", maxHeight: "min(85vh, 52rem)", overflowY: "auto", padding: "clamp(1rem, 3vw, 1.75rem)", borderRadius: "12px", border: "1px solid rgba(103,232,249,0.25)", background: "#0b1220", boxShadow: "0 24px 80px rgba(0,0,0,0.65)", color: "#e5e7eb" },
  dialogHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  eyebrow: { color: "#67e8f9", fontSize: "0.68rem", letterSpacing: "0.1em", fontFamily: "monospace", marginBottom: "0.5rem" },
  title: { color: "#f8fafc", fontSize: "clamp(1.25rem, 3vw, 1.7rem)", lineHeight: 1.25, margin: 0 },
  closeButton: { width: "2rem", height: "2rem", flex: "0 0 auto", borderRadius: "6px", border: "1px solid #334155", background: "#111827", color: "#e5e7eb", fontSize: "1.5rem", cursor: "pointer" },
  summary: { color: "#e2e8f0", fontSize: "1rem", lineHeight: 1.7, margin: "1.25rem 0", padding: "1rem", borderLeft: "3px solid #22d3ee", background: "rgba(8,145,178,0.08)" },
  sections: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 15rem), 1fr))", gap: "0.85rem" },
  lessonSection: { padding: "0.9rem", border: "1px solid rgba(148,163,184,0.16)", borderRadius: "8px", background: "rgba(15,23,42,0.65)" },
  sectionTitle: { margin: "0 0 0.45rem", color: "#6ee7b7", fontSize: "0.85rem", letterSpacing: "0.02em" },
  sectionBody: { margin: 0, color: "#d1d5db", fontSize: "0.92rem", lineHeight: 1.7 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem", color: "#94a3b8", fontSize: "0.75rem" },
  doneButton: { border: "1px solid rgba(16,185,129,0.6)", background: "rgba(16,185,129,0.12)", color: "#d1fae5", padding: "0.6rem 0.85rem", borderRadius: "6px", cursor: "pointer", fontWeight: 600 },
};
