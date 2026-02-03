import React from "react";
import AdvancedBlochViewer from "./AdvancedBlochViewer";

/**
 * BlochSphereGrid - PDF-optimized layout
 * Renders one Bloch sphere per qubit in a clean grid layout
 * Each sphere is individually labeled and properly spaced
 */
export default function BlochSphereGrid({ 
  vectors = [], 
  printCameraPosition = [1.8, 1.1, 4.6] 
}) {
  if (!vectors || vectors.length === 0) {
    return (
      <div className="bloch-grid-empty">
        No Bloch vectors available
      </div>
    );
  }

  // Calculate grid columns based on qubit count
  const columns = vectors.length <= 2 ? vectors.length : 
                  vectors.length <= 4 ? 2 : 
                  vectors.length <= 6 ? 3 : 4;

  return (
    <div className="bloch-grid-container">
      <div 
        className="bloch-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '24px',
          padding: '16px'
        }}
      >
        {vectors.map((vector, index) => (
          <div key={index} className="bloch-grid-item">
            <div className="bloch-grid-label">q[{index}]</div>
            <div className="bloch-grid-sphere">
              <AdvancedBlochViewer
                vectors={[vector]}
                labels={[`q[${index}]`]}
                cameraPosition={printCameraPosition}
              />
            </div>
            <div className="bloch-grid-info">
              <div className="bloch-info-row">
                <span>θ:</span>
                <span>{(vector.theta !== undefined ? vector.theta : 0).toFixed(1)}°</span>
              </div>
              <div className="bloch-info-row">
                <span>φ:</span>
                <span>{(vector.phi !== undefined ? vector.phi : 0).toFixed(1)}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
