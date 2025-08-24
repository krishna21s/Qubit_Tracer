# qubit_tracer_prototype.py
# Single-file prototype for Qubit-Tracer (Bell + GHZ demos)
# - Falls back to numpy simulation if Qiskit not present
# - Computes full density matrix, does partial trace (numpy),
#   computes Bloch vectors, and saves Bloch sphere PNGs + summary.json

import numpy as np
from pathlib import Path
import json
import matplotlib.pyplot as plt

OUTPUT_DIR = Path("qubit_tracer_outputs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Try to import qiskit if available
USE_QISKIT = False
try:
    import qiskit
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
    USE_QISKIT = True
except Exception:
    USE_QISKIT = False

def bell_state_numpy():
    sv = np.zeros(4, dtype=complex)
    sv[0] = 1/np.sqrt(2)
    sv[3] = 1/np.sqrt(2)
    return sv

def ghz_state_numpy(n=3):
    dim = 2**n
    sv = np.zeros(dim, dtype=complex)
    sv[0] = 1/np.sqrt(2)
    sv[-1] = 1/np.sqrt(2)
    return sv

def density_matrix_from_statevector(sv):
    return np.outer(sv, sv.conj())

def partial_trace_single_qubit(rho, keep, n_qubits):
    # reshape to shape (2,)*2n
    dims = [2] * (2 * n_qubits)
    rho_reshaped = rho.reshape(dims)
    # reorder axes to bring target qubit pair forward
    axes = [keep, keep + n_qubits] + [i for i in range(n_qubits) if i != keep] + \
           [i + n_qubits for i in range(n_qubits) if i != keep]
    rho_perm = np.transpose(rho_reshaped, axes)
    dim_sub = 2 ** (n_qubits - 1)
    rho_final = rho_perm.reshape(2, 2, dim_sub, dim_sub)
    reduced = np.zeros((2, 2), dtype=complex)
    for i in range(dim_sub):
        reduced += rho_final[:, :, i, i]
    return reduced

def bloch_vector_from_density(rho):
    r01 = rho[0,1]
    x = 2 * np.real(r01)
    y = 2 * np.imag(r01)
    z = np.real(rho[0,0] - rho[1,1])
    return np.array([x, y, z], dtype=float)

def plot_bloch_sphere(vector, title, filename):
    fig = plt.figure(figsize=(5,5))
    ax = fig.add_subplot(111, projection='3d')
    u = np.linspace(0, 2 * np.pi, 60)
    v = np.linspace(0, np.pi, 30)
    xs = np.outer(np.cos(u), np.sin(v))
    ys = np.outer(np.sin(u), np.sin(v))
    zs = np.outer(np.ones_like(u), np.cos(v))
    ax.plot_surface(xs, ys, zs, rstride=4, cstride=4, color='c', alpha=0.08, linewidth=0)
    ax.quiver(0,0,0,1.05,0,0, length=1.0, color='r', linewidth=1)
    ax.quiver(0,0,0,0,1.05,0, length=1.0, color='g', linewidth=1)
    ax.quiver(0,0,0,0,0,1.05, length=1.0, color='b', linewidth=1)
    x,y,z = vector
    ax.quiver(0,0,0,x,y,z, length=1.0, color='k', linewidth=2)
    ax.set_xlim([-1,1]); ax.set_ylim([-1,1]); ax.set_zlim([-1,1])
    ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z')
    ax.set_title(title)
    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    plt.close(fig)

def run_demo_fixed():
    outputs = {}
    # Bell
    if USE_QISKIT:
        qc = QuantumCircuit(2)
        qc.h(0); qc.cx(0,1)
        sv = Statevector.from_instruction(qc).data
    else:
        sv = bell_state_numpy()
    rho = density_matrix_from_statevector(sv)
    red0 = partial_trace_single_qubit(rho, keep=0, n_qubits=2)
    red1 = partial_trace_single_qubit(rho, keep=1, n_qubits=2)
    bv0 = bloch_vector_from_density(red0)
    bv1 = bloch_vector_from_density(red1)
    plot_bloch_sphere(bv0, "Bell State - Qubit 0", OUTPUT_DIR / "bell_qubit0.png")
    plot_bloch_sphere(bv1, "Bell State - Qubit 1", OUTPUT_DIR / "bell_qubit1.png")
    outputs['bell'] = {...}  # (omitted for brevity in this display)

    # GHZ
    if USE_QISKIT:
        qc2 = QuantumCircuit(3)
        qc2.h(0); qc2.cx(0,1); qc2.cx(0,2)
        sv2 = Statevector.from_instruction(qc2).data
    else:
        sv2 = ghz_state_numpy(3)
    rho2 = density_matrix_from_statevector(sv2)
    for i in range(3):
        red = partial_trace_single_qubit(rho2, keep=i, n_qubits=3)
        bv = bloch_vector_from_density(red)
        plot_bloch_sphere(bv, f"GHZ State - Qubit {i}", OUTPUT_DIR / f"ghz_qubit{i}.png")
    # Save a summary.json with serialized complex values (real/imag)
    # ...
    print("Outputs saved to:", OUTPUT_DIR)

if __name__ == "__main__":
    run_demo_fixed()
