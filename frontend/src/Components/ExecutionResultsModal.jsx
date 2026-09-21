import React, { useState, useEffect } from 'react';
import { Xmark } from 'reicon-react';
import CanvasPlaceholder from './CanvasPlaceholder';
import Inspector from './Inspector';
import AdvancedInspectorPanel from './debugger/AdvancedInspectorPanel';
import { createPortal } from 'react-dom';
import '../styles/dashboardCards.css';

export default function ExecutionResultsModal({ isOpen, onClose, result }) {
  const [activeModalTab, setActiveModalTab] = useState('bloch'); // 'bloch', 'inspector', 'debugger'

  useEffect(() => {
    if (isOpen) {
      // Trigger a resize event so Three.js renders to proper canvas dimensions
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    }
  }, [isOpen, activeModalTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        // If a higher-level modal (like the full-screen 3D viewer) is open, let it handle Escape
        if (document.querySelector('.MuiModal-root:not([aria-hidden="true"])')) {
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!result) return null;

  return createPortal(
    <div
      className={isOpen ? "dashboard-modal-backdrop" : ""}
      onClick={() => { if (isOpen && onClose) onClose(); }}
      style={isOpen ? { 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px', 
        boxSizing: 'border-box',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 9999
      } : {
        position: 'absolute',
        top: '-10000px',
        left: '-10000px',
        width: '1200px',
        height: '800px',
        visibility: 'visible',
        opacity: 0,
        pointerEvents: 'none'
      }}
    >
      <div
        className="dashboard-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          height: '100%', 
          maxWidth: 'none', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          background: 'var(--qt-surface)'
        }}
      >
        {/* Top Navbar */}
        <div style={{ display: 'flex', gap: '20px', padding: '16px 24px', borderBottom: '1px solid var(--qt-border)', alignItems: 'center', position: 'relative', zIndex: 10, background: 'var(--qt-surface)' }}>
          {['bloch', 'inspector', 'debugger'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveModalTab(tab)}
               style={{
                 background: 'transparent',
                 border: 'none',
                 color: activeModalTab === tab ? 'var(--qt-accent)' : 'var(--qt-text-dim)',
                 fontWeight: activeModalTab === tab ? 700 : 500,
                 fontSize: 14,
                 cursor: 'pointer',
                 borderBottom: activeModalTab === tab ? '2px solid var(--qt-accent)' : '2px solid transparent',
                 paddingBottom: 4
               }}
             >
               {tab === 'bloch' ? '3d Bloch Sphere' : tab === 'inspector' ? 'Inspector' : 'Debugger'}
             </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="dashboard-modal-close"
            title="Close"
            onClick={() => { if (onClose) onClose(); }}
          >
            <Xmark size={18} />
          </button>
        </div>

        <div className="dashboard-modal-inner" style={{ position: 'relative', inset: 'auto', flex: 1, overflow: 'auto', padding: activeModalTab === 'bloch' ? '0' : '24px' }}>
          
          <div className="dashboard-modal-canvas" style={{ 
            display: 'block', 
            position: activeModalTab === 'bloch' ? 'relative' : 'absolute',
            top: activeModalTab === 'bloch' ? 'auto' : '-10000px',
            opacity: activeModalTab === 'bloch' ? 1 : 0,
            height: '100%', 
            width: '100%',
            border: 'none' 
          }}>
            <CanvasPlaceholder result={result} />
          </div>
          
          <div style={{ 
            display: 'block', 
            position: activeModalTab === 'inspector' ? 'relative' : 'absolute',
            top: activeModalTab === 'inspector' ? 'auto' : '-10000px',
            opacity: activeModalTab === 'inspector' ? 1 : 0,
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            <Inspector result={result} sections={['qasm', 'bloch', 'density', 'probs', 'amps']} defaultOpen={{qasm:true, bloch:true, density:true, probs:true, amps:true}} />
          </div>
          
          <div style={{ 
            display: 'block', 
            position: activeModalTab === 'debugger' ? 'relative' : 'absolute',
            top: activeModalTab === 'debugger' ? 'auto' : '-10000px',
            opacity: activeModalTab === 'debugger' ? 1 : 0,
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            <AdvancedInspectorPanel qasm={result.openqasm} numQubits={result.num_qubits || result.numQubits || (result.bloch_vectors ? result.bloch_vectors.length : 2)} />
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
