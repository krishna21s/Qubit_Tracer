import React, { useState, useMemo, useEffect } from 'react';
import { Play, Settings, Code, Help, Download, Save, History, Image } from 'reicon-react';
import { useCircuit } from '../../lib/circuitStore';
import { circuitToQasm } from '../../utils/circuitToQasm';
import { simulateQCircuit, getApiBaseUrl } from '../../utils/api';
import { generateReportPDF } from '../../utils/PDFGenerator';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import html2canvas from 'html2canvas';
import { useSimulation } from '../../context/SimulationContext';

export default function TopBar({ 
  propsOpen, onToggleProps,
  codeOpen, onToggleCode,
  onToggleCollab,
  collabParticipants = [],
  collabConnected = false,
}) {
  const { state, dispatch } = useCircuit();
  const { updateSimulationResult } = useSimulation();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated, user, logout, token } = useAuth();
  const navigate = useNavigate();
  
  const qasmCode = useMemo(() => circuitToQasm(state), [state]);

  // Ensure 100% deduplicated participants for display
  const uniqueParticipants = useMemo(() => {
    const seen = new Set();
    return collabParticipants.filter(p => {
      if (!p || !p.user_id || seen.has(p.user_id)) return false;
      seen.add(p.user_id);
      return true;
    });
  }, [collabParticipants]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await simulateQCircuit(qasmCode);
      res.openqasm = qasmCode;
      dispatch({ type: 'SET_SIMULATION_RESULT', result: res });
      
      // Sync to global simulation context so OneQ Studio works
      updateSimulationResult(res);
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

  const handleDownloadCircuitImage = async () => {
    const element = document.querySelector('.qc-canvas-inner');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Quantum_Circuit_${new Date().getTime()}.png`;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Failed to download circuit image.");
    }
  };

  const handleSaveCircuit = async () => {
    if (!isAuthenticated) {
      alert('Please login to save circuits');
      navigate('/login');
      return;
    }
    
    setIsSaving(true);
    try {
      const API_URL = getApiBaseUrl();
      const circuitData = JSON.stringify(state);
      const response = await fetch(`${API_URL}/circuits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'My Circuit ' + new Date().toLocaleTimeString(),
          data: circuitData
        })
      });
      
      if (response.ok) {
        alert('Circuit saved successfully!');
      } else {
        const err = await response.json();
        alert('Failed to save: ' + (err.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error saving circuit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!isAuthenticated) {
      alert('Please login to view history');
      navigate('/login');
      return;
    }
    alert('History feature is currently being built. Stay tuned!');
  };

  return (
    <div className="qc-topbar">
      <div className="qc-topbar-left">
        <div className="qc-circuit-title">Untitled Circuit</div>
      </div>
      
      <div className="qc-topbar-center">
        {/* Active Collaborators */}
        {collabConnected && uniqueParticipants.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.7rem', border: '2px solid var(--qt-surface)' } }}>
              {uniqueParticipants.map((p, i) => (
                <Tooltip key={p.user_id || i} title={`${p.username}${p.user_id === user?.id ? ' (You)' : ''}`}>
                  <Avatar sx={{ bgcolor: p.color, width: 26, height: 26, fontSize: '0.7rem', fontWeight: 700 }}>
                    {p.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </div>
        )}
      </div>

      <div className="qc-topbar-right">
        {/* Collaborate Button */}
        <button 
          className={`qc-toolbar-btn ${collabConnected ? 'active' : ''}`}
          style={{ 
            height: 28, fontSize: 12, padding: '0 10px', marginRight: 4, 
            display: 'flex', alignItems: 'center', gap: 5,
            background: collabConnected ? 'rgba(76, 195, 250, 0.15)' : undefined,
            borderColor: collabConnected ? 'var(--qt-accent)' : undefined,
          }}
          onClick={onToggleCollab}
          title="Collaborate"
        >
          <GroupsIcon sx={{ fontSize: 16 }} />
          Collaborate
        </button>
        
        <div className="qc-topbar-divider" style={{ marginRight: 8 }} />

        {/* Save & History */}
        <button 
          className="qc-toolbar-btn"
          style={{ height: 28, fontSize: 12, padding: '0 8px', marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={handleSaveCircuit}
          disabled={isSaving}
          title="Save Circuit"
        >
          <Save size={14} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <button 
          className="qc-toolbar-btn"
          style={{ height: 28, fontSize: 12, padding: '0 8px', marginRight: 8, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={handleLoadHistory}
          title="Circuit History"
        >
          <History size={14} /> History
        </button>
        
        <div className="qc-topbar-divider" style={{ marginRight: 8 }} />

        {/* Run Simulation */}
        <button 
          className="qc-toolbar-btn-primary"
          style={{ height: 28, fontSize: 12, padding: '0 12px', marginRight: 8, display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={handleRunSimulation}
          disabled={isSimulating}
        >
          <Play size={12} />
          {isSimulating ? 'Running...' : 'Run'}
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

        <button 
          className="qc-toolbar-btn"
          style={{ height: 28, padding: '0 8px', marginRight: 8, opacity: state.simulationResult ? 1 : 0.5 }}
          onClick={handleDownloadCircuitImage}
          disabled={!state.simulationResult}
          title="Download Circuit Image"
        >
          <Image size={14} />
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
