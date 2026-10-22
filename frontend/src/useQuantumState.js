import { useState } from "react";
import { getBlochCoordinates } from "./quantumMath.js";
import {
  runSingleQubitCircuit,
  sampleMeasurements,
} from "./quantumCircuit.js";

const ZERO_STATE = {
  alpha: { re: 1, im: 0 },
  beta: { re: 0, im: 0 },
};

function stateWithBlochCoordinates(state) {
  const coordinates = getBlochCoordinates(state.alpha, state.beta);
  const theta = Math.acos(Math.max(-1, Math.min(1, coordinates.z)));
  let phi = Math.atan2(coordinates.y, coordinates.x);
  if (phi < 0) phi += 2 * Math.PI;

  return {
    state: {
      ...coordinates,
      alpha: { ...state.alpha },
      beta: { ...state.beta },
    },
    angles: {
      theta: Math.round((theta * 180) / Math.PI),
      phi: Math.round((phi * 180) / Math.PI),
    },
  };
}

/** React adapter for the pure, UI-independent single-qubit circuit engine. */
export default function useQuantumState() {
  const initial = stateWithBlochCoordinates({
    alpha: { re: 1 / Math.sqrt(2), im: 0 },
    beta: { re: 0, im: 1 / Math.sqrt(2) },
  });
  const [quantumAngles, setQuantumAngles] = useState(initial.angles);
  const [calculatedState, setCalculatedState] = useState(initial.state);
  const [measurementResult, setMeasurementResult] = useState(null);

  const commitState = (state) => {
    const next = stateWithBlochCoordinates(state);
    setQuantumAngles(next.angles);
    setCalculatedState(next.state);
    setMeasurementResult(null);
  };

  const handleSliderAngleChange = (angleType, value) => {
    const nextAngles = { ...quantumAngles, [angleType]: value };
    const theta = (nextAngles.theta * Math.PI) / 180;
    const phi = (nextAngles.phi * Math.PI) / 180;
    commitState({
      alpha: { re: Math.cos(theta / 2), im: 0 },
      beta: {
        re: Math.cos(phi) * Math.sin(theta / 2),
        im: Math.sin(phi) * Math.sin(theta / 2),
      },
    });
  };

  const handleAlphaInputChange = (newAlphaRe) => {
    const alphaRe = Math.max(0, Math.min(1, newAlphaRe));
    const betaIm = Math.sqrt(Math.max(0, 1 - alphaRe * alphaRe));
    commitState({
      alpha: { re: alphaRe, im: 0 },
      beta: { re: 0, im: betaIm },
    });
  };

  const handleInjectUnitaryGate = (gateType) => {
    if (gateType === "RESET") {
      commitState(ZERO_STATE);
      return;
    }
    commitState(runSingleQubitCircuit(calculatedState, [{ name: gateType }]));
  };

  const handleRunCircuit = (operations) => {
    commitState(runSingleQubitCircuit(ZERO_STATE, operations));
  };

  const handleMeasureShots = (shots = 100) => {
    const result = sampleMeasurements(calculatedState, shots);
    setMeasurementResult(result);
    return result;
  };

  return {
    quantumAngles,
    calculatedState,
    measurementResult,
    handleSliderAngleChange,
    handleInjectUnitaryGate,
    handleAlphaInputChange,
    handleRunCircuit,
    handleMeasureShots,
  };
}
