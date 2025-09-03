// Incremental QASM parsing & line diff utilities
// Focused, fast, no external deps. Supports: h,x,y,z, rx/ry/rz(param), cx c,t
import { nanoid } from "nanoid";

/**
 * Gate line regex patterns
 */
const RE_SINGLE = /^(h|x|y|z)\s+q\[(\d+)\];$/i;
const RE_ROT = /^(rx|ry|rz)\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_CX = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_QREG = /^qreg\s+q\[(\d+)\];$/i;
const RE_INCLUDE = /^include\s+"qelib1\.inc";$/i;
const RE_OPENQASM = /^openqasm\s+2\.0;$/i;

/**
 * Parse a single gate line (returns gate object or throws)
 * @param {string} line
 * @param {number} lineNumber (0-based)
 * @param {object} options
 */
export function parseGateLine(line, lineNumber, options = {}) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (
    RE_OPENQASM.test(trimmed) ||
    RE_INCLUDE.test(trimmed) ||
    RE_QREG.test(trimmed)
  ) {
    // headers handled elsewhere
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
  throw new Error(`Unrecognized or unsupported gate syntax`);
}

/**
 * Fully parse QASM lines → { headerLines, gateLines, gateObjects, numQubits }
 */
export function fullParse(lines) {
  let numQubits = 0;
  const headerLines = [];
  const gateLines = []; // indices of lines belonging to gates
  const gateObjects = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
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
      // skip or record error outside
      throw Object.assign(err, { lineNumber: idx });
    }
  });

  if (numQubits === 0) {
    // infer
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

/**
 * Incrementally re-parse modified lines.
 * @param {string[]} prevLines
 * @param {string[]} newLines
 * @param {Set<number>} changedLineNumbers
 * @param {Map<number,object>} existingGateByLine (line->gate)
 * @returns {Object} { updatedGateByLine, lineErrors, numQubitsMaybe }
 */
export function incrementalParse(
  prevLines,
  newLines,
  changedLineNumbers,
  existingGateByLine
) {
  const updatedGateByLine = new Map(existingGateByLine); // copy
  const lineErrors = {};
  let qregChanged = false;
  let numQubits = null;

  for (const lineNo of changedLineNumbers) {
    const raw = (newLines[lineNo] || "").trim();
    // If blank: remove any gate
    if (!raw) {
      updatedGateByLine.delete(lineNo);
      continue;
    }
    if (RE_OPENQASM.test(raw) || RE_INCLUDE.test(raw)) {
      // ignore (header)
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
    // This is (maybe) a gate line
    try {
      const g = parseGateLine(raw, lineNo);
      if (g) {
        // preserve existing id & column if same semantic slot (line) previously had a gate
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
      // do not delete existing gate if parse fails; user is mid-edit
    }
  }
  return {
    updatedGateByLine,
    lineErrors,
    numQubitsMaybe: qregChanged ? numQubits : null,
  };
}

/**
 * Build canonical QASM text from headers + gate ordering by column.
 * We accept:
 *  - headerLinesContent: string[] (the raw header lines the user currently has)
 *  - gatesOrdered: gates sorted by column ascending
 */
export function buildQasmFromModel(
  headerLinesContent,
  gatesOrdered,
  numQubits
) {
  // ensure we have mandatory lines
  const hasOpenQasm = headerLinesContent.some((l) =>
    RE_OPENQASM.test(l.trim())
  );
  const hasInclude = headerLinesContent.some((l) => RE_INCLUDE.test(l.trim()));
  const hasQreg = headerLinesContent.some((l) => RE_QREG.test(l.trim()));

  const linesOut = [];
  if (!hasOpenQasm) linesOut.push("OPENQASM 2.0;");
  if (!hasInclude) linesOut.push('include "qelib1.inc";');
  if (!hasQreg) linesOut.push(`qreg q[${numQubits}];`);
  // preserve user header lines (append after canonical to keep them visible)
  headerLinesContent.forEach((l) => {
    const t = l.trim();
    if (!t) return;
    if (RE_OPENQASM.test(t) || RE_INCLUDE.test(t) || RE_QREG.test(t)) return; // already added
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
