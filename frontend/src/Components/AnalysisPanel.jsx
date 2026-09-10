import React, { useState, useEffect } from 'react';
import { useTypingEffect } from '../utils/useTypingEffect';
import FormattedMessage from './FormattedMessage';
import { analyzeSimulation } from '../utils/api'; // NEW import

function AnalysisPanel({ simulationResult, onAnalysisComplete, isIcon = false }) {
  const [fullAnalysis, setFullAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const displayedAnalysis = useTypingEffect(fullAnalysis, 5, 3);

  useEffect(() => {
    if (fullAnalysis && displayedAnalysis.length === fullAnalysis.length) {
      setIsTyping(false);
    }
  }, [displayedAnalysis, fullAnalysis]);

  // Reset on new simulation
  useEffect(() => {
    setFullAnalysis('');
    setIsPanelOpen(false);
    setError('');
    setIsTyping(false);
  }, [simulationResult]);

  const handleAnalyzeClick = async () => {
    if (!simulationResult) {
      setError('Please run a simulation first before analyzing.');
      return;
    }

    if (fullAnalysis && isIcon) {
      setIsPanelOpen(prev => !prev);
      return;
    }

    setIsLoading(true);
    setError('');
    setFullAnalysis('');
    setIsTyping(true);

    try {
      const data = await analyzeSimulation(simulationResult);
      setFullAnalysis(data.analysis);
      if (onAnalysisComplete) onAnalysisComplete(data.analysis);
      setIsPanelOpen(true);
    } catch (err) {
      console.error('Failed to get analysis:', err);
      setError('Failed to fetch analysis from the server. Please try again.');
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isIcon ? "analysis-container-icon" : "analysis-container-wrapper"}>
      <div className="analysis-button-group">
        <button
          onClick={handleAnalyzeClick}
          disabled={isLoading || isTyping || (!isIcon && !!fullAnalysis)}
          className={isIcon ? "qc-toolbar-btn" : "button analyze-button"}
          style={isIcon ? { height: 28, padding: '0 8px', marginRight: 8, display: 'flex', alignItems: 'center' } : {}}
          title="AI Analysis"
        >
          {isIcon ? (
            <span style={{ fontSize: 14 }}>✨</span>
          ) : (
            isLoading ? 'Generating...' : (isTyping ? 'Analyzing...' : 'Analyze Results')
          )}
        </button>
        {!isIcon && (
          <button
            onClick={() => setIsPanelOpen(prev => !prev)}
            disabled={!fullAnalysis}
            className="toggle-button"
            aria-label={isPanelOpen ? "Hide Analysis" : "Show Analysis"}
          >
            {isPanelOpen ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      {error && <div style={{ color: '#ff8a80', fontSize: '13px', marginTop: '10px' }}>{error}</div>}

      {isPanelOpen && fullAnalysis && (
        <div className="analysis-dialog-box">
          <div className="dialog-header">
            <h3>QuTo Advanced Analysis</h3>
            <button onClick={() => setIsPanelOpen(false)} className="close-button" aria-label="Close">
              &times;
            </button>
          </div>
          <div className="dialog-content">
            <FormattedMessage content={displayedAnalysis} />
            {isTyping && <span className="typing-cursor"></span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisPanel;