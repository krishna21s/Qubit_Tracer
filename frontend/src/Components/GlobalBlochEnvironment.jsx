// src/components/GlobalBlochEnvironment.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Single shared environment: clouds + snow (previously duplicated per sphere)
 * Props:
 *  - centerX: x-position to center around (moves when entering a sphere)
 *  - isMobile: boolean
 */
const CLOUD_LAYERS = 0;

export default function GlobalBlochEnvironment({ centerX = 0, isMobile = false }) {
  const snowRef = useRef();
  const cloudRefs = useRef([]);

  // Snow init
  useEffect(() => {
    const COUNT = isMobile ? 300 : 900;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 10 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      speeds[i] = 0.4 + Math.random() * 0.9;
    }
    snowRef.current = { positions, speeds, count: COUNT };
    return () => { snowRef.current = null; };
  }, [isMobile]);

  useFrame(() => {
    if (snowRef.current) {
      const { positions, speeds, count } = snowRef.current;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= speeds[i] * (isMobile ? 0.006 : 0.012);
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
          positions[i * 3 + 1] = Math.random() * 10 + 4;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
      }
    }
    cloudRefs.current.forEach((m, i) => {
      if (!m) return;
      const s = (i % 2 ? -1 : 1) * 0.0009;
      m.rotation.y += s;
    });
  });

  return (
    <group position={[centerX, 0, 0]}>
      {/* Subtle background hull */}
      <mesh scale={[60, 60, 60]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#061325" side={THREE.BackSide} />
      </mesh>

      {/* Clouds (shared) */}
      {new Array(CLOUD_LAYERS).fill(0).map((_, i) => {
        const s = 14 + i * 4;
        return (
          <mesh
            key={i}
            scale={[s, s, s]}
            ref={el => cloudRefs.current[i] = el}
          >
            <icosahedronGeometry args={[1, 4]} />
            <meshPhysicalMaterial
              color="#0b5f9d"
              transparent
              opacity={0.18 + i * 0.04}
              transmission={0.8}
              roughness={0.15}
              metalness={0.1}
              clearcoat={0.4}
              clearcoatRoughness={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Snow */}
      {snowRef.current && (
        <points>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const { positions } = snowRef.current;
            geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
          }} />
          <pointsMaterial size={isMobile ? 0.025 : 0.04} color="#ffffff" transparent opacity={0.85} />
        </points>
      )}
    </group>
  );
}