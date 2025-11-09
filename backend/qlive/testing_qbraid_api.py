from qbraid import QbraidProvider
from qiskit import QuantumCircuit

API_KEY = "5wsijtkjk135guw5weow57o4a9j01y"

# Create provider
provider = QbraidProvider(api_key=API_KEY)

# List available devices
devices = provider.get_devices()
print("Found devices:", [d.id for d in devices])

# ✅ Use IonQ simulator instead of qbraid_qir_simulator
device = provider.get_device("ionq_simulator")

# Simple Bell-state circuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

# Run on IonQ simulator
print(f"Running on device: {device.id}")
jobs = device.run([qc], shots=1000)
result = jobs[0].result()
print("Result counts:", result.data.get_counts())
