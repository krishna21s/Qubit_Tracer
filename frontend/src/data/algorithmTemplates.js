// Preset Algorithm Templates organized by difficulty
// Each algorithm includes: metadata, starter code, and expected learning outcomes

export const algorithmTemplates = [
  // ==================== BEGINNER ====================
  {
    id: "single-qubit-gates",
    name: "Single Qubit Gates",
    difficulty: "beginner",
    category: "Fundamentals",
    description: "Learn basic single-qubit operations: X, H, and measurement",
    icon: "⚛️",
    estimatedTime: "5 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create a quantum circuit with 1 qubit and 1 classical bit
qc = QuantumCircuit(1, 1)

# Apply Hadamard gate (creates superposition)
qc.h(0)

# Measure the qubit
qc.measure(0, 0)

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Compute statevector for Bloch spheres
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))

# Send data to AlgoHub runtime
report(circuit=qc, statevector=statevector, counts=counts)

print("Circuit:")
print(qc.draw(output='text'))

print("\\nMeasurement Results:")
print(counts)
`,
    expectedOutput: "50% |0⟩ and 50% |1⟩ (approximately)",
    learningGoals: [
      "Understand superposition",
      "Learn Hadamard gate behavior",
      "Interpret measurement statistics"
    ]
  },

  {
    id: "bell-state",
    name: "Bell State (Entanglement)",
    difficulty: "beginner",
    category: "Entanglement",
    description: "Create a maximally entangled Bell state using 2 qubits",
    icon: "🔗",
    estimatedTime: "5 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create circuit with 2 qubits
qc = QuantumCircuit(2, 2)

# Create Bell State: (|00⟩ + |11⟩)/√2
qc.h(0)  # Hadamard on qubit 0
qc.cx(0, 1)  # CNOT with control=0, target=1

# Measure both qubits
qc.measure([0, 1], [0, 1])

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))

report(circuit=qc, statevector=statevector, counts=counts)

print("Bell State Circuit:")
print(qc.draw(output='text'))

print("\\nMeasurement Results:")
print(counts)
print("\\nNotice: Only |00⟩ and |11⟩ appear (perfect correlation!)")
`,
    expectedOutput: "50% |00⟩ and 50% |11⟩",
    learningGoals: [
      "Create entangled qubits",
      "Understand CNOT gate",
      "Observe quantum correlation"
    ]
  },

  {
    id: "ghz-state",
    name: "GHZ State (3-Qubit Entanglement)",
    difficulty: "beginner",
    category: "Entanglement",
    description: "Extend entanglement to 3 qubits using the GHZ protocol",
    icon: "🌐",
    estimatedTime: "7 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create GHZ state: (|000⟩ + |111⟩)/√2
qc = QuantumCircuit(3, 3)

# Build GHZ
qc.h(0)       # Superposition on q0
qc.cx(0, 1)   # Entangle q0 and q1
qc.cx(0, 2)   # Entangle q0 and q2

qc.measure([0, 1, 2], [0, 1, 2])

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))

report(circuit=qc, statevector=statevector, counts=counts)

print("GHZ State Circuit:")
print(qc.draw(output='text'))

