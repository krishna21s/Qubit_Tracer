/**
 * GateElement.jsx — SVG renderer for a single quantum gate on the canvas.
 *
 * Renders different shapes based on gate type:
 *   - Single-qubit:  coloured rounded rect + symbol text
 *   - CNOT:          control dot ● + target ⊕ + vertical connector
 *   - CZ:            two control dots ● connected
 *   - SWAP:          two × marks connected
 *   - Toffoli:       two control dots + target ⊕
 *   - Measure:       meter arc + arrow
 *   - Barrier:       dashed vertical line
 *   - Parametric:    rect + param value below
 */

import React from 'react';
import { getGateDef, formatAngle } from '../../data/gateDefinitions';

// Layout constants — must match qcircuit.css tokens
const CELL_W      = 72;
const CELL_H      = 64;
const GATE_SIZE   = 44;
const LABEL_W     = 54;

/** Convert grid coords → SVG pixel centre. */
export function cellCenter(col, qubit) {
  return {
    x: LABEL_W + col * CELL_W + CELL_W / 2,
    y: qubit * CELL_H + CELL_H / 2,
  };
}

export { CELL_W, CELL_H, GATE_SIZE, LABEL_W };

// ─── Component ─────────────────────────────────────────────────

export default function GateElement({
  gate,        // { id, type, qubits, col, params }
  selected,
  ghost,       // true for placement preview
  onClick,
  onMouseDown,
  peerColor,   // if a remote peer has this gate selected
}) {
  const def = getGateDef(gate.type);
  if (!def) return null;

  const sortedQubits = [...gate.qubits].sort((a, b) => a - b);
  const minQ = sortedQubits[0];
  const maxQ = sortedQubits[sortedQubits.length - 1];
  const center = cellCenter(gate.col, minQ);

  const className = [
    'qc-gate-group',
    selected ? 'selected' : '',
    ghost    ? 'qc-gate-ghost' : '',
  ].filter(Boolean).join(' ');

  // ── BARRIER ─────────────────────────────────────────────────
  if (gate.type === 'BARRIER') {
    const topY    = sortedQubits[0] * CELL_H + 8;
    const bottomY = sortedQubits[sortedQubits.length - 1] * CELL_H + CELL_H - 8;
    const x       = LABEL_W + gate.col * CELL_W + CELL_W / 2;
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        <line
          x1={x} y1={topY} x2={x} y2={bottomY}
          className="qc-gate-barrier"
          stroke={def.color}
          opacity={0.6}
        />
      </g>
    );
  }

  // ── CNOT (2-qubit controlled gate) ──────────────────────────
  if (gate.type === 'CNOT') {
    const controlQ = gate.qubits[0];
    const targetQ  = gate.qubits[1];
    const cc = cellCenter(gate.col, controlQ);
    const tc = cellCenter(gate.col, targetQ);
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        {/* connector line */}
        <line x1={cc.x} y1={cc.y} x2={tc.x} y2={tc.y}
              className="qc-gate-connector" stroke={def.color} />
        {/* control dot */}
        <circle cx={cc.x} cy={cc.y} r={6}
                className="qc-gate-control-dot"
                fill={def.color} stroke={def.color} />
        {/* target circle with + */}
        <circle cx={tc.x} cy={tc.y} r={14}
                className="qc-gate-target-circle"
                stroke={def.color} />
        <line x1={tc.x} y1={tc.y - 14} x2={tc.x} y2={tc.y + 14}
              className="qc-gate-target-plus" stroke={def.color} />
        <line x1={tc.x - 14} y1={tc.y} x2={tc.x + 14} y2={tc.y}
              className="qc-gate-target-plus" stroke={def.color} />
        {/* Invisible hit area */}
        <rect x={tc.x - 18} y={Math.min(cc.y, tc.y) - 18}
              width={36} height={Math.abs(tc.y - cc.y) + 36}
              fill="transparent" />
        {/* peer selection */}
        {peerColor && (
          <rect x={tc.x - 18} y={Math.min(cc.y, tc.y) - 10}
                width={36} height={Math.abs(tc.y - cc.y) + 20}
                fill="none" stroke={peerColor} strokeWidth={2}
                strokeDasharray="4 3" rx={6} />
        )}
      </g>
    );
  }

  // ── CZ (two control dots) ───────────────────────────────────
  if (gate.type === 'CZ') {
    const q0 = cellCenter(gate.col, gate.qubits[0]);
    const q1 = cellCenter(gate.col, gate.qubits[1]);
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        <line x1={q0.x} y1={q0.y} x2={q1.x} y2={q1.y}
              className="qc-gate-connector" stroke={def.color} />
        <circle cx={q0.x} cy={q0.y} r={6}
                className="qc-gate-control-dot" fill={def.color} stroke={def.color} />
        <circle cx={q1.x} cy={q1.y} r={6}
                className="qc-gate-control-dot" fill={def.color} stroke={def.color} />
        <rect x={q0.x - 12} y={Math.min(q0.y, q1.y) - 12}
              width={24} height={Math.abs(q1.y - q0.y) + 24}
              fill="transparent" />
      </g>
    );
  }

  // ── SWAP (two × marks) ──────────────────────────────────────
  if (gate.type === 'SWAP') {
    const q0 = cellCenter(gate.col, gate.qubits[0]);
    const q1 = cellCenter(gate.col, gate.qubits[1]);
    const s = 8;
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        <line x1={q0.x} y1={q0.y} x2={q1.x} y2={q1.y}
              className="qc-gate-connector" stroke={def.color} />
        {/* × at q0 */}
        <line x1={q0.x - s} y1={q0.y - s} x2={q0.x + s} y2={q0.y + s}
              className="qc-gate-swap-x" stroke={def.color} />
        <line x1={q0.x + s} y1={q0.y - s} x2={q0.x - s} y2={q0.y + s}
              className="qc-gate-swap-x" stroke={def.color} />
        {/* × at q1 */}
        <line x1={q1.x - s} y1={q1.y - s} x2={q1.x + s} y2={q1.y + s}
              className="qc-gate-swap-x" stroke={def.color} />
        <line x1={q1.x + s} y1={q1.y - s} x2={q1.x - s} y2={q1.y + s}
              className="qc-gate-swap-x" stroke={def.color} />
        <rect x={q0.x - 14} y={Math.min(q0.y, q1.y) - 14}
              width={28} height={Math.abs(q1.y - q0.y) + 28}
              fill="transparent" />
      </g>
    );
  }

  // ── CCX / Toffoli (3-qubit) ─────────────────────────────────
  if (gate.type === 'CCX') {
    const c0 = cellCenter(gate.col, gate.qubits[0]);
    const c1 = cellCenter(gate.col, gate.qubits[1]);
    const tg = cellCenter(gate.col, gate.qubits[2]);
    const topY = Math.min(c0.y, c1.y, tg.y);
    const botY = Math.max(c0.y, c1.y, tg.y);
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        <line x1={c0.x} y1={topY} x2={c0.x} y2={botY}
              className="qc-gate-connector" stroke={def.color} />
        <circle cx={c0.x} cy={c0.y} r={6}
                className="qc-gate-control-dot" fill={def.color} stroke={def.color} />
        <circle cx={c1.x} cy={c1.y} r={6}
                className="qc-gate-control-dot" fill={def.color} stroke={def.color} />
        <circle cx={tg.x} cy={tg.y} r={14}
                className="qc-gate-target-circle" stroke={def.color} />
        <line x1={tg.x} y1={tg.y - 14} x2={tg.x} y2={tg.y + 14}
              className="qc-gate-target-plus" stroke={def.color} />
        <line x1={tg.x - 14} y1={tg.y} x2={tg.x + 14} y2={tg.y}
              className="qc-gate-target-plus" stroke={def.color} />
        <rect x={tg.x - 18} y={topY - 10}
              width={36} height={botY - topY + 20}
              fill="transparent" />
      </g>
    );
  }

  // ── MEASURE ─────────────────────────────────────────────────
  if (gate.type === 'MEASURE') {
    const half = GATE_SIZE / 2;
    return (
      <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
        <rect className="qc-gate-body"
              x={center.x - half} y={center.y - half}
              width={GATE_SIZE} height={GATE_SIZE}
              rx={10} ry={10}
              fill="var(--qt-paper, var(--qt-surface, #ffffff))"
              stroke="var(--qt-border, #e5e7eb)"
              strokeWidth={1.5} />
        {/* meter arc */}
        <path
          d={`M ${center.x - 12} ${center.y + 6}
              A 14 14 0 0 1 ${center.x + 12} ${center.y + 6}`}
          className="qc-gate-measure-arc"
          stroke="var(--qt-text, #111827)"
          strokeWidth={1.5} fill="none"
        />
        {/* arrow from center up-right */}
        <line x1={center.x} y1={center.y + 6}
              x2={center.x + 10} y2={center.y - 12}
              className="qc-gate-measure-arrow" 
              stroke="var(--qt-text, #111827)" strokeWidth={1.5} />
        {/* peer selection */}
        {peerColor && (
          <rect x={center.x - half - 3} y={center.y - half - 3}
                width={GATE_SIZE + 6} height={GATE_SIZE + 6}
                fill="none" stroke={peerColor} strokeWidth={2}
                strokeDasharray="4 3" rx={8} />
        )}
      </g>
    );
  }

  // ── Default: single-qubit box gate ──────────────────────────
  const half = GATE_SIZE / 2;
  const hasParams = def.params && def.params.length > 0;
  const paramText = hasParams
    ? def.params.map(p => formatAngle(gate.params?.[p.name] ?? p.default)).join(', ')
    : null;

  return (
    <g className={className} onClick={onClick} onMouseDown={onMouseDown}>
      {/* Gate body */}
      <rect className="qc-gate-body"
            x={center.x - half} y={center.y - half}
            width={GATE_SIZE} height={GATE_SIZE}
            rx={10} ry={10}
            fill="var(--qt-paper, var(--qt-surface, #ffffff))"
            stroke="var(--qt-border, #e5e7eb)"
            strokeWidth={1.5}
      />
      {/* Gate symbol */}
      <text className="qc-gate-label"
            x={center.x} y={center.y}
            fill="var(--qt-text, #111827)"
            textAnchor="middle"
            dominantBaseline="central"
            fontWeight="bold"
            fontSize={def.symbol.length > 2 ? 14 : 18}>
        {def.symbol}
      </text>
      {/* Parameter value beneath */}
      {paramText && (
        <text className="qc-gate-param-label"
              x={center.x} y={center.y + half + 3}
              textAnchor="middle"
              dominantBaseline="hanging">
          {paramText}
        </text>
      )}
      {/* peer selection */}
      {peerColor && (
        <rect x={center.x - half - 3} y={center.y - half - 3}
              width={GATE_SIZE + 6} height={GATE_SIZE + 6}
              fill="none" stroke={peerColor} strokeWidth={2}
              strokeDasharray="4 3" rx={8} />
      )}
    </g>
  );
}
