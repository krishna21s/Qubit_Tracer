// Quantum Frameworks definitions for AlgoHub
// Supports OpenQASM 3.0, Qiskit, PennyLane, and Cirq

export const FRAMEWORKS = {
  openqasm: {
    id: "openqasm",
    name: "OpenQASM",
    tag: "Open Standard",
    badgeColor: "#E84393",
    accentColor: "#FF6BB5",
    version: "3.0",
    description: "Open Quantum Assembly Language — the hardware-agnostic standard for describing gate-level quantum circuits, supported by IBM, AWS, and IonQ.",
    libraries: ["openqasm3", "qiskit", "qiskit_aer"],
    defaultTemplate: `// OpenQASM 3.0 — Bell State |Phi+>
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

// Allocate 2 qubits and 2 classical bits
qubit[2] q;
bit[2] c;

// Create Bell State: H on q[0], then CNOT
h q[0];
cx q[0], q[1];

// Measure both qubits
c = measure q;
`,
  },

  qiskit: {
    id: "qiskit",
    name: "Qiskit",
    tag: "IBM Quantum",
    badgeColor: "#6929C4",
    accentColor: "#8A3FFC",
    version: "1.x",
    description: "IBM Quantum SDK for gate-level circuits, transpilation, and Aer noise/statevector simulation.",
    libraries: ["qiskit", "qiskit_aer", "qiskit.quantum_info"],
    defaultTemplate: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create a 2-qubit Bell State circuit
qc = QuantumCircuit(2, 2)

# Apply Hadamard and CNOT gates
qc.h(0)
qc.cx(0, 1)

# Add measurements
qc.measure([0, 1], [0, 1])

print("Qiskit Quantum Circuit:")
print(qc.draw(output='text'))

# Simulate with AerSimulator
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture statevector before measurements and report
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results (1000 shots):")
print(counts)
`,
  },

  pennylane: {
    id: "pennylane",
    name: "PennyLane",
    tag: "Xanadu QML",
    badgeColor: "#F36D00",
    accentColor: "#FF8C38",
    version: "0.45",
    description: "Cross-platform Python library for quantum machine learning, automatic differentiation, and hybrid computation.",
    libraries: ["pennylane", "qml", "numpy"],
    defaultTemplate: `import pennylane as qml
import numpy as np
from algohub_runtime import report

# 1. Define a 2-qubit simulator device
dev = qml.device("default.qubit", wires=2, shots=1000)

# 2. Construct a quantum circuit (QNode)
@qml.qnode(dev)
def bell_circuit():
    qml.Hadamard(wires=0)
    qml.CNOT(wires=[0, 1])
    return qml.counts(), qml.state()

# 3. Execute the QNode
counts, state = bell_circuit()

print("PennyLane Circuit Diagram:")
print(qml.draw(bell_circuit)())

print("\\nFinal Statevector:")
print(state)

print("\\nMeasurement Counts:")
print(counts)

# Report data to AlgoHub visualizer
report(circuit=bell_circuit, statevector=state, counts=counts)
`,
  },

  cirq: {
    id: "cirq",
    name: "Cirq",
    tag: "Google Quantum",
    badgeColor: "#0F9D58",
    accentColor: "#34A853",
    version: "1.7",
    description: "Google Quantum AI open-source framework for creating, editing, and invoking Noisy Intermediate Scale Quantum (NISQ) circuits.",
    libraries: ["cirq", "cirq_google", "sympy"],
    defaultTemplate: `import cirq
from algohub_runtime import report

# 1. Initialize two line qubits
q0, q1 = cirq.LineQubit.range(2)

# 2. Build Bell State circuit
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key='result')
)

print("Cirq Circuit Diagram:")
print(circuit)

# 3. Simulate with Cirq Simulator
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)

# Extract counts from measurement histogram
histogram = result.histogram(key='result')
counts = {format(key, '02b'): int(val) for key, val in histogram.items()}

# Obtain wave function statevector
state_result = simulator.simulate(cirq.Circuit(cirq.H(q0), cirq.CNOT(q0, q1)))
statevector = state_result.state_vector()

print("\\nSimulation Statevector:")
print(statevector)

print("\\nMeasurement Results (1000 repetitions):")
print(counts)

# Report data to AlgoHub visualizer
report(circuit=circuit, statevector=statevector, counts=counts)
`,
  },
};

export const FRAMEWORK_LIST = Object.values(FRAMEWORKS);

export const getFrameworkById = (id) => {
  return FRAMEWORKS[id] || FRAMEWORKS.qiskit;
};

export const DEFAULT_FRAMEWORK_ID = "qiskit";
