import React, { useMemo, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { generateMolecularStructure, calculateBondAngles } from "./molecularGeometry";
import { CPK_COLORS, VAN_DER_WAALS_RADII } from "./chemistryData";

const VISUAL_SPACING = 3.2;
const ATOM_RADIUS_SCALE = 0.18;

function Atom({ position, color, symbol, radius, hybridization, showHybridization }) {
  const [hovered, setHovered] = useState(false);
  const r = radius * ATOM_RADIUS_SCALE;
  
  return (
    <group position={position}>
      <mesh 
        castShadow 
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15} 
          roughness={0.4} 
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.08}
        />
      </mesh>
      <Html distanceFactor={8} position={[0, r * 1.6, 0]} style={{ pointerEvents: "none", color: "var(--qt-text)", userSelect: "none" }}>
        <div style={{ fontSize: 10, fontWeight: 800, textShadow: "0 2px 4px rgba(0,0,0,0.9)", letterSpacing: "0.2px" }}>
          {symbol}
          {(showHybridization || hovered) && hybridization && (
            <div style={{ fontSize: 8.5, opacity: 0.9, marginTop: 1, color: "#90CAF9" }}>
              {hybridization}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function Bond({ start, end, color, order, lengthAngstrom, showLength }) {
  const [hovered, setHovered] = useState(false);
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  const length = Math.sqrt(
    (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2 + (end[2] - start[2]) ** 2
  );
  const displayLen = typeof lengthAngstrom === "number" && Number.isFinite(lengthAngstrom) ? lengthAngstrom : length;
  
  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Line points={points} color={color} lineWidth={order === 2 ? 3 : order === 3 ? 4 : 2} />
      {(showLength || hovered) && (
        <Html position={[(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2]} distanceFactor={9}>
          <div style={{ fontSize: 8, color: "#90CAF9", fontWeight: 800, background: "rgba(10,18,28,0.9)", padding: "2px 5px", borderRadius: 4, border: "1px solid rgba(144,202,249,0.2)" }}>
            {displayLen.toFixed(2)} Å
          </div>
        </Html>
      )}
    </group>
  );
}

function AngleArc({ centerPos, angle }) {
  return (
    <Html position={centerPos} distanceFactor={9}>
      <div style={{ fontSize: 8.5, color: "#FFD54F", fontWeight: 800, background: "rgba(10,18,28,0.9)", padding: "2px 5px", borderRadius: 4, border: "1px solid rgba(255,213,79,0.2)", whiteSpace: "nowrap" }}>
        ∠ {angle}°
      </div>
    </Html>
  );
}

export default function Composition3DView({ selected, ratios }) {
  const [showAngles, setShowAngles] = useState(false);
  const [showLengths, setShowLengths] = useState(false);
  const [showHybridization, setShowHybridization] = useState(false);

  const structure = useMemo(() => {
    if (!selected.length) return null;
    return generateMolecularStructure(selected, ratios);
  }, [selected, ratios]);

  const visualCenter = useMemo(() => {
    if (!structure?.atoms?.length) return [0, 0, 0];
    const { atoms } = structure;
    let sx = 0;
    let sy = 0;
    let sz = 0;
    for (const atom of atoms) {
      sx += atom.x;
      sy += atom.y;
      sz += atom.z;
    }
    const n = atoms.length || 1;
    return [(sx / n) * VISUAL_SPACING, (sy / n) * VISUAL_SPACING, (sz / n) * VISUAL_SPACING];
  }, [structure]);

  const dipoleArrow = useMemo(() => {
    if (!structure?.atoms?.length) return null;
    if (structure.polarity !== "Polar" || structure.atoms.length > 6) return null;
    return new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(visualCenter[0], visualCenter[1] - 1.1 * VISUAL_SPACING, visualCenter[2]),
      1.6 * VISUAL_SPACING,
      "#FF6B9D",
      0.35 * VISUAL_SPACING,
      0.22 * VISUAL_SPACING
    );
  }, [structure, visualCenter]);

  const angles = useMemo(() => {
    if (!structure || !showAngles) return [];
    return calculateBondAngles(structure.atoms, structure.bonds);
  }, [structure, showAngles]);

  if (!structure || !structure.atoms.length) {
    return (
      <BoxWrapper>
        <EmptyState />
      </BoxWrapper>
    );
  }

  const { atoms, bonds, geometry, molecularWeight, polarity } = structure;

  return (
    <BoxWrapper>
      <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }} style={{ borderRadius: 12 }}>
        <color attach="background" args={["#0a1219"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 6]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
        <spotLight position={[-4, 6, -2]} intensity={0.5} angle={0.4} penumbra={0.5} />
        
        <Suspense fallback={null}>
          {atoms.map((atom, idx) => {
            const cpkColor = CPK_COLORS[atom.symbol] || "#7fd0ff";
            const vdwRadius = VAN_DER_WAALS_RADII[atom.symbol] || 1.5;
            return (
              <Atom
                key={`atom-${idx}`}
                position={[atom.x * VISUAL_SPACING, atom.y * VISUAL_SPACING, atom.z * VISUAL_SPACING]}
                color={cpkColor}
                symbol={atom.symbol}
                radius={vdwRadius}
                hybridization={atom.hybridization}
                showHybridization={showHybridization}
              />
            );
          })}
          
          {bonds.map((bond, idx) => {
            const a1 = atoms[bond.from];
            const a2 = atoms[bond.to];
            const c1 = CPK_COLORS[a1.symbol] || "#888";
            const c2 = CPK_COLORS[a2.symbol] || "#888";
            const avgColor = `#${Math.floor((parseInt(c1.slice(1), 16) + parseInt(c2.slice(1), 16)) / 2).toString(16).padStart(6, "0")}`;
            
            return (
              <Bond
                key={`bond-${idx}`}
                start={[a1.x * VISUAL_SPACING, a1.y * VISUAL_SPACING, a1.z * VISUAL_SPACING]}
                end={[a2.x * VISUAL_SPACING, a2.y * VISUAL_SPACING, a2.z * VISUAL_SPACING]}
                color={avgColor}
                order={bond.order}
                lengthAngstrom={bond.length}
                showLength={showLengths}
              />
            );
          })}
          
          {angles.map((angleData, idx) => {
            const center = atoms[angleData.center];
            return (
              <AngleArc
                key={`angle-${idx}`}
                centerPos={[center.x * VISUAL_SPACING, center.y * VISUAL_SPACING + 0.4, center.z * VISUAL_SPACING]}
                angle={angleData.angle}
              />
            );
          })}
          
          {dipoleArrow && <primitive object={dipoleArrow} />}
        </Suspense>
        
        <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={18} enableDamping dampingFactor={0.05} />
        <gridHelper args={[14, 14, "#1a3a4a", "#0d1f2a"]} position={[0, -3, 0]} />
      </Canvas>
      
      <InfoPanel 
        geometry={geometry} 
        molecularWeight={molecularWeight} 
        polarity={polarity}
        atomCount={atoms.length}
      />
      <OverlayToggles 
        showAngles={showAngles}
        setShowAngles={setShowAngles}
        showLengths={showLengths}
        setShowLengths={setShowLengths}
        showHybridization={showHybridization}
        setShowHybridization={setShowHybridization}
      />
    </BoxWrapper>
  );
}

function BoxWrapper({ children }) {
  return (
    <div
      style={{
        position: "relative",
        height: 320,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--qt-border)",
        background: "radial-gradient(circle at 20% 20%, rgba(92,201,245,0.08), rgba(10,18,25,0.98))",
      }}
    >
      {children}
    </div>
  );
}

function InfoPanel({ geometry, molecularWeight, polarity, atomCount }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "rgba(10, 18, 28, 0.85)",
        backdropFilter: "blur(8px)",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgba(92,201,245,0.3)",
        color: "var(--qt-text)",
        fontSize: 11,
        lineHeight: 1.6,
        fontFamily: "monospace",
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: "#5cc9f5" }}>Molecular Data</div>
      <div><span style={{ opacity: 0.7 }}>Geometry:</span> <strong>{geometry}</strong></div>
      <div><span style={{ opacity: 0.7 }}>Atoms:</span> <strong>{atomCount}</strong></div>
      <div><span style={{ opacity: 0.7 }}>Weight:</span> <strong>{molecularWeight.toFixed(2)} g/mol</strong></div>
      <div><span style={{ opacity: 0.7 }}>Polarity:</span> <strong style={{ color: polarity === "Polar" ? "#90caf9" : "#81c784" }}>{polarity}</strong></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--qt-text-dim)",
        fontWeight: 600,
        letterSpacing: 0.4,
        gap: 8,
      }}
    >
      <div style={{ fontSize: 14 }}>Select elements to visualize molecular structure</div>
      <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>Scientific geometry computed via VSEPR theory</div>
    </div>
  );
}

function OverlayToggles({ showAngles, setShowAngles, showLengths, setShowLengths, showHybridization, setShowHybridization }) {
  const buttonStyle = (active) => ({
    fontSize: 10,
    fontWeight: 700,
    padding: "6px 9px",
    borderRadius: 8,
    border: `1px solid ${active ? "var(--qt-accent)" : "rgba(255,255,255,0.12)"}`,
    background: active ? "rgba(92,201,245,0.18)" : "rgba(10,18,28,0.7)",
    color: "var(--qt-text)",
    cursor: "pointer",
  });

  return (
    <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 8, zIndex: 5 }}>
      <button style={buttonStyle(showAngles)} onClick={() => setShowAngles((v) => !v)}>Angles</button>
      <button style={buttonStyle(showLengths)} onClick={() => setShowLengths((v) => !v)}>Lengths</button>
      <button style={buttonStyle(showHybridization)} onClick={() => setShowHybridization((v) => !v)}>Hybridization</button>
    </div>
  );
}
