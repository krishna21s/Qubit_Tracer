# History of Quantum Computation and Quantum Information

Our story begins at the turn of the twentieth century when an unheralded revolution was underway in science. A series of crises had arisen in physics.

The problem was that the theories of physics at that time (now dubbed **classical physics**) were predicting absurdities such as:

- The existence of an **‘ultraviolet catastrophe’** involving infinite energies
- Electrons spiraling inexorably into the atomic nucleus

At first, such problems were resolved with the addition of ad hoc hypotheses to classical physics, but as a better understanding of atoms and radiation was gained, these explanations became more and more convoluted.

---

## The Crisis in Physics

The crisis came to a head in the early 1920s after a quarter century of turmoil, and resulted in the creation of the **modern theory of quantum mechanics**.

Quantum mechanics has since been an indispensable part of science, applied successfully to:

- The structure of the atom
- Nuclear fusion in stars
- Superconductors
- The structure of DNA
- The elementary particles of nature

---

## What is Quantum Mechanics?

Quantum mechanics is a **mathematical framework** or **set of rules** for the construction of physical theories.

**Example:**

- _Quantum electrodynamics_ describes the interaction of atoms and light with fantastic accuracy.
- It is built within the framework of quantum mechanics, but contains its own specific rules.

The relationship between quantum mechanics and specific physical theories is like:

- **Operating system (Quantum Mechanics)** → sets parameters and modes of operation
- **Application software (Physical Theory)** → determines how specific tasks are accomplished

---

## The Counterintuitive Nature of Quantum Mechanics

The rules of quantum mechanics are simple, but even experts find them counterintuitive.

- Many early contributions to quantum computation and quantum information arose from physicists trying to understand quantum mechanics better.
- Albert Einstein, one of its founders, remained critical of it until his death.

**Goal of quantum computation and quantum information:**

- Develop tools to sharpen intuition about quantum mechanics
- Make its predictions more transparent to human minds

---

## Early 1980s: The No-Cloning Theorem

In the early 1980s, physicists asked whether **quantum effects could signal faster than light** — which relativity forbids.

The question reduced to whether it is possible to **clone an unknown quantum state**.

- **If cloning were possible:** faster-than-light communication could occur
- **In classical information:** cloning is trivial (copying text, files, etc.)
- **In quantum mechanics:** cloning an unknown state is impossible (No-Cloning Theorem)

The No-Cloning Theorem (1980s) became one of the earliest results in quantum computation and quantum information, and has led to:

- Refinements of the theorem
- Conceptual tools to measure imperfect quantum cloning
- Applications to other aspects of quantum mechanics

---

## Controlling Single Quantum Systems (1970s–Present)

Another historical strand is the effort to **control single quantum systems**, beginning in the 1970s.

Before then, applications of quantum mechanics:

- Involved **bulk samples** of enormous numbers of quantum systems
- Allowed only partial probing of quantum effects

**Examples:**

- Superconductivity explained by quantum mechanics, but without access to individual particles
- Particle accelerators allowed partial access but little control

**Post-1970s advancements:**

- Trapping a single atom in an "atom trap"
- Moving single atoms with a scanning tunneling microscope
- Electronic devices transferring single electrons

---

## Why Control Single Systems?

The scientific reason is a **hunch** — probing new regimes of nature often leads to breakthroughs.

**Historical parallels:**

- Radio astronomy (1930s–40s) → discovery of galactic core, pulsars, quasars
- Low temperature physics → breakthroughs in material science

**Current status:**

- First steps into the regime of single quantum system control
- Early surprises discovered; many more expected

---

## Quantum Computation's Role

Quantum computation and quantum information:

- Provide challenges to push single-system manipulation techniques
- Stimulate development of new experimental tools
- Require precise control over single quantum systems for practical applications

**Current achievements:**

- Small quantum computers performing dozens of operations on a few qubits
- Quantum cryptography prototypes useful in some real-world scenarios

**Remaining challenge:**

- Building **large-scale quantum information processing** systems

---

## Computer Science: Another Key Foundation

While physics advanced, **computer science** was also developing as a cornerstone of quantum computation.

**Historical roots:**

- Algorithmic ideas in **Babylonian times** (~1750 B.C.)
- Likely much older

---

### Alan Turing (1936)

- Introduced the concept of a **programmable computer** — the **Turing Machine**
- Showed the existence of a **Universal Turing Machine** capable of simulating any other Turing Machine
- Proposed the **Church–Turing Thesis** with Alonzo Church:
  > Anything algorithmically computable can be computed by a Universal Turing Machine

