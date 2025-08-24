import React, { useState, useEffect } from 'react';
import { useTypingEffect } from '../utils/useTypingEffect';
import FormattedMessage from './FormattedMessage';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function AnalysisPanel({ simulationResult, onAnalysisComplete }) {
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

  // This effect correctly resets the panel for each new simulation.
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

    setIsLoading(true);
    setError('');
    setFullAnalysis('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: simulationResult }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setFullAnalysis(data.analysis);
      onAnalysisComplete(data.analysis);
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
    <div className="analysis-container-wrapper">
      <div className="analysis-button-group">
        <button
          onClick={handleAnalyzeClick}
          // The button is now also disabled if `fullAnalysis` has content,
          // preventing re-analysis of the same result.
          disabled={isLoading || isTyping || !!fullAnalysis}
          className="button analyze-button"
        >
          {isLoading ? 'Generating...' : (isTyping ? 'Analyzing...' : 'Analyze Results')}
        </button>
        <button
          onClick={() => setIsPanelOpen(prev => !prev)}
          // The button is now only disabled if there is no analysis text.
          // It will remain enabled while new text is typing.
          disabled={!fullAnalysis}
          className="toggle-button"
          aria-label={isPanelOpen ? "Hide Analysis" : "Show Analysis"}
        >
          {isPanelOpen ? 'Hide' : 'Show'}
        </button>
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
