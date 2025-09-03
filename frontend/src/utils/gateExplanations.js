export function explainGate(op) {
  if (!op)
    return {
      title: "Initial State",
      text: "All qubits start in |0⟩ with full probability in |0...0⟩.",
    };
  const { name, targets, controls, params } = op;
  const qList = targets.map((q) => `q[${q}]`).join(", ");
  switch (name) {
    case "h":
      return {
        title: `Hadamard on ${qList}`,
        text: `Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2 (if starting from |0⟩). Places vector on the equator.`,
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
        text: `Rotation about X by θ=${params[0].toFixed(4)} rad.`,
      };
    case "ry":
      return {
        title: `RY(θ) on ${qList}`,
        text: `Rotation about Y by θ=${params[0].toFixed(4)} rad.`,
      };
    case "rz":
      return {
        title: `RZ(θ) on ${qList}`,
        text: `Rotation about Z by θ=${params[0].toFixed(
          4
        )} rad (phase change).`,
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
    default:
      return { title: name.toUpperCase(), text: "Explanation not yet added." };
  }
}
