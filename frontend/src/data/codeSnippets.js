// Code snippets library for AlgoHub Custom Build

export const codeSnippets = {
  basics: {
    label: "Basic Templates",
    snippets: [
      {
        id: "blank",
        name: "Blank Circuit",
        description: "Empty circuit with boilerplate",
        code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create your quantum circuit
qc = QuantumCircuit(2, 2)

# Add gates here

# Measure
qc.measure([0, 1], [0, 1])

print("Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture visualization data
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nResults:")
print(counts)
`
      },
      {
        id: "single-qubit",
        name: "Single Qubit Operations",
        description: "Pauli gates, Hadamard, phase gates",
        code: `# Single Qubit Gates
qc.h(0)        # Hadamard
qc.x(0)        # Pauli-X (NOT)
qc.y(0)        # Pauli-Y
qc.z(0)        # Pauli-Z
qc.s(0)        # Phase gate (√Z)
qc.t(0)        # T gate (√S)
qc.rx(pi/4, 0) # Rotation around X
qc.ry(pi/4, 0) # Rotation around Y
qc.rz(pi/4, 0) # Rotation around Z
`
      },
      {
        id: "two-qubit",
        name: "Two Qubit Gates",
        description: "CNOT, CZ, SWAP, controlled operations",
        code: `# Two Qubit Gates
qc.cx(0, 1)     # CNOT (controlled-X)
qc.cz(0, 1)     # Controlled-Z
qc.swap(0, 1)   # SWAP
qc.cy(0, 1)     # Controlled-Y
qc.ch(0, 1)     # Controlled-Hadamard
qc.crx(pi/4, 0, 1) # Controlled rotation-X
qc.cp(pi/4, 0, 1)  # Controlled phase
`
      }
    ]
  },
  
  entanglement: {
    label: "Entanglement",
    snippets: [
      {
        id: "bell-state",
        name: "Bell State |Φ+⟩",
        description: "Create maximally entangled state",
        code: `# Bell State (|00⟩ + |11⟩)/√2
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])
`
      },
      {
        id: "ghz-state",
        name: "GHZ State",
        description: "Multi-qubit entanglement",
        code: `# GHZ State (|000⟩ + |111⟩)/√2
n = 3
qc = QuantumCircuit(n, n)
qc.h(0)
for i in range(n - 1):
    qc.cx(i, i + 1)
qc.measure(range(n), range(n))
`
      },
      {
        id: "w-state",
        name: "W State",
        description: "Another multi-qubit entangled state",
        code: `# W State (|001⟩ + |010⟩ + |100⟩)/√3
import numpy as np
qc = QuantumCircuit(3, 3)
qc.ry(2 * np.arccos(np.sqrt(2/3)), 0)
qc.ch(0, 1)
qc.x(0)
qc.ch(0, 2)
qc.x(0)
qc.measure([0, 1, 2], [0, 1, 2])
`
      }
    ]
  },
  
  algorithms: {
    label: "Quantum Algorithms",
    snippets: [
      {
        id: "deutsch",
        name: "Deutsch Algorithm",
        description: "Single-qubit Deutsch algorithm",
        code: `# Deutsch Algorithm
qc = QuantumCircuit(2, 1)
# Initialize
qc.x(1)
qc.h([0, 1])

# Oracle (constant: do nothing, balanced: add cx)
qc.cx(0, 1)  # Balanced function

qc.h(0)
qc.measure(0, 0)
`
      },
      {
        id: "qft",
        name: "Quantum Fourier Transform",
        description: "QFT implementation",
        code: `import numpy as np

def qft(circuit, n):
    """Apply QFT to first n qubits"""
    for j in range(n):
        circuit.h(j)
        for k in range(j + 1, n):
            circuit.cp(np.pi / (2 ** (k - j)), k, j)
    # Swap qubits
    for i in range(n // 2):
        circuit.swap(i, n - i - 1)
    return circuit

# Use QFT
n = 3
qc = QuantumCircuit(n, n)
qc.x(0)  # Prepare input state
qft(qc, n)
qc.measure(range(n), range(n))
`
      },
      {
        id: "grover-oracle",
        name: "Grover Oracle",
        description: "Oracle for Grover's search",
        code: `# Grover Oracle (mark state |11⟩)
def grover_oracle(circuit):
    circuit.cz(0, 1)

# Diffusion operator
def diffusion(circuit):
    circuit.h([0, 1])
    circuit.z([0, 1])
    circuit.cz(0, 1)
    circuit.h([0, 1])

qc = QuantumCircuit(2, 2)
qc.h([0, 1])
grover_oracle(qc)
diffusion(qc)
qc.measure([0, 1], [0, 1])
`
      }
    ]
  },
  
  utilities: {
    label: "Utilities",
    snippets: [
      {
        id: "barrier",
        name: "Visual Barrier",
        description: "Add visual separator in circuit",
        code: `qc.barrier()  # Visual separator
`
      },
      {
        id: "custom-gate",
        name: "Custom Gate",
        description: "Define and use custom gate",
        code: `from qiskit.circuit import Gate
import numpy as np

# Define custom gate
custom_gate = Gate("MyGate", 1, [])
qc.append(custom_gate, [0])

# Or use unitary directly
from qiskit.extensions import UnitaryGate
unitary = np.array([[1, 0], [0, np.exp(1j * np.pi/4)]])
gate = UnitaryGate(unitary, label="Custom")
qc.append(gate, [0])
`
      },
      {
        id: "reset",
        name: "Reset Qubit",
        description: "Reset qubit to |0⟩",
        code: `qc.reset(0)  # Reset qubit 0 to |0⟩
`
      },
      {
        id: "conditional",
        name: "Conditional Operation",
        description: "Apply gate based on classical bit",
        code: `# Measure then apply gate conditionally
qc.measure(0, 0)
qc.x(1).c_if(0, 1)  # Apply X if classical bit 0 is 1
`
      }
    ]
  },
  
  visualization: {
    label: "Visualization",
    snippets: [
      {
        id: "save-statevector",
        name: "Save Statevector",
        description: "Get exact quantum state",
        code: `# For statevector simulation
from qiskit_aer import AerSimulator
simulator = AerSimulator(method='statevector')
qc_no_measure = qc.remove_final_measurements(inplace=False)
qc_no_measure.save_statevector()
job = simulator.run(qc_no_measure)
statevector = job.result().get_statevector()
print("Statevector:", statevector)
`
      },
      {
        id: "density-matrix",
        name: "Density Matrix",
        description: "Get density matrix for mixed states",
        code: `from qiskit.quantum_info import DensityMatrix
dm = DensityMatrix.from_instruction(qc.remove_final_measurements(inplace=False))
print("Density Matrix:")
print(dm)
`
      }
    ]
  }
};

export const getSnippetsByCategory = () => {
  return Object.entries(codeSnippets).map(([key, category]) => ({
    key,
    ...category
  }));
};

export const searchSnippets = (query) => {
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  Object.values(codeSnippets).forEach(category => {
    category.snippets.forEach(snippet => {
      if (
        snippet.name.toLowerCase().includes(lowerQuery) ||
        snippet.description.toLowerCase().includes(lowerQuery) ||
        snippet.code.toLowerCase().includes(lowerQuery)
      ) {
        results.push(snippet);
      }
    });
  });
  
  return results;
};
