from qiskit import QuantumCircuit

# Number of qubits for GHZ state
n = 3  # You can change this to 4, 5, etc.

# Create quantum circuit with n qubits and n classical bits
qc = QuantumCircuit(n, n)

# Step 1: Apply Hadamard gate to the first qubit
qc.h(0)

# Step 2: Apply CNOTs from first qubit to all others
for i in range(1, n):
    qc.cx(0, i)

# Step 3 (optional): Measure all qubits
qc.measure(range(n), range(n))

# Print the circuit
print(qc)
