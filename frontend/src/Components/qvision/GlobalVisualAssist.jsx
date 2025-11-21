import React, { useEffect, useRef, useState, useCallback } from "react";
import VisualAssistButton from "./VisualAssistButton";

const EDGE_OFFSET = 24;
const BUTTON_SIZE = 64; // approximate footprint including shadow
const DRAG_THRESHOLD = 6;

export default function GlobalVisualAssist() {
  const [position, setPosition] = useState({ x: EDGE_OFFSET, y: EDGE_OFFSET });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPosition({
      x: Math.max(EDGE_OFFSET, window.innerWidth - BUTTON_SIZE - EDGE_OFFSET),
      y: Math.max(EDGE_OFFSET, window.innerHeight - BUTTON_SIZE - EDGE_OFFSET),
    });
  }, []);

  const clampToViewport = useCallback((value, maxValue) => {
    return Math.min(Math.max(EDGE_OFFSET, value), Math.max(EDGE_OFFSET, maxValue));
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!dragRef.current || typeof window === "undefined") return;
      const { startX, startY, originX, originY } = dragRef.current;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (!dragRef.current.hasDragged) {
        const distance = Math.hypot(dx, dy);
        if (distance < DRAG_THRESHOLD) {
          return;
        }
        dragRef.current.hasDragged = true;
        suppressClickRef.current = true;
      }

      const nextX = originX + dx;
      const nextY = originY + dy;
      const maxX = window.innerWidth - BUTTON_SIZE;
      const maxY = window.innerHeight - BUTTON_SIZE;

      setPosition({
        x: clampToViewport(nextX, maxX),
        y: clampToViewport(nextY, maxY),
      });
    },
    [clampToViewport]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    if (suppressClickRef.current) {
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback(
    (event) => {
      if (event.button !== 0) return;
      if (!event.target.closest('[data-va-trigger="button"]')) return;
      setDragging(true);
      dragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: position.x,
        originY: position.y,
        hasDragged: false,
      };
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [handlePointerMove, handlePointerUp, position.x, position.y]
  );

  const handleClickCapture = useCallback((event) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onClickCapture={handleClickCapture}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 100000,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <VisualAssistButton />
    </div>
  );
}
