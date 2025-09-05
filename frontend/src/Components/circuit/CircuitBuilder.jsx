// (Only minimal change: accept compact + optional scroll refs, no logic changes removed)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GatePalette from './GatePalette';
import CircuitGrid from './CircuitGrid';
import QASMEditor from './QASMEditor';
import GateParamEditor from './GateParamEditor';
import {
  createCircuit,
  addSingleQubitGate,
  addCXGate,
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

  const [pendingCX, setPendingCX] = useState(null);
  const [selectedGateId, setSelectedGateId] = useState(null);
  const [editingGate, setEditingGate] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const undoRef = useRef(createUndoStack(150));
  const updatingFrom = useRef(null);

  useEffect(() => {
    if (disableExternalSync) return;
    if (!initialized && externalQasm) {
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
        setInitialized(true);
      } catch {
        setInitialized(true);
      }
    }
  }, [externalQasm, disableExternalSync, initialized]);

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
      /^qreg\s+q\[\d+\];$/i.test(l.trim())
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
  const onStartAddCX = (controlQubit, column) => setPendingCX({ control: controlQubit, column });
  const onResolveCX = (targetQubit) => {
    if (pendingCX && pendingCX.control !== targetQubit) {
      const newCircuit = addCXGate(circuit, { control: pendingCX.control, target: targetQubit, column: pendingCX.column });
      commitCircuitChange(newCircuit);
    }
    setPendingCX(null);
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
      {/* Top: Palette + Size control */}
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
                  background: '#6c4a14',
                  border: '1px solid #a07022',
                  color: '#ffd99f',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600
                }}
              >Cancel CX</button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Grid + QASM side by side */}
      <div className="builder-bottom-row">
        <div className="builder-grid-col" ref={gridScrollRef} onScroll={onHorizontalScroll}>
          <CircuitGrid
            circuit={circuit}
            onAddSingle={onAddSingle}
            onStartAddCX={onStartAddCX}
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