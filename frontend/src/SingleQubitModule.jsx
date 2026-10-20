import React from "react";
import ConceptHero from "./components/single-qubit/ConceptHero";
import AmplitudeSandbox from "./components/single-qubit/AmplitudeSandbox";
import ParameterSliders from "./components/single-qubit/ParameterSliders";
import TelemetryTracer from "./components/single-qubit/TelemetryTracer";
import QiskitConsole from "./components/single-qubit/QiskitConsole"; // New Import Node Link

export default function SingleQubitModule({
  stateVariables,
  onAngleSliderAdjustment,
  onAlphaInputChange,
}) {
  const { theta, phi, x, y, z, alpha, beta } = stateVariables;

  const probZero = Math.pow(alpha.re, 2) * 100;
  const probOne = (Math.pow(beta.re, 2) + Math.pow(beta.im, 2)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      <ConceptHero />

      <AmplitudeSandbox
        alpha={alpha}
        beta={beta}
        onAlphaInputChange={onAlphaInputChange}
      />

      <ParameterSliders
        theta={theta}
        phi={phi}
        onAngleSliderAdjustment={onAngleSliderAdjustment}
      />

      <TelemetryTracer
        theta={theta}
        phi={phi}
        x={x}
        y={y}
        z={z}
        alpha={alpha}
        beta={beta}
        probZero={probZero}
        probOne={probOne}
      />

      {/* Mount Qiskit Console dynamically passing active degrees to code blocks */}
      <QiskitConsole theta={theta} phi={phi} />
    </div>
  );
}
