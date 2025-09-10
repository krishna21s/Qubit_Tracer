import { nanoid } from "nanoid";

export function circuitToQASM(circuit) {
  const n = circuit.numQubits;
  let lines = ["OPENQASM 2.0;", 'include "qelib1.inc";', `qreg q[${n}];`];

  const hasMeasure = circuit.gates.some((g) => g.type === "measure");
  if (hasMeasure) lines.push(`creg c[${n}];`);

  const seq = [...circuit.gates].sort((a, b) => a.column - b.column);
  seq.forEach((g) => {
    switch (g.type) {
      case "id":
      case "h":
      case "x":
      case "y":
      case "z":
      case "s":
      case "sdg":
      case "t":
      case "tdg":
      case "sx":
      case "sxdg":
        lines.push(`${g.type} q[${g.qubits[0]}];`);
        break;
      case "rx":
      case "ry":
      case "rz": {
        const theta = g.params?.theta ?? Math.PI / 2;
        lines.push(`${g.type}(${theta.toFixed(6)}) q[${g.qubits[0]}];`);
        break;
      }
      case "cx":
        lines.push(`cx q[${g.control}],q[${g.target}];`);
        break;
      case "cz":
        lines.push(`cz q[${g.control}],q[${g.target}];`);
        break;
      case "ccx": {
        const [c1, c2] = g.controls || g.qubits;
        lines.push(`ccx q[${c1}],q[${c2}],q[${g.target}];`);
        break;
      }
      case "measure":
        lines.push(`measure q[${g.qubits[0]}] -> c[${g.qubits[0]}];`);
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
    const singleMatch = line.match(
      /^(id|h|x|y|z|s|sdg|t|tdg|sx|sxdg)\s+q\[(\d+)\];$/i
    );
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
      const [, c1, c2, t] = ccxMatch;
      const c1n = parseInt(c1, 10),
        c2n = parseInt(c2, 10),
        tn = parseInt(t, 10);
      gates.push({
        id: nanoid(),
        type: "ccx",
        qubits: [c1n, c2n, tn],
        controls: [c1n, c2n],
        target: tn,
        column: gates.length,
      });
      return;
    }
    const measMatch = line.match(/^measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\];$/i);
    if (measMatch) {
      const [, qStr, cStr] = measMatch;
      gates.push({
        id: nanoid(),
        type: "measure",
        qubits: [parseInt(qStr, 10)],
        column: gates.length,
        params: { cbit: parseInt(cStr, 10) },
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
