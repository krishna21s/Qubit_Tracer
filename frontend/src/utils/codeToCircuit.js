import { genId } from '../lib/circuitStore';

/**
 * Basic auto-layout: places a gate at the earliest column where all its target qubits are free.
 */
function assignColumn(qubits, columnTracker) {
  let maxCol = -1;
  for (const q of qubits) {
    if (columnTracker[q] === undefined) columnTracker[q] = -1;
    if (columnTracker[q] > maxCol) {
      maxCol = columnTracker[q];
    }
  }
  const col = maxCol + 1;
  for (const q of qubits) {
    columnTracker[q] = col;
  }
  return col;
}

const GATE_MAP_QASM = {
  'h': 'H', 'x': 'X', 'y': 'Y', 'z': 'Z',
  's': 'S', 'sdg': 'Sdg', 't': 'T', 'tdg': 'Tdg',
  'cx': 'CNOT', 'cz': 'CZ', 'swap': 'SWAP', 'ccx': 'CCX',
  'rx': 'RX', 'ry': 'RY', 'rz': 'RZ', 'u': 'U',
  'barrier': 'BARRIER', 'measure': 'MEASURE'
};

const GATE_MAP_QISKIT = {
  'h': 'H', 'x': 'X', 'y': 'Y', 'z': 'Z',
  's': 'S', 'sdg': 'Sdg', 't': 'T', 'tdg': 'Tdg',
  'cx': 'CNOT', 'cz': 'CZ', 'swap': 'SWAP', 'ccx': 'CCX',
  'rx': 'RX', 'ry': 'RY', 'rz': 'RZ', 'u': 'U',
  'barrier': 'BARRIER', 'measure': 'MEASURE'
};

