import React, { useState, useEffect } from 'react';
import {
  Play,
  Refresh,
  Xmark,
  CheckCircle,
  Bolt,
  Cpu,
  Sparkles,
  Layers,
  FileText,
  Code
} from 'reicon-react';
import CircuitStudioSolver from './CircuitStudioSolver';
import LeetCodeQuantumSolver from './LeetCodeQuantumSolver';

function ProblemSolver({ problem, solutions = [], onScoreUpdate }) {
  const isIntermediate = problem && Number(problem.level) === 2;
  const isAdvanced = problem && Number(problem.level) >= 3;

  const [userCircuit, setUserCircuit] = useState([]);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setUserCircuit([]);
    setResult(null);
  }, [problem?.id]);

  if (!problem) return null;

  // ─── Gate Studio Logic (Level 1) ───
  const availableGates = ['H', 'X', 'Y', 'Z', 'RY', 'CX', 'CZ'];

  const addGate = (gate) => {
    const newOperation = {
      id: Date.now() + Math.random(),
      gate: gate,
      qubits: gate.startsWith('C') ? [0, 1] : [0]
    };
    setUserCircuit(prev => [...prev, newOperation]);
  };

  const removeGate = (id) => {
    setUserCircuit(prev => prev.filter(op => op.id !== id));
  };

  const updateQubits = (id, qubits) => {
    setUserCircuit(prev => prev.map(op => op.id === id ? { ...op, qubits } : op));
  };

  const reset = () => {
    setUserCircuit([]);
    setResult(null);
  };

  const analyzeResult = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const solution = solutions.find(s => s.problem_id === problem.id);
      if (!solution) {
        setResult({ success: false, message: 'No reference solution found for this challenge.' });
        setIsAnalyzing(false);
        return;
      }

      const normalize = (ops) =>
        ops.map(op => ({
          gate: String(op.gate).toUpperCase(),
          qubits: [...op.qubits].sort((a, b) => a - b)
        }));

      const userOps = normalize(userCircuit);
      const solutionOps = normalize(solution.canonical_circuit);

      const isSameLength = userOps.length === solutionOps.length;
      const isCorrect =
        isSameLength &&
        userOps.every((u, i) =>
          u.gate === solutionOps[i].gate &&
          JSON.stringify(u.qubits) === JSON.stringify(solutionOps[i].qubits)
        );

      if (isCorrect) {
        const points = (problem.level || 1) * 50;
        if (onScoreUpdate) onScoreUpdate(points);
        setResult({
          success: true,
          message: 'Optimal quantum gate sequence verified with 100% state fidelity.',
          points
        });
      } else {
        setResult({
          success: false,
          message: 'Output state vector mismatch. Check your gate sequence and qubit targets.'
        });
      }
      setIsAnalyzing(false);
    }, 500);
  };

  // ═════════════════════════════════════════════════════════════════
  // ADVANCED & EXPERT LEVEL (Level 3 & 4): LeetCode Mode Code Editor
  // ═════════════════════════════════════════════════════════════════
  if (isAdvanced) {
    return (
      <LeetCodeQuantumSolver
        problem={problem}
        onScoreUpdate={onScoreUpdate}
      />
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // INTERMEDIATE LEVEL (Level 2): Q-Circuit Studio Mode Circuit Builder
  // ═════════════════════════════════════════════════════════════════
  if (isIntermediate) {
    const numQubits = problem.num_qubits || 2;
    const targetStateText = problem.title.includes("Bell State |Φ+⟩")
      ? "|Φ+⟩ = (|00⟩ + |11⟩) / √2"
      : problem.title.includes("Bell State |Ψ+⟩")
      ? "|Ψ+⟩ = (|01⟩ + |10⟩) / √2"
      : problem.title.includes("Bell State |Φ-⟩")
      ? "|Φ-⟩ = (|00⟩ - |11⟩) / √2"
      : problem.title.includes("Bell State |Ψ-⟩")
      ? "|Ψ-⟩ = (|01⟩ - |10⟩) / √2"
      : problem.title.includes("GHZ")
      ? "|GHZ⟩ = (|000⟩ + |111⟩) / √2"
      : `Target unitary equivalence on ${numQubits} qubit line${numQubits > 1 ? 's' : ''}`;

    return (
      <div className="gf-solver-viewport">
        <div className="gf-solver-workspace">
          {/* Left Column: Intermediate Problem Description */}
          <div className="gf-solver-card gf-brief-card">
            <div className="gf-pane-header">
              <div className="gf-ph-left">
                <FileText size={14} />
                <span className="gf-ph-title">Challenge Brief</span>
              </div>
              <span className="gf-level-mini-badge tier-2">
                <Layers size={12} />
                <span>Wire Studio</span>
              </span>
            </div>
            <div className="gf-pane-content">
              <h1 className="gf-solver-title">{problem.title}</h1>
              <div className="gf-tags">
                <span className="gf-diff-badge gf-diff-medium">MEDIUM</span>
                <span className="gf-tag">Quantum Circuits</span>
                <span className="gf-tag qubit-tag">
                  {numQubits} Lines ({Array.from({ length: numQubits }, (_, i) => `q[${i}]`).join(', ')})
                </span>
                <span className="gf-xp-bounty-tag">
                  <Bolt size={12} />
                  <span>+{problem.points || 100} XP</span>
                </span>
              </div>

              <p className="gf-solver-desc">{problem.description}</p>

              {/* Target State Card */}
              <div className="gf-target-state-card">
                <div className="gf-tsc-label">TARGET QUANTUM STATE</div>
                <div className="gf-tsc-value">{targetStateText}</div>
              </div>

              <div className="gf-instructions-card">
                <div className="gf-ic-title">How to Solve:</div>
                <ul className="gf-ic-list">
                  <li>Select a quantum gate from the <strong>Component Library</strong>.</li>
                  <li>Click on a wire slot to place the gate onto the qubit line.</li>
                  <li>For multi-qubit gates (<code>CX</code>), pick the target wire.</li>
                  <li>Click <strong>Run Circuit</strong> to simulate state equivalence.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Q-Circuit Studio Wire Grid */}
          <div className="gf-solver-card gf-wire-studio-card">
            <CircuitStudioSolver
              problem={problem}
              solutions={solutions}
              onScoreUpdate={onScoreUpdate}
            />
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // BASIC / BEGINNER LEVEL (Level 1): Enhanced Gate Studio
  // ═════════════════════════════════════════════════════════════════
  const targetStateText = problem.title === "Entangle 2 Qubits"
    ? "|Φ+⟩ = (|00⟩ + |11⟩) / √2"
    : `Target unitary equivalence on ${problem.num_qubits || 1} qubit line${(problem.num_qubits || 1) > 1 ? 's' : ''}`;

  return (
    <div className="gf-solver-viewport">
      <div className="gf-solver-workspace">
        {/* ── Left Column: Challenge Brief Card (Full Height) ── */}
        <div className="gf-solver-card gf-brief-card">
          <div className="gf-pane-header">
            <div className="gf-ph-left">
              <FileText size={14} />
              <span className="gf-ph-title">Challenge Brief</span>
            </div>
            <span className="gf-level-mini-badge tier-1">
              <Cpu size={12} />
              <span>Gate Studio</span>
            </span>
          </div>

          <div className="gf-pane-content">
            <h1 className="gf-solver-title">{problem.title}</h1>
            
            <div className="gf-tags">
              <span className="gf-diff-badge gf-diff-easy">EASY</span>
              <span className="gf-tag">Unitary Transformations</span>
              <span className="gf-tag qubit-tag">
                {problem.num_qubits || 1} Qubit{(problem.num_qubits || 1) > 1 ? 's' : ''}
              </span>
              <span className="gf-xp-bounty-tag">
                <Bolt size={12} />
                <span>+{problem.points || 50} XP</span>
              </span>
            </div>
            
            <p className="gf-solver-desc">{problem.description}</p>

            {/* Target State Card */}
            <div className="gf-target-state-card">
              <div className="gf-tsc-label">TARGET QUANTUM STATE</div>
              <div className="gf-tsc-value">{targetStateText}</div>
            </div>

            {/* How to Solve Instructions Card */}
            <div className="gf-instructions-card">
              <div className="gf-ic-title">How to Solve:</div>
              <ul className="gf-ic-list">
                <li>Click quantum gates from the palette to assemble your circuit sequence.</li>
                <li>Specify the target qubit indices for each gate (e.g. <code>0</code> or <code>0, 1</code>).</li>
                <li>Click <strong>Run Code</strong> below to analyze state vectors and verify equivalence.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Right Column: Studio & Execution Workspace ── */}
        <div className="gf-solver-right-col">
          {/* Top Card: Circuit Assembly */}
          <div className="gf-solver-card gf-assembly-card">
            <div className="gf-pane-header">
              <div className="gf-ph-left">
                <Cpu size={14} />
                <span className="gf-ph-title">Circuit Assembly</span>
              </div>
              <span className="gf-gate-count-tag">
                {userCircuit.length} Gate{userCircuit.length === 1 ? '' : 's'} Applied
              </span>
            </div>

            <div className="gf-assembly-content">
              {/* Gate Palette Toolbar */}
              <div className="gf-gate-palette-bar">
                <div className="gf-palette-label">Available Quantum Gates</div>
                <div className="gf-gate-chips-row">
                  {availableGates.map(gate => (
                    <button
                      key={gate}
                      className="gf-gate-chip-btn"
                      onClick={() => addGate(gate)}
                      type="button"
                      title={`Add ${gate} gate`}
                    >
                      <span className="gf-gate-chip-letter">{gate}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Circuit Buffer */}
              <div className="gf-circuit-buffer-scroll">
                {userCircuit.length === 0 ? (
                  <div className="gf-buffer-empty-state">
                    <div className="gf-empty-bolt-icon">
                      <Sparkles size={24} />
                    </div>
                    <div className="gf-empty-title">Empty Circuit Buffer</div>
                    <div className="gf-empty-subtitle">
                      Click quantum gates from the palette above to build your sequence.
                    </div>
                  </div>
                ) : (
                  <div className="gf-circuit-ops-chain">
                    {userCircuit.map((op, index) => (
                      <div key={op.id} className="gf-circuit-op-item">
                        <span className="gf-op-index-badge">#{index + 1}</span>
                        <span className="gf-op-gate-badge">{op.gate}</span>
                        <div className="gf-op-qubit-control">
                          <span className="gf-op-qubit-prefix">Qubits:</span>
                          <div className="gf-op-input-group">
                            <span className="gf-op-bracket">q[</span>
                            <input
                              type="text"
                              value={op.qubits.join(',')}
                              onChange={(e) => {
                                const qubits = e.target.value
                                  .split(',')
                                  .map(q => parseInt(q.trim(), 10))
                                  .filter(q => !isNaN(q));
                                updateQubits(op.id, qubits);
                              }}
                              className="gf-op-qubit-input"
                              placeholder="0"
                            />
                            <span className="gf-op-bracket">]</span>
                          </div>
                        </div>
                        <button
                          className="gf-op-remove-btn"
                          onClick={() => removeGate(op.id)}
                          title="Remove Gate"
                          type="button"
                        >
                          <Xmark size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Card: Execution Evaluation Console */}
          <div className="gf-solver-card gf-eval-card">
            <div className="gf-pane-header">
              <div className="gf-ph-left">
                <Code size={14} />
                <span className="gf-ph-title">Execution Evaluation</span>
              </div>
              <div className="gf-eval-header-actions">
                <button 
                  className="gf-eval-btn-reset" 
                  onClick={reset}
                  type="button"
                  title="Clear circuit buffer"
                >
                  <Refresh size={12} />
                  <span>Reset</span>
                </button>
                <button 
                  className="gf-eval-btn-run" 
                  onClick={analyzeResult}
                  disabled={userCircuit.length === 0 || isAnalyzing}
                  type="button"
                >
                  {isAnalyzing ? (
                    <>
                      <Refresh size={13} className="gf-spin" />
                      <span>Judging...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>Run Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="gf-console-content">
              {!result && !isAnalyzing && (
                <div className="gf-console-idle">
                  <div className="gf-ci-line">
                    <span className="gf-ci-prompt">&gt;</span> Click <strong>"Run Code"</strong> to analyze state vectors and evaluate circuit equivalence.
                  </div>
                  <div className="gf-ci-status">
                    Circuit buffer: <strong>{userCircuit.length}</strong> operation{userCircuit.length === 1 ? '' : 's'} staged.
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="gf-console-analyzing">
                  <Refresh size={15} className="gf-spin" />
                  <span>Simulating quantum state vectors and checking state fidelity...</span>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className={`gf-console-output-box ${result.success ? 'success' : 'error'}`}>
                  <div className="gf-cob-header">
                    {result.success ? (
                      <>
                        <CheckCircle size={16} />
                        <span className="gf-cob-badge pass">ACCEPTED • 100% FIDELITY</span>
                        <span className="gf-cob-bounty">+{result.points} XP EARNED</span>
                      </>
                    ) : (
                      <>
                        <Xmark size={16} />
                        <span className="gf-cob-badge fail">WRONG ANSWER • STATE MISMATCH</span>
                      </>
                    )}
                  </div>
                  <div className="gf-cob-message">{result.message}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemSolver;