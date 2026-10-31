import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import QuantumParticleBackground from "./QuantumParticleBackground";
import QuantumWorkspaceLayout from "./QuantumWorkspaceLayout";
import SingleQubitModule from "./SingleQubitModule";
import MultiQubitModule from "./MultiQubitModule";
import DeutschAlgorithmModule from "./DeutschAlgorithmModule";
const DeutschJozsaModule = lazy(() => import("./DeutschJozsaModule"));
const BernsteinVaziraniModule = lazy(() => import("./BernsteinVaziraniModule"));
const MultiQubitPhaseModule = lazy(() => import("./MultiQubitPhaseModule"));
const EntanglementModule = lazy(() => import("./EntanglementModule"));
const QuantumFourierTransformModule = lazy(() => import("./QuantumFourierTransformModule"));
const QuantumPhaseEstimationModule = lazy(() => import("./QuantumPhaseEstimationModule"));
const BlochSphereView = lazy(() => import("./BlochSphereView"));
import IntroHUD from "./IntroHUD";
import MantraSequence from "./MantraSequence";
import NarrativeConsole from "./NarrativeConsole";
import useQuantumState from "./useQuantumState";
import { styles } from "./workspaceStyles";
import AIAssistant from "./AIAssistant";

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

  if (narrativePhase === 4 && activeModulePage === "qpe") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading Quantum Phase Estimation lesson…</div>}><QuantumPhaseEstimationModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "qft") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading Quantum Fourier Transform studio…</div>}><QuantumFourierTransformModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "1.4") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading entanglement laboratory…</div>}><EntanglementModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "1.3") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading matrix and phase studio…</div>}><MultiQubitPhaseModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "2.3") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading Bernstein–Vazirani lesson…</div>}><BernsteinVaziraniModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "2.2") {
    return <Suspense fallback={<div role="status" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading Deutsch–Jozsa lesson…</div>}><DeutschJozsaModule onNavigate={(page) => setActiveModulePage(page)} /></Suspense>;
  }

  if (narrativePhase === 4 && activeModulePage === "3.1") {
    return <DeutschAlgorithmModule onNavigate={(page) => setActiveModulePage(page)} />;
  }

  if (narrativePhase === 4 && activeModulePage === "2.1") {
    return <MultiQubitModule onNavigate={(page) => setActiveModulePage(page)} />;
  }

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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                onClick={() => { setActiveModulePage("1.1"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "1.1" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "1.1" ? "[x]" : "[ ]"} M1.1: Single Qubit State Space
              </button>
              <button
                onClick={() => { setActiveModulePage("2.1"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                [ ] M2.1: Multi-Qubit Systems
              </button>
              <button
                onClick={() => { setActiveModulePage("1.3"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "1.3" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "1.3" ? "[x]" : "[ ]"} M1.3: Matrix Operators & Phase
              </button>
              <button
                onClick={() => { setActiveModulePage("1.4"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "1.4" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "1.4" ? "[x]" : "[ ]"} M1.4: Quantum Entanglement Space
              </button>
              <button
                onClick={() => { setActiveModulePage("2.3"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "2.3" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "2.3" ? "[x]" : "[ ]"} M2.3: Bernstein–Vazirani Algorithm
              </button>
              <button
                onClick={() => { setActiveModulePage("3.1"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "3.1" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "3.1" ? "[x]" : "[ ]"} M2.1: Deutsch's Algorithm
              </button>
              <button
                onClick={() => { setActiveModulePage("qft"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "qft" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "qft" ? "[x]" : "[ ]"} M3.1: Quantum Fourier Transform
              </button>
              <button
                onClick={() => { setActiveModulePage("qpe"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "qpe" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "qpe" ? "[x]" : "[ ]"} M3.2: Quantum Phase Estimation
              </button>
              <button
                onClick={() => { setActiveModulePage("2.2"); setIsSidebarOpen(false); }}
                style={{ textAlign: "left", background: "transparent", border: "none", color: activeModulePage === "2.2" ? "#10b981" : "#9ca3af", fontFamily: "monospace", cursor: "pointer", fontSize: "0.875rem" }}
              >
                {activeModulePage === "2.2" ? "[x]" : "[ ]"} M2.2: Deutsch–Jozsa Algorithm
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
              onAlphaInputChange={quantum.handleAlphaInputChange}
              onGateApply={quantum.handleInjectUnitaryGate}
              onCircuitRun={quantum.handleRunCircuit}
              onMeasureShots={quantum.handleMeasureShots}
              measurementResult={quantum.measurementResult}
            />
          }
          RightContent={
            <Suspense fallback={<div role="status" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#94a3b8", background: "#030712" }}>Loading Bloch sphere…</div>}>
            <BlochSphereView
              coordinates={{
                x: quantum.calculatedState.x,
                y: quantum.calculatedState.y,
                z: quantum.calculatedState.z,
              }}
              angles={{
                theta: quantum.quantumAngles.theta,
                phi: quantum.quantumAngles.phi,
              }}
            />
            </Suspense>
          }
        />
        <AIAssistant
          moduleTitle="Single-Qubit Studio"
          lessonContext="Single-qubit states, complex amplitudes, Bloch sphere angles, unitary gates, circuit composition and measurement."
          simulatorContext={{
            theta: quantum.quantumAngles.theta,
            phi: quantum.quantumAngles.phi,
            alpha: quantum.calculatedState.alpha,
            beta: quantum.calculatedState.beta,
            blochVector: { x: quantum.calculatedState.x, y: quantum.calculatedState.y, z: quantum.calculatedState.z },
            measurementResult: quantum.measurementResult
          }}
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
