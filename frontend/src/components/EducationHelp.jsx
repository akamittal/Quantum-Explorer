import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MathRenderer from "../MathRenderer";

const lessons = {
  "why-quantum": {
    title: "Why are people building quantum computers?",
    summary: "Your phone is brilliant at everyday jobs. But predicting how atoms and molecules behave can be much harder than storing a photo or sending a message. Quantum computers are being built to explore some of those special problems in a new way.",
    sections: [
      ["Start with something familiar", "A normal computer follows instructions using bits, tiny pieces of information that are either 0 or 1. Lots of bits can describe photos, music, maps and games."],
      ["A puzzle from nature", "Imagine trying to predict exactly how every drop of water moves in a huge waterfall. Even if you know the rules, keeping track of every tiny detail can be difficult. Molecules are a different kind of puzzle: their tiny parts follow quantum rules, and those rules can be hard to imitate with ordinary bits."],
      ["What could a quantum computer help with?", "Scientists are investigating whether quantum computers can help model molecules, discover useful materials, and solve certain carefully chosen maths problems. They are not magic, and they will not make every website, game or calculation faster. The machines we have today are still limited."],
      ["What you will learn here", "You will prepare a qubit, change it with simple actions, and measure it. You will see how changing the recipe changes the results. We start small because bigger quantum experiments are built from these same ideas."]
    ],
  },
  bit: {
    title: "First, what is a bit?",
    summary: "A bit is a tiny piece of information in an ordinary computer. Picture a light switch: OFF means 0 and ON means 1. A bit stores one of those two values.",
    visual: "bit",
    sections: [
      ["Imagine a switch", "Look at a room light. At a given moment, the switch is either off or on. A computer bit is similar: when we read it, its stored value is 0 or 1."],
      ["Bits build bigger things", "A single bit cannot describe a whole photo. But a computer uses huge numbers of bits together, along with instructions, to store images, messages, songs and much more."],
      ["Try the comparison", "Write 0 on one side of a card and 1 on the other. Turn the card to choose a value. That is a simple model of the two values a bit can store."]
    ],
  },
  qubit: {
    title: "So, what is a qubit?",
    summary: "A qubit is the basic unit of quantum information. When measured in the way used in this playground, it gives 0 or 1. Before that measurement, its quantum state can give different chances for those results.",
    visual: "qubit",
    sections: [
      ["Picture a spinning coin", "A coin resting on a table is clearly heads or tails. A spinning coin is harder to describe with only those two words. This is a useful picture for a qubit, but it is only an analogy. A qubit is not a tiny coin, and it does not literally spin between 0 and 1."],
      ["What does a qubit actually do?", "A qubit is prepared in a quantum state. When we measure it, the experiment gives one ordinary answer, 0 or 1. The state tells us the chances of each answer. For example, some states give 0 every time, while another state can give either result about half the time."],
      ["Why is it different from a hidden bit?", "A qubit is not simply an ordinary switch whose value we have not looked at yet. Quantum states can also affect one another through a wave-like effect called interference. Later gates can make that effect change the chances we measure."],
      ["Notation", "The symbols [[\\lvert0\\rangle]] and [[\\lvert1\\rangle]] name the two measurement outcomes. The state can be written as [[\\lvert\\psi\\rangle = \\alpha\\lvert0\\rangle + \\beta\\lvert1\\rangle]]. Alpha and beta are numbers that describe the state and help us calculate the chances."]
    ],
  },
  gate: {
    title: "What is a quantum gate?",
    summary: "A gate is an action that changes a qubit. Think of following a recipe: each step changes what you have, and the order of the steps matters.",
    visual: "circuit",
    sections: [
      ["A recipe, one step at a time", "Imagine making a sandwich. Adding cheese and then toasting it can give a different result from toasting first and adding the cheese later. A quantum circuit also follows a chosen order of steps."],
      ["Try a flip", "The X gate swaps the two basic states: [[\\lvert0\\rangle]] becomes [[\\lvert1\\rangle]], and [[\\lvert1\\rangle]] becomes [[\\lvert0\\rangle]]. It is similar to flipping a light switch."],
      ["How do we draw gates?", "A circuit is drawn as a line with small boxes placed on it. Each box represents an action. Read the boxes from left to right, then measure the qubit to see the result."]
    ],
  },
  "gate-h": {
    title: "H: the Hadamard gate",
    summary: "Start with a qubit in state 0. The H gate prepares a state that has a 50% chance of measuring 0 and a 50% chance of measuring 1.",
    visual: "hadamard",
    sections: [
      ["Picture two directions", "Imagine a compass arrow pointing straight up. Now imagine a second direction pointing to the right. The H gate takes the starting state at the top of the Bloch sphere to a point on its equator. That point is halfway around from the top, not halfway down a flat page. In a different picture, the result has equal amounts of the 0 and 1 outcomes. These pictures describe the same quantum state in different ways."],
      ["Try it yourself", "Start at [[\\lvert0\\rangle]] and apply H once. Measure many times. You should see roughly half 0s and half 1s. With only ten tries, the count might be six and four, or seven and three. More tries usually give a clearer picture of the 50/50 chance."],
      ["The short formula", "For this starting state, we write [[H\\lvert0\\rangle = (\\lvert0\\rangle + \\lvert1\\rangle)/\\sqrt{2}]]. You do not need to memorise it. The important idea is that H changes the state so both results are equally likely when measured."],
      ["Why it matters", "The H gate is often used to create a state where both outcomes are possible. Later gates can change how the possibilities affect one another, which can change the final answer."]
    ],
  },
  "gate-x": {
    title: "X: the flip gate",
    summary: "The X gate swaps 0 and 1, like flipping a light switch from OFF to ON or ON to OFF.",
    visual: "bit",
    sections: [
      ["Try it", "Start at [[\\lvert0\\rangle]] and press X. The state becomes [[\\lvert1\\rangle]], so measurement gives 1. Press X again and it returns to [[\\lvert0\\rangle]]. Two flips undo each other."],
      ["What if the state is more interesting?", "X also swaps the roles of the 0 and 1 parts of a more general quantum state. You can test this by applying H and then X, and comparing the state display with H alone."],
      ["Remember", "X is similar to NOT in an ordinary computer, but it is a quantum gate and can act on states that are not just 0 or 1."]
    ],
  },
  "gate-y": {
    title: "Y: another kind of turn",
    summary: "Y is a basic gate that changes the qubit. Starting from 0, it produces a state that measures as 1, while also changing a detail that can affect later gates.",
    visual: "arrows",
    sections: [
      ["Why is it not just another X?", "X and Y both take the starting state 0 to a state that measures as 1, but they do not make exactly the same change to every possible state. The difference can show up after you apply another gate."],
      ["Try a fair comparison", "Reset to 0. Apply X and look at the result. Reset again, apply Y, and look again. The immediate measurement result is the same, but the state details differ. Try adding another gate before measuring to explore how order matters."],
      ["What to remember", "You do not need to memorise a matrix to use the playground. Try the same starting state and compare what happens after different sequences."]
    ],
  },
  "gate-z": {
    title: "Z: a change that can hide until later",
    summary: "If a qubit is simply 0 or simply 1, Z does not change the measurement chance. But when the qubit has been prepared in a state with both outcomes possible, Z can change how later gates affect the result.",
    visual: "waves",
    sections: [
      ["A wave picture", "Imagine ripples spreading across a pond and meeting again. At one spot, two ripples can rise together and make a bigger wave. At another spot, a crest can meet a dip and partly cancel. This adding and cancelling is called interference."],
      ["How does that help explain Z?", "A qubit's state has two parts connected to the possible results 0 and 1. The Z gate changes the sign of the 1 part while leaving the 0 part alone. That change is invisible to a direct measurement of a state that is already 0 or 1, but a later gate can make it affect the result."],
      ["Try this recipe", "Start at 0, apply H, then Z, then H again. The final result is 1. Now reset and try H followed by H, leaving Z out. The final result is 0. The only changed step was Z, but it changed the final answer because the steps work together."]
    ],
  },
  "gate-s": {
    title: "S: a phase change",
    summary: "S changes a part of the qubit state in a way that may not change the immediate measurement chances. It can change what happens when another gate follows.",
    visual: "waves",
    sections: [
      ["Think of waves meeting", "Two ripples can meet and add together, or meet in a way that partly cancels. Moving one ripple along changes where the peaks and dips meet."],
      ["What S changes", "For the basic states 0 and 1, S leaves the measurement result unchanged. For a state containing both parts, it changes their relative phase, which can affect interference after later gates."],
      ["Try it", "Apply S to 0 and measure. You still get 0. Then prepare a more interesting state with H before S, and add another gate before measuring. Compare the results with and without S."]
    ],
  },
  "gate-t": {
    title: "T: a smaller phase change",
    summary: "T makes a smaller phase change than S. It may be hard to notice by itself, but it can matter as one step in a longer circuit.",
    visual: "waves",
    sections: [
      ["Picture turning a dial", "Imagine turning a dial by a small amount. The change may be hard to notice right away, but if the dial controls what happens in the next step, the final result can differ."],
      ["What it changes", "T changes the relative phase of the 1 part compared with the 0 part. If the qubit is simply 0, you will not see a different measurement result from applying T alone."],
      ["Explore", "Try H, then T, then another H. Reset and compare with H, then H. The different recipe helps show why a small change in the middle can matter."]
    ],
  },
  reset: {
    title: "Reset: start again",
    summary: "Reset returns the simulated qubit to state 0 so you can run a new experiment from a known starting point.",
    visual: "bit",
    sections: [
      ["An everyday comparison", "It is like returning a board game to its starting position before trying a different strategy."],
      ["Why it helps", "If each test begins from the same state, you can compare gate sequences fairly. Otherwise, a difference in the result might come from the starting state rather than the gate you wanted to test."],
      ["One important detail", "Reset is a simulator action here. Unlike gates such as X and H, it is not a reversible quantum gate."]
    ],
  },
  circuit: {
    title: "What is a quantum circuit?",
    summary: "A quantum circuit is a recipe made from gates. Read it from left to right, because each gate acts on the state produced by the step before it.",
    visual: "circuit",
    sections: [
      ["Read it like a recipe", "The line shows the qubit travelling through a sequence of steps. Each box is a gate. At the end, measurement gives an ordinary result such as 0 or 1."],
      ["A tiny experiment", "Start at 0 and apply H twice. The first H creates a state with equal chances for 0 and 1. The second H undoes the first for this starting state, so the final measurement gives 0."],
      ["Why order matters", "A recipe with the same ingredients can turn out differently when the order changes. Quantum gates work together too, so H then Z then H can give a different answer from H then H."]
    ],
  },
  measurement: {
    title: "What does measurement mean?",
    summary: "Measurement is when we read the qubit and get an ordinary answer. In this playground, that answer is 0 or 1.",
    visual: "measurement",
    sections: [
      ["One experiment gives one answer", "If you measure once, you get one result. You do not get a list containing every possible result from that one measurement."],
      ["What is a shot?", "A shot is one run of the experiment. If you repeat the same experiment 100 times, you get 100 results that you can count."],
      ["Why do the counts vary?", "Suppose each run has a 50% chance of 0 and a 50% chance of 1. In 100 runs, you might get 48 zeros and 52 ones, or 55 zeros and 45 ones. The chances stay the same, but the random results do not have to split exactly in half."],
      ["Read the probabilities", "P(0) means the chance of measuring 0. P(1) means the chance of measuring 1. For a qubit measured this way, those two chances add up to 100%."]
    ],
  },
  amplitude: {
    title: "What is an amplitude?",
    summary: "An amplitude is a number that describes part of a qubit's state. It is not itself a percentage. We use its size to calculate the chance of getting a measurement result.",
    visual: "amplitude",
    sections: [
      ["Two labels, two numbers", "A qubit's state is often written as [[\\lvert\\psi\\rangle = \\alpha\\lvert0\\rangle + \\beta\\lvert1\\rangle]]. Alpha (α) goes with the 0 outcome and beta (β) goes with the 1 outcome."],
      ["How does a number become a chance?", "For each amplitude, take its absolute size and square it. That gives the chance of the matching measurement result. For example, an amplitude with size 1 gives a 100% chance; an amplitude with size 0 gives a 0% chance."],
      ["Why not call the amplitude a probability?", "Amplitudes can include signs or complex-number parts, so they contain information that a simple percentage does not. Later gates can make those details affect interference. That is why two states with the same immediate chances can behave differently after another gate."],
      ["Explore the sliders", "Move the amplitude slider and watch the two chances change. The simulator keeps the state valid, so the chances of 0 and 1 always add up to 100%."]
    ],
  },
  superposition: {
    title: "What is superposition?",
    summary: "Superposition is a quantum state that can give different results when measured. It is more than an ordinary bit whose value we have not checked.",
    visual: "qubit",
    sections: [
      ["Start with a picture", "A spinning coin can remind us that a simple heads-or-tails description may not tell the whole story. But a qubit is not literally a spinning coin. Its behaviour is described by the rules of quantum physics."],
      ["A real playground example", "Start with 0 and apply H. The qubit now has a 50% chance of measuring 0 and a 50% chance of measuring 1. One measurement still gives only one answer."],
      ["Why it matters", "The useful part is not that a qubit simply holds two answers at once. Quantum gates can change how the parts of a state interfere, making some results more likely and others less likely. Quantum algorithms are designed to use this effect for particular problems."]
    ],
  },
  bloch: {
    title: "What is the Bloch sphere?",
    summary: "The Bloch sphere is a 3D map for drawing the state of one qubit. The dot is a picture of the state, not a tiny ball inside the computer.",
    visual: "sphere",
    sections: [
      ["Read the map", "The top of the sphere represents 0, and the bottom represents 1. Other points represent other possible qubit states. The dot helps us see a change that can be difficult to picture from symbols alone."],
      ["Move the dot", "When you apply a gate, the dot may move to another place on the sphere. Change the angles with the sliders and watch the dot move."],
      ["What can the picture show?", "The dot's height is related to the chances of measuring 0 or 1. Moving around the middle can change other details of the state even when those two chances stay the same. Those details can matter when you apply more gates."]
    ],
  },
  angles: {
    title: "What are theta and phi?",
    summary: "Theta and phi are two angles that tell us where the qubit's dot sits on the Bloch sphere. Imagine pointing to a place on a globe.",
    visual: "sphere",
    sections: [
      ["Theta: how far down?", "Imagine a globe with your finger at the North Pole. Theta tells you how far to tilt down from the top. At 0 degrees you are at the top; at 90 degrees you are around the middle; at 180 degrees you are at the bottom."],
      ["Phi: which direction around?", "Keep your finger at the same height on the globe and walk around it. Phi tells you which direction around the sphere you are pointing. Changing phi moves the dot around a circle of the same height."],
      ["Why does phi matter if the chances stay the same?", "Picture two ripples meeting in a pond. If their peaks meet, they can make a bigger ripple. If a peak meets a dip, they can partly cancel. A qubit has a part linked to 0 and a part linked to 1. Phi changes their relative phase, which is a bit like shifting one ripple compared with the other. This does not change the immediate chances of 0 and 1 when you measure, but it can change how later gates combine the two parts. That later combining is called interference."],
      ["Try this", "Keep theta fixed and move phi. You may see the dot travel around the sphere while the probability bars stay the same. Then apply another gate and compare the final measurement chances."]
    ],
  },
  qiskit: {
    title: "What is Qiskit?",
    summary: "Qiskit is a set of Python programming tools for describing quantum circuits. It lets people write the same kind of gate recipe in code instead of clicking buttons.",
    visual: "circuit",
    sections: [
      ["Visual recipe versus written recipe", "In this playground, you can click gates and watch the state change. With Qiskit, you can write instructions in Python to build a circuit and run a simulation or, where supported, send it to a quantum device."],
      ["A tiny example", "The line [[qc.h(0)]] means: apply the H gate to qubit number 0 in the circuit. The 0 here is the qubit's index in the program, not the result of measuring it."],
      ["Does this panel run the code?", "No. The code panel is an example for learning. Displaying code does not execute it or send it to a real quantum computer."]
    ],
  },
};

