// src/components/AdvancedBlochViewer.jsx
import React, { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import AdvancedBlochSphereAdvanced from "./AdvancedBlochSphereAdvanced";
import GlobalBlochEnvironment from "./GlobalBlochEnvironment";
import useWindowSize from "../utils/useWindowSize";
import { gsap } from "gsap";

export default function AdvancedBlochViewer({ vectors = [], labels = [] }) {
  const count = Math.max(1, vectors.length);

  // horizontal layout
  const layout = useMemo(() => {
    const spacing = 2.6;
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
    gsap.to(cam.position, { x, y: 0.1, z: 0.18, duration: 1.1, ease: "power2.inOut" });
    gsap.to(cam.rotation, { x: -0.18, y: 0, z: 0, duration: 1.1, ease: "power2.inOut" });
  }

  function exitInside() {
    setInsideIndex(null);
    const cam = cameraRef.current;
    if (!cam) return;
    gsap.to(cam.position, { x: 0, y: 0, z: 4.2, duration: 1.0, ease: "power2.inOut" });
    gsap.to(cam.rotation, { x: 0, y: 0, z: 0, duration: 1.0, ease: "power2.inOut" });
  }

  const envCenterX = insideIndex != null ? layout[insideIndex] : 0;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div style={{
        position: "absolute", left: 12, top: 12, zIndex: 10, display: "flex", gap: 8
      }}>
        {insideIndex != null && (
          <button onClick={exitInside} style={{
            background: "rgba(8,12,16,0.8)", color: "#eaf6ff", border: "1px solid rgba(255,255,255,0.06)",
            padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 600
          }}>
            Exit Sphere
          </button>
        )}
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <color attach="background" args={["#061325"]} />

        {/* Single shared environment */}
        <GlobalBlochEnvironment centerX={envCenterX} isMobile={isMobile} />

        <ambientLight intensity={0.65} />
        <directionalLight position={[6, 10, 8]} intensity={1.1} />
        <Environment preset="city" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.85} intensity={1.05} />
        </EffectComposer>

        <group>
          {vectors.map((v, i) => {
            const insideThis = insideIndex === i;
            const dim = insideIndex != null && !insideThis;
            // Show compact label outside; detailed only for inside or when no sphere is inside
            const showInspector = insideIndex == null ? true : insideThis;
            return (
              <group key={i} position={[layout[i], 0, 0]}>
                <AdvancedBlochSphereAdvanced
                  vector={v}
                  label={labels[i] ?? `q[${i}]`}
                  inside={insideThis}
                  onEnterInside={() => enterInside(i)}
                  isMobile={isMobile}
                  showEnvironment={false}
                  showInspector={showInspector}
                  compactLabel={insideIndex == null && !insideThis}
                  dim={dim}
                />
              </group>
            );
          })}
        </group>

        <OrbitControls
          enablePan={!isMobile}
          enableRotate={true}
          enableZoom={insideIndex == null && !isMobile}
          dampingFactor={0.08}
        />

        <Html position={[0, -1.8, 0]} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(6px)",
            color: "#e6eef0",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: 0.4
          }}>
            Bloch Viewer — drag to rotate • {isMobile ? "pinch" : "scroll"} to zoom
          </div>
        </Html>
      </Canvas>
    </div>
  );
}