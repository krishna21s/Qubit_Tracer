// GeeksforGeeks-style theory data for each quantum algorithm
// Each entry has: definition, bulletPoints, imageUrl, imageCaption,
// overview, flow (step-by-step), example, mathFormula, mathExplanation,
// keyConcepts, applications, realWorldUse

export const algoTheoryData = {

  /* ───────────────────── SINGLE QUBIT GATES ───────────────────── */
  "single-qubit-gates": {
    title: "Single Qubit Gates",
    subtitle: "The basic building blocks of every quantum circuit",

    definition:
      "A single-qubit gate is an operation that changes the state of one qubit — just like how a light switch flips a bulb ON or OFF, but quantum gates can also put the qubit in a 'both ON and OFF at the same time' state called superposition.",

    bulletPoints: [
      "Qubits needed: 1",
      "Key gates: X (bit flip), H (superposition), Z (phase flip)",
      "Quantum advantage: Creates superposition — impossible classically",
      "Prerequisite: None — this is where you start!"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/600px-Bloch_sphere.svg.png",
    imageCaption:
      "The Bloch Sphere — think of it as a globe where the North Pole is |0⟩ and the South Pole is |1⟩. Gates rotate the qubit's state around this sphere.",

    overview:
      `In classical computing, a bit is either 0 or 1. In quantum computing, a qubit can be 0, 1, or both at the same time — this is called superposition.

Single-qubit gates are the simplest operations you can do on a qubit. Think of them as instructions that rotate or flip the qubit's state:

• The X gate flips |0⟩ to |1⟩ and vice versa (like a NOT gate).
• The H gate (Hadamard) puts the qubit into a perfect 50/50 mix of |0⟩ and |1⟩.
• The Z gate flips the "phase" (an invisible sign) without changing measurement probabilities.

Every quantum algorithm starts with these basic gates.`,

    flow: [
      {
        step: "1. Start with |0⟩",
        desc: "Every qubit begins in the |0⟩ state (think of it as 'OFF')."
      },
      {
        step: "2. Apply a Gate",
        desc: "For example, apply the H gate to create a 50/50 superposition of |0⟩ and |1⟩."
      },
      {
        step: "3. Qubit is now in Superposition",
        desc: "The qubit is both |0⟩ and |1⟩ at the same time — until you measure it."
      },
      {
        step: "4. Measure the Qubit",
        desc: "When you measure, the qubit 'collapses' to either 0 or 1. With the H gate, you get each result about 50% of the time."
      }
    ],

    example: {
      title: "Coin Flip with a Quantum Gate",
      input: "Start with qubit in state |0⟩",
      steps: [
        "Apply Hadamard gate (H) to qubit",
        "Qubit is now in superposition: (|0⟩ + |1⟩) / √2",
        "Measure the qubit 1000 times"
      ],
      output: "You get approximately 500 times '0' and 500 times '1' — a perfectly fair coin flip!"
    },

    mathFormula: "|ψ⟩ = α|0⟩ + β|1⟩  where |α|² + |β|² = 1",
    mathExplanation:
      "α and β are numbers that tell you how likely you are to measure 0 or 1. Their squares must add up to 1 (100% total probability).",

    keyConcepts: [
      "Superposition",
      "Qubit States",
      "Hadamard Gate",
      "Pauli-X Gate (NOT)",
      "Measurement"
    ],

    applications: [
      "Quantum random number generation",
      "Quantum cryptography (BB84 protocol)",
      "Building block for ALL quantum algorithms",
      "Quantum sensor calibration"
    ],

    realWorldUse:
      "Single-qubit gates are the alphabet of quantum computing. Every quantum algorithm — from simple to complex — is built using these basic operations."
  },

  /* ───────────────────── BELL STATE ───────────────────── */
  "bell-state": {
    title: "Bell State (Quantum Entanglement)",
    subtitle: "Linking two qubits so they always match — no matter how far apart",

    definition:
      "A Bell State is when two qubits become 'entangled' — connected in a special way so that measuring one instantly tells you the state of the other. If you measure one qubit and get 0, the other will always be 0 too. It's like having two magic coins that always land on the same side!",

    bulletPoints: [
      "Qubits needed: 2",
      "Key gates: H (Hadamard) + CNOT (Controlled-NOT)",
      "Quantum advantage: Creates perfect correlation between qubits",
      "Prerequisite: Single Qubit Gates"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Teleport.svg/640px-Teleport.svg.png",
    imageCaption:
      "Bell State Circuit — Apply H gate to first qubit, then CNOT to entangle both qubits together.",

    overview:
      `Entanglement is one of the weirdest and most powerful features of quantum mechanics. When two qubits are entangled, they become a single connected system — even if they are on opposite sides of the planet.

Here's how it works:
1. Start with two qubits, both set to |0⟩
2. Apply a Hadamard gate (H) to the first qubit → now it's in superposition
3. Apply a CNOT gate with qubit 1 as control and qubit 2 as target
4. Now the two qubits are entangled!

The result: (|00⟩ + |11⟩) / √2
This means you'll ONLY ever get "00" or "11" when you measure — NEVER "01" or "10". The qubits are perfectly linked.`,

    flow: [
      {
        step: "1. Initialize |00⟩",
        desc: "Both qubits start in state |0⟩."
      },
      {
        step: "2. Apply H to Qubit 1",
        desc: "Put the first qubit into superposition: it's now 50% |0⟩ and 50% |1⟩."
      },
      {
        step: "3. Apply CNOT Gate",
        desc: "The CNOT gate flips qubit 2 whenever qubit 1 is |1⟩. This links them together."
      },
      {
        step: "4. Measure Both Qubits",
        desc: "You always get matching results — either both 0 (|00⟩) or both 1 (|11⟩). Never mismatched!"
      }
    ],

    example: {
      title: "Two Magic Coins",
      input: "Two qubits, both starting as |0⟩",
      steps: [
        "Apply H gate to qubit 1 → creates superposition",
        "Apply CNOT (qubit 1 → qubit 2) → creates entanglement",
        "Measure both qubits 1000 times"
      ],
      output: "~500 times you get '00' and ~500 times you get '11'. You NEVER see '01' or '10'."
    },

    mathFormula: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    mathExplanation:
      "This means there's a 50% chance of measuring 00 and 50% chance of measuring 11. The qubits are perfectly correlated.",

    keyConcepts: [
      "Quantum Entanglement",
      "CNOT Gate",
      "Bell States",
      "Non-local Correlation",
      "EPR Paradox"
    ],

    applications: [
      "Quantum Teleportation",
      "Secure Quantum Communication (QKD)",
      "Superdense Coding (send 2 bits using 1 qubit)",
      "Quantum Internet"
    ],

    realWorldUse:
      "Bell states are the foundation of quantum communication. They power quantum key distribution (unhackable encryption), quantum teleportation, and will be essential for the future quantum internet."
  },

  /* ───────────────────── GHZ STATE ───────────────────── */
  "ghz-state": {
    title: "GHZ State (3-Qubit Entanglement)",
    subtitle: "Entangling three qubits together at once",

    definition:
      "A GHZ state is like a Bell state but with 3 (or more) qubits all linked together. When you measure them, ALL qubits give the same result — either all 0s (|000⟩) or all 1s (|111⟩). If even one qubit is lost, the entanglement between the remaining two is completely destroyed.",

    bulletPoints: [
      "Qubits needed: 3 (or more)",
      "Key gates: H + two CNOT gates in a chain",
      "Quantum advantage: Tests quantum mechanics vs classical physics",
      "Prerequisite: Bell State"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/GHZ_circuit.svg/500px-GHZ_circuit.svg.png",
    imageCaption:
      "GHZ Circuit — H gate on first qubit, then CNOT chain to entangle all three qubits.",

    overview:
      `The GHZ state extends entanglement from 2 qubits to 3 or more. It was proposed by physicists Greenberger, Horne, and Zeilinger in 1989.

How to build it:
1. Start with 3 qubits, all set to |0⟩
2. Apply H gate to qubit 1 → superposition
3. Apply CNOT (qubit 1 → qubit 2) → links qubit 1 and 2
4. Apply CNOT (qubit 1 → qubit 3) → links qubit 1 and 3

Now all three are entangled: (|000⟩ + |111⟩) / √2

Important: If you lose or ignore any single qubit, the connection between the other two disappears completely. This is different from having separate Bell pairs.`,

    flow: [
      {
        step: "1. Start with |000⟩",
        desc: "All three qubits begin in state |0⟩."
      },
      {
        step: "2. H Gate on Qubit 1",
        desc: "Creates superposition on the first qubit."
      },
      {
        step: "3. CNOT (Q1 → Q2)",
        desc: "Entangles qubit 1 with qubit 2."
      },
      {
        step: "4. CNOT (Q1 → Q3)",
        desc: "Extends entanglement to qubit 3. Now all three are linked."
      },
      {
        step: "5. Measure All Three",
        desc: "You only get |000⟩ or |111⟩ — all zeros or all ones, never a mix."
      }
    ],

    example: {
      title: "Three Synchronized Coins",
      input: "3 qubits in state |000⟩",
      steps: [
        "Apply H gate to qubit 1",
        "Apply CNOT from qubit 1 to qubit 2",
        "Apply CNOT from qubit 1 to qubit 3",
        "Measure all 3 qubits 1000 times"
      ],
      output: "~500 times '000' and ~500 times '111'. You never see '010', '101', or any mixed result."
    },

    mathFormula: "|GHZ⟩ = (|000⟩ + |111⟩) / √2",
    mathExplanation:
      "50% chance all qubits are 0, 50% chance all are 1. They always agree with each other.",

    keyConcepts: [
      "Multi-qubit Entanglement",
      "GHZ State",
      "Entanglement Fragility",
      "Quantum Correlations",
      "Bell's Theorem Extension"
    ],

    applications: [
      "Quantum secret sharing (split a secret among 3 people)",
      "Quantum network protocols",
      "Testing the foundations of quantum mechanics",
      "Benchmarking quantum processors"
    ],

    realWorldUse:
      "GHZ states are used in quantum networking (sharing secrets securely among multiple parties) and to test whether quantum mechanics is truly correct by ruling out classical alternatives."
  },

  /* ───────────────────── QUANTUM TELEPORTATION ───────────────────── */
  "quantum-teleportation": {
    title: "Quantum Teleportation",
    subtitle: "Sending a qubit's state from one place to another — without physically moving it",

    definition:
      "Quantum teleportation lets you transfer the exact state of a qubit from one location to another, using entanglement and two regular (classical) bits. The original qubit is destroyed in the process — so it's not copying, it's truly moving the state.",

    bulletPoints: [
      "Qubits needed: 3 (1 to send + 2 entangled pair)",
      "Key gates: H, CNOT, X, Z corrections",
      "Quantum advantage: Transfer quantum info without a quantum channel",
      "Prerequisite: Bell State"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Quantum_teleportation_circuit.svg/640px-Quantum_teleportation_circuit.svg.png",
    imageCaption:
      "Teleportation Circuit — Alice measures her qubits, sends 2 classical bits to Bob, who then reconstructs the original state.",

    overview:
      `Imagine Alice has a qubit in some unknown state and wants to send it to Bob. She can't just "read" the state and tell Bob (measurement destroys it), and she can't copy it (no-cloning theorem). But with quantum teleportation, she CAN transfer it!

Here's the trick:
1. Alice and Bob share an entangled Bell pair (one qubit each)
2. Alice combines her unknown qubit with her half of the Bell pair
3. Alice measures both her qubits → gets two classical bits (0 or 1)
4. Alice sends these 2 bits to Bob (regular phone/internet — nothing quantum)
5. Bob applies a simple fix to his qubit based on Alice's bits
6. Bob's qubit is now in the EXACT state Alice started with!

The original state at Alice's end is destroyed during measurement — so no copies are made.`,

    flow: [
      {
        step: "1. Share Entangled Pair",
        desc: "Create a Bell pair. Give one qubit to Alice and one to Bob."
      },
      {
        step: "2. Alice Combines Qubits",
        desc: "Alice applies CNOT and H gates on her unknown qubit and her Bell qubit."
      },
      {
        step: "3. Alice Measures",
        desc: "Alice measures both her qubits and gets two classical bits (like '01')."
      },
      {
        step: "4. Send Classical Bits",
        desc: "Alice sends those 2 bits to Bob using a normal channel (phone, email, etc)."
      },
      {
        step: "5. Bob Applies Correction",
        desc: "Based on the bits, Bob applies X gate, Z gate, both, or neither to fix his qubit."
      },
      {
        step: "6. State Transferred!",
        desc: "Bob's qubit is now in the exact same state Alice had. Teleportation complete!"
      }
    ],

    example: {
      title: "Teleporting a Qubit from Alice to Bob",
      input: "Alice has a qubit in state |+⟩ = (|0⟩ + |1⟩)/√2. She wants Bob to have this state.",
      steps: [
        "Alice and Bob share a Bell pair",
        "Alice performs CNOT and H on her two qubits, then measures → gets '01'",
        "Alice sends '01' to Bob",
        "Bob applies X gate to his qubit based on the message",
        "Bob's qubit is now in state |+⟩ — same as Alice's original!"
      ],
      output: "Bob's qubit is now (|0⟩ + |1⟩)/√2 — Alice's state has been teleported."
    },

    mathFormula: "|ψ⟩ = α|0⟩ + β|1⟩  →  teleported to Bob's qubit",
    mathExplanation:
      "Whatever state α|0⟩ + β|1⟩ Alice started with, Bob ends up with the same state after applying the right correction.",

    keyConcepts: [
      "Quantum Teleportation",
      "No-Cloning Theorem",
      "Bell Pair (Shared Entanglement)",
      "Classical Communication",
      "State Reconstruction"
    ],

    applications: [
      "Quantum Internet — sending quantum data between nodes",
      "Distributed quantum computing",
      "Quantum repeaters for long-distance communication",
      "Secure quantum networks"
    ],

    realWorldUse:
      "Quantum teleportation is the backbone of the future Quantum Internet. It lets quantum computers in different locations share information without losing the fragile quantum state."
  },

  /* ───────────────────── DEUTSCH-JOZSA ───────────────────── */
  "deutsch-jozsa": {
    title: "Deutsch-Jozsa Algorithm",
    subtitle: "Finding the answer in just 1 step that would take a classical computer many tries",

    definition:
      "The Deutsch-Jozsa algorithm answers a simple question: 'Does a mystery function always give the same answer (constant), or does it give different answers for different inputs (balanced)?' A classical computer needs to check many inputs, but a quantum computer can figure it out in just ONE try.",

    bulletPoints: [
      "Qubits needed: n+1 (n input + 1 helper)",
      "Key concept: Quantum parallelism — check all inputs at once",
      "Quantum advantage: 1 query vs 2^(n-1)+1 classical queries",
      "Prerequisite: Single Qubit Gates, Superposition"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Deutsch-Jozsa-algorithm-quantum-circuit.png/640px-Deutsch-Jozsa-algorithm-quantum-circuit.png",
    imageCaption:
      "Deutsch-Jozsa Circuit — H gates create superposition, the oracle applies the function, H gates decode the answer.",

    overview:
      `Imagine you have a black box (oracle) that takes a number as input and gives either 0 or 1 as output. You're promised that the box either:
• Always gives the SAME answer for every input (constant) — like always saying "0"
• Gives "0" for exactly half the inputs and "1" for the other half (balanced)

Your job: Figure out which type it is.

Classical approach: In the worst case, you need to try more than half of all possible inputs.
For n=10 bits → that's checking 513 of 1024 inputs!

Quantum approach: Put all inputs into superposition, run the oracle ONCE, and measure. The answer pops out immediately!

If you measure all zeros → the function is constant.
If you measure anything else → the function is balanced.`,

    flow: [
      {
        step: "1. Prepare Qubits",
        desc: "Set n input qubits to |0⟩ and 1 output qubit to |1⟩."
      },
      {
        step: "2. Apply H Gates (Superposition)",
        desc: "Apply Hadamard to ALL qubits. Now the input qubits hold every possible input at once!"
      },
      {
        step: "3. Run the Oracle",
        desc: "The black-box function processes all inputs simultaneously in one step."
      },
      {
        step: "4. Apply H Gates Again",
        desc: "Hadamard gates on input qubits convert the interference pattern into a readable answer."
      },
      {
        step: "5. Measure",
        desc: "If result is all 0s → constant function. If any bit is 1 → balanced function. Done in 1 shot!"
      }
    ],

    example: {
      title: "Is the function constant or balanced?",
      input: "A black box f(x) where x is a 3-bit number (8 possible inputs). f gives 0 or 1.",
      steps: [
        "Create superposition of all 8 inputs (|000⟩ through |111⟩) at once",
        "Run the oracle on all inputs simultaneously",
        "Apply Hadamard gates to decode the interference pattern",
        "Measure the 3 input qubits"
      ],
      output: "If you get '000' → function is constant (always same answer). If you get '110' or any non-zero → function is balanced."
    },

    mathFormula: "1 quantum query  vs  2^(n-1) + 1 classical queries",
    mathExplanation:
      "The quantum computer checks all inputs at once using superposition, then uses interference to get the answer in a single measurement.",

    keyConcepts: [
      "Quantum Parallelism",
      "Oracle (Black Box)",
      "Interference Pattern",
      "Exponential Speedup",
      "Phase Kickback"
    ],

    applications: [
      "First proof that quantum computers can be exponentially faster",
      "Foundation for more advanced algorithms (Grover's, Shor's)",
      "Teaching quantum parallelism concepts",
      "Benchmarking quantum processors"
    ],

    realWorldUse:
      "While not directly used in industry, Deutsch-Jozsa was historically the first algorithm to PROVE quantum computers can be exponentially faster than classical ones. It paved the way for all modern quantum algorithms."
  },

  /* ───────────────────── QFT ───────────────────── */
  "qft-3qubit": {
    title: "Quantum Fourier Transform (QFT)",
    subtitle: "Converting quantum states from 'position' information to 'frequency' information",

    definition:
      "The Quantum Fourier Transform (QFT) is the quantum version of the Fourier Transform — a tool that breaks down a signal into its frequency components. Think of it like how a prism splits white light into rainbow colors. QFT does this for quantum states, and it's exponentially faster than the classical version.",

    bulletPoints: [
      "Qubits needed: n (typically 3 for learning)",
      "Key gates: H + Controlled Phase Rotation + SWAP",
      "Quantum advantage: O(n²) gates vs O(n·2ⁿ) classical operations",
      "Prerequisite: Phase Gates, Multi-qubit circuits"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Qft.svg/600px-Qft.svg.png",
    imageCaption:
      "QFT Circuit — Hadamard gates and controlled rotation gates transform basis states into phase-encoded states.",

    overview:
      `The Fourier Transform is one of the most important tools in all of science and engineering. It converts data from one form to another — like turning a music waveform into its individual notes.

The Quantum Fourier Transform (QFT) does the same thing but on quantum states:
• Classical FFT on N numbers: needs N × log(N) steps
• Quantum QFT on N amplitudes: needs only (log N)² steps — exponentially fewer!

QFT itself doesn't solve problems directly, but it's a critical building block inside other algorithms:
• Shor's Algorithm uses QFT to find hidden patterns (periods)
• Phase Estimation uses QFT to read out eigenvalues
• Many quantum simulation algorithms rely on QFT`,

    flow: [
      {
        step: "1. Start with Input State",
        desc: "Begin with qubits encoding some computational basis state (e.g., |001⟩)."
      },
      {
        step: "2. Apply H to First Qubit",
        desc: "Hadamard creates the first level of superposition."
      },
      {
        step: "3. Apply Controlled Rotations",
        desc: "Each subsequent qubit adds a controlled phase rotation, encoding frequency information."
      },
      {
        step: "4. Repeat for All Qubits",
        desc: "Do steps 2-3 for each qubit, building up the complete transform."
      },
      {
        step: "5. SWAP Qubits",
        desc: "Reverse the qubit order (swap first↔last) to get the correct output ordering."
      }
    ],

    example: {
      title: "Transforming |001⟩ with 3-qubit QFT",
      input: "3 qubits in state |001⟩ (binary for number 1)",
      steps: [
        "Apply QFT circuit: H gates + controlled rotations + SWAPs",
        "The state transforms into a superposition with specific phases",
        "Measure the output qubits 1000 times"
      ],
      output: "You get a roughly uniform distribution across all states (|000⟩ through |111⟩), but each has a different phase — the 'frequency fingerprint'."
    },

    mathFormula: "|j⟩ → (1/√N) Σ e^(2πi·j·k/N) |k⟩",
    mathExplanation:
      "Each input state |j⟩ becomes an equal superposition of all states, but with different phase angles. The phases encode the 'frequency' information.",

    keyConcepts: [
      "Fourier Transform",
      "Phase Encoding",
      "Controlled Rotations",
      "Exponential Speedup",
      "Building Block Algorithm"
    ],

    applications: [
      "Core part of Shor's factoring algorithm",
      "Quantum Phase Estimation",
      "Quantum simulation of physical systems",
      "Signal processing on quantum data"
    ],

    realWorldUse:
      "QFT isn't used on its own — it's like an engine inside bigger machines. Shor's algorithm (which can break RSA encryption) relies on QFT as its core component."
  },

  /* ───────────────────── GROVER'S SEARCH ───────────────────── */
  "grovers-search": {
    title: "Grover's Search Algorithm",
    subtitle: "Finding a needle in a haystack — quadratically faster",

    definition:
      "Grover's algorithm searches through an unsorted list to find a specific item. If a classical computer needs to check N items one by one, Grover's only needs about √N checks. For a list of 1 million items, that's 1000 checks instead of 1,000,000!",

    bulletPoints: [
      "Qubits needed: n (searches through 2ⁿ items)",
      "Key concept: Amplitude Amplification",
      "Quantum advantage: O(√N) vs O(N) classical — quadratic speedup",
      "Prerequisite: Superposition, Oracle concept"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Grover%27s_algorithm_geometry.png/500px-Grover%27s_algorithm_geometry.png",
    imageCaption:
      "Grover's Geometry — The algorithm rotates the state vector toward the target state like a compass needle finding north.",

    overview:
      `Imagine you have an unsorted phone book with 1 million names, and you need to find one specific person's number.

Classical search: Check names one by one. On average, you'll need to check 500,000 names. Worst case: all 1,000,000.

Grover's quantum search: ~1,000 checks. That's it!

How does it work? Two simple steps, repeated √N times:
1. ORACLE: Mark the correct answer with a negative sign (like highlighting it)
2. AMPLIFY: Boost the probability of the marked item while shrinking everything else

After enough repetitions, the marked item has nearly 100% probability of being measured.`,

    flow: [
      {
        step: "1. Create Equal Superposition",
        desc: "Apply H gates to all qubits. Now every possible answer has equal probability."
      },
      {
        step: "2. Oracle: Mark the Answer",
        desc: "The oracle flips the sign of the correct answer. (You don't need to know the answer — the oracle does the checking.)"
      },
      {
        step: "3. Amplify: Boost the Marked State",
        desc: "The diffusion operator increases the probability of the marked answer and decreases everything else."
      },
      {
        step: "4. Repeat Steps 2-3",
        desc: "Repeat the oracle + amplification about √N times for best results."
      },
      {
        step: "5. Measure",
        desc: "The correct answer appears with very high probability (~100% for small cases)."
      }
    ],

    example: {
      title: "Finding |11⟩ among 4 items",
      input: "2 qubits, searching for the state |11⟩ among 4 possible states (|00⟩, |01⟩, |10⟩, |11⟩)",
      steps: [
        "Apply H gates: all 4 states have 25% probability",
        "Oracle marks |11⟩: its amplitude becomes negative",
        "Diffusion operator amplifies |11⟩ to ~100%",
        "Only 1 iteration needed (since √4 = 2, and for 2 qubits 1 iteration suffices)"
      ],
      output: "Measuring gives |11⟩ with nearly 100% probability. Found the answer in 1 step instead of checking all 4!"
    },

    mathFormula: "Number of iterations ≈ (π/4) × √N",
    mathExplanation:
      "For N items, you need about (π/4)×√N repetitions of the oracle+amplification step. For N=1,000,000 items, that's about 785 iterations.",

    keyConcepts: [
      "Amplitude Amplification",
      "Oracle (marks the answer)",
      "Diffusion Operator",
      "Quadratic Speedup",
      "Unstructured Search"
    ],

    applications: [
      "Database search without sorting",
      "Solving optimization problems faster",
      "Cryptography — reduces brute-force attack time",
      "Constraint satisfaction (SAT) problems"
    ],

    realWorldUse:
      "Grover's algorithm impacts cryptography: a 128-bit encryption key effectively becomes only 64-bit secure against a quantum computer. This is why crypto standards are being updated for the quantum era."
  },

  /* ───────────────────── SHOR'S ALGORITHM ───────────────────── */
  "shor-simplified": {
    title: "Shor's Algorithm (Simplified)",
    subtitle: "Breaking big numbers into their prime factors — the algorithm that threatens modern encryption",

    definition:
      "Shor's algorithm can find the prime factors of a large number exponentially faster than any known classical algorithm. Since modern internet security (RSA encryption) relies on factoring being hard, Shor's algorithm could break most of today's encryption once large quantum computers exist.",

    bulletPoints: [
      "Qubits needed: ~2n+3 for an n-bit number",
      "Key concept: Quantum Period Finding + QFT",
      "Quantum advantage: Polynomial O(n³) vs Sub-exponential classical",
      "Prerequisite: QFT, Modular Arithmetic basics"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Shor%27s_algorithm.svg/640px-Shor%27s_algorithm.svg.png",
    imageCaption:
      "Shor's Algorithm Structure — Quantum part finds the period, classical part computes the factors.",

    overview:
      `Here's the big picture:

THE PROBLEM: Given a large number N (like 15, 21, or a 2048-bit number), find its prime factors.
Example: 15 = 3 × 5

WHY IT MATTERS: RSA encryption (used by banks, websites, governments) relies on the assumption that factoring large numbers is practically impossible. Shor's algorithm breaks that assumption.

HOW IT WORKS (simplified):
1. Pick a random number 'a' less than N
2. Find the "period" — how often a^x mod N repeats (this is the hard part)
3. Use the period to calculate the factors

The quantum part (step 2) uses superposition to try all values of x at once, then QFT to extract the repeating pattern. A classical computer would need to try each x one at a time.`,

    flow: [
      {
        step: "1. Pick a Random Number",
        desc: "Choose a random number 'a' that's less than N and doesn't share factors with N."
      },
      {
        step: "2. Create Superposition",
        desc: "Put the counting qubits into superposition — testing all possible exponents at once."
      },
      {
        step: "3. Compute a^x mod N",
        desc: "The quantum computer calculates a^x mod N for ALL values of x simultaneously."
      },
      {
        step: "4. Apply Inverse QFT",
        desc: "The Quantum Fourier Transform reveals the hidden repeating period in the results."
      },
      {
        step: "5. Extract Factors",
        desc: "Use the period and some simple math (GCD) to find the prime factors of N."
      }
    ],

    example: {
      title: "Factoring 15",
      input: "N = 15, we pick a = 7",
      steps: [
        "Compute 7^x mod 15 for x = 0,1,2,3,...",
        "Results: 1, 7, 4, 13, 1, 7, 4, 13, ... → the pattern repeats every 4 steps!",
        "Period r = 4",
        "Calculate GCD(7² - 1, 15) = GCD(48, 15) = 3",
        "Calculate GCD(7² + 1, 15) = GCD(50, 15) = 5"
      ],
      output: "Factors of 15 are 3 and 5! ✓"
    },

    mathFormula: "a^r ≡ 1 (mod N)  →  GCD(a^(r/2) ± 1, N) = factors",
    mathExplanation:
      "Find the period r (how often a^x mod N repeats), then use simple division (GCD) to get the factors. The quantum computer finds r exponentially faster.",

    keyConcepts: [
      "Period Finding",
      "Modular Arithmetic",
      "Quantum Fourier Transform",
      "RSA Encryption Vulnerability",
      "Post-Quantum Cryptography"
    ],

    applications: [
      "Breaking RSA and Diffie-Hellman encryption",
      "Driving the move to quantum-safe cryptography",
      "Number theory research",
      "Quantum computing benchmark"
    ],

    realWorldUse:
      "Shor's algorithm is the main reason governments and companies are racing to develop post-quantum cryptography (new encryption that quantum computers can't break). NIST has already selected new standards (Kyber, Dilithium) to replace RSA."
  },

  /* ───────────────────── VQE ───────────────────── */
  "vqe-h2": {
    title: "VQE — Variational Quantum Eigensolver",
    subtitle: "Using quantum + classical computers together to simulate molecules",

    definition:
      "VQE is a hybrid algorithm that uses BOTH a quantum computer and a classical computer working together. The quantum computer prepares and measures trial states of a molecule, while the classical computer tweaks the parameters to find the lowest energy — like tuning a radio to find the clearest station.",

    bulletPoints: [
      "Qubits needed: 2–20+ (depends on molecule size)",
      "Key concept: Guess, measure, adjust, repeat",
      "Quantum advantage: Simulates quantum systems naturally",
      "Prerequisite: Parameterized gates, optimization basics"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/VQE_algorithm_flowchart.svg/640px-VQE_algorithm_flowchart.svg.png",
    imageCaption:
      "VQE Loop — Quantum computer measures energy, classical computer adjusts parameters, repeat until minimum energy is found.",

    overview:
      `One of the most exciting uses of quantum computers is simulating molecules and chemical reactions. Even small molecules are incredibly hard to simulate on classical computers because electrons follow quantum mechanics.

VQE works like this:
1. GUESS: Start with some initial parameters (angles for quantum gates)
2. PREPARE: Build a quantum circuit with those parameters
3. MEASURE: Run the circuit and measure the energy
4. ADJUST: A classical optimizer tweaks the parameters to lower the energy
5. REPEAT: Go back to step 2 with new parameters

Keep repeating until you find the lowest possible energy — that's the molecule's ground state!

The cool part: VQE works on today's noisy quantum computers because the circuits are short and the classical optimizer handles the noise.`,

    flow: [
      {
        step: "1. Define the Molecule",
        desc: "Choose a molecule (e.g., H₂) and convert its properties into a format qubits can understand."
      },
      {
        step: "2. Build Parameterized Circuit",
        desc: "Create a quantum circuit with adjustable rotation angles (θ₁, θ₂, θ₃, ...)."
      },
      {
        step: "3. Run on Quantum Computer",
        desc: "Execute the circuit many times and measure the energy."
      },
      {
        step: "4. Classical Optimizer Updates",
        desc: "The classical computer analyzes the energy and adjusts the angles to try to get lower energy."
      },
      {
        step: "5. Repeat Until Converged",
        desc: "Keep iterating until the energy stops decreasing — you've found the ground state!"
      }
    ],

    example: {
      title: "Finding H₂ Ground State Energy",
      input: "Hydrogen molecule H₂ with 2 qubits and 4 adjustable parameters",
      steps: [
        "Start with random angles: θ = [0.5, 0.8, 0.3, 0.6]",
        "Build circuit with Ry gates and CNOT",
        "Measure energy → -1.05 Hartree",
        "Optimizer adjusts angles → θ = [0.4, 0.9, 0.2, 0.7]",
        "Measure again → -1.12 Hartree (lower!)",
        "After ~50 iterations → -1.137 Hartree (converged!)"
      ],
      output: "Ground state energy ≈ -1.137 Hartree — matches the known exact value for H₂!"
    },

    mathFormula: "E₀ ≤ ⟨ψ(θ)|H|ψ(θ)⟩ → minimize over θ",
    mathExplanation:
      "The measured energy is always greater than or equal to the true ground state energy. By minimizing over parameters θ, we get as close to the real answer as possible.",

    keyConcepts: [
      "Hybrid Quantum-Classical",
      "Variational Principle",
      "Parameterized Circuits",
      "Energy Minimization",
      "NISQ Algorithm"
    ],

    applications: [
      "Drug discovery — simulating molecular interactions",
      "Battery and material design",
      "Catalyst design for better chemical processes",
      "Understanding protein folding"
    ],

    realWorldUse:
      "VQE is one of the most promising near-term quantum applications. Companies like IBM, Google, and startups are using VQE to simulate molecules for drug discovery, battery design, and fertilizer production."
  },

  /* ───────────────────── QEC BIT FLIP ───────────────────── */
  "qec-bit-flip": {
    title: "Quantum Error Correction (Bit-Flip Code)",
    subtitle: "Protecting quantum information from errors — like spell-check for qubits",

    definition:
      "Quantum Error Correction protects fragile qubit states from random errors caused by noise. The 3-qubit bit-flip code works by storing one logical qubit across three physical qubits. If one qubit gets flipped by noise, the other two can 'vote' to detect and fix the error — like how you can still read 'HELO' as 'HELLO' because you know the correct spelling.",

    bulletPoints: [
      "Qubits needed: 5 (3 data + 2 helper qubits)",
      "Key concept: Redundancy + majority voting",
      "Quantum advantage: Protects quantum info without reading it",
      "Prerequisite: Multi-qubit gates, Entanglement"
    ],

    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Quantum_error_correction_of_bit_flip_using_three_qubits.svg/640px-Quantum_error_correction_of_bit_flip_using_three_qubits.svg.png",
    imageCaption:
      "3-Qubit Bit-Flip Code — One qubit is encoded into three copies. If one flips, the error is detected and corrected.",

    overview:
      `Quantum computers are extremely sensitive to errors. Random noise can flip a qubit from |0⟩ to |1⟩ (bit-flip error), and even tiny disturbances can ruin a computation.

The problem: You can't just copy a qubit (no-cloning theorem) or measure it to check (measurement destroys the state). So how do you protect it?

The solution: Spread the information across multiple qubits!

The 3-qubit bit-flip code:
1. ENCODE: Turn |ψ⟩ = α|0⟩ + β|1⟩ into α|000⟩ + β|111⟩ (using CNOT gates)
2. ERROR HAPPENS: Noise randomly flips one qubit (e.g., |000⟩ becomes |010⟩)
3. DETECT: Helper qubits check if pairs of data qubits agree (without reading the actual state)
4. FIX: Flip back the wrong qubit
5. DECODE: Convert back to the original single-qubit state

The clever part: The detection step tells you WHICH qubit flipped without revealing whether the state was |0⟩ or |1⟩!`,

    flow: [
      {
        step: "1. Encode",
        desc: "Spread the qubit's state across 3 qubits: α|0⟩ + β|1⟩ → α|000⟩ + β|111⟩."
      },
      {
        step: "2. Error Occurs",
        desc: "Noise flips one qubit randomly. For example, qubit 2 flips: |000⟩ → |010⟩."
      },
      {
        step: "3. Syndrome Measurement",
        desc: "Helper qubits check: 'Do qubit 1 and 2 agree? Do qubit 2 and 3 agree?' This reveals which qubit is wrong."
      },
      {
        step: "4. Correct the Error",
        desc: "Flip the identified bad qubit back to its correct state."
      },
      {
        step: "5. Decode",
        desc: "Convert back from 3 qubits to 1 qubit. The original state is perfectly recovered!"
      }
    ],

    example: {
      title: "Detecting and Fixing a Bit-Flip",
      input: "Qubit state |+⟩ = (|0⟩ + |1⟩)/√2 encoded as (|000⟩ + |111⟩)/√2",
      steps: [
        "Noise flips qubit 2: state becomes (|010⟩ + |101⟩)/√2",
        "Syndrome check: Q1 vs Q2 → different! Q2 vs Q3 → different!",
        "Syndrome result = '11' → tells us qubit 2 is the broken one",
        "Apply X gate to qubit 2 → back to (|000⟩ + |111⟩)/√2",
        "Decode → original |+⟩ state perfectly restored"
      ],
      output: "The error was detected and corrected without ever knowing if the qubit was |0⟩ or |1⟩!"
    },

    mathFormula: "|ψ_L⟩ = α|000⟩ + β|111⟩  (logical qubit = 3 physical qubits)",
    mathExplanation:
      "By encoding one qubit as three, you add redundancy. If one qubit flips, comparing pairs reveals the error location without disturbing the quantum state.",

    keyConcepts: [
      "Error Correction",
      "Syndrome Measurement",
      "Logical vs Physical Qubits",
      "No-Cloning Workaround",
      "Fault Tolerance"
    ],

    applications: [
      "Building reliable quantum computers",
      "Long-duration quantum memory",
      "Foundation for surface codes (used by Google, IBM)",
      "Enabling large-scale quantum algorithms"
    ],

    realWorldUse:
      "Error correction is THE biggest challenge in building useful quantum computers. Google's Willow chip and IBM's roadmap both focus heavily on error correction. Without it, quantum computers can't do anything meaningful at scale."
  }
};
