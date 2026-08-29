import React from 'react';
import { WandSparkle, Pointer, SquarePlus, Eraser, Hand, Layers, Undo, Redo } from 'reicon-react';

import { useCircuit } from '../../lib/circuitStore';

// MUI Icons (Assuming Material UI icons are installed as requested)
 // Select
 // Place
 // Erase
 // Pan
 // Components/Gates
 // AI Copilot

export default function PrimaryToolbar({ 
  paletteOpen, onTogglePalette, 
  aiOpen, onToggleAI 
}) {
  const { state, dispatch } = useCircuit();
  
  const setTool = (tool) => {
    dispatch({ type: 'SET_TOOL', tool });
  };

  const isActive = (toolName) => state.tool === toolName;

  return (
    <div className="qc-primary-toolbar">
      
      {/* Top tools section */}
      <div className="qc-pt-section">
        <button 
          className={`qc-pt-btn ${isActive('select') ? 'active' : ''}`}
          onClick={() => setTool('select')}
          title="Select Tool (V)"
        >
          <Pointer size={18} />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('place') ? 'active' : ''}`}
          onClick={() => setTool('place')}
          title="Place Tool (G)"
        >
          <SquarePlus size={18} />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('erase') ? 'active' : ''}`}
          onClick={() => setTool('erase')}
          title="Erase Tool (E)"
        >
          <Eraser size={18} />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('pan') ? 'active' : ''}`}
          onClick={() => setTool('pan')}
          title="Pan Tool (Space)"
        >
          <Hand size={18} />
        </button>
      </div>

      <div className="qc-pt-divider" />

      {/* Panels section */}
      <div className="qc-pt-section">
        <button 
          className={`qc-pt-btn ${paletteOpen ? 'active-panel' : ''}`}
          onClick={onTogglePalette}
          title="Component Library"
        >
          <Layers size={18} />
        </button>
        <button 
          className={`qc-pt-btn ${aiOpen ? 'active-panel' : ''}`}
          onClick={onToggleAI}
          title="Q-Pilot (AI Copilot)"
        >
          <WandSparkle size={18} />
        </button>
      </div>
      
      <div style={{ flex: 1 }} />
      
      {/* Undo/Redo section at bottom */}
      <div className="qc-pt-section">
        <button 
          className="qc-pt-btn"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.undoStack.length === 0}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>
        <button 
          className="qc-pt-btn"
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={state.redoStack.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
}
