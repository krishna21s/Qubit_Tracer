import React, { useMemo, useState, useEffect, useRef } from "react";
import { ChartPie } from 'reicon-react';

/**
 * ProbabilityDistribution - Enhanced Visualization with Scalability
 * 
 * Features:
 * - Animated bar chart with smooth transitions
 * - Interactive hover with detailed tooltips
 * - Educational explanations for each state
 * - Horizontal scrolling for many states
 * - Themed scrollbars
 */

function ProbabilityDistribution({
  probabilities,
  counts,
  maxStates = 32,  // Increased for many-qubit circuits
  compact = false,
  sort = "desc"
}) {
  const [hoveredState, setHoveredState] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  if (!probabilities && !counts) {
    return (
      <div className="qt-prob-empty">
        No probability data available
      </div>
    );
  }

  const isCounts = !!counts;
  const source = counts || probabilities;
  const totalStates = Object.keys(source || {}).length;

  // Process and prepare data with dynamic limiting
  const { data, total, maxValue, binaryLength } = useMemo(() => {
    const entries = Object.entries(source || {});
    
    // Sort by value
    entries.sort((a, b) => 
      sort === "asc" ? a[1] - b[1] : b[1] - a[1]
    );
    
    // Limit visible states based on showAll toggle
    const visibleLimit = showAll ? 64 : Math.min(maxStates, 24);
    const limited = entries.slice(0, visibleLimit);
    
    const totalVal = isCounts
      ? entries.reduce((s, [, v]) => s + v, 0) // Use all entries for total
      : 1;
    
    const maxVal = Math.max(...limited.map(([, v]) => v)) || 1;
    
    // Determine binary string length for formatting
    const binLen = limited.length > 0 ? limited[0][0].length : 0;
    
    const mapped = limited.map(([state, v], index) => {
      const probability = isCounts ? v / totalVal : v;
      const percentage = probability * 100;
      const rank = index + 1;
      
      return {
        state,
        value: v,
        probability,
        percentage,
        rank,
        isTopState: percentage > 10,
      };
    });
    
    return { 
      data: mapped, 
      total: totalVal, 
      maxValue: maxVal,
      binaryLength: binLen
    };
  }, [source, isCounts, maxStates, sort, showAll]);

  // Trigger animation on mount/data change
  useEffect(() => {
    setAnimationComplete(false);
    const timer = setTimeout(() => setAnimationComplete(true), 50);
    return () => clearTimeout(timer);
  }, [source]);

  // Calculate dimensions based on number of states
  const chartHeight = compact ? 180 : 220;
  const barWidth = binaryLength > 4 ? 50 : (binaryLength > 2 ? 45 : 40);
  const barGap = 6;
  const chartMinWidth = data.length * (barWidth + barGap) + 60;
  const needsScroll = chartMinWidth > 600;

  // Get bar color based on probability
  const getBarGradient = (percentage, isHovered) => {
    if (isHovered) return "linear-gradient(180deg, var(--qt-accent, #64ffda), var(--qt-accent-alt, #26a69a))";
    if (percentage > 40) return "linear-gradient(180deg, var(--qt-accent, #64ffda), var(--qt-accent-alt, #26a69a))";
    if (percentage > 20) return "linear-gradient(180deg, #4dd0e1, #0097a7)";
    if (percentage > 5) return "linear-gradient(180deg, #29b6f6, #0288d1)";
    return "linear-gradient(180deg, #42a5f5, #1976d2)";
  };

  return (
    <div
      ref={containerRef}
      className="qt-prob-container"
    >
      {/* Header */}
      <div className="qt-prob-header">
        <div>
          <h3 className="qt-prob-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChartPie size={18} />
            Probability Distribution
            <span className="qt-prob-meta">
              ({data.length}{totalStates > data.length ? ` of ${totalStates}` : ''} states • {isCounts ? "counts" : "theoretical"})
            </span>
          </h3>
          <p className="qt-prob-description">
            {isCounts 
              ? "Measurement outcomes from simulated shots. Higher bars = more frequent outcomes."
              : "Theoretical probabilities from quantum state. Bar height = chance of measuring that state."}
          </p>
        </div>
        
        {/* Summary stats - compact for many states */}
        <div className="qt-prob-summary">
          <div className="qt-prob-stat primary">
            <div className="qt-prob-stat-label">TOP STATE</div>
            <div className="qt-prob-stat-value">
              |{data[0]?.state}⟩ = {data[0]?.percentage.toFixed(1)}%
            </div>
          </div>
          {data.length > 1 && data[1].percentage > 0.1 && (
            <div className="qt-prob-stat secondary">
              <div className="qt-prob-stat-label">2ND</div>
              <div className="qt-prob-stat-value">
                |{data[1]?.state}⟩ = {data[1]?.percentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Area with horizontal scroll */}
      <div className="qt-prob-chart-wrapper">
        {/* Y-axis labels (sticky) */}
        <div className="qt-prob-yaxis">
          <span>{isCounts ? Math.round(data[0]?.value || 0) : "100%"}</span>
          <span>{isCounts ? Math.round((data[0]?.value || 0) / 2) : "50%"}</span>
          <span>0</span>
        </div>

        {/* Scrollable bar chart container */}
        <div 
          ref={scrollRef}
          className="qt-prob-scroll-container"
          style={{ 
            overflowX: needsScroll ? 'auto' : 'hidden',
          }}
        >
          <div 
            className="qt-prob-bars-container"
            style={{ 
              minWidth: needsScroll ? chartMinWidth : '100%',
              height: chartHeight,
            }}
          >
            {/* Grid lines */}
            <svg className="qt-prob-grid">
              {[0, 25, 50, 75, 100].map(pct => (
                <line
                  key={pct}
                  x1="0"
                  y1={`${100 - pct}%`}
                  x2="100%"
                  y2={`${100 - pct}%`}
                  className="qt-prob-grid-line"
                />
              ))}
            </svg>

            {/* Bars */}
            <div className="qt-prob-bars">
              {data.map((item, idx) => {
                const maxVal = isCounts ? data[0].value : 1;
                const barHeightPct = (item.value / maxVal) * 100;
                const isHovered = hoveredState === item.state;
                
                return (
                  <div
                    key={item.state}
                    className={`qt-prob-bar-group ${isHovered ? 'hovered' : ''}`}
                    style={{ width: barWidth }}
                    onMouseEnter={() => setHoveredState(item.state)}
                    onMouseLeave={() => setHoveredState(null)}
                  >
                    {/* Value label on top */}
                    <div className={`qt-prob-bar-label ${item.percentage > 0.1 || isHovered ? '' : 'dim'}`}>
                      {item.percentage.toFixed(item.percentage < 1 ? 1 : 0)}%
                    </div>
                    
                    {/* Bar */}
                    <div className="qt-prob-bar-track">
                      <div
                        className={`qt-prob-bar ${isHovered ? 'hovered' : ''} ${item.isTopState ? 'top' : ''}`}
                        style={{
                          height: animationComplete ? `${Math.max(barHeightPct, 1)}%` : '0%',
                          background: getBarGradient(item.percentage, isHovered),
                          transitionDelay: `${idx * 0.02}s`,
                        }}
                      />
                    </div>
                    
                    {/* State label */}
                    <div className={`qt-prob-bar-state ${isHovered ? 'hovered' : ''}`}>
                      |{item.state}⟩
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator if needed */}
        {needsScroll && (
          <div className="qt-prob-scroll-hint">
            ← Scroll to see all {data.length} states →
          </div>
        )}
      </div>

      {/* Show more button if there are hidden states */}
      {totalStates > data.length && (
        <button 
          className="qt-prob-show-more"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? `Show less (top ${maxStates})` : `Show more (${Math.min(64, totalStates)} of ${totalStates})`}
        </button>
      )}

      {/* Hover tooltip */}
      {hoveredState && (
        <HoverDetail 
          item={data.find(d => d.state === hoveredState)}
          isCounts={isCounts}
          total={total}
        />
      )}

      {/* Legend & Educational Footer */}
      <div className="qt-prob-footer">
        <div className="qt-prob-understanding">
          <strong>Understanding:</strong>{" "}
          Each bar represents a possible measurement outcome. 
          {isCounts 
            ? " Height shows how many times that state was measured." 
            : " Height shows the probability (|α|²) of measuring that state."}
        </div>
        
        <div className="qt-prob-legend">
          <div className="qt-prob-legend-item">
            <div className="qt-prob-legend-color high" />
            <span>High (&gt;40%)</span>
          </div>
          <div className="qt-prob-legend-item">
            <div className="qt-prob-legend-color low" />
            <span>Low (&lt;5%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detailed hover tooltip component
function HoverDetail({ item, isCounts, total }) {
  if (!item) return null;
  
  return (
    <div className="qt-prob-tooltip">
      <div className="qt-prob-tooltip-header">
        <span className="qt-prob-tooltip-state">|{item.state}⟩</span>
        <span className="qt-prob-tooltip-rank">Rank #{item.rank}</span>
      </div>
      
      <div className="qt-prob-tooltip-grid">
        <div>
          <div className="qt-prob-tooltip-label">
            {isCounts ? "Shot Count" : "Probability"}
          </div>
          <div className="qt-prob-tooltip-value">
            {isCounts ? item.value.toLocaleString() : item.percentage.toFixed(4) + "%"}
          </div>
        </div>
        {isCounts && (
          <div>
            <div className="qt-prob-tooltip-label">Percentage</div>
            <div className="qt-prob-tooltip-value">{item.percentage.toFixed(2)}%</div>
          </div>
        )}
        <div>
          <div className="qt-prob-tooltip-label">Binary Meaning</div>
          <div className="qt-prob-tooltip-meaning">{explainBinaryState(item.state)}</div>
        </div>
      </div>
    </div>
  );
}

// Helper to explain binary state meaning
function explainBinaryState(state) {
  const bits = state.split('');
  if (bits.length === 1) {
    return bits[0] === '0' ? 'Qubit = |0⟩' : 'Qubit = |1⟩';
  }
  if (bits.length <= 3) {
    return bits.map((b, i) => `q[${bits.length - 1 - i}]=${b}`).join(', ');
  }
  return `${bits.length}-qubit state`;
}

export default ProbabilityDistribution;