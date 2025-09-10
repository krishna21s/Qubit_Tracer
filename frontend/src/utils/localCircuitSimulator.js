// Lightweight client-side quantum simulator for small circuits (<= 6 qubits)
// Supports: id,h,x,y,z,s,sdg,t,tdg,sx,sxdg, rx,ry,rz, cx, cz, ccx
// Measurement is ignored in preview (backend handles collapse)
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
function cPhase(angle) {
  return c(Math.cos(angle), Math.sin(angle));
}

const GATES = {
  id: () => [
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(1, 0)],
  ],
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
  s: () => [
    // phase = pi/2
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(0, 1)], // e^{iπ/2} = i
  ],
  sdg: () => [
    // -pi/2
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(0, -1)],
  ],
  t: () => [
    // pi/4
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))],
  ],
  tdg: () => [
    // -pi/4
    [c(1, 0), c(0, 0)],
    [c(0, 0), c(Math.cos(-Math.PI / 4), Math.sin(-Math.PI / 4))],
  ],
  sx: () => {
    // u3(pi/2,-pi/2,pi/2)
    const theta = Math.PI / 2,
      phi = -Math.PI / 2,
      lam = Math.PI / 2;
    return U3(theta, phi, lam);
  },
  sxdg: () => {
    // u3(pi/2,pi/2,-pi/2)
    const theta = Math.PI / 2,
      phi = Math.PI / 2,
      lam = -Math.PI / 2;
    return U3(theta, phi, lam);
  },
  rx: (theta = Math.PI / 2) => {
    const ct = Math.cos(theta / 2);
    const st = Math.sin(theta / 2);
    return [
      [c(ct, 0), c(0, -st)],
      [c(0, -st), c(ct, 0)],
    ];
  },
  ry: (theta = Math.PI / 2) => {
    const ct = Math.cos(theta / 2);
    const st = Math.sin(theta / 2);
    return [
      [c(ct, 0), c(-st, 0)],
      [c(st, 0), c(ct, 0)],
    ];
  },
  rz: (theta = Math.PI / 2) => {
    const a = -theta / 2;
    const b = theta / 2;
    return [
      [c(Math.cos(a), Math.sin(a)), c(0, 0)],
      [c(0, 0), c(Math.cos(b), Math.sin(b))],
    ];
  },
};

function U3(theta = 0, phi = 0, lambda = 0) {
  const ct = Math.cos(theta / 2);
  const st = Math.sin(theta / 2);
  const eiphi = cPhase(phi);
  const eilam = cPhase(lambda);
  const eiphilam = cPhase(phi + lambda);
  return [
    [c(ct, 0), cMul(c(0, -st), eilam)],
    [cMul(c(st, 0), eiphi), cMul(c(ct, 0), eiphilam)],
  ];
}

function initZeroState(n) {
  const size = 1 << n;
  const st = Array(size)
    .fill(0)
    .map(() => c(0, 0));
  st[0] = c(1, 0);
  return st;
}

function applySingle(state, nQ, q, U) {
  const bit = 1 << q;
  for (let base = 0; base < state.length; base++) {
    if (base & bit) continue;
    const i0 = base;
    const i1 = base | bit;
    const a0 = state[i0];
    const a1 = state[i1];
    state[i0] = cAdd(cMul(U[0][0], a0), cMul(U[0][1], a1));
    state[i1] = cAdd(cMul(U[1][0], a0), cMul(U[1][1], a1));
  }
}

function applyCX(state, nQ, control, target) {
  const cMask = 1 << control;
  const tMask = 1 << target;
  for (let i = 0; i < state.length; i++) {
    if (i & cMask && !(i & tMask)) {
      const j = i | tMask;
      const tmp = state[i];
      state[i] = state[j];
      state[j] = tmp;
    }
  }
}

function applyCZ(state, nQ, control, target) {
  const cMask = 1 << control;
  const tMask = 1 << target;
  for (let i = 0; i < state.length; i++) {
    if (i & cMask && i & tMask) {
      state[i] = cScale(state[i], -1);
    }
  }
}

function applyCCX(state, nQ, c1, c2, target) {
  const c1Mask = 1 << c1;
  const c2Mask = 1 << c2;
  const tMask = 1 << target;
  for (let i = 0; i < state.length; i++) {
    if (i & c1Mask && i & c2Mask && !(i & tMask)) {
      const j = i | tMask;
      const tmp = state[i];
      state[i] = state[j];
      state[j] = tmp;
    }
  }
}

function reducedDM(state, nQ, target) {
  const dm = [
    [c(0, 0), c(0, 0)],
    [c(0, 0), c(0, 0)],
  ];
  const size = state.length;
  for (let i = 0; i < size; i++) {
    const bitI = (i >> target) & 1;
    for (let j = 0; j < size; j++) {
      const bitJ = (j >> target) & 1;
      if ((i & ~(1 << target)) === (j & ~(1 << target))) {
        const prod = cMul(state[i], cConj(state[j]));
        dm[bitI][bitJ] = cAdd(dm[bitI][bitJ], prod);
      }
    }
  }
  return dm;
}

function dmToBloch(dm) {
  const rho00 = dm[0][0];
  const rho11 = dm[1][1];
  const rho01 = dm[0][1];
  const rho10 = dm[1][0];
  const x = 2 * rho01.re;
  const y = 2 * rho10.im;
  const z = rho00.re - rho11.re;
  return [x, y, z];
}

export function simulateCircuit(circuit) {
  const nQ = circuit.numQubits;
  const state = initZeroState(nQ);

  const seq = [...circuit.gates].sort((a, b) => a.column - b.column);
  seq.forEach((g) => {
    if (g.type === "cx") {
      applyCX(state, nQ, g.control, g.target);
    } else if (g.type === "cz") {
      applyCZ(state, nQ, g.control, g.target);
    } else if (g.type === "ccx") {
      const [c1, c2] = g.controls || g.qubits;
      applyCCX(state, nQ, c1, c2, g.target);
    } else if (g.type in GATES) {
      const param = g.params?.theta;
      const U = param != null ? GATES[g.type](param) : GATES[g.type]();
      applySingle(state, nQ, g.qubits[0], U);
    } else if (g.type === "measure") {
      // ignore in preview
    }
  });

  const blochVectors = [];
  for (let q = 0; q < nQ; q++) {
    const dm = reducedDM(state, nQ, q);
    blochVectors.push(dmToBloch(dm));
  }

  const amplitudes = {};
  state.forEach((amp, idx) => {
    const label = idx.toString(2).padStart(nQ, "0");
    const prob = amp.re * amp.re + amp.im * amp.im;
    amplitudes[label] = { re: amp.re, im: amp.im, prob };
  });

  return { statevector: state, blochVectors, amplitudes };
}
