// Incremental QASM parsing & line diff utilities
// Now supports: id,h,x,y,z,s,sdg,t,tdg,sx,sxdg, rx/ry/rz(param), cx, cz, ccx, measure
import { nanoid } from "nanoid";

export const MAX_QUBITS = 20;
export const AMPLITUDE_HEAVY_THRESHOLD = 12;
export function shouldComputeAmplitudes(numQubits) {
  return numQubits <= AMPLITUDE_HEAVY_THRESHOLD;
}

const RE_SINGLE = /^(id|h|x|y|z|s|sdg|t|tdg|sx|sxdg)\s+q\[(\d+)\];$/i;
const RE_ROT = /^(rx|ry|rz)\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_CX = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_CZ = /^cz\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_CCX = /^ccx\s+q\[(\d+)\],\s*q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_MEAS1 = /^measure\s+q\[(\d+)\];$/i;
const RE_MEAS2 = /^measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\];$/i;

const RE_QREG = /^qreg\s+q\[(\d+)\];$/i;
const RE_CREG = /^creg\s+c\[(\d+)\];$/i;
const RE_INCLUDE = /^include\s+"qelib1\.inc";$/i;
const RE_OPENQASM = /^openqasm\s+2\.0;$/i;

function isComment(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("#");
}

function enforceHeaderPresence(lines) {
  const out = [...lines];
  const lower = out.map((l) => l.trim().toLowerCase());
  const needOpen = !lower.some((l) => RE_OPENQASM.test(l));
  const needInclude = !lower.some((l) => RE_INCLUDE.test(l));
  const needQreg = !lower.some((l) => RE_QREG.test(l));
  const inserts = [];
  if (needOpen) inserts.push("OPENQASM 2.0;");
  if (needInclude) inserts.push('include "qelib1.inc";');
  if (needQreg) inserts.push("qreg q[3];");
  if (inserts.length) return [...inserts, ...out];
  return out;
}

export function parseGateLine(line, lineNumber) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (isComment(trimmed)) return null;
  if (
    RE_OPENQASM.test(trimmed) ||
    RE_INCLUDE.test(trimmed) ||
    RE_QREG.test(trimmed) ||
    RE_CREG.test(trimmed)
  ) {
    return null;
  }
  let m;
  if ((m = trimmed.match(RE_SINGLE))) {
    const [, t, qStr] = m;
    return {
      id: nanoid(),
      type: t.toLowerCase(),
      qubits: [parseInt(qStr, 10)],
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_ROT))) {
    const [, t, thetaStr, qStr] = m;
    const theta = parseFloat(thetaStr);
    return {
      id: nanoid(),
      type: t.toLowerCase(),
      qubits: [parseInt(qStr, 10)],
      params: { theta },
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_CX))) {
    const [, cStr, tStr] = m;
    const control = parseInt(cStr, 10);
    const target = parseInt(tStr, 10);
    return {
      id: nanoid(),
      type: "cx",
      qubits: [control, target],
      control,
      target,
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_CZ))) {
    const [, cStr, tStr] = m;
    const control = parseInt(cStr, 10);
    const target = parseInt(tStr, 10);
    return {
      id: nanoid(),
      type: "cz",
      qubits: [control, target],
      control,
      target,
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_CCX))) {
    const [, c1, c2, t] = m;
    const c1n = parseInt(c1, 10),
      c2n = parseInt(c2, 10),
      tn = parseInt(t, 10);
    return {
      id: nanoid(),
      type: "ccx",
      qubits: [c1n, c2n, tn],
      controls: [c1n, c2n],
      target: tn,
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_MEAS2))) {
    const [, qStr, cStr] = m;
    return {
      id: nanoid(),
      type: "measure",
      qubits: [parseInt(qStr, 10)],
      params: { cbit: parseInt(cStr, 10) },
      column: null,
      sourceLine: lineNumber,
    };
  }
  if ((m = trimmed.match(RE_MEAS1))) {
    const [, qStr] = m;
    return {
      id: nanoid(),
      type: "measure",
      qubits: [parseInt(qStr, 10)],
      column: null,
      sourceLine: lineNumber,
    };
  }
  throw new Error(`Unrecognized or unsupported gate syntax`);
}

export function fullParse(lines) {
  const warnings = [];
  const guardedLines = enforceHeaderPresence(lines);
  let numQubits = 0;
  const headerLines = [];
  const gateLines = [];
  const gateObjects = [];
  let hasMeasure = false;

  guardedLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || isComment(trimmed)) return;
    if (
      RE_OPENQASM.test(trimmed) ||
      RE_INCLUDE.test(trimmed) ||
      RE_QREG.test(trimmed) ||
      RE_CREG.test(trimmed)
    ) {
      headerLines.push(idx);
      if (RE_QREG.test(trimmed)) {
        const m = trimmed.match(RE_QREG);
        if (m) {
          let declared = parseInt(m[1], 10);
          if (declared > MAX_QUBITS) {
            warnings.push(
              `qreg size ${declared} exceeds MAX_QUBITS=${MAX_QUBITS}; clamped.`
            );
            declared = MAX_QUBITS;
          }
          numQubits = declared;
        }
      }
      return;
    }
    try {
      const g = parseGateLine(trimmed, idx);
      if (g) {
        if (g.type === "measure") hasMeasure = true;
        gateLines.push(idx);
        gateObjects.push(g);
      }
    } catch (err) {
      throw Object.assign(err, { lineNumber: idx });
    }
  });

  if (numQubits === 0) {
    let maxQ = -1;
    gateObjects.forEach((g) =>
      g.qubits.forEach((q) => {
        if (q > maxQ) maxQ = q;
      })
    );
    numQubits = Math.max(1, maxQ + 1);
    if (numQubits > MAX_QUBITS) {
      warnings.push(
        `Inferred qubit count ${numQubits} exceeds MAX_QUBITS=${MAX_QUBITS}; clamped.`
      );
      numQubits = MAX_QUBITS;
    }
  }

  return {
    headerLines,
    gateLines,
    gateObjects,
    numQubits,
    warnings,
    amplitudeSafe: shouldComputeAmplitudes(numQubits),
    hasMeasure,
  };
}

