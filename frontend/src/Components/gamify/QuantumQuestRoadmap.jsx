import React, { useState, useRef, useEffect, useCallback } from 'react';
import './quantumRoadmap.css';

/* ── Level Data ── */
const LEVELS = [
  {
    id: 1, icon: '⚛️', name: 'Intro to Qubits',
    fullName: 'Introduction to Qubits',
    desc: 'Discover what qubits are, how they differ from classical bits, and explore superposition — the fundamental building block of quantum computing.',
    topics: ['Qubits', 'Superposition', 'Bloch Sphere', 'Measurement'],
    stage: 'Beginner', color: '#22d3a5',
  },
  {
    id: 2, icon: '📐', name: 'Math Foundations',
    fullName: 'Mathematical Foundations',
    desc: 'Master the linear algebra, complex numbers, and matrix operations that underpin all quantum mechanics and quantum gate operations.',
    topics: ['Complex Numbers', 'Vectors', 'Matrices', 'Inner Products'],
    stage: 'Beginner', color: '#22d3a5',
  },
  {
    id: 3, icon: '⚡', name: 'Classical vs Quantum',
    fullName: 'Classical vs. Quantum Computing',
    desc: 'Understand the fundamental differences between classical and quantum computation — when each shines and why quantum offers exponential advantages.',
    topics: ['Parallelism', 'Interference', 'Entanglement', 'Complexity'],
    stage: 'Beginner', color: '#22d3a5',
  },
  {
    id: 4, icon: '🔬', name: 'Basic Quantum Gates',
    fullName: 'Basic Quantum Gates (H, X, Z)',
    desc: 'Learn the foundational single-qubit gates: Hadamard, Pauli-X/Y/Z, Phase, and how they transform qubit states on the Bloch sphere.',
    topics: ['Hadamard Gate', 'Pauli Gates', 'Phase Gate', 'Unitary Ops'],
    stage: 'Beginner', color: '#38d1ff',
  },
  {
    id: 5, icon: '🔷', name: 'Quantum Circuits 101',
    fullName: 'Quantum Circuits 101',
    desc: 'Build and analyze your first quantum circuits using multiple gates in sequence. Understand circuit depth, width, and how to read circuit diagrams.',
    topics: ['Circuit Diagrams', 'Gate Sequences', 'Measurement', 'Ancilla Qubits'],
    stage: 'Beginner', color: '#38d1ff',
  },
  {
    id: 6, icon: '🔗', name: 'Bell States',
    fullName: 'Bell States & Entanglement',
    desc: 'Explore quantum entanglement — one of the most bizarre phenomena in physics. Create and analyze the four Bell states using CNOT and Hadamard gates.',
    topics: ['CNOT Gate', 'Bell States', 'Entanglement', 'Non-locality'],
    stage: 'Intermediate', color: '#818cf8',
  },
  {
    id: 7, icon: '📡', name: 'Quantum Teleportation',
    fullName: 'Quantum Teleportation',
    desc: 'Implement the quantum teleportation protocol step by step. Transfer quantum information across qubits using entanglement and classical communication.',
    topics: ['Teleportation Protocol', 'Classical Channel', 'Bell Measurement', 'Corrections'],
    stage: 'Intermediate', color: '#818cf8',
  },
  {
    id: 8, icon: '🌊', name: 'Fourier Transform',
    fullName: 'Quantum Fourier Transform',
    desc: "Master the QFT — the quantum analogue of the classical FFT. This key subroutine powers Shor's algorithm and phase estimation.",
    topics: ['QFT Circuit', 'Phase Kickback', 'Controlled Rotations', 'Inverse QFT'],
    stage: 'Intermediate', color: '#818cf8',
  },
  {
    id: 9, icon: '🔍', name: "Grover's Algorithm",
    fullName: "Grover's Search Algorithm",
    desc: "Implement Grover's oracle-based search algorithm achieving quadratic speedup over classical search. Understand amplitude amplification intuitively.",
    topics: ['Oracle Construction', 'Amplitude Amplification', 'Diffusion Operator', 'Complexity'],
    stage: 'Intermediate', color: '#a855f7',
  },
  {
    id: 10, icon: '🔐', name: "Shor's Algorithm",
    fullName: "Shor's Factoring Algorithm",
    desc: 'Explore the most famous quantum algorithm that can break RSA encryption. Combine number theory with the QFT to factor large integers exponentially faster.',
    topics: ['Period Finding', 'Modular Arithmetic', 'QFT Application', 'Classical Post-processing'],
    stage: 'Advanced', color: '#f472b6',
  },
  {
    id: 11, icon: '🛡️', name: 'Error Correction',
    fullName: 'Quantum Error Correction',
    desc: 'Learn how to protect quantum information from decoherence and noise using stabilizer codes, the 3-qubit bit-flip code, and the surface code.',
    topics: ['Bit-flip Code', 'Phase-flip Code', 'Stabilizers', 'Surface Code'],
    stage: 'Advanced', color: '#f472b6',
  },
  {
    id: 12, icon: '📊', name: 'Variational Algorithms',
    fullName: 'Variational Quantum Algorithms (VQE)',
    desc: 'Build hybrid quantum-classical algorithms for near-term devices. Use the Variational Quantum Eigensolver to find ground state energies.',
    topics: ['Ansatz Design', 'Cost Functions', 'Classical Optimizer', 'NISQ Devices'],
    stage: 'Advanced', color: '#f472b6',
  },
  {
    id: 13, icon: '🧠', name: 'Advanced Algorithms',
    fullName: 'Advanced Quantum Algorithms',
    desc: 'Explore HHL for linear systems, quantum walk algorithms, quantum simulation, and more — the frontier of quantum algorithmic research.',
    topics: ['HHL Algorithm', 'Quantum Walks', 'Hamiltonian Simulation', 'QAOA'],
    stage: 'Advanced', color: '#fb923c',
  },
  {
    id: 14, icon: '🤖', name: 'Quantum ML',
    fullName: 'Quantum Machine Learning',
    desc: 'Merge quantum computing with machine learning. Explore quantum kernels, quantum neural networks, and data encoding strategies for quantum advantage in AI.',
    topics: ['Quantum Kernels', 'QNNs', 'Data Encoding', 'Quantum Advantage'],
    stage: 'Advanced', color: '#fb923c',
  },
  {
    id: 15, icon: '🏆', name: 'Quantum Advanced',
    fullName: 'Quantum Advanced — Grand Master',
    desc: "Congratulations! You've reached the pinnacle. Tackle open research problems, contribute to quantum software, and explore the bleeding edge of quantum computing.",
    topics: ['Research Problems', 'Quantum Advantage', 'Open Problems', 'Grand Master'],
    stage: 'Master', color: '#fbbf24',
  },
];

