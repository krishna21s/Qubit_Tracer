import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Copy, Xmark } from 'reicon-react';
import { useCircuit } from '../../lib/circuitStore';
import { circuitToQasm } from '../../utils/circuitToQasm';
import { circuitToQiskit } from '../../utils/circuitToQiskit';
import { parseCodeToCircuit } from '../../utils/codeToCircuit';
import { convertCircuitCode } from '../../utils/api';
import Editor from '@monaco-editor/react';

const TABS = [
  { id: 'qiskit',    label: 'Qiskit' },
  { id: 'qasm',      label: 'OpenQASM' },
  { id: 'cirq',      label: 'Cirq' },
  { id: 'pennylane', label: 'PennyLane' },
];

export default function CodePanel({ open, onClose }) {
  const { state, dispatch } = useCircuit();
  const [activeTab, setActiveTab] = useState('qiskit');
  const [height, setHeight] = useState(300);
  
  const qasmCode = useMemo(() => circuitToQasm(state), [state]);
  const qiskitCode = useMemo(() => circuitToQiskit(state), [state]);
  
  // ── Remote code (Cirq / PennyLane) ──────────────────────────────
  const [remoteCirqCode, setRemoteCirqCode] = useState('');
  const [remotePennylaneCode, setRemotePennylaneCode] = useState('');
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);        // bump to force re-fetch
  const fetchTimer = useRef(null);

  // Core fetch function
  const doConvert = useCallback(async (qasm) => {
    if (!qasm || !qasm.trim()) {
      setRemoteCirqCode('');
      setRemotePennylaneCode('');
      return;
    }
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const result = await convertCircuitCode(qasm);
      setRemoteCirqCode(result.cirq || '');
      setRemotePennylaneCode(result.pennylane || '');
    } catch (err) {
      console.error('Convert error:', err);
      setRemoteError(err.message || 'Conversion failed');
      setRemoteCirqCode(`# Error converting to Cirq:\n# ${err.message}`);
      setRemotePennylaneCode(`# Error converting to PennyLane:\n# ${err.message}`);
    } finally {
      setRemoteLoading(false);
    }
  }, []);

  // Fetch converted code whenever qasmCode changes OR retryKey bumps (debounced)
  useEffect(() => {
    clearTimeout(fetchTimer.current);

    if (!qasmCode || !qasmCode.trim()) {
      setRemoteCirqCode('');
      setRemotePennylaneCode('');
      return;
    }

    fetchTimer.current = setTimeout(() => doConvert(qasmCode), 600);

    return () => clearTimeout(fetchTimer.current);
  }, [qasmCode, retryKey, doConvert]);

  // Auto-retry when switching to a remote tab that has an error
  const isRemoteTab = activeTab === 'cirq' || activeTab === 'pennylane';
  useEffect(() => {
    if (isRemoteTab && remoteError) {
      setRetryKey(k => k + 1);
    }
  }, [activeTab]);  // intentionally only depends on activeTab

  // ── Derive active code / language from tab ──────────────────────
  const getActiveCode = () => {
    switch (activeTab) {
      case 'qiskit':    return qiskitCode;
      case 'qasm':      return qasmCode;
      case 'cirq':      return remoteLoading ? '# Loading Cirq code...' : remoteCirqCode;
      case 'pennylane': return remoteLoading ? '# Loading PennyLane code...' : remotePennylaneCode;
      default:          return qiskitCode;
    }
  };

  const activeCode = getActiveCode();
  const activeLanguage = activeTab === 'qasm' ? 'plaintext' : 'python';

  const [localCode, setLocalCode] = useState(activeCode);
  const [streamingCode, setStreamingCode] = useState(null); // Used when AI is typing
  
  const isTyping = useRef(false);
  const typingTimer = useRef(null);

  // ── AI Streaming Effects ─────────────────────────────────────────
  useEffect(() => {
    const handleAiStart = () => {
      setActiveTab('qiskit'); // AI only types qiskit code
      setStreamingCode('');
    };
    const handleAiType = (e) => {
      setStreamingCode(e.detail);
    };
    const handleAiDone = () => {
      setStreamingCode(null);
    };

    window.addEventListener('ai_code_start', handleAiStart);
    window.addEventListener('ai_code_type', handleAiType);
    window.addEventListener('ai_code_done', handleAiDone);

    return () => {
      window.removeEventListener('ai_code_start', handleAiStart);
      window.removeEventListener('ai_code_type', handleAiType);
      window.removeEventListener('ai_code_done', handleAiDone);
    };
  }, []);
  
  // ── Sync with global state ───────────────────────────────────────
  useEffect(() => {
    if (!isTyping.current) {
      setLocalCode(activeCode);
    }
  }, [activeCode]);

  useEffect(() => {
    setLocalCode(activeCode);
  }, [activeTab]);

  const handleEditorChange = (value) => {
    // Cirq/PennyLane tabs are read-only — don't process edits
    if (isRemoteTab) return;

    setLocalCode(value);
    isTyping.current = true;
    clearTimeout(typingTimer.current);
    
    try {
      const parsed = parseCodeToCircuit(value, activeTab);
      if (parsed) {
        dispatch({ type: 'UPDATE_CIRCUIT_FROM_CODE', payload: parsed });
      }
    } catch (e) {
      console.warn("Parse error:", e);
    }

    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
    }, 1500);
  };

  if (!open) return null;

  return (
    <div id="qc-code-panel" className="qc-props">
      <div className="qc-props-handle" />
      <div className="qc-props-header-flex" style={{ padding: '4px 16px 8px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className="qc-toolbar-btn"
              style={{
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? 'var(--qt-accent)' : 'inherit',
                height: 24,
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Retry button — visible on remote tabs when there's an error */}
          {isRemoteTab && remoteError && !remoteLoading && (
            <button
              className="qc-toolbar-btn"
              title="Retry conversion"
              onClick={() => setRetryKey(k => k + 1)}
              style={{ fontSize: 11, gap: 4, width: 'auto', padding: '0 8px', height: 24, color: '#ff6b6b' }}
            >
              ↻ Retry
            </button>
          )}
          <button 
            className="qc-toolbar-btn" 
            title="Copy to Clipboard"
            onClick={() => navigator.clipboard.writeText(localCode)}
            style={{ fontSize: 11, gap: 4, width: 'auto', padding: '0 8px', height: 24 }}
          >
            <Copy size={12}/> Copy
          </button>
          <button className="qc-toolbar-btn" onClick={onClose} style={{ width: 24, height: 24, minWidth: 24 }}>
            <Xmark size={14}/>
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          language={activeLanguage}
          theme="vs-dark"
          value={streamingCode !== null ? streamingCode : localCode}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Space Grotesk', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            readOnly: isRemoteTab || streamingCode !== null,
          }}
        />
      </div>
    </div>
  );
}

