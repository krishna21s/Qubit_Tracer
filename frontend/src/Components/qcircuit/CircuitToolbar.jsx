import React from 'react';
import { useCircuit } from '../../lib/circuitStore';

export default function CircuitToolbar({ 
  paletteOpen, onTogglePalette, 
  propsOpen, onToggleProps,
  codeOpen, onToggleCode
}) {
  const { state, dispatch } = useCircuit();

  return (
    <div className="qc-toolbar">
      {/* Gate palette toggle */}
      <button
        className={`qc-toolbar-btn ${paletteOpen ? 'active' : ''}`}
        title="Gate Palette"
        onClick={onTogglePalette}
      >
        ⚛️
      </button>

      <div className="qc-toolbar-divider" />

      {/* Circuit name */}
      <input
        value={state.circuitName}
        onChange={e => dispatch({ type: 'SET_CIRCUIT_NAME', name: e.target.value })}
        style={{
          background: 'transparent',
          border: '1px solid transparent',
          borderRadius: 6,
          padding: '2px 8px',
          color: 'var(--qt-text)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'text',
          outline: 'none',
          minWidth: 120,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--qt-border)'}
        onBlur={e => e.target.style.borderColor = 'transparent'}
      />

      <div className="qc-toolbar-divider" />

      {/* Tool buttons */}
      <div className="qc-toolbar-section">
        {[
          { tool: 'select', icon: '⬚', label: 'Select (V)' },
          { tool: 'place',  icon: '⊞', label: 'Place Gate (G)' },
          { tool: 'erase',  icon: '⌫', label: 'Erase (E)' },
          { tool: 'pan',    icon: '✋', label: 'Pan (Space)' },
        ].map(t => (
          <button
            key={t.tool}
            className={`qc-toolbar-btn ${state.tool === t.tool ? 'active' : ''}`}
            title={t.label}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: t.tool })}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="qc-toolbar-divider" />

      {/* Edit buttons */}
      <div className="qc-toolbar-section">
        <button className="qc-toolbar-btn" title="Undo (Ctrl+Z)"
                onClick={() => dispatch({ type: 'UNDO' })}
                style={{ opacity: state.undoStack.length === 0 ? 0.3 : 1 }}>
          ↩
        </button>
        <button className="qc-toolbar-btn" title="Redo (Ctrl+Y)"
                onClick={() => dispatch({ type: 'REDO' })}
                style={{ opacity: state.redoStack.length === 0 ? 0.3 : 1 }}>
          ↪
        </button>
        <button className="qc-toolbar-btn" title="Delete Selected (Del)"
                onClick={() => dispatch({ type: 'DELETE_SELECTION' })}
                style={{ opacity: state.selection.length === 0 ? 0.3 : 1 }}>
          🗑
        </button>
      </div>

      <div className="qc-toolbar-divider" />

      {/* Circuit controls */}
      <div className="qc-toolbar-section">
        <button className="qc-toolbar-btn" title="Add Qubit"
                onClick={() => dispatch({ type: 'ADD_QUBIT' })}>
          +q
        </button>
        <button className="qc-toolbar-btn" title="Remove Qubit"
                onClick={() => dispatch({ type: 'REMOVE_QUBIT' })}
                style={{ opacity: state.qubits <= 1 ? 0.3 : 1 }}>
          −q
        </button>
        <span className="qc-toolbar-label">{state.qubits}q</span>
      </div>

      <div className="qc-toolbar-divider" />

      <div className="qc-toolbar-section">
        <button className="qc-toolbar-btn" title="Add Barrier"
                onClick={() => dispatch({ type: 'ADD_BARRIER' })}>
          ┃
        </button>
        <button className="qc-toolbar-btn" title="Measure All"
                onClick={() => dispatch({ type: 'MEASURE_ALL' })}>
          📊
        </button>
        <button className="qc-toolbar-btn" title="Clear Circuit"
                onClick={() => {
                  if (state.gates.length === 0 || window.confirm('Clear the entire circuit?')) {
                    dispatch({ type: 'CLEAR_CIRCUIT' });
                  }
                }}>
          ✕
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Zoom */}
      <div className="qc-toolbar-section">
        <button className="qc-toolbar-btn" title="Zoom Out"
                onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom - 0.15 })}>−</button>
        <span className="qc-toolbar-label">{Math.round(state.zoom * 100)}%</span>
        <button className="qc-toolbar-btn" title="Zoom In"
                onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom + 0.15 })}>+</button>
        <button className="qc-toolbar-btn" title="Fit View (F)"
                onClick={() => dispatch({ type: 'FIT_VIEW' })}>⊡</button>
      </div>

      <div className="qc-toolbar-divider" />

      <button
        className="qc-toolbar-btn"
        title="Keyboard Shortcuts (?)"
        onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_HELP' })}
      >
        ⌨️
      </button>

      <div className="qc-toolbar-divider" />

      {/* Code toggle */}
      <button
        className={`qc-toolbar-btn ${codeOpen ? 'active' : ''}`}
        title="View Code (QASM)"
        onClick={onToggleCode}
      >
        &lt;/&gt;
      </button>

      <div className="qc-toolbar-divider" />

      {/* Props toggle */}
      <button
        className={`qc-toolbar-btn ${propsOpen ? 'active' : ''}`}
        title="Properties Panel"
        onClick={onToggleProps}
      >
        ⚙️
      </button>
    </div>
  );
}