const QUANTUM_CORE_AFTER = 7;

/* Zigzag node positions */
const NODE_POSITIONS = [
  { x: 15, y: 7 },
  { x: 33, y: 13 },
  { x: 54, y: 9 },
  { x: 73, y: 15 },
  { x: 83, y: 26 },
  { x: 69, y: 36 },
  { x: 49, y: 41 },
  { x: 29, y: 47 },
  { x: 15, y: 57 },
  { x: 27, y: 67 },
  { x: 46, y: 71 },
  { x: 63, y: 66 },
  { x: 79, y: 72 },
  { x: 83, y: 83 },
  { x: 64, y: 91 },
];

const CORE_POSITION = { x: 50, y: 44 };

/* Particles scattered over full map */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: `${1.5 + Math.random() * 3}px`,
  dur: `${7 + Math.random() * 9}s`,
  delay: `${Math.random() * 10}s`,
  color: i % 4 === 0 ? '#a855f7' : i % 4 === 1 ? '#38d1ff' : i % 4 === 2 ? '#fbbf24' : '#22d3a5',
}));

/* ── Helpers ── */
function getMidpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function getAngle(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
}

/* Given two nodes, compute a control-point-based arrow path & midpoint for arrowhead */
function buildSegment(from, to, w, h) {
  const fx = (from.x / 100) * w;
  const fy = (from.y / 100) * h;
  const tx = (to.x / 100) * w;
  const ty = (to.y / 100) * h;
  const cx = (fx + tx) / 2;
  const cy = (fy + ty) / 2;
  // Curved path
  const d = `M ${fx} ${fy} Q ${cx} ${fy} ${cx} ${cy} Q ${cx} ${ty} ${tx} ${ty}`;
  // Arrow near 75% of segment
  const ax = cx + (tx - cx) * 0.55;
  const ay = cy + (ty - cy) * 0.55;
  const angle = getAngle({ x: cx, y: cy }, { x: tx, y: ty });
  return { d, ax, ay, angle };
}

