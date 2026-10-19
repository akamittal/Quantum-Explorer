import React, { useState, useEffect, useRef } from "react";
import QuantumParticleBackground from "./QuantumParticleBackground";
import QuantumWorkspaceLayout from "./QuantumWorkspaceLayout";
import SingleQubitModule from "./SingleQubitModule";
import BlochSphereView from "./BlochSphereView";
import IntroHUD from "./IntroHUD";
import MantraSequence from "./MantraSequence";
import { styles } from "./workspaceStyles";

export default function App() {
  const [narrativePhase, setNarrativePhase] = useState(0);
  const [activeLines, setActiveLines] = useState({
    line1: false,
    line2: false,
    line3: false,
    meaning: false,
  });
  const [typedNarrative, setTypedNarrative] = useState("");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const audioNodeRef = useRef(null);

  const [qubitAmplitudes, setQubitAmplitudes] = useState({
    alpha: { re: 1.0, im: 0.0 },
    beta: { re: 0.0, im: 0.0 },
  });
  const [blochCoordinates, setBlochCoordinates] = useState({
    x: 0,
    y: 0,
    z: 1,
  });

  const chronologicalScript = [
    "Not all could be answered within the bounds of physical laws.",
    "You can ignore what you can't explain, but their existence cannot be ignored.",
    "Beyond logic, there is a far bigger world of truth, appearing as an illusion.",
    "Welcome to the world of Quantum Computing.",
  ];

  const beginQuantumObservation = () => {
    setNarrativePhase(1);
    setTimeout(() => setActiveLines((p) => ({ ...p, line1: true })), 200);
    setTimeout(() => setActiveLines((p) => ({ ...p, line2: true })), 2800);
    setTimeout(() => setActiveLines((p) => ({ ...p, line3: true })), 5400);
    setTimeout(() => setActiveLines((p) => ({ ...p, meaning: true })), 8200);
    setTimeout(() => setNarrativePhase(2), 14000);

    if (isAudioEnabled && audioNodeRef.current) {
      audioNodeRef.current.volume = 0.5;
      audioNodeRef.current
        .play()
        .catch((err) => console.warn("Audio held:", err));
    }
  };

  // Robust, zero-index safe character stream compiler layout fix
  useEffect(() => {
    if (narrativePhase !== 2) return;

    const fullTextTarget = chronologicalScript.join("\n\n");
    let currentStringPointer = 0;

    // Explicit initial state reset assignment
    setTypedNarrative("");

    const typingEngine = setInterval(() => {
      if (currentStringPointer < fullTextTarget.length) {
        // Safeguard against missing elements by returning empty slots instead of 'undefined' strings
        const safeCharacter = fullTextTarget[currentStringPointer]
          ? fullTextTarget[currentStringPointer]
          : "";

        setTypedNarrative((prevAccumulator) => prevAccumulator + safeCharacter);
        currentStringPointer++;
      } else {
        clearInterval(typingEngine);
        setNarrativePhase(3);
      }
    }, 25);

    return () => clearInterval(typingEngine);
  }, [narrativePhase]);

  useEffect(() => {
    if (narrativePhase !== 3 || !audioNodeRef.current) return;
    const volumeFadeController = setInterval(() => {
      if (audioNodeRef.current.volume > 0.04) {
        audioNodeRef.current.volume -= 0.04;
      } else {
        audioNodeRef.current.pause();
        clearInterval(volumeFadeController);
      }
    }, 200);
    return () => clearInterval(volumeFadeController);
  }, [narrativePhase]);

  const handleInjectUnitaryGate = (gateType) => {
    let a = { ...qubitAmplitudes.alpha },
      b = { ...qubitAmplitudes.beta };
    let nextA = { re: 1, im: 0 },
      nextB = { re: 0, im: 0 };

    if (gateType === "H") {
      const root2 = Math.sqrt(2);
      nextA = { re: (a.re + b.re) / root2, im: (a.im + b.im) / root2 };
      nextB = { re: (a.re - b.re) / root2, im: (a.im - b.im) / root2 };
    } else if (gateType === "X") {
      nextA = { ...b };
      nextB = { ...a };
    } else if (gateType === "Z") {
      nextA = { ...a };
      nextB = { re: -b.re, im: -b.im };
    } else if (gateType === "RESET") {
      nextA = { re: 1.0, im: 0.0 };
      nextB = { re: 0.0, im: 0.0 };
    }

    setQubitAmplitudes({ alpha: nextA, beta: nextB });
    const xCoord = 2 * (nextA.re * nextB.re + nextA.im * nextB.im);
    const yCoord = 2 * (nextA.re * nextB.im - nextA.im * nextB.re);
    const zCoord =
      nextA.re * nextA.re +
      nextA.im * nextA.im -
      (nextB.re * nextB.re + nextB.im * nextB.im);
    setBlochCoordinates({
      x: Number(xCoord.toFixed(5)),
      y: Number(yCoord.toFixed(5)),
      z: Number(zCoord.toFixed(5)),
    });
  };

  if (narrativePhase === 4) {
    return (
      <QuantumWorkspaceLayout
        LeftContent={
          <SingleQubitModule
            coordinates={blochCoordinates}
            amplitudes={qubitAmplitudes}
            onApplyGate={handleInjectUnitaryGate}
          />
        }
        RightContent={<BlochSphereView coordinates={blochCoordinates} />}
      />
    );
  }

  return (
    <div style={styles.deepSpaceCanvas}>
      <style>{`
                @keyframes cinematicSlideIn {
                    0% { opacity: 0; transform: translate3d(-25px, 0, 0); filter: blur(6px); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0px); }
                }
                @keyframes masterButtonFade {
                    0% { opacity: 0; transform: translate3d(0, 15px, 0); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0); }
                }
                .cinematic-reveal { animation: cinematicSlideIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .action-button-reveal { animation: masterButtonFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

      <QuantumParticleBackground />
      <audio ref={audioNodeRef} src="https://google.com" preload="auto" />

      {narrativePhase === 0 && (
        <IntroHUD
          onObserve={beginQuantumObservation}
          onBypass={() => setNarrativePhase(4)}
          isAudio={isAudioEnabled}
          onToggleAudio={setIsAudioEnabled}
          styles={styles}
        />
      )}

      {narrativePhase === 1 && (
        <MantraSequence activeLines={activeLines} styles={styles} />
      )}

      {(narrativePhase === 2 || narrativePhase === 3) && (
        <div style={styles.narrativeLayoutGrid}>
          <p style={styles.narrativeConsoleOutput}>{typedNarrative}</p>
          <div style={styles.fixedButtonZone}>
            {narrativePhase === 3 && (
              <button
                onClick={() => setNarrativePhase(4)}
                className="action-button-reveal"
                style={styles.applicationWorkspaceEntranceButton}
              >
                ACCESS HILBERT OPERATOR MATRIX →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
