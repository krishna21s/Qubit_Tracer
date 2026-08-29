import React from 'react';
import { useCircuit } from '../../lib/circuitStore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function TopBar({ 
  propsOpen, onToggleProps,
  codeOpen, onToggleCode 
}) {
  const { state, dispatch } = useCircuit();

  return (
    <div className="qc-topbar">
      <div className="qc-topbar-left">
        <div className="qc-circuit-title">Untitled Circuit</div>
      </div>
      
      <div className="qc-topbar-center">
        {/* Optional center controls */}
      </div>

      <div className="qc-topbar-right">
        {/* Action buttons */}
        <button 
          className={`qc-topbar-btn ${codeOpen ? 'active' : ''}`}
          onClick={onToggleCode}
          title="Code Panel"
        >
          <CodeIcon fontSize="small" />
        </button>

        <button 
          className={`qc-topbar-btn ${propsOpen ? 'active' : ''}`}
          onClick={onToggleProps}
          title="Properties Panel"
        >
          <SettingsIcon fontSize="small" />
        </button>

        <div className="qc-topbar-divider" />

        <button 
          className="qc-topbar-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_HELP' })}
          title="Keyboard Shortcuts (?)"
        >
          <HelpOutlineIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
}
