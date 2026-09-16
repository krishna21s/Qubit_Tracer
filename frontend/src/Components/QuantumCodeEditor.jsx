import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const quantumCode = `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Create a Quantum Circuit acting on a quantum register of three qubits
circ = QuantumCircuit(3)

# Add a H gate on qubit 0, putting this qubit in superposition
circ.h(0)

# Add a CX (CNOT) gate on control qubit 0 and target qubit 1
circ.cx(0, 1)
# Add a CX (CNOT) gate on control qubit 0 and target qubit 2
circ.cx(0, 2)

# Set up the simulator
simulator = AerSimulator()

# Compile and run the circuit
compiled_circuit = transpile(circ, simulator)
job = simulator.run(compiled_circuit, shots=1000)

# Get the results
result = job.result()
counts = result.get_counts(circ)

print("Quantum Circuit successfully designed!")
print("Simulation counts:", counts)
`;

export default function QuantumCodeEditor() {
  const [displayedCode, setDisplayedCode] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedCode(quantumCode.substring(0, i));
      i++;
      if (i > quantumCode.length) clearInterval(interval);
    }, 20); // 20ms per character for a realistic fast typing speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '110%',
      maxWidth: '700px',
      height: '350px',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      backgroundColor: '#1e1e1e'
    }}
    >
      {/* Fake macOS window header */}
      <div style={{
        height: '32px',
        backgroundColor: '#2d2d2d',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '8px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }} />
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
        <div style={{ marginLeft: '16px', fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>quantum_chip.py</div>
      </div>
      
      <div style={{ padding: '8px', height: 'calc(100% - 32px)' }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={displayedCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            readOnly: true,
            wordWrap: 'on',
            padding: { top: 16 },
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          }}
        />
      </div>
    </div>
  );
}
