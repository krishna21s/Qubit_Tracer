import json
import os
from typing import Any, Dict, Optional, Callable

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import DensityMatrix, Statevector, partial_trace
from qiskit.qasm2 import dumps as qasm2_dumps

RESULT_PATH_ENV = "ALGOHUB_RESULT_PATH"


def _to_statevector(statevector: Any, circuit: Optional[QuantumCircuit]) -> Optional[Statevector]:
    if statevector is not None:
        try:
            if isinstance(statevector, Statevector):
                return statevector
            return Statevector(statevector)
        except Exception:
            return None

    if circuit is None:
        return None

    try:
        dep_meas = circuit.remove_final_measurements(inplace=False)
    except Exception:
        dep_meas = circuit

    try:
        return Statevector.from_instruction(dep_meas)
    except Exception:
        return None


def _density_to_bloch(dm: DensityMatrix) -> Optional[list]:
    try:
        matrix = np.asarray(dm.data, dtype=complex)
        if matrix.shape != (2, 2):
            return None
        bloch_x = 2 * np.real(matrix[0, 1])
        bloch_y = -2 * np.imag(matrix[0, 1])
        bloch_z = np.real(matrix[0, 0] - matrix[1, 1])
        return [float(bloch_x), float(bloch_y), float(bloch_z)]
    except Exception:
        return None


def _density_matrix_to_serializable(dm: DensityMatrix) -> list:
    arr = np.asarray(dm.data, dtype=complex)
    res = []
    for row in arr:
        row_res = []
        for c in row:
            if abs(c.imag) < 1e-10:
                row_res.append(float(c.real))
            else:
                row_res.append([float(c.real), float(c.imag)])
        res.append(row_res)
    return res


def _statevector_to_bloch_and_density(statevector: Statevector, max_qubits: int = 6):
    if statevector is None:
        return None, None

    try:
        dm = DensityMatrix(statevector)
    except Exception as e:
        print(f"[AlgoHub] Failed to create density matrix: {e}")
        return None, None

    num_qubits = dm.num_qubits
    print(f"[AlgoHub] Computing Bloch vectors for {num_qubits} qubit(s)")
    
    vectors = []
    density_matrices = []
    
    # For single qubit, use the density matrix directly
    if num_qubits == 1:
        bloch = _density_to_bloch(dm)
        if bloch is not None:
            vectors.append(bloch)
            density_matrices.append(_density_matrix_to_serializable(dm))
            print(f"[AlgoHub] Single qubit Bloch vector: {bloch}")
    else:
        # For multi-qubit systems, trace out all OTHER qubits for each qubit
        for qubit_index in range(min(num_qubits, max_qubits)):
            try:
                # partial_trace traces out the specified qubits (removes them)
                # We want to keep qubit_index, so trace out all others
                qubits_to_trace_out = [i for i in range(num_qubits) if i != qubit_index]
                reduced = partial_trace(dm, qubits_to_trace_out)
                bloch = _density_to_bloch(reduced)
                if bloch is not None:
                    vectors.append(bloch)
                    density_matrices.append(_density_matrix_to_serializable(reduced))
                    print(f"[AlgoHub] Qubit {qubit_index} Bloch vector: {bloch}")
            except Exception as e:
                print(f"[AlgoHub] Failed to compute Bloch vector for qubit {qubit_index}: {e}")
                continue

    print(f"[AlgoHub] Total Bloch vectors computed: {len(vectors)}")
    return (vectors if vectors else None), (density_matrices if density_matrices else None)


def _statevector_to_bloch_vectors(statevector: Statevector, max_qubits: int = 6) -> Optional[list]:
    vecs, _ = _statevector_to_bloch_and_density(statevector, max_qubits)
    return vecs


