
# qubit_tracer_animated_prototype.py
# Animated Bloch-sphere prototype for Qubit-Tracer (Bell + GHZ demos)
# - NumPy simulation (Qiskit optional)
# - Computes full density matrix, partial trace (numpy),
#   Bloch vector, and animated visualization (MP4/GIF)
#
# Usage:
#   python qubit_tracer_animated_prototype.py
# Optional args: --outdir, --frames, --fps, --circuit (bell|ghz|all)

import numpy as np
from pathlib import Path
import json
import argparse
import sys

import matplotlib
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401
import matplotlib.animation as animation

# Try optional Qiskit support
USE_QISKIT = False
try:
    from qiskit import QuantumCircuit
    from qiskit.quantum_info import Statevector

    USE_QISKIT = True
except Exception:
    USE_QISKIT = False


# ---------------------------
# Quantum simulation helpers
# ---------------------------
def bell_state_numpy():
    """(|00> + |11>)/sqrt(2)"""
    sv = np.zeros(4, dtype=complex)
    sv[0] = 1 / np.sqrt(2)
    sv[3] = 1 / np.sqrt(2)
    return sv


def ghz_state_numpy(n=3):
    """(|00..0> + |11..1>)/sqrt(2)"""
    dim = 2**n
    sv = np.zeros(dim, dtype=complex)
    sv[0] = 1 / np.sqrt(2)
    sv[-1] = 1 / np.sqrt(2)
    return sv


def density_matrix_from_statevector(sv):
    return np.outer(sv, sv.conj())


def partial_trace_single_qubit(rho, keep, n_qubits):
    """
    Reduced density matrix for qubit 'keep' (0-based, left-most is 0).
    rho is full 2^n x 2^n density matrix.
    """
    # reshape rho to (2,)*2n
    dims = [2] * (2 * n_qubits)
    rho_reshaped = rho.reshape(dims)
    # Build axis permutation: bring the keep qubit pair to front
    axes = (
        [keep, keep + n_qubits]
        + [i for i in range(n_qubits) if i != keep]
        + [i + n_qubits for i in range(n_qubits) if i != keep]
    )
    rho_perm = np.transpose(rho_reshaped, axes)
    dim_sub = 2 ** (n_qubits - 1)
    rho_final = rho_perm.reshape(2, 2, dim_sub, dim_sub)
    reduced = np.zeros((2, 2), dtype=complex)
    # trace over the other subsystem dims
    for i in range(dim_sub):
        reduced += rho_final[:, :, i, i]
    return reduced


def bloch_vector_from_density(rho):
    """
    From 2x2 density matrix rho compute Bloch vector (x,y,z)
    x = 2*Re(r01)
    y = 2*Im(r01)
    z = rho00 - rho11
    """
    r01 = rho[0, 1]
    x = 2 * np.real(r01)
    y = 2 * np.imag(r01)
    z = np.real(rho[0, 0] - rho[1, 1])
    return np.array([x, y, z], dtype=float)


# ---------------------------
# Visualization helpers
# ---------------------------
def setup_sphere(ax):
    """Draw a translucent Bloch sphere and axis arrows. Returns references to static artists."""
    u = np.linspace(0, 2 * np.pi, 80)
    v = np.linspace(0, np.pi, 40)
    xs = np.outer(np.cos(u), np.sin(v))
    ys = np.outer(np.sin(u), np.sin(v))
    zs = np.outer(np.ones_like(u), np.cos(v))
    surf = ax.plot_surface(
        xs, ys, zs, rstride=4, cstride=4, alpha=0.1, linewidth=0, color="cyan"
    )
    # axis arrows (as quivers). Keep references so we don't remove them later.
    ax_quiver_x = ax.quiver(0, 0, 0, 1.0, 0, 0, length=1.0, color="red", linewidth=1)
    ax_quiver_y = ax.quiver(0, 0, 0, 0, 1.0, 0, length=1.0, color="green", linewidth=1)
    ax_quiver_z = ax.quiver(0, 0, 0, 0, 0, 1.0, length=1.0, color="blue", linewidth=1)
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    return surf, (ax_quiver_x, ax_quiver_y, ax_quiver_z)


