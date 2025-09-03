import React, { useState } from 'react';

export default function GateParamEditor({ gate, onClose, onSave }) {
  const [theta, setTheta] = useState(gate?.params?.theta ?? Math.PI / 2);
  if (!gate) return null;
  const isRotation = ['rx', 'ry', 'rz'].includes(gate.type);
  if (!isRotation) return null;

  return (
    <div className="qt-modal-backdrop">
      <div className="qt-modal">
        <h3>Edit {gate.type.toUpperCase()} Parameters</h3>
        <div className="mb-2">
          <label>θ (radians)</label>
          <input
            type="number"
            step="0.0001"
            value={theta}
            onChange={e => setTheta(parseFloat(e.target.value))}
          />
        </div>
        <div className="qt-modal-actions">
          <button className="qt-btn" onClick={onClose}>Cancel</button>
          <button
            className="qt-btn primary"
            onClick={() => { onSave({ theta }); onClose(); }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}