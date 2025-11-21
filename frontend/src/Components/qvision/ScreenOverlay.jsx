import React from "react";
import GlowBox from "./GlowBox";

export default function ScreenOverlay({
  detections,
  captureWidth,
  captureHeight,
}) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const scaleX = screenWidth / captureWidth;
  const scaleY = screenHeight / captureHeight;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999998,
        pointerEvents: "none",
      }}
    >
      {detections.map((d, i) => {
        const [x, y, w, h] = d.bbox;

        return (
          <GlowBox
            key={i}
            x={x * scaleX}
            y={y * scaleY}
            width={w * scaleX}
            height={h * scaleY}
          />
        );
      })}
    </div>
  );
}
