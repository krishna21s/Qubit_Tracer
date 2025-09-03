import React, { useEffect, useState } from 'react';
import CircuitBuilder from './CircuitBuilder';
import AdvancedBlochViewer from '../AdvancedBlochViewer';
import { parseQASM } from '../../utils/qasmUtils';
import { simulateCircuit } from '../../utils/localCircuitSimulator';
import './circuitBuilderModal.css';

/**
 * Props:
 *  - open
 *  - onClose()
 *  - workingQasm (live persistent builder text)
 *  - setWorkingQasm(fn)
 *  - onApply(qasm)   (called when user clicks Apply & Close)
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

  // When modal opens, seed liveQasm from persistent workingQasm
  useEffect(() => {
    if (open) {
      setLiveQasm(workingQasm || '');
    }
  }, [open, workingQasm]);

  // Re-simulate debounced on liveQasm
  useEffect(() => {
    if (!open) return;
    const h = setTimeout(() => {
      try {
        const circuit = parseQASM(liveQasm || '');
        const sim = simulateCircuit(circuit);
        setLiveSim({ ...sim, numQubits: circuit.numQubits });
        setParseError('');
      } catch {
        setParseError('Parse error');
      }
    }, 200);
    return () => clearTimeout(h);
  }, [liveQasm, open]);

  if (!open) return null;

  return (
    <div className="qb-modal-overlay">
      <div className="qb-modal-container">
        <div className="qb-modal-header">
          <h5 className="qb-modal-title mb-0">Custom Circuit Builder</h5>
          <button className="qb-close-btn" onClick={onClose} aria-label="Close builder">✖</button>
        </div>

        <div className="qb-modal-body">
          <div className="qb-left-pane">
            <CircuitBuilder
              externalQasm={liveQasm}
              onQasmChange={(q) => {
                setLiveQasm(q);
                setWorkingQasm(q); // Persist immediately
              }}
              disableExternalSync={false} /* internal sync uses prop only when opening */
            />
          </div>

          <div className="qb-right-pane">
            <div className="qb-viewer-panel">
              <div className="qb-panel-header">
                <span>Live Bloch Viewer</span>
                {parseError && <span className="qb-badge-error">{parseError}</span>}
              </div>
              <div className="qb-viewer-area">
                {liveSim?.blochVectors?.length ? (
                  <AdvancedBlochViewer
                    vectors={liveSim.blochVectors}
                    labels={liveSim.blochVectors.map((_, i) => `q[${i}]`)}
                  />
                ) : (
                  <div className="qb-empty">No gates yet. Drop gates to build a circuit.</div>
                )}
              </div>
            </div>

            <div className="qb-state-panel">
              <div className="qb-panel-header">
                <span>Live Amplitudes (Top 8)</span>
              </div>
              <div className="qb-scroll-section">
                {liveSim?.amplitudes ? (
                  <table className="qb-mini-table">
                    <thead>
                      <tr>
                        <th>State</th>
                        <th>Re</th>
                        <th>Im</th>
                        <th>|α|²</th>
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
            </div>
          </div>
        </div>

        <div className="qb-modal-footer">
          <div className="qb-footer-left">
            <span style={{ fontSize: 12, color: '#88b6cc' }}>
              Edits persist automatically. Apply to promote this circuit to main simulation.
            </span>
          </div>
          <div className="qb-footer-actions">
            <button className="qb-btn" onClick={onClose}>Close</button>
            <button
              className="qb-btn primary"
              onClick={() => {
                onApply?.(liveQasm);
                onClose();
              }}
            >
              Apply &amp; Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}