import React, { useMemo } from 'react';

/**
 * Visual probability distribution with animated bars and bra-ket quantum state notation
 */
export default function ProbabilityDistribution({ 
  data = {}, 
  maxItems = 15 
}) {
  const entries = useMemo(() => {
    return Object.entries(data)
      .map(([outcome, value]) => ({
        outcome,
        stateLabel: /^[01]+$/.test(outcome) ? `|${outcome}⟩` : outcome,
        value: Number(value),
        percentage: Number(value) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);
  }, [data, maxItems]);

  if (!entries.length) {
    return (
      <div className="qlive-chart-loading">
        No probability data available
      </div>
    );
  }

  return (
    <div className="qlive-prob-list qlive-fade-in">
      {entries.map((entry, index) => (
        <div 
          key={entry.outcome} 
          className="qlive-prob-item"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <div className="qlive-prob-header">
            <div className="qlive-state-badge">
              <span className="qlive-state-ket">{entry.stateLabel}</span>
              {index === 0 && <span className="qlive-dominant-tag">Top State</span>}
            </div>
            <span className="qlive-prob-value">{entry.percentage.toFixed(2)}%</span>
          </div>
          <div className="qlive-prob-bar-bg">
            <div 
              className="qlive-prob-bar-fill"
              style={{ 
                width: `${Math.max(entry.percentage, 0.8)}%`,
                transitionDelay: `${index * 25}ms`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
