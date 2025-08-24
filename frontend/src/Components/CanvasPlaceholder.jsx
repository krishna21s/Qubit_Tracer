// src/components/CanvasPlaceholder.jsx (updated)
import React from "react";
import AdvancedBlochViewer from "./AdvancedBlochViewer";

export default function CanvasPlaceholder({ result }) {
  const has = result && result.bloch_vectors && result.bloch_vectors.length > 0;
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {!has ? (
        <div className="canvasPlaceholder">
          <div>
            <div style={{ fontSize: 22, color: "#163347", marginBottom: 6 }}>Quantum Lens — 3D Canvas</div>
            <div style={{ color: "#5f8fa8" }}>Run a simulation to visualize Bloch spheres here</div>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%" }}>
          <AdvancedBlochViewer vectors={result.bloch_vectors} labels={result.bloch_vectors.map((_, i) => `q[${i}]`)} />
        </div>
      )}
    </div>
  );
}
