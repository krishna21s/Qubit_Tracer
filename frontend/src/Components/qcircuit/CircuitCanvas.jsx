/**
 * CircuitCanvas.jsx — SVG-based quantum circuit canvas with grid, wires,
 * gates, pan/zoom, click-to-place, click-to-select, and drag-to-move.
 *
 * Layout:
 *   qubit labels | col0 | col1 | col2 | ...
 *   q[0] ────────[  H  ]──[●]────────────
 *                          │
 *   q[1] ──────────────[⊕]────[  X  ]──
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SearchZoomIn, SearchZoomOut, Target, Plus, Minus } from 'reicon-react';

import { useCircuit } from '../../lib/circuitStore';
import GateElement, { CELL_W, CELL_H, GATE_SIZE, LABEL_W, cellCenter } from './GateElement';
import { getGateDef, getGateByShortcut } from '../../data/gateDefinitions';

export default function CircuitCanvas() {
  const { state, dispatch } = useCircuit();
  const svgRef    = useRef(null);
  const wrapRef   = useRef(null);
  const isPanning = useRef(false);
  const panStart  = useRef({ x: 0, y: 0 });
  const panOrig   = useRef({ x: 0, y: 0 });

  // Ghost gate preview
  const [ghostPos, setGhostPos] = useState(null); // { col, qubit }

  // Drag gate state
  const [dragGate, setDragGate] = useState(null);
  const [dragPos, setDragPos]   = useState(null);

  // ── Computed dimensions ──────────────────────────────────────
  const canvasW = LABEL_W + state.timeSteps * CELL_W + 40;
  const canvasH = state.qubits * CELL_H + 20;

  // ── SVG coord from mouse event ───────────────────────────────
  const svgCoord = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / state.zoom - state.panOffset.x,
      y: (e.clientY - rect.top)  / state.zoom - state.panOffset.y,
    };
  }, [state.zoom, state.panOffset]);

  // ── Grid position from SVG coord ─────────────────────────────
  const gridFromCoord = useCallback((sx, sy) => {
    const col   = Math.round((sx - LABEL_W - CELL_W / 2) / CELL_W);
    const qubit = Math.round((sy - CELL_H / 2) / CELL_H);
    return {
      col:   Math.max(0, Math.min(state.timeSteps - 1, col)),
      qubit: Math.max(0, Math.min(state.qubits - 1, qubit)),
    };
  }, [state.timeSteps, state.qubits]);

  // ── Mouse move — ghost preview + pan + drag ──────────────────
  const handleMouseMove = useCallback((e) => {
    // Pan
    if (isPanning.current) {
      const dx = (e.clientX - panStart.current.x) / state.zoom;
      const dy = (e.clientY - panStart.current.y) / state.zoom;
      dispatch({
        type: 'SET_PAN',
        offset: { x: panOrig.current.x + dx, y: panOrig.current.y + dy },
      });
      return;
    }

    const { x, y } = svgCoord(e);
    const pos = gridFromCoord(x, y);

    // Drag gate
    if (dragGate) {
      setDragPos(pos);
      return;
    }

    // Ghost preview in place mode
    if (state.tool === 'place' && state.activePlaceGate) {
      setGhostPos(pos);
    } else {
      setGhostPos(null);
    }
  }, [state.tool, state.activePlaceGate, state.zoom, svgCoord, gridFromCoord, dispatch, dragGate]);

  // ── Mouse down ───────────────────────────────────────────────
  const handleMouseDown = useCallback((e) => {
    // Middle-click or space+click = pan
    if (e.button === 1 || state.tool === 'pan') {
      isPanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY };
      panOrig.current  = { ...state.panOffset };
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;
    const { x, y } = svgCoord(e);
    const pos = gridFromCoord(x, y);

    if (state.tool === 'place' && state.activePlaceGate) {
      const def = getGateDef(state.activePlaceGate);
      if (!def) return;

      // Multi-qubit gates: need to pick target qubits
      let qubits;
      if (def.qubits === -1) {
        // Barrier: all qubits
        qubits = Array.from({ length: state.qubits }, (_, i) => i);
      } else if (def.qubits === 1) {
        qubits = [pos.qubit];
      } else if (def.qubits === 2) {
        // Place on clicked qubit and next qubit down
        const target = pos.qubit < state.qubits - 1 ? pos.qubit + 1 : pos.qubit - 1;
        qubits = [pos.qubit, Math.max(0, target)];
      } else if (def.qubits === 3) {
        const q1 = Math.min(pos.qubit + 1, state.qubits - 1);
        const q2 = Math.min(pos.qubit + 2, state.qubits - 1);
        qubits = [pos.qubit, q1, q2];
      } else {
        qubits = [pos.qubit];
      }

      // Build default params
      const params = {};
      if (def.params) {
        def.params.forEach(p => { params[p.name] = p.default; });
      }

      dispatch({ type: 'ADD_GATE', gateType: def.id, qubits, col: pos.col, params });
      return;
    }

    if (state.tool === 'erase') {
      // Find gate at position
      const hit = state.gates.find(g =>
        g.col === pos.col && g.qubits.includes(pos.qubit)
      );
      if (hit) dispatch({ type: 'REMOVE_GATE', id: hit.id });
      return;
    }

    // Select mode — click on empty = deselect
    if (state.tool === 'select') {
      const hit = state.gates.find(g =>
        g.col === pos.col && g.qubits.includes(pos.qubit)
      );
      if (hit) {
        dispatch({ type: 'SELECT', id: hit.id, add: e.shiftKey || e.ctrlKey });
      } else {
        dispatch({ type: 'DESELECT' });
      }
    }
  }, [state.tool, state.activePlaceGate, state.qubits, state.panOffset, state.gates, state.zoom, svgCoord, gridFromCoord, dispatch]);

  // ── Mouse up ─────────────────────────────────────────────────
  const handleMouseUp = useCallback(() => {
    isPanning.current = false;

    // Finish drag
    if (dragGate && dragPos) {
      const def = getGateDef(dragGate.type);
      if (def) {
        let newQubits;
        if (def.qubits === 1) {
          newQubits = [dragPos.qubit];
        } else if (def.qubits === -1) {
          newQubits = dragGate.qubits; // barrier stays on same qubits
        } else {
          // Shift multi-qubit gate relative to drag
          const offset = dragPos.qubit - dragGate.qubits[0];
          newQubits = dragGate.qubits.map(q =>
            Math.max(0, Math.min(state.qubits - 1, q + offset))
          );
        }
        dispatch({ type: 'MOVE_GATE', id: dragGate.id, col: dragPos.col, qubits: newQubits });
      }
      setDragGate(null);
      setDragPos(null);
    }
  }, [dragGate, dragPos, state.qubits, dispatch]);

  // ── Wheel zoom ───────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    dispatch({ type: 'SET_ZOOM', zoom: state.zoom + delta });
  }, [state.zoom, dispatch]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;
      if (active && (
        active.tagName === 'INPUT' || 
        active.tagName === 'TEXTAREA' || 
        active.isContentEditable || 
        (active.classList && active.classList.contains('inputarea'))
      )) return;
      
      if (e.target && e.target.tagName && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.target && e.target.closest && (e.target.closest('.monaco-editor') || e.target.closest('#qc-code-panel'))) return;
      
      const codePanel = document.getElementById('qc-code-panel');
      if (codePanel && active && codePanel.contains(active)) return;

      // Gate shortcuts
      const gateDef = getGateByShortcut(e.key);
      if (gateDef && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch({ type: 'SET_PLACE_GATE', gateType: gateDef.id });
        return;
      }

      // Tool shortcuts
      if (e.key === 'v' && !e.ctrlKey) { dispatch({ type: 'SET_TOOL', tool: 'select' }); return; }
      if (e.key === 'g')               { dispatch({ type: 'SET_TOOL', tool: 'place' }); return; }
      if (e.key === 'e' && !e.ctrlKey) { dispatch({ type: 'SET_TOOL', tool: 'erase' }); return; }
      if (e.key === ' ')               { e.preventDefault(); dispatch({ type: 'SET_TOOL', tool: 'pan' }); return; }

      // Edit shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); dispatch({ type: 'UNDO' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)  { e.preventDefault(); dispatch({ type: 'REDO' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y')                { e.preventDefault(); dispatch({ type: 'REDO' }); return; }
      if (e.key === 'Delete' || e.key === 'Backspace')              { dispatch({ type: 'DELETE_SELECTION' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c')                { dispatch({ type: 'COPY' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v')                { e.preventDefault(); dispatch({ type: 'PASTE' }); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a')                { e.preventDefault(); dispatch({ type: 'SELECT_ALL' }); return; }

      // View
      if (e.key === 'f' && !e.ctrlKey) { dispatch({ type: 'FIT_VIEW' }); return; }
      if (e.key === 'Escape')           { dispatch({ type: 'DESELECT' }); return; }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  // Space key up → revert from pan
  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;
      if (active && (
        active.tagName === 'INPUT' || 
        active.tagName === 'TEXTAREA' || 
        active.isContentEditable || 
        (active.classList && active.classList.contains('inputarea'))
      )) return;
      
      if (e.target && e.target.tagName && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.target && e.target.closest && (e.target.closest('.monaco-editor') || e.target.closest('#qc-code-panel'))) return;
      
      const codePanel = document.getElementById('qc-code-panel');
      if (codePanel && active && codePanel.contains(active)) return;
      
      if (e.key === ' ') dispatch({ type: 'SET_TOOL', tool: 'select' });
    };
    window.addEventListener('keyup', handler);
    return () => window.removeEventListener('keyup', handler);
  }, [dispatch]);

  // ── Gate click handlers ──────────────────────────────────────
  const handleGateClick = useCallback((gate, e) => {
    e.stopPropagation();
    if (state.tool === 'erase') {
      dispatch({ type: 'REMOVE_GATE', id: gate.id });
    } else {
      dispatch({ type: 'SELECT', id: gate.id, add: e.shiftKey || e.ctrlKey });
    }
  }, [state.tool, dispatch]);

  const handleGateMouseDown = useCallback((gate, e) => {
    if (state.tool === 'select' && e.button === 0) {
      e.stopPropagation();
      setDragGate(gate);
      setDragPos(null);
    }
  }, [state.tool]);

  // ── Cursor class ─────────────────────────────────────────────
  const cursorClass = `qc-canvas-inner tool-${state.tool}`;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className={cursorClass}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { isPanning.current = false; setGhostPos(null); }}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        className="qc-canvas-svg"
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        preserveAspectRatio="xMinYMin meet"
        style={{ width: '100%', height: '100%' }}
      >
        <g style={{
          transform: `scale(${state.zoom}) translate(${state.panOffset.x}px, ${state.panOffset.y}px)`,
          transformOrigin: '0 0',
        }}>
        {/* Grid columns */}
        {Array.from({ length: state.timeSteps }, (_, col) => {
          const x = LABEL_W + col * CELL_W + CELL_W / 2;
          return (
            <g key={`col-${col}`}>
              <line
                x1={x} y1={0} x2={x} y2={canvasH}
                className={col % 4 === 0 ? 'qc-grid-line-major' : 'qc-grid-line'}
              />
              <text className="qc-timestep-label" x={x} y={canvasH - 2}>
                {col}
              </text>
            </g>
          );
        })}

        {/* Qubit wires + labels */}
        {Array.from({ length: state.qubits }, (_, q) => {
          const y = q * CELL_H + CELL_H / 2;
          return (
            <g key={`q-${q}`}>
              <line
                className="qc-wire"
                x1={LABEL_W - 4}
                y1={y}
                x2={LABEL_W + state.timeSteps * CELL_W + 16}
                y2={y}
              />
              <text className="qc-qubit-label" x={LABEL_W - 10} y={y}>
                q[{q}]
              </text>
            </g>
          );
        })}

        {/* Placed gates */}
        {state.gates.map(gate => (
          <GateElement
            key={gate.id}
            gate={dragGate?.id === gate.id && dragPos
              ? { ...gate, col: dragPos.col, qubits: gate.qubits.length === 1 ? [dragPos.qubit] : gate.qubits }
              : gate}
            selected={state.selection.includes(gate.id)}
            onClick={(e) => handleGateClick(gate, e)}
            onMouseDown={(e) => handleGateMouseDown(gate, e)}
          />
        ))}

        {/* Ghost preview */}
        {ghostPos && state.tool === 'place' && state.activePlaceGate && (
          <GateElement
            gate={{
              id: '__ghost',
              type: state.activePlaceGate,
              qubits: (() => {
                const def = getGateDef(state.activePlaceGate);
                if (!def) return [ghostPos.qubit];
                if (def.qubits === -1) return Array.from({ length: state.qubits }, (_, i) => i);
                if (def.qubits === 1)  return [ghostPos.qubit];
                if (def.qubits === 2) {
                  const t = ghostPos.qubit < state.qubits - 1 ? ghostPos.qubit + 1 : ghostPos.qubit - 1;
                  return [ghostPos.qubit, Math.max(0, t)];
                }
                if (def.qubits === 3) {
                  return [ghostPos.qubit, Math.min(ghostPos.qubit+1, state.qubits-1), Math.min(ghostPos.qubit+2, state.qubits-1)];
                }
                return [ghostPos.qubit];
              })(),
              col: ghostPos.col,
              params: (() => {
                const def = getGateDef(state.activePlaceGate);
                const p = {};
                if (def?.params) def.params.forEach(pp => { p[pp.name] = pp.default; });
                return p;
              })(),
            }}
            ghost
          />
        )}
        </g>
      </svg>

      {/* Bottom Floating Control Pill */}
      <div className="qc-bottom-controls">
        <button className="qc-bottom-btn" title="Remove Qubit" onClick={() => dispatch({ type: 'REMOVE_QUBIT' })}>
          <Minus size={18} />
        </button>
        <div className="qc-bottom-text">{state.qubits} q</div>
        <button className="qc-bottom-btn" title="Add Qubit" onClick={() => dispatch({ type: 'ADD_QUBIT' })}>
          <Plus size={18} />
        </button>
        
        <div className="qc-bottom-divider" />
        
        <button className="qc-bottom-btn" title="Zoom Out" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom - 0.1 })}>
          <SearchZoomOut size={18} />
        </button>
        <div className="qc-bottom-text">{Math.round(state.zoom * 100)}%</div>
        <button className="qc-bottom-btn" title="Zoom In" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom + 0.1 })}>
          <SearchZoomIn size={18} />
        </button>
        
        <div className="qc-bottom-divider" />
        
        <button className="qc-bottom-btn" title="Fit View (F)" onClick={() => dispatch({ type: 'FIT_VIEW' })}>
          <Target size={18} />
        </button>
      </div>
    </div>
  );
}
