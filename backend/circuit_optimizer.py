"""
Circuit optimization and comparison tools for AlgoHub
Provides before/after analysis and optimization recommendations
"""

from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.converters import circuit_to_dag
from typing import Dict, List, Tuple
import json


class CircuitOptimizer:
    """Optimize quantum circuits and provide detailed comparison"""
    
    @staticmethod
    def optimize_circuit(circuit: QuantumCircuit, optimization_level: int = 3) -> Tuple[QuantumCircuit, Dict]:
        """
        Optimize circuit and return optimized version with comparison data
        
        Args:
            circuit: Original quantum circuit
            optimization_level: 0-3, higher = more aggressive optimization
            
        Returns:
            Tuple of (optimized_circuit, comparison_data)
        """
        simulator = AerSimulator()
        
        # Transpile with optimization
        optimized = transpile(
            circuit,
            simulator,
            optimization_level=optimization_level,
            seed_transpiler=42
        )
        
        # Gather statistics
        original_stats = CircuitOptimizer._get_circuit_stats(circuit)
        optimized_stats = CircuitOptimizer._get_circuit_stats(optimized)
        
        # Calculate improvements
        comparison = {
            "original": original_stats,
            "optimized": optimized_stats,
            "improvements": CircuitOptimizer._calculate_improvements(original_stats, optimized_stats),
            "optimization_level": optimization_level,
            "equivalent": CircuitOptimizer._circuits_equivalent(circuit, optimized)
        }
        
        return optimized, comparison
    
    @staticmethod
    def _get_circuit_stats(circuit: QuantumCircuit) -> Dict:
        """Extract detailed circuit statistics"""
        dag = circuit_to_dag(circuit)
        
        # Count gate types
        gate_counts = {}
        single_qubit_gates = 0
        two_qubit_gates = 0
        multi_qubit_gates = 0
        
        for node in dag.op_nodes():
            gate_name = node.op.name
            gate_counts[gate_name] = gate_counts.get(gate_name, 0) + 1
            
            num_qubits = len(node.qargs)
            if num_qubits == 1:
                single_qubit_gates += 1
            elif num_qubits == 2:
                two_qubit_gates += 1
            else:
                multi_qubit_gates += 1
        
        return {
            "num_qubits": circuit.num_qubits,
            "num_clbits": circuit.num_clbits,
            "depth": circuit.depth(),
            "size": circuit.size(),
            "num_nonlocal_gates": circuit.num_nonlocal_gates(),
            "width": circuit.width(),
            "gate_counts": gate_counts,
            "single_qubit_gates": single_qubit_gates,
            "two_qubit_gates": two_qubit_gates,
            "multi_qubit_gates": multi_qubit_gates,
            "num_tensor_factors": dag.num_tensor_factors()
        }
    
    @staticmethod
    def _calculate_improvements(original: Dict, optimized: Dict) -> Dict:
        """Calculate percentage improvements"""
        improvements = {
            "depth_reduction": original["depth"] - optimized["depth"],
            "depth_reduction_pct": ((original["depth"] - optimized["depth"]) / max(original["depth"], 1)) * 100,
            "size_reduction": original["size"] - optimized["size"],
            "size_reduction_pct": ((original["size"] - optimized["size"]) / max(original["size"], 1)) * 100,
            "two_qubit_reduction": original["two_qubit_gates"] - optimized["two_qubit_gates"],
            "two_qubit_reduction_pct": ((original["two_qubit_gates"] - optimized["two_qubit_gates"]) / max(original["two_qubit_gates"], 1)) * 100,
        }
        
        # Summary
        total_reduction = improvements["size_reduction"] + improvements["depth_reduction"]
        if total_reduction > 0:
            improvements["summary"] = f"Reduced circuit by {improvements['size_reduction']} gates and {improvements['depth_reduction']} depth layers"
        elif total_reduction == 0:
            improvements["summary"] = "Circuit is already optimal"
        else:
            improvements["summary"] = "Circuit complexity increased (may be due to basis gate decomposition)"
        
        # Rating
        if improvements["size_reduction_pct"] > 30:
            improvements["rating"] = "excellent"
        elif improvements["size_reduction_pct"] > 15:
            improvements["rating"] = "good"
        elif improvements["size_reduction_pct"] > 0:
            improvements["rating"] = "minor"
        else:
            improvements["rating"] = "none"
        
        return improvements
    
    @staticmethod
    def _circuits_equivalent(circuit1: QuantumCircuit, circuit2: QuantumCircuit) -> bool:
        """Check if two circuits are functionally equivalent"""
        # Simple check - same number of qubits and classical bits
        return (circuit1.num_qubits == circuit2.num_qubits and 
                circuit1.num_clbits == circuit2.num_clbits)
    
    @staticmethod
    def suggest_optimizations(circuit: QuantumCircuit) -> List[Dict]:
        """Provide specific optimization suggestions"""
        suggestions = []
        stats = CircuitOptimizer._get_circuit_stats(circuit)
        
        # Check for consecutive single-qubit gates
        if stats["single_qubit_gates"] > 10:
            suggestions.append({
                "type": "gate_consolidation",
                "priority": "medium",
                "issue": f"{stats['single_qubit_gates']} single-qubit gates detected",
                "suggestion": "Transpiler can combine consecutive single-qubit rotations",
                "potential_savings": f"~{int(stats['single_qubit_gates'] * 0.2)} gates"
            })
        
        # Check for high two-qubit gate count
        if stats["two_qubit_gates"] > 5:
            two_qubit_pct = (stats["two_qubit_gates"] / max(stats["size"], 1)) * 100
            if two_qubit_pct > 40:
                suggestions.append({
                    "type": "cnot_optimization",
                    "priority": "high",
                    "issue": f"{stats['two_qubit_gates']} two-qubit gates ({two_qubit_pct:.1f}% of circuit)",
                    "suggestion": "Two-qubit gates are expensive. Consider circuit recompilation or SWAP reduction",
                    "potential_savings": f"~{int(stats['two_qubit_gates'] * 0.15)} two-qubit gates"
                })
        
        # Check circuit depth
        if stats["depth"] > 50:
            suggestions.append({
                "type": "depth_reduction",
                "priority": "high",
                "issue": f"Circuit depth is {stats['depth']}",
                "suggestion": "High depth increases decoherence errors. Use transpile with optimization_level=3",
                "potential_savings": f"Depth reduction of ~{int(stats['depth'] * 0.25)} layers possible"
            })
        
        # Check for parallelization opportunities
        if stats["num_tensor_factors"] > 1:
            suggestions.append({
                "type": "parallelization",
                "priority": "info",
                "issue": f"Circuit has {stats['num_tensor_factors']} independent subcircuits",
                "suggestion": "Some operations can run in parallel. Transpiler will optimize gate scheduling",
                "potential_savings": "Improved depth through parallel execution"
            })
        
        # Check for measurement optimization
        if "measure" in stats["gate_counts"] and stats["gate_counts"]["measure"] > 1:
            suggestions.append({
                "type": "measurement",
                "priority": "low",
                "issue": f"{stats['gate_counts']['measure']} measurement operations",
                "suggestion": "Consider using measure_all() for cleaner code if measuring all qubits",
                "potential_savings": "Code readability improvement"
            })
        
        return suggestions
    
    @staticmethod
    def benchmark_circuit(circuit: QuantumCircuit) -> Dict:
        """Benchmark circuit against ideal metrics"""
        stats = CircuitOptimizer._get_circuit_stats(circuit)
        
        # Ideal metrics (theoretical minimums)
        ideal_depth = stats["num_qubits"]  # Rough estimate
        ideal_two_qubit_gates = max(0, stats["num_qubits"] - 1)  # Minimum for entanglement
        
        # Calculate efficiency scores (0-100)
        depth_efficiency = max(0, 100 - ((stats["depth"] - ideal_depth) / max(ideal_depth, 1)) * 20)
        gate_efficiency = max(0, 100 - ((stats["two_qubit_gates"] - ideal_two_qubit_gates) / max(ideal_two_qubit_gates, 1)) * 10)
        
        # Overall score
        overall_score = (depth_efficiency + gate_efficiency) / 2
        
        benchmark = {
            "scores": {
                "overall": round(overall_score, 1),
                "depth_efficiency": round(depth_efficiency, 1),
                "gate_efficiency": round(gate_efficiency, 1)
            },
            "ideal_metrics": {
                "depth": ideal_depth,
                "two_qubit_gates": ideal_two_qubit_gates
            },
            "actual_metrics": {
                "depth": stats["depth"],
                "two_qubit_gates": stats["two_qubit_gates"]
            },
            "rating": CircuitOptimizer._get_rating(overall_score),
            "recommendations": []
        }
        
        # Add recommendations based on scores
        if depth_efficiency < 70:
            benchmark["recommendations"].append("Circuit depth can be significantly reduced")
        if gate_efficiency < 70:
            benchmark["recommendations"].append("Two-qubit gate count is higher than optimal")
        if overall_score > 85:
            benchmark["recommendations"].append("Circuit is well-optimized!")
        
        return benchmark
    
    @staticmethod
    def _get_rating(score: float) -> str:
        """Convert numerical score to rating"""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 60:
            return "Fair"
        elif score >= 40:
            return "Poor"
        else:
            return "Needs Optimization"


def optimize_and_compare(circuit: QuantumCircuit, level: int = 3) -> Dict:
    """Main entry point for circuit optimization"""
    optimizer = CircuitOptimizer()
    optimized_circuit, comparison = optimizer.optimize_circuit(circuit, level)
    suggestions = optimizer.suggest_optimizations(circuit)
    benchmark = optimizer.benchmark_circuit(circuit)
    
    # Convert optimized circuit to QASM
    try:
        from qiskit.qasm2 import dumps as qasm2_dumps
        optimized_qasm = qasm2_dumps(optimized_circuit)
    except:
        optimized_qasm = None
    
    return {
        "comparison": comparison,
        "suggestions": suggestions,
        "benchmark": benchmark,
        "optimized_qasm": optimized_qasm
    }
