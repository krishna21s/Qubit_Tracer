// Minimal additions: support CZ and CCX pending without changing layout.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GatePalette from './GatePalette';
import CircuitGrid from './CircuitGrid';
import QASMEditor from './QASMEditor';
import GateParamEditor from './GateParamEditor';
import {
  createCircuit,
  addSingleQubitGate,
  addCXGate,
  addCZGate,
  addCCXGate,
  updateGateParams,
  moveGate,
  deleteGate,
  resizeQubits,
  orderedGates
} from '../../utils/circuitModel';
import {
  fullParse,
  incrementalParse,
  buildQasmFromModel
} from '../../utils/qasmIncremental';
import { createUndoStack } from './undoStack';
import './circuitBuilder.css';

export default function CircuitBuilder({
  externalQasm,
  onQasmChange,
  disableExternalSync = false,
  compact = false,
  gridScrollRef,
  qasmScrollRef,
  onHorizontalScroll
}) {
  const [circuit, setCircuit] = useState(() => createCircuit(3));
  const [qasmLines, setQasmLines] = useState([
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    'qreg q[3];'
  ]);
  const [gateByLine, setGateByLine] = useState(new Map());
  const [lineErrors, setLineErrors] = useState({});
  const [hoverLine, setHoverLine] = useState(null);
  const [hoverGateId, setHoverGateId] = useState(null);

  // pendingCX now carries { type: 'cx'|'cz'|'ccx', control, control2?, column }
  const [pendingCX, setPendingCX] = useState(null);
  const [selectedGateId, setSelectedGateId] = useState(null);
  const [editingGate, setEditingGate] = useState(null);
  const [lastSyncedQasm, setLastSyncedQasm] = useState(null);

  const undoRef = useRef(createUndoStack(150));
  const updatingFrom = useRef(null);

  // Sync with externalQasm when it changes (not just on first load)
  useEffect(() => {
    if (disableExternalSync) return;
    // Only sync if externalQasm is provided and different from what we last synced
    if (externalQasm && externalQasm !== lastSyncedQasm) {
      try {
        const lines = externalQasm.split(/\r?\n/);
        const parsed = fullParse(lines);
        parsed.gateObjects.forEach((g, idx) => g.column = idx);
        const newCircuit = { numQubits: parsed.numQubits, gates: parsed.gateObjects };
        setCircuit(newCircuit);
        const newMap = new Map();
        parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
        setGateByLine(newMap);
        setQasmLines(lines);
        pushUndo(newCircuit, lines, newMap);
        setLastSyncedQasm(externalQasm);
      } catch {
        setLastSyncedQasm(externalQasm);
      }
    }
  }, [externalQasm, disableExternalSync, lastSyncedQasm]);

  function pushUndo(circ, lines, map) {
    const snapshot = {
      circuit: JSON.parse(JSON.stringify(circ)),
      qasmLines: [...lines],
      gatePairs: Array.from(map.entries()),
      lineErrors: { ...lineErrors }
    };
    undoRef.current.push(snapshot);
  }

  const rebuildQasmFromCircuit = useCallback((updatedCircuit, existingLines) => {
    const headerContent = existingLines.filter(l =>
      l.trim().startsWith('OPENQASM') ||
      l.trim().startsWith('include "') ||
      /^qreg\s+q\[\d+\];$/i.test(l.trim()) ||
      /^creg\s+c\[\d+\];$/i.test(l.trim())
    );
    const qasmText = buildQasmFromModel(headerContent, orderedGates(updatedCircuit), updatedCircuit.numQubits);
    const newLines = qasmText.split('\n');
    const parsed = fullParse(newLines);
    parsed.gateObjects.forEach((g, idx) => g.column = idx);
    const newMap = new Map();
    parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
    return { newLines, newMap, parsedCircuit: { numQubits: updatedCircuit.numQubits, gates: parsed.gateObjects } };
  }, []);

  function commitCircuitChange(newCircuit, reason = 'grid') {
    updatingFrom.current = reason;
    const { newLines, newMap, parsedCircuit } = rebuildQasmFromCircuit(newCircuit, qasmLines, gateByLine);
    setCircuit(parsedCircuit);
    setQasmLines(newLines);
    setGateByLine(newMap);
    setLineErrors({});
    pushUndo(parsedCircuit, newLines, newMap);
    updatingFrom.current = null;
    onQasmChange?.(newLines.join('\n'));
  }

  function applyQasmEdits(newLines, changed, parseAll = false) {
    if (updatingFrom.current === 'grid') return;
    updatingFrom.current = 'qasm';
    try {
      let newMap;
      let newCircuit;
      let errors = {};
      if (parseAll) {
        try {
          const parsed = fullParse(newLines);
          parsed.gateObjects.forEach((g, idx) => g.column = idx);
          newMap = new Map();
          parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
          newCircuit = { numQubits: parsed.numQubits, gates: parsed.gateObjects };
        } catch (err) {
          errors = { [err.lineNumber ?? -1]: err.message };
          newMap = new Map(gateByLine);
          newCircuit = { ...circuit };
        }
      } else {
        const result = incrementalParse(qasmLines, newLines, changed, gateByLine);
        newMap = result.updatedGateByLine;
        errors = { ...lineErrors, ...result.lineErrors };
        const gateEntries = Array.from(newMap.entries()).sort((a, b) => a[0] - b[0]);
        gateEntries.forEach(([_, gateObj], idx) => gateObj.column = idx);
        const gates = gateEntries.map(e => e[1]);
        let numQubits = circuit.numQubits;
        if (result.numQubitsMaybe != null) numQubits = result.numQubitsMaybe;
        newCircuit = { numQubits, gates };
      }
      setQasmLines(newLines);
      setGateByLine(newMap);
      setCircuit(newCircuit);
      setLineErrors(errors);
      pushUndo(newCircuit, newLines, newMap);
      onQasmChange?.(newLines.join('\n'));
    } finally {
      updatingFrom.current = null;
    }
  }

  const onAddSingle = (type, qubit, column) => {
    const newCircuit = addSingleQubitGate(circuit, { type, qubit, column });
    commitCircuitChange(newCircuit);
  };

  const onStartAddCX = (type, controlQubit, column) => setPendingCX({ type, control: controlQubit, column });

  const onResolveCX = (payload) => {
    if (!pendingCX) return;
    if (pendingCX.type === 'ccx') {
      if (!payload || typeof payload !== 'object') return;
      if (payload.step === 2 && payload.control2 != null) {
        if (payload.control2 !== pendingCX.control) {
          setPendingCX({ ...pendingCX, control2: payload.control2 });
        }
        return;
      }
      if (payload.step === 3 && payload.target != null) {
        const c1 = pendingCX.control;
        const c2 = pendingCX.control2;
        const t = payload.target;
        if (t !== c1 && t !== c2) {
          const newCircuit = addCCXGate(circuit, { controls: [c1, c2], target: t, column: pendingCX.column });
          commitCircuitChange(newCircuit);
        }
        setPendingCX(null);
        return;
      }
      return;
    }
    // CX/CZ
    if (typeof payload === 'number') {
      const targetQubit = payload;
      if (pendingCX.control !== targetQubit) {
        let newCircuit = circuit;
        if (pendingCX.type === 'cz') {
          newCircuit = addCZGate(circuit, { control: pendingCX.control, target: targetQubit, column: pendingCX.column });
        } else {
          newCircuit = addCXGate(circuit, { control: pendingCX.control, target: targetQubit, column: pendingCX.column });
        }
        commitCircuitChange(newCircuit);
      }
      setPendingCX(null);
    }
  };

  const onMoveGate = (gateId, column, qubit) => {
    const g = circuit.gates.find(g => g.id === gateId);
    if (!g) return;
    let newCircuit = moveGate(circuit, gateId, { column, qubit });
    const sorted = orderedGates(newCircuit).map((g, idx) => ({ ...g, column: idx }));
    newCircuit = { ...newCircuit, gates: sorted };
    commitCircuitChange(newCircuit);
  };

  const onDeleteGate = (gateId) => {
    const newCircuit = deleteGate(circuit, gateId);
    commitCircuitChange(newCircuit);
    if (selectedGateId === gateId) setSelectedGateId(null);
  };

  const onSaveParams = (patch) => {
    if (!editingGate) return;
    const gateId = editingGate.id;
    const newCircuit = updateGateParams(circuit, gateId, patch);
    commitCircuitChange(newCircuit);
  };

  const changeQubits = (delta) => {
    let next = circuit.numQubits + delta;
    next = Math.max(1, Math.min(20, next));
    if (next === circuit.numQubits) return;
    const newCircuit = resizeQubits(circuit, next);
    commitCircuitChange(newCircuit);
  };

  const handleQasmTextChange = (text, editMeta) => {
    const newLines = text.split(/\r?\n/);
    const changed = new Set();
    const len = Math.max(newLines.length, qasmLines.length);
    for (let i = 0; i < len; i++) {
      if (newLines[i] !== qasmLines[i]) changed.add(i);
    }
    applyQasmEdits(newLines, changed, editMeta?.forceFullParse);
  };

  const handleLineHover = (lineNo) => setHoverLine(lineNo);
  const handleLineLeave = () => setHoverLine(null);

  const gateIdToLine = (() => {
    const map = {};
    gateByLine.forEach((g, lineNo) => map[g.id] = lineNo);
    return map;
  })();
  const onGateHover = (gateId) => {
    setHoverGateId(gateId);
    const ln = gateIdToLine[gateId];
    if (ln != null) setHoverLine(ln);
  };
  const onGateHoverOut = () => {
    setHoverGateId(null);
    setHoverLine(null);
  };

  const handleKey = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (undoRef.current.canUndo()) restoreSnapshot(undoRef.current.undo());
    } else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      if (undoRef.current.canRedo()) restoreSnapshot(undoRef.current.redo());
    }
  }, []);

  function restoreSnapshot(snapshot) {
    updatingFrom.current = 'undo';
    setCircuit(snapshot.circuit);
    setQasmLines(snapshot.qasmLines);
    setLineErrors(snapshot.lineErrors);
    const map = new Map(snapshot.gatePairs);
    setGateByLine(map);
    updatingFrom.current = null;
    onQasmChange?.(snapshot.qasmLines.join('\n'));
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (undoRef.current.past.length === 0) {
      pushUndo(circuit, qasmLines, gateByLine);
    }
  }, []); // eslint-disable-line

  return (
    <div className={`d-flex flex-column gap-3 builder-structured ${compact ? 'builder-compact' : ''}`}>
      <div className="builder-top-row">
        <div className="builder-palette-wrap">
          <GatePalette compact={compact} />
        </div>
        <div className="builder-qubit-wrap">
          <div className="qt-size-control">
            <span style={{ fontWeight: 600, letterSpacing: '.4px' }}>Qubits</span>
            <button onClick={() => changeQubits(-1)}>−</button>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{circuit.numQubits}</span>
            <button onClick={() => changeQubits(1)}>＋</button>
            {pendingCX && (
              <button
                onClick={() => setPendingCX(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'var(--qt-surface, #1a1f28)',
                  border: '1px solid var(--qt-border, #2a4254)',
                  color: 'var(--qt-accent-alt, #ffd99f)',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  boxShadow: 'var(--qt-shadow-elev, 0 2px 8px rgba(0,0,0,0.35))',
                  cursor: 'pointer'
                }}
              >
                Cancel {(pendingCX.type || 'cx').toUpperCase()}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="builder-bottom-row">
        <div className="builder-grid-col" ref={gridScrollRef} onScroll={onHorizontalScroll}>
          <CircuitGrid
            circuit={circuit}
            onAddSingle={onAddSingle}
            onStartAddCX={(type, q, col) => setPendingCX({ type, control: q, column: col })}
            onResolveCX={onResolveCX}
            pendingCX={pendingCX}
            onMoveGate={onMoveGate}
            onDeleteGate={onDeleteGate}
            onSelectGate={setSelectedGateId}
            selectedGateId={selectedGateId}
            onEditGate={setEditingGate}
            onGateHover={onGateHover}
            onGateHoverOut={onGateHoverOut}
            hoverGateId={hoverGateId}
          />
        </div>
        <div className="builder-qasm-col" ref={qasmScrollRef} onScroll={onHorizontalScroll}>
          <QASMEditor
            lines={qasmLines}
            onChange={handleQasmTextChange}
            lineErrors={lineErrors}
            hoverLine={hoverLine}
            onLineHover={handleLineHover}
            onLineLeave={handleLineLeave}
            forceParseAll={() => applyQasmEdits([...qasmLines], new Set(), true)}
          />
        </div>
      </div>

      {editingGate && (
        <GateParamEditor
          gate={editingGate}
          onClose={() => setEditingGate(null)}
          onSave={onSaveParams}
        />
      )}
    </div>
  );
}