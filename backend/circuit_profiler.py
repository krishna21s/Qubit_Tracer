"""
Circuit profiling and analysis tools for AlgoHub
Provides execution metrics, optimization suggestions, and circuit statistics
"""

import ast
import re
from typing import Dict, List, Optional
from qiskit import QuantumCircuit, transpile
from qiskit.converters import circuit_to_dag
from qiskit_aer import AerSimulator


class CircuitProfiler:
    """Analyze quantum circuits for performance and optimization opportunities"""
    
    @staticmethod
    def analyze_circuit(circuit: QuantumCircuit) -> Dict:
        """Comprehensive circuit analysis"""
        
        dag = circuit_to_dag(circuit)
        
        analysis = {
            "basic_stats": {
                "num_qubits": circuit.num_qubits,
                "num_clbits": circuit.num_clbits,
                "depth": circuit.depth(),
                "size": circuit.size(),
                "num_nonlocal_gates": circuit.num_nonlocal_gates(),
                "width": circuit.width()
            },
            "gate_breakdown": CircuitProfiler._count_gates(circuit),
            "two_qubit_gates": CircuitProfiler._analyze_two_qubit_gates(circuit),
            "critical_path": dag.depth(),
            "optimization_suggestions": [],
            "complexity_score": "low",
            "estimated_runtime": "unknown"
        }
        
        # Calculate complexity score
        analysis["complexity_score"] = CircuitProfiler._calculate_complexity(analysis["basic_stats"])
        
        # Estimate runtime
        analysis["estimated_runtime"] = CircuitProfiler._estimate_runtime(analysis["basic_stats"])
        
        # Generate optimization suggestions
        analysis["optimization_suggestions"] = CircuitProfiler._suggest_optimizations(circuit, analysis)
        
        return analysis
    
    @staticmethod
    def _count_gates(circuit: QuantumCircuit) -> Dict[str, int]:
        """Count gates by type"""
        gate_counts = {}
        
        for instruction in circuit.data:
            gate_name = instruction.operation.name
            gate_counts[gate_name] = gate_counts.get(gate_name, 0) + 1
        
        return dict(sorted(gate_counts.items(), key=lambda x: x[1], reverse=True))
    
    @staticmethod
    def _analyze_two_qubit_gates(circuit: QuantumCircuit) -> Dict:
        """Analyze two-qubit gates (expensive operations)"""
        two_qubit_gates = []
        two_qubit_count = 0
        
        two_qubit_types = {'cx', 'cy', 'cz', 'ch', 'swap', 'iswap', 'crx', 'cry', 'crz', 'cp', 'cu', 'rzz'}
        
        for instruction in circuit.data:
            gate_name = instruction.operation.name
            if gate_name in two_qubit_types:
                two_qubit_count += 1
                qubits = [q._index for q in instruction.qubits]
                two_qubit_gates.append({
                    "gate": gate_name,
                    "qubits": qubits,
                    "control": qubits[0] if len(qubits) > 1 else None,
                    "target": qubits[1] if len(qubits) > 1 else None
                })
        
        return {
            "count": two_qubit_count,
            "gates": two_qubit_gates,
            "percentage": (two_qubit_count / max(circuit.size(), 1)) * 100
        }
    
    @staticmethod
    def _calculate_complexity(stats: Dict) -> str:
        """Calculate circuit complexity score"""
        score = 0
        
        # Weight factors
        score += stats["num_qubits"] * 2
        score += stats["depth"] * 1
        score += stats["num_nonlocal_gates"] * 3
        
        if score < 20:
            return "low"
        elif score < 50:
            return "medium"
        elif score < 100:
            return "high"
        else:
            return "very high"
    
    @staticmethod
    def _estimate_runtime(stats: Dict) -> str:
        """Estimate execution runtime"""
        # Rough estimation based on qubit count
        qubits = stats["num_qubits"]
        
        if qubits <= 3:
            return "< 1 second"
        elif qubits <= 5:
            return "1-5 seconds"
        elif qubits <= 8:
            return "5-30 seconds"
        elif qubits <= 12:
            return "30-300 seconds"
        else:
            return "> 5 minutes (may be slow)"
    
    @staticmethod
    def _suggest_optimizations(circuit: QuantumCircuit, analysis: Dict) -> List[Dict]:
        """Generate optimization suggestions"""
        suggestions = []
        
        stats = analysis["basic_stats"]
        gates = analysis["gate_breakdown"]
        two_qubit = analysis["two_qubit_gates"]
        
        # High two-qubit gate count
        if two_qubit["percentage"] > 50:
            suggestions.append({
                "type": "performance",
                "priority": "high",
                "issue": f"High two-qubit gate count: {two_qubit['count']} gates ({two_qubit['percentage']:.1f}%)",
                "suggestion": "Two-qubit gates are expensive. Consider alternative decompositions.",
                "benefit": "Reduce execution time by 20-40%"
            })
        
        # Large circuit depth
        if stats["depth"] > 20:
            suggestions.append({
                "type": "performance",
                "priority": "medium",
                "issue": f"Circuit depth is {stats['depth']}",
                "suggestion": "Try using transpile() with optimization_level=3 to reduce depth.",
                "benefit": "Shorter critical path, faster execution"
            })
        
        # Many single-qubit gates
        single_qubit_count = sum(v for k, v in gates.items() if k in ['h', 'x', 'y', 'z', 's', 't', 'rx', 'ry', 'rz'])
        if single_qubit_count > 50:
            suggestions.append({
                "type": "optimization",
                "priority": "low",
                "issue": f"Many single-qubit gates: {single_qubit_count}",
                "suggestion": "Qiskit transpiler can combine consecutive single-qubit gates.",
                "benefit": "Reduce gate count by 10-30%"
            })
        
        # Large qubit count
        if stats["num_qubits"] > 10:
            suggestions.append({
                "type": "resource",
                "priority": "high",
                "issue": f"Large qubit count: {stats['num_qubits']} qubits",
                "suggestion": "Simulation may be very slow. Consider reducing qubits or using matrix product state.",
                "benefit": "Exponentially faster for certain circuit types"
            })
        
        # Very high gate count
        if stats["size"] > 100:
            suggestions.append({
                "type": "complexity",
                "priority": "medium",
                "issue": f"Large circuit: {stats['size']} gates",
                "suggestion": "Break circuit into smaller subcircuits if possible.",
                "benefit": "Easier debugging and faster execution"
            })
        
        # No measurements
        if stats["num_clbits"] == 0:
            suggestions.append({
                "type": "functionality",
                "priority": "info",
                "issue": "No measurements in circuit",
                "suggestion": "Add measurements to see quantum results: qc.measure_all()",
                "benefit": "Observe quantum computation outcomes"
            })
        
        # Measurement without classical bits
        if 'measure' in gates and stats["num_clbits"] == 0:
            suggestions.append({
                "type": "error",
                "priority": "high",
                "issue": "Measurement without classical bits",
                "suggestion": "Add classical bits: QuantumCircuit(n_qubits, n_clbits)",
                "benefit": "Fix measurement error"
            })
        
        return suggestions
    
    @staticmethod
    def compare_circuits(original: QuantumCircuit, optimized: QuantumCircuit) -> Dict:
        """Compare two circuits (e.g., before/after optimization)"""
        
        orig_analysis = CircuitProfiler.analyze_circuit(original)
        opt_analysis = CircuitProfiler.analyze_circuit(optimized)
        
        comparison = {
            "depth_reduction": orig_analysis["basic_stats"]["depth"] - opt_analysis["basic_stats"]["depth"],
            "size_reduction": orig_analysis["basic_stats"]["size"] - opt_analysis["basic_stats"]["size"],
            "two_qubit_reduction": orig_analysis["two_qubit_gates"]["count"] - opt_analysis["two_qubit_gates"]["count"],
            "improvements": []
        }
        
        if comparison["depth_reduction"] > 0:
            comparison["improvements"].append(f"Reduced depth by {comparison['depth_reduction']} layers")
        
        if comparison["size_reduction"] > 0:
            comparison["improvements"].append(f"Removed {comparison['size_reduction']} gates")
        
        if comparison["two_qubit_reduction"] > 0:
            comparison["improvements"].append(f"Reduced two-qubit gates by {comparison['two_qubit_reduction']}")
        
        return comparison
    
    @staticmethod
    def optimize_circuit(circuit: QuantumCircuit, level: int = 3) -> QuantumCircuit:
        """Optimize circuit using Qiskit transpiler"""
        simulator = AerSimulator()
        optimized = transpile(circuit, simulator, optimization_level=level)
        return optimized


