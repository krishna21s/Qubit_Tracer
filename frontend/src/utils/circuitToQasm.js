/**
 * utils/circuitToQasm.js
 * Converts the Q-Circuit Studio JSON state into OpenQASM 2.0 format.
 */

import { getGateDef } from '../data/gateDefinitions';

export function circuitToQasm(state) {
  const { qubits, gates } = state;
  
  // 1. QASM Header
  let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\n\n`;
  
  // 2. Registers
  qasm += `qreg q[${qubits}];\n`;
  // We'll add a classical register of the same size if there are measurements
  const hasMeasurements = gates.some(g => g.type === 'MEASURE');
  if (hasMeasurements) {
    qasm += `creg c[${qubits}];\n`;
  }
  qasm += `\n`;
  
  // Sort gates by column, then by qubit, to ensure chronological order
  const sortedGates = [...gates].sort((a, b) => {
    if (a.col !== b.col) return a.col - b.col;
    return a.qubits[0] - b.qubits[0];
  });
  
  // 3. Process Gates
  for (const gate of sortedGates) {
    const def = getGateDef(gate.type);
    
    // Format qubits (e.g., q[0], q[1])
    const qArgs = gate.qubits.map(q => `q[${q}]`).join(', ');
    
    if (gate.type === 'BARRIER') {
      qasm += `barrier ${qArgs};\n`;
      continue;
    }
    
    if (gate.type === 'MEASURE') {
      qasm += `measure ${qArgs} -> c[${gate.qubits[0]}];\n`;
      continue;
    }
    
    // Map internal gate types to QASM standard gates if needed
    // QASM standard single-qubit: x, y, z, h, s, sdg, t, tdg, rx, ry, rz
    // QASM standard multi-qubit: cx, cz, swap, ccx
    let qasmGateType = gate.type.toLowerCase();
    if (qasmGateType === 'cnot') qasmGateType = 'cx';
    if (qasmGateType === 'toffoli') qasmGateType = 'ccx';
    
    // Format parameters if present
    let paramsStr = '';
    if (def && def.params && def.params.length > 0 && gate.params) {
      const pValues = def.params.map(p => {
        const val = gate.params[p.name] !== undefined ? gate.params[p.name] : p.default;
        return val;
      });
      paramsStr = `(${pValues.join(', ')})`;
    }
    
    qasm += `${qasmGateType}${paramsStr} ${qArgs};\n`;
  }
  
  return qasm;
}