def animate_bloch(
    initial_vec, final_vec, title, out_path: Path, frames=80, fps=20, dpi=120
):
    """
    Create animation from initial_vec to final_vec. Saves to out_path (Path).
    Returns path to the saved file.
    """
    fig = plt.figure(figsize=(5, 5), dpi=dpi)
    ax = fig.add_subplot(111, projection="3d")
    ax.set_box_aspect([1, 1, 1])
    surf, _axes_quivers = setup_sphere(ax)
    ax.set_title(title)

    # draw initial arrow and keep reference so we can remove it each frame
    current_arrow = None

    def interp(t):
        # linear interpolation in vector space
        return initial_vec * (1 - t) + final_vec * t

    def update(frame):
        nonlocal current_arrow
        t = frame / (frames - 1)
        v = interp(t)
        # remove previous arrow artist if present
        if current_arrow is not None:
            try:
                current_arrow.remove()
            except Exception:
                # some backends return different artist types; ignore errors
                pass
        # draw new arrow
        current_arrow = ax.quiver(
            0, 0, 0, v[0], v[1], v[2], length=1.0, linewidth=2, color="black"
        )
        ax.set_title(f"{title}   t={t:.2f}")
        return []

    anim = animation.FuncAnimation(
        fig, update, frames=frames, interval=1000 / fps, blit=False
    )

    # Choose writer: prefer ffmpeg (mp4), else pillow (gif)
    writers = animation.writers.list()
    saved_path = out_path
    try:
        if "ffmpeg" in writers:
            Writer = animation.writers["ffmpeg"]
            writer = Writer(fps=fps, metadata=dict(artist="Qubit-Tracer"), bitrate=1800)
            anim.save(str(out_path.with_suffix(".mp4")), writer=writer)
            saved_path = out_path.with_suffix(".mp4")
        elif "pillow" in writers:
            anim.save(str(out_path.with_suffix(".gif")), writer="pillow", fps=fps)
            saved_path = out_path.with_suffix(".gif")
        else:
            # fallback: save frames to PNGs and warn the user
            frame_dir = out_path.parent / (out_path.stem + "_frames")
            frame_dir.mkdir(parents=True, exist_ok=True)
            for i in range(frames):
                update(i)
                fig.savefig(frame_dir / f"frame_{i:03d}.png")
            saved_path = frame_dir
            print("Saved individual frames to:", frame_dir)
    except Exception as e:
        print("Warning: failed to save animation with primary writers:", e)
        # as a fallback try pillow
        try:
            anim.save(str(out_path.with_suffix(".gif")), writer="pillow", fps=fps)
            saved_path = out_path.with_suffix(".gif")
        except Exception as e2:
            print("Final fallback failed:", e2)
            # save single final frame to PNG
            update(frames - 1)
            single = out_path.with_suffix(".png")
            fig.savefig(single)
            saved_path = single
            print("Saved single-frame PNG to:", single)

    plt.close(fig)
    return saved_path


# ---------------------------
# Utilities
# ---------------------------
def complex_serialize(x):
    """Serialize nested structure with complex numbers to real/imag dicts."""
    if isinstance(x, complex):
        return {"real": float(x.real), "imag": float(x.imag)}
    if isinstance(x, (list, tuple)):
        return [complex_serialize(v) for v in x]
    if isinstance(x, dict):
        return {k: complex_serialize(v) for k, v in x.items()}
    if isinstance(x, np.ndarray):
        return complex_serialize(x.tolist())
    # primitive
    return x


