import React, { useEffect, useState, useRef } from 'react';
import { parseQasmToOps, simulateSnapshots } from '../../utils/quantumSimulator';
import StepControls from './StepControls';
import TimelineBar from './TimelineBar';
import { explainGate } from '../../utils/gateExplanations';
import AdvancedBlochViewer from '../AdvancedBlochViewer';

// If you already added these for fullscreen, keep as-is.
// If they are already imported above in your file, this duplicate import will be ignored by your bundler.
import { Box, Modal, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

export default function AdvancedInspectorPanel({ qasm, numQubits }) {
  const [ops, setOps] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  const PLAY_INTERVAL_MS = 1400;

  // If you already have this state from the fullscreen feature, keep your version.
  // Using the same name here so the visibility toggle below works with your existing code.
  const [viewerModalOpen, setViewerModalOpen] = useState(false);

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

  const effects = React.useMemo(() => {
    const arr = new Array(numQubits).fill(null);
    if (!currentOp) return arr;
    const name = currentOp.name;
    if (name === 'cx' || name === 'cz') {
      if (currentOp.controls?.length) arr[currentOp.controls[0]] = `${name}-control`;
      if (currentOp.targets?.length) arr[currentOp.targets[0]] = `${name}-target`;
    } else {
      currentOp.targets.forEach(q => { arr[q] = name; });
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
          {/* Hide the embedded viewer while the full-screen modal is open.
              This prevents the underlying Html basis labels (|+i>, |-i>, etc.) from showing through. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: 12,
              visibility: viewerModalOpen ? 'hidden' : 'visible'
            }}
          >
            <AdvancedBlochViewer
              vectors={vectors}
              labels={vectors.map((_, i) => `q[${i}]`)}
              effects={effects}
              stepKey={step}
            />
          </div>

          {/* If you already have this button + modal in your file, keep your version.
              This button is here only for completeness of context. */}
          <IconButton
            size="small"
            onClick={() => setViewerModalOpen(true)}
            title="Full screen viewer"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.8)' }
            }}
          >
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
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

      {/* Full-screen modal (keep your existing one if already added) */}
      <Modal
        open={viewerModalOpen}
        onClose={() => setViewerModalOpen(false)}
        keepMounted
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            bgcolor: theme => theme.palette.mode === 'dark' ? '#031018' : '#f5f9fc',
            outline: 'none'
          }}
        >
          <IconButton
            onClick={() => setViewerModalOpen(false)}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.9)' },
              backdropFilter: 'blur(4px)'
            }}
            title="Close"
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ position: 'absolute', inset: 0, p: { xs: 1, sm: 2, md: 3 } }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: { xs: 0, sm: 2 },
                overflow: 'hidden',
                border: theme => `1px solid ${theme.palette.divider}`
              }}
            >
              <AdvancedBlochViewer
                vectors={vectors}
                labels={vectors.map((_, i) => `q[${i}]`)}
                effects={effects}
                stepKey={step}
              />

              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  right: 24,
                  bottom: 12,
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.8)'
                    : 'rgba(255,255,255,0.9)',
                  px: 2,
                  py: 0.8,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 500,
                  backdropFilter: 'blur(4px)'
                }}
              >
                Advanced Inspector – Full Screen
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}