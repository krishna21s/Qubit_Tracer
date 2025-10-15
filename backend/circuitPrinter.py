from qiskit import QuantumCircuit

# Create a circuit with 2 qubits and 2 classical bits
qc = QuantumCircuit(2, 2)

# Step 1: Apply Hadamard gate on the first qubit (creates superposition)
qc.h(0)

# Step 2: Apply CNOT gate with control qubit 0 and target qubit 1 (entangles them)
qc.cx(0, 1)

# Step 3 (optional): Measure both qubits
qc.measure([0, 1], [0, 1])

# Print the circuit
print(qc)
