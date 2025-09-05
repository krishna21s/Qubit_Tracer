import React, { useEffect, useState, useRef } from 'react';
import CircuitBuilder from './CircuitBuilder';
import AdvancedBlochViewer from '../AdvancedBlochViewer';
import { parseQASM } from '../../utils/qasmUtils';
import { simulateCircuit } from '../../utils/localCircuitSimulator';
import './circuitBuilderModal.css';
import './circuitBuilder.css';

/**
 * Modal stays stylistically consistent but internally restructured for clarity & compactness.
 */
export default function CircuitBuilderModal({
  open,
  onClose,
  workingQasm,
  setWorkingQasm,
  onApply
}) {
  const [liveQasm, setLiveQasm] = useState(workingQasm || '');
  const [liveSim, setLiveSim] = useState(null);
  const [parseError, setParseError] = useState('');
  const [viewerCollapsed] = useState(false); // (future toggle if wanted)
  const [ampsCollapsed] = useState(false);

  // Refs for synchronized horizontal scrolling (grid + qasm)
  const gridScrollRef = useRef(null);
  const qasmScrollRef = useRef(null);

  // Sync liveQasm when opened
  useEffect(() => {
    if (open) setLiveQasm(workingQasm || '');
  }, [open, workingQasm]);

  // Debounced simulate
  useEffect(() => {
    if (!open) return;
    const h = setTimeout(() => {
      if (!liveQasm.trim()) {
        setLiveSim(null);
        setParseError('');
        return;
      }
      try {
        const circuit = parseQASM(liveQasm);
        const sim = simulateCircuit(circuit);
        setLiveSim({ ...sim, numQubits: circuit.numQubits });
        setParseError('');
      } catch {
        setParseError('Parse error');
        setLiveSim(null);
      }
    }, 220);
    return () => clearTimeout(h);
  }, [liveQasm, open]);

  if (!open) return null;

  const disabledApply = !!parseError || !liveQasm.trim();

  // Horizontal sync helper (optional extension ready)
  function syncHorizontal(e) {
    const src = e.target;
    if (gridScrollRef.current && qasmScrollRef.current) {
      if (src === gridScrollRef.current) {
        qasmScrollRef.current.scrollLeft = src.scrollLeft;
      } else if (src === qasmScrollRef.current) {
        gridScrollRef.current.scrollLeft = src.scrollLeft;
      }
    }
  }

  return (
    <div className="qb-modal-overlay">
      <div className="qb-modal-container qb-structured">
        <div className="qb-modal-header compact">
          <h5 className="qb-modal-title mb-0">Custom Circuit Builder</h5>
          <button className="qb-close-btn" onClick={onClose} aria-label="Close builder">✖</button>
        </div>

        <div className="qb-modal-body qb-layout-root">
          {/* LEFT COLUMN */}
            <div className="qb-left-root">
              {/* Top row: Gate palette + qubit size control is inside CircuitBuilder now.
                  We pass a class hook so internal layout compacts automatically. */}
              <div className="qb-left-scroll">
                <CircuitBuilder
                  externalQasm={liveQasm}
                  onQasmChange={(q) => {
                    setLiveQasm(q);
                    setWorkingQasm(q);
                  }}
                  disableExternalSync={false}
                  // internal scroll syncing pass-through (added minimal DOM refs if needed)
                  gridScrollRef={gridScrollRef}
                  qasmScrollRef={qasmScrollRef}
                  onHorizontalScroll={syncHorizontal}
                  compact
                />
              </div>
            </div>

          {/* RIGHT COLUMN */}
          <div className="qb-right-root">
            <div className={`qb-viewer-panel slim ${viewerCollapsed ? 'collapsed' : ''}`}>
              <div className="qb-panel-header tight">
                <span>Live Bloch Viewer</span>
                {parseError && <span className="qb-badge-error">{parseError}</span>}
              </div>
              {!viewerCollapsed && (
                <div className="qb-viewer-area compact">
                  {liveSim?.blochVectors?.length ? (
                    <AdvancedBlochViewer
                      vectors={liveSim.blochVectors}
                      labels={liveSim.blochVectors.map((_, i) => `q[${i}]`)}
                    />
                  ) : (
                    <div className="qb-empty small">No gates yet. Drop gates to build a circuit.</div>
                  )}
                </div>
              )}
            </div>

            <div className={`qb-state-panel slim ${ampsCollapsed ? 'collapsed' : ''}`}>
              <div className="qb-panel-header tight">
                <span>Live Amplitudes (Top 8)</span>
              </div>
              {!ampsCollapsed && (
                <div className="qb-scroll-section compact">
                  {liveSim?.amplitudes ? (
                    <table className="qb-mini-table compact">
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>State</th>
                          <th style={{ width: 46 }}>Re</th>
                          <th style={{ width: 46 }}>Im</th>
                          <th style={{ width: 60 }}>|α|²</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(liveSim.amplitudes)
                          .sort((a, b) => b[1].prob - a[1].prob)
                          .slice(0, 8)
                          .map(([bits, { re, im, prob }]) => (
                            <tr key={bits}>
                              <td className="qb-bits">{bits}</td>
                              <td>{re.toFixed(3)}</td>
                              <td>{im.toFixed(3)}</td>
                              <td>{(prob * 100).toFixed(2)}%</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="qb-empty-sm">No state</div>
                  )}
                </div>
              )}
            </div>

            <div className="qb-tip-box">
              <div className="qb-tip-title">Hints</div>
              <ul className="qb-tip-list">
                <li>Drag gates onto a column cell</li>
                <li>CX: pick control, then click target</li>
                <li>Rotate gates: ✏ to edit θ</li>
                <li>Undo / Redo: Ctrl/Cmd+Z / Y</li>
                <li>Parse All: button or Ctrl/Cmd+Enter</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="qb-modal-footer compact">
          <div className="qb-footer-left small-hint">
            Edits persist automatically. Apply to promote this circuit to main simulation.
          </div>
          <div className="qb-footer-actions">
            <button className="qb-btn" onClick={onClose}>Close</button>
            <button
              className="qb-btn primary"
              disabled={disabledApply}
              title={parseError ? 'Fix parse error to enable Apply' : 'Apply and close'}
              onClick={() => {
                if (disabledApply) return;
                onApply?.(liveQasm);
                onClose();
              }}
            >
              {parseError ? 'Fix Errors' : 'Apply & Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}