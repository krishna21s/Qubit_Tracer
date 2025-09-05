// Incremental QASM parsing & line diff utilities
// Focused, fast, no external deps. Supports: h,x,y,z, rx/ry/rz(param), cx c,t
import { nanoid } from "nanoid";

/**
 * Added:
 *  - Comment support: lines starting // or # are ignored (not treated as errors)
 */

const RE_SINGLE = /^(h|x|y|z)\s+q\[(\d+)\];$/i;
const RE_ROT = /^(rx|ry|rz)\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_CX = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_QREG = /^qreg\s+q\[(\d+)\];$/i;
const RE_INCLUDE = /^include\s+"qelib1\.inc";$/i;
const RE_OPENQASM = /^openqasm\s+2\.0;$/i;

function isComment(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("#");
}

export function parseGateLine(line, lineNumber, options = {}) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (isComment(trimmed)) return null;
  if (
    RE_OPENQASM.test(trimmed) ||
    RE_INCLUDE.test(trimmed) ||
    RE_QREG.test(trimmed)
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
  // Unrecognized non-header non-comment becomes parse error
  throw new Error(`Unrecognized or unsupported gate syntax`);
}

export function fullParse(lines) {
  let numQubits = 0;
  const headerLines = [];
  const gateLines = [];
  const gateObjects = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || isComment(trimmed)) return;
    if (
      RE_OPENQASM.test(trimmed) ||
      RE_INCLUDE.test(trimmed) ||
      RE_QREG.test(trimmed)
    ) {
      headerLines.push(idx);
      if (RE_QREG.test(trimmed)) {
        const m = trimmed.match(RE_QREG);
        if (m) numQubits = parseInt(m[1], 10);
      }
      return;
    }
    try {
      const g = parseGateLine(trimmed, idx);
      if (g) {
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
  }
  return { headerLines, gateLines, gateObjects, numQubits };
}

export function incrementalParse(
  prevLines,
  newLines,
  changedLineNumbers,
  existingGateByLine
) {
  const updatedGateByLine = new Map(existingGateByLine);
  const lineErrors = {};
  let qregChanged = false;
  let numQubits = null;

  for (const lineNo of changedLineNumbers) {
    const raw = (newLines[lineNo] || "").trim();
    if (!raw) {
      updatedGateByLine.delete(lineNo);
      continue;
    }
    if (isComment(raw)) {
      // treat comments as non-gate; remove any prior gate
      updatedGateByLine.delete(lineNo);
      continue;
    }
    if (RE_OPENQASM.test(raw) || RE_INCLUDE.test(raw)) {
      continue;
    }
    if (RE_QREG.test(raw)) {
      const m = raw.match(RE_QREG);
      if (m) {
        numQubits = parseInt(m[1], 10);
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
  };
}

export function buildQasmFromModel(
  headerLinesContent,
  gatesOrdered,
  numQubits
) {
  const hasOpenQasm = headerLinesContent.some((l) =>
    RE_OPENQASM.test(l.trim())
  );
  const hasInclude = headerLinesContent.some((l) => RE_INCLUDE.test(l.trim()));
  const hasQreg = headerLinesContent.some((l) => RE_QREG.test(l.trim()));

  const linesOut = [];
  if (!hasOpenQasm) linesOut.push("OPENQASM 2.0;");
  if (!hasInclude) linesOut.push('include "qelib1.inc";');
  if (!hasQreg) linesOut.push(`qreg q[${numQubits}];`);

  // Preserve extra user header lines (excluding the mandatory ones)
  headerLinesContent.forEach((l) => {
    const t = l.trim();
    if (!t) return;
    if (isComment(t)) {
      linesOut.push(l);
      return;
    }
    if (RE_OPENQASM.test(t) || RE_INCLUDE.test(t) || RE_QREG.test(t)) return;
    linesOut.push(l);
  });

  gatesOrdered.forEach((g) => {
    switch (g.type) {
      case "h":
      case "x":
      case "y":
      case "z":
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
      default:
        break;
    }
  });
  return linesOut.join("\n");
}
