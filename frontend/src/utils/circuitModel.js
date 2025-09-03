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
      if (g.type === "cx") {
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
