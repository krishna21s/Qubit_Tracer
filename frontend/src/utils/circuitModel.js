import { nanoid } from "nanoid";

// (Existing exports retained; only added/modified parts for new features)

export function createCircuit(numQubits = 2) {
  return {
    numQubits,
    gates: [], // each: { id, type, qubits[], column, params?, control?, target? }
  };
}

export function addSingleQubitGate(circuit, { type, qubit, column, params }) {
  const gate = {
    id: nanoid(),
    type,
    qubits: [qubit],
    column,
    ...(params ? { params } : {}),
  };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function addCXGate(circuit, { control, target, column }) {
  const gate = {
    id: nanoid(),
    type: "cx",
    qubits: [control, target],
    control,
    target,
    column,
  };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function addCZGate(circuit, { control, target, column }) {
  const gate = {
    id: nanoid(),
    type: "cz",
    qubits: [control, target],
    control,
    target,
    column,
  };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function addCCXGate(circuit, { control1, control2, target, column }) {
  const gate = {
    id: nanoid(),
    type: "ccx",
    qubits: [control1, control2, target],
    control1,
    control2,
    target,
    column,
  };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function addMeasureGate(circuit, { qubit, column, classicalBit }) {
  const gate = {
    id: nanoid(),
    type: "measure",
    qubits: [qubit],
    classicalBit: classicalBit ?? qubit, // Default classical bit to qubit index
    column,
  };
  return { ...circuit, gates: [...circuit.gates, gate] };
}

export function updateGateParams(circuit, gateId, paramsPatch) {
  return {
    ...circuit,
    gates: circuit.gates.map((g) =>
      g.id === gateId
        ? { ...g, params: { ...(g.params || {}), ...paramsPatch } }
        : g
    ),
  };
}

export function moveGate(circuit, gateId, { column, qubit }) {
  return {
    ...circuit,
    gates: circuit.gates.map((g) => {
      if (g.id !== gateId) return g;
      if (g.type === "cx" || g.type === "cz" || g.type === "ccx") {
        // Multi-qubit gates can only change column, not qubits
        return { ...g, column };
      }
      return { ...g, column, qubits: [qubit] };
    }),
  };
}

export function deleteGate(circuit, gateId) {
  return { ...circuit, gates: circuit.gates.filter((g) => g.id !== gateId) };
}

export function replaceGate(circuit, gateId, gatePatch) {
  return {
    ...circuit,
    gates: circuit.gates.map((g) =>
      g.id === gateId ? { ...g, ...gatePatch } : g
    ),
  };
}

export function removeGateAtColumn(circuit, column, gateId) {
  return {
    ...circuit,
    gates: circuit.gates.filter(
      (g) => !(g.column === column && g.id === gateId)
    ),
  };
}

export function resizeQubits(circuit, newCount) {
  const filtered = circuit.gates.filter((g) =>
    g.qubits.every((q) => q < newCount)
  );
  return { numQubits: newCount, gates: filtered };
}

export function maxColumn(circuit) {
  if (!circuit.gates.length) return 0;
  return Math.max(...circuit.gates.map((g) => g.column));
}

export function orderedGates(circuit) {
  return [...circuit.gates].sort((a, b) => a.column - b.column);
}
