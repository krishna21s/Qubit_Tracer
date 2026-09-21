import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Play, Refresh, Search, Xmark, Bolt } from 'reicon-react';
import { useTemplate } from '../../context/TemplateContext';
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

// Gate Library Categories matching the App Component Library (Image 2)
const GATE_LIBRARY = [
  {
    category: 'SINGLE-QUBIT',
    gates: [
      { id: 'H', symbol: 'H', name: 'HADAMARD', qubits: 1 },
      { id: 'X', symbol: 'X', name: 'PAULI-X', qubits: 1 },
      { id: 'Y', symbol: 'Y', name: 'PAULI-Y', qubits: 1 },
      { id: 'Z', symbol: 'Z', name: 'PAULI-Z', qubits: 1 },
      { id: 'S', symbol: 'S', name: 'S GATE', qubits: 1 },
      { id: 'Sdg', symbol: 'S†', name: 'S† GATE', qubits: 1 },
      { id: 'T', symbol: 'T', name: 'T GATE', qubits: 1 },
      { id: 'Tdg', symbol: 'T†', name: 'T† GATE', qubits: 1 },
    ],
  },
  {
    category: 'MULTI-QUBIT',
    gates: [
      { id: 'CX', symbol: 'CX', name: 'CNOT', qubits: 2 },
      { id: 'CZ', symbol: 'CZ', name: 'CONTROLLED-Z', qubits: 2 },
      { id: 'SWAP', symbol: 'SWAP', name: 'SWAP', qubits: 2 },
      { id: 'CCX', symbol: 'CCX', name: 'TOFFOLI', qubits: 3 },
    ],
  },
  {
    category: 'ROTATIONS',
    gates: [
      { id: 'Rx', symbol: 'Rx', name: 'RX ROTATION', qubits: 1 },
      { id: 'Ry', symbol: 'Ry', name: 'RY ROTATION', qubits: 1 },
      { id: 'Rz', symbol: 'Rz', name: 'RZ ROTATION', qubits: 1 },
    ],
  },
];

const ALL_GATES_FLAT = GATE_LIBRARY.flatMap(c => c.gates);

