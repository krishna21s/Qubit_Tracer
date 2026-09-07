import React, { useState, useRef, useEffect } from 'react';
import { Xmark, Send, WandSparkle, Cpu, User, Mic, Image } from 'reicon-react';

import { useCircuit } from '../../lib/circuitStore';
import { parseCodeToCircuit } from '../../utils/codeToCircuit';
import { circuitToQiskit } from '../../utils/circuitToQiskit';
import { getApiBaseUrl } from '../../utils/api';

import ReactMarkdown from 'react-markdown';

export default function AIChatPanel({ open, onClose, onOpenCode }) {
  const { state, dispatch } = useCircuit();
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am the Q-Pilot Agent. I can build quantum algorithms for you. Try asking me to "Create a 5-qubit circuit with H gates and CNOT".' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch models on mount using dynamic API base URL
    const API_BASE = getApiBaseUrl();
    fetch(`${API_BASE}/api/ai/models`)
      .then(res => res.json())
      .then(data => {
        if (data.models && data.models.length > 0) {
          setModels(data.models);
        }
      })
      .catch(err => console.error("Failed to fetch models:", err));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Simulate typing effect for code by emitting events to the CodePanel
  const simulateTyping = (codeText, explanationText, onComplete) => {
    let index = 0;
    
    // 1. Open the CodePanel and notify it to prepare for typing
    if (onOpenCode) onOpenCode();
    window.dispatchEvent(new CustomEvent('ai_code_start'));
    
    // 2. Add only the text explanation to the chat
    setMessages(prev => {
      const newArr = [...prev];
      newArr.push({ role: 'ai', text: explanationText }); // No code property!
      return newArr;
    });

    // 3. Type character by character into the CodePanel
    const interval = setInterval(() => {
      if (index < codeText.length) {
        index++;
        window.dispatchEvent(new CustomEvent('ai_code_type', { detail: codeText.slice(0, index) }));
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        clearInterval(interval);
        window.dispatchEvent(new CustomEvent('ai_code_done'));
        onComplete();
      }
    }, 10); // slightly faster (10ms)
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || isGenerating) return;
    
    const userPrompt = input.trim();
    setInput('');
    const currentImage = attachedImage;
    setAttachedImage(null);

    setMessages(prev => [...prev, { role: 'user', text: userPrompt, image: currentImage?.url }]);
    setIsGenerating(true);

    try {
      const API_BASE = getApiBaseUrl();
      const currentCircuitCode = circuitToQiskit(state);
      const history = messages.map(m => ({ role: m.role, text: m.text, code: m.code }));
      
      const response = await fetch(`${API_BASE}/api/circuit/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userPrompt, 
          model_id: selectedModel, 
          image: currentImage?.data,
          current_circuit: currentCircuitCode,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate circuit');
      }

      const data = await response.json();
      let code = data.code || "";
      
      // If the generated code is identical to what we already have, don't re-apply it unnecessarily
      const normalize = (str) => str.replace(/\s+/g, '').trim();
      if (normalize(code) === normalize(currentCircuitCode)) {
        code = "";
      }

      const explanation = data.explanation || (code ? "I have generated the following code:" : "I don't have any code changes, but here is what I found:");
      setIsGenerating(false);

      if (code) {
        // If there's code, we type it out
        simulateTyping(code, explanation, () => {
          try {
            const parsed = parseCodeToCircuit(code, 'qiskit');
            if (parsed && parsed.gates && parsed.gates.length >= 0) { // even empty circuit is valid
              dispatch({ type: 'UPDATE_CIRCUIT_FROM_CODE', payload: parsed });
            }
          } catch (parseErr) {
            console.error(parseErr);
            setMessages(prev => [...prev, {
              role: 'ai',
              text: 'I generated the code, but there was an error rendering it on the canvas.'
            }]);
          }
        });
      } else {
        // Just an explanation response
        setMessages(prev => [...prev, { role: 'ai', text: explanation }]);
      }

    } catch (err) {
      setIsGenerating(false);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message}` }]);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.start();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setAttachedImage({ data: base64String, url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`qc-ai-drawer ${!open ? 'closed' : ''}`} style={{
      width: open ? 350 : 0,
      minWidth: open ? 350 : 0,
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      background: 'var(--qt-surface)', 
      borderRight: open ? '1px solid var(--qt-border)' : 'none',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
      zIndex: 10,
      transition: 'width 0.25s ease, min-width 0.25s ease, opacity 0.25s ease'
    }}>
      <div style={{ width: 350, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid var(--qt-border)',
          background: 'var(--qt-surface-alt)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--qt-accent)' }}>
            <WandSparkle size={18} /> Q-Pilot Agent
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select 
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={{
                background: 'var(--qt-surface)',
                color: 'var(--qt-text)',
                border: '1px solid var(--qt-border)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: 11,
                outline: 'none',
                maxWidth: '120px'
              }}
            >
              {models.length > 0 ? (
                models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))
              ) : (
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              )}
            </select>
            <button className="qc-toolbar-btn" onClick={onClose}>
              <Xmark size={18} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, 
                color: 'var(--qt-text-dim)', textTransform: 'uppercase' 
              }}>
                {m.role === 'user' ? <User style={{ fontSize: 14 }} /> : <Cpu style={{ fontSize: 14, color: 'var(--qt-accent)' }} />}
                {m.role === 'user' ? 'You' : 'Agent'}
              </div>
              
              <div style={{
                background: m.role === 'user' ? 'var(--qt-accent)' : 'var(--qt-surface-alt)',
                color: m.role === 'user' ? '#fff' : 'var(--qt-text)',
                padding: '10px 14px', borderRadius: '12px', fontSize: 13,
                maxWidth: '90%', lineHeight: 1.5,
                borderBottomRightRadius: m.role === 'user' ? 2 : 12,
                borderBottomLeftRadius: m.role === 'user' ? 12 : 2,
              }}>
                {m.image && (
                  <img src={m.image} alt="User attachment" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8 }} />
                )}
                <div className="qc-ai-markdown">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--qt-text-dim)' }}>
              <Cpu style={{ fontSize: 14, color: 'var(--qt-accent)' }} />
              <div style={{ fontSize: 12, fontStyle: 'italic' }}>Agent is analyzing...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--qt-border)', background: 'var(--qt-surface)' }}>
          {attachedImage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, background: 'var(--qt-surface-alt)', padding: 8, borderRadius: 8 }}>
              <img src={attachedImage.url} alt="Attached" style={{ height: 40, borderRadius: 4 }} />
              <button className="qc-toolbar-btn" onClick={() => setAttachedImage(null)} style={{ marginLeft: 'auto' }}>
                <Xmark size={18} />
              </button>
            </div>
          )}
          <div style={{ 
            display: 'flex', background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)',
            borderRadius: 24, padding: '4px 8px 4px 16px', alignItems: 'center', gap: 4 
          }}>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
            />
            <button className="qc-toolbar-btn" style={{ padding: 4 }} title="Attach Image" onClick={() => fileInputRef.current?.click()}>
              <Image style={{ fontSize: 18, color: 'var(--qt-text-dim)' }} />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder={isListening ? "Listening..." : "Ask me to build a circuit..."}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--qt-text)', fontSize: 13
              }}
            />
            <button className="qc-toolbar-btn" style={{ padding: 4 }} title="Voice Input" onClick={handleMicClick}>
              <Mic style={{ fontSize: 18, color: isListening ? 'red' : 'var(--qt-text-dim)' }} />
            </button>
            <button 
              onClick={handleSend}
              disabled={isGenerating || (!input.trim() && !attachedImage)}
              style={{
                background: (input.trim() || attachedImage) && !isGenerating ? 'var(--qt-accent)' : 'var(--qt-border)',
                color: '#fff', border: 'none', width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (input.trim() || attachedImage) && !isGenerating ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', marginLeft: 4
              }}
            >
              <Send style={{ fontSize: 14, marginLeft: 2 }} />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
