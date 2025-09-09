import { nanoid } from "nanoid";

export function circuitToQASM(circuit) {
  const n = circuit.numQubits;
  let lines = ["OPENQASM 2.0;", 'include "qelib1.inc";', `qreg q[${n}];`];
  
  // Check if we need creg
  const hasMeasure = circuit.gates.some(g => g.type === "measure");
  if (hasMeasure) {
    lines.push(`creg c[${n}];`);
  }
  
  const seq = [...circuit.gates].sort((a, b) => a.column - b.column);
  seq.forEach((g) => {
    switch (g.type) {
      case "h":
      case "x":
      case "y":
      case "z":
      case "i":
        lines.push(`${g.type} q[${g.qubits[0]}];`);
        break;
      case "rx":
      case "ry":
      case "rz": {
        const theta = g.params?.theta ?? Math.PI / 2;
        lines.push(`${g.type}(${theta.toFixed(6)}) q[${g.qubits[0]}];`);
        break;
      }
      case "p": {
        const lambda = g.params?.lambda ?? 0;
        lines.push(`p(${lambda.toFixed(6)}) q[${g.qubits[0]}];`);
        break;
      }
      case "sx":
      case "sxdg":
        lines.push(`${g.type} q[${g.qubits[0]}];`);
        break;
      case "cx":
        lines.push(`cx q[${g.control}],q[${g.target}];`);
        break;
      case "cz":
        lines.push(`cz q[${g.control}],q[${g.target}];`);
        break;
      case "ccx":
        lines.push(`ccx q[${g.control1}],q[${g.control2}],q[${g.target}];`);
        break;
      case "measure":
        lines.push(`measure q[${g.qubits[0]}] -> c[${g.classicalBit}];`);
        break;
      default:
        break;
    }
  });
  return lines.join("\n");
}

export function parseQASM(qasm) {
  const lines = qasm
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  let numQubits = 0;
  const gates = [];
  lines.forEach((line) => {
    if (/^qreg\s+q\[(\d+)\];/i.test(line)) {
      const m = line.match(/^qreg\s+q\[(\d+)\];/i);
      if (m) numQubits = parseInt(m[1], 10);
      return;
    }
    
    // Skip creg lines
    if (/^creg\s+c\[(\d+)\];/i.test(line)) {
      return;
    }
    
    const rotMatch = line.match(/^(rx|ry|rz)\(([^)]+)\)\s+q\[(\d+)\];$/i);
    if (rotMatch) {
      const [, gtype, paramStr, qIdxStr] = rotMatch;
      const theta = parseFloat(paramStr);
      gates.push({
        id: nanoid(),
        type: gtype.toLowerCase(),
        qubits: [parseInt(qIdxStr, 10)],
        column: gates.length,
        params: { theta },
      });
      return;
    }
    
    const pMatch = line.match(/^p\(([^)]+)\)\s+q\[(\d+)\];$/i);
    if (pMatch) {
      const [, paramStr, qIdxStr] = pMatch;
      const lambda = parseFloat(paramStr);
      gates.push({
        id: nanoid(),
        type: "p",
        qubits: [parseInt(qIdxStr, 10)],
        column: gates.length,
        params: { lambda },
      });
      return;
    }
    
    const singleMatch = line.match(/^(h|x|y|z|i|sx|sxdg)\s+q\[(\d+)\];$/i);
    if (singleMatch) {
      const [, gtype, qIdxStr] = singleMatch;
      gates.push({
        id: nanoid(),
        type: gtype.toLowerCase(),
        qubits: [parseInt(qIdxStr, 10)],
        column: gates.length,
      });
      return;
    }
    
    const cxMatch = line.match(/^cx\s+q\[(\d+)\],q\[(\d+)\];$/i);
    if (cxMatch) {
      const [, cStr, tStr] = cxMatch;
      const control = parseInt(cStr, 10);
      const target = parseInt(tStr, 10);
      gates.push({
        id: nanoid(),
        type: "cx",
        qubits: [control, target],
        control,
        target,
        column: gates.length,
      });
      return;
    }
    
    const czMatch = line.match(/^cz\s+q\[(\d+)\],q\[(\d+)\];$/i);
    if (czMatch) {
      const [, cStr, tStr] = czMatch;
      const control = parseInt(cStr, 10);
      const target = parseInt(tStr, 10);
      gates.push({
        id: nanoid(),
        type: "cz",
        qubits: [control, target],
        control,
        target,
        column: gates.length,
      });
      return;
    }
    
    const ccxMatch = line.match(/^ccx\s+q\[(\d+)\],q\[(\d+)\],q\[(\d+)\];$/i);
    if (ccxMatch) {
      const [, c1Str, c2Str, tStr] = ccxMatch;
      const control1 = parseInt(c1Str, 10);
      const control2 = parseInt(c2Str, 10);
      const target = parseInt(tStr, 10);
      gates.push({
        id: nanoid(),
        type: "ccx",
        qubits: [control1, control2, target],
        control1,
        control2,
        target,
        column: gates.length,
      });
      return;
    }
    
    const measureMatch = line.match(/^measure\s+q\[(\d+)\](?:\s*->\s*c\[(\d+)\])?;$/i);
    if (measureMatch) {
      const [, qStr, cStr] = measureMatch;
      const qubit = parseInt(qStr, 10);
      const classicalBit = cStr ? parseInt(cStr, 10) : qubit;
      gates.push({
        id: nanoid(),
        type: "measure",
        qubits: [qubit],
        classicalBit,
        column: gates.length,
      });
      return;
    }
  });

  if (numQubits === 0) {
    const maxQ = gates.reduce((m, g) => Math.max(m, ...g.qubits), -1);
    numQubits = Math.max(1, maxQ + 1);
  }
  return { numQubits, gates };
}
