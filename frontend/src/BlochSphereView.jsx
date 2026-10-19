/**
 * Production-Grade 3D Bloch Sphere Graphics Engine (Three.js/R3F)
 * Path: /frontend/src/BlochSphereView.jsx
 */
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";

// An internal sub-component to calculate and animate vector rotations
function StateVectorArrow({ x, y, z }) {
  const arrowRef = useRef();

  useFrame(() => {
    if (!arrowRef.current) return;
    // Target state vector geometry mapping
    const targetVector = new THREE.Vector3(x, y, z).normalize();

    // Asymptotically ease the vector toward target coordinates for smooth transitions
    arrowRef.current.setDirection(targetVector);
    arrowRef.current.setLength(2.2);
  });

  return (
    <primitive
      ref={arrowRef}
      object={
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0), // Base default direction
          new THREE.Vector3(0, 0, 0), // Anchored origin
          2.2,
          "#06b6d4", // Electric Cyan state line accent
          0.4,
          0.2,
        )
      }
    />
  );
}

export default function BlochSphereView({ coordinates }) {
  const { x, y, z } = coordinates;

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#030712" }}>
      <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />

        {/* 1. Main Wireframe Bloch Sphere Surface */}
        <mesh>
          <sphereGeometry args={[2, 32, 32]} />
          <meshBasicMaterial
            color="rgba(16, 185, 129, 0.12)" // Translucent Quantum Emerald Tint
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>

        {/* 2. Main Geometric Equatorial and Polar Rings */}
        <gridHelper args={[4, 20, "#111827", "#1f2937"]} position={[0, 0, 0]} />

        {/* 3. Coordinate Reference System Axes Lines (X, Y, Z) */}
        {/* Z-Axis (Vertical Quantum Basis Axis |0> / |1>) */}
        <Line
          points={[
            [0, -2.5, 0],
            [0, 2.5, 0],
          ]}
          color="#ef4444"
          lineWidth={1.5}
        />
        {/* X-Axis */}
        <Line
          points={[
            [-2.5, 0, 0],
            [2.5, 0, 0],
          ]}
          color="#10b981"
          lineWidth={1}
        />
        {/* Y-Axis */}
        <Line
          points={[
            [0, 0, -2.5],
            [0, 0, 2.5],
          ]}
          color="#3b82f6"
          lineWidth={1}
        />

        {/* 4. The Live Quantum State Vector Pointer Arrow */}
        <StateVectorArrow x={x} y={y} z={z} />

        {/* High-end spatial viewport configuration controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxDistance={8}
          minDistance={3}
        />
      </Canvas>
    </div>
  );
}
