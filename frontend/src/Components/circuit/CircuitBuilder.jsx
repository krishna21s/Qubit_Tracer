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
  orderedGates,
  replaceGate
} from '../../utils/circuitModel';
import {
  fullParse,
  incrementalParse,
  buildQasmFromModel
} from '../../utils/qasmIncremental';
import { createUndoStack } from './undoStack';
import './circuitBuilder.css';

/**
 * CircuitBuilder with:
 *  - Two-way sync grid <-> QASM
 *  - Incremental line parsing
 *  - Line ↔ column mapping & hover
 *  - Undo/Redo
 *  - Controlled updates avoiding loops via updatingFrom
 */
export default function CircuitBuilder({
  externalQasm,
  onQasmChange,
  disableExternalSync = false
}) {
  // Core states
  const [circuit, setCircuit] = useState(() => createCircuit(3));

  // QASM lines array (source of truth for text)
  const [qasmLines, setQasmLines] = useState([
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    'qreg q[3];'
  ]);

  // Mapping: lineNo -> gate (Map), columns derived from gate ordering
  const [gateByLine, setGateByLine] = useState(new Map()); // lineNumber -> gateObject (with column)
  const [lineErrors, setLineErrors] = useState({});
  const [hoverLine, setHoverLine] = useState(null);
  const [hoverGateId, setHoverGateId] = useState(null);

  // Editing & modals
  const [pendingCX, setPendingCX] = useState(null);
  const [selectedGateId, setSelectedGateId] = useState(null);
  const [editingGate, setEditingGate] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Undo/redo
  const undoRef = useRef(createUndoStack(150));
  const updatingFrom = useRef(null); // 'grid' | 'qasm' | null (guard)

  // Initialize from external QASM only once
  useEffect(() => {
    if (disableExternalSync) return;
    if (!initialized && externalQasm) {
      try {
        const lines = externalQasm.split(/\r?\n/);
        const parsed = fullParse(lines);
        // assign columns sequentially
        parsed.gateObjects.forEach((g, idx) => g.column = idx);
        const newCircuit = {
          numQubits: parsed.numQubits,
          gates: parsed.gateObjects
        };
        setCircuit(newCircuit);
        const newMap = new Map();
        parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
        setGateByLine(newMap);
        setQasmLines(lines);
        pushUndo(newCircuit, lines, newMap);
        setInitialized(true);
      } catch (err) {
        console.warn('Initial parse failed:', err);
        setInitialized(true);
      }
    }
  }, [externalQasm, disableExternalSync, initialized]);

  /**
   * Push current snapshot to undo stack
   */
  function pushUndo(circ, lines, map) {
    const snapshot = {
      circuit: JSON.parse(JSON.stringify(circ)),
      qasmLines: [...lines],
      gatePairs: Array.from(map.entries()),
      lineErrors: { ...lineErrors }
    };
    undoRef.current.push(snapshot);
  }

  /**
   * Rebuild QASM from circuit model (used after grid modifications).
   * Only gate lines are regenerated — we keep original header lines if possible.
   */
  const rebuildQasmFromCircuit = useCallback((updatedCircuit, existingLines, existingGateByLine) => {
    // Collect header lines content:
    const headerContent = existingLines.filter(l =>
      l.trim().startsWith('OPENQASM') ||
      l.trim().startsWith('include "') ||
      /^qreg\s+q\[\d+\];$/i.test(l.trim())
    );
    const qasmText = buildQasmFromModel(headerContent, orderedGates(updatedCircuit), updatedCircuit.numQubits);
    const newLines = qasmText.split('\n');

    // Re-map: full parse on rebuild to keep columns consecutive
    const parsed = fullParse(newLines);
    parsed.gateObjects.forEach((g, idx) => g.column = idx);
    const newMap = new Map();
    parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
    return { newLines, newMap, parsedCircuit: { numQubits: updatedCircuit.numQubits, gates: parsed.gateObjects } };
  }, []);

  /**
   * GRID → QASM update flow
   */
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

  /**
   * QASM text → incremental parse flow
   * @param {string[]} newLines
   * @param {Set<number>} changed
   * @param {boolean} parseAll (force full parse)
   */
  function applyQasmEdits(newLines, changed, parseAll = false) {
    if (updatingFrom.current === 'grid') {
      // We are in a grid-driven change, skip adding another layer
      return;
    }
    updatingFrom.current = 'qasm';

    try {
      let newMap;
      let newCircuit;
      let errors = {};
      if (parseAll) {
        // Full parse
        try {
          const parsed = fullParse(newLines);
          parsed.gateObjects.forEach((g, idx) => g.column = idx);
          newMap = new Map();
          parsed.gateObjects.forEach(g => newMap.set(g.sourceLine, g));
          newCircuit = { numQubits: parsed.numQubits, gates: parsed.gateObjects };
        } catch (err) {
          // full parse error
          errors = { [err.lineNumber ?? -1]: err.message };
          // keep previous mapping
          newMap = new Map(gateByLine);
          newCircuit = { ...circuit };
        }
      } else {
        // Incremental
        const result = incrementalParse(qasmLines, newLines, changed, gateByLine);
        newMap = result.updatedGateByLine;
        errors = { ...lineErrors, ...result.lineErrors };
        // Recompute columns from sorted line numbers
        const gateEntries = Array.from(newMap.entries()).sort((a, b) => a[0] - b[0]);
        gateEntries.forEach(([_, gateObj], idx) => gateObj.column = idx);

        // Build new circuit
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

  // --------------------- GRID ACTIONS ---------------------
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
    // After move, re-assign columns consecutively by ascending column
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

  // --------------------- QASM EDITOR CALLBACKS ---------------------
  const handleQasmTextChange = (text, editMeta) => {
    // text is full new QASM; but we only want incremental lines difference
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

  // Grid → Code hover
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

  // Undo / Redo
  const handleKey = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      const stack = undoRef.current;
      if (stack.canUndo()) {
        const prev = stack.undo();
        restoreSnapshot(prev);
      }
    } else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
      e.preventDefault();
      const stack = undoRef.current;
      if (stack.canRedo()) {
        const next = stack.redo();
        restoreSnapshot(next);
      }
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

  // Initial push to undo if empty
  useEffect(() => {
    if (undoRef.current.past.length === 0) {
      pushUndo(circuit, qasmLines, gateByLine);
    }
  }, []); // eslint-disable-line

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <GatePalette />
        </div>
        <div className="col-12 col-lg-4 d-flex align-items-center">
          <div className="qt-size-control w-100 justify-content-start">
            <span style={{ fontWeight: 600, letterSpacing: '.5px' }}>Qubits</span>
            <button onClick={() => changeQubits(-1)}>−</button>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{circuit.numQubits}</span>
            <button onClick={() => changeQubits(1)}>＋</button>
            {pendingCX && (
              <button
                onClick={() => setPendingCX(null)}
                style={{
                  marginLeft: 'auto',
                  background: '#6c4a14',
                  border: '1px solid #a07022',
                  color: '#ffd99f',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >Cancel CX</button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
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
        <div className="col-12 col-xl-4" style={{ minHeight: 320 }}>
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