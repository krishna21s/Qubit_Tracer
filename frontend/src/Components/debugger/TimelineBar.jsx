import React from "react";

export default function TimelineBar({ ops, currentStep, onJump }) {
  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        gap: 4,
        padding: "6px 4px",
        background: "#0f1724",
        border: "1px solid #233445",
        borderRadius: 8,
      }}
    >
      <div
        onClick={() => onJump(0)}
        style={{
          minWidth: 60,
          padding: "4px 8px",
          cursor: "pointer",
          background: currentStep === 0 ? "#2563eb" : "#1e2937",
          color: "#fff",
          borderRadius: 6,
          fontSize: 12,
          textAlign: "center",
        }}
      >
        Init
      </div>
      {ops.map((op, i) => {
        const stepIndex = i + 1;
        return (
          <div
            key={i}
            onClick={() => onJump(stepIndex)}
            style={{
              minWidth: 80,
              padding: "4px 6px",
              cursor: "pointer",
              background: currentStep === stepIndex ? "#2563eb" : "#1e2937",
              color: "#fff",
              borderRadius: 6,
              fontSize: 11,
              lineHeight: 1.2,
            }}
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
