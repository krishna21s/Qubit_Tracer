import React, { useEffect, useState, useRef } from 'react';
import { parseQasmToOps, simulateSnapshots } from '../../utils/quantumSimulator';
import StepControls from './StepControls';
import TimelineBar from './TimelineBar';
import { explainGate } from '../../utils/gateExplanations';
import AdvancedBlochViewer from '../AdvancedBlochViewer';

export default function AdvancedInspectorPanel({ qasm, numQubits }) {
  const [ops, setOps] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const PLAY_INTERVAL_MS = 1400;

  useEffect(() => {
    if (!qasm) return;
    const parsed = parseQasmToOps(qasm);
    setOps(parsed);
    const snaps = simulateSnapshots(numQubits, parsed);
    setSnapshots(snaps);
    setStep(0);
    setPlaying(false);
  }, [qasm, numQubits]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (step >= ops.length) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setStep(s => Math.min(s + 1, ops.length));
    }, PLAY_INTERVAL_MS);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [playing, step, ops.length]);

  if (!qasm) {
    return (
      <div style={{
        padding: 24, border: '1px solid #244055', borderRadius: 14,
        background: 'linear-gradient(145deg,#0e1824 0%,#112433 100%)',
        color: '#9fb4c8'
      }}>
        No circuit loaded. Run a simulation on the Home page first.
      </div>
    );
  }

  const currentSnapshot = snapshots[step];
  const currentOp = step === 0 ? null : ops[step - 1];
  const expl = explainGate(currentOp);
  const vectors = currentSnapshot
    ? (currentSnapshot.blochVectors || currentSnapshot.bloch_vectors || [])
    : [];

  // Derive per-qubit "effects" so viewer can trigger a pulse even if vector unchanged
  const effects = React.useMemo(() => {
    const arr = new Array(numQubits).fill(null);
    if (!currentOp) return arr;
    const name = currentOp.name;
    if (name === 'cx' || name === 'cz') {
      if (currentOp.controls?.length) arr[currentOp.controls[0]] = `${name}-control`;
      if (currentOp.targets?.length) arr[currentOp.targets[0]] = `${name}-target`;
    } else {
      currentOp.targets.forEach(q => {
        arr[q] = name; // e.g. 'h', 'x', 'rz', etc.
      });
    }
    return arr;
  }, [currentOp, numQubits]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 380px', minWidth: 340 }}>
          <StepControls
            step={step}
            total={ops.length}
            playing={playing}
            onPlayToggle={() => setPlaying(p => !p)}
            onNext={() => setStep(s => Math.min(s + 1, ops.length))}
            onPrev={() => setStep(s => Math.max(s - 1, 0))}
            onReset={() => { setStep(0); setPlaying(false); }}
            onEnd={() => { setStep(ops.length); setPlaying(false); }}
          />
          <div style={{ marginTop: 12 }}>
            <TimelineBar
              ops={ops}
              currentStep={step}
              onJump={(s) => { setStep(s); setPlaying(false); }}
            />
          </div>

          <div style={{
            marginTop: 16,
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid #244055',
            background: 'linear-gradient(160deg,#0e1c29 0%,#102b3d 100%)'
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#e0f5ff' }}>{expl.title}</div>
            <div style={{ marginTop: 6, fontSize: 13, color: '#9fb4c8', lineHeight: 1.5 }}>
              {expl.text}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, letterSpacing: 0.3, color: '#5aaad8' }}>
              {step === 0
                ? 'Initial state: all amplitude in |0...0>.'
                : `After step ${step} of ${ops.length}.`}
            </div>
          </div>

          {currentSnapshot && (
            <div style={{
              marginTop: 16,
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid #244055',
              background: '#0f1d2a',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e0f5ff', marginBottom: 8 }}>
                Top Probabilities (step {step})
              </div>
              {(Object.entries(currentSnapshot.probabilities)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([bits, p]) => (
                  <div key={bits} style={{ fontSize: 12, color: '#9fb4c8' }}>
                    {bits}: {(p * 100).toFixed(2)}%
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{
          flex: '2 1 600px',
          minHeight: 460,
          minWidth: 540,
          border: '1px solid #244055',
          borderRadius: 16,
          background: 'linear-gradient(145deg,#08141e,#0c2232)',
          position: 'relative',
          padding: 12
        }}>
          <div style={{ position: 'absolute', inset: 0, padding: 12 }}>
            <AdvancedBlochViewer
              vectors={vectors}
              labels={vectors.map((_, i) => `q[${i}]`)}
              effects={effects}
              stepKey={step}   // forces spheres to evaluate effect each step
            />
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 4,
        padding: '14px 18px',
        borderRadius: 12,
        border: '1px solid #244055',
        background: 'linear-gradient(160deg,#0f2230 0%,#113043 100%)',
        fontSize: 12,
        color: '#6baed4'
      }}>
        Hint: Use ▶️ to auto-play. You can jump directly to any gate in the timeline above. Bloch vectors shrink when a qubit becomes entangled (mixed state). Visual pulses show gates even if the reduced Bloch vector cannot move (maximally mixed).
      </div>
    </div>
  );
}