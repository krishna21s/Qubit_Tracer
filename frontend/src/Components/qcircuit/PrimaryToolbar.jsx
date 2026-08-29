import React from 'react';
import { useCircuit } from '../../lib/circuitStore';

// MUI Icons (Assuming Material UI icons are installed as requested)
import NearMeIcon from '@mui/icons-material/NearMe'; // Select
import AddBoxIcon from '@mui/icons-material/AddBox'; // Place
import BackspaceIcon from '@mui/icons-material/Backspace'; // Erase
import PanToolIcon from '@mui/icons-material/PanTool'; // Pan
import ExtensionIcon from '@mui/icons-material/Extension'; // Components/Gates
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; // AI Copilot
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

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
          <NearMeIcon fontSize="small" />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('place') ? 'active' : ''}`}
          onClick={() => setTool('place')}
          title="Place Tool (G)"
        >
          <AddBoxIcon fontSize="small" />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('erase') ? 'active' : ''}`}
          onClick={() => setTool('erase')}
          title="Erase Tool (E)"
        >
          <BackspaceIcon fontSize="small" />
        </button>
        <button 
          className={`qc-pt-btn ${isActive('pan') ? 'active' : ''}`}
          onClick={() => setTool('pan')}
          title="Pan Tool (Space)"
        >
          <PanToolIcon fontSize="small" />
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
          <ExtensionIcon fontSize="small" />
        </button>
        <button 
          className={`qc-pt-btn ${aiOpen ? 'active-panel' : ''}`}
          onClick={onToggleAI}
          title="Q-Pilot (AI Copilot)"
        >
          <AutoAwesomeIcon fontSize="small" />
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
          <UndoIcon fontSize="small" />
        </button>
        <button 
          className="qc-pt-btn"
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={state.redoStack.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <RedoIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
