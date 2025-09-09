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

const RE_SINGLE = /^(h|x|y|z|i)\s+q\[(\d+)\];$/i;
const RE_ROT = /^(rx|ry|rz)\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_P_GATE = /^p\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i;
const RE_SX = /^sx\s+q\[(\d+)\];$/i;
const RE_SXDG = /^sxdg\s+q\[(\d+)\];$/i;
const RE_CX = /^cx\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_CZ = /^cz\s+q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_CCX = /^ccx\s+q\[(\d+)\],\s*q\[(\d+)\],\s*q\[(\d+)\];$/i;
const RE_MEASURE = /^measure\s+q\[(\d+)\](?:\s*->\s*c\[(\d+)\])?;$/i;
const RE_QREG = /^qreg\s+q\[(\d+)\];$/i;
const RE_CREG = /^creg\s+c\[(\d+)\];$/i;
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
  
  // Check if we need creg (if any measure gates exist)
  const hasMeasure = lower.some((l) => RE_MEASURE.test(l));
  const needCreg = hasMeasure && !lower.some((l) => RE_CREG.test(l));

  // Insert at top in canonical order if missing.
  const inserts = [];
  if (needOpen) inserts.push("OPENQASM 2.0;");
  if (needInclude) inserts.push('include "qelib1.inc";');
  if (needQreg) inserts.push("qreg q[3];");
  if (needCreg) {
    // Find the qreg size to match creg size
    const qregLine = out.find(l => RE_QREG.test(l.trim()));
    const qregMatch = qregLine ? qregLine.match(RE_QREG) : null;
    const qregSize = qregMatch ? qregMatch[1] : "3";
    inserts.push(`creg c[${qregSize}];`);
  }

  if (inserts.length) {
    return [...inserts, ...out];
  }
  return out;
}

