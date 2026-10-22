import { useState } from 'react';
import { getBlochCoordinates } from './quantumMath.js';

/**
 * Custom Computational State Hook for Isolated Single-Qubit Mechanics (v2.0)
 * Path: /frontend/src/useQuantumState.js
 */
export default function useQuantumState() {
  const [quantumAngles, setQuantumAngles] = useState({ theta: 90, phi: 90 });
  const [calculatedState, setCalculatedState] = useState({
    x: 0.0, y: 1.0, z: 0.0,
    alpha: { re: 0.7071, im: 0.0 },
    beta: { re: 0.0, im: 0.7071 }
  });

  const handleSliderAngleChange = (angleType, value) => {
    const nextAngles = { ...quantumAngles, [angleType]: value };
    setQuantumAngles(nextAngles);

    const radTheta = (nextAngles.theta * Math.PI) / 180;
    const radPhi = (nextAngles.phi * Math.PI) / 180;

    const computedX = Math.sin(radTheta) * Math.cos(radPhi);
    const computedY = Math.sin(radTheta) * Math.sin(radPhi);
    const computedZ = Math.cos(radTheta);

    const alphaRe = Math.cos(radTheta / 2);
    const betaRe = Math.cos(radPhi) * Math.sin(radTheta / 2);
    const betaIm = Math.sin(radPhi) * Math.sin(radTheta / 2);

    setCalculatedState({
      x: computedX, y: computedY, z: computedZ,
      alpha: { re: alphaRe, im: 0.0 },
      beta: { re: betaRe, im: betaIm }
    });
  };

  // Direct Amplitude Controller: Computes beta and maps vectors backward into angles safely
  const handleAlphaInputChange = (newAlphaRe) => {
    // Enforce boundary caps between 0.0 and 1.0
    const aRe = Math.max(0, Math.min(1, newAlphaRe));
    const bIm = Math.sqrt(1 - aRe * aRe);

    const nextAlpha = { re: aRe, im: 0.0 };
    const nextBeta = { re: 0.0, im: bIm };

    // Cartesian mapping: x = 2*Re(a_conj * b), y = 2*Im(a_conj * b), z = |a|^2 - |b|^2
    const computedX = 0.0; // Purely real alpha * purely imaginary beta results in 0 real part
    const computedY = 2 * aRe * bIm;
    const computedZ = (aRe * aRe) - (bIm * bIm);

    // Convert spatial vectors back to polar angles to sync the playground sliders
    const nextTheta = Math.round((Math.acos(computedZ) * 180) / Math.PI);
    let nextPhi = Math.round((Math.atan2(computedY, computedX) * 180) / Math.PI);
    if (nextPhi < 0) nextPhi += 360;

    setQuantumAngles({ theta: isNaN(nextTheta) ? 0 : nextTheta, phi: isNaN(nextPhi) ? 0 : nextPhi });
    setCalculatedState({ x: computedX, y: computedY, z: computedZ, alpha: nextAlpha, beta: nextBeta });
  };

  const handleInjectUnitaryGate = (gateType) => {
    let a = { ...calculatedState.alpha }, b = { ...calculatedState.beta };
    let nextA = { re: 1, im: 0 }, nextB = { re: 0, im: 0 };

    if (gateType === 'H') {
      const root2 = Math.sqrt(2);
      nextA = { re: (a.re + b.re) / root2, im: (a.im + b.im) / root2 };
      nextB = { re: (a.re - b.re) / root2, im: (a.im - b.im) / root2 };
    } else if (gateType === 'X') {
      nextA = { ...b }; nextB = { ...a };
    } else if (gateType === 'Z') {
      nextA = { ...a }; nextB = { re: -b.re, im: -b.im };
    } else if (gateType === 'RESET') {
      nextA = { re: 1.0, im: 0.0 }; nextB = { re: 0.0, im: 0.0 };
    }

    const { x: xCoord, y: yCoord, z: zCoord } = getBlochCoordinates(nextA, nextB);

    const nextTheta = Math.round((Math.acos(zCoord) * 180) / Math.PI);
    let nextPhi = Math.round((Math.atan2(yCoord, xCoord) * 180) / Math.PI);
    if (nextPhi < 0) nextPhi += 360;

    setQuantumAngles({ theta: isNaN(nextTheta) ? 0 : nextTheta, phi: isNaN(nextPhi) ? 0 : nextPhi });
    setCalculatedState({ x: xCoord, y: yCoord, z: zCoord, alpha: nextA, beta: nextB });
  };

  return {
    quantumAngles,
    calculatedState,
    handleSliderAngleChange,
    handleInjectUnitaryGate,
    handleAlphaInputChange
  };
}
