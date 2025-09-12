import React from 'react';
import '../../styles/inspectorTheme.css';

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
    <div className="qt-tmpl-step-controls">
      <button onClick={onReset} title="Reset" disabled={step === 0}>⏹</button>
      <button onClick={onPrev} title="Previous" disabled={step === 0}>⏪</button>
      <button onClick={onPlayToggle} title={playing ? 'Pause' : 'Play'}>
        {playing ? '⏸' : '▶️'}
      </button>
      <button onClick={onNext} title="Next" disabled={step === total}>⏩</button>
      <button onClick={onEnd} title="Jump to end" disabled={step === total}>⏭</button>
      <div className="qt-step-meta">
        Step {step} / {total}
      </div>
    </div>
  );
}