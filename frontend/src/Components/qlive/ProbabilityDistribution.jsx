import React, { useMemo } from 'react';

/**
 * Visual probability distribution with animated bars
 * Shows outcome probabilities with horizontal gradient bars
 */
export default function ProbabilityDistribution({ 
  data = {}, 
  maxItems = 15 
}) {
  const entries = useMemo(() => {
    return Object.entries(data)
      .map(([outcome, value]) => ({
        outcome,
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
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="qlive-prob-header">
            <span className="qlive-prob-label">{entry.outcome}</span>
            <span className="qlive-prob-value">{entry.percentage.toFixed(2)}%</span>
          </div>
          <div className="qlive-prob-bar-bg">
            <div 
              className="qlive-prob-bar-fill"
              style={{ 
                width: `${Math.max(entry.percentage, 0.5)}%`,
                transitionDelay: `${index * 30}ms`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
