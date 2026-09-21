// Added modal full-screen viewer after simulation + embedded minimized viewer with expand button
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import CanvasPlaceholder from '../Components/CanvasPlaceholder';
import Inspector from '../Components/Inspector';
import Controls from '../Components/Controls';
import QuantumBotAssistant from '../Components/QuantumBotAssistant';
import ProbabilityDistribution from '../Components/ProbabilityDistribution';
import AmplitudesTable from '../Components/AmplitudesTable';
import AnalysisPanel from '../Components/AnalysisPanel';
import ExportButton from '../Components/ExportButton';
import { useSimulation } from '../context/SimulationContext';

// MUI (install if not present: npm i @mui/material @emotion/react @emotion/styled)
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState('');

  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [userClosedModal, setUserClosedModal] = useState(false);

  const blochSpheresRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const amplitudesTableRef = useRef(null);
  const amplitudeWavesRef = useRef(null);

  const navigate = useNavigate();
  const { updateSimulationResult } = useSimulation();

  // When simulation result changes, open modal (unless user intentionally just closed it very recently)
  useEffect(() => {
    if (result) {
      updateSimulationResult(result);
      setViewerModalOpen(true);
      setUserClosedModal(false);
    }
  }, [result, updateSimulationResult]);

  const handleSimResult = (r) => {
    setResult(r);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">Qubit-Tracer</div>
        <div className="hint">Interactive Quantum State Visualizer — prototype</div>
        <Controls setResult={handleSimResult} setLoading={setLoading} loading={loading} />

        <div style={{ marginTop: 12 }} className="card">
          <div style={{ fontSize: 13, color: '#9fb4c8' }}>Tips</div>
          <div className="field">Try Bell / GHZ or build a custom circuit.</div>
        </div>

        <AnalysisPanel
          simulationResult={result}
          onAnalysisComplete={setAnalysisText}
        />

        <ExportButton
          simulationResult={result}
          analysisText={analysisText}
          blochSpheresRef={blochSpheresRef}
          probabilityChartRef={probabilityChartRef}
          amplitudesTableRef={amplitudesTableRef}
          amplitudeWavesRef={amplitudeWavesRef}
        />

        <div className='bot button'>
          <QuantumBotAssistant />
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div style={{ color: '#9fb4c8' }}>
            Backend: <strong style={{ color: '#cfefff' }}>POST /simulate</strong>
          </div>
          <div style={{ color: '#7fb5d9' }}>
            Status: {loading ? 'Running simulation...' : 'Idle'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button
              className="btn secondary"
              onClick={() => navigate('/debugger')}
              disabled={!result}
              title={result ? 'Open step-by-step debugger' : 'Run a simulation first'}
            >
              Debugger
            </button>
          </div>
        </div>

        <div className="canvasRow">
          <div
            className="canvasWrap"
            ref={blochSpheresRef}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {/* After user closes full-screen modal, show compact embedded viewer + expand button */}
            <CanvasPlaceholder result={result} compact />
            {result && (
              <IconButton
                size="small"
                onClick={() => setViewerModalOpen(true)}
                title="Full screen viewer"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  '&:hover': { background: 'rgba(0,0,0,0.5)' }
                }}
              >
                <ZoomOutMapIcon fontSize="inherit" />
              </IconButton>
            )}
          </div>

          <div className="inspector">
            <Inspector result={result} />
            <div ref={probabilityChartRef}>
              {(result?.probabilities || result?.counts) && (
                <ProbabilityDistribution
                  probabilities={result?.probabilities}
                  counts={result?.counts}
                />
              )}
            </div>
            <div ref={amplitudesTableRef}>
              {result?.amplitudes && <AmplitudesTable amplitudes={result.amplitudes} ref={amplitudeWavesRef} />}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen modal viewer */}
      <Modal
        open={viewerModalOpen && !!result}
        onClose={() => {
          setViewerModalOpen(false);
          setUserClosedModal(true);
        }}
        keepMounted
        sx={{
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            bgcolor: '#031018',
            outline: 'none'
          }}
        >
          <IconButton
            onClick={() => {
              setViewerModalOpen(false);
              setUserClosedModal(true);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 30,
              background: 'rgba(10,30,50,0.6)',
              color: '#e8f6ff',
              '&:hover': { background: 'rgba(10,30,50,0.85)' }
            }}
            title="Close"
          >
            <CloseIcon />
          </IconButton>
          <div style={{ width: '100%', height: '100%' }}>
            <CanvasPlaceholder result={result} />
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Home;