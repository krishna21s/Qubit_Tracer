import React, { useState } from 'react';
import { useCircuit } from '../../lib/circuitStore';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../../context/SimulationContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import CanvasPlaceholder from '../CanvasPlaceholder';
import { createPortal } from 'react-dom';

export default function ResultsDock() {
  const { state, dispatch } = useCircuit();
  const navigate = useNavigate();
  const { updateSimulationResult, setShouldAutoOpenViewer } = useSimulation();
  const [isMaximized, setIsMaximized] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);

  if (!state.simulationResult) return null;

  const res = state.simulationResult;

  const probData = Object.entries(res.probabilities || {}).map(([stateKey, prob]) => ({
    name: `|${stateKey}⟩`,
    probability: (prob * 100).toFixed(1),
    rawProb: prob
  })).sort((a, b) => b.rawProb - a.rawProb);

  const handleInspect = () => {
    updateSimulationResult(res);
    setShouldAutoOpenViewer(true);
    navigate('/inspector');
  };

  const dockStyle = isMaximized ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    background: 'var(--qt-surface)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'qcSlideUp 0.2s ease',
  } : {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 450,
    background: 'var(--qt-surface)',
    borderTop: '1px solid var(--qt-border)',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
    animation: 'qcSlideUp 0.2s ease',
  };

  return (
    <div style={dockStyle}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '1px solid var(--qt-border)',
        background: 'var(--qt-surface-alt)',
      }}>
        <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          Simulation Results
          <button 
            onClick={handleInspect}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--qt-accent)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '6px 12px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,229,255,0.2)'
            }}
          >
            <SearchIcon fontSize="small" /> Open in Inspector
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="qc-toolbar-btn" 
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore Size" : "Maximize"}
          >
            {isMaximized ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </button>
          <button 
            className="qc-toolbar-btn" 
            onClick={() => dispatch({ type: 'SET_SIMULATION_RESULT', result: null })}
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', padding: '16px', gap: '16px' }}>
        
        {/* Left: Probabilities Chart */}
        <section className="qt-tmpl-panel dashboard-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
          <h3 className="dashboard-panel-title">State Probabilities</h3>
          <div style={{ flex: 1, minHeight: 0, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--qt-text-dim)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--qt-text-dim)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)', borderRadius: 8, color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Probability']}
                />
                <Bar dataKey="probability" fill="var(--qt-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Right: Bloch Sphere Visualization */}
        <section className="qt-tmpl-panel dashboard-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
          <h3 className="dashboard-panel-title">Quantum State Visualization</h3>
          <p className="dashboard-panel-text" style={{ marginBottom: 12 }}>
            Interactive Bloch sphere representation of your quantum states.
          </p>
          <div className="qt-tmpl-bloch-embed dashboard-bloch-embed" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <CanvasPlaceholder result={res} />
            <button
              type="button"
              className="qt-icon-btn dashboard-bloch-fullscreen"
              title="Full screen viewer"
              onClick={() => setViewerModalOpen(true)}
            >
              <ZoomOutMapIcon fontSize="small" />
            </button>
          </div>
        </section>

      </div>

      {/* Full-screen viewer Modal */}
      {viewerModalOpen && createPortal(
        <div
          className="dashboard-modal-backdrop"
          onClick={() => setViewerModalOpen(false)}
        >
          <div
            className="dashboard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="qt-icon-btn dashboard-modal-close"
              title="Close"
              onClick={() => setViewerModalOpen(false)}
            >
              <CloseIcon />
            </button>
            <div className="dashboard-modal-inner">
              <div className="dashboard-modal-canvas">
                <CanvasPlaceholder result={res} />
                <span className="dashboard-modal-label">
                  Quantum State Visualization - Full Screen
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
