import React, { useState, useEffect } from 'react';
import { simulateCircuit } from '../utils/api';
import { normalizeToQASM2 } from '../utils/qasmIncremental';
import CircuitBuilderModal from './circuit/CircuitBuilderModal';
import { useSimulation } from '../context/SimulationContext'; // context-based result storage

/**
 * Controls
 * - Uses SimulationContext for the active simulation result.
 
 * - Keeps existing UI & modal builder.
 */
export default function Controls({
  setLoading,
  loading
}) {
  const { updateSimulationResult } = useSimulation();

  const [choice, setChoice] = useState('bell');          // 'bell' | 'ghz' | 'custom'
  const [templateQasm, setTemplateQasm] = useState('');
  const [workingQasm, setWorkingQasm] = useState('');
  const [savedBuilderQasm, setSavedBuilderQasm] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);

  // Load template circuits when user explicitly selects bell/ghz
  useEffect(() => {
    if (choice === 'bell') {
      const bell = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
h q[0];
cx q[0],q[1];`;
      setTemplateQasm(bell);
      setWorkingQasm(bell);
      setSavedBuilderQasm(bell);
    } else if (choice === 'ghz') {
      const ghz = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
h q[0];
cx q[0],q[1];
cx q[0],q[2];`;
      setTemplateQasm(ghz);
      setWorkingQasm(ghz);
      setSavedBuilderQasm(ghz);
    }
    // For 'custom' we do NOT overwrite existing builder state
  }, [choice]);

  // Determine which QASM to use when simulating
  const computeActiveQasm = () => {
    if (choice === 'custom') {
      return savedBuilderQasm || workingQasm || templateQasm;
    }
    return templateQasm;
  };

  const run = async () => {
    const active = computeActiveQasm();
    if (!active || !active.trim()) {
      alert('No OpenQASM to simulate.');
      return;
    }

    setLoading(true);
    try {
      // Build payload based on circuit type
      let payload;
      if (choice === 'custom') {
        // Normalize QASM2 for custom circuits before sending to backend
        const normalizedQasm = normalizeToQASM2(active);
        payload = { type: 'custom', qasm: normalizedQasm };
        
        // Update the saved state with normalized QASM for consistency
        setSavedBuilderQasm(normalizedQasm);
        setWorkingQasm(normalizedQasm);
      } else {
        // backend recognizes 'bell' / 'ghz' without needing QASM body
        payload = { type: choice };
      }

      const res = await simulateCircuit(payload);
      console.log('[Controls] simulateCircuit result:', res);

      if (updateSimulationResult) {
        updateSimulationResult(res);
      }  

    } catch (e) {
      console.error('API error', e);
      alert('API error: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (updateSimulationResult) updateSimulationResult(null);
    

    setTemplateQasm('');
    setWorkingQasm('');
    setSavedBuilderQasm('');
    setChoice('bell'); // re-seeds bell template via effect
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          className={`btn ${choice === 'bell' ? 'active' : ''}`}
          onClick={() => setChoice('bell')}
          disabled={loading}
        >
          Bell
        </button>
        <button
          className={`btn ${choice === 'ghz' ? 'active' : ''}`}
          onClick={() => setChoice('ghz')}
          disabled={loading}
        >
          GHZ
        </button>
        <button
          className={`btn secondary ${choice === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setChoice('custom');
            setBuilderOpen(true);
          }}
          disabled={loading}
        >
          Custom Builder
        </button>
      </div>

      {choice === 'custom' && !builderOpen && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#85b7ce' }}>
          Custom circuit ready. Re-open builder to continue editing.
          <div style={{ marginTop: 6 }}>
            <button
              className="btn secondary"
              onClick={() => setBuilderOpen(true)}
              disabled={loading}
            >
              Re-open Builder
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button className="btn" onClick={run} disabled={loading}>
          {loading ? 'Simulating...' : 'Simulate'}
        </button>
        <button
          className="btn secondary"
          style={{ marginLeft: 8 }}
          onClick={resetAll}
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {/* Modal builder (unchanged UI) */}
      <CircuitBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        workingQasm={workingQasm}
        setWorkingQasm={setWorkingQasm}
        onApply={(finalQasm) => {
          setSavedBuilderQasm(finalQasm);
          setWorkingQasm(finalQasm);
          setChoice('custom');
        }}
      />
    </div>
  );
}