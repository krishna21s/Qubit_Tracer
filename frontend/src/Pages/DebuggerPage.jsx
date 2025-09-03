import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import AdvancedInspectorPanel from '../components/debugger/AdvancedInspectorPanel';

export default function DebuggerPage() {
  const navigate = useNavigate();
  const { simulationResult } = useSimulation();
  // Allow navigation state fallback if you choose to push with state later
  const location = useLocation();
  const navResult = location.state?.simulationResult;
  const result = simulationResult || navResult;

  const qasm = result?.openqasm;
  const numQubits = result?.num_qubits || result?.numQubits || (result?.bloch_vectors?.length) || 0;

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 30% 20%, #0d2533, #06141d)',
      color: '#e6f4ff',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 28px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        marginBottom: 18,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#13364b',
            border: '1px solid #2d566b',
            padding: '8px 14px',
            borderRadius: 8,
            color: '#e0f5ff',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >← Back</button>
        <h2 style={{ margin: 0, fontWeight: 600, letterSpacing: 0.5 }}>Circuit Debugger</h2>
        {result && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 13,
            background: '#123041',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #254d60'
          }}>
            Qubits: {numQubits}
          </div>
        )}
      </div>

      {!result && (
        <div style={{
          padding: 26,
          border: '1px solid #254d60',
          borderRadius: 14,
          background: 'linear-gradient(150deg,#0e1a24,#102b3b)',
          maxWidth: 720
        }}>
          <h3 style={{ marginTop: 0 }}>No Simulation Loaded</h3>
          <p style={{ lineHeight: 1.5, fontSize: 14, color: '#9fb4c8' }}>
            Run a circuit on the Home page, then click the Debugger button to inspect it
            step by step here.
          </p>
        </div>
      )}

      {result && (
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 40 }}>
          <AdvancedInspectorPanel qasm={qasm} numQubits={numQubits} />
        </div>
      )}
    </div>
  );
}