import React, { useState, useRef } from 'react';
import clsx from 'clsx';
import { maxColumn } from '../../utils/circuitModel';

/**
 * Props unchanged except:
 *  - onStartAddCX now accepts (type, controlQubit, column) for cx/cz/ccx.
 *  - pendingCX can carry { type: 'cx'|'cz'|'ccx', control:number, control2?:number, column:number }.
 */
export default function CircuitGrid({
  circuit,
  onAddSingle,
  onStartAddCX,   // (type, controlQubit, column)
  onResolveCX,    // (targetQubit or secondControl/target depending on type)
  pendingCX,
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
      onStartAddCX(gateType, qubit, column);
      return;
    }
    onAddSingle(gateType, qubit, column);
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

  function TwoQubitRender({ gate }) {
    const isSelected = gate.id === selectedGateId;
    const isHover = hoverGateId === gate.id;
    const top = Math.min(gate.control, gate.target);
    const bottom = Math.max(gate.control, gate.target);
    const height = (bottom - top) * 48;
    const isCX = gate.type === 'cx';
    const targetGlyph = isCX ? '⊕' : '•';

    return (
      <>
        <div className="qt-cx-vertical" style={{ top: top * 48 + 24, height }} />
        <div
          className={clsx('qt-cx-node', (isSelected || isHover) && 'selected')}
          style={{ top: gate.control * 48 + 7 }}
          draggable
          onDragStart={(e) => handleDragGateStart(e, gate)}
          onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
          onMouseEnter={() => onGateHover?.(gate.id)}
          onMouseLeave={() => onGateHoverOut?.()}
          title={`${gate.type.toUpperCase()} control q[${gate.control}]`}
        >•</div>
        <div
          className={clsx('qt-cx-node', isCX && 'target', (isSelected || isHover) && 'selected')}
          style={{ top: gate.target * 48 + 7 }}
          draggable
          onDragStart={(e) => handleDragGateStart(e, gate)}
          onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
          onMouseEnter={() => onGateHover?.(gate.id)}
          onMouseLeave={() => onGateHoverOut?.()}
          title={`${gate.type.toUpperCase()} target q[${gate.target}]`}
        >{targetGlyph}</div>
        <button
          className="qt-cx-delete"
          onClick={(e) => { e.stopPropagation(); onDeleteGate(gate.id); }}
          title="Delete gate"
        >✖</button>
      </>
    );
  }

  function ThreeQubitRender({ gate }) {
    // ccx: two controls + one target
    const isSelected = gate.id === selectedGateId;
    const isHover = hoverGateId === gate.id;
    const controls = gate.controls || [gate.c1, gate.c2].filter(v => v !== undefined);
    const target = gate.target;
    const top = Math.min(...controls.concat([target]));
    const bottom = Math.max(...controls.concat([target]));
    const height = (bottom - top) * 48;

    return (
      <>
        <div className="qt-cx-vertical" style={{ top: top * 48 + 24, height }} />
        {controls.map((c, idx) => (
          <div
            key={idx}
            className={clsx('qt-cx-node', (isSelected || isHover) && 'selected')}
            style={{ top: c * 48 + 7 }}
            draggable
            onDragStart={(e) => handleDragGateStart(e, gate)}
            onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
            onMouseEnter={() => onGateHover?.(gate.id)}
            onMouseLeave={() => onGateHoverOut?.()}
            title={`CCX control q[${c}]`}
          >•</div>
        ))}
        <div
          className={clsx('qt-cx-node', 'target', (isSelected || isHover) && 'selected')}
          style={{ top: target * 48 + 7 }}
          draggable
          onDragStart={(e) => handleDragGateStart(e, gate)}
          onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
          onMouseEnter={() => onGateHover?.(gate.id)}
          onMouseLeave={() => onGateHoverOut?.()}
          title={`CCX target q[${target}]`}
        >⊕</div>
        <button
          className="qt-cx-delete"
          onClick={(e) => { e.stopPropagation(); onDeleteGate(gate.id); }}
          title="Delete gate"
        >✖</button>
      </>
    );
  }

  function GateRender({ gate }) {
    const isSelected = gate.id === selectedGateId;
    const isHover = hoverGateId === gate.id;

    if (gate.type === 'cx' || gate.type === 'cz') {
      return <TwoQubitRender gate={gate} />;
    }
    if (gate.type === 'ccx') {
      return <ThreeQubitRender gate={gate} />;
    }

    const label = gate.type.toUpperCase();
    const isRot = ['rx', 'ry', 'rz'].includes(gate.type);
    return (
      <div
        className={clsx('qt-gate-box', (isSelected || isHover) && 'selected')}
        draggable
        onDragStart={(e) => handleDragGateStart(e, gate)}
        onClick={(e) => { e.stopPropagation(); onSelectGate(gate.id); }}
        onMouseEnter={() => onGateHover?.(gate.id)}
        onMouseLeave={() => onGateHoverOut?.()}
        title={label}
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
                // Render multi-qubit gates once per column: on the top-most involved row
                const gatesOnThisQubit = gatesInColumn.filter(g => {
                  if (g.type === 'cx' || g.type === 'cz') {
                    const ownerRow = Math.min(g.control, g.target);
                    return q === ownerRow;
                  }
                  if (g.type === 'ccx') {
                    const rows = (g.controls || [g.c1, g.c2]).concat([g.target]).filter(v => v !== undefined);
                    const ownerRow = Math.min(...rows);
                    return q === ownerRow;
                  }
                  return g.qubits[0] === q;
                });
                const isDragOver = dragOver && dragOver.qubit === q && dragOver.column === c;

                // Pending selection highlighting
                let pendingClass = '';
                if (pendingCX) {
                  if (pendingCX.type === 'ccx') {
                    // step 1: choose control1 already set
                    // step 2: choose control2 (different from control1)
                    // step 3: choose target (different from both controls)
                    if (pendingCX.control2 == null) {
                      pendingClass = (pendingCX.control !== q) ? 'pending-target' : 'control-chosen';
                    } else {
                      pendingClass = (pendingCX.control !== q && pendingCX.control2 !== q) ? 'pending-target' : 'control-chosen';
                    }
                  } else {
                    pendingClass = (pendingCX.control !== q) ? 'pending-target' : 'control-chosen';
                  }
                }

                return (
                  <div
                    key={c}
                    className={clsx('qt-cell', isDragOver && 'drag-over', pendingClass)}
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
                      if (!pendingCX) return;
                      // Resolve flows
                      if (pendingCX.type === 'ccx') {
                        if (pendingCX.control2 == null) {
                          if (q !== pendingCX.control) onResolveCX({ step: 2, control2: q });
                        } else {
                          if (q !== pendingCX.control && q !== pendingCX.control2) onResolveCX({ step: 3, target: q });
                        }
                      } else {
                        if (pendingCX.control !== q) onResolveCX(q);
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
          {pendingCX.type === 'ccx'
            ? (pendingCX.control2 == null
              ? 'Pick second control for CCX'
              : 'Pick target for CCX')
            : `Select target qubit for ${pendingCX.type.toUpperCase()}`}
        </div>
      )}
    </div>
  );
}