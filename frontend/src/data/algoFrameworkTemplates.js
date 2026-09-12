// Framework-specific code templates for AlgoHub
// Covers: Cirq, PennyLane, OpenQASM for all algorithms
// Qiskit code lives in algorithmTemplates.js (algo.code)

const algoFrameworkCode = {

  // ─────────────────────────────────────────────────────────────────
  // 1. SINGLE QUBIT GATES
  // ─────────────────────────────────────────────────────────────────
  "single-qubit-gates": {
    cirq: `import cirq
from algohub_runtime import report

# Create a single qubit
q0 = cirq.LineQubit(0)

# Build the circuit: H gate then measure
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.measure(q0, key='m')
)

print("Cirq Circuit:")
print(circuit)

# Simulate
sim = cirq.Simulator()
result = sim.run(circuit, repetitions=1000)
counts = {str(k): int(v) for k, v in result.histogram(key='m').items()}

# Get statevector (without measurement)
sv_result = sim.simulate(cirq.Circuit(cirq.H(q0)))
sv = sv_result.state_vector()

print("\\nMeasurement Counts:", counts)
print("Notice ~50% |0⟩ and ~50% |1⟩ — superposition!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

# Define a 1-wire device with 1000 shots
dev = qml.device("default.qubit", wires=1, shots=1000)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)       # Apply Hadamard gate
    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane Circuit:")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("Notice ~50% |0⟩ and ~50% |1⟩ — superposition!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Single Qubit Gate (Hadamard)
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

// Allocate 1 qubit and 1 classical bit
qubit[1] q;
bit[1] c;

// Apply Hadamard gate — creates superposition
h q[0];

// Measure
c = measure q;

// Expected: ~50% |0⟩, ~50% |1⟩
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. BELL STATE
  // ─────────────────────────────────────────────────────────────────
  "bell-state": {
    cirq: `import cirq
from algohub_runtime import report

# Initialize two qubits
q0, q1 = cirq.LineQubit.range(2)

# Build Bell State circuit
circuit = cirq.Circuit(
    cirq.H(q0),               # Hadamard on q0
    cirq.CNOT(q0, q1),        # CNOT: control=q0, target=q1
    cirq.measure(q0, q1, key='result')
)

print("Cirq Bell State Circuit:")
print(circuit)

# Simulate
sim = cirq.Simulator()
result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, '02b'): int(v) for k, v in histogram.items()}

# Get statevector (before measurement)
sv_circuit = cirq.Circuit(cirq.H(q0), cirq.CNOT(q0, q1))
sv = sim.simulate(sv_circuit).state_vector()

print("\\nMeasurement Counts:", counts)
print("Notice: Only |00⟩ and |11⟩ appear — perfect entanglement!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

# Define a 2-wire device with 1000 shots
dev = qml.device("default.qubit", wires=2, shots=1000)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)       # Creates superposition on qubit 0
    qml.CNOT(wires=[0, 1])      # Entangles qubit 0 and qubit 1
    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane Bell State Circuit:")