/* ===================== Core Parsing ===================== */

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
  
  // Handle single-qubit gates (including identity 'i')
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
  
  // Handle rotation gates
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
  
  // Handle P gate (phase gate)
  if ((m = trimmed.match(RE_P_GATE))) {
    const [, lambdaStr, qStr] = m;
    const lambda = parseFloat(lambdaStr);
    return {
      id: nanoid(),
      type: "p",
      qubits: [parseInt(qStr, 10)],
      params: { lambda },
      column: null,
      sourceLine: lineNumber,
    };
  }
  
  // Handle SX gate
  if ((m = trimmed.match(RE_SX))) {
    const [, qStr] = m;
    return {
      id: nanoid(),
      type: "sx",
      qubits: [parseInt(qStr, 10)],
      column: null,
      sourceLine: lineNumber,
    };
  }
  
  // Handle SXDG gate
  if ((m = trimmed.match(RE_SXDG))) {
    const [, qStr] = m;
    return {
      id: nanoid(),
      type: "sxdg",
      qubits: [parseInt(qStr, 10)],
      column: null,
      sourceLine: lineNumber,
    };
  }
  
  // Handle CX gate
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
  
  // Handle CZ gate
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
  
  // Handle CCX (Toffoli) gate
  if ((m = trimmed.match(RE_CCX))) {
    const [, c1Str, c2Str, tStr] = m;
    const control1 = parseInt(c1Str, 10);
    const control2 = parseInt(c2Str, 10);
    const target = parseInt(tStr, 10);
    return {
      id: nanoid(),
      type: "ccx",
      qubits: [control1, control2, target],
      control1,
      control2,
      target,
      column: null,
      sourceLine: lineNumber,
    };
  }
  
  // Handle measure gate
  if ((m = trimmed.match(RE_MEASURE))) {
    const [, qStr, cStr] = m;
    const qubit = parseInt(qStr, 10);
    const classicalBit = cStr ? parseInt(cStr, 10) : qubit;
    return {
      id: nanoid(),
      type: "measure",
      qubits: [qubit],
      classicalBit,
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
    if (RE_OPENQASM.test(raw) || RE_INCLUDE.test(raw) || RE_CREG.test(raw)) {
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
  
  // Check if we need creg (if any measure gates exist)
  const hasMeasure = gatesOrdered.some((g) => g.type === "measure");
  const hasCreg = headerLinesContent.some((l) => RE_CREG.test(l.trim()));

  const linesOut = [];
  if (!hasOpenQasm) linesOut.push("OPENQASM 2.0;");
  if (!hasInclude) linesOut.push('include "qelib1.inc";');
  if (!hasQreg) linesOut.push(`qreg q[${clampedQubits}];`);
  if (hasMeasure && !hasCreg) linesOut.push(`creg c[${clampedQubits}];`);

  // Preserve extra user header lines (excluding mandatory & comment lines)
  headerLinesContent.forEach((l) => {
    const t = l.trim();
    if (!t) return;
    if (isComment(t)) {
      linesOut.push(l);
      return;
    }
    if (RE_OPENQASM.test(t) || RE_INCLUDE.test(t) || RE_QREG.test(t) || RE_CREG.test(t)) return;
    linesOut.push(l);
  });

  gatesOrdered.forEach((g) => {
    switch (g.type) {
      case "h":
      case "x":
      case "y":
      case "z":
      case "i":
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
      case "p":
        linesOut.push(
          `p(${(g.params?.lambda ?? 0).toFixed(6)}) q[${g.qubits[0]}];`
        );
        break;
      case "sx":
      case "sxdg":
        linesOut.push(`${g.type} q[${g.qubits[0]}];`);
        break;
      case "cx":
        linesOut.push(`cx q[${g.control}],q[${g.target}];`);
        break;
      case "cz":
        linesOut.push(`cz q[${g.control}],q[${g.target}];`);
        break;
      case "ccx":
        linesOut.push(`ccx q[${g.control1}],q[${g.control2}],q[${g.target}];`);
        break;
      case "measure":
        linesOut.push(`measure q[${g.qubits[0]}] -> c[${g.classicalBit}];`);
        break;
      default:
        break;
    }
  });
  return linesOut.join("\n");
}

/**
 * normalizeToQASM2
 * - Converts non-QASM2 gates to QASM2/qelib1.inc equivalents for backend compatibility
 * - Ensures proper headers and creg for measure gates
 * - Returns normalized QASM string
 */
export function normalizeToQASM2(qasm) {
  if (!qasm || !qasm.trim()) return qasm;
  
  const lines = qasm.split(/\r?\n/);
  const normalizedLines = [];
  let hasCreg = false;
  let qregSize = 3; // default
  
  // First pass: identify headers and qreg size
  lines.forEach(line => {
    const trimmed = line.trim();
    if (RE_QREG.test(trimmed)) {
      const m = trimmed.match(RE_QREG);
      if (m) qregSize = parseInt(m[1], 10);
    }
    if (RE_CREG.test(trimmed)) {
      hasCreg = true;
    }
  });
  
  // Check if we need creg by scanning for measure gates
  const needsCreg = lines.some(line => RE_MEASURE.test(line.trim())) && !hasCreg;
  
  // Process each line
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Keep headers as-is, but ensure we have creg if needed
    if (RE_OPENQASM.test(trimmed) || RE_INCLUDE.test(trimmed) || RE_QREG.test(trimmed)) {
      normalizedLines.push(line);
      // Add creg after qreg if needed
      if (RE_QREG.test(trimmed) && needsCreg) {
        normalizedLines.push(`creg c[${qregSize}];`);
      }
      return;
    }
    
    if (RE_CREG.test(trimmed)) {
      normalizedLines.push(line);
      return;
    }
    
    // Skip empty lines and comments
    if (!trimmed || isComment(trimmed)) {
      normalizedLines.push(line);
      return;
    }
    
    // Normalize gate lines
    let normalized = trimmed;
    
    // i q[k]; → id q[k];
    normalized = normalized.replace(/^i\s+q\[(\d+)\];$/i, 'id q[$1];');
    
    // p(λ) q[k]; → u1(λ) q[k];
    normalized = normalized.replace(/^p\(([-+]?[\d.]+(?:e[-+]?\d+)?)\)\s+q\[(\d+)\];$/i, 'u1($1) q[$2];');
    
    // sx q[k]; → u3(pi/2, -pi/2, pi/2) q[k];
    normalized = normalized.replace(/^sx\s+q\[(\d+)\];$/i, 'u3(1.5707963267948966,-1.5707963267948966,1.5707963267948966) q[$1];');
    
    // sxdg q[k]; → u3(pi/2, pi/2, -pi/2) q[k];
    normalized = normalized.replace(/^sxdg\s+q\[(\d+)\];$/i, 'u3(1.5707963267948966,1.5707963267948966,-1.5707963267948966) q[$1];');
    
    // Fix measure syntax: measure q[i]; → measure q[i] -> c[i];
    normalized = normalized.replace(/^measure\s+q\[(\d+)\];$/i, 'measure q[$1] -> c[$1];');
    
    normalizedLines.push(line.replace(trimmed, normalized));
  });
  
  // Ensure we have all required headers at the start if they're missing
  let result = normalizedLines.join('\n');
  const hasOpenQasm = normalizedLines.some(l => RE_OPENQASM.test(l.trim()));
  const hasInclude = normalizedLines.some(l => RE_INCLUDE.test(l.trim()));
  const hasQreg = normalizedLines.some(l => RE_QREG.test(l.trim()));
  
  const requiredHeaders = [];
  if (!hasOpenQasm) requiredHeaders.push('OPENQASM 2.0;');
  if (!hasInclude) requiredHeaders.push('include "qelib1.inc";');
  if (!hasQreg) requiredHeaders.push(`qreg q[${qregSize}];`);
  if (needsCreg && !hasCreg) requiredHeaders.push(`creg c[${qregSize}];`);
  
  if (requiredHeaders.length > 0) {
    result = requiredHeaders.join('\n') + '\n' + result;
  }
  
  return result;
}
