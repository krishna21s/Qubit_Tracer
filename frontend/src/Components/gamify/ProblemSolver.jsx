import React, { useState, useEffect } from 'react';

function ProblemSolver({ problem, solutions, onScoreUpdate }) {
  const [userCircuit, setUserCircuit] = useState([]);
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setUserCircuit([]);
    setResult(null);
  }, [problem]);

  if (!problem) return null;

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
        setResult({ success: false, message: 'No solution found for this problem.' });
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
        const points = problem.level * 10;
        onScoreUpdate(points);
        setResult({ success: true, message: `Accepted. Runtime: 0 ms`, points });
      } else {
        setResult({ success: false, message: 'Wrong Answer' });
      }
      setIsAnalyzing(false);
    }, 700);
  };

  return (
    <div className="gf-container" style={{ padding: '0 16px 16px', height: '100%' }}>
      <div className="gf-workspace">
        {/* Left Pane: Problem Description */}
        <div className="gf-pane gf-pane-left">
          <div className="gf-pane-header">
            Description
          </div>
          <div className="gf-pane-content">
            <h1 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 12px 0' }}>
              {problem.title}
            </h1>
            <div className="gf-tags">
              <span className={`gf-tag gf-difficulty-${problem.level === 1 ? 'easy' : problem.level === 2 ? 'medium' : 'hard'}`}>
                {problem.level === 1 ? 'Easy' : problem.level === 2 ? 'Medium' : 'Hard'}
              </span>
              <span className="gf-tag">Quantum Circuits</span>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              {problem.description}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Instructions:</div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--gf-text-dim)' }}>
                <li>Use the circuit builder to add quantum gates.</li>
                <li>Configure qubit indices for each gate.</li>
                <li>Click "Run Code" to analyze your circuit against the expected state.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Pane: Workspace */}
        <div className="gf-pane gf-pane-right">
          {/* Editor Area */}
          <div className="gf-pane-right-top">
            <div className="gf-pane-header">
              Circuit Editor
            </div>
            <div className="gf-pane-content" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
              
              {/* Gate Palette */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gf-border)', background: 'var(--gf-surface-alt)' }}>
                <div style={{ fontSize: '12px', color: 'var(--gf-text-dim)', marginBottom: '8px' }}>Available Gates</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableGates.map(gate => (
                    <button
                      key={gate}
                      className="gf-btn gf-btn-secondary"
                      onClick={() => addGate(gate)}
                      style={{ padding: '4px 12px', fontFamily: 'monospace' }}
                    >
                      {gate}
                    </button>
                  ))}
                </div>
              </div>

              {/* Circuit Assembly */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                {userCircuit.length === 0 ? (
                  <div style={{ color: 'var(--gf-text-dim)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                    // Add gates from the palette above to build your circuit
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userCircuit.map((op, index) => (
                      <div
                        key={op.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'var(--gf-surface-alt)',
                          border: '1px solid var(--gf-border)',
                          borderRadius: '6px',
                          padding: '8px 12px'
                        }}
                      >
                        <span style={{ color: 'var(--gf-text-dim)', fontSize: '12px', width: '20px' }}>{index + 1}</span>
                        <span style={{ fontFamily: 'monospace', color: 'var(--gf-accent)', fontWeight: 600, width: '40px' }}>{op.gate}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--gf-text-dim)' }}>Qubits:</span>
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
                            style={{
                              background: 'var(--gf-surface)',
                              border: '1px solid var(--gf-border)',
                              color: 'var(--gf-text)',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              width: '80px',
                              fontFamily: 'monospace',
                              fontSize: '13px'
                            }}
                          />
                        </div>
                        <button
                          className="gf-btn"
                          onClick={() => removeGate(op.id)}
                          style={{ marginLeft: 'auto', padding: '4px 8px', color: 'var(--gf-hard)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Console / Output Area */}
          <div className="gf-pane-right-bottom">
            <div className="gf-pane-header" style={{ justifyContent: 'space-between' }}>
              <span>Test Results</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="gf-btn gf-btn-secondary" 
                  onClick={reset}
                >
                  Reset
                </button>
                <button 
                  className="gf-btn gf-btn-primary" 
                  onClick={analyzeResult}
                  disabled={userCircuit.length === 0 || isAnalyzing}
                >
                  {isAnalyzing ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>
            <div className="gf-pane-content" style={{ fontFamily: 'monospace', padding: '16px' }}>
              {!result && !isAnalyzing && (
                <span style={{ color: 'var(--gf-text-dim)' }}>Run your code to see the test results here.</span>
              )}
              {isAnalyzing && (
                <span style={{ color: 'var(--gf-text-dim)' }}>Judging...</span>
              )}
              {result && !isAnalyzing && (
                <div>
                  <h3 style={{ margin: '0 0 12px 0', color: result.success ? 'var(--gf-easy)' : 'var(--gf-hard)' }}>
                    {result.message}
                  </h3>
                  {result.success && (
                    <div style={{ color: 'var(--gf-text-dim)' }}>
                      Points awarded: +{result.points}
                    </div>
                  )}
                  {!result.success && (
                    <div style={{ background: 'rgba(248, 81, 73, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(248, 81, 73, 0.2)', color: '#ff7b72' }}>
                      Output state vector did not match expected state vector. Check your gate sequence and qubits.
                    </div>
                  )}
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