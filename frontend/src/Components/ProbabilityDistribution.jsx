import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from "recharts";

function ProbabilityDistribution({
  probabilities,
  counts,
  maxStates,
  compact = false,
  sort = "desc"
}) {
  if (!probabilities && !counts) return <div className="qt-tmpl-inspector-root qt-empty">No probability data</div>;

  const isCounts = !!counts;
  const source = counts || probabilities;

  const { data, total, maxLabelLen } = useMemo(() => {
    const entries = Object.entries(source || {});
    entries.sort((a, b) =>
      sort === "asc" ? a[1] - b[1] : b[1] - a[1]
    );
    const limited = maxStates ? entries.slice(0, maxStates) : entries;

    const totalVal = isCounts
      ? limited.reduce((s, [, v]) => s + v, 0)
      : 1;

    const mapped = limited.map(([state, v]) => {
      const probPct = isCounts ? (v / totalVal) * 100 : v * 100;
      return {
        state,
        value: isCounts ? v : v * 100,
        pct: probPct,
        raw: v
      };
    });

    const maxLabLen = limited.reduce(
      (m, [st]) => Math.max(m, st.length),
      0
    );
    return { data: mapped, total: totalVal, maxLabelLen: maxLabLen };
  }, [source, isCounts, maxStates, sort]);

  const rotateTicks = data.length > 22 || maxLabelLen > 6;
  const perBar = 42;
  const baseWidth = 560;
  const chartWidth = Math.max(baseWidth, data.length * perBar + 120);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div className="qt-prob-tooltip">
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--qt-text)' }}>
          State {label}
        </div>
        {isCounts ? (
          <>
            <div style={{ fontSize: 11, color: 'var(--qt-text-dim)' }}>
              Counts: <span style={{ color: 'var(--qt-text)' }}>{d.value}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--qt-text-dim)', marginTop: 2 }}>
              Share: <span style={{ color: 'var(--qt-text)' }}>{d.pct.toFixed(2)}%</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 11, color: 'var(--qt-text-dim)' }}>
              Probability: <span style={{ color: 'var(--qt-text)' }}>{d.pct.toFixed(4)}%</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--qt-text-dim)', marginTop: 4 }}>
              Raw p = {d.raw.toExponential(3)}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="qt-prob-card"
      style={{
        marginTop: compact ? 0 : 12,
        overflow: "hidden"
      }}
    >
      <h3
        style={{
          marginBottom: 12,
          fontSize: compact ? 14 : 16,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}
      >
        <span style={{ color: 'var(--qt-text)' }}>Probability Distribution</span>
        <span className="qt-sub">
          {isCounts
            ? `(${data.length} states • counts)`
            : `(${data.length} states • %)`}
        </span>
      </h3>

      <div
        style={{
          width: "100%",
          overflowX: chartWidth > baseWidth ? "auto" : "hidden",
          paddingBottom: 4
        }}
      >
        <div style={{ width: chartWidth, minHeight: 280 }}>
          <BarChart
            width={chartWidth}
            height={280}
            data={data}
            barCategoryGap="30%"
            margin={{
              top: 10,
              right: 20,
              left: 6,
              bottom: rotateTicks ? 40 : 10
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="state"
              tick={{
                fontSize: 11,
                fill: 'var(--qt-text-dim)',
                fontFamily: '"Courier New", monospace'
              }}
              angle={rotateTicks ? -55 : 0}
              textAnchor={rotateTicks ? "end" : "middle"}
              height={rotateTicks ? 70 : undefined}
              interval={0}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: 'var(--qt-text-dim)'
              }}
              width={50}
              label={
                isCounts
                  ? {
                      value: "Counts",
                      angle: -90,
                      position: "insideLeft",
                      fill: 'var(--qt-text-dim)',
                      fontSize: 11
                    }
                  : {
                      value: "Probability (%)",
                      angle: -90,
                      position: "insideLeft",
                      fill: 'var(--qt-text-dim)',
                      fontSize: 11
                    }
              }
            />
            <ReferenceLine
              y={0}
              stroke="var(--qt-border)"
              strokeOpacity={0.4}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.06)" }}
              content={<CustomTooltip />}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: 'var(--qt-text-dim)' }}
              formatter={() =>
                isCounts ? "Counts (bar height)" : "Probability % (bar height)"
              }
            />
            <Bar
              dataKey="value"
              fill="url(#probGradient)"
              radius={[6, 6, 0, 0]}
            />
            <defs>
              <linearGradient id="probGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--qt-accent)" />
                <stop offset="100%" stopColor="var(--qt-accent-alt)" />
              </linearGradient>
            </defs>
          </BarChart>
        </div>
      </div>

      {!isCounts && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: 'var(--qt-text-dim)'
          }}
        >
          Values shown as % (p × 100). Scroll horizontally for more states. Hover bars for exact probability.
        </div>
      )}
      {isCounts && (
        <div
          style={{
            marginTop: 6,
            fontSize: 10,
            color: 'var(--qt-text-dim)'
          }}
        >
          Bars show raw counts; hover to see counts and share (% of total).
        </div>
      )}
    </div>
  );
}

export default ProbabilityDistribution;