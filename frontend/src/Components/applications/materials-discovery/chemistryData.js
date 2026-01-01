// Extended atomic properties for scientific molecular visualization
// All measurements in Angstroms (Å) and g/mol

export const CPK_COLORS = {
  H: "#FFFFFF", He: "#D9FFFF", Li: "#CC80FF", Be: "#C2FF00", B: "#FFB5B5", C: "#909090", N: "#3050F8", O: "#FF0D0D",
  F: "#90E050", Ne: "#B3E3F5", Na: "#AB5CF2", Mg: "#8AFF00", Al: "#BFA6A6", Si: "#F0C8A0", P: "#FF8000", S: "#FFFF30",
  Cl: "#1FF01F", Ar: "#80D1E3", K: "#8F40D4", Ca: "#3DFF00", Sc: "#E6E6E6", Ti: "#BFC2C7", V: "#A6A6AB", Cr: "#8A99C7",
  Mn: "#9C7AC7", Fe: "#E06633", Co: "#F090A0", Ni: "#50D050", Cu: "#C88033", Zn: "#7D80B0", Ga: "#C28F8F", Ge: "#668F8F",
  As: "#BD80E3", Se: "#FFA100", Br: "#A62929", Kr: "#5CB8D1", Rb: "#702EB0", Sr: "#00FF00", Y: "#94FFFF", Zr: "#94E0E0",
  Nb: "#73C2C9", Mo: "#54B5B5", Tc: "#3B9E9E", Ru: "#248F8F", Rh: "#0A7D8C", Pd: "#006985", Ag: "#C0C0C0", Cd: "#FFD98F",
  In: "#A67573", Sn: "#668080", Sb: "#9E63B5", Te: "#D47A00", I: "#940094", Xe: "#429EB0", Cs: "#57178F", Ba: "#00C900",
  La: "#70D4FF", Ce: "#FFFFC7", Pr: "#D9FFC7", Nd: "#C7FFC7", Pm: "#A3FFC7", Sm: "#8FFFC7", Eu: "#61FFC7", Gd: "#45FFC7",
  Tb: "#30FFC7", Dy: "#1FFFC7", Ho: "#00FF9C", Er: "#00E675", Tm: "#00D452", Yb: "#00BF38", Lu: "#00AB24", Hf: "#4DC2FF",
  Ta: "#4DA6FF", W: "#2194D6", Re: "#267DAB", Os: "#266696", Ir: "#175487", Pt: "#D0D0E0", Au: "#FFD123", Hg: "#B8B8D0",
  Tl: "#A6544D", Pb: "#575961", Bi: "#9E4FB5", Po: "#AB5C00", At: "#754F45", Rn: "#428296", Fr: "#420066", Ra: "#007D00",
  Ac: "#70ABFA", Th: "#00BAFF", Pa: "#00A1FF", U: "#008FFF", Np: "#0080FF", Pu: "#006BFF", Am: "#545CF2", Cm: "#785CE3",
  Bk: "#8A4FE3", Cf: "#A136D4", Es: "#B31FD4", Fm: "#B31FBA", Md: "#B30DA6", No: "#BD0D87", Lr: "#C70066"
};

export const COVALENT_RADII = {
  H: 0.31, He: 0.28, Li: 1.28, Be: 0.96, B: 0.84, C: 0.76, N: 0.71, O: 0.66, F: 0.57, Ne: 0.58,
  Na: 1.66, Mg: 1.41, Al: 1.21, Si: 1.11, P: 1.07, S: 1.05, Cl: 1.02, Ar: 1.06, K: 2.03, Ca: 1.76,
  Sc: 1.70, Ti: 1.60, V: 1.53, Cr: 1.39, Mn: 1.39, Fe: 1.32, Co: 1.26, Ni: 1.24, Cu: 1.32, Zn: 1.22,
  Ga: 1.22, Ge: 1.20, As: 1.19, Se: 1.20, Br: 1.20, Kr: 1.16, Rb: 2.20, Sr: 1.95, Y: 1.90, Zr: 1.75,
  Nb: 1.64, Mo: 1.54, Tc: 1.47, Ru: 1.46, Rh: 1.42, Pd: 1.39, Ag: 1.45, Cd: 1.44, In: 1.42, Sn: 1.39,
  Sb: 1.39, Te: 1.38, I: 1.39, Xe: 1.40, Cs: 2.44, Ba: 2.15, La: 2.07, Ce: 2.04, Pr: 2.03, Nd: 2.01,
  Pm: 1.99, Sm: 1.98, Eu: 1.98, Gd: 1.96, Tb: 1.94, Dy: 1.92, Ho: 1.92, Er: 1.89, Tm: 1.90, Yb: 1.87,
  Lu: 1.87, Hf: 1.75, Ta: 1.70, W: 1.62, Re: 1.51, Os: 1.44, Ir: 1.41, Pt: 1.36, Au: 1.36, Hg: 1.32,
  Tl: 1.45, Pb: 1.46, Bi: 1.48, Po: 1.40, At: 1.50, Rn: 1.50, Fr: 2.60, Ra: 2.21, Ac: 2.15, Th: 2.06,
  Pa: 2.00, U: 1.96, Np: 1.90, Pu: 1.87, Am: 1.80, Cm: 1.69
};

