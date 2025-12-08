"""
Advanced error analysis and debugging assistance for AlgoHub
Provides intelligent error suggestions and common mistake detection
"""

import re
from typing import Dict, List, Optional, Tuple


class ErrorAnalyzer:
    """Analyze quantum circuit errors and provide helpful suggestions"""

    # Common error patterns and their fixes
    ERROR_PATTERNS = [
        {
            "pattern": r"IndexError.*qubit.*out of range",
            "title": "Qubit Index Out of Range",
            "suggestion": "You're trying to access a qubit that doesn't exist. Check your circuit size and qubit indices.",
            "example": "If qc = QuantumCircuit(2, 2), valid indices are 0 and 1 only.",
            "fix_hint": "Increase circuit size or use valid qubit indices (0 to n-1)",
        },
        {
            "pattern": r"IndexError.*list index out of range",
            "title": "List Index Error",
            "suggestion": "Array or list access is out of bounds. Check your measurement indices.",
            "example": "qc.measure([0, 1, 2], [0, 1, 2]) requires at least 3 classical bits",
            "fix_hint": "Match classical bit count with measurement count",
        },
        {
            "pattern": r"NameError.*'([^']+)'.*not defined",
            "title": "Undefined Variable",
            "suggestion": "Variable '{match}' is not defined. Did you forget to import or define it?",
            "example": "Use 'np.pi' instead of 'pi' (needs 'import numpy as np')",
            "fix_hint": "Add missing import or define the variable",
        },
        {
            "pattern": r"AttributeError.*'QuantumCircuit'.*'([^']+)'",
            "title": "Invalid Gate or Method",
            "suggestion": "QuantumCircuit doesn't have method '{match}'. Check spelling or gate name.",
            "example": "Common gates: h, x, y, z, cx, cz, swap, rx, ry, rz",
            "fix_hint": "Verify gate name spelling and Qiskit version",
        },
        {
            "pattern": r"AttributeError.*'InstructionSet'.*'c_if'",
            "title": "Conditional Operation Syntax Error",
            "suggestion": "In Qiskit 1.0+, use .if_test() instead of .c_if() for conditional operations. The syntax has changed.",
            "example": "Old: qc.x(1).c_if(0, 1)\nNew: with qc.if_test((clbit, value)): qc.x(1)\nor use: qc.x(1).c_if(clbit, value) on the Instruction directly",
            "fix_hint": "Replace .c_if() with the new conditional syntax using .if_test() context manager",
        },
        {
            "pattern": r"AttributeError.*'InstructionSet'.*'([^']+)'",
            "title": "InstructionSet Method Error",
            "suggestion": "InstructionSet doesn't have method '{match}'. You may be trying to chain methods incorrectly.",
            "example": "Gates return InstructionSet objects. Use separate statements or proper chaining.",
            "fix_hint": "Break up chained operations or check Qiskit documentation for correct syntax",
        },
        {
            "pattern": r"TypeError.*takes (\d+) positional argument.*but (\d+)",
            "title": "Wrong Number of Arguments",
            "suggestion": "Function called with wrong number of arguments.",
            "example": "qc.rx(angle, qubit) requires 2 arguments: angle and qubit index",
            "fix_hint": "Check function signature and provide correct arguments",
        },
        {
            "pattern": r"CircuitError.*cannot apply.*to.*qubits",
            "title": "Gate Application Error",
            "suggestion": "Trying to apply a gate to wrong number of qubits.",
            "example": "CNOT requires exactly 2 qubits: qc.cx(control, target)",
            "fix_hint": "Match gate type with correct number of qubits",
        },
        {
            "pattern": r"QiskitError.*qasm.*not.*transpile",
            "title": "Transpilation Required",
            "suggestion": "Circuit needs to be transpiled before execution.",
            "example": "compiled = transpile(qc, simulator)",
            "fix_hint": "Add transpile() before simulator.run()",
        },
        {
            "pattern": r"ValueError.*operands could not be broadcast",
            "title": "Array Shape Mismatch",
            "suggestion": "Array dimensions don't match for the operation.",
            "example": "Check that arrays have compatible shapes for operations",
            "fix_hint": "Verify array dimensions before operations",
        },
        {
            "pattern": r"ModuleNotFoundError.*No module named '([^']+)'",
            "title": "Missing Module",
            "suggestion": "Module '{match}' is not installed or not in whitelist.",
            "example": "Only whitelisted modules can be imported: qiskit, numpy, matplotlib",
            "fix_hint": "Use allowed modules or request module addition",
        },
        {
            "pattern": r"ImportError.*cannot import name '([^']+)'",
            "title": "Import Error",
            "suggestion": "Cannot import '{match}' from module. Check spelling or Qiskit version.",
            "example": "from qiskit import QuantumCircuit, transpile",
            "fix_hint": "Verify import name and module path",
        },
        {
            "pattern": r"SyntaxError",
            "title": "Syntax Error",
            "suggestion": "Python syntax is invalid. Check brackets, colons, and indentation.",
            "example": "Common issues: missing colons after if/for, unmatched brackets",
            "fix_hint": "Review code syntax and indentation",
        },
        {
            "pattern": r"IndentationError",
            "title": "Indentation Error",
            "suggestion": "Inconsistent indentation. Python requires consistent spacing.",
            "example": "Use 4 spaces for each indentation level",
            "fix_hint": "Fix indentation to be consistent throughout",
        },
        {
            "pattern": r"ZeroDivisionError",
            "title": "Division by Zero",
            "suggestion": "Attempting to divide by zero.",
            "example": "Check denominators before division",
            "fix_hint": "Add validation to prevent division by zero",
        },
        {
            "pattern": r"KeyError.*'([^']+)'",
            "title": "Missing Dictionary Key",
            "suggestion": "Key '{match}' not found in dictionary.",
            "example": "Check if key exists before accessing: if key in dict",
            "fix_hint": "Verify key exists or use .get() method",
        },
        {
            "pattern": r"memory",
            "title": "Memory Error",
            "suggestion": "Circuit is too large or complex for available memory.",
            "example": "Reduce qubit count or use fewer shots",
            "fix_hint": "Simplify circuit or reduce simulation parameters",
        },
    ]

    # Common mistakes detection (code patterns)
    COMMON_MISTAKES = [
        {
            "pattern": r"qc\.measure\([^\)]+\).*\n.*qc\.(h|x|y|z|cx|rx|ry|rz)",
            "issue": "Applying gates after measurement",
            "suggestion": "Gates should be applied BEFORE measurement, not after.",
            "severity": "warning",
        },
        {
            "pattern": r"QuantumCircuit\((\d+),\s*(\d+)\).*\n.*qc\.measure\(\[([^\]]+)\]",
            "issue": "Measurement index mismatch",
            "suggestion": "Make sure measurement indices match classical bit count.",
            "severity": "warning",
        },
        {
            "pattern": r"simulator\.run\(qc,",
            "issue": "Missing transpile",
            "suggestion": "Consider transpiling circuit before execution: transpile(qc, simulator)",
            "severity": "info",
        },
        {
            "pattern": r"from\s+qiskit\s+import\s+.*\bpi\b",
            "issue": "Wrong pi import",
            "suggestion": "Use 'import numpy as np' and 'np.pi' instead of importing from qiskit",
            "severity": "info",
        },
    ]

    @staticmethod
    def analyze_error(error_text: str, code: str) -> Dict:
        """Analyze error and provide detailed debugging information"""

        analysis = {
            "error_type": "Unknown Error",
            "title": "Execution Error",
            "description": error_text,
            "suggestion": None,
            "example": None,
            "fix_hint": None,
            "severity": "error",
            "line_number": None,
        }

        # Extract line number from traceback
        line_match = re.search(r"line (\d+)", error_text)
        if line_match:
            analysis["line_number"] = int(line_match.group(1))

        # Match against known patterns
        for pattern_info in ErrorAnalyzer.ERROR_PATTERNS:
            match = re.search(pattern_info["pattern"], error_text, re.IGNORECASE)
            if match:
                analysis["error_type"] = pattern_info["title"]
                analysis["title"] = pattern_info["title"]

                # Replace {match} placeholder with captured group
                suggestion = pattern_info["suggestion"]
                if match.groups():
                    suggestion = suggestion.replace("{match}", match.group(1))

                analysis["suggestion"] = suggestion
                analysis["example"] = pattern_info.get("example")
                analysis["fix_hint"] = pattern_info.get("fix_hint")
                break

        return analysis

    @staticmethod
    def analyze_code(code: str) -> List[Dict]:
        """Detect common mistakes in code before execution"""

        issues = []

        for mistake in ErrorAnalyzer.COMMON_MISTAKES:
            if re.search(mistake["pattern"], code, re.MULTILINE):
                issues.append(
                    {
                        "issue": mistake["issue"],
                        "suggestion": mistake["suggestion"],
                        "severity": mistake["severity"],
                        "type": "code_smell",
                    }
                )

        # Check for missing report() call
        if "from algohub_runtime import report" not in code:
            issues.append(
                {
                    "issue": "Missing visualization import",
                    "suggestion": "Add 'from algohub_runtime import report' to enable visualizations",
                    "severity": "info",
                    "type": "missing_feature",
                }
            )

        # Check for missing statevector computation
        if "report(" in code and "Statevector" not in code:
            issues.append(
                {
                    "issue": "Report without statevector",
                    "suggestion": "Import Statevector and compute it for Bloch sphere visualization",
                    "severity": "info",
                    "type": "missing_feature",
                }
            )

        return issues

    @staticmethod
    def suggest_fix(error_type: str, code: str) -> Optional[str]:
        """Suggest a code fix for common errors"""

        fixes = {
            "Qubit Index Out of Range": lambda c: ErrorAnalyzer._suggest_qubit_fix(c),
            "Missing Module": lambda c: ErrorAnalyzer._suggest_import_fix(c),
            "Undefined Variable": lambda c: ErrorAnalyzer._suggest_variable_fix(c),
        }

        fix_func = fixes.get(error_type)
        if fix_func:
            return fix_func(code)

        return None

    @staticmethod
    def _suggest_qubit_fix(code: str) -> str:
        """Suggest fix for qubit index errors"""
        # Find QuantumCircuit initialization
        circuit_match = re.search(r"QuantumCircuit\((\d+)", code)
        if circuit_match:
            n_qubits = int(circuit_match.group(1))
            return f"Your circuit has {n_qubits} qubit(s). Valid indices are 0 to {n_qubits-1}."
        return "Check your circuit size in QuantumCircuit(n_qubits, n_bits)"

    @staticmethod
    def _suggest_import_fix(code: str) -> str:
        """Suggest fix for missing imports"""
        return "Common imports:\nfrom qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nimport numpy as np"

    @staticmethod
    def _suggest_variable_fix(code: str) -> str:
        """Suggest fix for undefined variables"""
        if "pi" in code and "import numpy" not in code:
            return "Add: import numpy as np\nThen use: np.pi"
        return "Make sure all variables are defined before use"

    @staticmethod
    def extract_relevant_lines(
        code: str, line_number: Optional[int], context: int = 3
    ) -> Tuple[str, int, int]:
        """Extract relevant code lines around error"""

        if not line_number:
            return code, 0, len(code.split("\n"))

        lines = code.split("\n")
        start = max(0, line_number - context - 1)
        end = min(len(lines), line_number + context)

        relevant_code = "\n".join(lines[start:end])
        return relevant_code, start + 1, end


def analyze_execution_error(error_text: str, code: str) -> Dict:
    """Main entry point for error analysis"""
    analyzer = ErrorAnalyzer()
    analysis = analyzer.analyze_error(error_text, code)

    # Add code context
    if analysis.get("line_number"):
        relevant_code, start_line, end_line = analyzer.extract_relevant_lines(
            code, analysis["line_number"]
        )
        analysis["code_context"] = relevant_code
        analysis["context_start_line"] = start_line
        analysis["context_end_line"] = end_line

    # Try to suggest a fix
    suggested_fix = analyzer.suggest_fix(analysis["error_type"], code)
    if suggested_fix:
        analysis["suggested_fix"] = suggested_fix

    return analysis


def analyze_code_quality(code: str) -> List[Dict]:
    """Analyze code for potential issues before execution"""
    return ErrorAnalyzer.analyze_code(code)
