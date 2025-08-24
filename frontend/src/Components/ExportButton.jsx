import React, { useState } from 'react';
import { generateReportPDF } from '../utils/PDFGenerator';

// 1. Accept amplitudeWavesRef as a prop here
function ExportButton({ simulationResult, analysisText, blochSpheresRef, probabilityChartRef, amplitudesTableRef, amplitudeWavesRef }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!simulationResult) {
      alert("Please run a simulation before exporting.");
      return;
    }

    setIsExporting(true);

    try {
      // 2. Pass the new ref along to the PDF generator
      await generateReportPDF({
        simulationResult,
        analysisText,
        blochSpheresRef,
        probabilityChartRef,
        amplitudesTableRef,
        amplitudeWavesRef // <-- This was the missing piece
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error creating the report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '12px' }}>
      <button
        onClick={handleExport}
        disabled={isExporting || !simulationResult}
        className="button analyze-button" // Using your awesome button style
        style={{ width: 'logger.ts:53' }}
      >
        {isExporting ? 'Creating Magic...' : '📄 Download PDF Report'}
      </button>
    </div>
  );
}

export default ExportButton;