This laid the foundation for a rigorous **theory of computation**.

---

### From Theory to Hardware

- **Post-Turing:** first electronic computers built
- **John von Neumann:** practical model for computer design
- **1947:** Invention of the **transistor** by Bardeen, Brattain, and Shockley — hardware revolution begins

---

### Moore’s Law (1965)

Gordon Moore observed:

> Computer power doubles every ~2 years at constant cost

This held true for decades, but by the early 21st century, limitations emerged:

- **Miniaturization** reaching physical limits
- **Quantum effects** interfering with classical device function

# Quantum Computation as a New Computing Paradigm

## Moving Beyond Moore’s Law

One possible solution to the eventual **failure of Moore’s Law** is to move toward a different computing paradigm.

- **Quantum Computation** is one such paradigm, based on using _quantum mechanics_ to perform computations instead of classical physics.
- While an ordinary computer can simulate a quantum computer, it appears impossible to do so **efficiently**.
- This leads to a **significant speed advantage** for quantum computers — so large that no progress in classical computing could bridge the gap.

---

## Efficient vs. Inefficient Simulation

**Definitions**:

- **Efficient Algorithm** – Runs in time _polynomial_ in the size of the problem.
- **Inefficient Algorithm** – Requires _superpolynomial_ (typically exponential) time.

### Historical Notes:

- Even before quantum computing was conceived, computational complexity theory defined the notions of efficient and inefficient algorithms.
- By the late 1960s–1970s, it was believed that the **Turing machine model** was at least as powerful as any other model of computation.
- **Strong Church–Turing Thesis**:
  > Any algorithmic process can be simulated _efficiently_ using a Turing machine.

---

## Challenges to the Strong Church–Turing Thesis

### 1. Analog Computation

- Certain **analog computers** seemed able to solve problems that Turing machines could not efficiently solve.
- However, when **realistic noise** was factored in, these advantages disappeared.
- **Lesson learned**: Realistic noise must be considered when evaluating computational models.
- In quantum computing, this challenge led to:
  - **Quantum Error-Correcting Codes**
  - **Fault-Tolerant Quantum Computation**
- Unlike analog computation, quantum computers can tolerate _finite noise_ and still retain their advantages.

---

### 2. Randomized Algorithms

- **First major challenge** arose in the **mid-1970s**:
  - **Robert Solovay** and **Volker Strassen** developed a **randomized algorithm** for primality testing.
- **Solovay–Strassen Test**:
  - Determines if a number is **probably prime** or **definitely composite**.
  - Repeated runs can give _near certainty_ of primality.
  - At the time, no deterministic primality test was known (and still not known at this writing).
- This discovery suggested that **randomness** might allow efficient solutions where deterministic algorithms fail.
- Resulted in the growth of **randomized algorithms research** into a thriving field.

# History of Quantum Computation and Quantum Information

Our story begins at the turn of the twentieth century when an unheralded revolution was underway in science. A series of crises had arisen in physics.

The problem was that the theories of physics at that time (now dubbed **classical physics**) were predicting absurdities such as:

- The existence of an **‘ultraviolet catastrophe’** involving infinite energies
- Electrons spiraling inexorably into the atomic nucleus

At first, such problems were resolved with the addition of ad hoc hypotheses to classical physics, but as a better understanding of atoms and radiation was gained, these explanations became more and more convoluted.

---

## The Crisis in Physics

The crisis came to a head in the early 1920s after a quarter century of turmoil, and resulted in the creation of the **modern theory of quantum mechanics**.

Quantum mechanics has since been an indispensable part of science, applied successfully to:

- The structure of the atom
- Nuclear fusion in stars
- Superconductors
- The structure of DNA
- The elementary particles of nature

---

## What is Quantum Mechanics?

Quantum mechanics is a **mathematical framework** or **set of rules** for the construction of physical theories.

**Example:**

- _Quantum electrodynamics_ describes the interaction of atoms and light with fantastic accuracy.
- It is built within the framework of quantum mechanics, but contains its own specific rules.

The relationship between quantum mechanics and specific physical theories is like:

- **Operating system (Quantum Mechanics)** → sets parameters and modes of operation
- **Application software (Physical Theory)** → determines how specific tasks are accomplished

---

## The Counterintuitive Nature of Quantum Mechanics

The rules of quantum mechanics are simple, but even experts find them counterintuitive.

