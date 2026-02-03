import React, { useEffect, useRef } from "react";
import BlochSphereGrid from "./BlochSphereGrid";
import Inspector from "./Inspector";
import FormattedMessage from "./FormattedMessage";

/**
 * ReportPrintView
 * - (Update) Forces Amplitudes section open + auto-enables Waves for print
 * - (Update) Supplies a standard print camera angle for Bloch viewer (configurable here)
 *
 * NOTE: We did NOT modify the Inspector component itself. We:
 *   1. Pass defaultOpen with amps: true.
 *   2. After mount, programmatically click the Waves toggle if it exists and is in the "closed" state.
 *   3. Delay onReady until waves are rendered (or timeout fallback).
 *   4. Provide a stable camera angle via prop passed down to AdvancedBlochViewer through CanvasPlaceholder.
 */

const PRINT_CAMERA_POSITION = [1.8, 1.1, 4.6]; // Slight perspective (x,y,z)

export default function ReportPrintView({ result, analysisText, onReady }) {
  const rootRef = useRef(null);
  const readyFiredRef = useRef(false);

  // Helper to safely call onReady once
  const fireReady = () => {
    if (readyFiredRef.current) return;
    readyFiredRef.current = true;
    onReady?.();
  };

  useEffect(() => {
    if (!result) {
      // Nothing to render; still allow print fallback after short delay
      const t = setTimeout(fireReady, 400);
      return () => clearTimeout(t);
    }

    // We want:
    //  - Amplitude section open (done through defaultOpen prop)
    //  - Waves visible (requires clicking the Waves toggle button if present)
    // Strategy:
    //    Poll DOM a few times (in case of async render) and click the button when found.
    //    After clicking, wait a bit for SVG/D3 to render, then fire onReady.
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    const INTERVAL = 120;

    const intervalId = setInterval(() => {
      attempts++;
      const root = rootRef.current;
      if (!root) {
        if (attempts >= MAX_ATTEMPTS) fireReady();
        return;
      }

      // Click ALL buttons that show hidden content:
      // 1. Buttons with 👁️ emoji (show toggles)
      // 2. Buttons containing "Show Chart" (amplitude charts)
      // 3. Buttons/links with "View all" (expand all items)
      const allButtons = Array.from(root.querySelectorAll("button"));
      
      const showButtons = allButtons.filter(
        (b) => b.textContent.includes("👁️") || 
               /show\s*chart/i.test(b.textContent) ||
               /view\s*all/i.test(b.textContent)
      );

      if (showButtons.length) {
        showButtons.forEach(btn => btn.click());
        // Give D3 / React / Recharts some time to render charts
        setTimeout(fireReady, 600);
        clearInterval(intervalId);
      } else if (attempts >= MAX_ATTEMPTS) {
        // Could not find / already open
        fireReady();
        clearInterval(intervalId);
      }
    }, INTERVAL);

    return () => clearInterval(intervalId);
  }, [result]);

  if (!result) return null;

  const qubitCount =
    result.num_qubits ||
    result.numQubits ||
    (result.bloch_vectors && result.bloch_vectors.length) ||
    0;

  return (
    <div ref={rootRef} className="qt-report-root">
      <header className="qt-report-header">
        <div className="qt-report-brand">
          <div className="qt-report-title">Qubit-Tracer</div>
          <div className="qt-report-sub">Quantum Simulation Report</div>
        </div>
        <div className="qt-report-meta">
          <div>Date: {new Date().toLocaleDateString()}</div>
          <div>Qubits: {qubitCount}</div>
        </div>
      </header>

      <section className="qt-report-section">
        <h2>Executive Summary</h2>
        <p className="qt-report-p">
          This report summarizes the active quantum circuit simulation: visual Bloch
          geometry, probability & amplitude distributions, reduced density matrices and
          AI-assisted interpretation. All data reflects the final simulated quantum state
          snapshot provided.
        </p>
      </section>

      <section className="qt-report-section">
        <h2>Bloch State Visualization</h2>
        <BlochSphereGrid 
          vectors={result.bloch_vectors || []} 
          printCameraPosition={PRINT_CAMERA_POSITION}
        />
        <div className="qt-caption">
          Individual qubit Bloch spheres — standardized print camera perspective
        </div>
      </section>

      <section className="qt-report-section">
        <h2>State Inspection</h2>
        <div className="qt-report-inspector">
          <Inspector
            result={result}
            // Force all sections open including amplitudes
            defaultOpen={{
              qasm: true,
              bloch: true,
              density: true,
              probs: true,
              amps: true
            }}
          />
        </div>
      </section>

      {analysisText && (
        <section className="qt-report-section">
          <h2>AI Analysis</h2>
          <div className="qt-report-ai">
            <FormattedMessage content={analysisText} />
          </div>
        </section>
      )}

      <footer className="qt-report-footer">
        © {new Date().getFullYear()} Qubit-Tracer Professional Analysis
      </footer>
    </div>
  );
}