def _circuit_to_qasm(circuit: Optional[Any]) -> Optional[str]:
    """Convert a Qiskit, Cirq, or PennyLane circuit into an OpenQASM 2.0 string."""
    if circuit is None:
        return None

    # 1. Qiskit
    if isinstance(circuit, QuantumCircuit):
        try:
            return qasm2_dumps(circuit)
        except Exception:
            try:
                return circuit.qasm()
            except Exception:
                return None

    # 2. Cirq
    try:
        import cirq
        if isinstance(circuit, cirq.AbstractCircuit):
            qasm_raw = cirq.qasm(circuit)
            # Filter comments like // Generated from Cirq
            lines = [l for l in qasm_raw.splitlines() if not l.strip().startswith("//")]
            return "\n".join(lines).strip()
    except Exception:
        pass

    # 3. PennyLane QNode / Tape
    try:
        import pennylane as qml
        if callable(circuit):
            tape = qml.workflow.construct_tape(circuit)()
            return qml.to_openqasm(tape).strip()
        elif hasattr(circuit, "tape"):
            return qml.to_openqasm(circuit.tape).strip()
    except Exception:
        pass

    return None


def _cirq_circuit_to_diagram(circuit: Any) -> Optional[str]:
    """Return a text diagram for a Cirq circuit."""
    try:
        import cirq  # noqa: F401 – conditional import
        return str(circuit)
    except Exception:
        return None


def _extract_statevector_from_pennylane(
    qnode_or_state: Any,
) -> Optional[np.ndarray]:
    """Extract a statevector array from a PennyLane state or QNode result."""
    try:
        arr = np.asarray(qnode_or_state, dtype=complex)
        if arr.ndim == 1:
            return arr
        # Sometimes it is a 2-D column vector
        if arr.ndim == 2 and 1 in arr.shape:
            return arr.flatten()
    except Exception:
        pass
    return None


def _extract_statevector_from_cirq(circuit: Any) -> Optional[np.ndarray]:
    """Simulate a Cirq circuit and return its statevector."""
    try:
        import cirq  # noqa: F401 – conditional import
        # Remove measurements for statevector simulation
        ops_without_meas = [
            op for moment in circuit for op in moment.operations
            if not isinstance(op.gate, cirq.MeasurementGate)
        ]
        clean_circuit = cirq.Circuit(ops_without_meas)
        result = cirq.Simulator().simulate(clean_circuit)
        sv = result.state_vector()
        return np.asarray(sv, dtype=complex).flatten()
    except Exception:
        return None


def _normalise_counts(counts: Optional[Dict[Any, Any]]) -> Optional[Dict[str, int]]:
    if not counts:
        return None

    normalised = {}
    for key, value in counts.items():
        try:
            key_str = str(key)
            normalised[key_str] = int(value)
        except Exception:
            continue

    return normalised or None


def _counts_to_probabilities(counts: Optional[Dict[str, int]]) -> Optional[Dict[str, float]]:
    if not counts:
        return None

    total = sum(counts.values())
    if not total:
        return None

    return {state: round(count / total, 6) for state, count in counts.items()}


def _safe_dump(path: str, payload: Dict[str, Any]) -> None:
    try:
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False)
    except Exception:
        pass


