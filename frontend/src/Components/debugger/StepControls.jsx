import React from 'react';

export default function StepControls({
  step,
  total,
  playing,
  onPlayToggle,
  onNext,
  onPrev,
  onReset,
  onEnd
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#14202c',
      padding: '8px 10px',
      borderRadius: 8,
      border: '1px solid #233445'
    }}>
      <button onClick={onReset} title="Reset" disabled={step === 0}>⏹</button>
      <button onClick={onPrev} title="Previous" disabled={step === 0}>⏪</button>
      <button onClick={onPlayToggle} title={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶️'}
      </button>
      <button onClick={onNext} title="Next" disabled={step === total}>⏩</button>
      <button onClick={onEnd} title="Jump to end" disabled={step === total}>⏭</button>
      <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9fb4c8' }}>
        Step {step} / {total}
      </div>
    </div>
  );
}