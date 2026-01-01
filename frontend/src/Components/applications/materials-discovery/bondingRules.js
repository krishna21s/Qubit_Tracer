import { COVALENT_RADII, TYPICAL_BONDS, VALENCE_ELECTRONS } from "./chemistryData";

// Distance-based bond detection
export function canBond(symbol1, symbol2, distance) {
  const r1 = COVALENT_RADII[symbol1] || 1.0;
  const r2 = COVALENT_RADII[symbol2] || 1.0;
  const bondThreshold = (r1 + r2) * 1.25; // 25% tolerance
  return distance <= bondThreshold && distance > 0.3;
}

// Calculate ideal bond length between two atoms
export function getBondLength(symbol1, symbol2) {
  const r1 = COVALENT_RADII[symbol1] || 0.8;
  const r2 = COVALENT_RADII[symbol2] || 0.8;
  return r1 + r2;
}

// Determine bond order based on atoms and context
export function estimateBondOrder(symbol1, symbol2) {
  // Simple heuristics for common double/triple bonds
  if ((symbol1 === "C" && symbol2 === "O") || (symbol1 === "O" && symbol2 === "C")) return 2; // C=O
  if ((symbol1 === "C" && symbol2 === "C")) return 1.5; // aromatic or single (average)
  if ((symbol1 === "N" && symbol2 === "N")) return 3; // N≡N
  return 1; // default single bond
}

// Get typical coordination number for an element
export function getTypicalBonds(symbol) {
  return TYPICAL_BONDS[symbol] || 1;
}

// Check if atom can accept more bonds
export function canAcceptBond(symbol, currentBonds) {
  const typical = getTypicalBonds(symbol);
  return currentBonds < typical;
}

// Build connectivity graph from atom list
export function buildBondGraph(atoms) {
  const bonds = [];
  const bondCounts = new Map();
  
  atoms.forEach((a) => bondCounts.set(a.id, 0));

  // Simple greedy bonding: connect nearby atoms respecting valence
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a1 = atoms[i];
      const a2 = atoms[j];
      const dx = a1.x - a2.x;
      const dy = a1.y - a2.y;
      const dz = a1.z - a2.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (canBond(a1.symbol, a2.symbol, dist)) {
        const b1 = bondCounts.get(a1.id);
        const b2 = bondCounts.get(a2.id);
        if (canAcceptBond(a1.symbol, b1) && canAcceptBond(a2.symbol, b2)) {
          bonds.push({ from: a1.id, to: a2.id, length: dist, order: estimateBondOrder(a1.symbol, a2.symbol) });
          bondCounts.set(a1.id, b1 + 1);
          bondCounts.set(a2.id, b2 + 1);
        }
      }
    }
  }
  return bonds;
}

// Detect hybridization from coordination and geometry
export function detectHybridization(bondCount, lonePairs) {
  const total = bondCount + lonePairs;
  if (total === 2) return "sp";
  if (total === 3) return "sp²";
  if (total === 4) return "sp³";
  if (total === 5) return "sp³d";
  if (total === 6) return "sp³d²";
  return "unknown";
}

// Estimate lone pairs from valence electrons
export function estimateLonePairs(symbol, bondCount) {
  const valence = VALENCE_ELECTRONS[symbol] || 0;
  const bondedElectrons = bondCount * 2; // assume single bonds
  const remaining = valence - bondedElectrons;
  return Math.max(0, Math.floor(remaining / 2));
}
