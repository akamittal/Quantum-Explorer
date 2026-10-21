import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";

// Explicit variables matching our optimized 1.6 unit sphere scale constraints
const originPos = new THREE.Vector3(0.0, 0.0, 0.0);
const lightPos = new THREE.Vector3(4.0, 4.0, 4.0);
const cameraPositionArray = new Array(3.0, 3.0, 3.0);
const sphereMeshArgs = new Array(1.6, 32, 32); // Scaled down from 2.0 to 1.6

function AmmeterVectorArrow({ x, y, z }) {
  const arrowRef = useRef();
  const currentDirectionRef = useRef(new THREE.Vector3(0, 0, 1));

  useFrame(() => {
    if (!arrowRef.current) return;
    const targetDirection = new THREE.Vector3(x, y, z).normalize();

    const currentDirection = currentDirectionRef.current;
    const dot = THREE.MathUtils.clamp(currentDirection.dot(targetDirection), -1, 1);

    // Linear interpolation collapses to a zero vector for exactly antipodal
    // directions (for example |0> to |1>). Rotate around a stable perpendicular
    // axis until the directions are no longer opposite, then resume smoothing.
    if (dot < -0.9995) {
      const axis = new THREE.Vector3().crossVectors(currentDirection, new THREE.Vector3(1, 0, 0));
      if (axis.lengthSq() < 1e-8) axis.crossVectors(currentDirection, new THREE.Vector3(0, 1, 0));
      axis.normalize();
      currentDirection.applyAxisAngle(axis, 0.08).normalize();
    } else {
      currentDirection.lerp(targetDirection, 0.08).normalize();
    }

    arrowRef.current.setDirection(currentDirectionRef.current);
    arrowRef.current.setLength(1.6); // Match the new 1.6 unit radius constraint
  });

  return (
    <primitive
      ref={arrowRef}
      object={
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 0, 1),
          originPos,
          1.6,
          "#06b6d4",
          0.28,
          0.12,
        )
      }
    />
  );
}

export default function BlochSphereView({ coordinates, angles }) {
  // Graceful fallback defaults to protect initial load steps from empty metrics crashes
  const posX = coordinates?.x ?? 0.0;
  const posY = coordinates?.y ?? 1.0;
  const posZ = coordinates?.z ?? 0.0;
  const angTheta = angles?.theta ?? 90;
  const angPhi = angles?.phi ?? 90;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#030712",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <Suspense
          fallback={
            <div
              style={{
                color: "#10b981",
                fontFamily: "monospace",
                padding: "2rem",
              }}
            >
              CALIBRATING HILBERT WORKSPACE...
            </div>
          }
        >
          <Canvas camera={{ position: cameraPositionArray, fov: 45 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={lightPos} intensity={1.5} />

            {/* Scaled-down wireframe unit sphere mesh */}
            <mesh position={originPos}>
              <sphereGeometry args={sphereMeshArgs} />
              <meshBasicMaterial
                color="#10b981"
                wireframe
                transparent
                opacity={0.05}
              />
            </mesh>

            <gridHelper
              args={[3.2, 16, "#1f2937", "#111827"]}
              position={originPos}
            />

            {/* Basis Reference System Lines */}
            <Line
              points={[
                [0, -1.8, 0],
                [0, 1.8, 0],
              ]}
              color="#ef4444"
              lineWidth={1.5}
            />
            <Line
              points={[
                [-1.8, 0, 0],
                [1.8, 0, 0],
              ]}
              color="#10b981"
              lineWidth={1.5}
            />
            <Line
              points={[
                [0, 0, -1.8],
                [0, 0, 1.8],
              ]}
              color="#3b82f6"
              lineWidth={1.5}
            />

            {/* Spatial Basis Label Tags */}
            <Html position={[0, 1.9, 0]} center>
              <span style={labelStyle}>|0⟩ (Z+)</span>
            </Html>
            <Html position={[0, -1.9, 0]} center>
              <span style={labelStyle}>|1⟩ (Z-)</span>
            </Html>
            <Html position={[1.9, 0, 0]} center>
              <span style={labelStyle}>|+⟩ (X+)</span>
            </Html>
            <Html position={[0, 0, 1.9]} center>
              <span style={labelStyle}>|i+⟩ (Y+)</span>
            </Html>

            {/* LIVE DYNAMIC TRACKING HUD PINNED DIRECTLY TO VECTOR ARROW TIP COORD */}
            <Html position={[posX * 1.6, posY * 1.6, posZ * 1.6]} center>
              <div style={vectorHUDStyle}>
                <div
                  style={{
                    color: "#10b981",
                    borderBottom: "1px solid rgba(6,182,212,0.2)",
                    paddingBottom: "2px",
                    marginBottom: "2px",
                  }}
                >
                  Ψ COMPONENT
                </div>
                <div>X: {posX.toFixed(3)}</div>
                <div>Y: {posY.toFixed(3)}</div>
                <div>Z: {posZ.toFixed(3)}</div>
                <div
                  style={{
                    color: "#06b6d4",
                    marginTop: "2px",
                    paddingTop: "2px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  θ: {angTheta}° | φ: {angPhi}°
                </div>
              </div>
            </Html>

            <AmmeterVectorArrow x={posX} y={posY} z={posZ} />

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              maxDistance={5}
              minDistance={2}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}

const labelStyle = {
  color: "#9ca3af",
  fontFamily: "monospace",
  fontSize: "0.65rem",
  backgroundColor: "#0b0f19",
  padding: "2px 5px",
  borderRadius: "2px",
  border: "1px solid rgba(255,255,255,0.03)",
  whiteSpace: "nowrap",
};

const vectorHUDStyle = {
  backgroundColor: "rgba(11, 15, 25, 0.85)",
  backdropFilter: "blur(8px)",
  border: "1px solid #06b6d4",
  padding: "6px 10px",
  borderRadius: "4px",
  fontFamily: "monospace",
  fontSize: "0.65rem",
  color: "#f3f4f6",
  boxShadow: "0 0 15px rgba(6, 182, 212, 0.25)",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  userSelect: "none",
};