export function incrementalParse(
  prevLines,
  newLines,
  changedLineNumbers,
  existingGateByLine
) {
  const updatedGateByLine = new Map(existingGateByLine);
  const lineErrors = {};
  const warnings = [];
  let qregChanged = false;
  let numQubits = null;

  for (const lineNo of changedLineNumbers) {
    const raw = (newLines[lineNo] || "").trim();
    if (!raw) {
      updatedGateByLine.delete(lineNo);
      continue;
    }
    if (isComment(raw)) {
      updatedGateByLine.delete(lineNo);
      continue;
    }
    if (RE_OPENQASM.test(raw) || RE_INCLUDE.test(raw) || RE_CREG.test(raw)) {
      continue;
    }
    if (RE_QREG.test(raw)) {
      const m = raw.match(RE_QREG);
      if (m) {
        let declared = parseInt(m[1], 10);
        if (declared > MAX_QUBITS) {
          warnings.push(
            `qreg size ${declared} exceeds MAX_QUBITS=${MAX_QUBITS}; clamped.`
          );
          declared = MAX_QUBITS;
        }
        numQubits = declared;
        qregChanged = true;
      }
      continue;
    }
    try {
      const g = parseGateLine(raw, lineNo);
      if (g) {
        const prevGate = existingGateByLine.get(lineNo);
        if (prevGate) {
          g.id = prevGate.id;
          g.column = prevGate.column;
        }
        updatedGateByLine.set(lineNo, g);
        delete lineErrors[lineNo];
      } else {
        updatedGateByLine.delete(lineNo);
      }
    } catch (err) {
      lineErrors[lineNo] = err.message;
    }
  }

  return {
    updatedGateByLine,
    lineErrors,
    numQubitsMaybe: qregChanged ? numQubits : null,
    warnings,
    amplitudeSafe:
      qregChanged && numQubits != null
        ? shouldComputeAmplitudes(numQubits)
        : undefined,
  };
}

export function buildQasmFromModel(
  headerLinesContent,
  gatesOrdered,
  numQubits
) {
  const clampedQubits =
    numQubits > MAX_QUBITS ? MAX_QUBITS : Math.max(1, numQubits);
  let existingCregCount = null;
  const headerExtras = [];

  headerLinesContent.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (isComment(trimmed)) {
      headerExtras.push(line);
      return;
    }
    if (RE_CREG.test(trimmed)) {
      const match = trimmed.match(RE_CREG);
      if (match) {
        existingCregCount = parseInt(match[1], 10);
        if (!Number.isFinite(existingCregCount) || existingCregCount <= 0) {
          existingCregCount = null;
        }
      }
      return;
    }
    if (
      RE_OPENQASM.test(trimmed) ||
      RE_INCLUDE.test(trimmed) ||
      RE_QREG.test(trimmed)
    ) {
      return;
    }
    headerExtras.push(line);
  });

  const linesOut = [
    "OPENQASM 2.0;",
    'include "qelib1.inc";',
    `qreg q[${clampedQubits}];`
  ];

  let cregInserted = false;
  if (existingCregCount != null) {
    const adjusted = Math.max(1, Math.min(MAX_QUBITS, existingCregCount));
    linesOut.push(`creg c[${adjusted}];`);
    cregInserted = true;
  }

  headerExtras.forEach((line) => linesOut.push(line));

  let needsCreg = false;

  gatesOrdered.forEach((g) => {
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
        linesOut.push(`${g.type} q[${g.qubits[0]}];`);
        break;
      case "rx":
      case "ry":
      case "rz":
        linesOut.push(
          `${g.type}(${(g.params?.theta ?? Math.PI / 2).toFixed(6)}) q[${
            g.qubits[0]
          }];`
        );
        break;
      case "cx":
        linesOut.push(`cx q[${g.control}],q[${g.target}];`);
        break;
      case "cz":
        linesOut.push(`cz q[${g.control}],q[${g.target}];`);
        break;
      case "ccx": {
        const [c1, c2] = g.controls || g.qubits;
        linesOut.push(`ccx q[${c1}],q[${c2}],q[${g.target}];`);
        break;
      }
      case "measure":
        needsCreg = true;
        if (g.params && typeof g.params.cbit === "number") {
          linesOut.push(`measure q[${g.qubits[0]}] -> c[${g.params.cbit}];`);
        } else {
          linesOut.push(`measure q[${g.qubits[0]}] -> c[${g.qubits[0]}];`);
        }
        break;
      default:
        break;
    }
  });

  if (needsCreg && !cregInserted) {
    const qregIdx = linesOut.findIndex((l) => RE_QREG.test(l.trim()));
    const insertion = `creg c[${clampedQubits}];`;
    if (qregIdx >= 0)
      linesOut.splice(qregIdx + 1, 0, insertion);
    else linesOut.unshift(insertion);
  }

  return linesOut.join("\n");
}
