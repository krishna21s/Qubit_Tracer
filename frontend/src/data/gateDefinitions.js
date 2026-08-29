/**
 * gateDefinitions.js — Complete quantum gate library for Q-Circuit Studio.
 *
 * Every gate the editor supports is defined here: symbol, colour, qubit
 * count, shortcut key, parameter definitions, and tooltip text. The
 * GatePalette, GateElement, CircuitCanvas, and code generators all read
 * from this single source of truth.
 */

// ─── Gate Categories ───────────────────────────────────────────────
export const GATE_CATEGORIES = [
  { id: 'single',     label: 'Single-Qubit',       icon: '⚛️',  description: 'Operations on individual qubits' },
  { id: 'multi',      label: 'Multi-Qubit',         icon: '🔗',  description: 'Entangling & controlled operations' },
  { id: 'phase',      label: 'Phase & Rotation',    icon: '🔄',  description: 'Parameterized rotation gates' },
  { id: 'measure',    label: 'Measurement',          icon: '📊',  description: 'Measure & reset operations' },
  { id: 'structural', label: 'Structural',           icon: '📐',  description: 'Barriers, resets & flow control' },
];

// ─── Gate Definitions ──────────────────────────────────────────────
export const GATES = [
  // ── Single-qubit ──────────────────────────────────────────────
  {
    id: 'H', name: 'Hadamard', category: 'single', qubits: 1,
    symbol: 'H', color: '#4cc3fa',
    tooltip: 'Creates equal superposition of |0⟩ and |1⟩',
    shortcut: 'h',
    matrix: '1/√2 [[1,1],[1,-1]]',
  },
  {
    id: 'X', name: 'Pauli-X', category: 'single', qubits: 1,
    symbol: 'X', color: '#ff6b6b',
    tooltip: 'Bit flip — equivalent to classical NOT',
    shortcut: 'x',
    matrix: '[[0,1],[1,0]]',
  },
  {
    id: 'Y', name: 'Pauli-Y', category: 'single', qubits: 1,
    symbol: 'Y', color: '#51cf66',
    tooltip: 'Combined bit flip + phase flip',
    shortcut: 'y',
    matrix: '[[0,-i],[i,0]]',
  },
  {
    id: 'Z', name: 'Pauli-Z', category: 'single', qubits: 1,
    symbol: 'Z', color: '#ffd43b',
    tooltip: 'Phase flip — flips the sign of |1⟩',
    shortcut: 'z',
    matrix: '[[1,0],[0,-1]]',
  },
  {
    id: 'S', name: 'S Gate', category: 'single', qubits: 1,
    symbol: 'S', color: '#da77f2',
    tooltip: 'π/2 phase gate — square root of Z',
    matrix: '[[1,0],[0,i]]',
  },
  {
    id: 'Sdg', name: 'S† Gate', category: 'single', qubits: 1,
    symbol: 'S†', color: '#c084f5',
    tooltip: 'Conjugate transpose of S gate',
    matrix: '[[1,0],[0,-i]]',
  },
  {
    id: 'T', name: 'T Gate', category: 'single', qubits: 1,
    symbol: 'T', color: '#f783ac',
    tooltip: 'π/4 phase gate — square root of S',
    matrix: '[[1,0],[0,e^(iπ/4)]]',
  },
  {
    id: 'Tdg', name: 'T† Gate', category: 'single', qubits: 1,
    symbol: 'T†', color: '#e599b8',
    tooltip: 'Conjugate transpose of T gate',
    matrix: '[[1,0],[0,e^(-iπ/4)]]',
  },
  {
    id: 'I', name: 'Identity', category: 'single', qubits: 1,
    symbol: 'I', color: '#868e96',
    tooltip: 'No operation — useful as a placeholder',
    matrix: '[[1,0],[0,1]]',
  },
  {
    id: 'SX', name: '√X Gate', category: 'single', qubits: 1,
    symbol: '√X', color: '#ff8787',
    tooltip: 'Square root of X — half a NOT gate',
    matrix: '1/2 [[1+i,1-i],[1-i,1+i]]',
  },

  // ── Phase & Rotation ──────────────────────────────────────────
  {
    id: 'Rx', name: 'Rx Rotation', category: 'phase', qubits: 1,
    symbol: 'Rx', color: '#ff6b6b',
    tooltip: 'Rotation around X-axis by angle θ',
    params: [{ name: 'theta', label: 'θ', default: Math.PI / 2, min: 0, max: 2 * Math.PI, step: Math.PI / 12 }],
  },
  {
    id: 'Ry', name: 'Ry Rotation', category: 'phase', qubits: 1,
    symbol: 'Ry', color: '#51cf66',
    tooltip: 'Rotation around Y-axis by angle θ',
    params: [{ name: 'theta', label: 'θ', default: Math.PI / 2, min: 0, max: 2 * Math.PI, step: Math.PI / 12 }],
  },
  {
    id: 'Rz', name: 'Rz Rotation', category: 'phase', qubits: 1,
    symbol: 'Rz', color: '#ffd43b',
    tooltip: 'Rotation around Z-axis by angle θ',
    shortcut: 'r',
    params: [{ name: 'theta', label: 'θ', default: Math.PI / 2, min: 0, max: 2 * Math.PI, step: Math.PI / 12 }],
  },
  {
    id: 'P', name: 'Phase Gate', category: 'phase', qubits: 1,
    symbol: 'P', color: '#74c0fc',
    tooltip: 'General phase gate — adds phase e^(iλ) to |1⟩',
    params: [{ name: 'lambda', label: 'λ', default: Math.PI / 4, min: 0, max: 2 * Math.PI, step: Math.PI / 12 }],
  },
  {
    id: 'U', name: 'U Gate', category: 'phase', qubits: 1,
    symbol: 'U', color: '#4cc3fa',
    tooltip: 'Universal single-qubit gate with 3 parameters',
    params: [
      { name: 'theta',  label: 'θ', default: Math.PI / 2, min: 0, max: Math.PI,     step: Math.PI / 12 },
      { name: 'phi',    label: 'φ', default: 0,            min: 0, max: 2 * Math.PI, step: Math.PI / 12 },
      { name: 'lambda', label: 'λ', default: 0,            min: 0, max: 2 * Math.PI, step: Math.PI / 12 },
    ],
  },

  // ── Multi-qubit ───────────────────────────────────────────────
  {
    id: 'CNOT', name: 'CNOT', category: 'multi', qubits: 2,
    symbol: '⊕', color: '#4cc3fa',
    tooltip: 'Controlled-NOT — entangles two qubits',
    shortcut: 'c',
    controlSymbol: '●',
    targetSymbol: '⊕',
  },
  {
    id: 'CZ', name: 'CZ Gate', category: 'multi', qubits: 2,
    symbol: 'CZ', color: '#ffd43b',
    tooltip: 'Controlled-Z — symmetric entangling gate',
    controlSymbol: '●',
    targetSymbol: '●',
  },
  {
    id: 'SWAP', name: 'SWAP', category: 'multi', qubits: 2,
    symbol: '×', color: '#da77f2',
    tooltip: 'Swaps the states of two qubits',
    shortcut: 's',
  },
  {
    id: 'CCX', name: 'Toffoli', category: 'multi', qubits: 3,
    symbol: '⊕', color: '#ff6b6b',
    tooltip: 'Doubly-controlled NOT — quantum AND gate',
    controlSymbol: '●',
    targetSymbol: '⊕',
  },

  // ── Measurement ───────────────────────────────────────────────
  {
    id: 'MEASURE', name: 'Measure', category: 'measure', qubits: 1,
    symbol: 'M', color: '#868e96',
    tooltip: 'Measures the qubit in the computational basis',
    shortcut: 'm',
  },

  // ── Structural ────────────────────────────────────────────────
  {
    id: 'BARRIER', name: 'Barrier', category: 'structural', qubits: -1,
    symbol: '┃', color: '#495057',
    tooltip: 'Prevents gate optimizations across this boundary',
    shortcut: 'b',
  },
  {
    id: 'RESET', name: 'Reset', category: 'structural', qubits: 1,
    symbol: '|0⟩', color: '#495057',
    tooltip: 'Resets the qubit to |0⟩ state',
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────

const _gateMap = new Map(GATES.map(g => [g.id, g]));

/** Get a gate definition by ID. */
export function getGateDef(gateId) {
  return _gateMap.get(gateId) || null;
}

/** Get all gates in a category. */
export function getGatesByCategory(categoryId) {
  return GATES.filter(g => g.category === categoryId);
}

/** Get gate definition by its keyboard shortcut (single char). */
export function getGateByShortcut(key) {
  return GATES.find(g => g.shortcut === key.toLowerCase()) || null;
}

/**
 * Format a radian value as a human-readable string.
 * e.g. Math.PI -> "π", Math.PI/2 -> "π/2", 1.23 -> "1.23"
 */
export function formatAngle(rad) {
  if (rad == null) return '';
  const PI = Math.PI;
  const fracs = [
    [2 * PI, '2π'], [PI, 'π'], [PI / 2, 'π/2'], [PI / 3, 'π/3'],
    [PI / 4, 'π/4'], [PI / 6, 'π/6'], [PI / 8, 'π/8'],
    [3 * PI / 4, '3π/4'], [3 * PI / 2, '3π/2'],
    [2 * PI / 3, '2π/3'], [5 * PI / 6, '5π/6'],
  ];
  for (const [val, label] of fracs) {
    if (Math.abs(rad - val) < 0.001) return label;
    if (Math.abs(rad + val) < 0.001) return `-${label}`;
  }
  if (Math.abs(rad) < 0.001) return '0';
  return rad.toFixed(2);
}
