/**
 * utils/circuitToQiskit.js
 * Converts the Q-Circuit Studio JSON state into Qiskit python code.
 */

import { getGateDef } from '../data/gateDefinitions';

export function circuitToQiskit(state) {
  const { qubits, gates } = state;
  
  // 1. Imports and setup
  let code = `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n`;
  code += `from qiskit.visualization import plot_histogram, plot_bloch_multivector\n`;
  code += `import math\n\n`;
  
  const hasMeasurements = gates.some(g => g.type === 'MEASURE');
  
  if (hasMeasurements) {
    code += `qreg_q = QuantumRegister(${qubits}, 'q')\n`;
    code += `creg_c = ClassicalRegister(${qubits}, 'c')\n`;
    code += `circuit = QuantumCircuit(qreg_q, creg_c)\n\n`;
  } else {
    code += `circuit = QuantumCircuit(${qubits})\n\n`;
  }
  
  // Sort gates by column, then by qubit, to ensure chronological order
  const sortedGates = [...gates].sort((a, b) => {
    if (a.col !== b.col) return a.col - b.col;
    return a.qubits[0] - b.qubits[0];
  });
  
  // 2. Process Gates
  for (const gate of sortedGates) {
    const def = getGateDef(gate.type);
    
    // Format qubits (e.g., 0, 1)
    const qArgs = gate.qubits.join(', ');
    
    if (gate.type === 'BARRIER') {
      code += `circuit.barrier(${qArgs})\n`;
      continue;
    }
    
    if (gate.type === 'MEASURE') {
      code += `circuit.measure(${qArgs}, ${gate.qubits[0]})\n`;
      continue;
    }
    
    // Map internal gate types to Qiskit standard gates
    let qiskitGateType = gate.type.toLowerCase();
    if (qiskitGateType === 'cnot') qiskitGateType = 'cx';
    if (qiskitGateType === 'toffoli') qiskitGateType = 'ccx';
    
    // Format parameters if present
    let paramsStr = '';
    if (def && def.params && def.params.length > 0 && gate.params) {
      const pValues = def.params.map(p => {
        const val = gate.params[p.name] !== undefined ? gate.params[p.name] : p.default;
        // Check if value is a multiple of pi for nicer output
        if (Math.abs(val) > 0.001) {
            const piMultiple = val / Math.PI;
            // if it's close to a simple fraction of pi
            if (Math.abs(Math.round(piMultiple * 4) - (piMultiple * 4)) < 0.01) {
                const num = Math.round(piMultiple * 4);
                if (num === 4) return 'math.pi';
                if (num === -4) return '-math.pi';
                if (num === 2) return 'math.pi/2';
                if (num === -2) return '-math.pi/2';
                if (num === 1) return 'math.pi/4';
                if (num === -1) return '-math.pi/4';
            }
        }
        return val.toFixed(4);
      });
      paramsStr = `${pValues.join(', ')}, `;
    }
    
    code += `circuit.${qiskitGateType}(${paramsStr}${qArgs})\n`;
  }
  
  return code;
}
