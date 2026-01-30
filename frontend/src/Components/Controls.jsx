import React, { useState, useEffect } from 'react';
import { simulateCircuit } from '../utils/api';
import CircuitBuilderModal from './circuit/CircuitBuilderModal';
import { useSimulation } from '../context/SimulationContext'; // context-based result storage
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';

import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
// QASM2-safe normalization to avoid "'p'/'sx'/'sxdg'/'i' is not defined" errors.
function normalizeQasmForQasm2(qasm) {
  if (!qasm) return qasm;
  let text = qasm.replace(/\r\n/g, '\n');

  // i -> id
  text = text.replace(/(^|\n)\s*i\s+q\[(\d+)\];/gi, (_m, p1, q) => `${p1}id q[${q}];`);

  // p(λ) -> u1(λ)
  text = text.replace(/(^|\n)\s*p\s*\(\s*([^)]+)\s*\)\s*q\[(\d+)\];/gi, (_m, p1, angle, q) => {
    return `${p1}u1(${angle}) q[${q}];`;
  });

  // sx -> u3(pi/2,-pi/2,pi/2)
  text = text.replace(/(^|\n)\s*sx\s+q\[(\d+)\];/gi, (_m, p1, q) => {
    return `${p1}u3(${Math.PI / 2},${-Math.PI / 2},${Math.PI / 2}) q[${q}];`;
  });

  // sxdg -> u3(pi/2,pi/2,-pi/2)
  text = text.replace(/(^|\n)\s*sxdg\s+q\[(\d+)\];/gi, (_m, p1, q) => {
    return `${p1}u3(${Math.PI / 2},${Math.PI / 2},${-Math.PI / 2}) q[${q}];`;
  });

  // Ensure explicit measure mapping -> c[i]
  let hasMeasure = false;
  text = text.replace(/(^|\n)\s*measure\s+q\[(\d+)\]\s*;/gi, (_m, p1, qi) => {
    hasMeasure = true;
    const i = parseInt(qi, 10);
    return `${p1}measure q[${i}] -> c[${i}];`;
  });
  if (/(^|\n)\s*measure\s+q\[(\d+)\]\s*->\s*c\[(\d+)\]\s*;/i.test(text)) {
    hasMeasure = true;
  }

  // Headers and creg
  const hasOpen = /(^|\n)\s*OPENQASM\s+2\.0;\s*($|\n)/i.test(text);
  const hasIncl = /(^|\n)\s*include\s+"qelib1\.inc";\s*($|\n)/i.test(text);
  const qregMatch = text.match(/(^|\n)\s*qreg\s+q\[(\d+)\];/i);
  const hasQreg = !!qregMatch;

  let numQubits = 0;
  if (qregMatch) {
    numQubits = parseInt(qregMatch[2], 10) || 0;
  } else {
    const indices = Array.from(text.matchAll(/q\[(\d+)\]/g)).map(m => parseInt(m[1], 10));
    const maxIdx = indices.length ? Math.max(...indices) : -1;
    numQubits = Math.max(1, maxIdx + 1);
  }
  const hasCreg = /(^|\n)\s*creg\s+c\[(\d+)\];\s*($|\n)/i.test(text);

  const headerLines = [];
  if (!hasOpen) headerLines.push('OPENQASM 2.0;');
  if (!hasIncl) headerLines.push('include "qelib1.inc";');
  if (!hasQreg) headerLines.push(`qreg q[${numQubits}];`);
  if (hasMeasure && !hasCreg) headerLines.push(`creg c[${numQubits}];`);

  if (headerLines.length) {
    text = `${headerLines.join('\n')}\n${text.trimStart()}`;
  } else if (hasMeasure && !hasCreg) {
    const lines = text.split('\n');
    const idx = lines.findIndex(l => /^\s*qreg\s+q\[\d+\];/i.test(l));
    if (idx >= 0) {
      lines.splice(idx + 1, 0, `creg c[${numQubits}];`);
      text = lines.join('\n');
    } else {
      text = `creg c[${numQubits}];\n${text}`;
    }
  }

  return text;
}

/**
 * Controls
 * - Uses SimulationContext for the active simulation result.
 * - Keeps existing UI & modal builder.
 */