const aliases = { h: "gate-h", x: "gate-x", y: "gate-y", z: "gate-z", s: "gate-s", t: "gate-t", reset: "reset" };

function RichText({ text }) {
  const pieces = text.split(/(\[\[[\\s\\S]*?\\]\\])/g);
  return <>{pieces.map((piece, index) => piece.startsWith("[[") && piece.endsWith("]]")
    ? <MathRenderer key={index} formula={piece.slice(2, -2)} displayMode={false} />
    : <React.Fragment key={index}>{piece}</React.Fragment>)}</>;
}

function LessonVisual({ type }) {
  const line = { stroke: "#94a3b8", strokeWidth: 2, strokeLinecap: "round" };
  const cyan = "#67e8f9";
  const green = "#6ee7b7";
  return (
    <div style={styles.visualWrap} aria-label="Illustration for this explanation">
      <svg viewBox="0 0 320 112" role="img" aria-hidden="true" style={styles.visual}>
        {type === "bit" && <>
          <path d="M48 56 H272" {...line} />
          <rect x="94" y="25" width="132" height="62" rx="12" fill="#111827" stroke="#475569" />
          <circle cx="124" cy="56" r="12" fill={green} />
          <circle cx="196" cy="56" r="12" fill="#334155" />
          <text x="124" y="18" textAnchor="middle" fill="#cbd5e1" fontSize="11">0 / OFF</text>
          <text x="196" y="18" textAnchor="middle" fill="#cbd5e1" fontSize="11">1 / ON</text>
          <path d="M136 56 H184" {...line} />
          <path d="M178 50 L184 56 L178 62" fill="none" {...line} />
        </>}
        {(type === "qubit" || type === "hadamard") && <>
          <circle cx="68" cy="55" r="27" fill="#0f172a" stroke={cyan} strokeWidth="2" />
          <path d="M68 78 V31 M61 39 L68 31 L75 39" fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M105 55 H145 M139 49 L145 55 L139 61" fill="none" {...line} />
          <rect x="151" y="35" width="48" height="40" rx="7" fill="#164e63" stroke={cyan} />
          <text x="175" y="60" fill="#ecfeff" textAnchor="middle" fontSize="16" fontWeight="bold">{type === "hadamard" ? "H" : "?"}</text>
          <path d="M202 55 H234 M228 49 L234 55 L228 61" fill="none" {...line} />
          <rect x="241" y="25" width="62" height="60" rx="8" fill="#111827" stroke="#475569" />
          <text x="272" y="44" textAnchor="middle" fill="#cbd5e1" fontSize="11">Result</text>
          <text x="272" y="62" textAnchor="middle" fill={green} fontSize="13">0 or 1</text>
          <text x="68" y="105" textAnchor="middle" fill="#cbd5e1" fontSize="10">Start</text>
          <text x="175" y="105" textAnchor="middle" fill="#cbd5e1" fontSize="10">Gate</text>
        </>}
        {(type === "circuit") && <>
          <path d="M18 56 H302" {...line} />
          {[58, 142, 226].map((x, i) => <g key={x}><rect x={x} y="36" width="42" height="40" rx="5" fill={i === 1 ? "#164e63" : "#111827"} stroke={i === 1 ? cyan : "#475569"} /><text x={x + 21} y="60" fill="#f8fafc" fontSize="16" textAnchor="middle">{["H", "Z", "H"][i]}</text></g>)}
          <text x="20" y="20" fill="#cbd5e1" fontSize="10">Start</text><text x="277" y="20" fill="#cbd5e1" fontSize="10">Measure</text>
        </>}
        {(type === "waves") && <>
          <path d="M16 36 C36 8 56 8 76 36 S116 64 136 36 S176 8 196 36 S236 64 256 36 S296 8 304 24" fill="none" stroke={cyan} strokeWidth="2.5" />
          <path d="M16 76 C36 104 56 104 76 76 S116 48 136 76 S176 104 196 76 S236 48 256 76 S296 104 304 88" fill="none" stroke={green} strokeWidth="2.5" />
          <text x="160" y="58" fill="#e2e8f0" textAnchor="middle" fontSize="11">Waves can add or cancel</text>
        </>}
        {type === "measurement" && <>
          <path d="M24 85 H296" {...line} />
          {[0,1,2,3,4,5,6,7,8,9].map((n) => <circle key={n} cx={44+n*25} cy={n%3===0?48:n%2===0?60:70} r="5" fill={n%2===0?cyan:green} />)}
          <text x="160" y="20" fill="#cbd5e1" textAnchor="middle" fontSize="11">One dot = one measurement</text>
          <text x="160" y="105" fill="#94a3b8" textAnchor="middle" fontSize="10">Repeat the same experiment</text>
        </>}
        {type === "amplitude" && <>
          <text x="24" y="24" fill="#cbd5e1" fontSize="12">0 part</text><rect x="24" y="34" width="116" height="16" rx="5" fill="#1e293b"/><rect x="24" y="34" width="74" height="16" rx="5" fill={cyan}/>
          <text x="180" y="24" fill="#cbd5e1" fontSize="12">1 part</text><rect x="180" y="34" width="116" height="16" rx="5" fill="#1e293b"/><rect x="180" y="34" width="42" height="16" rx="5" fill={green}/>
          <text x="160" y="83" fill="#e2e8f0" fontSize="11" textAnchor="middle">Amplitude size helps determine chance</text>
        </>}
        {type === "sphere" && <>
          <circle cx="86" cy="56" r="43" fill="#0f172a" stroke={cyan} strokeWidth="2" />
          <ellipse cx="86" cy="56" rx="43" ry="15" fill="none" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="86" cy="56" rx="15" ry="43" fill="none" stroke="#475569" strokeWidth="1.5" />
          <path d="M86 13 V99" stroke="#475569" strokeDasharray="3 4" />
          <circle cx="117" cy="36" r="5.5" fill={green} stroke="#ecfdf5" />
          <path d="M122 35 L163 23" stroke={green} strokeWidth="1.5" />
          <text x="169" y="25" fill="#cbd5e1" fontSize="11">The dot shows</text><text x="169" y="40" fill="#cbd5e1" fontSize="11">the state</text>
          <text x="86" y="109" fill="#94a3b8" textAnchor="middle" fontSize="10">A map, not a tiny ball</text>
        </>}
        {type === "arrows" && <>
          <path d="M76 86 V26 M66 36 L76 26 L86 36" fill="none" stroke={cyan} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M116 76 H184 M174 66 L184 76 L174 86" fill="none" stroke={green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="76" y="105" fill="#cbd5e1" fontSize="10" textAnchor="middle">Before</text><text x="150" y="105" fill="#cbd5e1" fontSize="10" textAnchor="middle">After a gate</text>
        </>}
      </svg>
    </div>
  );
}

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
    const onKeyDown = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  const dialog = open ? (
    <div style={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby={"lesson-title-" + key} style={styles.dialog}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = event.currentTarget.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (!first || !last) return;
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }}>
        <div style={styles.dialogHeader}>
          <div><div style={styles.eyebrow}>QUANTUM EXPLORER / LET'S FIGURE IT OUT</div><h2 id={"lesson-title-" + key} style={styles.title}>{lesson.title}</h2></div>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close explanation" style={styles.closeButton}>×</button>
        </div>
        <p style={styles.summary}><RichText text={lesson.summary} /></p>
        {lesson.visual && <LessonVisual type={lesson.visual} />}
        <div style={styles.sections}>
          {lesson.sections.map(([heading, body]) => <section key={heading} style={styles.lessonSection}>
            <h3 style={styles.sectionTitle}>{heading}</h3><p style={styles.sectionBody}><RichText text={body} /></p>
          </section>)}
        </div>
        <div style={styles.footer}><span>Try the example, then come back and change one thing.</span><button type="button" onClick={() => setOpen(false)} style={styles.doneButton}>Back to exploring</button></div>
      </section>
    </div>
  ) : null;

  return <><button ref={triggerRef} type="button" aria-label={label} title={label} onClick={() => setOpen(true)} style={styles.infoButton}>i</button>{open && typeof document !== "undefined" ? createPortal(dialog, document.body) : null}</>;
}

