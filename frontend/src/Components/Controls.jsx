import React, { useState } from 'react';
import { simulateCircuit } from '../utils/api';

export default function Controls({ setResult, setLoading, loading }) {
  const [choice, setChoice] = useState('bell');
  const [qasm, setQasm] = useState('');

  const run = async () => {
    if (choice === 'custom' && !qasm.trim()) {
      alert("Please paste valid OpenQASM for custom circuits.");
      return;
    }

    setLoading(true);
    try {
      const payload = choice === 'custom'
        ? { type: 'custom', qasm }
        : { type: choice };

      const res = await simulateCircuit(payload);
      setResult(res);
    } catch (e) {
      console.error("API error", e);
      alert("API error: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          className={`btn ${choice === 'bell' ? 'active' : ''}`}
          onClick={() => setChoice('bell')}
        >
          Bell
        </button>
        <button
          className={`btn ${choice === 'ghz' ? 'active' : ''}`}
          onClick={() => setChoice('ghz')}
        >
          GHZ
        </button>
        <button
          className={`btn secondary ${choice === 'custom' ? 'active' : ''}`}
          onClick={() => setChoice('custom')}
        >
          Custom
        </button>
      </div>

      {choice === 'custom' && (
        <textarea
          className="textarea"
          placeholder="Paste OpenQASM here..."
          value={qasm}
          onChange={(e) => setQasm(e.target.value)}
          style={{ width: '100%', minHeight: 120 }}
        />
      )}

      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={run} disabled={loading}>
          {loading ? 'Simulating...' : 'Simulate'}
        </button>
        <button
          className="btn secondary"
          style={{ marginLeft: 8 }}
          onClick={() => {
            setResult(null);
            setQasm('');
            setChoice('bell');
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
