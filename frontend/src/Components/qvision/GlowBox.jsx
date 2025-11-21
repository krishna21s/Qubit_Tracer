import React from "react";

export default function GlowBox({ x, y, width, height }) {
  const style = {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    borderRadius: "14px",
    pointerEvents: "none",
    zIndex: 999999,

    /* Transparent interior */
    background: "transparent",

    /* Border only - using animated conic gradient */
    border: "1px solid transparent",
    borderImage:
      "conic-gradient(#ff5c5c, #ffbe3d, #4ade80, #60a5fa, #a855f7, #ff5c5c) 1",
    animation:
      "rotateBorder 6s linear infinite, geminiPulse 2.5s ease-in-out infinite",

    /* Glow */
    boxShadow: `
  0 0 10px rgba(255,92,92),
  0 0 10px rgba(255,190,61),
  0 0 10px rgba(74,222,128),
  0 0 10px rgba(96,165,250),
 
    `,
  };

  return <div style={style}></div>;
}