- Many early contributions to quantum computation and quantum information arose from physicists trying to understand quantum mechanics better.
- Albert Einstein, one of its founders, remained critical of it until his death.

**Goal of quantum computation and quantum information:**

- Develop tools to sharpen intuition about quantum mechanics
- Make its predictions more transparent to human minds

---

## Early 1980s: The No-Cloning Theorem

In the early 1980s, physicists asked whether **quantum effects could signal faster than light** — which relativity forbids.

The question reduced to whether it is possible to **clone an unknown quantum state**.

- **If cloning were possible:** faster-than-light communication could occur
- **In classical information:** cloning is trivial (copying text, files, etc.)
- **In quantum mechanics:** cloning an unknown state is impossible (No-Cloning Theorem)

The No-Cloning Theorem (1980s) became one of the earliest results in quantum computation and quantum information, and has led to:

- Refinements of the theorem
- Conceptual tools to measure imperfect quantum cloning
- Applications to other aspects of quantum mechanics

---

## Controlling Single Quantum Systems (1970s–Present)

Another historical strand is the effort to **control single quantum systems**, beginning in the 1970s.

Before then, applications of quantum mechanics:

- Involved **bulk samples** of enormous numbers of quantum systems
- Allowed only partial probing of quantum effects

**Examples:**

- Superconductivity explained by quantum mechanics, but without access to individual particles
- Particle accelerators allowed partial access but little control

**Post-1970s advancements:**

- Trapping a single atom in an "atom trap"
- Moving single atoms with a scanning tunneling microscope
- Electronic devices transferring single electrons

---

## Why Control Single Systems?

The scientific reason is a **hunch** — probing new regimes of nature often leads to breakthroughs.

**Historical parallels:**

- Radio astronomy (1930s–40s) → discovery of galactic core, pulsars, quasars
- Low temperature physics → breakthroughs in material science

**Current status:**

- First steps into the regime of single quantum system control
- Early surprises discovered; many more expected

---

## Quantum Computation's Role

Quantum computation and quantum information:

- Provide challenges to push single-system manipulation techniques
- Stimulate development of new experimental tools
- Require precise control over single quantum systems for practical applications

**Current achievements:**

- Small quantum computers performing dozens of operations on a few qubits
- Quantum cryptography prototypes useful in some real-world scenarios

**Remaining challenge:**

- Building **large-scale quantum information processing** systems

---

## Computer Science: Another Key Foundation

While physics advanced, **computer science** was also developing as a cornerstone of quantum computation.

**Historical roots:**

- Algorithmic ideas in **Babylonian times** (~1750 B.C.)
- Likely much older

---

### Alan Turing (1936)

- Introduced the concept of a **programmable computer** — the **Turing Machine**
- Showed the existence of a **Universal Turing Machine** capable of simulating any other Turing Machine
- Proposed the **Church–Turing Thesis** with Alonzo Church:
  > Anything algorithmically computable can be computed by a Universal Turing Machine

This laid the foundation for a rigorous **theory of computation**.

---

### From Theory to Hardware

- **Post-Turing:** first electronic computers built
- **John von Neumann:** practical model for computer design
- **1947:** Invention of the **transistor** by Bardeen, Brattain, and Shockley — hardware revolution begins

---

### Moore’s Law (1965)

Gordon Moore observed:

> Computer power doubles every ~2 years at constant cost

This held true for decades, but by the early 21st century, limitations emerged:

- **Miniaturization** reaching physical limits
- **Quantum effects** interfering with classical device function

---

# Challenges and Developments in Quantum Computation

## Randomized Algorithms and the Strong Church–Turing Thesis

- **Challenge**:  
  Randomized algorithms suggest that there are efficiently soluble problems that cannot be efficiently solved on a deterministic Turing machine.
- **Modification**:  
  This leads to a simple modification of the strong Church–Turing thesis:
  > Any algorithmic process can be simulated efficiently using a probabilistic Turing machine.
- **Concern**:  
  This ad hoc change raises questions — could future models of computation again surpass this modified thesis?
  - Is there a single model guaranteed to simulate any other model efficiently?

---

## David Deutsch’s Approach (1985)

- **Motivation**:  
  Deutsch sought to derive a stronger version of the Church–Turing thesis from the laws of physics.
- **Idea**:  
  Define a computational device capable of efficiently simulating any physical system.
- **Reasoning**:  
  Since the laws of physics are quantum mechanical, this led naturally to **quantum computers** — quantum analogues of Turing machines.

### Open Problem

