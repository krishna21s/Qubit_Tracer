import React, { useMemo, useRef, useCallback, useState } from 'react';
import './visualCircuit.css';

/**
 * VisualCircuitRenderer
 * NOTE: Alignment is controlled by your CSS (unchanged).
 * This revision ONLY changes the export logic to a manual canvas renderer
 * so horizontal wires + vertical connectors reliably appear in the PNG.
 */
export default function VisualCircuitRenderer({ qasm }) {
  const rootRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const parsed = useMemo(() => parseQasm(qasm || ''), [qasm]);

  const handleDownload = useCallback(async () => {
    if (!parsed.gates.length) return;

    // ---------- 1. Geometry constants (match your CURRENT CSS) ----------
    const COL_W = 70;                 // --qcvis-col-width
    const WIRE_H = 46;                // --qcvis-wire-height
    const GATE_SIZE = 34;             // --qcvis-gate-size
    const DOT_SIZE = 24;
    const STAGE_LEFT_PAD = 46;        // .qcvis-stage padding-left
    const MARGIN_LEFT = 35;           // margin-left applied to positioned elements
    const CENTER_OFFSET_IN_STAGE = 55; // gate/dot column center inside stage (col*C + 55)
    const RIGHT_PAD = 60;             // extra breathing space at right for wires/meta
    const META_BLOCK_HEIGHT = 56;     // space for meta line at bottom

    // Helpers
    const centerX = (col) => STAGE_LEFT_PAD + CENTER_OFFSET_IN_STAGE + col * COL_W;
    const gateLeft = (col) => STAGE_LEFT_PAD + MARGIN_LEFT + col * COL_W + 3;
    const dotLeft = (col) => STAGE_LEFT_PAD + MARGIN_LEFT + col * COL_W + 8;
    const wireY = (row) => row * WIRE_H + WIRE_H / 2;

    // Width: ensure last column fully visible
    const lastCol = Math.max(parsed.columns - 1, 0);
    const minContentWidth = centerX(lastCol) + GATE_SIZE / 2 + RIGHT_PAD;
    const width = Math.ceil(minContentWidth);
    const height = parsed.qubits * WIRE_H + META_BLOCK_HEIGHT;

    try {
      setDownloading(true);

      // ---------- 2. Theme colors ----------
      const cs = getComputedStyle(document.documentElement);
      const getVar = (n, fb) => {
        const v = cs.getPropertyValue(n).trim();
        return v || fb;
      };
      const bg = getVar('--qt-bg-main', '#0b1620') || getVar('--qt-surface', '#0b1620');
      const accent = getVar('--qt-accent', '#4cc3fa');
      const accentAlt = getVar('--qt-accent-alt', '#1781cc');
      const border = getVar('--qt-border', '#26506a');
      const textCol = getVar('--qt-text', '#e6f6ff');
      const textDim = getVar('--qt-text-dim', '#9fb4c8');
      const gateFill = getVar('--qt-surface', '#142733');
      const gateFillAlt = getVar('--qt-surface-alt', '#1c3645');
      const measureGradA = getVar('--qt-gradient-accent', '#1779c2');
      const measureGradB = getVar('--qt-accent-alt', '#12649f');

      // ---------- 3. Canvas setup ----------
      const dpr = Math.min(3, (window.devicePixelRatio || 1) * 1.2);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // ---------- 4. Draw wires ----------
      // Gradient along the full width
      const wireGrad = ctx.createLinearGradient(STAGE_LEFT_PAD, 0, width - RIGHT_PAD, 0);
      wireGrad.addColorStop(0.0, hexWithAlpha(accent, 0));
      wireGrad.addColorStop(0.08, hexWithAlpha(accent, 0.65));
      wireGrad.addColorStop(0.5, hexWithAlpha(accentAlt, 0.72));
      wireGrad.addColorStop(0.92, hexWithAlpha(accentAlt, 0.65));
      wireGrad.addColorStop(1.0, hexWithAlpha(accentAlt, 0));

      for (let q = 0; q < parsed.qubits; q++) {
        const y = wireY(q);

        // Label (to left of stage; we mimic your current visual which shows labels inside stage offset)
        ctx.font = '600 12px Inter,system-ui,sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textDim;
        ctx.fillText(`q[${q}]`, STAGE_LEFT_PAD - 10, y);

        // Wire glow pass (thicker, faint)
        ctx.lineCap = 'round';
        ctx.strokeStyle = hexWithAlpha(accentAlt, 0.28);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(STAGE_LEFT_PAD, y);
        ctx.lineTo(width - RIGHT_PAD, y);
        ctx.stroke();

        // Main wire
        ctx.strokeStyle = wireGrad;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(STAGE_LEFT_PAD, y);
        ctx.lineTo(width - RIGHT_PAD, y);
        ctx.stroke();
      }

      // ---------- 5. Precompute vertical connectors (multi-qubit gates) ----------
      function drawVerticalConnector(xC, yTop, yBottom) {
        // Glow
        ctx.strokeStyle = hexWithAlpha(accentAlt, 0.35);
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(xC, yTop);
        ctx.lineTo(xC, yBottom);
        ctx.stroke();
        // Main gradient line (rect style)
        const vGrad = ctx.createLinearGradient(0, yTop, 0, yBottom);
        vGrad.addColorStop(0, accent);
        vGrad.addColorStop(1, accentAlt);
        ctx.strokeStyle = vGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(xC, yTop);
        ctx.lineTo(xC, yBottom);
        ctx.stroke();
      }

      // ---------- 6. Draw gates (two-pass: connectors first, then nodes/gates so they sit above wires) ----------
      // Pass A: vertical connectors
      parsed.gates.forEach(g => {
        if (g.type === 'cx' || g.type === 'cz') {
          const top = Math.min(g.control, g.target);
            const bottom = Math.max(g.control, g.target);
            drawVerticalConnector(centerX(g.col), wireY(top), wireY(bottom));
        } else if (g.type === 'ccx') {
          const rows = [...g.controls, g.target];
          const top = Math.min(...rows);
          const bottom = Math.max(...rows);
          drawVerticalConnector(centerX(g.col), wireY(top), wireY(bottom));
        }
      });

      // Pass B: nodes and single-qubit gates
      parsed.gates.forEach(g => {
        if (g.type === 'cx' || g.type === 'cz') {
          const xC = centerX(g.col);
          // Control dot
          drawDot(xC, wireY(g.control), accent, gateFill, false);
          // Target
          if (g.type === 'cx') {
            drawTargetCircle(xC, wireY(g.target), accentAlt, gateFillAlt, '⊕');
          } else {
            drawTargetCircle(xC, wireY(g.target), accent, gateFillAlt, '•');
          }
          return;
        }
        if (g.type === 'ccx') {
          const xC = centerX(g.col);
          g.controls.forEach(c => drawDot(xC, wireY(c), accent, gateFill, false));
          drawTargetCircle(xC, wireY(g.target), accentAlt, gateFillAlt, '⊕');
          return;
        }
        if (g.type === 'measure') {
          drawGateBox(gateLeft(g.col), wireY(g.qubit) - GATE_SIZE / 2, 'M', true);
          return;
        }
        // Single-qubit standard
        drawGateBox(gateLeft(g.col), wireY(g.qubit) - GATE_SIZE / 2, g.label || g.type.toUpperCase(), false, g.param);
      });

      // ---------- 7. Meta footer ----------
      ctx.font = '600 11px Inter,system-ui,sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = textDim;
      const metaY = parsed.qubits * WIRE_H + 12;
      ctx.fillText(`${parsed.qubits} qubits`, STAGE_LEFT_PAD, metaY);
      ctx.fillText(`${parsed.gates.length} gates`, STAGE_LEFT_PAD + 110, metaY);
      ctx.fillText(`${parsed.columns} columns`, STAGE_LEFT_PAD + 220, metaY);

      // ---------- 8. Export PNG ----------
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      canvas.toBlob(blob => {
        if (!blob) {
          alert('Export failed (blob null)');
          setDownloading(false);
          return;
        }
        const a = document.createElement('a');
        a.download = `circuit-diagram-${ts}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 6000);
        setDownloading(false);
      }, 'image/png', 0.95);

      // --- Helpers (drawing) ---
      function drawDot(xC, yC, strokeColor, fillColor) {
        // Glow
        ctx.beginPath();
        ctx.fillStyle = hexWithAlpha(strokeColor, 0.32);
        ctx.arc(xC, yC, (DOT_SIZE / 2) + 5, 0, Math.PI * 2);
        ctx.fill();
        // Main circle
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.arc(xC, yC, (DOT_SIZE / 2) - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      function drawTargetCircle(xC, yC, strokeColor, fillColor, glyph) {
        drawDot(xC, yC, strokeColor, fillColor);
        ctx.fillStyle = strokeColor;
        ctx.font = '700 16px Inter,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(glyph, xC, yC + 1);
      }

      function drawGateBox(x, y, label, isMeasure, param) {
        // Box gradient
        const grad = ctx.createLinearGradient(x, y, x + GATE_SIZE, y + GATE_SIZE);
        if (isMeasure) {
          grad.addColorStop(0, measureGradA);
          grad.addColorStop(1, measureGradB);
        } else {
          grad.addColorStop(0, gateFill);
          grad.addColorStop(1, gateFillAlt);
        }
        // Glow
        ctx.fillStyle = hexWithAlpha(isMeasure ? accentAlt : accent, 0.25);
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, GATE_SIZE + 4, GATE_SIZE + 4, 12);
        ctx.fill();

        // Main box
        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.6;
        ctx.roundRect(x, y, GATE_SIZE, GATE_SIZE, 10);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = isMeasure ? '#0b0b10' : textCol;
        ctx.font = '700 13px Inter,system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + GATE_SIZE / 2, y + GATE_SIZE / 2 + 1);

        // Param (if any)
        if (param) {
          ctx.font = '600 9px Inter,system-ui,sans-serif';
            ctx.fillStyle = accent;
            ctx.textBaseline = 'top';
            ctx.fillText(param, x + GATE_SIZE / 2, y + GATE_SIZE + 4);
        }
      }

      function hexWithAlpha(hex, alpha) {
        // Accepts #rgb or #rrggbb
        if (!hex.startsWith('#')) return hex;
        let h = hex.replace('#', '');
        if (h.length === 3) {
          h = h.split('').map(c => c + c).join('');
        }
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
    } catch (err) {
      console.warn('Circuit export failed', err);
      alert('Export failed');
      setDownloading(false);
    }
  }, [parsed]);

  return (
    <div ref={rootRef} className="qcvis-root qcvis-fixed">
      <div className="qcvis-header">
        <div className="qcvis-title">
          <span role="img" aria-label="circuit">🧬</span> Circuit Diagram
        </div>
        <div className="qcvis-actions">
          <button
            className="qcvis-btn"
            onClick={handleDownload}
            disabled={!parsed.gates.length || downloading}
            title="Download circuit (canvas renderer)"
          >
            {downloading ? 'Saving…' : 'Download PNG'}
          </button>
        </div>
      </div>

      {!qasm?.trim() && (
        <div className="qcvis-empty">
          <div>No circuit yet. Run a simulation or build a custom circuit.</div>
        </div>
      )}

      {qasm?.trim() && parsed.qubits === 0 && (
        <div className="qcvis-empty">
          <div>QASM provided but no qreg q[N]; declaration found.</div>
        </div>
      )}

      {parsed.qubits > 0 && (
        <div className="qcvis-stage-wrapper">
          <div className="qcvis-capture">
            <div
              className="qcvis-stage"
              style={{
                '--qcvis-cols': parsed.columns,
                '--qcvis-rows': parsed.qubits
              }}
            >
              {/* Wires */}
              {Array.from({ length: parsed.qubits }).map((_, q) => (
                <div key={q} className="qcvis-wire-row">
                  <div className="qcvis-wire-label">q[{q}]</div>
                  <div className="qcvis-wire-line" />
                </div>
              ))}

              {/* Gates / connectors (unchanged DOM for alignment) */}
              {parsed.gates.map(g => {
                if (g.type === 'cx' || g.type === 'cz') {
                  const top = Math.min(g.control, g.target);
                  const bottom = Math.max(g.control, g.target);
                  return (
                    <div key={g.id}>
                      <div
                        className="qcvis-control-dot"
                        style={{ '--qcvis-col': g.col, '--qcvis-row': g.control }}
                        title={`${g.type.toUpperCase()} control q[${g.control}]`}
                      />
                      <div
                        className={`qcvis-target ${g.type === 'cx' ? 'cx' : 'cz'}`}
                        style={{ '--qcvis-col': g.col, '--qcvis-row': g.target }}
                        title={`${g.type.toUpperCase()} target q[${g.target}]`}
                      >
                        {g.type === 'cx' ? '⊕' : '•'}
                      </div>
                      <div
                        className="qcvis-multi-vert"
                        style={{
                          '--qcvis-col': g.col,
                          '--qcvis-row-start': top,
                          '--qcvis-row-end': bottom
                        }}
                      />
                    </div>
                  );
                }
                if (g.type === 'ccx') {
                  const rows = [...g.controls, g.target];
                  const top = Math.min(...rows);
                  const bottom = Math.max(...rows);
                  return (
                    <div key={g.id}>
                      {g.controls.map((c, i) => (
                        <div
                          key={i}
                          className="qcvis-control-dot"
                          style={{ '--qcvis-col': g.col, '--qcvis-row': c }}
                          title={`CCX control q[${c}]`}
                        />
                      ))}
                      <div
                        className="qcvis-target cx"
                        style={{ '--qcvis-col': g.col, '--qcvis-row': g.target }}
                        title={`CCX target q[${g.target}]`}
                      >
                        ⊕
                      </div>
                      <div
                        className="qcvis-multi-vert"
                        style={{
                          '--qcvis-col': g.col,
                          '--qcvis-row-start': top,
                          '--qcvis-row-end': bottom
                        }}
                      />
                    </div>
                  );
                }
                if (g.type === 'measure') {
                  return (
                    <div
                      key={g.id}
                      className="qcvis-gate qcvis-measure"
                      style={{ '--qcvis-col': g.col, '--qcvis-row': g.qubit }}
                      title={`MEASURE q[${g.qubit}] -> c[${g.creg}]`}
                    >
                      M
                    </div>
                  );
                }
                return (
                  <div
                    key={g.id}
                    className="qcvis-gate"
                    style={{ '--qcvis-col': g.col, '--qcvis-row': g.qubit }}
                    title={gateTooltip(g)}
                  >
                    {g.label}
                    {g.param && <div className="qcvis-gate-param">{g.param}</div>}
                  </div>
                );
              })}
            </div>
            {parsed.gates.length > 0 && (
              <div className="qcvis-meta">
                <span>{parsed.qubits} qubits</span>
                <span>{parsed.gates.length} gates</span>
                <span>{parsed.columns} columns</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Parsing Helpers (unchanged) ---------------- */

function parseQasm(qasm) {
  const lines = qasm
    .split(/\r?\n/)
    .map(l => l.replace(/\/\/.*$/, '').trim())
    .filter(l => l);

  let qubits = 0;
  const qregMatch = lines.find(l => /^qreg\s+q\[(\d+)\];$/i.test(l));
  if (qregMatch) {
    qubits = parseInt(qregMatch.match(/^qreg\s+q\[(\d+)\];$/i)[1], 10);
  }

  const gates = [];
  let col = 0;
  for (const line of lines) {
    if (/^(OPENQASM|include|qreg|creg)/i.test(line)) continue;

    let m = line.match(/^measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\];$/i);
    if (m) {
      gates.push({
        id: `m-${gates.length}`,
        type: 'measure',
        qubit: parseInt(m[1], 10),
        creg: parseInt(m[2], 10),
        col: col++
      });
      continue;
    }

    m = line.match(/^ccx\s+q\[(\d+)\],q\[(\d+)\],q\[(\d+)\];$/i);
    if (m) {
      gates.push({
        id: `ccx-${gates.length}`,
        type: 'ccx',
        controls: [parseInt(m[1], 10), parseInt(m[2], 10)],
        target: parseInt(m[3], 10),
        col: col++
      });
      continue;
    }

    m = line.match(/^(cx|cz)\s+q\[(\d+)\],q\[(\d+)\];$/i);
    if (m) {
      gates.push({
        id: `${m[1]}-${gates.length}`,
        type: m[1],
        control: parseInt(m[2], 10),
        target: parseInt(m[3], 10),
        col: col++
      });
      continue;
    }

    m = line.match(/^(rx|ry|rz)\(([^)]+)\)\s+q\[(\d+)\];$/i);
    if (m) {
      gates.push({
        id: `${m[1]}-${gates.length}`,
        type: m[1].toLowerCase(),
        qubit: parseInt(m[3], 10),
        param: normalizeTheta(m[2]),
        label: m[1].toUpperCase(),
        col: col++
      });
      continue;
    }

    m = line.match(/^(id|h|x|y|z|s|sdg|t|tdg|sx|sxdg)\s+q\[(\d+)\];$/i);
    if (m) {
      gates.push({
        id: `${m[1]}-${gates.length}`,
        type: m[1].toLowerCase(),
        qubit: parseInt(m[2], 10),
        label: prettyLabel(m[1]),
        col: col++
      });
      continue;
    }
  }

  return {
    qubits,
    gates,
    columns: col
  };
}

function normalizeTheta(raw) {
  const trimmed = raw.trim();
  if (/pi/i.test(trimmed)) {
    return trimmed
      .replace(/\s+/g, '')
      .replace(/PI/gi, 'π')
      .replace(/pi/gi, 'π');
  }
  const val = parseFloat(trimmed);
  if (!isFinite(val)) return trimmed;
  if (Math.abs(val / Math.PI - Math.round(val / Math.PI)) < 1e-6) {
    const k = Math.round(val / Math.PI);
    return k === 1 ? 'π' : `${k}π`;
  }
  if (Math.abs(val / (Math.PI / 2) - Math.round(val / (Math.PI / 2))) < 1e-6) {
    const k = Math.round(val / (Math.PI / 2));
    return `(${k}π/2)`;
  }
  return val.toFixed(2);
}

function prettyLabel(name) {
  switch (name.toLowerCase()) {
    case 'sdg': return 'S†';
    case 'tdg': return 'T†';
    case 'sx': return '√X';
    case 'sxdg': return '√X†';
    default: return name.toUpperCase();
  }
}

function gateTooltip(g) {
  if (g.param) return `${g.label} q[${g.qubit}] θ=${g.param}`;
  return `${g.label} q[${g.qubit}]`;
}