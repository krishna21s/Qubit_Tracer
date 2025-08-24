import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

/** Convert degrees to a Bloch vector */
function degToVec(thetaDeg, phiDeg) {
  const t = THREE.MathUtils.degToRad(thetaDeg);
  const p = THREE.MathUtils.degToRad(phiDeg);
  return new THREE.Vector3(
    Math.sin(t) * Math.cos(p),
    Math.sin(t) * Math.sin(p),
    Math.cos(t)
  );
}

/** Arrow from origin to v (glass sphere radius = 1) */
function Arrow({ v }) {
  const dir = v.clone().normalize();
  const len = v.length();

  // orient +Z to dir
  const q = useMemo(() => {
    const up = new THREE.Vector3(0, 0, 1);
    return new THREE.Quaternion().setFromUnitVectors(up, dir.length() ? dir : up);
  }, [dir.x, dir.y, dir.z]);

  return (
    <group quaternion={q}>
      {/* shaft */}
      <mesh position={[0, 0, len * 0.5 * 0.85]} scale={[1, 1, len * 0.85]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 16, 1, true]} />
        <meshStandardMaterial color="#09a8ff" metalness={0.5} roughness={0.22} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0, len * 0.95]}>
        <coneGeometry args={[0.06, 0.18, 24]} />
        <meshStandardMaterial emissive="#66d8ff" emissiveIntensity={1.2} color="#bfefff" />
      </mesh>
    </group>
  );
}

function SphereGrid({ r = 1 }) {
  const meridians = 8;
  const latitudes = 5;

  const lines = [];

  // longitudinal circles
  for (let i = 0; i < meridians; i++) {
    const a = (i / meridians) * Math.PI * 2;
    const pts = [];
    for (let t = 0; t <= Math.PI + 0.0001; t += Math.PI / 64) {
      pts.push([
        r * Math.sin(t) * Math.cos(a),
        r * Math.sin(t) * Math.sin(a),
        r * Math.cos(t),
      ]);
    }
    lines.push(<Line key={`m-${i}`} points={pts} color="#7fa4b8" lineWidth={1} transparent opacity={0.2} />);
  }

  // latitude circles
  for (let j = 1; j < latitudes; j++) {
    const lat = (j / latitudes) * Math.PI - Math.PI / 2;
    const pts = [];
    for (let a = 0; a <= Math.PI * 2 + 0.0001; a += Math.PI / 64) {
      pts.push([
        r * Math.cos(lat) * Math.cos(a),
        r * Math.cos(lat) * Math.sin(a),
        r * Math.sin(lat),
      ]);
    }
    lines.push(<Line key={`l-${j}`} points={pts} color="#7fa4b8" lineWidth={1} transparent opacity={0.2} />);
  }

  return <group>{lines}</group>;
}

