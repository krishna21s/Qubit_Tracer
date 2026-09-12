// YouTube video tutorials curated for each Quantum Algorithm in AlgoHub
// Uses official Qiskit / IBM Quantum / verified quantum education videos

export const algoVideoData = {
  "single-qubit-gates": {
    videoId: "7HMd_mcW1ng",
    title: "Single Qubit Quantum Gates & Superposition",
    channel: "IBM Quantum / Qiskit",
    duration: "12 min",
    description: "Learn how single-qubit gates like Pauli-X, Hadamard (H), and Phase (Z) rotate quantum statevectors on the Bloch Sphere to create superposition.",
    highlights: ["Superposition fundamentals", "Bloch sphere rotations", "State measurement & collapse"]
  },

  "bell-state": {
    videoId: "a00QtgHriss",
    title: "Quantum Entanglement & Bell State Preparation",
    channel: "IBM Quantum",
    duration: "10 min",
    description: "Understand Einstein's 'spooky action at a distance' and learn how to entangle two qubits into maximally correlated Bell states using Hadamard and CNOT gates.",
    highlights: ["Entangled pairs", "CNOT gate logic", "Correlation without communication"]
  },

  "ghz-state": {
    videoId: "D0HVY-RUeZM",
    title: "Greenberger-Horne-Zeilinger (GHZ) Multi-Qubit Entanglement",
    channel: "Qiskit Community",
    duration: "15 min",
    description: "Deep dive into 3+ qubit entanglement. Discover how GHZ states test quantum non-locality and serve as benchmarks for quantum hardware.",
    highlights: ["3-qubit superposition", "Local realism refutation", "Quantum communication networks"]
  },

  "quantum-teleportation": {
    videoId: "P5cGeDKOIP0",
    title: "Quantum Teleportation Protocol — Coding with Qiskit",
    channel: "Coding with Qiskit",
    duration: "16 min",
    description: "Complete walkthrough of the quantum teleportation circuit. Transfer an unknown quantum state using a shared entangled Bell pair and classical transmission.",
    highlights: ["Alice & Bob circuit", "Bell basis measurement", "Classical feed-forward correction"]
  },

  "deutsch-jozsa": {
    videoId: "aPCZcv-5qfA",
    title: "Deutsch-Jozsa Algorithm — Quantum Parallelism",
    channel: "Coding with Qiskit",
    duration: "14 min",
    description: "See the first algorithm to demonstrate a deterministic exponential quantum advantage over classical computation using phase kickback and Hadamard transforms.",
    highlights: ["Constant vs Balanced functions", "Phase kickback mechanism", "Single-query evaluation"]
  },

  "qft-3qubit": {
    videoId: "mAHC1dWKNYE",
    title: "Quantum Fourier Transform (QFT) Architecture",
    channel: "Qiskit",
    duration: "18 min",
    description: "The quantum equivalent of the discrete Fourier transform. Learn how controlled phase rotations map amplitude states to quantum phase registers.",
    highlights: ["Phase rotations Rk", "Reversible Fourier transform", "Core engine for Shor's & QPE"]
  },

  "grovers-search": {
    videoId: "0RPFWZj7Jm0",
    title: "Grover's Algorithm — Coding with Qiskit",
    channel: "Qiskit",
    duration: "18 min",
    description: "Learn how quantum amplitude amplification solves unstructured database search in O(√N) queries instead of classical O(N) using oracle reflections and diffusers.",
    highlights: ["Oracle phase flip", "Diffuser / inversion about mean", "Optimal iteration counting"]
  },

  "shor-simplified": {
    videoId: "EdJ7RoWcU48",
    title: "Shor's Algorithm — Coding with Qiskit",
    channel: "Qiskit",
    duration: "20 min",
    description: "Understand the revolutionary algorithm that factors integers in polynomial time by reducing prime factorization to quantum order / period finding with the QFT.",
    highlights: ["Modular exponentiation", "Order/period finding", "Continued fractions extraction"]
  },

  "vqe-h2": {
    videoId: "ePr2MgQkqL0",
    title: "Variational Quantum Eigensolver (VQE) for Molecules",
    channel: "Coding with Qiskit",
    duration: "17 min",
    description: "How NISQ-era hybrid quantum-classical algorithms compute the ground state energy of hydrogen (H2) and molecular Hamiltonians.",
    highlights: ["Parameterized ansatz circuits", "Expectation value measurement", "Classical optimizer loop"]
  },

  "qec-bit-flip": {
    videoId: "VPqNTb1X0MU",
    title: "Quantum Error Correction: 3-Qubit Bit-Flip Code",
    channel: "Qiskit",
    duration: "15 min",
    description: "Protect delicate quantum data against environmental noise using redundant entangled encoding and syndrome extraction without collapsing the logical state.",
    highlights: ["Logical vs physical qubits", "Syndrome measurement ancillas", "Majority voting correction"]
  }
};

/**
 * Get video tutorial data for an algorithm ID.
 * Returns default metadata if id is not found.
 */
export function getAlgoVideoData(algoId, algoName = "Quantum Algorithm") {
  if (algoVideoData[algoId]) {
    return algoVideoData[algoId];
  }
  // Fallback to single qubit gates if not explicitly found
  return {
    videoId: "7HMd_mcW1ng",
    title: `${algoName} Tutorial`,
    channel: "IBM Quantum / Qiskit",
    duration: "12 min",
    description: `Explore interactive quantum tutorials and circuit implementations for ${algoName}.`,
    highlights: ["Circuit building", "State evolution", "Result verification"]
  };
}
