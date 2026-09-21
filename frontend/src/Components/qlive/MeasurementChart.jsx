import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Interactive bar chart for measurement counts/probabilities
 * Inspector-quality styling with gradient bars and theme-adaptive colors
 */
export default function MeasurementChart({ 
  data = {}, 
  totalShots = 0,
  showProbabilities = false,
  maxItems = 12 
}) {
  const chartData = useMemo(() => {
    const entries = Object.entries(data)
      .map(([outcome, value]) => ({
        outcome,
        stateLabel: /^[01]+$/.test(outcome) ? `|${outcome}⟩` : outcome,
        value: Number(value),
        percentage: totalShots > 0 ? (Number(value) / totalShots) * 100 : Number(value) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);

    return entries;
  }, [data, totalShots, maxItems]);

  // Vibrant gradient colors tailored for quantum states
  const gradientColors = [
    { start: '#38bdf8', end: '#2563eb' },
    { start: '#818cf8', end: '#4f46e5' },
    { start: '#a855f7', end: '#7c3aed' },
    { start: '#34d399', end: '#059669' },
    { start: '#fbbf24', end: '#d97706' },
    { start: '#f43f5e', end: '#be123c' },
  ];

  const getGradientId = (index) => `qliveGrad${index % gradientColors.length}`;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    return (
      <div className="qlive-tooltip">
        <div className="qlive-tooltip-label">
          State: <strong>{item.stateLabel}</strong>
        </div>
        <div className="qlive-tooltip-row">
          <span>Observed Count</span>
          <span>{item.value.toLocaleString()} shots</span>
        </div>
        {totalShots > 0 && (
          <div className="qlive-tooltip-row">
            <span>Probability</span>
            <span>{item.percentage.toFixed(2)}%</span>
          </div>
        )}
      </div>
    );
  };

  const formatOutcome = (outcome) => {
    const label = /^[01]+$/.test(outcome) ? `|${outcome}⟩` : outcome;
    if (label.length > 8) {
      return `${label.slice(0, 4)}..${label.slice(-3)}`;
    }
    return label;
  };

  if (!chartData.length) {
    return (
      <div className="qlive-chart-loading">
        No measurement data available
      </div>
    );
  }

  return (
    <div className="qlive-chart-wrapper qlive-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 16, left: 0, bottom: 45 }}
          barCategoryGap="28%"
        >
          <defs>
            {gradientColors.map((colors, i) => (
              <linearGradient key={i} id={`qliveGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} stopOpacity={0.95} />
                <stop offset="100%" stopColor={colors.end} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
          <XAxis 
            dataKey="outcome"
            tickFormatter={formatOutcome}
            angle={-30}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <YAxis 
            tickFormatter={(v) => showProbabilities ? `${v.toFixed(0)}%` : v.toLocaleString()}
            width={48}
            tick={{ fontSize: 11, fontFamily: 'monospace' }}
            stroke="currentColor"
            strokeOpacity={0.3}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(56, 189, 248, 0.08)' }} />
          <Bar 
            dataKey={showProbabilities ? "percentage" : "value"} 
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#${getGradientId(index)})`}
                style={{ filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.25))' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
