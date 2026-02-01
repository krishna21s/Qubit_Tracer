// Minimal single-qubit complex math + gates for Gate Lab

export const c = (re = 0, im = 0) => ({ re, im });
export const cAdd = (a, b) => c(a.re + b.re, a.im + b.im);
export const cMul = (a, b) => c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const cScale = (a, s) => c(a.re * s, a.im * s);
export const cConj = (a) => c(a.re, -a.im);

export const G = {
  I: () => [[c(1, 0), c(0, 0)], [c(0, 0), c(1, 0)]],
  X: () => [[c(0, 0), c(1, 0)], [c(1, 0), c(0, 0)]],
  Y: () => [[c(0, 0), c(0, -1)], [c(0, 1), c(0, 0)]],
  Z: () => [[c(1, 0), c(0, 0)], [c(0, 0), c(-1, 0)]],
  H: () => {
    const s = 1 / Math.sqrt(2);
    return [[c(s, 0), c(s, 0)], [c(s, 0), c(-s, 0)]];
  },
  S: () => [[c(1, 0), c(0, 0)], [c(0, 0), c(0, 1)]],
  SDG: () => [[c(1, 0), c(0, 0)], [c(0, 0), c(0, -1)]],
  T: () => {
    const a = Math.PI / 4;
    return [[c(1, 0), c(0, 0)], [c(0, 0), c(Math.cos(a), Math.sin(a))]];
  },
  TDG: () => {
    const a = -Math.PI / 4;
    return [[c(1, 0), c(0, 0)], [c(0, 0), c(Math.cos(a), Math.sin(a))]];
  },
  // √X gate: (1/2) * [[1+i, 1-i], [1-i, 1+i]]
  SX: () => {
    return [[c(0.5, 0.5), c(0.5, -0.5)], [c(0.5, -0.5), c(0.5, 0.5)]];
  },
  // √X† gate: (1/2) * [[1-i, 1+i], [1+i, 1-i]]
  SXDG: () => {
    return [[c(0.5, -0.5), c(0.5, 0.5)], [c(0.5, 0.5), c(0.5, -0.5)]];
  },
  RX: (theta = 0) => {
    const ct = Math.cos(theta / 2), st = Math.sin(theta / 2);
    return [[c(ct, 0), c(0, -st)], [c(0, -st), c(ct, 0)]];
  },
  RY: (theta = 0) => {
    const ct = Math.cos(theta / 2), st = Math.sin(theta / 2);
    return [[c(ct, 0), c(-st, 0)], [c(st, 0), c(ct, 0)]];
  },
  RZ: (theta = 0) => {
    const a = -theta / 2, b = theta / 2;
    return [[c(Math.cos(a), Math.sin(a)), c(0, 0)], [c(0, 0), c(Math.cos(b), Math.sin(b))]];
  }
};

export function applyUnitary(state, U) {
  const [a, b] = state;
  const r0 = cAdd(cMul(U[0][0], a), cMul(U[0][1], b));
  const r1 = cAdd(cMul(U[1][0], a), cMul(U[1][1], b));
  // normalize (guard)
  const n2 = r0.re*r0.re + r0.im*r0.im + r1.re*r1.re + r1.im*r1.im;
  const s = n2 > 0 ? 1 / Math.sqrt(n2) : 1;
  return [cScale(r0, s), cScale(r1, s)];
}

export const presets = {
  zero: () => [c(1, 0), c(0, 0)],
  one: () => [c(0, 0), c(1, 0)],
  plus: () => [c(1/Math.sqrt(2), 0), c(1/Math.sqrt(2), 0)],
  minus: () => [c(1/Math.sqrt(2), 0), c(-1/Math.sqrt(2), 0)],
  plusI: () => [c(1/Math.sqrt(2), 0), c(0, 1/Math.sqrt(2))],
  minusI: () => [c(1/Math.sqrt(2), 0), c(0, -1/Math.sqrt(2))]
};

export function stateToParams(state) {
  const [a, b] = state;
  const na = Math.hypot(a.re, a.im);
  const nb = Math.hypot(b.re, b.im);
  const theta = 2 * Math.acos(Math.min(1, Math.max(-1, na)));
  const pha = Math.atan2(a.im, a.re);
  const phb = Math.atan2(b.im, b.re);
  let phi = phb - pha;
  while (phi > Math.PI) phi -= 2*Math.PI;
  while (phi < -Math.PI) phi += 2*Math.PI;
  return { theta, phi, na, nb };
}

export function stateToProb(state) {
  const [a, b] = state;
  const p0 = a.re*a.re + a.im*a.im;
  const p1 = b.re*b.re + b.im*b.im;
  return { p0, p1 };
}

export function formatPi(angle) {
  const pi = Math.PI;
  const eps = 1e-3;
  const k = Math.round(angle / pi);
  if (Math.abs(angle - k * pi) < eps) return k === 1 ? 'π' : `${k}π`;
  const k2 = Math.round((angle / pi) * 2);
  if (Math.abs(angle - (k2 * pi) / 2) < eps) return k2 === 1 ? 'π/2' : `${k2}π/2`;
  const k4 = Math.round((angle / pi) * 4);
  if (Math.abs(angle - (k4 * pi) / 4) < eps) return k4 === 1 ? 'π/4' : `${k4}π/4`;
  return angle.toFixed(2);
}