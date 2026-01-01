import { getBondLength, estimateLonePairs, detectHybridization, buildBondGraph } from "./bondingRules";

const VALENCE_PRIORITY = {
  H: 1,
  B: 3,
  C: 4,
  N: 5,
  O: 6,
  F: 7,
  P: 5,
  S: 6,
  Cl: 7,
};

// VSEPR Geometry templates with ideal angles
const VSEPR_GEOMETRIES = {
  2: { name: "Linear", angles: [180], shape: "linear" },
  3: { name: "Trigonal Planar", angles: [120, 120, 120], shape: "trigonal" },
  4: { name: "Tetrahedral", angles: [109.5, 109.5, 109.5, 109.5], shape: "tetrahedral" },
  5: { name: "Trigonal Bipyramidal", angles: [120, 90, 90], shape: "tbp" },
  6: { name: "Octahedral", angles: [90, 90, 90, 90, 90, 90], shape: "octahedral" },
};

// Adjust for lone pairs (e.g., H2O bent instead of tetrahedral)
function adjustForLonePairs(bondCount, lonePairs) {
  const total = bondCount + lonePairs;
  if (total === 4 && lonePairs === 2) return { name: "Bent", angles: [104.5], shape: "bent" }; // H2O
  if (total === 4 && lonePairs === 1) return { name: "Trigonal Pyramidal", angles: [107], shape: "pyramid" }; // NH3
  return VSEPR_GEOMETRIES[bondCount] || { name: "Unknown", angles: [90], shape: "unknown" };
}

// Generate 3D coordinates using VSEPR geometry
export function generateMolecularStructure(selectedElements, ratios) {
  if (!selectedElements.length) return { atoms: [], bonds: [], geometry: "None", molecularWeight: 0 };

  const counts = countsFromRatios(selectedElements, ratios);

  // Build atom list from stoichiometric counts (e.g., CO => 1C + 1O)
  const atoms = [];
  let atomId = 0;
  selectedElements.forEach((el) => {
    const count = Math.max(1, counts[el.symbol] || 1);
    for (let i = 0; i < count; i++) {
      atoms.push({
        id: atomId++,
        symbol: el.symbol,
        name: el.name,
        category: el.category,
        x: 0,
        y: 0,
        z: 0,
        hybridization: "sp³",
      });
    }
  });

  // Simple case: single atom
  if (atoms.length === 1) {
    return {
      atoms: [{ ...atoms[0], x: 0, y: 0, z: 0 }],
      bonds: [],
      geometry: "Atomic",
      molecularWeight: calculateMolecularWeight(atoms),
      polarity: "Nonpolar",
    };
  }

  // Two atoms: linear
  if (atoms.length === 2) {
    const a = atoms[0].symbol;
    const b = atoms[1].symbol;

    // CO diatomic (approx triple bond)
    if ((a === "C" && b === "O") || (a === "O" && b === "C")) {
      const bondLen = 1.13;
      atoms[0].x = -bondLen / 2;
      atoms[1].x = bondLen / 2;
      const bonds = [{ from: 0, to: 1, length: bondLen, order: 3 }];
      return {
        atoms,
        bonds,
        geometry: "Linear",
        molecularWeight: calculateMolecularWeight(atoms),
        polarity: computePolarity(atoms, bonds),
      };
    }

    const bondLen = getBondLength(atoms[0].symbol, atoms[1].symbol);
    atoms[0].x = -bondLen / 2;
    atoms[1].x = bondLen / 2;
    const bonds = [{ from: 0, to: 1, length: bondLen, order: 1 }];
    return {
      atoms,
      bonds,
      geometry: "Linear",
      molecularWeight: calculateMolecularWeight(atoms),
      polarity: computePolarity(atoms, bonds),
    };
  }

  // Three atoms: bent or trigonal planar
  if (atoms.length === 3) {
    return buildTriatomic(atoms);
  }

  // Four atoms: tetrahedral (e.g., CH4) or bent (e.g., H2O with 2H + 2 lone pairs)
  if (atoms.length === 4) {
    return buildTetrahedral(atoms);
  }

  // Complex molecules: use distance geometry + force relaxation
  return buildComplexMolecule(atoms);
}