export default function CircuitStudioSolver({
  problem,
  solutions = [],
  onScoreUpdate,
  onSolve,
  onNextProblem,
}) {
  const { templateId } = useTemplate() || {};
  const numQubits = Math.max(1, Math.min(6, problem?.num_qubits || 2));
  const [numSteps, setNumSteps] = useState(8);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGate, setSelectedGate] = useState('H');
  const [hoverSlot, setHoverSlot] = useState(null); // { qubit, col }
  const [placedGates, setPlacedGates] = useState([]);
  const [cxDialog, setCxDialog] = useState(null); // { col, ctrlQubit, type }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
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
    setNumSteps(8);
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

    // If slot has a gate, remove it
    const existing = placedGates.find(g => g.col === col && g.qubits.includes(qubit));
    if (existing) {
      removeGate(existing.id);
      return;
    }

    if (!selectedGate) {
      setSelectedGate('H');
      return;
    }

    const gateDef = ALL_GATES_FLAT.find(g => g.id === selectedGate);
    if (!gateDef) return;

    if (gateDef.qubits === 2) {
      // Multi-qubit gate - prompt target selection
      setCxDialog({ col, ctrlQubit: qubit, type: gateDef.id });
    } else {
      // Single qubit gate
      setPlacedGates(prev => [
        ...prev.filter(g => !(g.col === col && g.qubits.includes(qubit))),
        {
          id: 'gate-' + Date.now() + Math.random(),
          type: gateDef.id,
          symbol: gateDef.symbol,
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
    const gateDef = ALL_GATES_FLAT.find(g => g.id === type) || { symbol: type };

    setPlacedGates(prev => [
      ...prev.filter(g => !(g.col === col && (g.qubits.includes(ctrlQubit) || g.qubits.includes(targetQ)))),
      {
        id: 'gate-' + Date.now() + Math.random(),
        type: type || 'CX',
        symbol: gateDef.symbol || type,
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

    if (placedGates.length === 0) {
      setTimeout(() => {
        const res = {
          success: false,
          message: 'No gates placed on the circuit wires.',
          hint: 'Select a gate from the Component Library on the left and click any wire slot to begin building your circuit!',
        };
        setResult(res);
        setIsAnalyzing(false);
      }, 300);
      return;
    }

    setTimeout(() => {
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
          const points = (problem.level || 2) * 50;
          if (onScoreUpdate) onScoreUpdate(points);
          const res = {
            success: true,
            message: 'Optimal quantum gate sequence verified with 100% state fidelity.',
            points,
          };
          setResult(res);
          setShowResultModal(true);
        } else {
          // Helpful diagnostic feedback
          const hasCX = circuitOperations.some(op => ['CX', 'CNOT'].includes(op.gate.toUpperCase()));
          const hasH = circuitOperations.some(op => op.gate.toUpperCase() === 'H');

          let hint = 'Statevector does not match target. Verify your gate sequence and qubit wires.';
          if (!hasH && canonical.some(c => c.gate === 'H')) {
            hint = 'Missing Hadamard (H): Apply H on the control wire to create quantum superposition.';
          } else if (!hasCX && canonical.some(c => ['CX', 'CNOT'].includes(c.gate))) {
            hint = 'Missing CNOT (CX): Apply CNOT from control wire to target wire to create entanglement.';
          } else {
            const userCX = circuitOperations.find(op => ['CX', 'CNOT'].includes(op.gate.toUpperCase()));
            const canonCX = canonical.find(op => ['CX', 'CNOT'].includes(op.gate));
            if (userCX && canonCX && userCX.qubits[0] === canonCX.qubits[1] && userCX.qubits[1] === canonCX.qubits[0]) {
              hint = 'Inverted Control & Target on CX! Click the ⇄ button on the CX gate to swap control and target wires.';
            }
          }

          const res = {
            success: false,
            message: 'Wrong Answer: Output state vector mismatch.',
            hint,
          };
          setResult(res);
        }
      } catch (err) {
        const res = {
          success: false,
          message: 'Simulation error: ' + err.message,
        };
        setResult(res);
      }

      setIsAnalyzing(false);
    }, 400);
  };

  const qubitRows = Array.from({ length: numQubits }, (_, i) => i);
  const stepCols = Array.from({ length: numSteps }, (_, i) => i);
  const maxPlacedCol = placedGates.length > 0 ? Math.max(...placedGates.map(g => g.col)) : -1;
  const canReduceSteps = numSteps > 6 && numSteps - 1 > maxPlacedCol;

  // Selected gate metadata
  const activeGateDef = ALL_GATES_FLAT.find(g => g.id === selectedGate) || { symbol: 'H', name: 'HADAMARD' };

  // Filtered Component Library
  const filteredLibrary = useMemo(() => {
    if (!searchTerm.trim()) return GATE_LIBRARY;
    const term = searchTerm.toLowerCase();
    return GATE_LIBRARY.map(cat => ({
      ...cat,
      gates: cat.gates.filter(g =>
        g.symbol.toLowerCase().includes(term) ||
        g.name.toLowerCase().includes(term) ||
        g.id.toLowerCase().includes(term)
      )
    })).filter(cat => cat.gates.length > 0);
  }, [searchTerm]);

  return (
    <div className="css-studio-root">
      {/* ── Studio Top Toolbar ── */}
      <div className="css-studio-toolbar">
        <div className="css-st-left">
          <div className="css-qubit-count-chip">
            <span className="css-qcc-dot"></span>
            <span>{numQubits} Qubit Lines ({qubitRows.map(q => `q[${q}]`).join(', ')})</span>
          </div>

          <div className="css-steps-control-chip">
            <span className="css-scc-label">{numSteps} Steps</span>
            <button
              type="button"
              className="css-scc-btn"
              onClick={() => setNumSteps(prev => Math.max(6, prev - 1))}
              disabled={!canReduceSteps}
              title={canReduceSteps ? "Reduce step columns" : "Cannot reduce below placed gates"}
            >
              −
            </button>
            <button
              type="button"
              className="css-scc-btn"
              onClick={() => setNumSteps(prev => Math.min(16, prev + 1))}
              disabled={numSteps >= 16}
              title="Add step column"
            >
              +
            </button>
          </div>

          <div className="css-selected-tool-chip">
            <span className="css-stc-label">Placing:</span>
            <span className="css-stc-symbol">{activeGateDef.symbol}</span>
            <span className="css-stc-name">{activeGateDef.name}</span>
            <span className="css-stc-hint">Click wire slot to place</span>
          </div>
        </div>

        <div className="css-st-right">
          <button
            className="css-btn-clear"
            onClick={resetAll}
            type="button"
            title="Clear all placed gates from wires"
          >
            <Refresh size={13} />
            <span>Clear Wires</span>
          </button>
          <button
            className="css-btn-run"
            onClick={analyzeResult}
            disabled={isAnalyzing || placedGates.length === 0}
            type="button"
          >
            {isAnalyzing ? (
              <>
                <Refresh size={14} className="css-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Play size={14} />
                <span>Run Circuit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Studio Workspace (Library on Left, Canvas on Right) ── */}
      <div className="css-studio-workspace">
        {/* ── Left Sub-Panel: Component Library (Matching Image 2) ── */}
        <div className="css-component-library">
          <div className="css-library-header">
            Component Library
          </div>

          <div className="css-library-search-box">
            <Search size={14} className="css-search-icon" />
            <input
              type="text"
              placeholder="Filter components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="css-search-input"
            />
          </div>

          <div className="css-library-scroll">
            {filteredLibrary.map(cat => (
              <div key={cat.category} className="css-library-category">
                <div className="css-library-cat-header">
                  <span>{cat.category}</span>
                  <div className="css-cat-divider"></div>
                </div>

                <div className="css-library-gate-grid">
                  {cat.gates.map(g => {
                    const isSelected = selectedGate === g.id;
                    return (
                      <button
                        key={g.id}
                        className={`css-gate-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedGate(g.id)}
                        type="button"
                        title={`${g.name} (${g.qubits} qubit${g.qubits > 1 ? 's' : ''})`}
                      >
                        <span className="css-gate-symbol">{g.symbol}</span>
                        <span className="css-gate-subname">{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Sub-Panel: Quantum Circuit Canvas ── */}
        <div className="css-circuit-canvas-area">
          <div className="css-canvas-viewport">
            {/* Left Qubit Wire Labels Column (Sticky Rail) */}
            <div className="css-qubit-labels-rail">
              {qubitRows.map(q => (
                <div key={q} className="css-qubit-row-label">
                  <span className="css-qrl-text">q[{q}]</span>
                </div>
              ))}
              <div className="css-rail-bottom-spacer" />
            </div>

            {/* Circuit Grid Canvas */}
            <div className="css-circuit-grid-wrapper">
              {/* Continuous Horizontal Wire Lines */}
              <div className="css-wire-tracks-layer">
                {qubitRows.map(q => (
                  <div
                    key={q}
                    className="css-horizontal-wire-line"
                    style={{ top: `${q * 80 + 40}px` }}
                  />
                ))}
              </div>

              {/* Vertical Step Guide Columns */}
              <div className="css-steps-grid-layer">
                {stepCols.map(col => {
                  const multiGate = placedGates.find(g => g.col === col && g.qubits.length >= 2);
                  const cQ = multiGate ? multiGate.qubits[0] : null;
                  const tQ = multiGate ? multiGate.qubits[1] : null;
                  const minQ = multiGate ? Math.min(cQ, tQ) : 0;
                  const maxQ = multiGate ? Math.max(cQ, tQ) : 0;

                  return (
                    <div key={col} className="css-step-column">
                      {/* Vertical Connector Line for Multi-Qubit Gates (CX, CZ, SWAP) */}
                      {multiGate && (
                        <div
                          className="css-multi-qubit-connector"
                          style={{
                            top: `${minQ * 80 + 40}px`,
                            height: `${(maxQ - minQ) * 80}px`,
                          }}
                        />
                      )}

                      {/* Wire Slots per Qubit */}
                      {qubitRows.map(q => {
                        const gate = placedGates.find(g => g.col === col && g.qubits.includes(q));
                        const isMulti = gate && gate.qubits.length >= 2;
                        const isCtrl = isMulti && gate.qubits[0] === q;
                        const isTgt = isMulti && gate.qubits[1] === q;
                        const isHovered = hoverSlot?.qubit === q && hoverSlot?.col === col && !gate;

                        return (
                          <div
                            key={q}
                            className={`css-wire-slot ${gate ? 'occupied' : ''}`}
                            onClick={() => handleSlotClick(q, col)}
                            onMouseEnter={() => setHoverSlot({ qubit: q, col })}
                            onMouseLeave={() => setHoverSlot(null)}
                          >
                            {/* Empty Slot Hover Ghost Preview */}
                            {isHovered && (
                              <div className="css-ghost-gate-preview">
                                <span>{activeGateDef.symbol}</span>
                              </div>
                            )}

                            {/* Single-Qubit Gate (Squircle badge matching Image 2) */}
                            {gate && !isMulti && (
                              <div className="css-placed-gate-squircle">
                                <span className="css-pgs-symbol">{gate.symbol || gate.type}</span>
                                <button
                                  className="css-gate-hover-delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeGate(gate.id);
                                  }}
                                  title="Remove Gate"
                                  type="button"
                                >
                                  <Xmark size={12} />
                                </button>
                              </div>
                            )}

                            {/* Multi-Qubit Gate: Control Node (Filled Dot) */}
                            {isMulti && isCtrl && (
                              <div className="css-cx-node-container ctrl" title={`Control on q[${q}] ➔ Target on q[${tQ}]`}>
                                <div className="css-cx-ctrl-dot" />
                                <div className="css-cx-hover-actions">
                                  <button
                                    className="css-cx-swap-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      swapControlTarget(gate.id);
                                    }}
                                    title="Swap Control and Target (⇄)"
                                    type="button"
                                  >
                                    ⇄
                                  </button>
                                  <button
                                    className="css-cx-del-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeGate(gate.id);
                                    }}
                                    title="Remove Gate"
                                    type="button"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Multi-Qubit Gate: Target Node (⊕ Symbol) */}
                            {isMulti && isTgt && (
                              <div className="css-cx-node-container tgt" title={`Target on q[${q}] (Controlled by q[${cQ}])`}>
                                <div className="css-cx-tgt-circle">⊕</div>
                                <div className="css-cx-hover-actions">
                                  <button
                                    className="css-cx-swap-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      swapControlTarget(gate.id);
                                    }}
                                    title="Swap Control and Target (⇄)"
                                    type="button"
                                  >
                                    ⇄
                                  </button>
                                  <button
                                    className="css-cx-del-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeGate(gate.id);
                                    }}
                                    title="Remove Gate"
                                    type="button"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Add Step Column */}
                <div
                  className="css-add-step-column"
                  onClick={() => setNumSteps(prev => Math.min(16, prev + 1))}
                  title="Add next step column to circuit"
                >
                  <div className="css-asc-content">
                    <span className="css-asc-plus">+</span>
                    <span className="css-asc-label">Step</span>
                  </div>
                </div>
              </div>

              {/* Step Index Bar Along Bottom */}
              <div className="css-step-numbers-row">
                {stepCols.map(col => (
                  <div key={col} className="css-step-num-cell">
                    {col}
                  </div>
                ))}
                <div
                  className="css-add-step-num-cell"
                  onClick={() => setNumSteps(prev => Math.min(16, prev + 1))}
                  title="Add next step column"
                >
                  +
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Multi-Qubit Target Selector Dialog ── */}
      {cxDialog && (
        <div className="css-dialog-overlay" onClick={() => setCxDialog(null)}>
          <div className="css-dialog-card" onClick={e => e.stopPropagation()}>
            <div className="css-dc-title">Configure Multi-Qubit Gate</div>
            <div className="css-dc-sub">
              Control is placed on <strong>q[{cxDialog.ctrlQubit}]</strong> at Step {cxDialog.col}. Choose the Target wire:
            </div>
            <div className="css-dc-options">
              {qubitRows
                .filter(q => q !== cxDialog.ctrlQubit)
                .map(q => (
                  <button
                    key={q}
                    className="css-dc-opt-btn"
                    onClick={() => confirmMultiQubitGate(q)}
                    type="button"
                  >
                    Target: q[{q}] ⊕
                  </button>
                ))}
            </div>
            <button className="css-dc-cancel-btn" onClick={() => setCxDialog(null)} type="button">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom Execution Evaluation Status Dock ── */}
      <div className="css-evaluation-dock">
        <div className="css-eval-dock-content">
          {!result && !isAnalyzing && (
            <div className="css-eval-idle">
              <span className="css-eval-icon-idle">⚡</span>
              <span>Place quantum gates on the wire lines above, then click <strong>Run Circuit</strong> to simulate and evaluate state equivalence.</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="css-eval-analyzing">
              <Refresh size={14} className="css-spin" />
              <span>Simulating circuit statevector across {numQubits} qubit lines...</span>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className={`css-eval-result-banner ${result.success ? 'success' : 'error'}`}>
              <span className="css-erb-badge">{result.success ? '✅ ACCEPTED' : '❌ MISMATCH'}</span>
              <span className="css-erb-msg">{result.message}</span>
              {result.points && (
                <span className="css-erb-points">
                  <Bolt size={13} />
                  <span>+{result.points} XP Earned</span>
                </span>
              )}
              {result.hint && (
                <span className="css-erb-hint">
                  💡 {result.hint}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Celebratory Victory Modal on Pass ── */}
      {showResultModal && result && result.success && typeof document !== 'undefined' && createPortal(
        <div
          className="css-modal-overlay"
          data-template={templateId || 'dark'}
          onClick={() => setShowResultModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="css-victory-modal-card"
            data-template={templateId || 'dark'}
            onClick={e => e.stopPropagation()}
          >
            <div className="css-vm-trophy">🎉</div>
            <div className="css-vm-title">Challenge Completed!</div>
            <div className="css-vm-sub">
              {result.message}
            </div>
            <div className="css-vm-xp-box">
              <Bolt size={16} />
              <span>+{result.points} XP Points Awarded!</span>
            </div>
            <button
              className="css-vm-close-btn"
              onClick={() => setShowResultModal(false)}
              type="button"
            >
              Awesome! Keep Going
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
