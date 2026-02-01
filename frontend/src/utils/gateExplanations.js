export function explainGate(op) {
  if (!op)
    return {
      title: "Initial State",
      text: "All qubits start in |0⟩ with full probability in |0...0⟩.",
    };
  const { name, targets = [], controls = [], params = [] } = op;
  const qList = targets.map((q) => `q[${q}]`).join(", ");
  switch (name) {
    case "id":
      return {
        title: `Identity on ${qList}`,
        text: `No operation. Leaves qubit unchanged. Used for timing or as placeholder.`,
      };
    case "h":
      return {
        title: `Hadamard on ${qList}`,
        text: `Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2 (if starting from |0⟩). Places vector on the equator.`,
      };
    case "sx":
      return {
        title: `√X on ${qList}`,
        text: `Square root of X gate. Rotates state halfway to X gate result. Two √X gates = X gate.`,
      };
    case "sxdg":
      return {
        title: `√X† on ${qList}`,
        text: `Conjugate of square root X. Inverse of √X gate. √X followed by √X† = Identity.`,
      };
    case "x":
      return {
        title: `X on ${qList}`,
        text: `Bit-flip (NOT). Rotates 180° about X-axis.`,
      };
    case "y":
      return {
        title: `Y on ${qList}`,
        text: `Bit & phase flip. 180° rotation about Y-axis.`,
      };
    case "z":
      return {
        title: `Z on ${qList}`,
        text: `Phase flip: adds a -1 phase to |1⟩, rotation about Z-axis.`,
      };
    case "rx":
      return {
        title: `RX(θ) on ${qList}`,
        text: `Rotation about X by θ=${(params[0] ?? 0).toFixed(4)} rad.`,
      };
    case "ry":
      return {
        title: `RY(θ) on ${qList}`,
        text: `Rotation about Y by θ=${(params[0] ?? 0).toFixed(4)} rad.`,
      };
    case "rz":
      return {
        title: `RZ(θ) on ${qList}`,
        text: `Rotation about Z by θ=${(params[0] ?? 0).toFixed(
          4
        )} rad (phase change).`,
      };
    case "s":
      return {
        title: `S on ${qList}`,
        text: `Phase gate: adds a π/2 phase to |1⟩ (rotation about Z by +90°). Keeps amplitudes' magnitudes but twists phase.`,
      };
    case "sdg":
      return {
        title: `S† on ${qList}`,
        text: `Inverse phase gate: removes a π/2 phase from |1⟩ (rotation about Z by −90°). Undo of the S gate.`,
      };
    case "t":
      return {
        title: `T on ${qList}`,
        text: `π/4 phase gate: multiplies |1⟩ by e^{iπ/4}. Fine-grained Z-axis rotation used in Clifford+T circuits.`,
      };
    case "tdg":
      return {
        title: `T† on ${qList}`,
        text: `Inverse T: rotation about Z by −π/4 (removes the e^{iπ/4} phase on |1⟩).`,
      };
    case "u3":
      return {
        title: `U3(θ,φ,λ) on ${qList}`,
        text: `General single-qubit rotation with three Euler angles: θ=${(
          params[0] ?? 0
        ).toFixed(4)}, φ=${(params[1] ?? 0).toFixed(4)}, λ=${(
          params[2] ?? 0
        ).toFixed(4)}.`,
      };
    case "cx":
      return {
        title: `CX control q[${controls[0]}] → target q[${targets[0]}]`,
        text: `If control is |1⟩ flips target. Creates entanglement when control is in superposition.`,
      };
    case "cz":
      return {
        title: `CZ control q[${controls[0]}] ↔ q[${targets[0]}]`,
        text: `Applies a phase of π to |11⟩, entangling via phase correlation.`,
      };
    case "ccx":
      return {
        title: `CCX (Toffoli) c1=q[${controls[0]}], c2=q[${controls[1]}] → t=q[${targets[0]}]`,
        text: `Two controls must be |1⟩ to flip the target. Universal for reversible classical logic; entangling.`,
      };
    case "measure":
      return {
        title: `Measure ${qList}`,
        text: `Projective measurement on ${qList}. State collapses to |0⟩ or |1⟩ for this qubit based on Born rule probabilities. Results are reproducible (seeded random).`,
      };
    default:
      return { title: name.toUpperCase(), text: "Explanation not yet added." };
  }
}