export const VAN_DER_WAALS_RADII = {
  H: 1.20, He: 1.40, Li: 1.82, Be: 1.53, B: 1.92, C: 1.70, N: 1.55, O: 1.52, F: 1.47, Ne: 1.54,
  Na: 2.27, Mg: 1.73, Al: 1.84, Si: 2.10, P: 1.80, S: 1.80, Cl: 1.75, Ar: 1.88, K: 2.75, Ca: 2.31,
  Sc: 2.11, Ti: 1.87, V: 1.79, Cr: 1.89, Mn: 1.97, Fe: 1.94, Co: 1.92, Ni: 1.63, Cu: 1.40, Zn: 1.39,
  Ga: 1.87, Ge: 2.11, As: 1.85, Se: 1.90, Br: 1.85, Kr: 2.02, Rb: 3.03, Sr: 2.49, Y: 2.32, Zr: 2.23,
  Nb: 2.18, Mo: 2.17, Tc: 2.16, Ru: 2.13, Rh: 2.10, Pd: 2.10, Ag: 1.72, Cd: 1.58, In: 1.93, Sn: 2.17,
  Sb: 2.06, Te: 2.06, I: 1.98, Xe: 2.16, Cs: 3.43, Ba: 2.68, Au: 1.66, Hg: 1.55, Pb: 2.02
};

export const ELECTRONEGATIVITY = {
  H: 2.20, He: 0, Li: 0.98, Be: 1.57, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Ne: 0,
  Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, Ar: 0, K: 0.82, Ca: 1.00,
  Sc: 1.36, Ti: 1.54, V: 1.63, Cr: 1.66, Mn: 1.55, Fe: 1.83, Co: 1.88, Ni: 1.91, Cu: 1.90, Zn: 1.65,
  Ga: 1.81, Ge: 2.01, As: 2.18, Se: 2.55, Br: 2.96, Kr: 3.00, Rb: 0.82, Sr: 0.95, Y: 1.22, Zr: 1.33,
  Nb: 1.60, Mo: 2.16, Tc: 1.90, Ru: 2.20, Rh: 2.28, Pd: 2.20, Ag: 1.93, Cd: 1.69, In: 1.78, Sn: 1.96,
  Sb: 2.05, Te: 2.10, I: 2.66, Xe: 2.60, Cs: 0.79, Ba: 0.89, La: 1.10, Au: 2.54, Hg: 2.00, Tl: 1.62,
  Pb: 2.33, Bi: 2.02, Po: 2.00, At: 2.20
};

export const VALENCE_ELECTRONS = {
  H: 1, He: 2, Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
  Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8, K: 1, Ca: 2,
  Sc: 2, Ti: 2, V: 2, Cr: 1, Mn: 2, Fe: 2, Co: 2, Ni: 2, Cu: 1, Zn: 2,
  Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8, Rb: 1, Sr: 2, Y: 2, Zr: 2,
  Nb: 1, Mo: 1, Tc: 2, Ru: 1, Rh: 1, Pd: 0, Ag: 1, Cd: 2, In: 3, Sn: 4,
  Sb: 5, Te: 6, I: 7, Xe: 8, Cs: 1, Ba: 2, La: 2, Au: 1, Hg: 2, Tl: 3,
  Pb: 4, Bi: 5, Po: 6, At: 7
};

export const TYPICAL_BONDS = {
  H: 1, C: 4, N: 3, O: 2, F: 1, P: 3, S: 2, Cl: 1, Br: 1, I: 1,
  Na: 1, Mg: 2, Al: 3, Si: 4, K: 1, Ca: 2, Fe: 2, Cu: 2, Zn: 2, Ag: 1
};

export const ATOMIC_MASSES = {
  H: 1.008, He: 4.003, Li: 6.941, Be: 9.012, B: 10.81, C: 12.01, N: 14.01, O: 16.00, F: 19.00, Ne: 20.18,
  Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, P: 30.97, S: 32.07, Cl: 35.45, Ar: 39.95, K: 39.10, Ca: 40.08,
  Sc: 44.96, Ti: 47.87, V: 50.94, Cr: 52.00, Mn: 54.94, Fe: 55.85, Co: 58.93, Ni: 58.69, Cu: 63.55, Zn: 65.38,
  Ga: 69.72, Ge: 72.63, As: 74.92, Se: 78.97, Br: 79.90, Kr: 83.80, Rb: 85.47, Sr: 87.62, Y: 88.91, Zr: 91.22,
  Nb: 92.91, Mo: 95.95, Tc: 98.00, Ru: 101.1, Rh: 102.9, Pd: 106.4, Ag: 107.9, Cd: 112.4, In: 114.8, Sn: 118.7,
  Sb: 121.8, Te: 127.6, I: 126.9, Xe: 131.3, Cs: 132.9, Ba: 137.3, La: 138.9, Au: 197.0, Hg: 200.6, Tl: 204.4,
  Pb: 207.2, Bi: 209.0, Po: 209.0, At: 210.0
};