print("\\nMeasurement Results:")
print(counts)
print("\\nAll 3 qubits are perfectly correlated!")
`,
    expectedOutput: "50% |000⟩ and 50% |111⟩",
    learningGoals: [
      "Scale entanglement to multiple qubits",
      "Understand multi-qubit gates",
      "Visualize 3-way correlation"
    ]
  },

  // ==================== INTERMEDIATE ====================
  {
    id: "quantum-teleportation",
    name: "Quantum Teleportation",
    difficulty: "intermediate",
    category: "Communication",
    description: "Transfer quantum state from one qubit to another using entanglement",
    icon: "📡",
    estimatedTime: "10 min",
    code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit.quantum_info import Statevector\nfrom algohub_runtime import report\nimport numpy as np

# Quantum Teleportation Protocol
qc = QuantumCircuit(3, 3)

# Prepare state to teleport on q0 (e.g., |+⟩ state)
qc.h(0)

# Create entangled Bell pair between q1 and q2
qc.h(1)
qc.cx(1, 2)

qc.barrier()  # Visual separator

# Alice's operations (q0 and q1)
qc.cx(0, 1)
qc.h(0)

# Capture statevector BEFORE measurements for visualization
qc_no_measure = qc.copy()
statevector = Statevector.from_instruction(qc_no_measure)

# Measure Alice's qubits
qc.measure([0, 1], [0, 1])

qc.barrier()

# Bob's correction operations (q2) based on measurements
qc.cx(1, 2)  # Correct if qubit 1 measured |1⟩
qc.cz(0, 2)  # Correct if qubit 0 measured |1⟩

# Final measurement
qc.measure(2, 2)

print("Teleportation Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nQubit 2 (Bob) receives the state from Qubit 0 (Alice)!")
`,
    expectedOutput: "State successfully teleported to qubit 2",
    learningGoals: [
      "Understand quantum teleportation protocol",
      "Learn classical-quantum hybrid operations",
      "Explore no-cloning theorem implications"
    ]
  },

  {
    id: "deutsch-jozsa",
    name: "Deutsch-Jozsa Algorithm",
    difficulty: "intermediate",
    category: "Algorithms",
    description: "Determine if a function is constant or balanced in one query",
    icon: "🎯",
    estimatedTime: "12 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Deutsch-Jozsa for 3-qubit balanced function
n = 3  # Number of input qubits
qc = QuantumCircuit(n + 1, n)  # n input + 1 output qubit

# Initialize output qubit to |1⟩
qc.x(n)

# Apply Hadamard gates
for qubit in range(n + 1):
    qc.h(qubit)

qc.barrier()

# Oracle for balanced function (example: f(x) = x0 ⊕ x1)
# This flips output if x0 XOR x1 = 1
qc.cx(0, n)
qc.cx(1, n)

qc.barrier()

# Apply Hadamard gates to input qubits
for qubit in range(n):
    qc.h(qubit)

# Capture statevector BEFORE measurements for Bloch sphere visualization
qc_no_measure = qc.copy()
statevector = Statevector.from_instruction(qc_no_measure)

# Measure input qubits
qc.measure(range(n), range(n))

print("Deutsch-Jozsa Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nIf result is all 0s → Constant function")
print("If result is non-zero → Balanced function")
`,
    expectedOutput: "Non-zero result indicating balanced function",
    learningGoals: [
      "Understand oracle-based algorithms",
      "Learn quantum parallelism",
      "Compare classical vs quantum query complexity"
    ]
  },

  {
    id: "qft-3qubit",
    name: "Quantum Fourier Transform (3-Qubit)",
    difficulty: "intermediate",
    category: "Transforms",
    description: "Apply QFT to transform quantum states into frequency domain",
    icon: "〰️",
    estimatedTime: "12 min",
    code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit.quantum_info import Statevector\nfrom algohub_runtime import report\nimport numpy as np

def qft(circuit, n):
    """Apply QFT to first n qubits in circuit"""
    for j in range(n):
        circuit.h(j)
        for k in range(j + 1, n):
            circuit.cp(np.pi / (2 ** (k - j)), k, j)
    
    # Swap qubits for correct output order
    for i in range(n // 2):
        circuit.swap(i, n - i - 1)
    
    return circuit

# Create circuit
n = 3
qc = QuantumCircuit(n, n)

# Prepare input state |001⟩
qc.x(0)

qc.barrier()

# Apply QFT
qft(qc, n)

qc.barrier()

# Measure
qc.measure(range(n), range(n))

print("QFT Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nQFT transforms the basis states into superposition")
`,
    expectedOutput: "Uniform distribution across basis states",
    learningGoals: [
      "Understand Quantum Fourier Transform",
      "Learn phase estimation building block",
      "Prepare for Shor's algorithm"
    ]
  },

  // ==================== ADVANCED ====================
  {
    id: "grovers-search",
    name: "Grover's Search Algorithm",
    difficulty: "advanced",
    category: "Search",
    description: "Search unsorted database with quadratic speedup over classical",
    icon: "🔍",
    estimatedTime: "15 min",
    code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit.quantum_info import Statevector\nfrom algohub_runtime import report\nimport numpy as np

# Grover's algorithm to find marked state |11⟩ in 2-qubit space
n = 2
qc = QuantumCircuit(n, n)

# Initialize superposition
qc.h([0, 1])

qc.barrier()

# Oracle: mark state |11⟩
qc.cz(0, 1)

qc.barrier()

# Diffusion operator (amplitude amplification)
qc.h([0, 1])
qc.z([0, 1])
qc.cz(0, 1)
qc.h([0, 1])

qc.barrier()

# Measure
qc.measure([0, 1], [0, 1])

print("Grover's Search Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nMarked state |11⟩ has highest probability!")
`,
    expectedOutput: "~100% probability of measuring |11⟩",
    learningGoals: [
      "Understand amplitude amplification",
      "Learn oracle construction",
      "Compare with classical search O(N) vs O(√N)"
    ]
  },

  {
    id: "shor-simplified",
    name: "Shor's Algorithm (Simplified)",
    difficulty: "advanced",
    category: "Factorization",
    description: "Factor integers using quantum period finding (simplified 15 = 3 × 5)",
    icon: "🔢",
    estimatedTime: "20 min",
    code: `from qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit.quantum_info import Statevector\nfrom algohub_runtime import report\nimport numpy as np

# Simplified Shor's algorithm for factoring 15
# Uses period finding of a^x mod 15 where a=7

n_count = 4  # Counting qubits
qc = QuantumCircuit(n_count + 4, n_count)

# Initialize counting qubits in superposition
for q in range(n_count):
    qc.h(q)

# Initialize auxiliary qubits to |1⟩
qc.x(n_count)

qc.barrier()

# Modular exponentiation oracle (simplified)
# This is a teaching example - full Shor's requires more gates
angle = 2 * np.pi / (2 ** n_count)

for i in range(n_count):
    for _ in range(2 ** i):
        # Simplified phase kickback
        qc.cp(angle, i, n_count)

qc.barrier()

# Inverse QFT on counting qubits
for j in range(n_count // 2):
    qc.swap(j, n_count - 1 - j)

for j in reversed(range(n_count)):
    for k in reversed(range(j)):
        qc.cp(-np.pi / (2 ** (j - k)), k, j)
    qc.h(j)

qc.barrier()

# Measure counting qubits
qc.measure(range(n_count), range(n_count))

print("Simplified Shor's Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nPeaks reveal period → factors of 15")
print("Full Shor's requires continued fractions for factor extraction")
`,
    expectedOutput: "Periodic pattern revealing factors",
    learningGoals: [
      "Understand quantum period finding",
      "Learn modular arithmetic in quantum",
      "Grasp RSA encryption vulnerability"
    ]
  },

  {
    id: "vqe-h2",
    name: "VQE for H₂ Molecule",
    difficulty: "advanced",
    category: "Quantum Chemistry",
    description: "Find ground state energy of hydrogen molecule using variational method",
    icon: "⚗️",
    estimatedTime: "20 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report
import numpy as np

# Simplified VQE ansatz for H2 molecule
# Real VQE requires classical optimizer loop

def create_vqe_ansatz(theta):
    """Parameterized circuit for VQE"""
    qc = QuantumCircuit(2)
    
    # Prepare trial state
    qc.ry(theta[0], 0)
    qc.ry(theta[1], 1)
    qc.cx(0, 1)
    qc.ry(theta[2], 0)
    qc.ry(theta[3], 1)
    
    return qc

# Example with fixed parameters (would be optimized in real VQE)
params = [0.5, 0.8, 0.3, 0.6]
qc = create_vqe_ansatz(params)

print("VQE Ansatz Circuit:")
print(qc.draw(output='text'))

# Simulate to get statevector
simulator = AerSimulator(method='statevector')
qc.save_statevector()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit)
result = job.result()
statevector = result.get_statevector()

print("\\nStatevector:")
print(np.array(statevector))

# Capture data for visualization
report(circuit=qc, statevector=Statevector(statevector))

# In real VQE, this state would be used to compute
# expectation value ⟨ψ|H|ψ⟩ and minimize
print("\\nIn full VQE:")
print("1. Measure ⟨H⟩ = ⟨ψ|H|ψ⟩")
print("2. Classical optimizer adjusts θ")
print("3. Repeat until energy converges")
print("4. Result ≈ ground state energy of H₂")
`,
    expectedOutput: "Parameterized circuit preparation for optimization",
    learningGoals: [
      "Understand variational quantum algorithms",
      "Learn hybrid quantum-classical optimization",
      "Explore quantum chemistry applications"
    ]
  },

  {
    id: "qec-bit-flip",
    name: "Quantum Error Correction (Bit-Flip)",
    difficulty: "advanced",
    category: "Error Correction",
    description: "Protect quantum information using 3-qubit bit-flip code",
    icon: "🛡️",
    estimatedTime: "18 min",
    code: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator, noise
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# 3-qubit bit-flip error correction code
qc = QuantumCircuit(5, 3)  # 3 data + 2 ancilla qubits

# Prepare state to protect (e.g., |+⟩)
qc.h(0)

qc.barrier()

# Encoding: |ψ⟩ → |ψψψ⟩
qc.cx(0, 1)
qc.cx(0, 2)

qc.barrier()

# Simulate error on qubit 1 (bit-flip)
qc.x(1)

qc.barrier()

# Error detection using ancilla qubits
qc.cx(0, 3)  # Compare q0 and q1
qc.cx(1, 3)

qc.cx(1, 4)  # Compare q1 and q2
qc.cx(2, 4)

qc.barrier()

# Measure ancilla
qc.measure([3, 4], [0, 1])

# Error correction (simplified - assumes syndrome measured)
# In practice, classical control corrects based on measurement
qc.cx(3, 1)  # Correct q1 if ancilla detected error

qc.barrier()

# Decode
qc.cx(0, 2)
qc.cx(0, 1)

# Build a clean circuit without measurements for statevector
qc_viz = QuantumCircuit(5)
qc_viz.h(0)
qc_viz.barrier()
qc_viz.cx(0, 1)
qc_viz.cx(0, 2)
qc_viz.barrier()
qc_viz.x(1)  # Error
qc_viz.barrier()
qc_viz.cx(0, 3)
qc_viz.cx(1, 3)
qc_viz.cx(1, 4)
qc_viz.cx(2, 4)
qc_viz.barrier()
qc_viz.cx(3, 1)  # Correction
qc_viz.barrier()
qc_viz.cx(0, 2)
qc_viz.cx(0, 1)
statevector = Statevector.from_instruction(qc_viz)

# Final measurement
qc.measure(0, 2)

print("Quantum Error Correction Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
print("\\nError was detected and corrected!")
`,
    expectedOutput: "Original state recovered despite error",
    learningGoals: [
      "Understand quantum error correction",
      "Learn syndrome measurement",
      "Explore fault-tolerant quantum computing"
    ]
  }
];

// Utility functions
export const getDifficultyLevel = (difficulty) => {
  const levels = {
    beginner: { order: 1, color: "#4ade80", label: "Beginner" },
    intermediate: { order: 2, color: "#fbbf24", label: "Intermediate" },
    advanced: { order: 3, color: "#f87171", label: "Advanced" }
  };
  return levels[difficulty] || levels.beginner;
};

export const getAlgorithmsByDifficulty = () => {
  const grouped = {
    beginner: [],
    intermediate: [],
    advanced: []
  };
  
  algorithmTemplates.forEach(algo => {
    if (grouped[algo.difficulty]) {
      grouped[algo.difficulty].push(algo);
    }
  });
  
  return grouped;
};

export const searchAlgorithms = (query) => {
  const lowerQuery = query.toLowerCase();
  return algorithmTemplates.filter(algo => 
    algo.name.toLowerCase().includes(lowerQuery) ||
    algo.description.toLowerCase().includes(lowerQuery) ||
    algo.category.toLowerCase().includes(lowerQuery)
  );
};