/* ── Main Component ── */
export default function QuantumQuestRoadmap() {
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ w: 900, h: 1000 });
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [unlockedUpTo, setUnlockedUpTo] = useState(5);
  const [completedLevels, setCompletedLevels] = useState(new Set([1, 2, 3]));
  const [coins, setCoins] = useState(3450);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setMapSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    if (mapRef.current) ro.observe(mapRef.current);
    return () => ro.disconnect();
  }, []);

  const getNodeState = useCallback((id) => {
    if (completedLevels.has(id)) return 'completed';
    return 'unlocked';
  }, [completedLevels]);

  /* Build ordered list of all waypoints: level nodes interleaved with core */
  const allWaypoints = [];
  NODE_POSITIONS.forEach((pos, i) => {
    allWaypoints.push({ pos, isCore: false, levelId: LEVELS[i].id });
    if (i === QUANTUM_CORE_AFTER - 1) {
      allWaypoints.push({ pos: CORE_POSITION, isCore: true });
    }
  });

  /* Build segment data for arrows */
  const segments = [];
  for (let i = 0; i < allWaypoints.length - 1; i++) {
    const from = allWaypoints[i].pos;
    const to = allWaypoints[i + 1].pos;
    const seg = buildSegment(from, to, mapSize.w, mapSize.h);
    // Determine stroke color based on from node state
    const fromId = allWaypoints[i].levelId;
    const state = fromId ? getNodeState(fromId) : 'completed';
    const isActive = state === 'completed' || state === 'unlocked' || state === 'active';
    segments.push({ ...seg, active: isActive, idx: i });
  }

  const handleNodeClick = (lvl) => {
    const state = getNodeState(lvl.id);
    setSelectedLevel(state === 'locked' ? { ...lvl, locked: true } : lvl);
  };

  const handleStart = () => {
    if (!selectedLevel) return;
    setCompletedLevels(prev => new Set([...prev, selectedLevel.id]));
    if (selectedLevel.id >= unlockedUpTo) setUnlockedUpTo(selectedLevel.id);
    setCoins(prev => prev + 250);
    setSelectedLevel(null);
  };

  const currentLevel = unlockedUpTo + 1;
  const panelLevel = selectedLevel && selectedLevel.id !== 'core' ? LEVELS.find(l => l.id === selectedLevel.id) : null;
  const accentColor = panelLevel?.color || '#38d1ff';

  return (
    <div className="qr-root">
      {/* Ambient particles */}
      <div className="qr-particles" aria-hidden>
        {PARTICLES.map(p => (
          <div key={p.id} className="qr-particle" style={{
            left: p.left, top: p.top, width: p.size, height: p.size,
            background: p.color, '--dur': p.dur, '--delay': p.delay,
          }} />
        ))}
      </div>

      {/* Map canvas */}
      <div className="qr-map-area">
        <div className="qr-map-inner" ref={mapRef}>
          <div className="qr-map-bg-grid" />

          {/* SVG Arrow connections */}
          <svg
            className="qr-svg-layer"
            viewBox={`0 0 ${mapSize.w} ${mapSize.h}`}
            preserveAspectRatio="none"
          >
            <defs>
              {/* Active arrowhead */}
              <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="4" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#38d1ff" opacity="0.9" />
              </marker>
              {/* Locked arrowhead */}
              <marker id="arrowLocked" markerWidth="7" markerHeight="7" refX="3.5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#1e3a52" opacity="0.6" />
              </marker>
              {/* Glow filter */}
              <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Gold gradient for completed */}
              <linearGradient id="gradCompleted" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38d1ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="gradLocked" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2d3d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1e2d3d" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {segments.map(seg => (
              <g key={seg.idx}>
                {/* Glow halo behind active paths */}
                {seg.active && (
                  <path
                    d={seg.d}
                    fill="none"
                    stroke="rgba(56,209,255,0.18)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                )}
                {/* Main path with arrow */}
                <path
                  d={seg.d}
                  fill="none"
                  stroke={seg.active ? 'url(#gradCompleted)' : 'url(#gradLocked)'}
                  strokeWidth={seg.active ? 2.5 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={seg.active ? 'none' : '5 5'}
                  markerEnd={seg.active ? 'url(#arrowActive)' : 'url(#arrowLocked)'}
                  filter={seg.active ? 'url(#glowLine)' : 'none'}
                  className={seg.active ? 'qr-path-animated' : ''}
                />
              </g>
            ))}
          </svg>

          {/* Quantum Core */}
          <div
            className="qr-node-wrapper quantum-core-wrapper"
            style={{ left: `${CORE_POSITION.x}%`, top: `${CORE_POSITION.y}%` }}
            onClick={() => setSelectedLevel({
              id: 'core', icon: '⚛️', fullName: 'Quantum Core',
              desc: 'The heart of your quantum journey — convergence of foundational knowledge before you advance to expert-level topics.',
              topics: ['Checkpoint', 'Knowledge Core', 'Mid-way Hub', 'Convergence'],
              locked: false,
            })}
          >
            <div className="qr-node quantum-core">
              <span className="qr-node-icon" style={{ fontSize: 32 }}>⚛️</span>
            </div>
            <span className="qr-core-label">QUANTUM CORE</span>
          </div>

          {/* Level Nodes */}
          {LEVELS.map((lvl, idx) => {
            const pos = NODE_POSITIONS[idx];
            const state = getNodeState(lvl.id);
            const isCompleted = state === 'completed';
            const isActive = state === 'active';
            const stageColors = {
              Beginner: '#22d3a5',
              Intermediate: '#818cf8',
              Advanced: '#f472b6',
              Master: '#fbbf24',
            };
            const nodeColor = stageColors[lvl.stage] || '#38d1ff';

            return (
              <div
                key={lvl.id}
                className={`qr-node-wrapper ${state}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleNodeClick(lvl)}
              >
                {/* Stars for completed */}
                {isCompleted && (
                  <div className="qr-node-stars">
                    <span className="qr-star">⭐</span>
                    <span className="qr-star">⭐</span>
                    <span className="qr-star">⭐</span>
                  </div>
                )}

                {/* Active ping ring */}
                {isActive && <div className="qr-active-ping" style={{ '--ping-color': nodeColor }} />}

                <div
                  className={`qr-node ${state} ${lvl.id === 15 ? 'trophy' : ''}`}
                  style={state !== 'locked' ? { '--node-color': nodeColor } : {}}
                >
                  <span className="qr-node-num">{String(lvl.id).padStart(2, '0')}</span>
                  {state === 'locked'
                    ? <span className="qr-node-lock">🔒</span>
                    : <span className="qr-node-icon">{lvl.icon}</span>
                  }
                </div>

                <div className="qr-node-label">
                  <div className="qr-node-label-stage" style={state !== 'locked' ? { color: nodeColor } : {}}>
                    {lvl.stage}
                  </div>
                  <div className="qr-node-label-name">{lvl.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel && (
        <div className="qr-panel-overlay" onClick={() => setSelectedLevel(null)}>
          <div className="qr-panel" style={{ '--accent': accentColor }} onClick={e => e.stopPropagation()}>
            {/* Glowing top edge */}
            <div className="qr-panel-glow-bar" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />

            <button className="qr-panel-close" onClick={() => setSelectedLevel(null)}>✕</button>

            {/* Header */}
            <div className="qr-panel-header">
              <div className="qr-panel-icon-wrap" style={{ boxShadow: `0 0 24px ${accentColor}55`, border: `1.5px solid ${accentColor}55` }}>
                <span className="qr-panel-icon">{selectedLevel.icon}</span>
              </div>
              <div className="qr-panel-meta">
                <div className="qr-panel-level-tag" style={{ color: accentColor }}>
                  {selectedLevel.id === 'core' ? '◈ CHECKPOINT' : `▸ LEVEL ${String(selectedLevel.id).padStart(2, '0')}`}
                </div>
                <div className="qr-panel-title">{selectedLevel.fullName}</div>
                {panelLevel && (
                  <div className="qr-panel-stage-badge" style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}44`, color: accentColor }}>
                    {panelLevel.stage}
                  </div>
                )}
              </div>
            </div>

            <div className="qr-panel-divider" style={{ background: `linear-gradient(90deg, ${accentColor}55, transparent)` }} />

            <p className="qr-panel-desc">{selectedLevel.desc}</p>

            {/* Topics */}
            <div className="qr-panel-topics-label">Topics covered</div>
            <div className="qr-panel-topics">
              {selectedLevel.topics?.map((t, i) => (
                <span key={t} className="qr-topic-chip" style={{
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}44`,
                  color: accentColor,
                  animationDelay: `${i * 0.07}s`,
                }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Action */}
            <div className="qr-panel-actions">
              {selectedLevel.locked ? (
                <button className="qr-btn-locked" disabled>🔒 Complete Previous Levels First</button>
              ) : selectedLevel.id === 'core' ? (
                <button className="qr-btn-start" style={{ background: `linear-gradient(135deg, #38d1ff, #a855f7)` }} onClick={() => setSelectedLevel(null)}>
                  ◈ CHECKPOINT REACHED
                </button>
              ) : (
                <button
                  className="qr-btn-start"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
                  onClick={handleStart}
                >
                  {completedLevels.has(selectedLevel.id) ? '↩ REPLAY' : '▶ START LEVEL'} &nbsp;+250 🪙
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
