"""
Step-by-step circuit execution simulator for AlgoHub
Provides gate-by-gate execution with intermediate quantum states
"""

from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
from qiskit.circuit import Instruction
from typing import List, Dict, Tuple, Optional
import numpy as np
import copy


class StepExecutor:
    """Execute quantum circuit step-by-step with state inspection"""
    
    def __init__(self, circuit: QuantumCircuit):
        """
        Initialize step executor
        
        Args:
            circuit: Quantum circuit to execute step-by-step
        """
        self.circuit = circuit
        self.num_qubits = circuit.num_qubits
        self.steps = []
        self._prepare_steps()
    
    def _prepare_steps(self):
        """Parse circuit into individual executable steps"""
        step_id = 0
        
        for instruction_index, (instruction, qargs, cargs) in enumerate(self.circuit.data):
            gate_name = instruction.name
            qubit_indices = [q._index for q in qargs]
            clbit_indices = [c._index for c in cargs] if cargs else []
            
            # Create step data
            step = {
                "id": step_id,
                "instruction_index": instruction_index,
                "gate": gate_name,
                "qubits": qubit_indices,
                "clbits": clbit_indices,
                "params": list(instruction.params) if hasattr(instruction, 'params') else [],
                "description": self._get_gate_description(gate_name, qubit_indices, instruction.params if hasattr(instruction, 'params') else []),
                "executed": False,
                "statevector": None,
                "bloch_vectors": None,
                "probabilities": None
            }
            
            self.steps.append(step)
            step_id += 1
    
    def _get_gate_description(self, gate_name: str, qubits: List[int], params: List) -> str:
        """Generate human-readable gate description"""
        if gate_name == 'h':
            return f"Apply Hadamard gate to qubit {qubits[0]}"
        elif gate_name == 'x':
            return f"Apply Pauli-X (NOT) gate to qubit {qubits[0]}"
        elif gate_name == 'y':
            return f"Apply Pauli-Y gate to qubit {qubits[0]}"
        elif gate_name == 'z':
            return f"Apply Pauli-Z gate to qubit {qubits[0]}"
        elif gate_name == 'cx':
            return f"Apply CNOT gate: control={qubits[0]}, target={qubits[1]}"
        elif gate_name == 'cz':
            return f"Apply CZ gate: control={qubits[0]}, target={qubits[1]}"
        elif gate_name == 'swap':
            return f"SWAP qubits {qubits[0]} and {qubits[1]}"
        elif gate_name == 'rx':
            angle = params[0] if params else 0
            return f"Rotate qubit {qubits[0]} around X-axis by {angle:.3f} radians"
        elif gate_name == 'ry':
            angle = params[0] if params else 0
            return f"Rotate qubit {qubits[0]} around Y-axis by {angle:.3f} radians"
        elif gate_name == 'rz':
            angle = params[0] if params else 0
            return f"Rotate qubit {qubits[0]} around Z-axis by {angle:.3f} radians"
        elif gate_name == 's':
            return f"Apply S gate (Z^½) to qubit {qubits[0]}"
        elif gate_name == 't':
            return f"Apply T gate (Z^¼) to qubit {qubits[0]}"
        elif gate_name == 'measure':
            return f"Measure qubit {qubits[0]} → classical bit {qubits[0]}"
        elif gate_name == 'barrier':
            return "Barrier (synchronization point)"
        else:
            return f"Apply {gate_name} gate to qubits {qubits}"
    
    def execute_step(self, step_index: int) -> Dict:
        """
        Execute a single step and capture quantum state
        
        Args:
            step_index: Index of step to execute (0-based)
            
        Returns:
            Step data with quantum state information
        """
        if step_index < 0 or step_index >= len(self.steps):
            raise ValueError(f"Step index {step_index} out of range [0, {len(self.steps)})")
        
        # Build circuit up to this step (excluding measurements)
        partial_circuit = QuantumCircuit(self.num_qubits, self.circuit.num_clbits)
        
        for i in range(step_index + 1):
            instruction_data = self.circuit.data[i]
            instruction = instruction_data.operation
            qargs = instruction_data.qubits
            cargs = instruction_data.clbits
            
            # Skip measurements for statevector computation
            if instruction.name != 'measure':
                partial_circuit.append(instruction, qargs, cargs)
        
        # Compute statevector
        try:
            statevector = Statevector.from_instruction(partial_circuit)
            
            # Extract Bloch vectors
            bloch_vectors = self._statevector_to_bloch(statevector)
            
            # Compute probabilities
            probabilities = self._compute_probabilities(statevector)
            
            # Update step data
            self.steps[step_index]["executed"] = True
            self.steps[step_index]["statevector"] = statevector.data.tolist()
            self.steps[step_index]["bloch_vectors"] = bloch_vectors
            self.steps[step_index]["probabilities"] = probabilities
            
            return self.steps[step_index]
        
        except Exception as e:
            print(f"[StepExecutor] Error executing step {step_index}: {e}")
            return {
                **self.steps[step_index],
                "error": str(e)
            }
    
    def _statevector_to_bloch(self, statevector: Statevector, max_qubits: int = 6) -> List[List[float]]:
        """Convert statevector to Bloch sphere coordinates"""
        num_qubits = statevector.num_qubits
        if num_qubits > max_qubits:
            num_qubits = max_qubits
        
        bloch_vectors = []
        dm = DensityMatrix(statevector)
        
        for qubit_index in range(num_qubits):
            if statevector.num_qubits == 1:
                reduced_dm = dm
            else:
                reduced_dm = partial_trace(dm, [i for i in range(statevector.num_qubits) if i != qubit_index])
            
            # Extract Bloch coordinates
            rho = reduced_dm.data
            x = 2 * np.real(rho[0, 1])
            y = 2 * np.imag(rho[0, 1])
            z = np.real(rho[0, 0] - rho[1, 1])
            
            bloch_vectors.append([float(x), float(y), float(z)])
        
        return bloch_vectors
    
    def _compute_probabilities(self, statevector: Statevector) -> Dict[str, float]:
        """Compute measurement probabilities"""
        probs = statevector.probabilities_dict()
        # Convert to regular float for JSON serialization
        return {state: float(prob) for state, prob in probs.items()}
    
    def execute_all_steps(self) -> List[Dict]:
        """Execute all steps and return complete execution trace"""
        for i in range(len(self.steps)):
            self.execute_step(i)
        return self.steps
    
    def execute_up_to(self, step_index: int) -> List[Dict]:
        """Execute steps from 0 to step_index"""
        results = []
        for i in range(step_index + 1):
            results.append(self.execute_step(i))
        return results
    
    def get_step_summary(self) -> Dict:
        """Get summary of all steps"""
        return {
            "total_steps": len(self.steps),
            "num_qubits": self.num_qubits,
            "steps": [
                {
                    "id": step["id"],
                    "gate": step["gate"],
                    "qubits": step["qubits"],
                    "description": step["description"]
                }
                for step in self.steps
            ]
        }


def execute_step_by_step(circuit: QuantumCircuit) -> Dict:
    """
    Main entry point for step-by-step execution
    
    Returns:
        Dictionary with step summary and full execution trace
    """
    executor = StepExecutor(circuit)
    summary = executor.get_step_summary()
    trace = executor.execute_all_steps()
    
    return {
        "summary": summary,
        "trace": trace
    }


def execute_single_step(circuit: QuantumCircuit, step_index: int) -> Dict:
    """
    Execute circuit up to a specific step
    
    Returns:
        Step data with quantum state at that point
    """
    executor = StepExecutor(circuit)
    return executor.execute_step(step_index)