class CodeAnalyzer:
    """Analyze Python code for quantum circuit patterns"""
    
    @staticmethod
    def analyze_code_structure(code: str) -> Dict:
        """Analyze code structure and patterns"""
        
        analysis = {
            "imports": [],
            "circuit_definitions": [],
            "gate_calls": [],
            "measurements": [],
            "simulations": [],
            "visualization_calls": [],
            "code_quality": "good",
            "suggestions": []
        }
        
        try:
            tree = ast.parse(code)
            
            for node in ast.walk(tree):
                # Track imports
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        analysis["imports"].append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    for alias in node.names:
                        analysis["imports"].append(f"{module}.{alias.name}")
                
                # Track function calls
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Attribute):
                        func_name = node.func.attr
                        
                        # Gate calls
                        if func_name in ['h', 'x', 'y', 'z', 'cx', 'cz', 'swap', 'rx', 'ry', 'rz']:
                            analysis["gate_calls"].append(func_name)
                        
                        # Measurements
                        elif func_name in ['measure', 'measure_all']:
                            analysis["measurements"].append(func_name)
                        
                        # Simulations
                        elif func_name == 'run':
                            analysis["simulations"].append("simulator.run()")
                        
                        # Visualization
                        elif func_name == 'report':
                            analysis["visualization_calls"].append("report()")
            
            # Code quality assessment
            has_imports = len(analysis["imports"]) > 0
            has_gates = len(analysis["gate_calls"]) > 0
            has_viz = len(analysis["visualization_calls"]) > 0
            
            if not has_imports:
                analysis["code_quality"] = "needs_improvement"
                analysis["suggestions"].append("Add necessary imports (QuantumCircuit, etc.)")
            
            if not has_gates:
                analysis["code_quality"] = "minimal"
                analysis["suggestions"].append("Circuit has no gates - add some quantum operations")
            
            if has_gates and not has_viz:
                analysis["suggestions"].append("Add report() call to visualize results")
            
            if not analysis["measurements"]:
                analysis["suggestions"].append("Consider adding measurements to observe results")
            
        except SyntaxError as e:
            analysis["code_quality"] = "invalid"
            analysis["suggestions"].append(f"Syntax error: {str(e)}")
        
        return analysis


def profile_circuit(circuit: QuantumCircuit) -> Dict:
    """Main entry point for circuit profiling"""
    profiler = CircuitProfiler()
    return profiler.analyze_circuit(circuit)


def analyze_code(code: str) -> Dict:
    """Main entry point for code analysis"""
    analyzer = CodeAnalyzer()
    return analyzer.analyze_code_structure(code)
