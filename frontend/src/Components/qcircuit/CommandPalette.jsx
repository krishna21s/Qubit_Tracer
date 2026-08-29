import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCircuit } from '../../lib/circuitStore';
import { getGateByShortcut, GATES } from '../../data/gateDefinitions';
import SearchIcon from '@mui/icons-material/Search';

export default function CommandPalette() {
  const { state, dispatch } = useCircuit();
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);
  
  const isOpen = state.commandPaletteOpen;

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const close = () => dispatch({ type: 'SET_COMMAND_PALETTE', open: false });

  // Generate actions
  const allActions = [
    // Tools
    { id: 'tool.select', group: 'Tools', label: 'Select Tool', desc: 'Select and move gates', action: () => dispatch({ type: 'SET_TOOL', tool: 'select' }) },
    { id: 'tool.pan', group: 'Tools', label: 'Pan Tool', desc: 'Pan the canvas', action: () => dispatch({ type: 'SET_TOOL', tool: 'pan' }) },
    { id: 'tool.erase', group: 'Tools', label: 'Erase Tool', desc: 'Click gates to delete', action: () => dispatch({ type: 'SET_TOOL', tool: 'erase' }) },
    
    // Circuit
    { id: 'circuit.add_qubit', group: 'Circuit', label: 'Add Qubit', desc: 'Append a new qubit wire', action: () => dispatch({ type: 'ADD_QUBIT' }) },
    { id: 'circuit.remove_qubit', group: 'Circuit', label: 'Remove Qubit', desc: 'Remove the last qubit wire', action: () => { if(state.qubits > 1) dispatch({ type: 'REMOVE_QUBIT' }); } },
    { id: 'circuit.clear', group: 'Circuit', label: 'Clear Circuit', desc: 'Delete all gates', action: () => dispatch({ type: 'SET_GATES', gates: [] }) },
    
    // Algorithms
    { id: 'algo.bell', group: 'Algorithms', label: 'Insert Bell State', desc: 'Create entanglement on q[0], q[1]', action: () => {
        dispatch({ type: 'SET_GATES', gates: [
          { id: 'bell_h', type: 'h', qubits: [0], time: 0 },
          { id: 'bell_cx', type: 'cx', qubits: [0, 1], time: 1 }
        ]});
    }},
    { id: 'algo.ghz', group: 'Algorithms', label: 'Insert GHZ State', desc: '3-qubit entanglement', action: () => {
        dispatch({ type: 'SET_GATES', gates: [
          { id: 'ghz_h', type: 'h', qubits: [0], time: 0 },
          { id: 'ghz_cx1', type: 'cx', qubits: [0, 1], time: 1 },
          { id: 'ghz_cx2', type: 'cx', qubits: [1, 2], time: 2 }
        ]});
    }},
  ];

  // Add gate insertions
  GATES.forEach(g => {
    allActions.push({
      id: `gate.${g.id}`,
      group: 'Insert Gate',
      label: `${g.name} Gate`,
      desc: `Place a ${g.name} gate on the circuit`,
      action: () => {
        dispatch({ type: 'SET_TOOL', tool: 'place' });
      }
    });
  });

  const filtered = allActions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase()) || 
    a.group.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        paddingTop: '12vh'
      }}
      onClick={close}
    >
      <div 
        style={{
          width: 600, maxWidth: '90%',
          background: 'var(--qt-surface)',
          border: '1px solid var(--qt-border)',
          borderRadius: 12,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'qcSlideUp 0.15s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--qt-border)' }}>
          <SearchIcon style={{ color: 'var(--qt-text-dim)', marginRight: 12 }} />
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--qt-text)', fontSize: 18, outline: 'none'
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter' && filtered.length > 0) {
                filtered[0].action();
                close();
              }
            }}
          />
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--qt-text-dim)' }}>
              No commands found.
            </div>
          )}
          {filtered.map((action, i) => (
            <div 
              key={action.id}
              onClick={() => { action.action(); close(); }}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                background: i === 0 ? 'var(--qt-surface-alt)' : 'transparent',
                borderLeft: i === 0 ? '3px solid var(--qt-accent)' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--qt-surface-alt)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = i === 0 ? 'var(--qt-surface-alt)' : 'transparent';
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--qt-text)' }}>{action.label}</div>
                <div style={{ fontSize: 12, color: 'var(--qt-text-dim)', marginTop: 4 }}>{action.desc}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--qt-text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 12 }}>
                {action.group}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
