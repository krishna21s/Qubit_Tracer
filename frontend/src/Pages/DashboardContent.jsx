import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import Controls from '../Components/Controls';
import AnalysisPanel from '../Components/AnalysisPanel';
import ExportButton from '../Components/ExportButton';
import CanvasPlaceholder from '../Components/CanvasPlaceholder';
import VisualCircuitRenderer from '../Components/circuit/VisualCircuitRenderer';
import ShinyText from '../Components/reactbits/ShinyText/ShinyText';

import { useSimulation } from '../context/SimulationContext';

import '../Components/circuit/visualCircuit.css';
import '../styles/dashboardCards.css';      // still used for qt-tmpl-* theming
// import '../styles/dashboard_theming.css';   // UPDATED CSS below

export default function DashboardContent({
  analysisText,
  setAnalysisText,
  blochSpheresRef,
  probabilityChartRef,
  amplitudesTableRef,
  amplitudeWavesRef
}) {
  const {
    simulationResult,
    updateSimulationResult,
    shouldAutoOpenViewer,
    setShouldAutoOpenViewer
  } = useSimulation();

  const [loading, setLoading] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [userClosedModal, setUserClosedModal] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  useEffect(() => {
    if (simulationResult && shouldAutoOpenViewer) {
      setViewerModalOpen(true);
      setUserClosedModal(false);
      setShouldAutoOpenViewer(false);
    }
  }, [simulationResult, shouldAutoOpenViewer, setShouldAutoOpenViewer]);

  // Handle Escape key to close fullscreen modal
  useEffect(() => {
    if (!viewerModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setViewerModalOpen(false);
        setUserClosedModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerModalOpen]);

  const handleResult = (res) => {
    updateSimulationResult(res);
  };

  return (
    <div className="dashboard-root">
      {/* Hero */}
      <section className="qt-tmpl-hero dashboard-hero rounded-lg">
        <h2 className="dashboard-hero-title">
          <ShinyText
            text="Welcome to Qubit-Tracer"
            color="var(--qt-text)"
            shineColor="var(--qt-border)"
            animationDuration={9500}
            delayDuration={2000}
            pauseOnHover={false}
          />
        </h2>

        <p className="dashboard-hero-text">
          This dashboard lets you build, simulate, and inspect quantum circuits visually.
          Use the sidebar at the left to navigate. Start by creating or selecting a circuit,
          then open the Inspector to explore state representations.
        </p>

        <div className="dashboard-hero-actions">
          <button
            type="button"
            className="qt-btn qt-btn-primary"
            onClick={() => {
              const el = document.getElementById('builder-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Get Started</span>
            <KeyboardArrowRightRoundedIcon className="qt-btn-icon" />
          </button>

          <button
            type="button"
            className="qt-btn qt-btn-outlined"
            onClick={() => {
              const el = document.getElementById('learn-more-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Main layout */}
      <div className="dashboard-grid" id="builder-anchor">
        {/* Circuit Controls */}
        <section className="qt-tmpl-panel dashboard-panel dashboard-panel-controls">
          <h3 className="dashboard-panel-title">Circuit Controls</h3>
          <p className="dashboard-panel-text">
            Select a template or open the custom builder to design your circuit.
          </p>

          <div className="dashboard-controls-wrapper">
            <Controls
              setLoading={setLoading}
              loading={loading}
              onBuilderOpenChange={setIsBuilderOpen}
            />
          </div>

          <div className="qt-tmpl-panel-alt dashboard-panel dashboard-panel-ai">
            <h3 className="dashboard-panel-title">
              <AutoAwesomeRoundedIcon className="dashboard-icon-inline" /> AI Analysis
            </h3>
            <p className="dashboard-panel-text">
              Generate insights from the current simulation results.
            </p>
            <AnalysisPanel
              simulationResult={simulationResult}
              onAnalysisComplete={setAnalysisText}
            />
          </div>
        </section>

        {/* Bloch Visualization */}
        <section className="qt-tmpl-panel dashboard-panel dashboard-panel-bloch">
          <h3 className="dashboard-panel-title">
            <ThreeDRotationRoundedIcon className="dashboard-icon-inline" /> Quantum State Visualization
          </h3>
          <p className="dashboard-panel-text">
            Interactive Bloch sphere representation of your quantum states.
          </p>

          {simulationResult && !viewerModalOpen && !isBuilderOpen && (
            <div
              ref={blochSpheresRef}
              className="qt-tmpl-bloch-embed dashboard-bloch-embed"
            >
              <CanvasPlaceholder result={simulationResult} />

              <button
                type="button"
                className="qt-icon-btn dashboard-bloch-fullscreen"
                title="Full screen viewer"
                onClick={() => setViewerModalOpen(true)}
              >
                <ZoomOutMapIcon fontSize="small" />
              </button>
            </div>
          )}

          {(!simulationResult || isBuilderOpen) && (
            <div className="qt-tmpl-empty-dashed dashboard-empty">
              <div>
                <p className="dashboard-empty-main">
                  {isBuilderOpen ? 'Circuit builder is open' : 'No simulation data'}
                </p>
                <span className="dashboard-empty-sub">
                  {isBuilderOpen
                    ? 'Close the builder to see Bloch spheres'
                    : 'Run a simulation to visualize Bloch spheres'}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Export + Circuit + Tips */}
      <div className="dashboard-grid-secondary" id="learn-more-anchor">
        {/* Export Report */}
        <section className="qt-tmpl-panel dashboard-panel dashboard-panel-export">
          <h3 className="dashboard-panel-title">
            <GetAppRoundedIcon className="dashboard-icon-inline" /> Export Report
          </h3>
          <p className="dashboard-panel-text dashboard-panel-text-grow">
            Download a comprehensive PDF report with<br /> Bloch vectors, probabilities, and analysis.
          </p>
          <div className="dashboard-export-action">
            <ExportButton
              simulationResult={simulationResult}
              analysisText={analysisText}
              blochSpheresRef={blochSpheresRef}
              probabilityChartRef={probabilityChartRef}
              amplitudesTableRef={amplitudesTableRef}
              amplitudeWavesRef={amplitudeWavesRef}
            />
          </div>
        </section>

        {/* Circuit Diagram */}
        <section className="dashboard-panel dashboard-panel-circuit">
          <div className="dashboard-circuit-wrapper">
            <VisualCircuitRenderer qasm={simulationResult?.openqasm} />
          </div>
        </section>

        {/* Quick Tips */}
        <section className="qt-tmpl-panel dashboard-panel dashboard-panel-tips">
          <h3 className="dashboard-panel-title">
            <TipsAndUpdatesRoundedIcon className="dashboard-icon-inline" /> Quick Tips
          </h3>
          <div className="dashboard-tips-body">
            <p className="dashboard-panel-text">
              • Use the <strong>Custom Builder</strong> to visually drag &amp; drop quantum gates onto your circuit
              <br />
              • The <strong>Inspector</strong> correlates multiple representations of the same quantum state
              <br />
              • The <strong>Debugger</strong> lets you step through gate evolution and track state changes
              <br />
              • Toggle between <strong>light/dark themes</strong> using the icon in the top navigation bar
              <br />
              • <strong>Export reports</strong> include detailed analysis and can be shared with colleagues
            </p>
          </div>
        </section>
      </div>

      {/* Full-screen viewer (Modal replacement) */}
      {viewerModalOpen && !!simulationResult && (
        <div
          className="dashboard-modal-backdrop"
          onClick={() => {
            setViewerModalOpen(false);
            setUserClosedModal(true);
          }}
        >
          <div
            className="dashboard-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="qt-icon-btn dashboard-modal-close"
              title="Close"
              onClick={() => {
                setViewerModalOpen(false);
                setUserClosedModal(true);
              }}
            >
              <CloseIcon />
            </button>

            <div className="dashboard-modal-inner">
              <div className="dashboard-modal-canvas">
                <CanvasPlaceholder result={simulationResult} />
                <span className="dashboard-modal-label">
                  Quantum State Visualization - Full Screen
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}