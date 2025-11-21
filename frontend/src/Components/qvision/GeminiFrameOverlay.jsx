import React from "react";

export default function GeminiFrameOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999997,
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "18px",
          padding: "3px",
          background: "transparent",
          border: "4px solid transparent",
          borderImage:
            "conic-gradient(#ff5c5c, #ffbe3d, #4ade80, #60a5fa, #a855f7, #ff5c5c) 1",
          animation:
            "rotateGemini 6s linear infinite, geminiPulse 2.7s ease-in-out infinite",
          filter: "blur(6px)",
          opacity: 0.95,
        }}
      />

      {/* Sharp inner ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "15px",
          border: "2px solid rgba(214, 156, 64, 0.55)",
          boxShadow:
            "0 0 14px rgba(255,255,255,0.25), inset 0 0 20px rgba(207, 52, 199, 0.35),  inset 0 0 20px rgba(21, 21, 120, 0.2)",
        }}
      />
    </div>
  );
}
