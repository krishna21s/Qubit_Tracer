// src/utils/quantumSimulator.js
// Pure JS (no JSX). Provides parsing + snapshot simulation for small circuits.
// Supports gates: h, x, y, z, rx(theta), ry(theta), rz(theta), cx, cz.

export function parseQasmToOps(qasm) {
  const lines = qasm
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter(
      (l) =>
        l &&
        !l.startsWith("//") &&
        !/^openqasm/i.test(l) &&
        !/^include/i.test(l) &&
        !/^qreg/i.test(l) &&
        !/^creg/i.test(l)
    );

  const ops = [];
  lines.forEach((raw) => {
    const line = raw.replace(/;$/, "");
    const gateMatch = line.match(/^([a-zA-Z0-9_]+)(\(([^)]*)\))?\s+(.*)$/);
    if (!gateMatch) return;
    const name = gateMatch[1].toLowerCase();
    const paramStr = gateMatch[3];
    const rest = gateMatch[4];
    const params = paramStr
      ? paramStr.split(",").map((p) => parseFloat(p.trim()))
      : [];
    const qubitTokens = rest
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const qubits = qubitTokens
      .map((tok) => {
        const m = tok.match(/q\[(\d+)\]/i);
        return m ? parseInt(m[1], 10) : null;
      })
      .filter((q) => q !== null);

    const op = {
      index: ops.length,
      name,
      targets: [],
      controls: [],
      params,
      raw,
    };

    if (name === "cx" || name === "cz") {
      if (qubits.length === 2) {
        op.controls = [qubits[0]];
        op.targets = [qubits[1]];
      }
    } else {
      op.targets = qubits;
    }
    ops.push(op);
  });
  return ops;
}

// ---------- Complex helpers ----------
function c(re = 0, im = 0) {
  return { re, im };
}
function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}
function cMul(a, b) {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function cScale(a, s) {
  return { re: a.re * s, im: a.im * s };
}
function cConj(a) {
  return { re: a.re, im: -a.im };
}

const GATES = {
  h: () => [
    [c(1 / Math.sqrt(2), 0), c(1 / Math.sqrt(2), 0)],
    [c(1 / Math.sqrt(2), 0), c(-1 / Math.sqrt(2), 0)],
  ],
  x: () => [
    [c(0, 0), c(1, 0)],
    [c(1, 0), c(0, 0)],
  ],
  y: () => [
    [c(0, 0), c(0, -1)],
    [c(0, 1), c(0, 0)],
  ],
  z: () => [
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(-1, 0)],
  ],
  rx: (theta) => {
    const ct = Math.cos(theta / 2);
    const st = Math.sin(theta / 2);
    return [
      [c(ct, 0), c(0, -st)],
      [c(0, -st), c(ct, 0)],
    ];
  },
  ry: (theta) => {
    const ct = Math.cos(theta / 2);
    const st = Math.sin(theta / 2);
    return [
      [c(ct, 0), c(-st, 0)],
      [c(st, 0), c(ct, 0)],
    ];
  },
  rz: (theta) => {
    const a = -theta / 2;
    const b = theta / 2;
    return [
      [c(Math.cos(a), Math.sin(a)), c(0, 0)],
      [c(0, 0), c(Math.cos(b), Math.sin(b))],
    ];
  },
};

function applySingleQubitGate(state, nQubits, q, U) {
  const size = state.length;
  const bit = 1 << q;
  for (let base = 0; base < size; base++) {
    if ((base & bit) !== 0) continue;
    const i0 = base;
    const i1 = base | bit;
    const a0 = state[i0];
    const a1 = state[i1];
    const r0 = cAdd(cMul(U[0][0], a0), cMul(U[0][1], a1));
    const r1 = cAdd(cMul(U[1][0], a0), cMul(U[1][1], a1));
    state[i0] = r0;
    state[i1] = r1;
  }
}

function applyControlledZ(state, nQubits, control, target) {
  const size = state.length;
  const cMask = 1 << control;
  const tMask = 1 << target;
  for (let i = 0; i < size; i++) {
    if (i & cMask && i & tMask) {
      state[i] = cScale(state[i], -1);
    }
  }
}

function applyControlledX(state, nQubits, control, target) {
  const size = state.length;
  const cMask = 1 << control;
  const tMask = 1 << target;
  for (let i = 0; i < size; i++) {
    if (i & cMask && !(i & tMask)) {
      const j = i | tMask;
      const tmp = state[i];
      state[i] = state[j];
      state[j] = tmp;
    }
  }
}

function cloneState(state) {
  return state.map((a) => ({ re: a.re, im: a.im }));
}

export function initZeroState(nQubits) {
  const size = 1 << nQubits;
  const st = Array(size)
    .fill(0)
    .map(() => c(0, 0));
  st[0] = c(1, 0);
  return st;
}

export function simulateSnapshots(nQubits, ops) {
  const snapshots = [];
  let state = initZeroState(nQubits);
  snapshots.push(buildSnapshot(0, state, nQubits, null));

  ops.forEach((op, idx) => {
    state = cloneState(state);
    if (op.name in GATES) {
      const U = GATES[op.name](op.params?.[0]);
      op.targets.forEach((q) => applySingleQubitGate(state, nQubits, q, U));
    } else if (op.name === "cx") {
      applyControlledX(state, nQubits, op.controls[0], op.targets[0]);
    } else if (op.name === "cz") {
      applyControlledZ(state, nQubits, op.controls[0], op.targets[0]);
    }
    snapshots.push(buildSnapshot(idx + 1, state, nQubits, op));
  });

  return snapshots;
}

function buildSnapshot(step, state, nQubits, op) {
  const probs = {};
  state.forEach((amp, i) => {
    const p = amp.re * amp.re + amp.im * amp.im;
    probs[i.toString(2).padStart(nQubits, "0")] = p;
  });
  const densityMatrices = [];
  const blochVectors = [];
  for (let q = 0; q < nQubits; q++) {
    const dm = reducedDensityMatrix(state, nQubits, q);
    densityMatrices.push(dm);
    blochVectors.push(densityToBloch(dm));
  }
  // Return BOTH naming styles for robustness
  return {
    step,
    op,
    statevector: cloneState(state),
    probabilities: probs,
    densityMatrices,
    blochVectors,
    // compatibility snake_case
    density_matrices: densityMatrices,
    bloch_vectors: blochVectors,
  };
}

function reducedDensityMatrix(state, nQubits, target) {
  const dm = [
    [c(0, 0), c(0, 0)],
    [c(0, 0), c(0, 0)],
  ];
  const size = state.length;
  for (let i = 0; i < size; i++) {
    const bitI = (i >> target) & 1;
    for (let j = 0; j < size; j++) {
      const bitJ = (j >> target) & 1;
      const maskedI = i & ~(1 << target);
      const maskedJ = j & ~(1 << target);
      if (maskedI === maskedJ) {
        const a = state[i];
        const b = state[j];
        const prod = cMul(a, cConj(b));
        dm[bitI][bitJ] = cAdd(dm[bitI][bitJ], prod);
      }
    }
  }
  return dm;
}

function densityToBloch(dm) {
  const rho00 = dm[0][0];
  const rho11 = dm[1][1];
  const rho01 = dm[0][1];
  const rho10 = dm[1][0];
  const x = 2 * rho01.re;
  const y = 2 * rho10.im;
  const z = rho00.re - rho11.re;
  return [x, y, z];
}
