/**
 * circuitStore.js — State management for Q-Circuit Studio.
 *
 * A useReducer + React Context that manages the entire circuit editor
 * state: gates, qubit count, selection, active tool, undo/redo stacks,
 * zoom/pan, and clipboard.  Every canvas interaction flows through
 * dispatch(action) → reducer → new state → re-render.
 */

import React, {
  createContext, useContext, useReducer, useCallback, useRef, useEffect,
} from 'react';

// ─── Helpers ───────────────────────────────────────────────────────

let _nextId = 1;
export function genId() { return `g_${Date.now().toString(36)}_${_nextId++}`; }

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

/** Snapshot only the fields we care about for undo/redo. */
function snapshot(state) {
  return {
    gates:     deepClone(state.gates),
    qubits:    state.qubits,
    timeSteps: state.timeSteps,
  };
}

// ─── Initial state ─────────────────────────────────────────────────

export const INITIAL_STATE = {
  // Circuit data
  gates:     [],     // { id, type, qubits: [int], col: int, params: {} }
  qubits:    3,
  timeSteps: 14,

  // Interaction
  selection:       [],     // gate IDs
  tool:            'place', // 'select' | 'place' | 'erase' | 'pan'
  activePlaceGate: 'H',   // gate type ID ready to place
  clipboard:       [],

  // Undo / Redo
  undoStack: [],
  redoStack: [],
  shortcutsHelpOpen: false,
  commandPaletteOpen: false,

  // Simulation result
  simulationResult: null,

  // Canvas viewport
  zoom:      1,
  panOffset: { x: 0, y: 0 },

  // Meta
  circuitName: 'Untitled Circuit',
  readOnly:    false,
};

// ─── Reducer ───────────────────────────────────────────────────────

function pushUndo(state) {
  return {
    undoStack: [...state.undoStack.slice(-39), snapshot(state)],
    redoStack: [],
  };
}

