import React from "react";
import '../../styles/inspectorTheme.css';

export default function TimelineBar({ ops, currentStep, onJump }) {
  return (
    <div className="qt-tmpl-timeline">
      <div
        onClick={() => onJump(0)}
        className={`qt-tl-item ${currentStep === 0 ? 'active' : ''}`}
        style={{ minWidth: 60 }}
      >
        Init
      </div>
      {ops.map((op, i) => {
        const stepIndex = i + 1;
        return (
          <div
            key={i}
            onClick={() => onJump(stepIndex)}
            className={`qt-tl-item ${currentStep === stepIndex ? 'active' : ''}`}
            style={{ minWidth: 80 }}
          >
            <div style={{ fontWeight: 600 }}>{op.name.toUpperCase()}</div>
            <div style={{ opacity: 0.8 }}>
              {op.controls?.length ? `c:${op.controls.join(",")}` : ""}
              {op.targets.length ? ` q:${op.targets.join(",")}` : ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}