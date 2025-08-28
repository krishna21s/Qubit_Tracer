# Classical Information Through Quantum Channels and Networked Quantum Information

## Protecting Classical Information with Quantum Channels

- Quantum error-correcting codes protect **quantum states** against noise.
- But what about **transmitting ordinary classical information** over a quantum channel?

### Superdense Coding

- **Charles Bennett & Stephen Wiesner (1992)**:
  - Showed how to transmit **two classical bits** while sending only **one quantum bit**.
  - This result is called **superdense coding**.

---

## Distributed Quantum Computation

- Scenario: Two **networked computers** solving a problem.
- Question: How much **communication** is needed?
- Discovery:
  - Quantum computers can require **exponentially less communication** than classical computers for some problems.
  - Limitations:
    - Current examples are not practically important.
    - Problems have **technical restrictions**.
- **Major challenge**: Find real-world problems where distributed quantum computation has a substantial advantage.

---

## Networked Information Theory

- **Classical networked information theory**:

  - Studies the information-carrying properties of **networks** of communication channels.
  - Well-developed and mathematically rich.

- **Quantum networked information theory**:
  - Still in its **infancy**.
  - Many basic questions remain unanswered.
  - Some striking preliminary results exist, but **no unifying theory** yet.

### A Counter-Intuitive Example

- Suppose we send quantum information from **Alice** to **Bob** through a noisy quantum channel.
- If the channel has **zero capacity** for quantum information:
  - Impossible to send information reliably.
- Even two identical channels used in synchrony have **zero capacity**.
- **Surprise**: If we reverse the direction of one channel, the combined setup **can sometimes have non-zero capacity** for sending information.
- **Implication**: Quantum information has counter-intuitive properties that classical systems lack.

---

# Cryptography: Secure Communication

## Broad Definition

- **Cryptography**: Communication or computation between two or more **potentially untrusting parties**.
- Best-known application: **Sending secret messages**.

Example:

> You give your credit card number to a merchant without allowing a third party to intercept it.

---

## Cryptographic Protocols

- A **cryptographic protocol** defines the rules for secure communication.
- Two main types:
  1. **Private Key Cryptosystems**
  2. **Public Key Cryptosystems** (covered later)

---

## Private Key Cryptosystems

- **Alice** and **Bob** share a **private key** (string of 0s and 1s).
- Process:
  1. Alice encrypts her message using the key.
  2. She sends the encrypted message to Bob.
  3. Bob decrypts it using the same private key.
- Security: Without the private key, decryption is impossible.

### The Key Distribution Problem

- **Core issue**: How do Alice and Bob share the key securely?
- If a third party intercepts the key during distribution, they can **decrypt all messages**.
- This problem can be **as hard as the original secure communication problem** itself.

# Quantum Cryptography and the Role of Entanglement

## Quantum Key Distribution (QKD)

- **Early Discovery**: Quantum mechanics can be used for key distribution in a way that **guarantees security** for Alice and Bob.
- **Known as**: Quantum Cryptography or Quantum Key Distribution (QKD).
- **Core Principle**:
  - Observation in quantum mechanics generally **disturbs the system** being observed.
  - If an eavesdropper is listening, their presence will appear as **disturbances** in the communications channel.
  - Alice and Bob can detect this disturbance, discard the compromised key bits, and start over.

### Historical Milestones

- **Late 1960s** – Stephen Wiesner proposes early quantum cryptographic ideas (initially rejected for publication).
- **1984** – Charles Bennett & Gilles Brassard develop the first **QKD protocol** (BB84), enabling secure key distribution with no possibility of compromise.
- Since then:
  - Many quantum cryptographic protocols have been proposed.
  - Experimental prototypes are close to being useful for **limited real-world applications**.

---

## Public Key Cryptosystems

- **Key Difference**: No need for Alice and Bob to share a secret key beforehand.
- **How it Works**:

  1. Bob publishes a **public key** (available to everyone).
  2. Alice encrypts her message using the public key.
  3. Bob decrypts the message using his **secret key**, known only to him.

- **Security Basis**:
  - The encryption transformation is chosen so that **inversion is extremely difficult** without the secret key.
  - Bob’s secret key makes decryption easy for him but infeasible for others.

### Historical Timeline

- **Mid-1970s** – Public key cryptography gains attention:
  - Independently proposed by **Whitfield Diffie & Martin Hellman** and **Ralph Merkle**.
  - Revolutionizes cryptography.
- **Later** – **Ronald Rivest, Adi Shamir, and Leonard Adleman** develop the **RSA cryptosystem**:
  - Widely deployed.
  - Balances security and usability.
- **1997 Disclosure** – These ideas were actually invented earlier (late 1960s–early 1970s) by researchers at **GCHQ**.

---

## The Security Foundation and the Quantum Threat

- **RSA Security**: Relies on the difficulty of **factoring large numbers** on a classical computer.
- **Shor’s Algorithm**:
  - Efficiently factors integers on a **quantum computer**.
  - Could break RSA and other systems based on the discrete logarithm problem.
- **Implication**: Quantum computers pose a serious threat to many existing public key cryptosystems.

---

## Quantum Entanglement as a Resource

- **Definition**: A uniquely quantum mechanical property where particles become **linked** so that the state of one affects the other, regardless of distance.
- **Importance**:
  - Plays a central role in many applications of quantum computation and quantum information.
  - Considered a **fundamental resource**—comparable to energy, entropy, and information.
- **Research Goals**:
  - Understand entanglement more deeply.
  - Develop new applications for quantum technologies.
- **Current Status**:
  - No complete theory of entanglement yet.
  - Some progress has been made, fueling hope for future breakthroughs.