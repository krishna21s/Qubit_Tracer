/**
 * Starter code templates for Quantum Frameworks: Qiskit, Cirq, PennyLane, OpenQASM
 */

export const FRAMEWORK_INFO = {
  qiskit: {
    id: 'qiskit',
    name: 'Qiskit (Python)',
    language: 'python',
    ext: '.py',
    description: 'IBM Quantum SDK for programming superconducting circuits.'
  },
  cirq: {
    id: 'cirq',
    name: 'Google Cirq (Python)',
    language: 'python',
    ext: '.py',
    description: 'Google Quantum AI library for NISQ algorithms.'
  },
  pennylane: {
    id: 'pennylane',
    name: 'PennyLane (Python)',
    language: 'python',
    ext: '.py',
    description: 'Xanadu library for differentiable quantum computing and QML.'
  },
  openqasm: {
    id: 'openqasm',
    name: 'OpenQASM 2.0',
    language: 'c',
    ext: '.qasm',
    description: 'Open Quantum Assembly Language specification.'
  }
};

export function getStarterCode(problem, frameworkId) {
  switch (frameworkId) {
    case 'cirq':
      return `import cirq

# Write your Cirq code here
`;

    case 'pennylane':
      return `import pennylane as qml

# Write your PennyLane code here
`;

    case 'openqasm':
      return `OPENQASM 2.0;
include "qelib1.inc";

// Write your OpenQASM code here
`;

    case 'qiskit':
    default:
      return `from qiskit import QuantumCircuit

# Write your quantum circuit code here
`;
  }
}