def report(
    *,
    circuit: Optional[Any] = None,
    statevector: Any = None,
    counts: Optional[Dict[Any, Any]] = None,
    probabilities: Optional[Dict[str, float]] = None,
) -> None:
    """Persist structured execution data for AlgoHub visualisations.

    Accepts Qiskit QuantumCircuit, Cirq circuits, PennyLane QNodes/state arrays,
    or plain NumPy statevector arrays.
    """
    result_path = os.environ.get(RESULT_PATH_ENV)
    if not result_path:
        return

    # --- Determine framework from the circuit type ---
    qiskit_circuit: Optional[QuantumCircuit] = None
    cirq_circuit: Optional[Any] = None

    if isinstance(circuit, QuantumCircuit):
        qiskit_circuit = circuit.copy()
    else:
        # Might be a Cirq circuit or a callable (PennyLane QNode)
        try:
            import cirq as _cirq
            if isinstance(circuit, _cirq.AbstractCircuit):
                cirq_circuit = circuit
        except ImportError:
            pass

    # --- Resolve statevector ---
    statevector_obj: Optional[Statevector] = None
    raw_sv: Optional[np.ndarray] = None  # for non-Qiskit sources

    if statevector is not None:
        # Check if it's a plain numpy / list array first
        if isinstance(statevector, (list, np.ndarray)):
            raw_sv = np.asarray(statevector, dtype=complex).flatten()
        elif isinstance(statevector, Statevector):
            statevector_obj = statevector
        else:
            # Try to wrap as Statevector
            try:
                statevector_obj = Statevector(statevector)
            except Exception:
                # Last resort: treat as raw array
                raw_sv = _extract_statevector_from_pennylane(statevector)

    if statevector_obj is None and raw_sv is None:
        # Try to derive from circuit
        if qiskit_circuit is not None:
            statevector_obj = _to_statevector(None, qiskit_circuit)
        elif cirq_circuit is not None:
            raw_sv = _extract_statevector_from_cirq(cirq_circuit)

    # Prefer Qiskit Statevector object; else try wrapping raw_sv
    if statevector_obj is None and raw_sv is not None:
        try:
            statevector_obj = Statevector(raw_sv)
        except Exception:
            pass  # keep raw_sv only

    # --- Build payload ---
    counts_norm = _normalise_counts(counts)
    probabilities_norm = probabilities or _counts_to_probabilities(counts_norm)
    bloch_vectors, density_matrices = _statevector_to_bloch_and_density(statevector_obj)
    
    # Extract OpenQASM from Qiskit, Cirq, or PennyLane circuit
    openqasm = _circuit_to_qasm(qiskit_circuit or circuit)

    payload: Dict[str, Any] = {}
    if bloch_vectors is not None:
        payload["bloch_vectors"] = bloch_vectors
    if density_matrices is not None:
        payload["density_matrices"] = density_matrices
    if openqasm is not None:
        payload["openqasm"] = openqasm
    if counts_norm is not None:
        payload["counts"] = counts_norm
    if probabilities_norm is not None:
        payload["probabilities"] = probabilities_norm

    # Statevector amplitudes (prefer Qiskit object, fall back to raw array)
    sv_data = statevector_obj.data if statevector_obj is not None else raw_sv
    if sv_data is not None:
        try:
            payload["statevector"] = [
                {"real": float(np.real(a)), "imag": float(np.imag(a))}
                for a in sv_data
            ]
            
            # Format amplitudes dictionary for Inspector component: { "00": { "re": ..., "im": ..., "prob": ... } }
            dim = len(sv_data)
            n_qubits = int(round(np.log2(dim))) if dim > 0 else 1
            payload["num_qubits"] = n_qubits
            amps = {}
            calc_probs = {}
            for idx, a in enumerate(sv_data):
                label = format(idx, f"0{n_qubits}b")
                re_val = float(np.real(a))
                im_val = float(np.imag(a))
                pr_val = float(re_val * re_val + im_val * im_val)
                amps[label] = {"re": re_val, "im": im_val, "prob": pr_val}
                calc_probs[label] = pr_val
            payload["amplitudes"] = amps
            if not payload.get("probabilities"):
                payload["probabilities"] = calc_probs
        except Exception as e:
            print(f"[AlgoHub] Error processing statevector amplitudes: {e}")

    if payload:
        _safe_dump(result_path, payload)


import atexit

def _auto_report():
    result_path = os.environ.get(RESULT_PATH_ENV)
    if not result_path or os.path.exists(result_path):
        return
    import sys
    main_mod = sys.modules.get("__main__")
    if not main_mod:
        return

    # Check for Qiskit circuits
    for var_name, var_val in reversed(list(main_mod.__dict__.items())):
        if isinstance(var_val, QuantumCircuit):
            try:
                report(circuit=var_val)
                return
            except Exception:
                pass

    # Check for Cirq circuits
    try:
        import cirq
        for var_name, var_val in reversed(list(main_mod.__dict__.items())):
            if isinstance(var_val, cirq.AbstractCircuit):
                try:
                    report(circuit=var_val)
                    return
                except Exception:
                    pass
    except ImportError:
        pass

    # Check for PennyLane QNodes
    try:
        import pennylane as qml
        for var_name, var_val in reversed(list(main_mod.__dict__.items())):
            if isinstance(var_val, qml.QNode) or callable(var_val) and hasattr(var_val, "device"):
                try:
                    report(circuit=var_val)
                    return
                except Exception:
                    pass
    except ImportError:
        pass

atexit.register(_auto_report)