import React from 'react';

// Restored full palette. Labels kept as before.
const GATES = [
  { type: 'id', label: 'I', desc: 'Identity' },
  { type: 'h', label: 'H', desc: 'Hadamard' },
  { type: 'x', label: 'X', desc: 'Pauli-X' },
  { type: 'y', label: 'Y', desc: 'Pauli-Y' },
  { type: 'z', label: 'Z', desc: 'Pauli-Z' },
  { type: 's', label: 'S', desc: 'Phase' },
  { type: 'sdg', label: 'S†', desc: 'Phase†' },
  { type: 't', label: 'T', desc: 'T' },
  { type: 'tdg', label: 'T†', desc: 'T†' },
  { type: 'sx', label: '√X', desc: 'Sqrt-X' },
  { type: 'sxdg', label: '√X†', desc: 'Sqrt-X†' },
  { type: 'rx', label: 'RX', desc: 'Rotate-X' },
  { type: 'ry', label: 'RY', desc: 'Rotate-Y' },
  { type: 'rz', label: 'RZ', desc: 'Rotate-Z' },
  { type: 'cx', label: 'CX', desc: 'Controlled-X' },
  { type: 'cz', label: 'CZ', desc: 'Controlled-Z' },
  { type: 'ccx', label: 'CCX', desc: 'Toffoli' },
  { type: 'measure', label: 'M', desc: 'Measure' }
];

export default function GatePalette({ onDragStart, compact = false }) {
  return (
    <div className={`qt-panel qt-palette-panel ${compact ? 'qt-palette-compact' : ''}`}>
      <div className="qt-panel-title">Gate Palette</div>
      <div className="qt-palette">
        {GATES.map(g => (
          <div
            key={g.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/x-gate', g.type);
              onDragStart?.(g.type);
            }}
            className="qt-gate-btn"
            title={g.desc}
          >
            <span className="qt-gate-btn-main">{g.label}</span>
            <span className="qt-gate-btn-sub">{g.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}