const styles = {
  infoButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.35rem", height: "1.35rem", padding: 0, flex: "0 0 auto", borderRadius: "50%", border: "1px solid rgba(103,232,249,0.65)", background: "rgba(8,145,178,0.12)", color: "#67e8f9", fontSize: "0.8rem", fontWeight: 700, lineHeight: 1, cursor: "pointer", fontFamily: "inherit" },
  backdrop: { position: "fixed", inset: 0, zIndex: 2147483647, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(2,6,23,0.52)", backdropFilter: "blur(5px)", isolation: "isolate" },
  dialog: { position: "relative", zIndex: 2147483647, width: "min(100%, 44rem)", maxHeight: "min(88vh, 58rem)", overflowY: "auto", padding: "clamp(1rem, 3vw, 1.75rem)", borderRadius: "12px", border: "1px solid rgba(103,232,249,0.25)", background: "#0b1220", boxShadow: "0 24px 80px rgba(0,0,0,0.55)", color: "#e5e7eb", fontFamily: "system-ui, sans-serif", fontSize: "inherit", lineHeight: "inherit" },
  dialogHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" },
  eyebrow: { color: "#67e8f9", fontSize: "0.68rem", letterSpacing: "0.1em", fontFamily: "inherit", marginBottom: "0.5rem" },
  title: { color: "#f8fafc", fontSize: "clamp(1.25rem, 3vw, 1.7rem)", lineHeight: 1.25, margin: 0, fontFamily: "inherit" },
  closeButton: { width: "2rem", height: "2rem", flex: "0 0 auto", borderRadius: "6px", border: "1px solid #334155", background: "#111827", color: "#e5e7eb", fontSize: "1.5rem", cursor: "pointer", fontFamily: "inherit" },
  summary: { color: "#e2e8f0", fontSize: "1rem", lineHeight: 1.7, margin: "1.25rem 0", padding: "1rem", borderLeft: "3px solid #22d3ee", background: "rgba(8,145,178,0.08)", fontFamily: "inherit", fontWeight: 400 },
  visualWrap: { width: "100%", margin: "0 0 1rem", padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid rgba(103,232,249,0.18)", background: "rgba(15,23,42,0.45)", boxSizing: "border-box" },
  visual: { display: "block", width: "100%", maxHeight: "9rem" },
  sections: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))", gap: "0.85rem" },
  lessonSection: { padding: "0.9rem", border: "1px solid rgba(148,163,184,0.16)", borderRadius: "8px", background: "rgba(15,23,42,0.42)", minWidth: 0 },
  sectionTitle: { margin: "0 0 0.45rem", color: "#6ee7b7", fontSize: "0.9rem", letterSpacing: "0.01em", fontWeight: 650, fontFamily: "inherit" },
  sectionBody: { margin: 0, color: "#d1d5db", fontSize: "0.94rem", lineHeight: 1.75, whiteSpace: "normal", overflowWrap: "break-word", wordBreak: "normal", fontFamily: "inherit", fontWeight: 400 },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(148,163,184,0.16)", color: "#94a3b8", fontSize: "0.82rem", fontFamily: "inherit" },
  doneButton: { border: "1px solid rgba(103,232,249,0.4)", borderRadius: "6px", padding: "0.65rem 0.9rem", background: "rgba(8,145,178,0.14)", color: "#cffafe", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" },
};
