import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Copy, Xmark } from 'reicon-react';
import { useCircuit } from '../../lib/circuitStore';
import { circuitToQasm } from '../../utils/circuitToQasm';
import { circuitToQiskit } from '../../utils/circuitToQiskit';
import { parseCodeToCircuit } from '../../utils/codeToCircuit';
import Editor from '@monaco-editor/react';

export default function CodePanel({ open, onClose }) {
  const { state, dispatch } = useCircuit();
  const [activeTab, setActiveTab] = useState('qiskit');
  const [height, setHeight] = useState(300);
  
  const qasmCode = useMemo(() => circuitToQasm(state), [state]);
  const qiskitCode = useMemo(() => circuitToQiskit(state), [state]);
  
  const activeCode = activeTab === 'qiskit' ? qiskitCode : qasmCode;
  const activeLanguage = activeTab === 'qiskit' ? 'python' : 'plaintext';

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
          <button 
            className="qc-toolbar-btn"
            style={{ fontWeight: activeTab === 'qiskit' ? 700 : 500, color: activeTab === 'qiskit' ? 'var(--qt-accent)' : 'inherit', height: 24 }}
            onClick={() => setActiveTab('qiskit')}
          >
            Qiskit
          </button>
          <button 
            className="qc-toolbar-btn"
            style={{ fontWeight: activeTab === 'qasm' ? 700 : 500, color: activeTab === 'qasm' ? 'var(--qt-accent)' : 'inherit', height: 24 }}
            onClick={() => setActiveTab('qasm')}
          >
            OpenQASM
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
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
            readOnly: streamingCode !== null, // Prevent user edits while AI is typing
          }}
        />
      </div>
    </div>
  );
}
