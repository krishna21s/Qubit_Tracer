# qubit_tracer_live.py
"""
Qubit-Tracer (Live Python prototype)
- Live visualization of single-qubit reduced states on Bloch spheres
- Uses Qiskit if available to parse/run arbitrary circuits (OpenQASM support)
- Uses QuTiP for Bloch visualization if available, otherwise matplotlib 3D animation
- Input options: predefined 'bell', 'ghz', or paste OpenQASM when Qiskit is present.

Run:
    python qubit_tracer_live.py
"""

import sys
import time
import argparse
import numpy as np
from pathlib import Path

# Try to import Qiskit (optional)
USE_QISKIT = False
try:
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
    from qiskit.qasm2 import dumps

    USE_QISKIT = True
except Exception:
    USE_QISKIT = False

# Try to import QuTiP (optional)
USE_QUTIP = False
try:
    from qutip import Bloch, Qobj

    USE_QUTIP = True
except Exception:
    USE_QUTIP = False

# Matplotlib fallback
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
import matplotlib.animation as animation


# --------------------------
# Quantum state helpers
# --------------------------
def bell_state_numpy():
    # (|00> + |11>)/sqrt(2)
    sv = np.zeros(4, dtype=complex)
    sv[0] = 1 / np.sqrt(2)
    sv[3] = 1 / np.sqrt(2)
    return sv


def ghz_state_numpy(n=3):
    dim = 2**n
    sv = np.zeros(dim, dtype=complex)
    sv[0] = 1 / np.sqrt(2)
    sv[-1] = 1 / np.sqrt(2)
    return sv


def statevector_from_qiskit_circuit(qc):
    """Return statevector (numpy array) from Qiskit QuantumCircuit"""
    sv = Statevector.from_instruction(qc).data
    return sv


def density_matrix_from_statevector(sv):
    return np.outer(sv, sv.conj())


def partial_trace_numpy(rho, keep, n_qubits):
    # General partial trace for single qubit using numpy
    dims = [2] * (2 * n_qubits)
    rho_reshaped = rho.reshape(dims)
    axes = (
        [keep, keep + n_qubits]
        + [i for i in range(n_qubits) if i != keep]
        + [i + n_qubits for i in range(n_qubits) if i != keep]
    )
    rho_perm = np.transpose(rho_reshaped, axes)
    dim_sub = 2 ** (n_qubits - 1)
    rho_final = rho_perm.reshape(2, 2, dim_sub, dim_sub)
    reduced = np.zeros((2, 2), dtype=complex)
    for i in range(dim_sub):
        reduced += rho_final[:, :, i, i]
    return reduced


def bloch_vector_from_density(rho):
    # rho is 2x2 density matrix
    r01 = rho[0, 1]
    x = 2 * np.real(r01)
    y = 2 * np.imag(r01)
    z = np.real(rho[0, 0] - rho[1, 1])
    return np.array([x, y, z], dtype=float)


# --------------------------
# Visualization: QuTiP version
# --------------------------
def visualize_with_qutip(reduced_rhos, circuit_text):
    """
    reduced_rhos: list of 2x2 numpy arrays (reduced density matrices)
    circuit_text: str to display
    """
    # QuTiP Bloch takes vectors; we'll update them
    num = len(reduced_rhos)
    bloc_instances = []
    for i in range(num):
        b = Bloch()
        b.vector_color = ["k"]
        b.point_color = ["r"]
        b.width = 4
        b.show()
        bloc_instances.append(b)

    # QuTiP's Bloch uses render() to open windows; we will update points iteratively
    # Convert density matrices to bloch vectors
    bloch_vecs = [bloch_vector_from_density(r) for r in reduced_rhos]

    # initial vectors (north pole)
    init = np.array([0.0, 0.0, 1.0])
    steps = 100
    for t in range(steps + 1):
        alpha = t / steps
        for idx, b in enumerate(bloc_instances):
            v = (1 - alpha) * init + alpha * bloch_vecs[idx]
            # qubit Bloch expects [x,y,z] scaled to [-1,1]
            b.clear()
            b.add_vectors(v)
            b.render()
        # Show circuit text in console periodically (GUI text in QuTiP is more complex)
        if t == 0:
            print("Circuit:\n", circuit_text)
        time.sleep(0.02)  # smooth
    print("Visualization finished (QuTiP). Close windows manually to continue.")