export default function Controls({
  setLoading,
  loading,
  onBuilderOpenChange
}) {
  const { updateSimulationResult, setShouldAutoOpenViewer } = useSimulation();

  const [choice, setChoice] = useState('bell');          // 'bell' | 'ghz' | 'custom'
  const [templateQasm, setTemplateQasm] = useState('');
  const [workingQasm, setWorkingQasm] = useState('');
  const [savedBuilderQasm, setSavedBuilderQasm] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);

  // Notify parent when builder state changes
  useEffect(() => {
    if (onBuilderOpenChange) {
      onBuilderOpenChange(builderOpen);
    }
  }, [builderOpen, onBuilderOpenChange]);

  useEffect(() => {
    if (choice === 'bell') {
      const bell = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
h q[0];
cx q[0],q[1];`;
      setTemplateQasm(bell);
      setWorkingQasm(bell);
      setSavedBuilderQasm(bell);
    } else if (choice === 'ghz') {
      const ghz = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
h q[0];
cx q[0],q[1];
cx q[0],q[2];`;
      setTemplateQasm(ghz);
      setWorkingQasm(ghz);
      setSavedBuilderQasm(ghz);
    }
  }, [choice]);

  const computeActiveQasm = () => {
    if (choice === 'custom') {
      return savedBuilderQasm || workingQasm || templateQasm;
    }
    return templateQasm;
  };

  const run = async () => {
    let active = computeActiveQasm();
    if (!active || !active.trim()) {
      alert('No OpenQASM to simulate.');
      return;
    }

    // Normalize only for custom runs to keep backend error-free
    if (choice === 'custom') {
      active = normalizeQasmForQasm2(active);
      setSavedBuilderQasm(active);
      setWorkingQasm(active);
    }

    setLoading(true);
    try {
      const payload = (choice === 'custom')
        ? { type: 'custom', qasm: active }
        : { type: choice };

      const res = await simulateCircuit(payload);
      if (updateSimulationResult) {
        updateSimulationResult(res);
      }
      if (setShouldAutoOpenViewer) {
        setShouldAutoOpenViewer(true);
      }
    } catch (e) {
      console.error('API error', e);
      alert('API error: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    if (updateSimulationResult) updateSimulationResult(null);
    setTemplateQasm('');
    setWorkingQasm('');
    setSavedBuilderQasm('');
    setChoice('bell');
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          className={`btn ${choice === 'bell' ? 'active' : ''}`}
          onClick={() => setChoice('bell')}
          disabled={loading}
        >
        BELL
        </button>
        <button
          className={`btn ${choice === 'ghz' ? 'active' : ''}`}
          onClick={() => setChoice('ghz')}
          disabled={loading}
        >
          GHZ
        </button>
        <button
          className={`btn secondary ${choice === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setChoice('custom');
            setBuilderOpen(true);
          }}
          disabled={loading}
        >
          CUSTOM BUILDER 
        </button>
      </div>

      {choice === 'custom' && !builderOpen && (
        <div style={{ marginTop: 6, color: '#85b7ce' }}>
          Custom circuit ready. Re-open builder to continue editing.
          <div style={{ marginTop: 6 }}>
            <button
              className="btn secondary"
              onClick={() => {
                setWorkingQasm(savedBuilderQasm);
                setBuilderOpen(true);
              }}
              disabled={loading}
            >
              Re-open Builder
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <button className="btn " onClick={run}           style={{fontSize:'0.9rem' }}
 disabled={loading}>
          {loading ? 'Simulating...' : 'Simulate'}<KeyboardArrowRightRoundedIcon/>
        </button>
        <button
          className="btn secondary"
          style={{ marginLeft: 8 ,fontSize:'0.9rem' }}
          onClick={resetAll}
          disabled={loading}
        >
          Reset<RestartAltRoundedIcon/>
        </button>
      </div> 

      {/* Modal builder (unchanged UI) */}
      <CircuitBuilderModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        workingQasm={workingQasm}
        setWorkingQasm={setWorkingQasm}
        onApply={(finalQasm) => {
          const normalized = normalizeQasmForQasm2(finalQasm);
          setSavedBuilderQasm(normalized);
          setWorkingQasm(normalized);
          setChoice('custom');
        }}
      />
    </div>
  );
}