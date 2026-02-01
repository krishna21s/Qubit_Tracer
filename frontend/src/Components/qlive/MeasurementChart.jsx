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
 * Inspector-quality styling with gradient bars
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
        value: Number(value),
        percentage: totalShots > 0 ? (Number(value) / totalShots) * 100 : Number(value) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);

    return entries;
  }, [data, totalShots, maxItems]);

  // Define gradient colors for professional look
  const gradientColors = [
    { start: '#4cc3fa', end: '#1e88e5' },
    { start: '#42a5f5', end: '#1565c0' },
    { start: '#5c6bc0', end: '#3949ab' },
    { start: '#7e57c2', end: '#5e35b1' },
    { start: '#ab47bc', end: '#8e24aa' },
    { start: '#ec407a', end: '#d81b60' },
  ];

  const getGradientId = (index) => `qliveGrad${index % gradientColors.length}`;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    return (
      <div className="qlive-tooltip">
        <div className="qlive-tooltip-label">{item.outcome}</div>
        <div className="qlive-tooltip-row">
          <span>Count</span>
          <span>{item.value.toLocaleString()}</span>
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
    if (outcome.length > 6) {
      return `${outcome.slice(0, 3)}..${outcome.slice(-2)}`;
    }
    return outcome;
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
          margin={{ top: 20, right: 20, left: 10, bottom: 65 }}
          barCategoryGap="20%"
        >
          <defs>
            {gradientColors.map((colors, i) => (
              <linearGradient key={i} id={`qliveGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} stopOpacity={1} />
                <stop offset="100%" stopColor={colors.end} stopOpacity={0.85} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} />
          <XAxis 
            dataKey="outcome"
            tickFormatter={formatOutcome}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 11, fontWeight: 600 }}
          />
          <YAxis 
            tickFormatter={(v) => showProbabilities ? `${v.toFixed(0)}%` : v.toLocaleString()}
            width={55}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(76, 195, 250, 0.08)' }} />
          <Bar 
            dataKey={showProbabilities ? "percentage" : "value"} 
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#${getGradientId(index)})`}
                style={{ filter: 'drop-shadow(0 4px 8px rgba(76, 195, 250, 0.25))' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