# --------------------------
# Visualization: Matplotlib fallback
# --------------------------
def setup_matplotlib_axes(num_qubits):
    fig = plt.figure(figsize=(4 * num_qubits, 4))
    axes = []
    for i in range(num_qubits):
        ax = fig.add_subplot(1, num_qubits, i + 1, projection="3d")
        axes.append(ax)
    return fig, axes


def draw_sphere(ax):
    u = np.linspace(0, 2 * np.pi, 60)
    v = np.linspace(0, np.pi, 30)
    xs = np.outer(np.cos(u), np.sin(v))
    ys = np.outer(np.sin(u), np.sin(v))
    zs = np.outer(np.ones_like(u), np.cos(v))
    ax.plot_surface(xs, ys, zs, rstride=4, cstride=4, alpha=0.08, linewidth=0)
    # axes arrows
    ax.quiver(0, 0, 0, 1, 0, 0, length=1.0, color="r", linewidth=1)
    ax.quiver(0, 0, 0, 0, 1, 0, length=1.0, color="g", linewidth=1)
    ax.quiver(0, 0, 0, 0, 0, 1, length=1.0, color="b", linewidth=1)
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")


def visualize_with_matplotlib(
    reduced_rhos, circuit_text, animate=True, frames=120, interval=20
):
    num = len(reduced_rhos)
    fig, axes = setup_matplotlib_axes(num)
    # Title area for circuit text
    fig.suptitle("Qubit-Tracer — Circuit:\n" + circuit_text, fontsize=10)
    # Pre-draw spheres
    for ax in axes:
        draw_sphere(ax)

    # initial vectors and final vectors
    init = np.array([0.0, 0.0, 1.0])
    final_vs = [bloch_vector_from_density(rho) for rho in reduced_rhos]

    # arrows references
    arrows = []
    for ax in axes:
        # initial arrow from origin to init
        q = ax.quiver(
            0, 0, 0, init[0], init[1], init[2], length=1.0, color="k", linewidth=2
        )
        arrows.append(q)

    if not animate:
        # draw final vectors immediately
        for idx, ax in enumerate(axes):
            v = final_vs[idx]
            arrows[idx].remove()
            ax.quiver(0, 0, 0, v[0], v[1], v[2], length=1.0, color="k", linewidth=2)
        plt.show()
        return

    def update(frame):
        t = frame / (frames - 1)
        for idx, ax in enumerate(axes):
            v = init * (1 - t) + final_vs[idx] * t
            try:
                arrows[idx].remove()
            except Exception:
                pass
            arrows[idx] = ax.quiver(
                0, 0, 0, v[0], v[1], v[2], length=1.0, color="k", linewidth=2
            )
        return arrows

    ani = animation.FuncAnimation(
        fig, update, frames=frames, interval=interval, blit=False
    )
    plt.show()


# --------------------------
# Main orchestration
# --------------------------
def build_state_from_choice(choice, openqasm_text=None):
    """
    Return (n_qubits, statevector numpy array, circuit_text)
    choice: 'bell', 'ghz', 'custom'
    openqasm_text: when custom and qiskit present, specify OpenQASM as text
    """
    if choice == "bell":
        sv = bell_state_numpy()
        n = 2
        circ_text = "Bell circuit (H on q0, CX q0->q1)"
        return n, sv, circ_text
    if choice == "ghz":
        sv = ghz_state_numpy(3)
        n = 3
        circ_text = "GHZ circuit (H on q0, CX q0->q1, CX q0->q2)"
        return n, sv, circ_text
    if choice == "custom":
        if not USE_QISKIT:
            raise RuntimeError("Custom circuits (OpenQASM) require Qiskit installed.")
        if not openqasm_text:
            raise RuntimeError("No OpenQASM provided for custom circuit.")
        try:
            qc = QuantumCircuit.from_qasm_str(openqasm_text)
        except Exception as e:
            # attempt to parse as python Qiskit snippet? For simplicity, fail clearly
            raise RuntimeError(f"Failed to parse OpenQASM: {e}")
        sv = statevector_from_qiskit_circuit(qc)
        circ_text = dumps(qc)
        n = qc.num_qubits
        return n, sv, circ_text
    raise ValueError("Unknown choice")


