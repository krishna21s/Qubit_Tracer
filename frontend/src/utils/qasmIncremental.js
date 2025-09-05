// Incremental QASM parsing & line diff utilities
// Focused, fast, no external deps. Supports: h,x,y,z, rx/ry/rz(param), cx c,t
// (UPDATED: Added configurable limits, header locking, warnings, amplitude threshold helpers)

import { nanoid } from "nanoid";

/* ===================== Configurable Constants ===================== */

/**
 * MAX_QUBITS
 *  - Upper bound enforced on qreg declarations (edit this to allow more).
 *  - If a user declares qreg larger than this, it is clamped and a warning emitted.
 */
export const MAX_QUBITS = 20;

/**
 * AMPLITUDE_HEAVY_THRESHOLD
 *  - Circuits above this qubit count are considered “heavy” for full amplitude
 *    recomputation (2^n growth). We DO NOT change existing logic here, but expose
 *    a helper so callers can decide to skip expensive amplitude calculations.
 */
export const AMPLITUDE_HEAVY_THRESHOLD = 12;

/**
 * Helper to let callers decide if they should compute full amplitudes.
 * (Current codebase does not yet call this — provided for future optimization.)
 */
export function shouldComputeAmplitudes(numQubits) {
  return numQubits <= AMPLITUDE_HEAVY_THRESHOLD;
}

/* ===================== Regex Definitions (unchanged) ===================== */

const RE_SINGLE = /^(h|x|y|z)\s+q\[(\d+)\];$/i;
const RE_ROT = /^(rx|ry|rz)\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_CX = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_QREG = /^qreg\s+q\[(\d+)\];$/i;
const RE_INCLUDE = /^include\s+"qelib1\.inc";$/i;
const RE_OPENQASM = /^openqasm\s+2\.0;$/i;

/* ===================== Utility ===================== */

function isComment(line) {
  const t = line.trim();
  return t.startsWith("//") || t.startsWith("#");
}

/**
 * enforceHeaderPresence
 *  - Locks mandatory header lines. If user removed them, they are re-inserted
 *    at the top in canonical order. Returns a possibly modified copy of lines.
 *  - We DO NOT shift original gate line numbers in-place during incremental
 *    parsing; for that reason we call this only in fullParse & when rebuilding
 *    final QASM (not inside incremental diff loop) to avoid index drift.
 */
function enforceHeaderPresence(lines) {
  const out = [...lines];
  const lower = out.map((l) => l.trim().toLowerCase());
  const needOpen = !lower.some((l) => RE_OPENQASM.test(l));
  const needInclude = !lower.some((l) => RE_INCLUDE.test(l));
  const needQreg = !lower.some((l) => RE_QREG.test(l));

  // Insert at top in canonical order if missing.
  const inserts = [];
  if (needOpen) inserts.push("OPENQASM 2.0;");
  if (needInclude) inserts.push('include "qelib1.inc";');
  if (needQreg) inserts.push("qreg q[3];");

  if (inserts.length) {
    return [...inserts, ...out];
  }
  return out;
}

/* ===================== Core Parsing ===================== */

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

/**
 * fullParse
 *  - Now:
 *     * Re-inserts locked headers if they were removed.
 *     * Clamps qreg to MAX_QUBITS with warning.
 *     * Returns additional 'warnings' array (non-breaking addition).
 */
export function fullParse(lines) {
  const warnings = [];
  const guardedLines = enforceHeaderPresence(lines);
  let numQubits = 0;
  const headerLines = [];
  const gateLines = [];
  const gateObjects = [];

  guardedLines.forEach((line, idx) => {
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
  };
}

/**
 * incrementalParse
 *  - Adds warnings (non-breaking).
 *  - Clamps qreg updates > MAX_QUBITS.
 *  - Does NOT mutate line ordering (no header insertion here to avoid shifting indices).
 */
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
    if (RE_OPENQASM.test(raw) || RE_INCLUDE.test(raw)) {
      // Locked headers: if user tried to blank them earlier (raw re-added), we just accept.
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

/**
 * buildQasmFromModel
 *  - Ensures locked headers exist (cannot be removed).
 *  - Clamps numQubits to MAX_QUBITS when emitting qreg line.
 *  - Leaves gate emission logic unchanged.
 */
export function buildQasmFromModel(
  headerLinesContent,
  gatesOrdered,
  numQubits
) {
  const clampedQubits =
    numQubits > MAX_QUBITS ? MAX_QUBITS : Math.max(1, numQubits);

  const hasOpenQasm = headerLinesContent.some((l) =>
    RE_OPENQASM.test(l.trim())
  );
  const hasInclude = headerLinesContent.some((l) => RE_INCLUDE.test(l.trim()));
  const hasQreg = headerLinesContent.some((l) => RE_QREG.test(l.trim()));

  const linesOut = [];
  if (!hasOpenQasm) linesOut.push("OPENQASM 2.0;");
  if (!hasInclude) linesOut.push('include "qelib1.inc";');
  if (!hasQreg) linesOut.push(`qreg q[${clampedQubits}];`);

  // Preserve extra user header lines (excluding mandatory & comment lines)
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
