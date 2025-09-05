import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { generateReportPDF } from '../utils/PDFGenerator';
import ReportPrintView from './ReportPrintView';
import './print-report.css';

/**
 * ExportButton
 * - Legacy jsPDF export retained
 * - Dark Inspector Report: now mounts #qt-report-root directly under <body>
 *   so isolation CSS can simply hide body > * except that element.
 */
function ExportButton({
  simulationResult,
  analysisText,
  blochSpheresRef,
  probabilityChartRef,
  amplitudesTableRef,
  amplitudeWavesRef
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [rootEl, setRootEl] = useState(null);

  const printedRef = useRef(false);
  const fallbackTimerRef = useRef(null);
  const printTimerRef = useRef(null);

  // Create / remove the printable root
  useEffect(() => {
    if (!printMode) return;

    // Create the actual element that will hold the report
    const el = document.createElement('div');
    el.id = 'qt-report-root';
    document.body.appendChild(el);
    setRootEl(el);

    const cleanup = () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (printTimerRef.current) clearTimeout(printTimerRef.current);
      document.body.classList.remove('qt-report-mode');
      printedRef.current = false;
      if (el.parentNode) {
        try { el.parentNode.removeChild(el); } catch {}
      }
      setRootEl(null);
    };

    // afterprint (fires on cancel or success)
    const handleAfterPrint = () => {
      cleanup();
      setPrintMode(false);
    };

    // Some browsers rely on matchMedia
    const mql = window.matchMedia('print');
    const mqlListener = (e) => {
      if (!e.matches) {
        // print dialog closed
        cleanup();
        setPrintMode(false);
      }
    };
    if (mql.addEventListener) mql.addEventListener('change', mqlListener);
    else if (mql.addListener) mql.addListener(mqlListener);

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      if (mql.removeEventListener) mql.removeEventListener('change', mqlListener);
      else if (mql.removeListener) mql.removeListener(mqlListener);
      cleanup();
    };
  }, [printMode]);

  const handleLegacyExport = async () => {
    if (!simulationResult) {
      alert("Please run a simulation before exporting.");
      return;
    }
    setIsExporting(true);
    try {
      await generateReportPDF({
        simulationResult,
        analysisText,
        blochSpheresRef,
        probabilityChartRef,
        amplitudesTableRef,
        amplitudeWavesRef
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Sorry, there was an error creating the report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleInspectorPrint = () => {
    if (!simulationResult) {
      alert("Run a simulation first.");
      return;
    }
    setPrintMode(true);
  };

  // Called by ReportPrintView after initial mount + small delay
  const onReportReady = () => {
    if (printedRef.current) return;
    document.body.classList.add('qt-report-mode');

    // Primary print trigger
    printTimerRef.current = setTimeout(() => {
      if (!printedRef.current) {
        try {
          printedRef.current = true;
          window.print();
        } catch (e) {
          console.warn("window.print() failed:", e);
          setPrintMode(false);
        }
      }
    }, 120);
  };

  // Fallback: if for some reason onReportReady never fires, force attempt
  useEffect(() => {
    if (!printMode) return;
    fallbackTimerRef.current = setTimeout(() => {
      if (!printedRef.current) {
        console.warn("[Report] Fallback print trigger fired.");
        document.body.classList.add('qt-report-mode');
        try {
          printedRef.current = true;
          window.print();
        } catch (e) {
          console.warn("Fallback window.print() failed:", e);
          setPrintMode(false);
        }
      }
    }, 1500); // 1.5s fallback
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [printMode]);

  return (
    <>
      <div className="card" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={handleLegacyExport}
          disabled={isExporting || !simulationResult}
          className="button analyze-button"
          style={{ width: '100%' }}
        >
          {isExporting ? 'Creating (Classic)...' : '📄 Legacy PDF Export'}
        </button>
        <button
          onClick={handleInspectorPrint}
          disabled={!simulationResult}
          className="button"
          style={{
            background: 'linear-gradient(135deg,#1f4e6e,#183c55)',
            color: '#e6f4ff',
            width: '100%',
            fontSize: 14
          }}
          title="Print dark inspector report (only the report will appear)"
        >
          🖨 Dark Inspector Report
        </button>
      </div>

      {printMode && rootEl && createPortal(
        <ReportPrintView
          result={simulationResult}
          analysisText={analysisText}
          onReady={onReportReady}
        />,
        rootEl
      )}
    </>
  );
}

export default ExportButton;