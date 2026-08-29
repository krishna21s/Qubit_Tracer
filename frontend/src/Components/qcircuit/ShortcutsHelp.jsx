import React from 'react';
import { useCircuit } from '../../lib/circuitStore';
import { SHORTCUTS } from '../../lib/circuitKeybindings';

export default function ShortcutsHelp() {
  const { state, dispatch } = useCircuit();

  if (!state.shortcutsHelpOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
        }}
        onClick={() => dispatch({ type: 'SET_SHORTCUTS_HELP', open: false })}
      />
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        background: 'var(--qt-surface)',
        border: '1px solid var(--qt-border)',
        borderRadius: 12,
        padding: '24px 32px',
        width: 400,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        color: 'var(--qt-text)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Keyboard Shortcuts</h2>
          <button 
            className="qc-toolbar-btn" 
            onClick={() => dispatch({ type: 'SET_SHORTCUTS_HELP', open: false })}
          >
            ✕
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SHORTCUTS.map(sc => (
            <div key={sc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--qt-text-dim)' }}>{sc.desc}</span>
              <span style={{ 
                fontFamily: "'Space Grotesk', monospace", 
                fontSize: 12, fontWeight: 600,
                background: 'var(--qt-surface-alt)',
                padding: '4px 8px', borderRadius: 6,
                border: '1px solid var(--qt-border)',
              }}>
                {sc.key}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
