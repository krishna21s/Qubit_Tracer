import React, { useState, useEffect, useMemo } from 'react';
import { simulateCircuit } from '../../utils/localCircuitSimulator';
import './circuitStudioSolver.css';

// Guaranteed fallback canonical solutions
const CANONICAL_FALLBACKS = {
  'prob-015': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-003': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [0, 2] }],
  'prob-016': [{ gate: 'X', qubits: [1] }, { gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-017': [{ gate: 'X', qubits: [0] }, { gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-020': [{ gate: 'X', qubits: [1] }, { gate: 'X', qubits: [0] }, { gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-004': [{ gate: 'H', qubits: [1] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-018': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [1, 2] }, { gate: 'CX', qubits: [2, 3] }],
  'prob-019': [{ gate: 'H', qubits: [1] }, { gate: 'CX', qubits: [1, 0] }],
  'prob-021': [{ gate: 'H', qubits: [1] }, { gate: 'CX', qubits: [1, 0] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-022': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'H', qubits: [2] }, { gate: 'CX', qubits: [2, 3] }],
  'prob-030': [{ gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }, { gate: 'CZ', qubits: [0, 1] }],
  'prob-031': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'SWAP', qubits: [1, 2] }],
  'prob-032': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [1, 2] }, { gate: 'CX', qubits: [2, 0] }],
  'prob-033': [{ gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }, { gate: 'CCX', qubits: [0, 1, 2] }],
  'prob-034': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'S', qubits: [1] }],
  'prob-035': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-042': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-043': [{ gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }, { gate: 'H', qubits: [2] }, { gate: 'CZ', qubits: [0, 1] }, { gate: 'CZ', qubits: [1, 2] }],
  'prob-044': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [0, 2] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-045': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'H', qubits: [2] }, { gate: 'CX', qubits: [2, 3] }, { gate: 'CX', qubits: [1, 2] }],
  'prob-046': [{ gate: 'H', qubits: [0] }, { gate: 'X', qubits: [1] }, { gate: 'CZ', qubits: [0, 1] }, { gate: 'H', qubits: [1] }],
  'prob-047': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'CX', qubits: [1, 2] }, { gate: 'CX', qubits: [2, 3] }, { gate: 'CX', qubits: [3, 0] }],
  'prob-048': [{ gate: 'H', qubits: [0] }, { gate: 'X', qubits: [1] }, { gate: 'H', qubits: [1] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'H', qubits: [0] }],
  'prob-049': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'X', qubits: [0] }, { gate: 'Z', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'H', qubits: [0] }],
  'prob-050': [{ gate: 'H', qubits: [0] }, { gate: 'X', qubits: [1] }, { gate: 'H', qubits: [1] }, { gate: 'CX', qubits: [0, 1] }, { gate: 'H', qubits: [0] }],
  'prob-051': [{ gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }, { gate: 'CCX', qubits: [0, 1, 2] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-052': [{ gate: 'H', qubits: [0] }, { gate: 'CZ', qubits: [1, 0] }, { gate: 'H', qubits: [1] }, { gate: 'SWAP', qubits: [0, 1] }],
  'prob-053': [{ gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }, { gate: 'X', qubits: [0] }, { gate: 'X', qubits: [1] }, { gate: 'CZ', qubits: [0, 1] }, { gate: 'X', qubits: [0] }, { gate: 'X', qubits: [1] }, { gate: 'H', qubits: [0] }, { gate: 'H', qubits: [1] }],
  'prob-001': [{ gate: 'H', qubits: [0] }, { gate: 'CX', qubits: [0, 1] }],
  'prob-002': [{ gate: 'X', qubits: [0] }],
};

const GATE_TABS = [
  { id: 'single', label: 'Single-Qubit' },
  { id: 'multi', label: 'Multi-Qubit (CX, CZ, SWAP)' },
  { id: 'rotations', label: 'Rotations' },
  { id: 'all', label: 'All Gates' },
];

const ALL_GATES = [
  // Single-Qubit
  { id: 'H', label: 'H', name: 'Hadamard (Superposition)', category: 'single', class: 'gate-h', qubits: 1 },
  { id: 'X', label: 'X', name: 'Pauli-X (Bit Flip / NOT)', category: 'single', class: 'gate-x', qubits: 1 },
  { id: 'Y', label: 'Y', name: 'Pauli-Y', category: 'single', class: 'gate-y', qubits: 1 },
  { id: 'Z', label: 'Z', name: 'Pauli-Z (Phase Flip)', category: 'single', class: 'gate-z', qubits: 1 },
  { id: 'S', label: 'S', name: 'S Gate (π/2 Phase)', category: 'single', class: 'gate-s', qubits: 1 },
  { id: 'T', label: 'T', name: 'T Gate (π/4 Phase)', category: 'single', class: 'gate-t', qubits: 1 },
  { id: 'SX', label: '√X', name: 'Square-root of X', category: 'single', class: 'gate-sx', qubits: 1 },
  { id: 'I', label: 'I', name: 'Identity', category: 'single', class: 'gate-default', qubits: 1 },

  // Multi-Qubit / Entangling
  { id: 'CX', label: '●──⊕ CX', name: 'CNOT (Entangle: Control ➔ Target)', category: 'multi', class: 'gate-cx', qubits: 2 },
  { id: 'CZ', label: '●──● CZ', name: 'Controlled-Z', category: 'multi', class: 'gate-cz', qubits: 2 },
  { id: 'SWAP', label: '✕──✕ SWAP', name: 'Swap Qubits', category: 'multi', class: 'gate-swap', qubits: 2 },
  { id: 'CCX', label: 'Toffoli', name: 'Toffoli (CCX)', category: 'multi', class: 'gate-ccx', qubits: 3 },

  // Rotations
  { id: 'Rx', label: 'Rx', name: 'Rx Rotation', category: 'rotations', class: 'gate-rx', qubits: 1 },
  { id: 'Ry', label: 'Ry', name: 'Ry Rotation', category: 'rotations', class: 'gate-ry', qubits: 1 },
  { id: 'Rz', label: 'Rz', name: 'Rz Rotation', category: 'rotations', class: 'gate-rz', qubits: 1 },
  { id: 'P', label: 'P', name: 'Phase Gate', category: 'rotations', class: 'gate-default', qubits: 1 },
];

export default function CircuitStudioSolver({
  problem,
  solutions = [],
  onScoreUpdate,
}) {
  const numQubits = Math.max(1, Math.min(6, problem?.num_qubits || 2));
  const numSteps = 5;

  const [activeTab, setActiveTab] = useState('multi');
  const [selectedGate, setSelectedGate] = useState('H');
  const [placedGates, setPlacedGates] = useState([]);
  const [cxDialog, setCxDialog] = useState(null); // { col, ctrlQubit, type }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // { success: boolean, message, points, hint }
  const [showResultModal, setShowResultModal] = useState(false);
  const [localSolutions, setLocalSolutions] = useState(solutions);

  // Sync solutions
  useEffect(() => {
    if (solutions && solutions.length > 0) {
      setLocalSolutions(solutions);
    } else {
      const base = (import.meta?.env?.BASE_URL ?? '/').replace(/\/+$/, '/');
      fetch(`${base}gamify/solutions.json`)
        .then(r => r.json())
        .then(data => setLocalSolutions(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [solutions]);

  // Reset when problem changes
  useEffect(() => {
    setPlacedGates([]);
    setSelectedGate('H');
    setCxDialog(null);
    setResult(null);
    setShowResultModal(false);
  }, [problem?.id]);

  // Remove a gate
  const removeGate = (id) => {
    setPlacedGates(prev => prev.filter(g => g.id !== id));
    setResult(null);
  };

  // Swap control and target of a 2-qubit gate
  const swapControlTarget = (gateId) => {
    setPlacedGates(prev => prev.map(g => {
      if (g.id !== gateId || g.qubits.length < 2) return g;
      return { ...g, qubits: [g.qubits[1], g.qubits[0]] };
    }));
    setResult(null);
  };

  // Clear all
  const resetAll = () => {
    setPlacedGates([]);
    setCxDialog(null);
    setResult(null);
    setShowResultModal(false);
  };

  // Click on a wire slot
  const handleSlotClick = (qubit, col) => {
    setResult(null);

    // Check if slot already has a gate
    const existing = placedGates.find(g => g.col === col && g.qubits.includes(qubit));
    if (existing) {
      removeGate(existing.id);
      return;
    }

    if (!selectedGate) {
      setSelectedGate('H');
      return;
    }

    const gateDef = ALL_GATES.find(g => g.id === selectedGate);
    if (!gateDef) return;

    if (gateDef.qubits === 2) {
      // Multi-qubit gate (CX, CZ, SWAP) - prompt target selection
      setCxDialog({ col, ctrlQubit: qubit, type: gateDef.id });
    } else {
      // Single qubit gate
      setPlacedGates(prev => [
        ...prev.filter(g => !(g.col === col && g.qubits.includes(qubit))),
        {
          id: 'gate-' + Date.now() + Math.random(),
          type: gateDef.id,
          col,
          qubits: [qubit],
        },
      ]);
    }
  };

  // Confirm target qubit for multi-qubit gate
  const confirmMultiQubitGate = (targetQ) => {
    if (!cxDialog) return;
    const { col, ctrlQubit, type } = cxDialog;

    setPlacedGates(prev => [
      ...prev.filter(g => !(g.col === col && (g.qubits.includes(ctrlQubit) || g.qubits.includes(targetQ)))),
      {
        id: 'gate-' + Date.now() + Math.random(),
        type: type || 'CX',
        col,
        qubits: [ctrlQubit, targetQ],
      },
    ]);
    setCxDialog(null);
  };

  // Ordered operations timeline
  const circuitOperations = useMemo(() => {
    const sorted = [...placedGates].sort((a, b) => a.col - b.col || a.qubits[0] - b.qubits[0]);
    return sorted.map(g => ({
      gate: g.type,
      qubits: g.qubits,
      col: g.col,
    }));
  }, [placedGates]);

  // Analyze and Validate Circuit with Quantum State Simulator
  const analyzeResult = () => {
    setIsAnalyzing(true);
    setResult(null);

    // Check if user placed any gates
    if (placedGates.length === 0) {
      setTimeout(() => {
        const res = {
          success: false,
          message: 'No gates placed on the circuit wires.',
          hint: 'Select a gate from the palette (e.g. H, CX) and click on a wire slot to build your circuit first!',
        };
        setResult(res);
        setShowResultModal(true);
        setIsAnalyzing(false);
      }, 300);
      return;
    }

    setTimeout(() => {
      // Find canonical solution from prop/state or guaranteed fallback dictionary
      const solution =
        localSolutions.find(s => s.problem_id === problem.id || s.id === problem.solution_id) ||
        { canonical_circuit: CANONICAL_FALLBACKS[problem.id] || CANONICAL_FALLBACKS[problem.solution_id] || [] };

      const canonical = solution.canonical_circuit || [];

      try {
        const cFormatted = canonical.map((g, i) => {
          const type = String(g.gate).toLowerCase();
          if (type === 'cx' || type === 'cnot') {
            return { type: 'cx', control: g.qubits[0], target: g.qubits[1], column: i };
          }
          if (type === 'cz') {
            return { type: 'cz', control: g.qubits[0], target: g.qubits[1], column: i };
          }
          return { type, qubits: g.qubits, column: i };
        });

        const uFormatted = circuitOperations.map((g, i) => {
          const type = String(g.gate).toLowerCase();
          if (type === 'cx' || type === 'cnot') {
            return { type: 'cx', control: g.qubits[0], target: g.qubits[1], column: g.col ?? i };
          }
          if (type === 'cz') {
            return { type: 'cz', control: g.qubits[0], target: g.qubits[1], column: g.col ?? i };
          }
          return { type, qubits: g.qubits, column: g.col ?? i };
        });

        const simExpected = simulateCircuit({ numQubits, gates: cFormatted });
        const simUser = simulateCircuit({ numQubits, gates: uFormatted });

        // Quantum Fidelity |<ψ_user | ψ_canonical>|^2
        let re = 0, im = 0;
        for (let i = 0; i < simExpected.statevector.length; i++) {
          const u = simUser.statevector[i];
          const e = simExpected.statevector[i];
          if (u && e) {
            re += u.re * e.re + u.im * e.im;
            im += u.re * e.im - u.im * e.re;
          }
        }
        const fidelity = re * re + im * im;

        // Compare probability amplitudes
        let probMatch = true;
        for (const key of Object.keys(simExpected.amplitudes)) {
          const pExp = simExpected.amplitudes[key]?.prob || 0;
          const pUsr = simUser.amplitudes[key]?.prob || 0;
          if (Math.abs(pExp - pUsr) > 0.01) {
            probMatch = false;
            break;
          }
        }

        // Canonical gate matching fallback
        const norm = (g) => {
          const up = String(g.gate || g.type).toUpperCase();
          return up === 'CNOT' ? 'CX' : up;
        };
        const exactMatch =
          circuitOperations.length === canonical.length &&
          circuitOperations.every((u, i) => norm(u) === norm(canonical[i]) && JSON.stringify(u.qubits) === JSON.stringify(canonical[i].qubits));

        const isSuccess = fidelity > 0.98 || probMatch || exactMatch;

        if (isSuccess) {
          const points = (problem.level || 2) * 10;
          if (onScoreUpdate) onScoreUpdate(points);
          const res = {
            success: true,
            message: 'Accepted! Quantum Entanglement Verified successfully.',
            points,
          };
          setResult(res);
          setShowResultModal(true);
        } else {
          // Provide diagnostic feedback
          const hasCX = circuitOperations.some(op => ['CX', 'CNOT'].includes(op.gate.toUpperCase()));
          const hasH = circuitOperations.some(op => op.gate.toUpperCase() === 'H');

          let hint = 'Check your gate sequence or wire numbers.';
          if (!hasH && canonical.some(c => c.gate === 'H')) {
            hint = 'Missing Hadamard (H): Apply H on the control wire to create quantum superposition.';
          } else if (!hasCX && canonical.some(c => ['CX', 'CNOT'].includes(c.gate))) {
            hint = 'Missing CNOT (CX): Apply CNOT from control wire to target wire to create entanglement.';
          } else {
            const userCX = circuitOperations.find(op => ['CX', 'CNOT'].includes(op.gate.toUpperCase()));
            const canonCX = canonical.find(op => ['CX', 'CNOT'].includes(op.gate));
            if (userCX && canonCX && userCX.qubits[0] === canonCX.qubits[1] && userCX.qubits[1] === canonCX.qubits[0]) {
              hint = 'Inverted Control & Target on CX! Click the ⇄ icon on the CX gate to swap control and target wires.';
            }
          }

          const res = {
            success: false,
            message: 'Wrong Answer: The quantum statevector does not match the target state.',
            hint,
          };
          setResult(res);
          setShowResultModal(true);
        }
      } catch (err) {
        const res = {
          success: false,
          message: 'Simulation error: ' + err.message,
        };
        setResult(res);
        setShowResultModal(true);
      }

      setIsAnalyzing(false);
    }, 450);
  };

  const qubitRows = Array.from({ length: numQubits }, (_, i) => i);
  const stepCols = Array.from({ length: numSteps }, (_, i) => i);

  // Filter gates by tab
  const displayedGates = useMemo(() => {
    if (activeTab === 'all') return ALL_GATES;
    return ALL_GATES.filter(g => g.category === activeTab);
  }, [activeTab]);

  return (
    <div className="css-solver-root">
      {/* ── Top Header Bar ── */}
      <div className="css-header-bar">
        <div className="css-header-left">
          <span className="css-wire-badge">
            ⚡ <strong>{numQubits} Qubit Lines</strong> ({qubitRows.map(q => `q[${q}]`).join(', ')})
          </span>
          {result && (
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              color: result.success ? '#3fb950' : '#f85149',
              background: result.success ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)',
              border: `1px solid ${result.success ? 'rgba(63, 185, 80, 0.4)' : 'rgba(248, 81, 73, 0.4)'}`,
            }}>
              {result.success ? '✅ ACCEPTED' : '❌ WRONG ANSWER'}
            </span>
          )}
        </div>

        <div className="css-header-actions">
          <button className="css-btn-reset" onClick={resetAll} title="Clear all wires">
            Clear Wires
          </button>
          <button
            className="css-btn-run header-run"
            onClick={analyzeResult}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <>⏳ Running...</> : <>▶ Run Circuit</>}
          </button>
        </div>
      </div>

      {/* ── Complete Gate Library Palette ── */}
      <div className="css-palette-container">
        {/* Category Tabs */}
        <div className="css-palette-tabs">
          {GATE_TABS.map(tab => (
            <button
              key={tab.id}
              className={`css-palette-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gate Buttons Bar */}
        <div className="css-palette-gates-bar">
          <div className="css-palette-gates">
            {displayedGates.map(g => (
              <button
                key={g.id}
                className={`css-gate-chip ${g.class} ${selectedGate === g.id ? 'selected' : ''}`}
                onClick={() => setSelectedGate(g.id)}
                title={g.name}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="css-selected-indicator">
            Selected: <strong style={{ color: '#38bdf8' }}>{selectedGate}</strong>
            <span style={{ color: 'var(--gf-text-dim)', fontSize: '11px' }}>
              {selectedGate === 'CX'
                ? '(Click a wire slot to set Control ● & Target ⊕)'
                : '(Click any slot to place)'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Circuit Workspace Canvas ── */}
      <div className="css-circuit-canvas">
        <div className="css-grid-card">
          <div className="css-grid-table">
            {/* Left Qubit Labels */}
            <div className="css-qubit-labels-col">
              {qubitRows.map(q => (
                <div key={q} className="css-qubit-label-box">
                  <span>q[{q}]</span>
                  <span className="css-qubit-ket">|0⟩</span>
                </div>
              ))}
            </div>

            {/* Continuous horizontal background wires */}
            <div className="css-wire-tracks-bg">
              {qubitRows.map(q => (
                <div
                  key={q}
                  className="css-wire-track-line"
                  style={{ top: `${q * 72 + 32}px` }}
                />
              ))}
            </div>

            {/* Step Columns */}
            <div className="css-step-columns-container">
              {stepCols.map(col => {
                const multiGate = placedGates.find(g => g.col === col && g.qubits.length >= 2);

                const cQ = multiGate ? multiGate.qubits[0] : null;
                const tQ = multiGate ? multiGate.qubits[1] : null;

                const minQ = multiGate ? Math.min(cQ, tQ) : 0;
                const maxQ = multiGate ? Math.max(cQ, tQ) : 0;

                return (
                  <div key={col} className="css-step-column">
                    {/* Header */}
                    <div className="css-step-col-header">
                      Step {col + 1}
                    </div>

                    {/* Column Centered Vertical Connector Line for CNOT / CZ / SWAP */}
                    {multiGate && (
                      <div
                        className="css-col-vertical-connector"
                        style={{
                          top: `${minQ * 72 + 32}px`,
                          height: `${(maxQ - minQ) * 72}px`,
                        }}
                      />
                    )}

                    {/* Slots for each Qubit */}
                    {qubitRows.map(q => {
                      const gate = placedGates.find(g => g.col === col && g.qubits.includes(q));
                      const isMulti = gate && gate.qubits.length >= 2;
                      const isCtrl = isMulti && gate.qubits[0] === q;
                      const isTgt = isMulti && gate.qubits[1] === q;

                      return (
                        <div
                          key={q}
                          className={`css-step-col-slot ${gate ? 'occupied' : ''}`}
                          onClick={() => handleSlotClick(q, col)}
                        >
                          {/* Single-Qubit Gate */}
                          {gate && !isMulti && (
                            <div className={`css-placed-gate gate-${gate.type.toLowerCase()}`}>
                              {gate.type}
                              <button
                                className="css-gate-action-btn css-gate-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGate(gate.id);
                                }}
                                title="Remove gate"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* CNOT / Multi Control Node */}
                          {isMulti && isCtrl && (
                            <div className="css-cx-node" title={`Control on q[${q}] ➔ Target on q[${tQ}]`}>
                              <div className="css-cx-control-dot" />
                              <button
                                className="css-gate-action-btn css-gate-swap-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swapControlTarget(gate.id);
                                }}
                                title="Swap Control and Target (⇄)"
                              >
                                ⇄
                              </button>
                              <button
                                className="css-gate-action-btn css-gate-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGate(gate.id);
                                }}
                                title="Remove CNOT"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* CNOT / Multi Target Node */}
                          {isMulti && isTgt && (
                            <div className="css-cx-node" title={`Target on q[${q}] (Controlled by q[${cQ}])`}>
                              <div className="css-cx-target-circle">⊕</div>
                              <button
                                className="css-gate-action-btn css-gate-swap-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  swapControlTarget(gate.id);
                                }}
                                title="Swap Control and Target (⇄)"
                              >
                                ⇄
                              </button>
                              <button
                                className="css-gate-action-btn css-gate-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGate(gate.id);
                                }}
                                title="Remove CNOT"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CNOT / Multi-qubit Target Selector Modal */}
          {cxDialog && (
            <div className="css-dialog-overlay" onClick={() => setCxDialog(null)}>
              <div className="css-dialog-box" onClick={e => e.stopPropagation()}>
                <div className="css-dialog-title">
                  Configure {cxDialog.type || 'CNOT'} for Step {cxDialog.col + 1}
                </div>
                <div className="css-dialog-subtitle">
                  Control is on <strong>q[{cxDialog.ctrlQubit}]</strong>. Choose the Target Wire:
                </div>
                <div className="css-dialog-options">
                  {qubitRows
                    .filter(q => q !== cxDialog.ctrlQubit)
                    .map(q => (
                      <button
                        key={q}
                        className="css-dialog-opt-btn"
                        onClick={() => confirmMultiQubitGate(q)}
                      >
                        Target: q[{q}] ⊕
                      </button>
                    ))}
                </div>
                <button className="css-dialog-cancel-btn" onClick={() => setCxDialog(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Prominent Result Modal (LeetCode / Game Style) ── */}
          {showResultModal && result && (
            <div className="css-result-modal-overlay" onClick={() => setShowResultModal(false)}>
              <div
                className={`css-result-modal-card ${result.success ? 'accepted' : 'wrong'}`}
                onClick={e => e.stopPropagation()}
              >
                <div className="css-result-big-icon">
                  {result.success ? '🎉' : '❌'}
                </div>

                <div className={`css-result-title ${result.success ? 'accepted' : 'wrong'}`}>
                  {result.success ? 'ACCEPTED' : 'WRONG ANSWER'}
                </div>

                <div className="css-result-message">
                  {result.message}
                </div>

                {result.points && (
                  <div>
                    <span className="css-result-xp-pill">
                      ⚡ +{result.points} XP Points Awarded!
                    </span>
                  </div>
                )}

                {result.hint && (
                  <div className="css-result-hint-box">
                    <strong>💡 Hint:</strong> {result.hint}
                  </div>
                )}

                <button
                  className={`css-result-btn-close ${result.success ? 'accepted' : ''}`}
                  onClick={() => setShowResultModal(false)}
                >
                  {result.success ? 'Awesome! Keep Going' : 'Try Again'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Operations Timeline Bar ── */}
      <div className="css-ops-preview-bar">
        <span style={{ fontWeight: 600, color: 'var(--gf-text)' }}>Placed Sequence:</span>
        {circuitOperations.length === 0 ? (
          <span style={{ fontStyle: 'italic' }}>
            No gates placed. Click a gate from the palette, then click on the wire slots to construct the circuit.
          </span>
        ) : (
          circuitOperations.map((op, idx) => (
            <span key={idx} className="css-op-tag">
              #{idx + 1} {op.gate}
              {op.qubits.length > 1
                ? `(q${op.qubits[0]} ➔ q${op.qubits[1]})`
                : `(q${op.qubits[0]})`}
            </span>
          ))
        )}
      </div>

      {/* ── Bottom Console / Run Dock ── */}
      <div className="css-console-dock">
        <div className="css-console-header">
          <span className="css-console-title">Quantum Verification & Simulation</span>
          <div className="css-console-actions">
            <button className="css-btn-reset" onClick={resetAll}>
              Reset
            </button>
            <button
              className="css-btn-run"
              onClick={analyzeResult}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <>⏳ Simulating State...</> : <>▶ Run Circuit</>}
            </button>
          </div>
        </div>

        <div className="css-console-output">
          {!result && !isAnalyzing && (
            <span style={{ color: 'var(--gf-text-dim)' }}>
              Place your quantum gates on the {numQubits} wire lines above, then click <strong>Run Circuit</strong> to simulate the quantum state.
            </span>
          )}

          {isAnalyzing && (
            <span style={{ color: '#38bdf8' }}>
              Calculating statevector across {numQubits} qubits... checking quantum fidelity & correlations...
            </span>
          )}

          {result && !isAnalyzing && (
            <div className={result.success ? 'css-output-success' : 'css-output-error'}>
              <span style={{ fontSize: '18px' }}>{result.success ? '🎉' : '❌'}</span>
              <div>
                <strong>{result.success ? 'ACCEPTED: ' : 'WRONG ANSWER: '}</strong>
                <span>{result.message}</span>
                {result.points && (
                  <span style={{ marginLeft: '12px', color: '#3fb950', fontWeight: 700 }}>
                    +{result.points} XP Awarded!
                  </span>
                )}
                {result.hint && (
                  <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '3px' }}>
                    💡 {result.hint}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
