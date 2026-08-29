import React, { useState } from 'react';
import { Search } from 'reicon-react';

import { useCircuit } from '../../lib/circuitStore';
import { getGateDef, GATE_CATEGORIES, GATES } from '../../data/gateDefinitions';

// Helper to convert internal gate types to clean display symbols
const getDisplaySymbol = (def) => {
  if (def.id === 'MEASURE') return 'M';
  if (def.id === 'BARRIER') return '|';
  if (def.id === 'IDENTITY') return 'I';
  if (def.id === 'PHASE') return 'P';
  return def.symbol || def.id;
};

export default function GatePalette({ onClose }) {
  const { dispatch } = useCircuit();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectGate = (gateType) => {
    dispatch({ type: 'SET_PLACE_GATE', gateType });
  };

  return (
    <>
      <div className="qc-palette-header">
        Component Library
      </div>
      
      <div style={{ padding: '12px 12px 0', position: 'relative' }}>
        <input 
          type="text" 
          className="qc-palette-search" 
          placeholder="Filter components..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 32, margin: 0 }}
        />
        <Search size={16} style={{ position: 'absolute', left: 24, top: 21, color: 'var(--qt-text-dim)' }} />
      </div>

      <div className="qc-palette-scroll">
        {GATE_CATEGORIES.map(cat => {
          // Filter gates by category and search term
          const gates = GATES.filter(def => {
            if (def.category !== cat.id) return false;
            return def.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   def.id.toLowerCase().includes(searchTerm.toLowerCase());
          }).map(def => def.id);

          if (gates.length === 0) return null;

          return (
            <div key={cat.id} className="qc-palette-category">
              <div className="qc-palette-cat-header">
                {cat.label}
              </div>
              <div className="qc-palette-grid">
                {gates.map(gType => {
                  const def = getGateDef(gType);
                  return (
                    <button 
                      key={gType} 
                      className="qc-gate-btn"
                      onClick={() => handleSelectGate(gType)}
                      title={`${def.name}\nShortcut: ${def.shortcut || 'None'}`}
                    >
                      <div className="qc-gate-btn-icon">
                        {getDisplaySymbol(def)}
                      </div>
                      <div className="qc-gate-btn-name">
                        {def.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