# ---------------------------
# Main demo runner
# ---------------------------
def run_demo(outdir: Path, frames=80, fps=20, which="all"):
    outdir.mkdir(parents=True, exist_ok=True)
    results = {}

    # initial Bloch vector for |0> (north pole)
    init_vec = np.array([0.0, 0.0, 1.0])

    do_bell = which in ("all", "bell")
    do_ghz = which in ("all", "ghz")

    if do_bell:
        # simulate Bell state
        if USE_QISKIT:
            qc = QuantumCircuit(2)
            qc.h(0)
            qc.cx(0, 1)
            sv = Statevector.from_instruction(qc).data
        else:
            sv = bell_state_numpy()
        rho = density_matrix_from_statevector(sv)
        red0 = partial_trace_single_qubit(rho, keep=0, n_qubits=2)
        red1 = partial_trace_single_qubit(rho, keep=1, n_qubits=2)
        bv0 = bloch_vector_from_density(red0)
        bv1 = bloch_vector_from_density(red1)

        p0 = Path(outdir) / "bell_qubit0"
        p1 = Path(outdir) / "bell_qubit1"
        saved0 = animate_bloch(
            init_vec, bv0, "Bell State - Qubit 0", p0, frames=frames, fps=fps
        )
        saved1 = animate_bloch(
            init_vec, bv1, "Bell State - Qubit 1", p1, frames=frames, fps=fps
        )

        results["bell"] = {
            "statevector": sv.tolist(),
            "rho_full": complex_serialize(rho),
            "reduced_q0": complex_serialize(red0),
            "reduced_q1": complex_serialize(red1),
            "bloch_q0": bv0.tolist(),
            "bloch_q1": bv1.tolist(),
            "animation_q0": str(saved0),
            "animation_q1": str(saved1),
        }

    if do_ghz:
        # simulate GHZ (3 qubits)
        if USE_QISKIT:
            qc = QuantumCircuit(3)
            qc.h(0)
            qc.cx(0, 1)
            qc.cx(0, 2)
            sv = Statevector.from_instruction(qc).data
        else:
            sv = ghz_state_numpy(3)
        rho = density_matrix_from_statevector(sv)
        reduced = []
        bloch_list = []
        anim_paths = []
        for i in range(3):
            red = partial_trace_single_qubit(rho, keep=i, n_qubits=3)
            bv = bloch_vector_from_density(red)
            p = Path(outdir) / f"ghz_qubit{i}"
            saved = animate_bloch(
                init_vec, bv, f"GHZ State - Qubit {i}", p, frames=frames, fps=fps
            )
            reduced.append(complex_serialize(red))
            bloch_list.append(bv.tolist())
            anim_paths.append(str(saved))
        results["ghz"] = {
            "statevector": sv.tolist(),
            "rho_full": complex_serialize(rho),
            "reduced": reduced,
            "bloch": bloch_list,
            "animations": anim_paths,
        }

    # Save summary.json
    with open(outdir / "animation_summary.json", "w") as f:
        json.dump(complex_serialize(results), f, indent=2)

    return results


# ---------------------------
# CLI
# ---------------------------
def parse_args():
    p = argparse.ArgumentParser(
        description="Qubit-Tracer animated prototype (Bell & GHZ demos)."
    )
    p.add_argument(
        "--outdir",
        type=str,
        default="qubit_tracer_animation_outputs",
        help="Output directory",
    )
    p.add_argument(
        "--frames", type=int, default=80, help="Number of frames in animation"
    )
    p.add_argument("--fps", type=int, default=20, help="Frames per second")
    p.add_argument(
        "--circuit",
        type=str,
        default="all",
        choices=["all", "bell", "ghz"],
        help="Which demo to run",
    )
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    outdir = Path(args.outdir)
    print("Using Qiskit:", USE_QISKIT)
    print("Output directory:", outdir.resolve())
    results = run_demo(outdir, frames=args.frames, fps=args.fps, which=args.circuit)
    print("Done. Results written to:", outdir.resolve())
    print("Summary (top-level keys):", list(results.keys()))
