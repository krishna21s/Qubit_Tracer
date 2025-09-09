import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { maxColumn } from '../../utils/circuitModel';

/**
 * Added props:
 *  - onGateHover(gateId)
 *  - onGateHoverOut()
 *  - hoverGateId
 */
export default function CircuitGrid({
  circuit,
  onAddSingle,
  onStartAddCX,
  onResolveCX,
  pendingCX,
  onStartMultiQubitGate,
  onContinueMultiQubitGate,
  pendingMultiQubit,
  cancelPending,
  onMoveGate,
  onDeleteGate,
  onSelectGate,
  selectedGateId,
  onEditGate,
  onGateHover,
  onGateHoverOut,
  hoverGateId
}) {
  const cols = Math.max(maxColumn(circuit), 15);
  const dragGateRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  const gatesByPos = React.useMemo(() => {
    const map = {};
    circuit.gates.forEach(g => {
      if (!map[g.column]) map[g.column] = [];
      map[g.column].push(g);
    });
    return map;
  }, [circuit]);

  function handleDropNew(e, qubit, column) {
    const gateType = e.dataTransfer.getData('application/x-gate');
    if (!gateType) return;
    if (gateType === 'cx' || gateType === 'cz' || gateType === 'ccx') {
      onStartMultiQubitGate(gateType, qubit, column);
    } else {
      onAddSingle(gateType, qubit, column);
    }
  }

  function handleDragGateStart(e, gate) {
    dragGateRef.current = { gateId: gate.id };
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleGateCellDrop(qubit, column) {
    if (dragGateRef.current) {
      onMoveGate(dragGateRef.current.gateId, column, qubit);
      dragGateRef.current = null;
    }
  }

  function GateRender({ gate }) {
    const isSelected = gate.id === selectedGateId;
    const isHover = hoverGateId === gate.id;

    if (gate.type === 'cx' || gate.type === 'cz') {
      const top = Math.min(gate.control, gate.target);
      const bottom = Math.max(gate.control, gate.target);
      const height = (bottom - top) * 48;

      return (
        <>
          <div
            className="qt-cx-vertical"
            style={{ top: top * 48 + 24, height }}
          />
          <div
            className={clsx('qt-cx-node', isSelected && 'selected', isHover && 'selected')}
            style={{ top: gate.control * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`${gate.type.toUpperCase()} control q[${gate.control}] -> q[${gate.target}]`}
          >•</div>
          <div
            className={clsx('qt-cx-node target', isSelected && 'selected', isHover && 'selected')}
            style={{ top: gate.target * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`${gate.type.toUpperCase()} target q[${gate.target}]`}
          >{gate.type === 'cx' ? '⊕' : '•'}</div>
          <button
            className="qt-cx-delete"
            onClick={(e) => { e.stopPropagation(); onDeleteGate(gate.id); }}
            title="Delete gate"
          >✖</button>
        </>
      );
    }

    if (gate.type === 'ccx') {
      const qubits = [gate.control1, gate.control2, gate.target].sort((a, b) => a - b);
      const top = qubits[0];
      const bottom = qubits[2];
      const height = (bottom - top) * 48;

      return (
        <>
          <div
            className="qt-cx-vertical"
            style={{ top: top * 48 + 24, height }}
          />
          <div
            className={clsx('qt-cx-node', isSelected && 'selected', isHover && 'selected')}
            style={{ top: gate.control1 * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`CCX control1 q[${gate.control1}]`}
          >•</div>
          <div
            className={clsx('qt-cx-node', isSelected && 'selected', isHover && 'selected')}
            style={{ top: gate.control2 * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`CCX control2 q[${gate.control2}]`}
          >•</div>
          <div
            className={clsx('qt-cx-node target', isSelected && 'selected', isHover && 'selected')}
            style={{ top: gate.target * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`CCX target q[${gate.target}]`}
          >⊕</div>
          <button
            className="qt-cx-delete"
            onClick={(e) => { e.stopPropagation(); onDeleteGate(gate.id); }}
            title="Delete gate"
          >✖</button>
        </>
      );
    }

    const label = gate.type === 'measure' ? 'M' : gate.type.toUpperCase();
    const isRot = ['rx', 'ry', 'rz'].includes(gate.type);
    return (
      <div
        className={clsx('qt-gate-box', (isSelected || isHover) && 'selected')}
        draggable
        onDragStart={(e) => handleDragGateStart(e, gate)}
        onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
        onMouseEnter={() => onGateHover?.(gate.id)}
        onMouseLeave={() => onGateHoverOut?.()}
        title={label + (gate.type === 'measure' ? ` -> c[${gate.classicalBit}]` : '')}
      >
        {label}
        {isRot && <div className="qt-small">{(gate.params?.theta ?? Math.PI / 2).toFixed(2)}</div>}
        <div className="qt-gate-actions">
          {isRot && (
            <button
              onClick={(e) => { e.stopPropagation(); onEditGate(gate); }}
              title="Edit parameter"
            >✏</button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteGate(gate.id); }}
            title="Delete gate"
          >✖</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qt-grid-wrapper">
      <div className="qt-grid-inner">
        <div className="qt-grid-colhdr">
          {Array.from({ length: cols + 1 }).map((_, c) =>
            <div key={c}>{c}</div>
          )}
        </div>
        <div>
          {Array.from({ length: circuit.numQubits }).map((_, q) => (
            <div key={q} className="qt-qubit-row">
              <div className="qt-qubit-label">q[{q}]</div>
              {Array.from({ length: cols + 1 }).map((__, c) => {
                const gatesInColumn = gatesByPos[c] || [];
                const gatesOnThisQubit = gatesInColumn.filter(g =>
                  g.type === 'cx' || g.type === 'cz'
                    ? (g.control === q || g.target === q)
                    : g.type === 'ccx'
                    ? (g.control1 === q || g.control2 === q || g.target === q)
                    : g.qubits[0] === q
                );
                
                const isPendingTarget = pendingCX && pendingCX.control !== q;
                const isControlChosen = pendingCX && pendingCX.control === q;
                
                // Handle new multi-qubit pending states
                const isPendingMultiTarget = pendingMultiQubit && !pendingMultiQubit.qubits.includes(q);
                const isMultiSelected = pendingMultiQubit && pendingMultiQubit.qubits.includes(q);
                
                const isDragOver = dragOver && dragOver.qubit === q && dragOver.column === c;

                return (
                  <div
                    key={c}
                    className={clsx(
                      'qt-cell',
                      isDragOver && 'drag-over',
                      (isPendingTarget || isPendingMultiTarget) && 'pending-target',
                      (isControlChosen || isMultiSelected) && 'control-chosen'
                    )}
                    onDragOver={(e) => { e.preventDefault(); setDragOver({ qubit: q, column: c }); }}
                    onDragLeave={() => {
                      if (dragOver && dragOver.qubit === q && dragOver.column === c) setDragOver(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragGateRef.current) {
                        handleGateCellDrop(q, c);
                      } else {
                        handleDropNew(e, q, c);
                      }
                      setDragOver(null);
                    }}
                    onClick={() => {
                      if (pendingCX && pendingCX.control !== q) {
                        onResolveCX(q);
                      } else if (pendingMultiQubit && !pendingMultiQubit.qubits.includes(q)) {
                        onContinueMultiQubitGate(q);
                      }
                    }}
                  >
                    <div className="qt-wire" />
                    {gatesOnThisQubit.map(g => (
                      <div key={g.id} className="qt-gate">
                        <GateRender gate={g} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {pendingCX && (
        <div className="qt-pending-msg">
          Select target qubit for CX
        </div>
      )}
      {pendingMultiQubit && (
        <div className="qt-pending-msg">
          {pendingMultiQubit.type === 'cx' && 'Select target qubit for CX'}
          {pendingMultiQubit.type === 'cz' && 'Select target qubit for CZ'}
          {pendingMultiQubit.type === 'ccx' && pendingMultiQubit.step === 'control2' && 'Select second control qubit for CCX'}
          {pendingMultiQubit.type === 'ccx' && pendingMultiQubit.step === 'target' && 'Select target qubit for CCX'}
          <button
            onClick={cancelPending}
            style={{
              marginLeft: '10px',
              background: '#6c4a14',
              border: '1px solid #a07022',
              color: '#ffd99f',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 10,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}