function buildTriatomic(atoms) {
  const ordered = placeCentralFirst(atoms);
  const central = ordered[0];
  const bond1 = getBondLength(central.symbol, ordered[1].symbol);
  const bond2 = getBondLength(central.symbol, ordered[2].symbol);

  // Check if bent (like H2O) or linear (like CO2)
  const lonePairs = estimateLonePairs(central.symbol, 2);
  const geom = adjustForLonePairs(2, lonePairs);
  const angle = geom.angles[0] || 120;

  central.x = 0;
  central.y = 0;
  central.z = 0;
  central.hybridization = detectHybridization(2, lonePairs);

  ordered[1].x = bond1;
  ordered[1].y = 0;
  ordered[1].z = 0;

  const rad = (angle * Math.PI) / 180;
  ordered[2].x = bond2 * Math.cos(rad);
  ordered[2].y = bond2 * Math.sin(rad);
  ordered[2].z = 0;

  const bonds = [
    { from: 0, to: 1, length: bond1, order: 1 },
    { from: 0, to: 2, length: bond2, order: 1 },
  ];

  return {
    atoms: ordered,
    bonds,
    geometry: geom.name,
    molecularWeight: calculateMolecularWeight(ordered),
    polarity: computePolarity(ordered, bonds),
  };
}

function buildTetrahedral(atoms) {
  // Tetrahedral coordinates (e.g., CH4)
  const ordered = placeCentralFirst(atoms);
  const central = ordered[0];
  const bondLen = getBondLength(central.symbol, ordered[1].symbol);

  central.x = 0;
  central.y = 0;
  central.z = 0;
  central.hybridization = "sp³";

  // Tetrahedral vertices
  const angle = (109.5 * Math.PI) / 180;
  ordered[1].x = bondLen;
  ordered[1].y = 0;
  ordered[1].z = 0;

  ordered[2].x = bondLen * Math.cos(angle);
  ordered[2].y = bondLen * Math.sin(angle);
  ordered[2].z = 0;

  ordered[3].x = bondLen * Math.cos(angle);
  ordered[3].y = bondLen * Math.sin(angle) * Math.cos((120 * Math.PI) / 180);
  ordered[3].z = bondLen * Math.sin(angle) * Math.sin((120 * Math.PI) / 180);

  const bonds = [
    { from: 0, to: 1, length: bondLen, order: 1 },
    { from: 0, to: 2, length: bondLen, order: 1 },
    { from: 0, to: 3, length: bondLen, order: 1 },
  ];

  return {
    atoms: ordered,
    bonds,
    geometry: "Tetrahedral",
    molecularWeight: calculateMolecularWeight(ordered),
    polarity: computePolarity(ordered, bonds),
  };
}

function buildComplexMolecule(atoms) {
  // For complex molecules: use Fibonacci sphere + simple spring relaxation
  const golden = Math.PI * (3 - Math.sqrt(5));
  atoms.forEach((atom, i) => {
    const y = 1 - (i / (atoms.length - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    atom.x = Math.cos(theta) * radius * 2.5;
    atom.y = y * 2.0;
    atom.z = Math.sin(theta) * radius * 2.5;
    atom.hybridization = "sp³";
  });

  // Simple force relaxation (50 steps)
  for (let iter = 0; iter < 50; iter++) {
    atoms.forEach((a1, i) => {
      let fx = 0,
        fy = 0,
        fz = 0;
      atoms.forEach((a2, j) => {
        if (i === j) return;
        const dx = a1.x - a2.x;
        const dy = a1.y - a2.y;
        const dz = a1.z - a2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const ideal = getBondLength(a1.symbol, a2.symbol);
        const force = (dist - ideal) * 0.05;
        fx -= (dx / dist) * force;
        fy -= (dy / dist) * force;
        fz -= (dz / dist) * force;
      });
      a1.x += fx;
      a1.y += fy;
      a1.z += fz;
    });
  }

  // Build bonds with valence-aware graph (avoids dense webs)
  const bonds = buildBondGraph(atoms).map((b) => ({ ...b, length: b.length || getBondLength(atoms[b.from].symbol, atoms[b.to].symbol) }));

  // Classify geometry based on structure
  let geometryName = "Polyhedral (relaxed)";
  if (atoms.length === 5) geometryName = "Trigonal Bipyramidal (relaxed)";
  if (atoms.length === 6) geometryName = "Octahedral (relaxed)";

  return {
    atoms,
    bonds,
    geometry: geometryName,
    molecularWeight: calculateMolecularWeight(atoms),
    polarity: computePolarity(atoms, bonds),
  };
}

function countsFromRatios(selectedElements, ratios) {
  const symbols = selectedElements.map((e) => e.symbol);
  const raw = symbols.map((s) => {
    const v = ratios?.[s];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 1;
  });

  const allInt = raw.every((v) => Math.abs(v - Math.round(v)) < 1e-6);
  let ints;
  if (allInt) {
    ints = raw.map((v) => Math.max(1, Math.round(v)));
  } else {
    let bestM = 1;
    for (let m = 1; m <= 10; m++) {
      const ok = raw.every((v) => Math.abs(v * m - Math.round(v * m)) < 0.05);
      if (ok) {
        bestM = m;
        break;
      }
    }
    ints = raw.map((v) => Math.max(1, Math.round(v * bestM)));
  }

  const gcd = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) {
      const t = x % y;
      x = y;
      y = t;
    }
    return x || 1;
  };
  let g = ints[0] || 1;
  for (let i = 1; i < ints.length; i++) g = gcd(g, ints[i]);
  ints = ints.map((v) => Math.max(1, Math.round(v / g)));

  const total = ints.reduce((s, v) => s + v, 0);
  if (total > 12) {
    const scale = total / 12;
    ints = ints.map((v) => Math.max(1, Math.round(v / scale)));
  }

  return Object.fromEntries(symbols.map((s, i) => [s, ints[i] || 1]));
}