print(qml.draw(circuit)())
print("\\nFinal Statevector:", state)
print("\\nMeasurement Counts:", counts)
print("Notice: Only |00⟩ and |11⟩ appear — perfect entanglement!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Bell State |Phi+⟩
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

// Expected: 50% |00⟩, 50% |11⟩
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. GHZ STATE
  // ─────────────────────────────────────────────────────────────────
  "ghz-state": {
    cirq: `import cirq
from algohub_runtime import report

# Initialize three qubits
q0, q1, q2 = cirq.LineQubit.range(3)

# Build GHZ State: (|000⟩ + |111⟩)/√2
circuit = cirq.Circuit(
    cirq.H(q0),               # Superposition on q0
    cirq.CNOT(q0, q1),        # Entangle q0 and q1
    cirq.CNOT(q0, q2),        # Entangle q0 and q2
    cirq.measure(q0, q1, q2, key='result')
)

print("Cirq GHZ State Circuit:")
print(circuit)

# Simulate
sim = cirq.Simulator()
result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, '03b'): int(v) for k, v in histogram.items()}

# Get statevector (before measurement)
sv_circuit = cirq.Circuit(cirq.H(q0), cirq.CNOT(q0, q1), cirq.CNOT(q0, q2))
sv = sim.simulate(sv_circuit).state_vector()

print("\\nMeasurement Counts:", counts)
print("All 3 qubits are perfectly correlated!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

# Define a 3-wire device with 1000 shots
dev = qml.device("default.qubit", wires=3, shots=1000)

@qml.qnode(dev)
def circuit():
    qml.Hadamard(wires=0)       # Superposition on qubit 0
    qml.CNOT(wires=[0, 1])      # Entangle qubit 0 → 1
    qml.CNOT(wires=[0, 2])      # Entangle qubit 0 → 2
    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane GHZ State Circuit:")
print(qml.draw(circuit)())
print("\\nFinal Statevector:", state)
print("\\nMeasurement Counts:", counts)
print("All 3 qubits are perfectly correlated!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — GHZ State (3-Qubit Entanglement)
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

// Allocate 3 qubits and 3 classical bits
qubit[3] q;
bit[3] c;

// Build GHZ: H on q[0], then two CNOTs
h q[0];
cx q[0], q[1];
cx q[0], q[2];

// Measure all qubits
c = measure q;

// Expected: 50% |000⟩, 50% |111⟩ — 3-way entanglement!
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. QUANTUM TELEPORTATION
  // ─────────────────────────────────────────────────────────────────
  "quantum-teleportation": {
    cirq: `import cirq
from algohub_runtime import report

# 3 qubits: q0=Alice's state, q1=Alice's half, q2=Bob's half
q0, q1, q2 = cirq.LineQubit.range(3)

circuit = cirq.Circuit()

# Prepare state to teleport: |+⟩ on q0
circuit.append(cirq.H(q0))

# Create Bell pair between q1 and q2
circuit.append(cirq.H(q1))
circuit.append(cirq.CNOT(q1, q2))

# Alice's operations
circuit.append(cirq.CNOT(q0, q1))
circuit.append(cirq.H(q0))

# Capture statevector before measurements
sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

# Measure Alice's qubits
circuit.append(cirq.measure(q0, q1, key='alice'))

# Bob's correction
circuit.append(cirq.CNOT(q1, q2))
circuit.append(cirq.CZ(q0, q2))

# Final: measure Bob's qubit
circuit.append(cirq.measure(q2, key='bob'))

print("Cirq Quantum Teleportation Circuit:")
print(circuit)

result = sim.run(circuit, repetitions=1000)
bob_histogram = result.histogram(key='bob')
counts = {str(k): int(v) for k, v in bob_histogram.items()}

print("\\nBob's Measurement:", counts)
print("Qubit 2 (Bob) received the state from Qubit 0 (Alice)!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

# 3 wires: 0=state to teleport, 1=Alice's ancilla, 2=Bob's qubit
dev = qml.device("default.qubit", wires=3, shots=1000)

@qml.qnode(dev)
def circuit():
    # Prepare |+⟩ state on wire 0
    qml.Hadamard(wires=0)

    # Create Bell pair between wires 1 and 2
    qml.Hadamard(wires=1)
    qml.CNOT(wires=[1, 2])

    # Alice's operations
    qml.CNOT(wires=[0, 1])
    qml.Hadamard(wires=0)

    # Bob's correction (classical feedforward simplified)
    qml.CNOT(wires=[1, 2])
    qml.CZ(wires=[0, 2])

    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane Quantum Teleportation:")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("Qubit 2 (Bob) received the state from Qubit 0 (Alice)!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Quantum Teleportation Protocol
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

qubit[3] q;   // q[0]=state, q[1]=Alice ancilla, q[2]=Bob
bit[3] c;

// Prepare |+⟩ state on q[0]
h q[0];

// Create Bell pair between q[1] and q[2]
h q[1];
cx q[1], q[2];

// Alice's operations
cx q[0], q[1];
h q[0];

// Measure Alice's qubits
c[0] = measure q[0];
c[1] = measure q[1];

// Bob's correction based on Alice's measurements
cx q[1], q[2];
cz q[0], q[2];

// Measure Bob's qubit
c[2] = measure q[2];

// Qubit q[2] now holds the teleported state!
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. DEUTSCH-JOZSA ALGORITHM
  // ─────────────────────────────────────────────────────────────────
  "deutsch-jozsa": {
    cirq: `import cirq
from algohub_runtime import report

n = 3  # Number of input qubits
qubits = cirq.LineQubit.range(n + 1)
input_qubits = qubits[:n]
output_qubit = qubits[n]

circuit = cirq.Circuit()

# Init output qubit to |1⟩
circuit.append(cirq.X(output_qubit))

# Apply Hadamard to all qubits
circuit.append(cirq.H.on_each(*qubits))

# Oracle: balanced function f(x) = x0 XOR x1
circuit.append(cirq.CNOT(input_qubits[0], output_qubit))
circuit.append(cirq.CNOT(input_qubits[1], output_qubit))

# Apply Hadamard to input qubits
circuit.append(cirq.H.on_each(*input_qubits))

# Capture statevector before measurement
sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

# Measure input qubits
circuit.append(cirq.measure(*input_qubits, key='result'))

print("Cirq Deutsch-Jozsa Circuit:")
print(circuit)

result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, f'0{n}b'): int(v) for k, v in histogram.items()}

print("\\nMeasurement Counts:", counts)
print("Non-zero result → Balanced function")
print("All zeros → Constant function")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

n = 3  # Number of input qubits
dev = qml.device("default.qubit", wires=n + 1, shots=1000)

@qml.qnode(dev)
def circuit():
    # Init output qubit to |1⟩
    qml.PauliX(wires=n)

    # Apply Hadamard to all qubits
    for i in range(n + 1):
        qml.Hadamard(wires=i)

    # Oracle: balanced function f(x) = x0 XOR x1
    qml.CNOT(wires=[0, n])
    qml.CNOT(wires=[1, n])

    # Hadamard on input qubits
    for i in range(n):
        qml.Hadamard(wires=i)

    return qml.counts(wires=range(n)), qml.state()

counts, state = circuit()

print("PennyLane Deutsch-Jozsa:")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("Non-zero result → Balanced function")
print("All zeros → Constant function")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Deutsch-Jozsa Algorithm (3 input qubits)
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

// 3 input qubits + 1 output qubit
qubit[4] q;
bit[3]  c;

// Init output qubit to |1⟩
x q[3];

// Apply Hadamard to ALL qubits
h q[0]; h q[1]; h q[2]; h q[3];

// Oracle: balanced function f(x) = x0 XOR x1
cx q[0], q[3];
cx q[1], q[3];

// Hadamard on input qubits only
h q[0]; h q[1]; h q[2];

// Measure input qubits
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];

// Non-zero → balanced; all zeros → constant
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. QUANTUM FOURIER TRANSFORM (3-QUBIT)
  // ─────────────────────────────────────────────────────────────────
  "qft-3qubit": {
    cirq: `import cirq
import numpy as np
from algohub_runtime import report

n = 3
qubits = cirq.LineQubit.range(n)

def qft_cirq(qubits):
    """Build QFT circuit operations for given qubits."""
    n = len(qubits)
    ops = []
    for j in range(n):
        ops.append(cirq.H(qubits[j]))
        for k in range(j + 1, n):
            angle = np.pi / (2 ** (k - j))
            ops.append(
                cirq.CZPowGate(exponent=angle / np.pi).on(qubits[k], qubits[j])
            )
    # Swap for correct output order
    for i in range(n // 2):
        ops.append(cirq.SWAP(qubits[i], qubits[n - 1 - i]))
    return ops

# Build circuit
circuit = cirq.Circuit()

# Prepare input state |001⟩
circuit.append(cirq.X(qubits[0]))

# Apply QFT
circuit.append(qft_cirq(qubits))

print("Cirq QFT Circuit:")
print(circuit)

# Capture statevector
sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

# Measure
circuit.append(cirq.measure(*qubits, key='result'))
result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, f'0{n}b'): int(v) for k, v in histogram.items()}

print("\\nMeasurement Counts:", counts)
print("QFT transforms basis states into superposition")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
import numpy as np
from algohub_runtime import report

n = 3
dev = qml.device("default.qubit", wires=n, shots=1000)

@qml.qnode(dev)
def circuit():
    # Prepare input state |001⟩
    qml.PauliX(wires=0)

    # Apply QFT using PennyLane's built-in
    qml.QFT(wires=range(n))

    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane QFT Circuit:")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("QFT transforms basis states into superposition")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Quantum Fourier Transform (3-Qubit)
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

qubit[3] q;
bit[3]  c;

// Prepare input state |001⟩
x q[0];

// ── QFT on 3 qubits ──
// Stage 1: qubit 0
h q[0];
cp(pi/2) q[1], q[0];
cp(pi/4) q[2], q[0];

// Stage 2: qubit 1
h q[1];
cp(pi/2) q[2], q[1];

// Stage 3: qubit 2
h q[2];

// Bit-reversal swap
swap q[0], q[2];

// Measure
c = measure q;

// Expected: uniform distribution across basis states
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 7. GROVER'S SEARCH ALGORITHM
  // ─────────────────────────────────────────────────────────────────
  "grovers-search": {
    cirq: `import cirq
from algohub_runtime import report

# 2-qubit search for marked state |11⟩
q0, q1 = cirq.LineQubit.range(2)

circuit = cirq.Circuit()

# Initialize superposition
circuit.append([cirq.H(q0), cirq.H(q1)])

# Oracle: mark |11⟩ with a phase flip
circuit.append(cirq.CZ(q0, q1))

# Diffusion operator (amplitude amplification)
circuit.append([cirq.H(q0), cirq.H(q1)])
circuit.append([cirq.Z(q0), cirq.Z(q1)])
circuit.append(cirq.CZ(q0, q1))
circuit.append([cirq.H(q0), cirq.H(q1)])

print("Cirq Grover's Search Circuit:")
print(circuit)

# Capture statevector
sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

# Measure
circuit.append(cirq.measure(q0, q1, key='result'))
result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, '02b'): int(v) for k, v in histogram.items()}

print("\\nMeasurement Counts:", counts)
print("Marked state |11⟩ has highest probability!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

dev = qml.device("default.qubit", wires=2, shots=1000)

@qml.qnode(dev)
def circuit():
    # Initialize superposition
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=1)

    # Oracle: mark state |11⟩ with CZ (phase flip)
    qml.CZ(wires=[0, 1])

    # Diffusion operator (amplitude amplification)
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=1)
    qml.PauliZ(wires=0)
    qml.PauliZ(wires=1)
    qml.CZ(wires=[0, 1])
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=1)

    return qml.counts(), qml.state()

counts, state = circuit()

print("PennyLane Grover's Search:")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("Marked state |11⟩ has highest probability!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Grover's Search Algorithm
// Searches for marked state |11⟩ in 2-qubit space
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

qubit[2] q;
bit[2]  c;

// Initialize superposition
h q[0]; h q[1];

// Oracle: mark |11⟩ with a phase flip
cz q[0], q[1];

// Diffusion operator (amplitude amplification)
h q[0]; h q[1];
z q[0]; z q[1];
cz q[0], q[1];
h q[0]; h q[1];

// Measure
c = measure q;

// Expected: ~100% probability of measuring |11⟩
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 8. SHOR'S ALGORITHM (SIMPLIFIED)
  // ─────────────────────────────────────────────────────────────────
  "shor-simplified": {
    cirq: `import cirq
import numpy as np
from algohub_runtime import report

n_count = 4   # Counting qubits
total = n_count + 1
qubits = cirq.LineQubit.range(total)
count_qubits = qubits[:n_count]
aux = qubits[n_count]

circuit = cirq.Circuit()

# Initialize counting qubits in superposition
circuit.append(cirq.H.on_each(*count_qubits))

# Initialize auxiliary qubit to |1⟩
circuit.append(cirq.X(aux))

# Simplified phase kickback (teaching example)
angle = 2 * np.pi / (2 ** n_count)
for i, q in enumerate(count_qubits):
    for _ in range(2 ** i):
        circuit.append(
            cirq.CZPowGate(exponent=angle / np.pi).on(q, aux)
        )

# Inverse QFT on counting qubits
for j in range(n_count // 2):
    circuit.append(cirq.SWAP(count_qubits[j], count_qubits[n_count - 1 - j]))
for j in reversed(range(n_count)):
    for k in reversed(range(j)):
        a = -np.pi / (2 ** (j - k))
        circuit.append(cirq.CZPowGate(exponent=a / np.pi).on(count_qubits[k], count_qubits[j]))
    circuit.append(cirq.H(count_qubits[j]))

print("Cirq Simplified Shor's Circuit:")
print(circuit)

sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

circuit.append(cirq.measure(*count_qubits, key='result'))
result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, f'0{n_count}b'): int(v) for k, v in histogram.items()}

print("\\nMeasurement Counts:", counts)
print("Peaks reveal period → factors of 15")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
import numpy as np
from algohub_runtime import report

n_count = 4  # Counting qubits
n_total = n_count + 1
dev = qml.device("default.qubit", wires=n_total, shots=1000)

@qml.qnode(dev)
def circuit():
    # Init counting qubits in superposition
    for i in range(n_count):
        qml.Hadamard(wires=i)

    # Init auxiliary qubit to |1⟩
    qml.PauliX(wires=n_count)

    # Simplified phase kickback (period finding)
    angle = 2 * np.pi / (2 ** n_count)
    for i in range(n_count):
        for _ in range(2 ** i):
            qml.ControlledPhaseShift(angle, wires=[i, n_count])

    # Inverse QFT on counting qubits
    qml.adjoint(qml.QFT)(wires=range(n_count))

    return qml.counts(wires=range(n_count)), qml.state()

counts, state = circuit()

print("PennyLane Simplified Shor's Algorithm:")
print(qml.draw(circuit)())
print("\\nMeasurement Counts:", counts)
print("Peaks reveal period → factors of 15")
print("Full Shor's requires continued fractions for extraction")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Simplified Shor's Algorithm
// 4 counting + 1 auxiliary qubit
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

qubit[5] q;   // q[0-3]=counting, q[4]=auxiliary
bit[4]  c;

// Init counting qubits in superposition
h q[0]; h q[1]; h q[2]; h q[3];

// Init auxiliary qubit to |1⟩
x q[4];

// Simplified phase kickback
cp(pi/8)  q[0], q[4];
cp(pi/4)  q[1], q[4];
cp(pi/4)  q[1], q[4];
cp(pi/2)  q[2], q[4];
cp(pi/2)  q[2], q[4];
cp(pi/2)  q[2], q[4];
cp(pi/2)  q[2], q[4];

// Bit-reversal swaps for inverse QFT
swap q[0], q[3];
swap q[1], q[2];

// Inverse QFT
h q[0];
cp(-pi/2)  q[1], q[0];
h q[1];
cp(-pi/4)  q[2], q[0];
cp(-pi/2)  q[2], q[1];
h q[2];
cp(-pi/8)  q[3], q[0];
cp(-pi/4)  q[3], q[1];
cp(-pi/2)  q[3], q[2];
h q[3];

// Measure counting qubits
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];
c[3] = measure q[3];

// Peaks in distribution reveal period → factors
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 9. VQE FOR H₂ MOLECULE
  // ─────────────────────────────────────────────────────────────────
  "vqe-h2": {
    cirq: `import cirq
import numpy as np
from algohub_runtime import report

# 2 qubits for H2 ansatz
q0, q1 = cirq.LineQubit.range(2)

# Fixed variational parameters (optimizer would tune these)
params = [0.5, 0.8, 0.3, 0.6]

# Build parameterized ansatz circuit
circuit = cirq.Circuit(
    cirq.ry(params[0])(q0),   # Ry rotation on q0
    cirq.ry(params[1])(q1),   # Ry rotation on q1
    cirq.CNOT(q0, q1),        # Entangling layer
    cirq.ry(params[2])(q0),   # Second Ry on q0
    cirq.ry(params[3])(q1),   # Second Ry on q1
)

print("Cirq VQE Ansatz Circuit (H2 Molecule):")
print(circuit)

# Simulate to get statevector
sim = cirq.Simulator()
result = sim.simulate(circuit)
sv = result.state_vector()

print("\\nStatevector:", sv)
print("\\nIn full VQE:")
print("1. Measure ⟨H⟩ = ⟨ψ|H_H2|ψ⟩")
print("2. Classical optimizer adjusts θ values")
print("3. Repeat until energy converges")
print("4. Result ≈ ground state energy of H₂")

report(circuit=circuit, statevector=sv)
`,

    pennylane: `import pennylane as qml
import numpy as np
from algohub_runtime import report

# 2-wire device (no shots — exact statevector)
dev = qml.device("default.qubit", wires=2)

# Fixed variational parameters
params = np.array([0.5, 0.8, 0.3, 0.6])

@qml.qnode(dev)
def circuit(params):
    # Parameterized ansatz
    qml.RY(params[0], wires=0)
    qml.RY(params[1], wires=1)
    qml.CNOT(wires=[0, 1])
    qml.RY(params[2], wires=0)
    qml.RY(params[3], wires=1)
    return qml.state()

state = circuit(params)

print("PennyLane VQE Ansatz Circuit (H2 Molecule):")
print(qml.draw(circuit)(params))
print("\\nStatevector:", state)
print("\\nIn full VQE:")
print("1. Measure ⟨H⟩ = ⟨ψ|H_H2|ψ⟩")
print("2. Classical optimizer adjusts θ values")
print("3. Repeat until energy converges")
print("4. Result ≈ ground state energy of H₂")

report(circuit=circuit, statevector=state)
`,

    openqasm: `// OpenQASM 3.0 — VQE Ansatz for H2 Molecule
// Fixed variational parameters (θ values) for demonstration
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

// 2 qubits for hydrogen molecule ansatz
qubit[2] q;

// Layer 1: parameterized Ry rotations
ry(0.5) q[0];
ry(0.8) q[1];

// Entangling layer
cx q[0], q[1];

// Layer 2: parameterized Ry rotations
ry(0.3) q[0];
ry(0.6) q[1];

// In full VQE: a classical optimizer tunes these angles
// to minimize ⟨ψ(θ)|H_H2|ψ(θ)⟩ (ground state energy)
`,
  },

  // ─────────────────────────────────────────────────────────────────
  // 10. QUANTUM ERROR CORRECTION (BIT-FLIP)
  // ─────────────────────────────────────────────────────────────────
  "qec-bit-flip": {
    cirq: `import cirq
from algohub_runtime import report

# 5 qubits: q[0-2]=data qubits, q[3-4]=ancilla
q = cirq.LineQubit.range(5)

circuit = cirq.Circuit()

# Prepare state to protect: |+⟩
circuit.append(cirq.H(q[0]))

# Encoding: |ψ⟩ → |ψψψ⟩
circuit.append(cirq.CNOT(q[0], q[1]))
circuit.append(cirq.CNOT(q[0], q[2]))

# Inject error: bit-flip on q[1]
circuit.append(cirq.X(q[1]))

# Syndrome measurement using ancilla qubits
circuit.append(cirq.CNOT(q[0], q[3]))
circuit.append(cirq.CNOT(q[1], q[3]))
circuit.append(cirq.CNOT(q[1], q[4]))
circuit.append(cirq.CNOT(q[2], q[4]))

# Capture statevector before measurement
sim = cirq.Simulator()
sv = sim.simulate(circuit).state_vector()

# Error correction
circuit.append(cirq.CNOT(q[3], q[1]))

# Decoding
circuit.append(cirq.CNOT(q[0], q[2]))
circuit.append(cirq.CNOT(q[0], q[1]))

# Final measurement
circuit.append(cirq.measure(q[0], q[3], q[4], key='result'))

print("Cirq Quantum Error Correction (Bit-Flip) Circuit:")
print(circuit)

result = sim.run(circuit, repetitions=1000)
histogram = result.histogram(key='result')
counts = {format(k, '03b'): int(v) for k, v in histogram.items()}

print("\\nMeasurement Counts:", counts)
print("Error was detected and corrected!")

report(circuit=circuit, statevector=sv, counts=counts)
`,

    pennylane: `import pennylane as qml
from algohub_runtime import report

# 5 wires: 0-2=data, 3-4=ancilla
dev = qml.device("default.qubit", wires=5, shots=1000)

@qml.qnode(dev)
def circuit():
    # Prepare state to protect: |+⟩
    qml.Hadamard(wires=0)

    # Encoding: |ψ⟩ → |ψψψ⟩
    qml.CNOT(wires=[0, 1])
    qml.CNOT(wires=[0, 2])

    # Inject error: bit-flip on wire 1
    qml.PauliX(wires=1)

    # Syndrome measurement (ancilla qubits 3 and 4)
    qml.CNOT(wires=[0, 3])
    qml.CNOT(wires=[1, 3])
    qml.CNOT(wires=[1, 4])
    qml.CNOT(wires=[2, 4])

    # Error correction
    qml.CNOT(wires=[3, 1])

    # Decoding
    qml.CNOT(wires=[0, 2])
    qml.CNOT(wires=[0, 1])

    return qml.counts(wires=[0, 3, 4]), qml.state()

counts, state = circuit()

print("PennyLane Quantum Error Correction (Bit-Flip):")
print(qml.draw(circuit)())
print("\\nStatevector:", state)
print("\\nMeasurement Counts:", counts)
print("Error was detected and corrected!")

report(circuit=circuit, statevector=state, counts=counts)
`,

    openqasm: `// OpenQASM 3.0 — Quantum Error Correction (3-Qubit Bit-Flip Code)
// 3 data qubits + 2 ancilla qubits
// Executed via Qiskit OpenQASM 3 parser + AerSimulator

OPENQASM 3.0;
include "stdgates.inc";

qubit[5] q;   // q[0-2]=data, q[3-4]=ancilla
bit[3]  c;

// Prepare |+⟩ state (state to protect)
h q[0];

// Encoding: |ψ⟩ → |ψψψ⟩
cx q[0], q[1];
cx q[0], q[2];

// Inject bit-flip error on q[1]
x q[1];

// Syndrome measurement using ancilla qubits
cx q[0], q[3];
cx q[1], q[3];
cx q[1], q[4];
cx q[2], q[4];

// Measure ancilla to extract syndrome
c[0] = measure q[3];
c[1] = measure q[4];

// Error correction (correct q[1] if ancilla detected error)
cx q[3], q[1];

// Decoding
cx q[0], q[2];
cx q[0], q[1];

// Final measurement of logical qubit
c[2] = measure q[0];

// Original state recovered despite the error!
`,
  },
};

// ─────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────

/**
 * Returns the framework-specific code for a given algorithm.
 * Returns null if the framework is "qiskit" (Qiskit code lives in algorithmTemplates.js).
 *
 * @param {string} algoId      - Algorithm ID (e.g. "bell-state")
 * @param {string} frameworkId - Framework ID (e.g. "cirq", "pennylane", "openqasm")
 * @returns {string|null}
 */
export const getAlgorithmFrameworkCode = (algoId, frameworkId) => {
  if (!frameworkId || frameworkId === "qiskit") return null;
  return algoFrameworkCode[algoId]?.[frameworkId] || null;
};
