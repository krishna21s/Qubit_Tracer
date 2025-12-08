import json
import os
from typing import Any, Dict, Optional

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


def _statevector_to_bloch_vectors(statevector: Statevector, max_qubits: int = 6) -> Optional[list]:
    if statevector is None:
        return None

    try:
        dm = DensityMatrix(statevector)
    except Exception as e:
        print(f"[AlgoHub] Failed to create density matrix: {e}")
        return None

    num_qubits = dm.num_qubits
    print(f"[AlgoHub] Computing Bloch vectors for {num_qubits} qubit(s)")
    
    vectors = []
    
    # For single qubit, use the density matrix directly
    if num_qubits == 1:
        bloch = _density_to_bloch(dm)
        if bloch is not None:
            vectors.append(bloch)
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
                    print(f"[AlgoHub] Qubit {qubit_index} Bloch vector: {bloch}")
            except Exception as e:
                print(f"[AlgoHub] Failed to compute Bloch vector for qubit {qubit_index}: {e}")
                continue

    print(f"[AlgoHub] Total Bloch vectors computed: {len(vectors)}")
    return vectors if vectors else None


def _circuit_to_qasm(circuit: Optional[QuantumCircuit]) -> Optional[str]:
    if circuit is None:
        return None

    try:
        return qasm2_dumps(circuit)
    except Exception:
        try:
            return circuit.qasm()
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


def report(*, circuit: Optional[QuantumCircuit] = None, statevector: Any = None,
           counts: Optional[Dict[Any, Any]] = None, probabilities: Optional[Dict[str, float]] = None) -> None:
    """Persist structured execution data for AlgoHub visualisations."""
    result_path = os.environ.get(RESULT_PATH_ENV)
    if not result_path:
        return

    circuit_copy = circuit.copy() if isinstance(circuit, QuantumCircuit) else None

    statevector_obj = _to_statevector(statevector, circuit_copy)
    counts_norm = _normalise_counts(counts)
    probabilities_norm = probabilities or _counts_to_probabilities(counts_norm)
    bloch_vectors = _statevector_to_bloch_vectors(statevector_obj)
    openqasm = _circuit_to_qasm(circuit_copy)

    payload: Dict[str, Any] = {}
    if bloch_vectors is not None:
        payload["bloch_vectors"] = bloch_vectors
    if openqasm is not None:
        payload["openqasm"] = openqasm
    if counts_norm is not None:
        payload["counts"] = counts_norm
    if probabilities_norm is not None:
        payload["probabilities"] = probabilities_norm

    if statevector_obj is not None:
        payload["statevector"] = [
            {"real": float(np.real(amplitude)), "imag": float(np.imag(amplitude))}
            for amplitude in statevector_obj.data
        ]

    if payload:
        _safe_dump(result_path, payload)