def server_flow_interactive():
    print("Qubit-Tracer Live (Python prototype)")
    print(
        "Options: 'bell' (2 qubits), 'ghz' (3 qubits), 'custom' (OpenQASM when Qiskit is available)"
    )
    choice = input("Enter choice [bell/ghz/custom]: ").strip().lower()
    if choice not in ("bell", "ghz", "custom"):
        print("Invalid choice. Defaulting to 'bell'.")
        choice = "bell"
    openqasm_text = None
    if choice == "custom":
        if not USE_QISKIT:
            print("Qiskit is not installed. Install Qiskit to use custom circuits.")
            return
        print("Paste your OpenQASM text now (end with a single line 'END'):")
        lines = []
        while True:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
        openqasm_text = "\n".join(lines)

    n_qubits, sv, circuit_text = build_state_from_choice(
        choice, openqasm_text=openqasm_text
    )
    print(f"Simulated {n_qubits} qubits. Computing reduced states...")

    # full density matrix
    rho = density_matrix_from_statevector(sv)

    reduced = []
    for i in range(n_qubits):
        if USE_QISKIT:
            # prefer qiskit's partial_trace if available
            try:
                # convert to qiskit's DensityMatrix and partial_trace if possible
                dm = DensityMatrix(sv)
                # partial_trace expects an index or list of indices to trace out: we'll use qiskit's API
                # But we still perform numpy partial trace for robustness
                red = partial_trace_numpy(rho, keep=i, n_qubits=n_qubits)
            except Exception:
                red = partial_trace_numpy(rho, keep=i, n_qubits=n_qubits)
        else:
            red = partial_trace_numpy(rho, keep=i, n_qubits=n_qubits)
        reduced.append(red)

    # show circuit text and visualize
    if USE_QUTIP:
        print(
            "Using QuTiP for visualization (if windows, display may behave differently)."
        )
        visualize_with_qutip(reduced, circuit_text)
    else:
        print("QuTiP not available — using matplotlib fallback for live visualization.")
        visualize_with_matplotlib(reduced, circuit_text, animate=True)


# --------------------------
# CLI entry
# --------------------------
def main():
    parser = argparse.ArgumentParser(description="Qubit-Tracer live prototype")
    parser.add_argument(
        "--choice", type=str, default=None, help="circuit choice: bell, ghz, or custom"
    )
    parser.add_argument(
        "--qasm",
        type=str,
        default=None,
        help="OpenQASM text for custom circuit (only if Qiskit installed)",
    )
    args = parser.parse_args()

    # If choice passed via CLI, use non-interactive flow
    if args.choice:
        choice = args.choice.lower()
        if choice == "custom" and not args.qasm:
            print(
                "For custom circuits, pass --qasm '<openqasm string>' when using --choice custom."
            )
            return
        n_qubits, sv, circuit_text = build_state_from_choice(
            choice, openqasm_text=args.qasm
        )
        rho = density_matrix_from_statevector(sv)
        reduced = [
            partial_trace_numpy(rho, keep=i, n_qubits=n_qubits) for i in range(n_qubits)
        ]
        if USE_QUTIP:
            visualize_with_qutip(reduced, circuit_text)
        else:
            visualize_with_matplotlib(reduced, circuit_text, animate=True)
    else:
        # interactive prompt
        server_flow_interactive()


if __name__ == "__main__":
    main()