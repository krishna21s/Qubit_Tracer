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
        setResult({ success: true, message: `✅ You have done correct! +${points} points`, points });
      } else {
        setResult({ success: false, message: '❌ You have done wrong. Try again!' });
      }
      setIsAnalyzing(false);
    }, 700);
  };

  const getLevelColor = (level) => {
    const colors = { 1: '#ff7b72', 2: '#3fb950', 3: '#58a6ff', 4: '#d2a8ff' };
    return colors[level] || '#58a6ff';
  };

  return (
    <div style={{ display: 'flex', height: '100%', gap: 12 }}>
      {/* Left: Problem description */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid var(--qt-border, #2a536a)',
          borderRadius: 12,
          background: 'var(--qt-surface, linear-gradient(145deg,#0f1e2a,#0b1a24))'
        }}
      >
        <div style={{ padding: 22 }}>
          <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                padding: '6px 10px',
                borderRadius: 12,
                color: getLevelColor(problem.level),
                border: `2px solid ${getLevelColor(problem.level)}66`,
                background: `${getLevelColor(problem.level)}20`,
                fontWeight: 700
              }}
              title={`Level ${problem.level}`}
            >
              Level {problem.level}
            </span>
            <span style={{ color: 'var(--qt-accent, #9fd2ff)', fontWeight: 700 }}>
              +{problem.level * 10} points
            </span>
          </div>

          <h1 style={{
            margin: '10px 0 12px',
            fontSize: 24,
            fontWeight: 800,
            backgroundImage: 'linear-gradient(90deg, var(--qt-text, #e8f2ff), var(--qt-accent, #58a6ff))',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>{problem.title}</h1>

          <div
            style={{
              border: '1px solid var(--qt-border, #2a536a)',
              background: 'var(--qt-surface-alt, rgba(15,35,55,0.5))',
              borderRadius: 14,
              padding: 14,
              marginBottom: 12
            }}
          >
            <div style={{ color: 'var(--qt-accent, #58a6ff)', fontWeight: 700, marginBottom: 8 }}>
              🧠 Problem Description
            </div>
            <div style={{ color: 'var(--qt-text, #d8ebf8)', lineHeight: 1.6, fontSize: 15 }}>
              {problem.description}
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--qt-border, #2a536a)',
              background: 'var(--qt-surface-alt, rgba(15,35,55,0.5))',
              borderRadius: 14,
              padding: 14
            }}
          >
            <div style={{ color: 'var(--qt-accent-alt, #3fb950)', fontWeight: 700, marginBottom: 8 }}>
              🎯 Instructions
            </div>
            <ul style={{ color: 'var(--qt-text, #cfefff)', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              <li>Use the circuit builder to add quantum gates</li>
              <li>Configure qubit indices for each gate</li>
              <li>Click "Analyze Result" to check your solution</li>
              <li>Use "Reset" to clear your circuit and start over</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right: Circuit builder */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ padding: 12, border: '1px solid var(--qt-border, #2a536a)', borderRadius: 12, background: 'var(--qt-surface-alt, rgba(16,40,56,0.5))' }}>
          <div style={{ color: 'var(--qt-accent, #58a6ff)', fontWeight: 800 }}>
            ⚙️ Circuit Builder
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12, border: '1px solid var(--qt-border, #2a536a)', borderRadius: 12, background: 'var(--qt-surface, linear-gradient(145deg,#0f1e2a,#0b1a24))' }}>
          {/* Gates */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: 'var(--qt-accent, #58a6ff)', fontWeight: 700, marginBottom: 8 }}>
              🧩 Available Gates
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', gap: 8 }}>
              {availableGates.map(gate => (
                <button
                  key={gate}
                  onClick={() => addGate(gate)}
                  style={{
                    background: 'var(--qt-surface-alt, linear-gradient(145deg,#132c3d,#0f2432))',
                    border: '1px solid var(--qt-border, #2a536a)',
                    color: 'var(--qt-text, #e6f6ff)',
                    borderRadius: 10,
                    padding: '10px 8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title={gate}
                >
                  {gate}
                </button>
              ))}
            </div>
          </div>

          {/* User circuit */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: 'var(--qt-accent-alt, #3fb950)', fontWeight: 700, marginBottom: 8 }}>
              🔧 Your Circuit
            </div>

            <div style={{ border: '1px solid var(--qt-border, #2a536a)', background: 'var(--qt-surface-alt, rgba(15,35,55,0.5))', borderRadius: 14, padding: 12, minHeight: 160 }}>
              {userCircuit.length === 0 ? (
                <div style={{ color: 'var(--qt-text-dim, #a9c8dd)', textAlign: 'center', padding: 18 }}>
                  No gates added yet. Start building your quantum circuit above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {userCircuit.map(op => (
                    <div
                      key={op.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        border: '1px solid var(--qt-border, #2a536a)',
                        background: 'var(--qt-surface, rgba(10,25,38,0.6))',
                        borderRadius: 12,
                        padding: 10
                      }}
                    >
                      <span style={{ width: 50, fontFamily: 'monospace', color: 'var(--qt-accent, #58a6ff)', fontWeight: 800, textAlign: 'center' }}>{op.gate}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <label style={{ color: 'var(--qt-text, #cfefff)', fontSize: 13 }}>Qubits:</label>
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
                            background: 'var(--qt-surface, #122636)',
                            border: '1px solid var(--qt-border, #355c72)',
                            color: 'var(--qt-text, #e6f6ff)',
                            borderRadius: 8,
                            padding: '6px 8px',
                            width: 80,
                            fontFamily: 'monospace'
                          }}
                          placeholder="0,1"
                        />
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <button
                          onClick={() => removeGate(op.id)}
                          style={{
                            background: 'linear-gradient(145deg,#3b1010,#4a1717)',
                            border: '1px solid #6a2a2a',
                            color: '#ffd7d7',
                            borderRadius: 10,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                          title="Delete gate"
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button
              onClick={analyzeResult}
              disabled={userCircuit.length === 0 || isAnalyzing}
              style={{
                background: 'var(--qt-button-primary, linear-gradient(135deg,#1779c2,#12649f))',
                border: '1px solid var(--qt-border, #2a536a)',
                color: 'var(--qt-button-contrast, #fff)',
                borderRadius: 12,
                padding: '10px 16px',
                cursor: userCircuit.length === 0 || isAnalyzing ? 'not-allowed' : 'pointer',
                fontWeight: 800
              }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Result'}
            </button>
            <button
              onClick={reset}
              style={{
                background: 'var(--qt-surface-alt, linear-gradient(135deg,#1d2f40,#162432))',
                border: '1px solid var(--qt-border, #2a536a)',
                color: 'var(--qt-text, #e6f6ff)',
                borderRadius: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 800
              }}
            >
              Reset
            </button>
          </div>

          {/* Analysis result */}
          {result && (
            <div
              style={{
                border: `1px solid ${result.success ? '#2ea043' : '#f85149'}66`,
                background: result.success
                  ? 'linear-gradient(145deg,#112b1d,#0e2318)'
                  : 'linear-gradient(145deg,#2c1310,#2a0f0c)',
                color: result.success ? '#bff3cf' : '#ffd1cc',
                borderRadius: 14,
                padding: 12,
                fontWeight: 700
              }}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemSolver;