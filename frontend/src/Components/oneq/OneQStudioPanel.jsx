import React, { useEffect, useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useSimulation } from '../../context/SimulationContext';
import { parseQasmToOps, simulateSnapshots } from '../../utils/quantumSimulator';
import AdvancedBlochViewer from '../AdvancedBlochViewer';
import './oneQStudio.css';

export default function OneQStudioPanel() {
  const { simulationResult } = useSimulation();
  const viewerRef = useRef(null);

  const qasm = simulationResult?.openqasm || '';
  const numQubits =
    simulationResult?.num_qubits ||
    simulationResult?.numQubits ||
    (simulationResult?.bloch_vectors?.length || 0);

  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const [idx, setIdx] = useState(0);

  const { ops, snapshots } = useMemo(() => {
    if (!qasm || !numQubits) return { ops: [], snapshots: [] };
    const po = parseQasmToOps(qasm);
    const sn = simulateSnapshots(numQubits, po);
    return { ops: po, snapshots: sn };
  }, [qasm, numQubits]);

  // Build filtered step indices that involve selected qubit
  // Start with initial state (step 0), then add gates involving this qubit
  const { chips, steps } = useMemo(() => {
    const list = [{ label: '|0⟩', role: 'init', opIndex: -1 }]; // Initial state
    const stepIdxs = [0]; // Index 0 is the initial state snapshot
    let stopAt = Infinity;
    ops.forEach((op, i) => {
      const involves = (op.targets || []).includes(selected) || (op.controls || []).includes(selected);
      if (involves) {
        const role = (op.targets || []).includes(selected)
          ? ((op.name === 'cx' || op.name === 'cz' || op.name === 'ccx') ? 'target' : 'apply')
          : 'control';
        list.push({ label: labelOp(op), role, opIndex: i });
        stepIdxs.push(i + 1); // snapshot index is opIndex + 1
      }
      // Stop timeline at first measure touching this qubit
      if (stopAt === Infinity && op.name === 'measure' && (op.targets || []).includes(selected)) {
        stopAt = i + 1;
      }
    });
    const limitedSteps = stepIdxs.filter(s => s <= stopAt);
    const limitedChips = list.filter((_, j) => stepIdxs[j] <= stopAt);
    return { chips: limitedChips, steps: limitedSteps };
  }, [ops, selected]);

  useEffect(() => { setIdx(0); setPlaying(false); }, [selected, qasm]);

  useEffect(() => {
    if (!playing || !steps.length) return;
    const interval = Math.max(120, Math.floor(700 / speed));
    const t = setTimeout(() => {
      setIdx(i => (i + 1 < steps.length ? i + 1 : (setPlaying(false), i)));
    }, interval);
    return () => clearTimeout(t);
  }, [playing, idx, steps.length, speed]);

  const currentVector = useMemo(() => {
    if (!snapshots.length || !steps.length) return [[0, 0, 1]];
    const snap = snapshots[steps[idx]];
    const vecs = snap?.blochVectors || snap?.bloch_vectors || [];
    return [vecs[selected] || [0, 0, 1]];
  }, [snapshots, steps, idx, selected]);

  const exportPNG = async () => {
    if (!viewerRef.current) return;
    try {
      const canvas = await html2canvas(viewerRef.current, { backgroundColor: '#0b1623', scale: 2, useCORS: true });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `oneq-studio-q${selected}-${ts}.png`;
      a.click();
    } catch {
      alert('Export failed');
    }
  };

  if (!simulationResult || !qasm || !numQubits) {
    return (
      <div className="oneq-empty">
        Run a simulation first, then open OneQ Studio to inspect a single qubit.
      </div>
    );
  }

  return (
    <div className="oneq-root">
      <div className="oneq-toolbar">
        <div className="oneq-group">
          <label>Qubit:</label>
          <select value={selected} onChange={(e) => setSelected(parseInt(e.target.value, 10))}>
            {Array.from({ length: numQubits }).map((_, i) => <option key={i} value={i}>q[{i}]</option>)}
          </select>
        </div>
        <div className="oneq-group">
          <button className="qt-btn" onClick={() => setPlaying(p => !p)} disabled={!steps.length}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button className="qt-btn" onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={!steps.length || idx === 0}>Prev</button>
          <button className="qt-btn" onClick={() => setIdx(i => Math.min(steps.length - 1, i + 1))} disabled={!steps.length || idx === steps.length - 1}>Next</button>
        </div>
        <div className="oneq-group">
          <label>Speed:</label>
          <select value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
          </select>
        </div>
        <div className="oneq-spacer" />
        <button className="qt-btn" onClick={exportPNG}>Export PNG</button>
      </div>

      <div className="oneq-content">
        <div className="oneq-chips">
          {chips.length === 0 && <div className="oneq-empty-sm">No gates directly involving q[{selected}]</div>}
          {chips.map((c, i) => (
            <div
              key={i}
              className={`oneq-chip ${i === idx ? 'active' : ''}`}
              title={`${c.label} • ${c.role}`}
              onClick={() => setIdx(i)}
            >
              {c.label} <span className={`role ${c.role}`}>{c.role}</span>
            </div>
          ))}
        </div>

        <div className="oneq-viewer" ref={viewerRef}>
          <AdvancedBlochViewer vectors={currentVector} labels={[`q[${selected}]`]} />
        </div>
      </div>
    </div>
  );
}

function labelOp(op) {
  const name = op.name.toUpperCase();
  if (name === 'RX' || name === 'RY' || name === 'RZ') {
    const th = op.params?.[0] ?? op.theta ?? null;
    return th != null ? `${name}(${formatPiLocal(th)})` : name;
  }
  if (name === 'U3') {
    const [t, p, l] = op.params || [];
    return `U3(${formatPiLocal(t)},${formatPiLocal(p)},${formatPiLocal(l)})`;
  }
  if (name === 'CX' || name === 'CZ' || name === 'CCX' || name === 'H' || name === 'X' || name === 'Y' || name === 'Z' || name === 'S' || name === 'SDG' || name === 'T' || name === 'TDG' || name === 'MEASURE') {
    return name;
  }
  return name;
}
function formatPiLocal(a) {
  const pi = Math.PI;
  const eps = 1e-3;
  const k = Math.round(a / pi);
  if (Math.abs(a - k * pi) < eps) return k === 1 ? 'π' : `${k}π`;
  const k2 = Math.round((a / pi) * 2);
  if (Math.abs(a - (k2 * pi) / 2) < eps) return k2 === 1 ? 'π/2' : `${k2}π/2`;
  const k4 = Math.round((a / pi) * 4);
  if (Math.abs(a - (k4 * pi) / 4) < eps) return k4 === 1 ? 'π/4' : `${k4}π/4`;
  return a.toFixed(2);
}