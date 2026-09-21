<div align="center">

# 🚀 Qubit Tracer

### _Revolutionizing Quantum Computing Education Through Interactive Visualization_

[![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Qiskit](https://img.shields.io/badge/Qiskit-1.x-6929c4?style=for-the-badge&logo=ibm)](https://qiskit.org/)
[![Cirq](https://img.shields.io/badge/Cirq-Google%20Quantum-0F9D58?style=for-the-badge&logo=google)](https://quantumai.google/cirq)
[![PennyLane](https://img.shields.io/badge/PennyLane-Xanadu-F36D00?style=for-the-badge)](https://pennylane.ai/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time%20Collab-000000?style=for-the-badge&logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Python](https://img.shields.io/badge/Python-3.9+-3776ab?style=for-the-badge&logo=python)](https://python.org/)

[Features](#-core-features) • [Technology Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Use Cases](#-practical-use-cases) • [Roadmap](#-roadmap)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [The Problem](#-the-problem)
3. [Our Solution](#-our-solution)
4. [Core Features](#-core-features)
   - [1. Q-Circuit Studio - Visual Circuit Designer & Real-Time Collaboration](#1-q-circuit-studio---visual-circuit-designer--real-time-collaboration)
   - [2. AlgoHub - Multi-Framework Algorithm Hub & Custom Builder](#2-algohub---multi-framework-algorithm-hub--custom-builder)
   - [3. Q-Vision - Visual Quantum Assistant](#3-q-vision---visual-quantum-assistant)
   - [4. QTalk - AI-Powered Quantum Chatbot](#4-qtalk---ai-powered-quantum-chatbot)
   - [5. Advanced Circuit Visualization](#5-advanced-circuit-visualization)
   - [6. Gamify - Interactive Learning](#6-gamify---interactive-learning)
   - [7. QLive - Real Quantum Hardware Integration](#7-qlive---real-quantum-hardware-integration)
   - [8. Gate Lab - Custom Gate Designer](#8-gate-lab---custom-gate-designer)
   - [9. OneQ Studio - Single Qubit Simulator](#9-oneq-studio---single-qubit-simulator)
   - [10. QMemo - Quantum Knowledge Cards](#10-qmemo---quantum-knowledge-cards)
   - [11. Smart Debugging & Optimization](#11-smart-debugging--optimization)
   - [12. User Authentication & Cloud Persistence](#12-user-authentication--cloud-persistence)
5. [Technology Stack](#-technology-stack)
6. [Quick Start](#-quick-start)
7. [Practical Use Cases](#-practical-use-cases)
8. [Roadmap](#-roadmap)
9. [Contributing](#-contributing)
10. [License](#-license)

---

## 🌟 Overview

**Qubit Tracer** is a comprehensive, interactive platform designed to make quantum computing accessible, understandable, and practical for learners, educators, and researchers. Built with a modern React frontend and a powerful Python quantum backend, Qubit Tracer transforms abstract quantum concepts into visual, hands-on experiences.

Unlike traditional quantum computing tools that focus solely on command-line simulations or dry mathematical formalism, Qubit Tracer provides:

- **Visual schematic circuit design** with one-click gate placement and live multi-user collaboration
- **Multi-framework quantum ecosystem** supporting Qiskit, Google Cirq, Xanadu PennyLane, and OpenQASM
- **Comprehensive multimodal algorithm learning** combining theoretical mathematics, video lectures, landmark research papers, and interactive code editors
- **Real-time 3D Bloch sphere visualization** for instant geometric quantum state intuition
- **AI-powered assistance** with natural language circuit synthesis, automated circuit explanations, and streaming code generation
- **Gamified learning paths** with progressive challenges, instant automated validation, and achievements
- **Production-ready debugging** with intelligent error pattern analysis and circuit optimization recommendations
- **Real quantum hardware integration** to submit and monitor circuits on IBM Quantum and AWS Braket QPUs
- **Cloud workspace & persistence** with secure user accounts, continuous auto-saving, and personal circuit libraries

---

## 🎯 The Problem

Quantum computing faces critical barriers to widespread adoption and education:

1. **Steep Learning Curve**: Quantum mechanics concepts (superposition, entanglement, interference, phase kickback) are deeply counterintuitive. Mathematical formalism without visual feedback intimidates beginners and slows down conceptual mastery.
2. **Fragmented Tooling**: Traditional circuit simulators output raw numbers without geometric meaning. Educational tools rarely offer real coding environments, while professional SDKs assume advanced domain expertise.
3. **Framework Lock-In**: Algorithms written in one SDK cannot easily be compared or translated into others (e.g., Qiskit vs. Cirq vs. PennyLane), isolating learners from the broader quantum software ecosystem.
4. **Lack of Real-Time Collaboration**: Quantum circuits are typically built in isolation. Teams, classrooms, and hackathon groups lack a unified space to design, inspect, and simulate circuits together in real time.
5. **Debugging & Optimization Roadblocks**: Cryptic error messages from quantum transpilers waste hours of development time. Beginners lack feedback on gate depth bottlenecks or opportunities to consolidate redundant gates.

---

## 💡 Our Solution

Qubit Tracer addresses these challenges through **12 integrated pillars** that work seamlessly together:

- **Visual Circuit Designer & Real-Time Collaboration (Q-Circuit Studio)**: A full schematic grid canvas with 18+ quantum gates, live multiplayer cursor tracking, spectator modes, and multi-framework code synchronization.
- **Multi-Framework Quantum Ecosystem (AlgoHub)**: Compare and run algorithms across Qiskit, Google Cirq, Xanadu PennyLane, and OpenQASM with automatic state extraction.
- **4-in-1 Multimodal Learning**: Explore each algorithm through theoretical mathematical proofs, curated video lectures, original research papers, and live code execution.
- **Custom Algorithm Builder**: Build custom circuits from scratch with a guided creation workflow, extensible quantum snippet templates, and continuous background auto-saving.
- **Visualization-First Understanding**: Every quantum operation renders on interactive 3D Bloch spheres, probability histograms, and statevector tables.
- **Generative AI Assistant**: Natural language prompt-to-circuit generation, circuit explanations, and animated streaming code creation.
- **Gamified Progression System**: 70+ structured challenges across 5 difficulty levels with instant circuit grading and progressive hints.
- **Intelligent Debugging & Optimization**: Pattern-matching error diagnostics with in-editor highlight markers, fix hints, and transpilation optimization analysis.
- **Real Hardware Connectivity (QLive)**: Submit circuits to real quantum computers and compare noise-free simulations with real hardware execution.
- **Focused Sandboxes (Gate Lab & OneQ Studio)**: Isolated single-qubit simulator and unitary gate designer for deep conceptual foundations.
- **Knowledge Retention (QMemo)**: Spaced repetition flashcards with animated visual answers and LaTeX formulas.
- **Cloud Workspace & User Profiles**: User registration, personal circuit libraries, sharing permissions, and custom profile settings.

---

## ✨ Core Features

### 1. **Q-Circuit Studio - Visual Circuit Designer & Real-Time Collaboration**

**The Problem It Solves:**  
Visual circuit builders are often static, single-user, and restricted to a single proprietary SDK. Teams, classrooms, and hackathon participants have had no intuitive way to co-create circuits live or see how visual schematics translate simultaneously into industry-standard quantum programming frameworks.

**Key Features & Capabilities:**

- **Interactive Schematic Grid Canvas**:
  - Responsive multi-qubit register grid with sequential time-step columns
  - Intuitive click-to-place and drag-and-drop gate placement with ghost previews and blue glow selection highlights
  - **18+ quantum gate primitives** spanning all major quantum operations:
    - *Single-Qubit Gates*: Hadamard ($H$), Pauli-$X$ (NOT), Pauli-$Y$, Pauli-$Z$, Phase ($S$), $T$, Identity ($I$)
    - *Multi-Qubit Entanglers*: Controlled-NOT ($CNOT$), Controlled-$Z$ ($CZ$), $SWAP$, and Toffoli ($CCX$)
    - *Parametric Rotations*: $R_x(\theta)$, $R_y(\theta)$, $R_z(\theta)$, and arbitrary unitary $U(\theta, \phi, \lambda)$ with live angle sliders ($0 \to 2\pi$), preset step marks ($\frac{\pi}{4}, \frac{\pi}{2}, \pi$), and real-time $2 \times 2$ unitary matrix computation
    - *Measurement & Structural Operations*: Measurement meters, multi-qubit barriers, and state reset operations
  - Full canvas control: Zoom in/out, fit to view, grid snapping, undo/redo history, and single-key shortcuts (`h`, `c`, `x`, `m`, `b`).

- **Real-Time Multi-User Collaboration**:
  - Full-duplex multiplayer collaboration rooms for team circuit design
  - **Live Remote Cursor Tracking**: Watch collaborators' mouse cursors move smoothly in real-time across the canvas with user name tags and unique color badges
  - **Collaborator Presence**: Active participant avatar cluster in the top bar showing everyone connected to the room
  - **Zero-Stutter State Sync**: Seamless state updates ensure all participants stay synchronized without race conditions or input delays
  - **Shareable Room Links & Permissions**: Generate share links with customizable access levels (collaborative edit access vs. view-only spectator mode with visual badges).

- **Multi-Framework Live Code Synchronization**:
  - Instant simultaneous bidirectional code generation across **4 frameworks**:
    - **Qiskit** (IBM Quantum Python)
    - **OpenQASM** (Hardware-agnostic intermediate representation)
    - **Google Cirq** (Google Quantum AI)
    - **Xanadu PennyLane** (Quantum ML & hybrid computation)
  - Watch generated code update live as gates are placed, edited, or moved on the visual canvas
  - Monaco code editor with syntax highlighting, one-click clipboard copying, and code file downloads.

- **AI Circuit Designer & Assistant**:
  - Conversational AI assistant for natural language circuit creation
  - Translate prompts into circuits (e.g., "Build a 3-qubit GHZ state", "Create a quantum teleportation circuit", "Entangle qubit 0 and 2 with an ancilla")
  - Automatically renders generated gates directly onto the visual canvas
  - **Live Code Streaming Effect**: Animates simulated line-by-line code typing directly in the editor for intuitive visual feedback.

- **Integrated Results & Analytics Dock**:
  - One-click instant simulation
  - **3D Bloch Spheres**: Interactive Three.js Bloch sphere for every individual qubit in the circuit
  - **Measurement Probabilities**: Outcome distribution bar charts with shot statistics
  - **Statevector Inspector**: Complex amplitude table displaying probability amplitudes ($|\alpha|^2 + |\beta|^2 = 1$)
  - **Circuit Profiler**: Live metrics for circuit depth, total gate count, and non-local gate ratios.

- **Export & Reporting Suite**:
  - High-resolution schematic diagram export in PNG format
  - Downloadable analytical PDF research reports with circuit metrics and simulation plots
  - Save circuits to personal cloud libraries with version history.

---

### 2. **AlgoHub - Multi-Framework Algorithm Hub & Custom Builder**

**The Problem It Solves:**  
Quantum algorithms are typically taught in isolation as textbook equations or disconnected code snippets. Learners lack a unified platform where they can study theoretical proofs, review original research literature, watch guided video lectures, and experiment with multi-framework code with live state visualizations. Developers also lack structured tools to construct custom algorithms from scratch.

**Key Features & Capabilities:**

- **Multi-Framework Quantum Ecosystem**:
  - First-class support for **4 major quantum frameworks**:
    - **Qiskit 1.x** (IBM Quantum)
    - **Google Cirq** (Google Quantum AI)
    - **Xanadu PennyLane** (Quantum ML & hybrid computing)
    - **OpenQASM 3.0** (Open standard quantum assembly)
  - One-click **Framework Switcher Dropdown** across all algorithms and custom workspaces
  - Automatically reconfigures starter code, gate representations, and simulation routines for the chosen SDK
  - Curated library of foundational algorithms across beginner, intermediate, and advanced tiers (Grover's Search, Shor's Algorithm, Quantum Fourier Transform, Quantum Teleportation, Bell States, GHZ State, Deutsch-Jozsa, Variational Quantum Eigensolver, and Quantum Error Correction).

- **4-in-1 Multimodal Learning Modalities Per Algorithm**:
  Every algorithm in the library offers four synchronized perspectives:
  1. **Concept & Theory Deep-Dive**: Rigorous theoretical foundations, Dirac bracket notation, matrix representations, and visual step-by-step circuit mechanics explaining the origin of quantum speedups.
  2. **Curated Video Lecture Hub**: Hand-selected video lectures with chapter outlines, timestamps, and concise core concept notes.
  3. **Landmark Academic Papers Library**: Direct access to original literature (e.g., Shor 1994, Grover 1996, Peruzzo et al. 2014 VQE) with abstracts, key takeaways, and copy-ready BibTeX citations.
  4. **Interactive Monaco Code IDE**: Full-featured code editor with syntax highlighting, framework switching, execution console, and the 3-tab **Execution Results Modal** (3D Bloch Spheres, Circuit Inspector, and Debugger).

- **Custom Build Studio**:
  - Build bespoke quantum circuits from scratch with a guided step-by-step panel
  - **Extensible Quantum Snippet Library**: One-click insertion of verified code templates for state preparation, superpositions, entanglement pairs, phase estimation, oracles, and measurements
  - **Continuous 30-Second Auto-Save**: Background auto-save protects against lost work, with cloud saving to personal profile
  - **Circuit Library & Version History**: Save named circuits, load previous drafts, restore historical versions, and export/import as JSON or raw Python.

- **Universal Multi-Qubit Visualization**:
  - Automated state extraction: Isolates individual qubits from multi-qubit systems and renders 3D Bloch coordinates for systems up to 6 qubits across all supported frameworks
  - Normalized measurement counts and outcome probability distributions.

- **Intelligent Debugging & Circuit Profiling**:
  - Static code analyzer detecting 15+ common quantum pitfalls (e.g., gates applied after measurement, deprecated methods, excessive depth)
  - Monaco editor line decorations with red indicators and hoverable fix hints
  - Circuit profiler calculating depth, total gates, two-qubit gate ratio, and gate consolidation opportunities.

---

### 3. **Q-Vision - Visual Quantum Assistant**

**The Problem It Solves:**  
Textbooks, lecture slides, and handwritten notes contain circuit diagrams that learners cannot easily test or modify in code. Recreating them manually is slow and prone to indexing errors.

**Key Features & Capabilities:**

- **Visual Circuit Recognition**: Upload photos of printed textbook diagrams, whiteboards, or hand-drawn sketches
- **Automated Code Extraction**: AI vision models identify quantum gates, wire registers, and target connections to produce clean, executable quantum code
- **Plain-English Explanations**: Multimodal AI explains the recognized circuit's purpose, operational steps, and expected output state
- **Floating Global Assistant**: Draggable overlay button accessible from any page to quickly scan circuits and import them directly into workspace editors.

---

### 4. **QTalk - AI-Powered Quantum Chatbot**

**The Problem It Solves:**  
Quantum computing introduces complex linear algebra and non-intuitive physical phenomena. Learners frequently encounter conceptual roadblocks without immediate access to mentors or tutors.

**Key Features & Capabilities:**

- **24/7 Quantum AI Tutor**: Ask theoretical questions ("Why does phase kickback work?"), request circuit examples ("Write a circuit for quantum teleportation"), or debug confusing errors
- **Context-Aware Conversations**: Multi-turn chat memory retains context throughout discussions for seamless follow-up questions
- **Rich LaTeX Math & Visual Analogies**: Formulas render cleanly in LaTeX accompanied by intuitive geometric analogies and Bloch sphere interpretations
- **Multi-Session Management & PDF Export**: Organize discussions across multiple named threads and export conversations as formatted PDF study summaries.

---

### 5. **Advanced Circuit Visualization**

**The Problem It Solves:**  
Raw numerical statevectors and density matrices fail to convey geometric intuition about quantum states, superposition, and entanglement.

**Key Features & Capabilities:**

- **Interactive 3D Bloch Spheres**: Real-time Three.js spheres with full rotation, pan, and zoom to inspect qubit state vectors and phase angles
- **Density Matrix Heatmaps**: Color-coded matrix visualizers illustrating quantum state purity, coherence, and off-diagonal correlations
- **Measurement Probability Histograms**: Interactive bar charts displaying measurement outcome distributions across all basis states
- **Amplitude Wave Plots**: Visual representations of real and imaginary wave function components
- **Multi-Qubit Grid Layout**: Simultaneous multi-qubit visualization enabling side-by-side state tracking.

---

### 6. **Gamify - Interactive Learning**

**The Problem It Solves:**  
Passive reading and video watching lead to low retention. Learners need deliberate, hands-on problem-solving with instant automated feedback.

**Key Features & Capabilities:**

- **70+ Structured Quantum Challenges**: Curated exercises spanning 5 progressive difficulty levels (Single Qubit, Superposition, Entanglement, Multi-Qubit, and Advanced Algorithms)
- **Automated Circuit Grading**: Submissions are automatically evaluated for statevector fidelity, gate count constraints, and circuit depth
- **Socratic Hint System**: Tiered clues provide conceptual nudges without immediately revealing full solutions
- **Achievements & Badges**: Earn achievements for milestones, problem completion streaks, and optimal solution depth.

---

### 7. **QLive - Real Quantum Hardware Integration**

**The Problem It Solves:**  
Software simulators are idealized and noise-free. Practical quantum computing requires understanding decoherence, gate errors, and hardware topology.

**Key Features & Capabilities:**

- **Real Quantum Hardware Connectivity**: Submit circuits directly to real quantum computers on IBM Quantum and AWS Braket
- **High-Fidelity Mock Provider**: Practice job submission, queue monitoring, and result retrieval without consuming hardware credits
- **Live Job Queue Monitoring**: Track job status (Queued, Running, Completed, Failed) with detailed execution metrics
- **Simulator vs. Hardware Comparison**: View side-by-side comparisons of ideal simulator predictions against real QPU measurement distributions to analyze hardware noise and fidelity.

---

### 8. **Gate Lab - Custom Gate Designer**

**The Problem It Solves:**  
Advanced quantum algorithms require custom unitary gates and parameter rotations. Learners need hands-on intuition for how angles and unitary matrices affect state vectors.

**Key Features & Capabilities:**

- **Interactive Parameter Sliders**: Adjust rotation angles ($\theta, \phi, \lambda$) in real time with dynamic updates to state vectors
- **Unitary Matrix Editor**: Input and validate custom matrix elements to verify unitarity ($U^\dagger U = I$)
- **Live State Action Preview**: Preview how custom gates transform standard basis states ($|0\rangle, |1\rangle, |+\rangle$) on an embedded Bloch sphere
- **Gate Decomposition & Export**: Decompose custom unitary operations into standard elementary gate sets (U3, CNOT) and export code.

---

### 9. **OneQ Studio - Single Qubit Simulator**

**The Problem It Solves:**  
Multi-qubit registers can overwhelm beginners. Students need an isolated, distraction-free environment to master single-qubit gates and state rotations.

**Key Features & Capabilities:**

- **Interactive Gate Palette**: Apply Pauli ($X, Y, Z$), Hadamard ($H$), and Phase ($S, T$) gates with a single click
- **Real-Time State Evolution**: Observe the 3D Bloch sphere vector animate smoothly as each gate is applied
- **Gate History & Step-Through**: Step forward and backward through gate sequences to analyze state transitions
- **Measurement Simulation**: Simulate measurement collapse with probabilistic visual feedback
- **Statevector Inspector**: View exact state coefficients ($\alpha|0\rangle + \beta|1\rangle$) and phase angles.

---

### 10. **QMemo - Quantum Knowledge Cards**

**The Problem It Solves:**  
Quantum computing terminology, mathematical identities, and gate matrices require active recall and spaced repetition for long-term retention.

**Key Features & Capabilities:**

- **Pre-Built Quantum Decks**: Comprehensive flashcard sets covering quantum gates, algorithms, linear algebra, and error correction
- **Spaced Repetition Algorithm**: Optimizes review intervals based on difficulty and past recall performance
- **Visual Answers**: Flip cards to reveal animated Bloch sphere transformations, circuit diagrams, and LaTeX proofs
- **Custom Card Creator**: Build and organize custom flashcard decks with LaTeX mathematical notation.

---

### 11. **Smart Debugging & Optimization**

**The Problem It Solves:**  
Quantum programming error messages are notoriously cryptic. Beginners spend excessive time fixing syntax and topology errors rather than understanding quantum logic.

**Key Features & Capabilities:**

- **Intelligent Error Recognition**: Identifies 15+ common quantum programming pitfalls (qubit index out of range, gates after measurement, deprecated methods) with plain-English explanations
- **In-Editor Error Highlighting**: Highlights erroneous lines with red indicators and hoverable fix hints
- **Circuit Profiler**: Analyzes circuit depth, total gate counts, non-local gate ratios, and complexity metrics
- **Transpiler Optimization Comparison**: Compares original circuits against optimized transpilation levels to showcase gate reduction and depth savings.

---

### 12. **User Authentication & Cloud Persistence**

**The Problem It Solves:**  
Learners and research teams need to preserve their work across sessions and devices, organize personal circuit collections, and manage access permissions when collaborating with peers.

**Key Features & Capabilities:**

- **Personal User Accounts**: Secure account registration and login with session persistence
- **Cloud Circuit Library**: Save visual circuits from Q-Circuit Studio and custom algorithm scripts from AlgoHub with full draft history
- **Granular Sharing Controls**: Configure shared circuits as public or private, and designate collaborator roles (edit access vs. view-only spectator mode)
- **User Profile Customization**: Manage profile information (username, email, bio, organization, role, location, custom avatar) with live avatar updates across the navigation bar.

---

## 🔧 Technology Stack

### **Frontend**

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern component-based UI framework |
| **Vite** | Next-generation build tool and rapid development server |
| **Material-UI (MUI)** | Accessible component system and responsive layout engine |
| **Three.js & React Three Fiber** | Interactive 3D Bloch sphere graphics and quantum vector rendering |
| **Monaco Editor** | Professional code editor with multi-framework syntax highlighting |
| **WebSockets** | Full-duplex real-time multiplayer collaboration and cursor sync |
| **Recharts & D3.js** | Measurement probability histograms and quantum amplitude wave plots |
| **html2canvas** | High-resolution circuit schematic PNG export |
| **jsPDF** | Comprehensive analytical PDF report generation |
| **KaTeX** | Fast, high-fidelity LaTeX mathematical equation rendering |
| **GSAP** | Smooth micro-animations and UI transitions |

### **Backend & Quantum Ecosystem**

| Technology | Purpose |
| :--- | :--- |
| **Python 3.9+** | Core language for scientific computing and backend services |
| **FastAPI** | High-performance asynchronous REST and WebSocket server |
| **Qiskit & Qiskit Aer** | IBM Quantum circuit simulation, transpilation, and noise modeling |
| **Google Cirq** | Google Quantum AI circuit simulation and analysis |
| **Xanadu PennyLane** | Quantum machine learning, QNodes, and hybrid computing |
| **OpenQASM (2.0 & 3.0)** | Hardware-agnostic intermediate representation and assembly standard |
| **Google Gemini AI** | Conversational quantum tutoring and prompt-based circuit synthesis |
| **OpenAI Vision / Pytesseract** | Multimodal OCR and visual quantum circuit diagram recognition |
| **ChromaDB** | Vector database for retrieval-augmented quantum chatbot context |
| **NumPy** | Numerical tensor calculations and reduced density matrix partial tracing |

### **Quantum Hardware Providers (QLive)**

| Provider | Access Method | Supported Environments |
| :--- | :--- | :--- |
| **IBM Quantum** | Qiskit Runtime | 127-qubit systems (Eagle, Heron processors) |
| **AWS Braket** | Braket SDK | Multi-architecture QPUs (IonQ, Rigetti, OQC) |
| **QBraid** | Unified API | Multi-cloud quantum hardware access |
| **Mock Provider** | Local Simulation | Deterministic testing environment without credit consumption |

---

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 16+ and npm
- **Python** 3.9+
- **Git**

### **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/krishna21s/Qubit_Tracer.git
cd Qubit_Tracer

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (Gemini, OpenAI, QBraid)

# Start backend server (runs at http://localhost:8000)
python qubit_tracer_api.py

# 3. Frontend Setup (in a new terminal)
cd ../frontend
npm install

# Start development server (runs at http://localhost:5173)
npm run dev
```

### **First Run Experience**

1. **Open your browser** to `http://localhost:5173`
2. **Explore Q-Circuit Studio**:
   - Click **Q-Circuit Studio** in the sidebar
   - Place a Hadamard gate ($H$) on wire `q[0]` and a Controlled-NOT ($CNOT$) gate from `q[0]` to `q[1]`
   - Click **Run Simulation** to inspect real-time 3D Bloch spheres and measurement probability distributions
   - Open the **Code Drawer** to see synchronized code across Qiskit, OpenQASM, Cirq, and PennyLane
   - Click **Collaborate** to copy a share link and test real-time multiplayer editing with live cursors!
3. **Explore AlgoHub**:
   - Click **AlgoHub** in the sidebar and select **Grover's Search Algorithm**
   - Review mathematical derivations in the **Concept Panel**, watch lecture videos, review seminal research papers, and execute code across multiple frameworks in the **Code Editor**
   - Click **Custom Build** to craft and auto-save personal quantum algorithms from verified snippet templates.

---

## 💼 Practical Use Cases

### **1. University Quantum Computing Courses**

**Scenario:** A professor teaches quantum superposition and entanglement in an undergraduate physics or computer science course.

**Capabilities Used:**
- Professor creates a demonstration circuit in **Q-Circuit Studio** and shares a view-only link during lecture; students watch the instructor's cursor place gates in real time.
- Homework: Students solve challenges in **Gamify** and submit custom algorithm workspaces in **AlgoHub** as proof of completion.
- Students consult **QTalk** for round-the-clock tutoring on conceptual doubts.

**Outcome:** Significant reduction in office hour inquiries; higher exam comprehension scores through active visual experimentation.

---

### **2. Multi-Framework Quantum Algorithm Benchmarking**

**Scenario:** A quantum software developer evaluates compiler efficiency and gate counts across competing quantum SDKs.

**Capabilities Used:**
- Open **AlgoHub** and select an algorithm template.
- Switch seamlessly between **Qiskit**, **Cirq**, and **PennyLane** to inspect differences in gate decomposition, circuit depth, and execution semantics.
- Export identical circuit structures across all three frameworks for automated performance testing.

**Outcome:** Replaces multiple fragmented development environments with a single unified comparison platform.

---

### **3. Distributed Team Quantum Hackathons**

**Scenario:** A four-person distributed hackathon team collaborates to design a custom Quantum Approximate Optimization Algorithm (QAOA) ansatz.

**Capabilities Used:**
- Team lead opens a room in **Q-Circuit Studio** and shares the collaboration link.
- All four members edit simultaneously, with color-coded cursors showing each member's contributions.
- The team consults the **AI Circuit Assistant** to verify parameter angles and entangler configurations.
- Click **Simulate** to verify entanglement and export high-resolution PNG schematics for the final presentation deck.

**Outcome:** Rapid prototype development with zero file merge conflicts or disconnected drafting.

---

### **4. Quantum Chemistry & Algorithm Research**

**Scenario:** A researcher prototypes a Variational Quantum Eigensolver (VQE) variant for molecular energy simulation.

**Capabilities Used:**
- Prototype the ansatz in **AlgoHub** using Qiskit and PennyLane templates.
- Use the **Circuit Profiler** and **Circuit Optimizer** to reduce circuit depth for NISQ hardware constraints.
- Test on the **QLive** mock simulator, then submit directly to real IBM Quantum 127-qubit QPUs.
- Compare ideal simulations against noisy hardware results to analyze decoherence.

**Outcome:** Accelerates the paper prototyping cycle with publication-ready diagrams and hardware validation.

---

### **5. High School STEM Workshops**

**Scenario:** Introducing quantum concepts to high school students with no prior advanced physics background.

**Capabilities Used:**
- Start with **OneQ Studio**: students click single-qubit gates and watch the 3D Bloch sphere vector rotate dynamically.
- Move to **Gamify**: students solve the "Flip a Quantum Coin" challenge using Hadamard gates.
- Use **Q-Vision**: students take photos of textbook circuit diagrams and convert them into simulated circuits.

**Outcome:** High student engagement with positive post-workshop interest in quantum computing and STEM pathways.

---

### **6. Corporate Quantum Workforce Training**

**Scenario:** An enterprise technology team trains software engineers on quantum machine learning and optimization.

**Capabilities Used:**
- Week 1: Master quantum gate identities using **QMemo** spaced repetition cards.
- Week 2: Build intuition with **Gate Lab** and **Q-Circuit Studio** parametric rotations.
- Week 3: Study QFT and Grover's search in **AlgoHub** across Qiskit and Cirq.
- Week 4: Submit optimization problems to AWS Braket hardware using **QLive**.

**Outcome:** Developers successfully transition from classical computing to deploying production-ready quantum circuits within months.

---

## 🗺️ Roadmap

### **Q1 2026: Performance & Scalability**
- [ ] WebAssembly-based client-side simulation engine
- [ ] Multi-threaded backend execution for large qubit registers
- [ ] Redis caching for frequently simulated public circuits
- [ ] Global CDN deployment for low-latency visual asset delivery

### **Q2 2026: Advanced Circuit Analytics**
- [ ] VR/AR Bloch sphere exploration (Meta Quest, Apple Vision Pro)
- [ ] Interactive step-through quantum debugger with circuit breakpoints
- [ ] Automated circuit equivalence checking and formal verification
- [ ] Extended pulse-level quantum control visualizations

### **Q3 2026: Hardware & Ecosystem Expansion**
- [ ] Google Quantum AI Sycamore hardware direct access
- [ ] Azure Quantum multi-provider integration
- [ ] Photonic quantum computing support (Xanadu Strawberry Fields)
- [ ] Quantum annealing interfaces for combinatorial optimization

### **Q4 2026: Community & Education**
- [ ] Community algorithm sharing marketplace
- [ ] Instructor dashboard for classroom assignment grading
- [ ] Weekly competitive quantum programming challenges
- [ ] Progressive Web App (PWA) with offline simulation support

---

## 🤝 Contributing

We welcome contributions from quantum enthusiasts, educators, researchers, and developers!

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-new-feature`
3. **Commit your changes**: `git commit -m "Add amazing new feature"`
4. **Push to the branch**: `git push origin feature/amazing-new-feature`
5. **Open a Pull Request** with a description of your improvements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Qiskit Team (IBM Quantum)** for their groundbreaking open-source quantum SDK
- **Google Quantum AI (Cirq Team)** for flexible circuit simulation tools
- **Xanadu (PennyLane Team)** for pioneer work in quantum machine learning
- **Google Gemini** for generative multimodal AI assistance
- **React Three Fiber Community** for 3D visual computing primitives
- **All Contributors & Community Members** advancing accessible quantum education

---

## 📧 Contact

- **GitHub**: [@krishna21s](https://github.com/krishna21s)
- **Project Repository**: [Qubit_Tracer](https://github.com/krishna21s/Qubit_Tracer)
- **Issues & Discussions**: [Report bugs or request features](https://github.com/krishna21s/Qubit_Tracer/issues)

---

<div align="center">

**Made with ❤️ for the Global Quantum Computing Community**

⭐ **Star this repository** if Qubit Tracer helped you learn or teach quantum computing!

</div>
