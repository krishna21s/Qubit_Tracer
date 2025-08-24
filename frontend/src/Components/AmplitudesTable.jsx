import React, { useState, forwardRef } from "react";
import AmplitudeWaves from "./AmplitudeWaves";

const AmplitudesTable = forwardRef(({ amplitudes }, amplitudeWavesRef) => {
  const [showWaves, setShowWaves] = useState(false);

  if (!amplitudes) return <div>No amplitude data</div>;

  return (
    <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ color: "#e0f7fa" }}>State Amplitudes</h3>
        <button
          onClick={() => setShowWaves(!showWaves)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "#66d8ff",
          }}
          title={showWaves ? "Hide wave visualization" : "Show wave visualization"}
        >
          {showWaves ? "🙈" : "👁️"}
        </button>
      </div>

      {/* amplitudes table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: "#dff6ff",
          fontSize: 13,
          marginTop: 8,
        }}
      >
        <thead>
          <tr style={{ textAlign: "center", background: "#223", color: "#9fb4c8" }}>
            <th>Basis State</th>
            <th>Re(α)</th>
            <th>Im(α)</th>
            <th>|α|²</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(amplitudes).map(([state, { re, im, prob }], idx) => (
            <tr
              key={idx}
              style={{
                textAlign: "center",
                background: idx % 2 === 0 ? "#1c2230" : "#222b3a",
              }}
            >
              <td style={{ fontWeight: "bold", color: "#80e0ff" }}>{state}</td>
              <td>{re.toFixed(3)}</td>
              <td>{im.toFixed(3)}</td>
              <td>{(prob * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Wave visualization toggled by 👁️ button */}
      <div ref={amplitudeWavesRef}>
        <AmplitudeWaves amplitudes={amplitudes} show={showWaves} />
      </div>
    </div>
  );
});

export default AmplitudesTable;