function placeCentralFirst(atoms) {
  if (atoms.length <= 1) return atoms;
  let bestIdx = 0;
  let bestScore = -1;
  atoms.forEach((a, i) => {
    const isHydrogen = a.symbol === "H";
    const score = (VALENCE_PRIORITY[a.symbol] || 1) + (isHydrogen ? -2 : 0);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  if (bestIdx === 0) return atoms;
  const ordered = [atoms[bestIdx], ...atoms.slice(0, bestIdx), ...atoms.slice(bestIdx + 1)];
  // Reassign ids to remain sequential for bonding
  return ordered.map((a, idx) => ({ ...a, id: idx }));
}

function calculateMolecularWeight(atoms) {
  const masses = {
    H: 1.008, C: 12.01, N: 14.01, O: 16.00, F: 19.00, P: 30.97, S: 32.07, Cl: 35.45,
    Br: 79.90, I: 126.9, Na: 22.99, Mg: 24.31, Al: 26.98, Si: 28.09, K: 39.10, Ca: 40.08,
    Fe: 55.85, Cu: 63.55, Zn: 65.38, Ag: 107.9, Au: 197.0,
  };
  return atoms.reduce((sum, a) => sum + (masses[a.symbol] || 12), 0);
}

function computePolarity(atoms, bonds) {
  if (atoms.length === 1) return "Nonpolar";
  
  // Check electronegativity differences
  const eneg = { H: 2.2, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Cl: 3.16, S: 2.58, P: 2.19, Na: 0.93, Mg: 1.31, Fe: 1.83, Cu: 1.90, Ag: 1.93 };
  let hasPolarBond = false;
  
  bonds.forEach(bond => {
    const a1 = atoms[bond.from];
    const a2 = atoms[bond.to];
    const e1 = eneg[a1.symbol] || 2.0;
    const e2 = eneg[a2.symbol] || 2.0;
    if (Math.abs(e1 - e2) > 0.5) hasPolarBond = true;
  });
  
  if (!hasPolarBond) return "Nonpolar";
  
  // Check symmetry: if symmetric arrangement, net dipole = 0
  if (atoms.length === 2) return "Polar";
  if (atoms.length === 3) return "Polar"; // bent or asymmetric
  if (atoms.length === 4) {
    // Tetrahedral symmetric = nonpolar
    const symbols = atoms.map(a => a.symbol).sort();
    const allSame = symbols.slice(1).every(s => s === symbols[1]);
    return allSame ? "Nonpolar" : "Polar";
  }
  
  return "Polar";
}

// Calculate bond angles for annotation
export function calculateBondAngles(atoms, bonds) {
  const angles = [];
  bonds.forEach((bond1, i) => {
    bonds.forEach((bond2, j) => {
      if (i >= j) return;
      // Find common atom
      let common, a1, a2;
      if (bond1.from === bond2.from) {
        common = bond1.from;
        a1 = bond1.to;
        a2 = bond2.to;
      } else if (bond1.from === bond2.to) {
        common = bond1.from;
        a1 = bond1.to;
        a2 = bond2.from;
      } else if (bond1.to === bond2.from) {
        common = bond1.to;
        a1 = bond1.from;
        a2 = bond2.to;
      } else if (bond1.to === bond2.to) {
        common = bond1.to;
        a1 = bond1.from;
        a2 = bond2.from;
      } else return;

      const ac = atoms[common];
      const aa1 = atoms[a1];
      const aa2 = atoms[a2];

      const v1 = { x: aa1.x - ac.x, y: aa1.y - ac.y, z: aa1.z - ac.z };
      const v2 = { x: aa2.x - ac.x, y: aa2.y - ac.y, z: aa2.z - ac.z };

      const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
      const mag1 = Math.sqrt(v1.x ** 2 + v1.y ** 2 + v1.z ** 2);
      const mag2 = Math.sqrt(v2.x ** 2 + v2.y ** 2 + v2.z ** 2);
      const angle = Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);

      angles.push({ atom1: a1, center: common, atom2: a2, angle: angle.toFixed(1) });
    });
  });
  return angles;
}
