import React from 'react';
import { useCircuit } from '../../lib/circuitStore';
import { getGateDef, formatAngle } from '../../data/gateDefinitions';

export default function PropertyPanel() {
  const { state, dispatch } = useCircuit();

  const selectedGate = state.selection.length === 1
    ? state.gates.find(g => g.id === state.selection[0])
    : null;

  if (state.selection.length === 0) {
    return (
      <div className="qc-props">
        <div className="qc-props-header">Properties</div>
        <div className="qc-props-empty">
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🎯</div>
          <div>Select a gate to edit</div>
          <div style={{ marginTop: 16, textAlign: 'left' }}>
            <div className="qc-props-label">Circuit Summary</div>
            <div className="qc-props-row">
              <span>Qubits</span>
              <span className="qc-props-value">{state.qubits}</span>
            </div>
            <div className="qc-props-row">
              <span>Gates</span>
              <span className="qc-props-value">{state.gates.length}</span>
            </div>
            <div className="qc-props-row">
              <span>Depth</span>
              <span className="qc-props-value">
                {state.gates.length > 0 ? Math.max(...state.gates.map(g => g.col)) + 1 : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.selection.length > 1) {
    return (
      <div className="qc-props">
        <div className="qc-props-header">Properties</div>
        <div className="qc-props-empty">
          <div>{state.selection.length} gates selected</div>
          <button className="qc-toolbar-btn-primary"
            style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            onClick={() => dispatch({ type: 'DELETE_SELECTION' })}>
            🗑 Delete All
          </button>
        </div>
      </div>
    );
  }

  const def = getGateDef(selectedGate.type);

  return (
    <div className="qc-props">
      <div className="qc-props-header">Properties</div>

      <div className="qc-props-section" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 8,
          background: `${def?.color || '#4cc3fa'}22`,
          color: def?.color || '#4cc3fa',
          fontWeight: 700, fontSize: 16,
          fontFamily: "'Space Grotesk', monospace",
        }}>
          {def?.symbol || '?'}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{def?.name || selectedGate.type}</div>
          <div style={{ fontSize: 11, color: 'var(--qt-text-dim)' }}>{def?.tooltip || ''}</div>
        </div>
      </div>

      <div className="qc-props-section">
        <div className="qc-props-label">Position</div>
        <div className="qc-props-row">
          <span>Qubit(s)</span>
          <span className="qc-props-value">{selectedGate.qubits.map(q => `q[${q}]`).join(', ')}</span>
        </div>
        <div className="qc-props-row">
          <span>Time Step</span>
          <span className="qc-props-value">{selectedGate.col}</span>
        </div>
      </div>

      {def?.params && def.params.length > 0 && (
        <div className="qc-props-section">
          <div className="qc-props-label">Parameters</div>
          {def.params.map(p => {
            const val = selectedGate.params?.[p.name] ?? p.default;
            return (
              <div key={p.name} style={{ marginBottom: 8 }}>
                <div className="qc-props-row">
                  <span>{p.label || p.name}</span>
                  <span className="qc-props-value">{formatAngle(val)}</span>
                </div>
                <input
                  type="range"
                  min={p.min || 0}
                  max={p.max || 2 * Math.PI}
                  step={p.step || 0.01}
                  value={val}
                  onChange={e => {
                    dispatch({
                      type: 'UPDATE_GATE',
                      id: selectedGate.id,
                      patch: { params: { ...selectedGate.params, [p.name]: parseFloat(e.target.value) } },
                    });
                  }}
                  style={{ width: '100%', accentColor: 'var(--qt-accent)' }}
                />
              </div>
            );
          })}
        </div>
      )}

      {def?.matrix && (
        <div className="qc-props-section">
          <div className="qc-props-label">Matrix</div>
          <div style={{
            fontFamily: "'Space Grotesk', monospace", fontSize: 11,
            color: 'var(--qt-text-dim)', padding: '6px 8px',
            background: 'var(--qt-surface)', borderRadius: 6,
          }}>
            {def.matrix}
          </div>
        </div>
      )}

      <div className="qc-props-section">
        <button className="qc-toolbar-btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => dispatch({ type: 'REMOVE_GATE', id: selectedGate.id })}>
          🗑 Delete Gate
        </button>
      </div>
    </div>
  );
}
