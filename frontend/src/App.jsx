import React, { useState, useEffect, useRef } from "react";
import QuantumParticleBackground from "./QuantumParticleBackground";
import QuantumWorkspaceLayout from "./QuantumWorkspaceLayout";
import SingleQubitModule from "./SingleQubitModule";
import BlochSphereView from "./BlochSphereView";
import IntroHUD from "./IntroHUD";
import MantraSequence from "./MantraSequence";
import NarrativeConsole from "./NarrativeConsole";
import useQuantumState from "./useQuantumState";
import { styles } from "./workspaceStyles";

export default function App() {
  const [narrativePhase, setNarrativePhase] = useState(0);
  const [activeLines, setActiveLines] = useState({
    line1: false,
    line2: false,
    line3: false,
    meaning: false,
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModulePage, setActiveModulePage] = useState("1.1");
  const audioNodeRef = useRef(null);

  const quantum = useQuantumState();

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

  if (narrativePhase === 4) {
    return (
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          backgroundColor: "#030712",
        }}
      >
        {/* INDEX MENU LIST SLIDE DRAWER OVERLAY */}
        {isSidebarOpen && (
          <div
            style={{
              position: "fixed",
              top: "3.5rem",
              left: 0,
              width: "22rem",
              height: "calc(100vh - 3.5rem)",
              backgroundColor: "#0b0f19",
              borderRight: "1px solid rgba(6,182,212,0.2)",
              zIndex: 90,
              padding: "2.5rem 2rem",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <span
              style={{
                color: "#6b7280",
                fontSize: "0.7rem",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
              }}
            >
              🏛️ CORE MAP REPOSITORY
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  color: "#10b981",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                [x] M1.1: Single Qubit State Space
              </button>
            </div>
          </div>
        )}
        <QuantumWorkspaceLayout
          menuOpenText={isSidebarOpen ? "CLOSE INDEX ✕" : "MENU INDEX ☰"}
          onToggleMenu={() => setIsSidebarOpen(!isSidebarOpen)}
          LeftContent={
            <SingleQubitModule
              stateVariables={{
                theta: quantum.quantumAngles.theta,
                phi: quantum.quantumAngles.phi,
                x: quantum.calculatedState.x,
                y: quantum.calculatedState.y,
                z: quantum.calculatedState.z,
                alpha: quantum.calculatedState.alpha,
                beta: quantum.calculatedState.beta,
              }}
              onAngleSliderAdjustment={quantum.handleSliderAngleChange}
              onAlphaInputChange={quantum.handleAlphaInputChange} // New input route hook mapped cleanly
            />
          }
          RightContent={
            <BlochSphereView
              coordinates={{
                x: quantum.calculatedState.x,
                y: quantum.calculatedState.y,
                z: quantum.calculatedState.z,
              }}
              angles={{
                theta: quantum.quantumAngles.theta,
                phi: quantum.quantumAngles.phi,
              }} // Angles successfully mapped downstream
            />
          }
        />
      </div>
    );
  }

  return (
    <div style={styles.deepSpaceCanvas}>
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
        <NarrativeConsole
          onSequenceComplete={() => setNarrativePhase(4)}
          styles={styles}
        />
      )}
    </div>
  );
}
