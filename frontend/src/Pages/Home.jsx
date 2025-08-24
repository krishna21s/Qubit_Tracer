import React, { useState, useRef } from 'react';
import '../index.css';
import CanvasPlaceholder from '../Components/CanvasPlaceholder';
import Inspector from '../Components/Inspector';
import Controls from '../Components/Controls';
import QuantumBotAssistant from '../Components/QuantumBotAssistant';
import ProbabilityDistribution from '../Components/ProbabilityDistribution';
import AmplitudesTable from '../Components/AmplitudesTable';
import AnalysisPanel from '../Components/AnalysisPanel';
import ExportButton from '../Components/ExportButton';
import AmplitudeWaves from '../Components/AmplitudeWaves'; // 1. Import AmplitudeWaves

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState('');

  const blochSpheresRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const amplitudesTableRef = useRef(null);
  const amplitudeWavesRef = useRef(null); // 2. Create the new ref
  const densityMatrixRef = useRef(null);


  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">Qubit-Tracer</div>
        <div className="hint">Interactive Quantum State Visualizer — prototype</div>
        <Controls setResult={setResult} setLoading={setLoading} loading={loading} />
        <div style={{ marginTop: 12 }} className="card">
          <div style={{ fontSize: 13, color: '#9fb4c8' }}>Tips</div>
          <div className="field">Try Bell/GHZ or paste OpenQASM.</div>
        </div>

        <AnalysisPanel
          simulationResult={result}
          onAnalysisComplete={setAnalysisText}
        />

        {/* 3. Pass the new ref to the ExportButton */}
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
        </div>

        <div className="canvasRow">
          <div className="canvasWrap" ref={blochSpheresRef}>
            <CanvasPlaceholder result={result} />
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
    </div>
  );
}

export default Home;