import React, { useState, useMemo } from 'react';
import { Play, Settings, Code, Help, Download } from 'reicon-react';
import { useCircuit } from '../../lib/circuitStore';
import { circuitToQasm } from '../../utils/circuitToQasm';
import { simulateQCircuit } from '../../utils/api';
import { generateReportPDF } from '../../utils/PDFGenerator';

export default function TopBar({ 
  propsOpen, onToggleProps,
  codeOpen, onToggleCode 
}) {
  const { state, dispatch } = useCircuit();
  const [isSimulating, setIsSimulating] = useState(false);
  
  const qasmCode = useMemo(() => circuitToQasm(state), [state]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateQCircuit(qasmCode);
      res.openqasm = qasmCode;
      dispatch({ type: 'SET_SIMULATION_RESULT', result: res });
    } catch (err) {
      console.error(err);
      alert("Simulation failed: " + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!state.simulationResult) return;
    try {
      await generateReportPDF({ simulationResult: state.simulationResult });
    } catch (err) {
      console.error(err);
      alert("Failed to generate report.");
    }
  };

  return (
    <div className="qc-topbar">
      <div className="qc-topbar-left">
        <div className="qc-circuit-title">Untitled Circuit</div>
      </div>
      
      <div className="qc-topbar-center">
        {/* Optional center controls */}
      </div>

      <div className="qc-topbar-right">
        {/* Run Simulation */}
        <button 
          className="qc-toolbar-btn-primary"
          style={{ height: 28, fontSize: 12, padding: '0 12px', marginRight: 8, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={handleRunSimulation}
          disabled={isSimulating}
        >
          <Play size={12} />
          {isSimulating ? 'Running...' : 'Run Circuit'}
        </button>

        <button 
          className="qc-toolbar-btn"
          style={{ height: 28, padding: '0 8px', marginRight: 8, opacity: state.simulationResult ? 1 : 0.5 }}
          onClick={handleDownloadReport}
          disabled={!state.simulationResult}
          title="Download Report"
        >
          <Download size={14} />
        </button>
        <div className="qc-topbar-divider" style={{ marginRight: 8 }} />
        {/* Action buttons */}
        <button 
          className={`qc-topbar-btn ${codeOpen ? 'active' : ''}`}
          onClick={onToggleCode}
          title="Code Panel"
        >
          <Code size={18} />
        </button>

        <button 
          className={`qc-topbar-btn ${propsOpen ? 'active' : ''}`}
          onClick={onToggleProps}
          title="Properties Panel"
        >
          <Settings size={18} />
        </button>

        <div className="qc-topbar-divider" />

        <button 
          className="qc-topbar-btn"
          onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_HELP' })}
          title="Keyboard Shortcuts (?)"
        >
          <Help size={18} />
        </button>
      </div>
    </div>
  );
}