export function parseCodeToCircuit(code, lang) {
  let qubitsCount = 3;
  const gates = [];
  const columnTracker = {}; // Tracks the highest occupied column per qubit
  
  if (lang === 'qasm') {
    const lines = code.split(';').map(l => l.trim().replace(/\n/g, ' '));
    for (const line of lines) {
      if (!line) continue;
      
      const qregMatch = line.match(/^qreg\s+\w+\[(\d+)\]/);
      if (qregMatch) {
        qubitsCount = parseInt(qregMatch[1], 10);
        continue;
      }
      
      // Match something like `rx(pi/2) q[0]` or `h q[0]` or `cx q[0], q[1]`
      const gateMatch = line.match(/^([a-zA-Z]+)(?:\(([^)]+)\))?\s+(.+)/);
      if (gateMatch) {
        const rawGate = gateMatch[1].toLowerCase();
        if (GATE_MAP_QASM[rawGate]) {
          const type = GATE_MAP_QASM[rawGate];
          // extract qubits
          const argsStr = gateMatch[3];
          const qubitMatches = [...argsStr.matchAll(/\[(\d+)\]/g)];
          const qubits = qubitMatches.map(m => parseInt(m[1], 10));
          
          if (qubits.length > 0) {
            const gateDef = {
              'H': 1, 'X': 1, 'Y': 1, 'Z': 1, 'S': 1, 'Sdg': 1, 'T': 1, 'Tdg': 1,
              'RX': 1, 'RY': 1, 'RZ': 1, 'U': 1, 'MEASURE': 1, 'BARRIER': 1,
              'CNOT': 2, 'CZ': 2, 'SWAP': 2, 'CCX': 3
            }[type] || 1;

            if (gateDef === 1 && qubits.length > 1) {
              for (const q of qubits) {
                const col = assignColumn([q], columnTracker);
                gates.push({ id: genId(), type, qubits: [q], col, params: {} });
              }
            } else {
              const targetQubits = qubits.slice(-gateDef);
              const col = assignColumn(targetQubits, columnTracker);
              gates.push({ id: genId(), type, qubits: targetQubits, col, params: {} });
            }
          }
        }
      }
    }
  } else if (lang === 'qiskit') {
    const lines = code.split('\n').map(l => l.trim());
    for (const line of lines) {
      if (!line) continue;
      
      const qcMatch = line.match(/QuantumCircuit\((\d+)/);
      if (qcMatch) {
        qubitsCount = parseInt(qcMatch[1], 10);
        continue;
      }
      
      // Match `circuit.gate(args)`
      const gateMatch = line.match(/^\w+\.([a-zA-Z_]+)\((.*)\)/);
      if (gateMatch) {
        let rawGate = gateMatch[1].toLowerCase();
        
        // Special case: measure_all
        if (rawGate === 'measure_all') {
          for (let i = 0; i < qubitsCount; i++) {
            const col = assignColumn([i], columnTracker);
            gates.push({ id: genId(), type: 'MEASURE', qubits: [i], col, params: {} });
          }
          continue;
        }

        // Special case: measure (only extract the first argument/array for quantum bits)
        if (rawGate === 'measure') {
          const argsStr = gateMatch[2];
          let qubitPart = argsStr;
          const bracketMatch = argsStr.match(/\[(.*?)\]/);
          if (bracketMatch) {
            qubitPart = bracketMatch[1];
          } else {
            qubitPart = argsStr.split(',')[0];
          }
          
          const matches = qubitPart.match(/\b\d+\b/g);
          if (matches) {
            for (const m of matches) {
              const q = parseInt(m, 10);
              const col = assignColumn([q], columnTracker);
              gates.push({ id: genId(), type: 'MEASURE', qubits: [q], col, params: {} });
            }
          }
          continue;
        }

        if (GATE_MAP_QISKIT[rawGate]) {
          const type = GATE_MAP_QISKIT[rawGate];
          const argsStr = gateMatch[2];
          
          // Improved parsing: extract all integers from the arguments
          // e.g. "0", "[0, 1]", "3, 4"
          // We will extract all numbers that look like qubit indices
          // But wait, what if there are parameter values like 3.14?
          // Qiskit usually has params first, then qubits. E.g. rx(pi/2, 0)
          // To be safe for simple gates (H, X, CX), we just extract all ints.
          // For now, let's extract all discrete integer tokens.
          const qubits = [];
          const matches = argsStr.match(/\b\d+\b/g);
          if (matches) {
            for (const m of matches) {
              qubits.push(parseInt(m, 10));
            }
          }
          
          if (qubits.length > 0) {
            // Apply the gate. If it's a multi-qubit gate like CX, it takes multiple qubits (e.g., [3, 4]).
            // If it's a single-qubit gate but applied to an array (e.g. h([0, 1])), we should split it.
            // But wait, the standard canvas model expects 1 gate per call, or if CX, 2 qubits.
            // Let's check how many qubits the gate expects natively.
            const gateDef = {
              'H': 1, 'X': 1, 'Y': 1, 'Z': 1, 'S': 1, 'Sdg': 1, 'T': 1, 'Tdg': 1,
              'RX': 1, 'RY': 1, 'RZ': 1, 'U': 1, 'MEASURE': 1, 'BARRIER': 1,
              'CNOT': 2, 'CZ': 2, 'SWAP': 2, 'CCX': 3
            }[type] || 1;

            if (gateDef === 1 && qubits.length > 1) {
              // It's a single-qubit gate broadcasted to multiple qubits (e.g. h([0, 1]))
              for (const q of qubits) {
                const col = assignColumn([q], columnTracker);
                gates.push({ id: genId(), type, qubits: [q], col, params: {} });
              }
            } else {
              // It's a multi-qubit gate (like CNOT) or single qubit with 1 arg
              // Just take the first `gateDef` qubits.
              const targetQubits = qubits.slice(-gateDef);
              const col = assignColumn(targetQubits, columnTracker);
              gates.push({ id: genId(), type, qubits: targetQubits, col, params: {} });
            }
          }
        }
      }
    }
  }
  
  return { qubits: Math.max(1, qubitsCount), gates };
}