export default function BlochPanel({
  // You can feed theta/phi from props or we’ll compute from result below
  theta = 0,
  phi = 0,
  result,     // { bloch?: { x,y,z } } OR any shape you use later
  height = 520
}) {
  // If backend result has a Bloch vector, prefer it.
  const fromResult = useMemo(() => {
    if (!result) return null;
    // try a few common shapes
    if (result.bloch && typeof result.bloch.x === "number") {
      const v = new THREE.Vector3(result.bloch.x, result.bloch.y, result.bloch.z);
      return v.clampLength(0, 1);
    }
    if (Array.isArray(result.vector) && result.vector.length === 3) {
      const v = new THREE.Vector3(result.vector[0], result.vector[1], result.vector[2]);
      return v.clampLength(0, 1);
    }
    return null;
  }, [result]);

  const v = useMemo(() => fromResult ?? degToVec(theta, phi), [fromResult, theta, phi]);
  const r = 1;

  // probabilities in z-basis
  const p0 = ((1 + v.z) / 2) * 100;
  const p1 = 100 - p0;
  const bars = [
    { name: '|0⟩', p: p0 },
    { name: '|1⟩', p: p1 },
  ];

  return (
    <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
      {/* 3D */}
      <div style={{ minHeight: height }}>
        <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} dpr={[1, 2]}>
          {/* background */}
          <color attach="background" args={["#0b1117"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 3, 3]} intensity={0.7} />
          <directionalLight position={[-3, -2, 2]} intensity={0.4} />

          {/* glass sphere */}
          <mesh>
            <sphereGeometry args={[r, 72, 72]} />
            <meshPhysicalMaterial
              color="#7dc7ff"
              transparent
              opacity={0.22}
              transmission={0.92}
              roughness={0.08}
              metalness={0.1}
              clearcoat={0.5}
              clearcoatRoughness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* inner highlight */}
          <mesh scale={[1.001, 1.001, 1.001]}>
            <sphereGeometry args={[r, 48, 48]} />
            <meshBasicMaterial color="#e6f4ff" transparent opacity={0.05} side={THREE.DoubleSide} />
          </mesh>

          {/* axes */}
          {[
            { s: [-r, 0, 0], e: [r, 0, 0], c: "#ff6666", label: "X" },
            { s: [0, -r, 0], e: [0, r, 0], c: "#68d39b", label: "Y" },
            { s: [0, 0, -r], e: [0, 0, r], c: "#6aa8ff", label: "Z" },
          ].map((ax, i) => (
            <group key={i}>
              <Line points={[ax.s, ax.e]} color={ax.c} lineWidth={2} />
              <Html position={ax.e} center>
                <div style={{ background: "rgba(255,255,255,0.9)", padding: "2px 6px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                  {ax.label}
                </div>
              </Html>
            </group>
          ))}

          {/* grid */}
          <SphereGrid r={r} />

          {/* state vector + tip */}
          <Arrow v={v} />
          <mesh position={[v.x, v.y, v.z]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial emissive="#66d8ff" emissiveIntensity={1.0} color="#eaffff" />
          </mesh>

          {/* readout bubble */}
          <Html position={[1.35, 1.35, 0]} center>
            <div style={{
              background: "rgba(255,255,255,0.96)", padding: "8px 10px", borderRadius: 8,
              color: "#07202a", fontSize: 12, minWidth: 150, boxShadow: "0 8px 24px rgba(2,8,15,0.08)"
            }}>
              <div style={{ fontWeight: 700 }}>Bloch State</div>
              <div style={{ marginTop: 6 }}>x: <b>{v.x.toFixed(2)}</b></div>
              <div>y: <b>{v.y.toFixed(2)}</b></div>
              <div>z: <b>{v.z.toFixed(2)}</b></div>
            </div>
          </Html>

          <OrbitControls enableDamping dampingFactor={0.1} minDistance={1.6} maxDistance={6} />
        </Canvas>
      </div>

      {/* Right mini-panels (recharts + sliders) */}
      <div style={{ display: "grid", gap: 12 }}>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ fontSize: 13, color: "#9fb4c8", marginBottom: 6 }}>Probability (z-basis)</div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="p" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sliders only influence the preview when no result vector is provided */}
        {!fromResult && (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 13, color: "#9fb4c8" }}>Manual preview (θ, φ)</div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: "#9fb4c8" }}>θ (Theta): {theta}°</label>
              <input type="range" min={0} max={180} defaultValue={theta} onChange={(e) => {
                // letting parent control is optional; for now reload via URL hash for quick testing
                window.location.hash = `theta=${e.target.value}&phi=${phi}`;
                window.location.reload();
              }} style={{ width: "100%" }} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: "#9fb4c8" }}>φ (Phi): {phi}°</label>
              <input type="range" min={0} max={360} defaultValue={phi} onChange={(e) => {
                window.location.hash = `theta=${theta}&phi=${e.target.value}`;
                window.location.reload();
              }} style={{ width: "100%" }} />
            </div>
            <div style={{ fontSize: 11, color: "#9fb4c8", marginTop: 8 }}>
              (These sliders are just for Phase-1 preview. When your backend returns a Bloch vector, it overrides them.)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}