function circuitReducer(state, action) {
  switch (action.type) {

    // ── Gate placement ────────────────────────────────────────
    case 'ADD_GATE': {
      const { gateType, qubits: qArr, col, params = {} } = action;
      // Prevent placing on occupied cell (same qubits + same col)
      const occupied = state.gates.some(
        g => g.col === col && g.qubits.some(q => qArr.includes(q))
      );
      if (occupied) return state;
      const gate = { id: genId(), type: gateType, qubits: qArr, col, params };
      return {
        ...state,
        ...pushUndo(state),
        gates: [...state.gates, gate],
      };
    }

    case 'REMOVE_GATE': {
      return {
        ...state,
        ...pushUndo(state),
        gates: state.gates.filter(g => g.id !== action.id),
        selection: state.selection.filter(id => id !== action.id),
      };
    }

    case 'UPDATE_GATE': {
      const { id, patch } = action;
      return {
        ...state,
        ...pushUndo(state),
        gates: state.gates.map(g => g.id === id ? { ...g, ...patch } : g),
      };
    }

    case 'MOVE_GATE': {
      const { id, col, qubits: qArr } = action;
      // Prevent if occupied
      const occupied = state.gates.some(
        g => g.id !== id && g.col === col && g.qubits.some(q => qArr.includes(q))
      );
      if (occupied) return state;
      return {
        ...state,
        ...pushUndo(state),
        gates: state.gates.map(g =>
          g.id === id ? { ...g, col, qubits: qArr } : g
        ),
      };
    }

    // ── Selection ─────────────────────────────────────────────
    case 'SELECT': {
      const { id, add = false } = action;
      if (add) {
        return { ...state, selection: state.selection.includes(id) ? state.selection.filter(x => x !== id) : [...state.selection, id] };
      }
      return { ...state, selection: [id] };
    }

    case 'SELECT_ALL':
      return { ...state, selection: state.gates.map(g => g.id) };

    case 'DESELECT':
      return { ...state, selection: [] };

    // ── Tools ─────────────────────────────────────────────────
    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'SET_PLACE_GATE':
      return { ...state, activePlaceGate: action.gateType, tool: 'place' };

    // ── Circuit structure ─────────────────────────────────────
    case 'UPDATE_CIRCUIT_FROM_CODE':
      return { 
        ...state, 
        ...pushUndo(state), 
        qubits: action.payload.qubits, 
        gates: action.payload.gates,
        selection: []
      };

    case 'ADD_QUBIT':
      return { ...state, ...pushUndo(state), qubits: state.qubits + 1 };

    case 'REMOVE_QUBIT': {
      if (state.qubits <= 1) return state;
      const maxQ = state.qubits - 1;
      return {
        ...state,
        ...pushUndo(state),
        qubits: maxQ,
        gates: state.gates.filter(g => g.qubits.every(q => q < maxQ)),
      };
    }

    case 'SET_TIME_STEPS':
      return { ...state, timeSteps: Math.max(4, action.count) };

    // ── Clipboard ─────────────────────────────────────────────
    case 'COPY': {
      const copied = state.gates.filter(g => state.selection.includes(g.id));
      return { ...state, clipboard: deepClone(copied) };
    }

    case 'PASTE': {
      if (state.clipboard.length === 0) return state;
      const offset = 1;
      const maxCol = Math.max(0, ...state.gates.map(g => g.col));
      const minClipCol = Math.min(...state.clipboard.map(g => g.col));
      const newGates = state.clipboard.map(g => ({
        ...deepClone(g),
        id: genId(),
        col: g.col - minClipCol + maxCol + offset,
      }));
      return {
        ...state,
        ...pushUndo(state),
        gates: [...state.gates, ...newGates],
        selection: newGates.map(g => g.id),
      };
    }

    case 'DELETE_SELECTION': {
      if (state.selection.length === 0) return state;
      const selSet = new Set(state.selection);
      return {
        ...state,
        ...pushUndo(state),
        gates: state.gates.filter(g => !selSet.has(g.id)),
        selection: [],
      };
    }

    // ── Bulk operations ───────────────────────────────────────
    case 'ADD_BARRIER': {
      const col = Math.max(0, ...state.gates.map(g => g.col), -1) + 1;
      const allQubits = Array.from({ length: state.qubits }, (_, i) => i);
      const gate = { id: genId(), type: 'BARRIER', qubits: allQubits, col, params: {} };
      return { ...state, ...pushUndo(state), gates: [...state.gates, gate] };
    }

    case 'MEASURE_ALL': {
      const maxCol = Math.max(0, ...state.gates.map(g => g.col), -1) + 1;
      const newGates = Array.from({ length: state.qubits }, (_, i) => ({
        id: genId(), type: 'MEASURE', qubits: [i], col: maxCol, params: {},
      }));
      return { ...state, ...pushUndo(state), gates: [...state.gates, ...newGates] };
    }

    case 'CLEAR_CIRCUIT':
      return { ...state, ...pushUndo(state), gates: [], selection: [] };

    // ── Undo / Redo ───────────────────────────────────────────
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        ...prev,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, snapshot(state)],
        selection: [],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        ...state,
        ...next,
        undoStack: [...state.undoStack, snapshot(state)],
        redoStack: state.redoStack.slice(0, -1),
        selection: [],
      };
    }

    // ── Viewport ──────────────────────────────────────────────
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.25, Math.min(3, action.zoom)) };

    case 'SET_PAN':
      return { ...state, panOffset: action.offset };

    case 'FIT_VIEW':
      return { ...state, zoom: 1, panOffset: { x: 0, y: 0 } };

    // ── Import / Meta ─────────────────────────────────────────
    case 'TOGGLE_SHORTCUTS_HELP':
      return { ...state, shortcutsHelpOpen: !state.shortcutsHelpOpen };
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    case 'SET_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: action.open };

    case 'SET_SIMULATION_RESULT':
      return { ...state, simulationResult: action.result };

    case 'IMPORT_CIRCUIT': {
      const { gates, qubits, name } = action;
      return {
        ...state,
        ...pushUndo(state),
        gates: (gates || []).map(g => ({ ...g, id: g.id || genId() })),
        qubits: qubits || state.qubits,
        circuitName: name || state.circuitName,
        selection: [],
      };
    }

    case 'SET_CIRCUIT_NAME':
      return { ...state, circuitName: action.name };

    case 'SET_READ_ONLY':
      return { ...state, readOnly: action.readOnly };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────

const CircuitContext = createContext(null);

export function CircuitProvider({ children, initialState, onCircuitChange }) {
  const [state, dispatch] = useReducer(
    circuitReducer,
    initialState || INITIAL_STATE,
  );

  // Fire callback on every state change (for collab sync, code gen, etc.)
  const prevGatesRef = useRef(state.gates);
  useEffect(() => {
    if (onCircuitChange && state.gates !== prevGatesRef.current) {
      prevGatesRef.current = state.gates;
      onCircuitChange(state);
    }
  }, [state.gates, state.qubits, onCircuitChange]);

  const value = React.useMemo(
    () => ({ state, dispatch }),
    [state],
  );

  return (
    <CircuitContext.Provider value={value}>
      {children}
    </CircuitContext.Provider>
  );
}

export function useCircuit() {
  const ctx = useContext(CircuitContext);
  if (!ctx) throw new Error('useCircuit must be used within CircuitProvider');
  return ctx;
}
