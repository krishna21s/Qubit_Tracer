import React, { useState, useEffect } from 'react';
import { simulateCircuit } from '../utils/api';
import CircuitBuilderModal from './circuit/CircuitBuilderModal';

/**
 * Controls with persistent Custom Builder state.
 * - workingQasm: live unsaved edits inside builder (persists even if user closes modal without Apply).
 * - savedBuilderQasm: the version last "Applied" (used for simulation when in custom mode).
 */
export default function Controls({ setResult, setLoading, loading }) {
  const [choice, setChoice] = useState('bell');      // 'bell' | 'ghz' | 'custom'
  const [templateQasm, setTemplateQasm] = useState(''); // last loaded template text
  const [workingQasm, setWorkingQasm] = useState('');   // live builder edits (persistent)
  const [savedBuilderQasm, setSavedBuilderQasm] = useState(''); // applied QASM from builder
  const [builderOpen, setBuilderOpen] = useState(false);

  // Load templates ONLY when user selects bell/ghz explicitly.
  useEffect(() => {
    if (choice === 'bell') {
      const bell = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
h q[0];
cx q[0],q[1];`;
      setTemplateQasm(bell);
      // Overwrite builder states because user intentionally selected new template
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
    // NOTE: When choice === 'custom' we DO NOT touch workingQasm or savedBuilderQasm
  }, [choice]);

  // Determine active QASM used for simulation
  const computeActiveQasm = () => {
    if (choice === 'custom') {
      // If user hasn't applied yet, we still simulate the live workingQasm (so it "just works")
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
      const payload = { type: 'custom', qasm: active };
      const res = await simulateCircuit(payload);
      setResult(res);
    } catch (e) {
      console.error('API error', e);
      alert('API error: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setTemplateQasm('');
    setWorkingQasm('');
    setSavedBuilderQasm('');
    setChoice('bell'); // will re-load Bell template via effect
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
            // Switch to custom without resetting existing workingQasm
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

      {/* Modal: passes workingQasm for live edits; apply sets savedBuilderQasm */}
      <CircuitBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        workingQasm={workingQasm}
        setWorkingQasm={setWorkingQasm}
        onApply={(finalQasm) => {
          setSavedBuilderQasm(finalQasm);
          setWorkingQasm(finalQasm); // keep them aligned after apply
          setChoice('custom');
        }}
      />
    </div>
  );
}