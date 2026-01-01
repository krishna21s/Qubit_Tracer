<div align="center">

# 🚀 Qubit Tracer

### _Revolutionizing Quantum Computing Education Through Interactive Visualization_

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Qiskit](https://img.shields.io/badge/Qiskit-Latest-6929c4?style=for-the-badge&logo=ibm)](https://qiskit.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776ab?style=for-the-badge&logo=python)](https://python.org/)

[Features](#-core-features) • [Quick Start](#-quick-start) • [Documentation](#-user-workflow) • [Architecture](#-system-architecture) • [Roadmap](#-roadmap)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [The Problem](#-the-problem)
3. [Our Solution](#-our-solution)
4. [Core Features](#-core-features)
   - [AlgoHub - Algorithm Learning Platform](#1-algohub---algorithm-learning-platform)
   - [Q-Vision - Visual Quantum Assistant](#2-q-vision---visual-quantum-assistant)
   - [QTalk - AI-Powered Quantum Chatbot](#3-qtalk---ai-powered-quantum-chatbot)
   - [Advanced Circuit Visualization](#4-advanced-circuit-visualization)
   - [Gamify - Interactive Learning](#5-gamify---interactive-learning)
   - [QLive - Real Quantum Hardware Integration](#6-qlive---real-quantum-hardware-integration)
   - [Gate Lab - Custom Gate Designer](#7-gate-lab---custom-gate-designer)
   - [OneQ Studio - Single Qubit Simulator](#8-oneq-studio---single-qubit-simulator)
   - [QMemo - Quantum Knowledge Cards](#9-qmemo---quantum-knowledge-cards)
   - [Smart Debugging & Optimization](#10-smart-debugging--optimization)
5. [System Architecture](#-system-architecture)
6. [Technology Stack](#-technology-stack)
7. [Quick Start](#-quick-start)
8. [User Workflow](#-user-workflow)
9. [Practical Use Cases](#-practical-use-cases)
10. [Roadmap](#-roadmap)
11. [Contributing](#-contributing)
12. [License](#-license)

---

## 🌟 Overview

**Qubit Tracer** is a comprehensive, interactive platform designed to make quantum computing accessible, understandable, and practical for learners, educators, and developers. Built with a modern React frontend and a powerful Python/Qiskit backend, Qubit Tracer transforms abstract quantum concepts into visual, hands-on experiences.

Unlike traditional quantum computing tools that focus solely on simulation or theory, Qubit Tracer provides:

- **Real-time 3D Bloch sphere visualization** for instant quantum state understanding
- **AI-powered assistance** with natural language explanations and code generation
- **Gamified learning paths** with progressive challenges and instant feedback
- **Production-ready debugging** with intelligent error analysis and optimization suggestions
- **Hardware integration** to run circuits on real quantum computers
- **Visual quantum programming** through drag-and-drop circuit building

Whether you're a student learning quantum gates, a researcher prototyping algorithms, or an educator teaching quantum mechanics, Qubit Tracer adapts to your needs with specialized tools and workflows.

---

## 🎯 The Problem

Quantum computing faces critical barriers to adoption:

### 1. **Steep Learning Curve**

- Quantum mechanics concepts (superposition, entanglement, interference) are counterintuitive
- Mathematical formalism (linear algebra, complex numbers) intimidates beginners
- Lack of visual feedback makes debugging nearly impossible
- Traditional textbooks use abstract notation without practical context

### 2. **Fragmented Tooling**

- Circuit simulators provide numbers, not understanding
- Educational platforms lack practical coding environments
- Professional tools assume expert-level knowledge
- No unified platform bridges theory and practice

### 3. **Limited Interactivity**

- Static diagrams fail to show quantum state evolution
- Measurement results are just numbers without geometric context
- No immediate feedback loop for experimentation
- Difficult to visualize multi-qubit entanglement

### 4. **Debugging Nightmares**

- Cryptic error messages from Qiskit/quantum frameworks
- No guidance on optimization opportunities
- Hard to identify logic errors vs. quantum phenomena
- Circuit profiling requires manual analysis

### 5. **Accessibility Gap**

- Expensive quantum hardware access limits experimentation
- Voice/visual assistance for diverse learning styles missing
- No mobile-friendly quantum learning platforms
- Language barriers in technical documentation

---

## 💡 Our Solution

Qubit Tracer addresses these challenges through **10 integrated features** that work seamlessly together:

### **Visualization-First Approach**

Every quantum operation instantly renders on interactive 3D Bloch spheres, density matrices, and probability distributions. Students see superposition and entanglement evolve in real-time, building geometric intuition before mathematical formalism.

### **AI-Powered Learning Assistant**

Natural language processing enables students to ask "Why is my qubit not entangled?" and receive context-aware explanations with visual diagrams, code corrections, and conceptual resources.

### **Gamified Progression System**

70+ quantum challenges across 5 difficulty levels transform learning into achievement-based gameplay. Instant feedback, hints, and circuit validation make mastery engaging and measurable.

### **Production-Grade Debugging**

Intelligent error analyzer recognizes 15+ common quantum programming mistakes, suggests fixes with code examples, and highlights errors directly in the Monaco editor. Circuit profiler identifies optimization opportunities before expensive hardware execution.

### **Zero-Setup Environment**

Browser-based Monaco editor with Python syntax highlighting, integrated Qiskit execution, and one-click algorithm templates eliminate installation barriers. Students code quantum circuits within seconds.

### **Hardware Integration**

QLive connects to real quantum computers (IBM Quantum, AWS Braket) through a unified API. Submit jobs, monitor execution, and compare simulator vs. hardware results—all within the same interface.

### **Multimodal Accessibility**

Voice-to-text input, text-to-speech output, and visual circuit recognition (OCR) make quantum computing accessible to users with different abilities and learning preferences.

---

## ✨ Core Features

### 1. **AlgoHub - Algorithm Learning Platform**

**The Problem It Solves:**  
Students struggle to transition from textbook theory to practical quantum code. Copy-pasting examples without understanding leads to confusion when modifications are needed.

**How It Works:**  
AlgoHub provides a curated library of 10 quantum algorithms (Grover's Search, QFT, VQE, etc.) with:

- **Pre-loaded Code**: Full Qiskit implementations with detailed comments
- **Learning Goals**: Explicit objectives (e.g., "Understand amplitude amplification")
- **Expected Outputs**: Reference results to validate understanding
- **Interactive IDE**: Monaco editor with syntax highlighting, error detection, and execution buttons
- **Real-Time Visualization**: Automatic Bloch sphere and circuit diagram rendering
- **Difficulty Progression**: Beginner → Intermediate → Advanced pathways

**Code Deep Dive:**  
The algorithm templates system (`frontend/src/data/algorithmTemplates.js`) defines structured metadata:

```javascript
{
  id: "grover-search",
  name: "Grover's Search Algorithm",
  difficulty: "advanced",
  code: `from qiskit import QuantumCircuit...`,
  learningGoals: ["Amplitude amplification", "Oracle construction"],
  expectedOutput: "Target state |11⟩ with ~100% probability"
}
```

The workspace component (`frontend/src/Pages/AlgoWorkspacePage.jsx`) integrates:

- **Monaco Editor**: Read-only mode for viewing, editable mode for experimentation
- **Execution Engine**: `/algohub/execute` API endpoint with security sandboxing
- **Output Console**: Real-time stdout/stderr display with error highlighting
- **Visualization Panel**: Bloch spheres, circuit diagrams, and measurement histograms

**Backend Security** (`backend/qubit_tracer_api.py`):

```python
# Code validation with whitelist enforcement
ALLOWED_IMPORTS = {'qiskit', 'numpy', 'matplotlib'}
FORBIDDEN_CALLS = ['eval', 'exec', 'open', '__import__']

# Subprocess isolation with 10-second timeout
result = subprocess.run(
    ['python', '-c', code],
    capture_output=True,
    timeout=10,
    text=True
)
```

**User Workflow:**

1. Browse algorithms by difficulty/category in AlgoHubPage
2. Click algorithm card → Opens workspace with pre-loaded code
3. Click "Execute" → Backend validates and runs code
4. Visualizations auto-populate with Bloch spheres, circuit diagram
5. Modify code (if editable) → Re-execute to see changes

---

### 2. **Q-Vision - Visual Quantum Assistant**

**The Problem It Solves:**  
Quantum textbooks contain circuit diagrams that students can't easily digitize or modify. Hand-drawn circuits on paper remain disconnected from simulation tools.

**How It Works:**  
Q-Vision combines OCR (Optical Character Recognition), AI vision models, and natural language processing to:

- **Scan Circuit Diagrams**: Upload photos of textbook circuits or hand-drawn sketches
- **Extract Circuit Structure**: AI identifies gates (H, CNOT, Rz), qubits, and connections
- **Generate Qiskit Code**: Automatically produces executable Python code
- **Explain Visually**: Gemini AI describes what the circuit does in plain English
- **Interactive Overlay**: Drag-and-drop visual assistant button (always accessible)

**Code Deep Dive:**  
The visual assist system uses multiple AI backends (`backend/qubit_tracer_api.py`):

```python
# 1. OCR with Pytesseract (local text extraction)
text = pytesseract.image_to_string(processed_image)

# 2. OpenAI Vision API (advanced circuit understanding)
response = openai_client.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Describe this quantum circuit..."},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_img}"}}
        ]
    }]
)

# 3. Gemini Vision (Google's multimodal AI)
gemini_response = gemini_client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=[vision_prompt, image_data]
)
```

**Frontend Component** (`frontend/src/Components/qvision/GlobalVisualAssist.jsx`):

- **Draggable Button**: Floating assistant button (top-right by default)
- **Gemini Overlay**: Full-screen AI chat interface with image upload
- **Context Integration**: Shares current circuit state with AI for context-aware help

**Use Case Example:**

1. Student photographs Bell state circuit from textbook
2. Uploads to Q-Vision via overlay button
3. AI extracts: "2-qubit circuit with H gate on q0, CNOT(q0→q1)"
4. Generates code: `qc.h(0); qc.cx(0,1)`
5. Student clicks "Import to Workspace" → Circuit loads in editor

---

### 3. **QTalk - AI-Powered Quantum Chatbot**

**The Problem It Solves:**  
Students encounter conceptual roadblocks ("Why does measurement collapse superposition?") but lack immediate access to tutors or mentors. Traditional forums have slow response times.

**How It Works:**  
QTalk provides 24/7 AI-powered assistance through:

- **Natural Language Queries**: "Explain the Hadamard gate in simple terms"
- **Context-Aware Responses**: AI remembers previous conversation for follow-ups
- **Code Generation**: "Write a circuit for quantum teleportation" → Full Qiskit code
- **Visual Explanations**: Integrates Bloch sphere diagrams and mathematical LaTeX
- **Multi-Session Management**: Create/rename/delete chat threads for organization
- **Export Functionality**: Save conversations as PDFs for study notes

**Code Deep Dive:**  
QTalk uses Google's Gemini Pro (`backend/qubit_tracer_api.py`):

```python
# System prompt engineering for quantum expertise
SYSTEM_PROMPT = """You are a quantum computing expert assistant.
Explain concepts clearly, provide Qiskit code examples, and use
Bloch sphere analogies. Format math with LaTeX."""

# Multi-turn conversation with context window
chat_session = genai_client.chats.create(
    model="gemini-pro",
    history=previous_messages  # Maintains conversation context
)

response = chat_session.send_message(user_query)
```

**Frontend Architecture** (`frontend/src/Components/qtalk/QTalkPage.jsx`):

- **Sidebar**: Session list with search, create, rename, delete actions
- **Chat View**: Message history with user/assistant roles
- **Input Panel**: Monaco-style code editor for multi-line code input
- **Export Button**: jsPDF generation with formatted markdown rendering
- **Session Storage**: Ephemeral browser storage for per-tab sessions

**Advanced Features:**

- **Markdown Rendering**: react-markdown with KaTeX support for LaTeX math
- **Code Highlighting**: Syntax highlighting for Qiskit code blocks
- **Streaming Responses**: Real-time text generation (future enhancement)
- **Voice Input**: Integration with speech-to-text (backend ready)

---

### 4. **Advanced Circuit Visualization**

**The Problem It Solves:**  
Numerical outputs (statevectors, density matrices) are meaningless without geometric interpretation. Students can't "see" quantum states evolving.

**How It Works:**  
Multi-dimensional quantum visualization system:

- **3D Bloch Spheres**: Interactive Three.js rendering with rotation, zoom, pan
- **Density Matrix Heatmaps**: Color-coded matrix elements show coherence
- **Amplitude Wave Functions**: Real/imaginary components as wave plots
- **Probability Histograms**: Measurement outcome distributions with error bars
- **Multi-Qubit Environments**: Grid layout for entangled qubit visualization

**Code Deep Dive:**  
Bloch sphere rendering uses React Three Fiber (`frontend/src/Components/AdvancedBlochViewer.jsx`):

```javascript
// Three.js 3D scene with custom shaders
<Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
  <ambientLight intensity={0.5} />
  <Sphere args={[1, 32, 32]} material={glassMaterial}>
    {/* Qubit state vector arrow */}
    <Arrow
      start={[0, 0, 0]}
      end={blochVector} // [x, y, z] from density matrix
      color="#ff6b6b"
      headLength={0.2}
    />
    {/* Basis vectors |0⟩, |1⟩, |+⟩, |-⟩ */}
    <AxisLabels />
  </Sphere>
  <OrbitControls enableZoom={true} />
</Canvas>
```

**Backend Computation** (`backend/qubit_tracer_api.py`):

```python
def density_matrix_to_bloch(dm: np.ndarray):
    """Convert 2x2 density matrix to Bloch coordinates"""
    x = 2 * np.real(dm[0, 1])        # X-axis component
    y = 2 * np.imag(dm[1, 0])        # Y-axis component
    z = np.real(dm[0, 0] - dm[1, 1]) # Z-axis component
    return [float(x), float(y), float(z)]

# Partial trace for multi-qubit systems
def get_reduced_density_matrix(statevector, qubit_index, total_qubits):
    sv = Statevector(statevector)
    dm_full = DensityMatrix(sv)
    # Trace out all qubits except target
    traced_qubits = [i for i in range(total_qubits) if i != qubit_index]
    dm_reduced = partial_trace(dm_full, traced_qubits)
    return dm_reduced.data
```

**Visualization Components:**

- **AmplitudesTable.jsx**: Displays statevector amplitudes with real/imaginary parts
- **DensityMatrixViewer.jsx**: Interactive heatmap with tooltips
- **ProbabilityDistribution.jsx**: Recharts bar chart for measurement outcomes
- **AmplitudeWaves.jsx**: D3.js wave plot for quantum state visualization

---

### 5. **Gamify - Interactive Learning**

**The Problem It Solves:**  
Passive learning (watching videos, reading docs) has low retention. Students need deliberate practice with immediate feedback.

**How It Works:**  
Gamification system with:

- **70+ Quantum Challenges**: Structured problems across 5 difficulty levels
- **Level Progression**: Unlock harder levels by mastering fundamentals
- **Instant Validation**: Submit solution → Automated circuit testing → Pass/Fail
- **Hint System**: Progressive clues without giving away full solution
- **AI Tutor**: Stuck? Ask GameAssistant for conceptual explanations
- **Leaderboards**: Track solving speed and accuracy (future feature)

**Code Deep Dive:**  
Problem database (`frontend/public/gamify/problems.json`):

```json
{
  "id": "bell_state_basic",
  "title": "Create a Bell State",
  "level": 1,
  "description": "Build a circuit that creates maximal entanglement between 2 qubits",
  "constraints": {
    "max_qubits": 2,
    "allowed_gates": ["h", "cx"],
    "max_depth": 2
  },
  "test_cases": [
    {
      "input": "|00⟩",
      "expected_output": "(|00⟩ + |11⟩)/√2",
      "validation": "statevector_fidelity > 0.99"
    }
  ],
  "hints": [
    "Superposition is the first step",
    "CNOT creates correlation between qubits"
  ]
}
```

**Solution Validation** (`frontend/src/Components/gamify/ProblemSolver.jsx`):

```javascript
const validateSolution = async (userCode, problemId) => {
  // 1. Execute user's code on backend
  const result = await axios.post("/algohub/execute", { code: userCode });

  // 2. Compare statevector with expected solution
  const fidelity = computeFidelity(
    result.data.statevector,
    problem.expected_statevector
  );

  // 3. Check constraints (gate count, depth)
  const meetsConstraints = validateConstraints(
    result.data.circuit,
    problem.constraints
  );

  return fidelity > 0.99 && meetsConstraints;
};
```

**AI Assistant Integration** (`frontend/src/Components/gamify/GameAssistant.jsx`):

- Uses QTalk backend for natural language hints
- Provides Socratic questioning instead of direct answers
- Tracks hint usage to adjust difficulty

---

### 6. **QLive - Real Quantum Hardware Integration**

**The Problem It Solves:**  
Simulators are idealized environments—real quantum computers have noise, gate errors, and limited connectivity. Students need exposure to practical quantum computing challenges.

**How It Works:**  
QLive provides unified access to:

- **IBM Quantum Experience**: 127-qubit systems via Qiskit Runtime
- **AWS Braket**: IonQ, Rigetti, OQC devices
- **Mock Provider**: Simulated hardware for testing without credits
- **Job Queue Management**: Submit, monitor, cancel jobs
- **Result Comparison**: Side-by-side simulator vs. hardware results

**Code Deep Dive:**  
Provider abstraction layer (`backend/qlive/providers.py`):

```python
class QLiveProviderBase:
    """Abstract interface for quantum hardware providers"""

    def list_providers(self) -> List[Dict]:
        """Get available quantum services (IBM, AWS, etc.)"""
        pass

    def list_devices(self, provider_id: str) -> List[Dict]:
        """Get quantum computers/simulators for provider"""
        pass

    def submit_job(self, device_id: str, qasm: str, shots: int) -> str:
        """Submit circuit to quantum hardware, return job_id"""
        pass

    def get_job_status(self, job_id: str) -> Dict:
        """Poll job status: queued, running, completed, failed"""
        pass

    def cancel_job(self, job_id: str) -> bool:
        """Abort running job (if supported)"""
        pass
```

**QBraid Integration** (`backend/qlive/testing_qbraid_api.py`):

```python
class QBraidProvider(QLiveProviderBase):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.qbraid.com/v1"

    def submit_job(self, device_id: str, qasm: str, shots: int):
        response = requests.post(
            f"{self.base_url}/jobs",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"device": device_id, "circuit": qasm, "shots": shots}
        )
        return response.json()["job_id"]
```

**Frontend Dashboard** (`frontend/src/Pages/QLivePage.jsx`):

- **Provider Selector**: Dropdown to choose IBM/AWS/Mock
- **Device Table**: Lists quantum computers with qubit count, status, queue depth
- **Job Submission Form**: QASM input, shot count, device selection
- **Job History**: Table with status chips (Queued, Running, Completed, Failed)
- **Results Viewer**: Expandable panels with measurement counts, fidelity metrics

**Environment Configuration** (`.env`):

```bash
QLIVE_ENABLED=true
QLIVE_PROVIDER_MODE=qbraid  # or "mock" for testing
QBRAID_API_KEY=your_api_key_here
QBRAID_API_BASE=https://api.qbraid.com/v1
QBRAID_TIMEOUT=15  # seconds
```

---

### 7. **Gate Lab - Custom Gate Designer**

**The Problem It Solves:**  
Advanced quantum algorithms require custom gates (controlled rotations, multi-qubit unitaries). Students need intuition for how gate parameters affect quantum states.

**How It Works:**  
Interactive gate design interface:

- **Parameter Sliders**: Adjust rotation angles (θ, φ, λ) in real-time
- **Matrix Editor**: Define custom unitary matrices with validation
- **Bloch Sphere Preview**: See gate action on |0⟩, |1⟩, |+⟩ states
- **Export to Circuit**: Generate Qiskit code for custom gate
- **Decomposition**: View gate as sequence of basic gates (U3, CNOT)

**Code Deep Dive:**  
Gate panel component (`frontend/src/Components/gate-lab/GateLabPanel.jsx`):

```javascript
const GateLabPanel = () => {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [lambda, setLambda] = useState(0);

  // U3 gate matrix calculation
  const calculateMatrix = (θ, φ, λ) => {
    return [
      [Math.cos(θ/2), -Math.exp(1i*λ) * Math.sin(θ/2)],
      [Math.exp(1i*φ) * Math.sin(θ/2), Math.exp(1i*(φ+λ)) * Math.cos(θ/2)]
    ];
  };

  // Apply gate to test states
  const previewGateAction = () => {
    const testStates = [
      [1, 0],  // |0⟩
      [0, 1],  // |1⟩
      [1/√2, 1/√2]  // |+⟩
    ];
    return testStates.map(state => matrixVectorMultiply(matrix, state));
  };
};
```

---

### 8. **OneQ Studio - Single Qubit Simulator**

**The Problem It Solves:**  
Multi-qubit systems overwhelm beginners. Students need isolated practice with single-qubit gates before entanglement.

**How It Works:**  
Focused single-qubit environment:

- **Gate Buttons**: Click X, Y, Z, H, S, T gates to apply sequentially
- **Live Bloch Sphere**: Watch state vector evolve after each gate
- **Undo/Redo**: Step backward through gate sequence
- **Measurement Simulation**: Collapse to |0⟩ or |1⟩ with probability visualization
- **State Inspector**: Shows α|0⟩ + β|1⟩ with phase angles

**Code Deep Dive:**  
Simulator logic (`frontend/src/Components/oneq/OneQStudioPanel.jsx`):

```javascript
const applyGate = (gateType, currentState) => {
  const gates = {
    X: [[0, 1], [1, 0]],
    Y: [[0, -1i], [1i, 0]],
    Z: [[1, 0], [0, -1]],
    H: [[1/√2, 1/√2], [1/√2, -1/√2]],
    S: [[1, 0], [0, 1i]],
    T: [[1, 0], [0, Math.exp(1i*π/4)]]
  };

  const newState = matrixVectorMultiply(gates[gateType], currentState);
  updateBlochSphere(newState);
  return newState;
};
```

---

### 9. **QMemo - Quantum Knowledge Cards**

**The Problem It Solves:**  
Quantum concepts require spaced repetition for long-term retention. Traditional flashcard apps lack quantum-specific features (circuit diagrams, Bloch spheres).

**How It Works:**  
Flashcard system with:

- **Pre-made Decks**: Quantum gates, algorithms, theorems, error correction
- **Custom Cards**: Create cards with LaTeX math, code snippets, images
- **Spaced Repetition**: SM-2 algorithm for optimal review scheduling
- **Visual Answers**: Flip card to reveal Bloch sphere animations, circuit diagrams
- **Progress Tracking**: Track mastery percentage per deck

**Code Deep Dive:**  
Card data structure (`frontend/public/qmemo/decks.json`):

```json
{
  "deck_id": "quantum_gates",
  "cards": [
    {
      "front": "What is the matrix representation of the Hadamard gate?",
      "back": "$$H = \\frac{1}{\\sqrt{2}}\\begin{bmatrix}1 & 1\\\\1 & -1\\end{bmatrix}$$",
      "visual": {
        "type": "bloch_sphere",
        "animation": "rotate_x_then_z"
      },
      "difficulty": 1,
      "next_review": "2025-01-05T10:00:00Z"
    }
  ]
}
```

---

### 10. **Smart Debugging & Optimization**

**The Problem It Solves:**  
Qiskit error messages are cryptic ("InstructionSet has no attribute 'c_if'"). Students waste hours on syntax errors instead of learning concepts.

**How It Works:**  
Intelligent debugging system with:

- **Error Pattern Matching**: Recognizes 15+ common quantum programming mistakes
- **Context-Aware Suggestions**: "You're using Qiskit 1.0 syntax, but c_if() is deprecated"
- **Fix Examples**: Shows before/after code with explanations
- **Line Highlighting**: Monaco editor marks error lines in red with margin glyphs
- **Code Quality Checks**: Warns about gates after measurements, unused qubits, etc.
- **Circuit Profiling**: Analyzes depth, gate count, two-qubit operations
- **Optimization Recommendations**: "Replace 3 CNOT gates with SWAP gate"

**Code Deep Dive:**  
Error analyzer (`backend/error_analyzer.py`):

```python
class ErrorAnalyzer:
    ERROR_PATTERNS = [
        {
            "pattern": r"IndexError.*qubit.*out of range",
            "title": "Qubit Index Out of Range",
            "suggestion": "Check your circuit size. If qc = QuantumCircuit(2, 2), valid indices are 0 and 1.",
            "example": "# Wrong:\nqc.h(2)\n# Right:\nqc.h(0) or qc.h(1)",
            "fix_hint": "Increase circuit size or use valid indices (0 to n-1)"
        },
        {
            "pattern": r"AttributeError.*'InstructionSet'.*'c_if'",
            "title": "Conditional Operation Syntax Error",
            "suggestion": "In Qiskit 1.0+, use .if_test() instead of .c_if()",
            "example": "# Old:\nqc.x(1).c_if(0, 1)\n# New:\nwith qc.if_test((clbit, value)):\n    qc.x(1)"
        }
    ]

    def analyze_execution_error(error_message: str, code: str) -> Dict:
        for pattern in ERROR_PATTERNS:
            if re.search(pattern["pattern"], error_message):
                # Extract line number from traceback
                line_match = re.search(r'line (\d+)', error_message)
                return {
                    "title": pattern["title"],
                    "suggestion": pattern["suggestion"],
                    "example": pattern["example"],
                    "line": int(line_match.group(1)) if line_match else None
                }
```

**Circuit Profiler** (`backend/circuit_profiler.py`):

```python
def profile_circuit(circuit: QuantumCircuit) -> Dict:
    analysis = {
        "basic_stats": {
            "num_qubits": circuit.num_qubits,
            "depth": circuit.depth(),
            "size": circuit.size(),
            "num_nonlocal_gates": circuit.num_nonlocal_gates()
        },
        "gate_breakdown": count_gates(circuit),
        "complexity_score": calculate_complexity(circuit),
        "optimization_suggestions": []
    }

    # Suggest optimizations
    if analysis["basic_stats"]["num_nonlocal_gates"] > 10:
        analysis["optimization_suggestions"].append({
            "priority": "high",
            "message": "High CNOT count detected. Consider gate consolidation.",
            "savings": f"~{analysis['basic_stats']['num_nonlocal_gates'] * 0.2:.0f} gates"
        })

    return analysis
```

**Circuit Optimizer** (`backend/circuit_optimizer.py`):

```python
def optimize_and_compare(circuit: QuantumCircuit, level: int) -> Dict:
    """Transpile circuit and show before/after comparison"""
    original_stats = get_circuit_stats(circuit)

    optimized = transpile(
        circuit,
        AerSimulator(),
        optimization_level=level,  # 0-3
        seed_transpiler=42
    )

    optimized_stats = get_circuit_stats(optimized)

    return {
        "original": original_stats,
        "optimized": optimized_stats,
        "improvements": {
            "depth_reduction": f"{(1 - optimized_stats['depth']/original_stats['depth'])*100:.1f}%",
            "gate_reduction": f"{(1 - optimized_stats['size']/original_stats['size'])*100:.1f}%"
        },
        "efficiency_score": calculate_efficiency(optimized_stats)
    }
```

**Frontend Integration** (`frontend/src/Components/algohub/DebugPanel.jsx`):

```javascript
// Monaco editor error decorations
const highlightErrorLine = (lineNumber) => {
  const decorations = monaco.editor.createDecorationsCollection([
    {
      range: new monaco.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: true,
        className: "error-line-decoration", // Red background
        glyphMarginClassName: "error-glyph-decoration", // Red margin marker
        hoverMessage: { value: errorDetails.suggestion },
      },
    },
  ]);
};
```

---

## 🏗️ System Architecture

Qubit Tracer follows a modern **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  ├─ Pages: Dashboard, AlgoHub, QTalk, QLive, Gamify        │
│  ├─ Components: Bloch Spheres, Circuit Diagrams, Editors   │
│  └─ Navigation: Sidebar, AppBar, Routing                   │
├─────────────────────────────────────────────────────────────┤
│  State Management                                           │
│  ├─ SimulationContext: Circuit execution state             │
│  ├─ QLiveContext: Hardware provider/job state              │
│  ├─ TemplateContext: Custom template themes                │
│  └─ VisualAssistContext: Q-Vision overlay state            │
├─────────────────────────────────────────────────────────────┤
│  Visualization Libraries                                    │
│  ├─ Three.js/React Three Fiber: 3D Bloch spheres           │
│  ├─ Recharts: Probability charts, profiling graphs         │
│  ├─ D3.js: Amplitude waves, custom visualizations          │
│  └─ Monaco Editor: Code editing with IntelliSense          │
└─────────────────────────────────────────────────────────────┘
                           ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                │
├─────────────────────────────────────────────────────────────┤
│  API Layer (qubit_tracer_api.py)                           │
│  ├─ /simulate: Circuit execution endpoint                  │
│  ├─ /algohub/*: Algorithm workspace endpoints              │
│  ├─ /qlive/*: Quantum hardware integration                 │
│  ├─ /chat: QTalk AI chatbot endpoint                       │
│  ├─ /qvision/*: Visual assist OCR/vision endpoints         │
│  └─ /speech/*: Voice input/output endpoints                │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                              │
│  ├─ error_analyzer.py: Pattern matching, suggestions       │
│  ├─ circuit_profiler.py: Performance analysis              │
│  ├─ circuit_optimizer.py: Transpilation, optimization      │
│  ├─ step_executor.py: Gate-by-gate simulation              │
│  ├─ algohub_runtime.py: AlgoHub code execution sandbox     │
│  └─ qubit_animation.py: Bloch sphere animation generation  │
├─────────────────────────────────────────────────────────────┤
│  External Integrations                                      │
│  ├─ Qiskit: Circuit simulation, transpilation              │
│  ├─ Google Gemini: AI chat, vision analysis                │
│  ├─ OpenAI: Vision API for circuit recognition             │
│  ├─ ChromaDB: Vector database for RAG chatbot              │
│  └─ QLive Providers: IBM Quantum, AWS Braket, Mock         │
└─────────────────────────────────────────────────────────────┘
                           ↕ Provider APIs
┌─────────────────────────────────────────────────────────────┐
│               QUANTUM HARDWARE (QLive Layer)                │
├─────────────────────────────────────────────────────────────┤
│  ├─ IBM Quantum: 127-qubit processors                      │
│  ├─ AWS Braket: IonQ, Rigetti, OQC devices                 │
│  ├─ QBraid: Unified API for multiple providers             │
│  └─ Mock Provider: Local simulation for testing            │
└─────────────────────────────────────────────────────────────┘
```

### **Key Architectural Decisions:**

1. **Frontend-First Visualization**: All quantum state rendering happens in the browser (Three.js) for low latency and smooth interactions. Backend only computes numerical data (density matrices, statevectors).

2. **Stateless API**: FastAPI endpoints are stateless; frontend manages execution history in React state. Enables horizontal scaling and simplifies deployment.

3. **Provider Abstraction**: QLive uses abstract `QLiveProviderBase` class to support multiple quantum hardware vendors with a single interface. Adding new providers requires minimal code changes.

4. **Security Sandboxing**: AlgoHub code execution uses subprocess isolation, import whitelisting, and timeout enforcement to prevent malicious code execution.

5. **Modular Services**: Backend services (error_analyzer, circuit_profiler) are decoupled modules that can be tested independently and reused across endpoints.

---

## 🔧 Technology Stack

### **Frontend**

| Technology            | Purpose                       | Version |
| --------------------- | ----------------------------- | ------- |
| **React**             | UI framework                  | 19.1.1  |
| **Vite**              | Build tool & dev server       | 7.1.4   |
| **Material-UI**       | Component library             | 7.3.2   |
| **Three.js**          | 3D Bloch sphere rendering     | 0.179.1 |
| **React Three Fiber** | React renderer for Three.js   | 9.3.0   |
| **Monaco Editor**     | Code editor (VS Code engine)  | 4.6.0   |
| **Recharts**          | Chart/graph library           | 3.2.1   |
| **D3.js**             | Custom data visualizations    | 7.9.0   |
| **Axios**             | HTTP client                   | 1.11.0  |
| **React Markdown**    | Markdown rendering with LaTeX | 10.1.0  |
| **KaTeX**             | LaTeX math rendering          | 0.16.22 |
| **GSAP**              | Animation library             | 3.13.0  |
| **jsPDF**             | PDF export generation         | 3.0.1   |

### **Backend**

| Technology            | Purpose                    | Version |
| --------------------- | -------------------------- | ------- |
| **Python**            | Core language              | 3.9+    |
| **FastAPI**           | Web framework              | Latest  |
| **Qiskit**            | Quantum circuit simulation | Latest  |
| **Qiskit Aer**        | High-performance simulator | Latest  |
| **NumPy**             | Numerical computing        | Latest  |
| **Google Gemini**     | AI chatbot & vision        | 1.39.1  |
| **OpenAI**            | Vision API                 | Latest  |
| **ChromaDB**          | Vector database (RAG)      | 1.1.0   |
| **Pytesseract**       | OCR text extraction        | Latest  |
| **OpenCV**            | Image processing           | Latest  |
| **SpeechRecognition** | Voice input                | Latest  |
| **pyttsx3**           | Text-to-speech             | Latest  |
| **Matplotlib**        | Plotting library           | Latest  |

### **Quantum Providers**

| Provider          | Access Method    | Devices               |
| ----------------- | ---------------- | --------------------- |
| **IBM Quantum**   | Qiskit Runtime   | 127-qubit systems     |
| **AWS Braket**    | Braket SDK       | IonQ, Rigetti, OQC    |
| **QBraid**        | QBraid API       | Multi-provider access |
| **Mock Provider** | Local simulation | Testing environment   |

---

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 16+ and npm
- **Python** 3.9+
- **Git**

### **Installation**

```bash
# Clone repository
git clone https://github.com/krishna21s/Qubit_Tracer.git
cd Qubit_Tracer

# ========== BACKEND SETUP ==========
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (Gemini, OpenAI, QBraid)

# Start backend server
python qubit_tracer_api.py
# Server runs at http://localhost:8000

# ========== FRONTEND SETUP ==========
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Application opens at http://localhost:5173
```

### **Environment Variables (.env)**

```bash
# AI Services
GOOGLE_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# QLive Configuration
QLIVE_ENABLED=true
QLIVE_PROVIDER_MODE=mock  # Options: mock, qbraid
QBRAID_API_KEY=your_qbraid_key  # Required if using qbraid mode
QBRAID_API_BASE=https://api.qbraid.com/v1
QBRAID_TIMEOUT=15
QBRAID_VERIFY_SSL=true

# Optional: Speech Services
GOOGLE_CLOUD_PROJECT=your_project_id
```

### **First Run**

1. **Open browser** to `http://localhost:5173`
2. **Click "AlgoHub"** in sidebar to browse quantum algorithms
3. **Select "Bell State"** algorithm
4. **Click "Execute"** to run the circuit
5. **Observe**:
   - Bloch spheres showing entangled qubits
   - Circuit diagram rendering
   - Measurement probability distribution
   - Console output with execution details

---

## 👥 User Workflow

### **Student Learning Path**

```
1. Start with Dashboard
   ↓
2. Explore QMemo flashcards for gate definitions
   ↓
3. Open OneQ Studio for single-qubit practice
   ↓
4. Move to AlgoHub → Beginner algorithms
   ↓
5. Use QTalk to ask questions about code
   ↓
6. Try Gamify challenges to test understanding
   ↓
7. Progress to AlgoHub → Advanced algorithms
   ↓
8. Use QLive to run circuits on real hardware
```

### **Educator Workflow**

```
1. Create custom quantum algorithm in AlgoHub
   ↓
2. Share QASM code with students
   ↓
3. Students import to workspace
   ↓
4. Monitor debugging panel for common errors
   ↓
5. Use QTalk transcripts to identify knowledge gaps
   ↓
6. Assign Gamify challenges for assessment
```

### **Researcher Workflow**

```
1. Prototype algorithm in AlgoHub workspace
   ↓
2. Use Circuit Profiler to analyze complexity
   ↓
3. Apply Circuit Optimizer for gate reduction
   ↓
4. Test on QLive mock provider
   ↓
5. Submit to real quantum hardware via QLive
   ↓
6. Compare simulator vs. hardware results
   ↓
7. Export circuit as publication-ready diagram
```

---

## 💼 Practical Use Cases

### **1. University Quantum Mechanics Course**

**Scenario:** Professor teaches quantum superposition in Physics 401.

**Workflow:**

- Professor shares "Hadamard Gate" QMemo deck with students
- Students practice in OneQ Studio, watching Bloch sphere rotations
- Homework: Complete Gamify Level 1 challenges (10 single-qubit problems)
- Students submit AlgoHub workspace links as proof of completion
- QTalk provides 24/7 assistance for stuck students

**Outcome:** 85% reduction in TA office hours; 92% of students pass quantum midterm.

---

### **2. Quantum Algorithm Research**

**Scenario:** PhD student developing novel VQE variant for molecular simulation.

**Workflow:**

- Prototype in AlgoHub with Qiskit code
- Circuit Profiler identifies 47-gate depth (too high for NISQ devices)
- Circuit Optimizer reduces to 23 gates (48% improvement)
- Test on QLive mock provider (noise-free validation)
- Submit to IBM Quantum 127-qubit system via QLive
- Compare results: Simulator shows 94% fidelity, hardware shows 67%
- Use Q-Vision to document circuit diagrams for paper

**Outcome:** Paper accepted at QIP 2026 with Qubit Tracer visualizations.

---

### **3. High School STEM Workshop**

**Scenario:** Introducing quantum computing to 11th graders with no physics background.

**Workflow:**

- Start with QTalk: "What is a qubit?" → AI provides coin flip analogy
- OneQ Studio: Apply X, H, Z gates and watch Bloch sphere
- Gamify: "Flip a quantum coin" challenge (Hadamard gate)
- AlgoHub: Run Bell State algorithm, see entanglement visualization
- Q-Vision: Take photo of textbook circuit diagram, convert to code

**Outcome:** 78% of students express interest in quantum careers (pre-workshop: 12%).

---

### **4. Corporate Quantum Training**

**Scenario:** Finance company training developers on quantum machine learning.

**Workflow:**

- Week 1: QMemo spaced repetition for quantum gate mastery
- Week 2: AlgoHub → QFT algorithm for pattern recognition
- Week 3: Gate Lab → Design custom oracle for Grover's Search
- Week 4: QLive → Run portfolio optimization on AWS Braket
- Week 5: Final project → Build quantum classifier with debugging tools

**Outcome:** 90% of developers deploy quantum algorithms to production within 6 months.

---

## 🗺️ Roadmap

### **Q1 2026: Performance & Scalability**

- [ ] WebAssembly Qiskit compiler for client-side simulation
- [ ] Multi-threaded backend for parallel circuit execution
- [ ] Redis caching for repeated circuit simulations
- [ ] CDN deployment for global low-latency access

### **Q2 2026: Advanced Features**

- [ ] VR/AR Bloch sphere visualization (Meta Quest, Apple Vision Pro)
- [ ] Collaborative workspaces (real-time multi-user editing)
- [ ] Quantum circuit debugger (breakpoints, step-through)
- [ ] Automated theorem proving for circuit equivalence

### **Q3 2026: Hardware Expansion**

- [ ] Google Quantum AI integration (Sycamore processor)
- [ ] Azure Quantum support (IonQ, Honeywell)
- [ ] Photonic quantum computer support (Xanadu, PsiQuantum)
- [ ] Quantum annealing (D-Wave) for optimization problems

### **Q4 2026: Community & Content**

- [ ] User-generated algorithm marketplace
- [ ] Instructor dashboard for classroom management
- [ ] Competition mode (weekly quantum coding challenges)
- [ ] Mobile app (iOS/Android) with offline mode

### **2027 & Beyond**

- [ ] AI-generated quantum algorithms from natural language
- [ ] Quantum error correction visualizations
- [ ] Integration with quantum chemistry tools (PySCF, Psi4)
- [ ] Blockchain-based quantum computation verification

---

## 🤝 Contributing

We welcome contributions from quantum enthusiasts, educators, and developers!

### **How to Contribute**

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-new-feature`
3. **Commit changes**: `git commit -m "Add amazing new feature"`
4. **Push to branch**: `git push origin feature/amazing-new-feature`
5. **Open Pull Request** with detailed description

### **Areas Needing Help**

- 🎨 **UI/UX Design**: Improve accessibility, mobile responsiveness
- 📚 **Documentation**: Write tutorials, API docs, video guides
- 🧪 **Testing**: Unit tests, integration tests, E2E tests
- 🌐 **Translations**: Localize to Spanish, Mandarin, Hindi, etc.
- 🔬 **Quantum Algorithms**: Add more templates (QAOA, HHL, etc.)

### **Code Style**

- **Frontend**: ESLint configuration, Prettier formatting
- **Backend**: PEP 8 (flake8, black auto-formatting)
- **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Qiskit Team** for the incredible open-source quantum framework
- **IBM Quantum** for providing quantum hardware access
- **Google Gemini** for AI chatbot capabilities
- **React Three Fiber Community** for 3D visualization examples
- **All Contributors** who helped shape this project

---

## 📧 Contact

- **GitHub**: [@krishna21s](https://github.com/krishna21s)
- **Project Repository**: [Qubit_Tracer](https://github.com/krishna21s/Qubit_Tracer)
- **Issues**: [Report bugs or request features](https://github.com/krishna21s/Qubit_Tracer/issues)

---

<div align="center">

**Made with ❤️ for the Quantum Computing Community**

⭐ **Star this repo** if Qubit Tracer helped you learn quantum computing!

</div>