- It is still unknown whether a **Universal Quantum Computer** can efficiently simulate _any_ physical system.
- Possibility: Phenomena from quantum field theory, string theory, or quantum gravity might require more powerful models.

---

## Quantum Computers vs Classical Computers

- Deutsch proposed that quantum computers might solve problems **no classical (even probabilistic) Turing machine** could solve efficiently.
- He gave early examples suggesting this was true.

### Breakthroughs

1. **Peter Shor (1994)**

   - Efficient algorithms for:
     - Prime factorization
     - Discrete logarithms
   - Both problems believed to have no efficient classical solutions.

2. **Lov Grover (1995)**
   - Quantum search algorithm for unstructured databases.
   - Not as dramatic a speedup as Shor’s, but widely applicable.

---

## Feynman’s Insight and Quantum Simulation

- **Richard Feynman (1982)**:  
  Classical computers struggle to simulate quantum systems.
- **1990s research**:  
  Proved that quantum computers can efficiently simulate certain quantum systems not efficiently simulatable classically.
- **Potential**:  
  Likely to be a major future application with significant scientific and technological impact.

---

## The Difficulty of Designing Quantum Algorithms

- **Why hard?**

  1. **Classical Intuition Bias** – Our thinking is rooted in the classical world, leading to classical algorithm ideas.
  2. **Performance Benchmark** – A quantum algorithm must outperform _all_ classical algorithms to be interesting.

- **Result**:  
  Even algorithms that use truly quantum effects may not be useful if classical algorithms with similar performance exist.

---

## Open Questions and Future Challenges

- What makes quantum computers more powerful than classical computers?
- Which problems can they solve efficiently that classical computers cannot?
- How does the set of quantum-solvable problems compare to classical ones?

> One of the most exciting aspects of quantum computation is how little we know — answering these questions is a great challenge for the future.

# Information Theory and Its Role in Quantum Computation

## A Parallel Revolution to Computer Science

- While computer science was rapidly advancing in the 1940s, another revolution was taking place in our understanding of communication.
- **Claude Shannon (1948)** published two groundbreaking papers laying the foundations for the modern theory of information and communication.

---

## Shannon’s Key Contribution

- **Core Achievement**: Mathematically defined the concept of _information_.
- **Challenge**: Defining an _information source_ mathematically is not obvious — multiple definitions exist.
- **Impact**: Shannon’s definition proved exceptionally fruitful, leading to:
  - Deep theoretical results
  - A rich, structured theory
  - Strong applicability to real-world communication problems

---

## Shannon’s Two Fundamental Questions

1. **Resource Requirement** – What resources are required to send information over a communications channel?

   - Example: How much information can a telephone cable reliably transmit?

2. **Noise Protection** – Can information be sent in a way that protects it from channel noise?

---

## Shannon’s Two Fundamental Theorems

1. **Noiseless Channel Coding Theorem**

   - Quantifies the physical resources needed to store the output from an information source.

2. **Noisy Channel Coding Theorem**
   - Quantifies how much information can be reliably transmitted over a noisy channel.
   - Introduces **error-correcting codes** to protect transmitted data.
   - Establishes an _upper limit_ on protection achievable by such codes.

**Note**: Shannon’s theorem did not give a practical method to achieve the limit — research since then has produced many classes of error-correcting codes.

---

## Applications of Error-Correcting Codes

- Compact disc players
- Computer modems
- Satellite communication systems

---

## Quantum Information Theory and Error-Correction

- **Ben Schumacher (1995)**:

  - Provided a quantum analogue to Shannon’s noiseless coding theorem.
  - Defined the **quantum bit (qubit)** as a tangible physical resource.

- **Current Gap**: No known quantum analogue of Shannon’s noisy channel coding theorem.

- Nevertheless, **quantum error-correction theory** exists:
  - Allows quantum computers to function despite noise.
  - Enables reliable communication over noisy quantum channels.

---

## Classical Influence on Quantum Error-Correction

- **1996**: Two groups independently discovered an important class of quantum codes:

  - **Robert Calderbank & Peter Shor**
  - **Andrew Steane**
  - Result: CSS Codes (named after their initials)

- **Later Development**: Stabilizer codes, independently discovered by:

  - Robert Calderbank
  - Eric Rains
  - Peter Shor
  - Neil Sloane
  - Daniel Gottesman

- **Impact**:
  - Built upon classical linear coding theory.
  - Accelerated understanding of quantum error-correcting codes.
  - Facilitated their application to quantum computation and quantum information.
