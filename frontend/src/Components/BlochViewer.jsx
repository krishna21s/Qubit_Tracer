// BlochViewer.jsx
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import BlochSphereR3F from "./BlochSphereR3F";

/**
 * BlochViewer
 * Props:
 *  - vectors: array of [x,y,z] for each qubit
 *  - labels: optional array of labels
 */
export default function BlochViewer({ vectors = [], labels = [] }) {
  const count = Math.max(1, vectors.length);

  // layout: put spheres horizontally, compute camera distances accordingly
  const cameraZ = 3.5;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 50 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={0.6} />
        <Suspense fallback={null}>
          {/* Soft studio environment for metallic/silver materials */}
          <Environment preset="studio" />

          {/* Place spheres in a row */}
          <group position={[-((count - 1) * 2) / 2, 0, 0]}>
            {vectors.map((v, i) => {
              const xOffset = i * 2; // spacing
              return (
                <group key={i} position={[xOffset, 0, 0]}>
                  <BlochSphereR3F vector={v} label={labels[i] ?? `q${i}`} index={i} />
                </group>
              );
            })}
          </group>

          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}
