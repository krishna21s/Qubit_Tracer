// src/components/AdvancedBlochViewer.jsx
import React, { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AdvancedBlochSphereAdvanced from "./AdvancedBlochSphereAdvanced";
import useWindowSize from "../utils/useWindowSize";
import { gsap } from "gsap";

export default function AdvancedBlochViewer({ vectors = [], labels = [] }) {
  const count = Math.max(1, vectors.length);
  const layout = useMemo(() => {
    const spacing = 2.4;
    const start = -((count - 1) * spacing) / 2;
    return Array.from({ length: count }).map((_, i) => start + i * spacing);
  }, [count]);

  const cameraRef = useRef();
  const [insideIndex, setInsideIndex] = useState(null);
  const { width } = useWindowSize();
  const isMobile = width < 900;

  function enterInside(idx) {
    setInsideIndex(idx);
    const cam = cameraRef.current;
    if (!cam) return;
    const x = layout[idx];
    gsap.to(cam.position, { x: x, y: 0.1, z: 0.18, duration: 1.2, ease: "power2.inOut" });
    gsap.to(cam.rotation, { x: -0.2, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
  }

  function exitInside() {
    setInsideIndex(null);
    const cam = cameraRef.current;
    if (!cam) return;
    gsap.to(cam.position, { x: 0, y: 0, z: 3.5, duration: 1.0, ease: "power2.inOut" });
    gsap.to(cam.rotation, { x: 0, y: 0, z: 0, duration: 1.0, ease: "power2.inOut" });
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{
        position: "absolute", left: 12, top: 12, zIndex: 10, display: "flex", gap: 8
      }}>
        {insideIndex != null && (
          <button onClick={exitInside} style={{
            background: "rgba(8,12,16,0.8)", color: "#eaf6ff", border: "1px solid rgba(255,255,255,0.06)",
            padding: "6px 10px", borderRadius: 8, cursor: "pointer"
          }}>
            Exit Sphere
          </button>
        )}
      </div>

      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 50 }}
        // *** THE FIX IS HERE ***
        // This `gl` prop passes options directly to the WebGLRenderer.
        // `preserveDrawingBuffer: true` tells three.js to keep the image
        // on the canvas so html2canvas can capture it.
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ camera, gl, scene }) => {
          cameraRef.current = camera;
        }}
      >
        {/* set a subtle scene background so the silver sphere reads visually */}
        <color attach="background" args={["#061325"]} />

        <ambientLight intensity={0.75} />
        <directionalLight position={[6, 10, 8]} intensity={1.0} />
        <Environment preset="city" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.1} />        </EffectComposer>

        <group>
          {vectors.map((v, i) => (
            <group key={i} position={[layout[i], 0, 0]}>
              <AdvancedBlochSphereAdvanced
                vector={v}
                label={labels[i] ?? `q${i}`}
                inside={insideIndex === i}
                onEnterInside={() => enterInside(i)}
                isMobile={isMobile}
              />
            </group>
          ))}
        </group>

        <OrbitControls enablePan={!isMobile} enableRotate={true} enableZoom={!isMobile} />

        <Html position={[0, -1.5, 0]}>
          <div style={{
            position: "absolute", right: 12, bottom: 12, background: "rgba(255,255,255,0.02)",
            color: "#e6eef0", padding: 8, borderRadius: 8, fontSize: 12
          }}>
            Silver Bloch — drag to rotate • pinch to zoom
          </div>
        </Html>
      </Canvas>
    </div>
  );
}
