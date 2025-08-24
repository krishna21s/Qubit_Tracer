import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function ProbabilityDistribution({ probabilities, counts }) {
  if (!probabilities && !counts) return <div>No probability data</div>;

  // Prefer counts if available, else fallback to probabilities
  const source = counts || probabilities;

  const data = Object.entries(source).map(([state, prob]) => ({
    state,
    probability: counts ? prob : (prob * 100).toFixed(2), // %
  }));

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h3 style={{ color: "#e0f7fa", marginBottom: 12 }}>Probability Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#334" />
          <XAxis dataKey="state" stroke="#cfefff" style={{ fontSize: 12 }} />
          <YAxis stroke="#cfefff" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1c2230", border: "none", borderRadius: 8 }}
            labelStyle={{ color: "#fff" }}
            formatter={(val) => [`${val}%`, "Probability"]}
          />
          <Legend />
          <Bar
            dataKey="probability"
            fill="url(#gradient)"
            radius={[6, 6, 0, 0]}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#66d8ff" />
              <stop offset="100%" stopColor="#004080" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProbabilityDistribution;
