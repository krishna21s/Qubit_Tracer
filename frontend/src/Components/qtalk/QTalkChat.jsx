import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const QbotImg = 'https://placehold.co/44x44/122A4A/EAF6FF?text=Q';

const LANGUAGE_OPTIONS = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
];

export default function QTalkChat({ session, onSessionUpdate, headerRight }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const chatRef = useRef(null);
  const currentAudioRef = useRef(null);

  const messages = session?.messages || [];

  // Keep a ref to the latest messages to avoid stale-closure overwrites
  const latestMessagesRef = useRef(messages);
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Derive dynamic title (first user message snippet) if untitled
  useEffect(() => {
    if (!session) return;
    if (!session.title || session.title === 'New chat' || session.title === 'Untitled') {
      const firstUser = (session.messages || []).find(m => m.role === 'user');
      if (firstUser && firstUser.text) {
        const t = (firstUser.text || '').slice(0, 36).trim();
        if (t) {
          onSessionUpdate({ ...session, title: t, updatedAt: Date.now() });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.messages?.length]);

  // Append message using the freshest list to prevent losing the just-sent user message
  const pushMessage = (role, text, extras = {}) => {
    const base = latestMessagesRef.current || [];
    const updated = {
      ...session,
      messages: [...base, { role, text, ...extras }],
      updatedAt: Date.now()
    };
    onSessionUpdate(updated);
  };

  const handleAsk = async () => {
    const text = query.trim();
    if (!text) return;
    pushMessage('user', text);
    setQuery('');
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/query', { query: text, top_k: 5 });
      pushMessage('assistant', res.data.answer || 'No answer.');
    } catch (err) {
      const mock = `API Error. Showing mock response: You asked "${text}". In quantum mechanics, probabilities are squares of amplitudes.`;
      pushMessage('assistant', mock);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleAsk();
    }
  };

  const startRecognition = () => {
    // Stop any playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = async (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (!transcript) return;
      pushMessage('user', transcript);
      try {
        const res = await axios.post('http://127.0.0.1:5000/voice-assist', {
          query: transcript,
          lang: language
        });
        pushMessage('assistant', res.data.reply || 'No reply.');
        if (res.data.audio) {
          const audioUrl = 'http://127.0.0.1:5000' + res.data.audio;
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => { currentAudioRef.current = null; };
          try { await audio.play(); } catch { currentAudioRef.current = null; }
        }
      } catch {
        alert('Voice Assist error.');
      }
    };
    recognition.onerror = (err) => {
      setListening(false);
      alert('Speech recognition error: ' + err.error);
    };
    recognition.start();
  };

  const clearChat = () => {
    onSessionUpdate({ ...session, messages: [], updatedAt: Date.now() });
  };

  return (
    <div className="qtalk-chat-wrap">
      {/* Header */}
      <div className="qtalk-chat-header">
        <div className="qtalk-chat-title">
          <img src={QbotImg} alt="Q" className="qtalk-logo" />
          <div>
            <div className="qtalk-title-text">{session?.title || 'QTalk'}</div>
            <div className="qtalk-sub">LLM Assistant • Voice + Markdown</div>
          </div>
        </div>
        <div className="qtalk-header-actions">
          {headerRight}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="qtalk-language"
            title="Transcription language"
          >
            {LANGUAGE_OPTIONS.map(o => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
          <button className="qtalk-btn" title="Clear chat" onClick={clearChat}>Clear</button>
        </div>
      </div>

      {/* Messages */}
      <div className="qtalk-chat-body"  ref={chatRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`qtalk-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
            {m.role === 'assistant' && <div className="qtalk-avatar">Q</div>}
            <div className={`qtalk-bubble ${m.role}`}>
              {m.role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ node, ...props }) => <p style={{ margin: '0 0 10px 0', padding: 0, textAlign: 'start', fontSize: 14, lineHeight: 1.6 }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '10px 0' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="qtalk-msg assistant">
            <div className="qtalk-avatar">Q</div>
            <div className="qtalk-bubble assistant">Thinking…</div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="qtalk-input-row"
        onSubmit={(e) => { e.preventDefault(); if (!loading) handleAsk(); }}
      >
        <textarea
          className="qtalk-input"
          placeholder="Type your question…"
          rows={1}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="qtalk-input-actions">
          <button type="button" className={`qtalk-mic ${listening ? 'active' : ''}`} onClick={startRecognition}>
            {listening ? '🎙️' : '🎤'}
          </button>
          <button type="submit" className="qtalk-send" disabled={loading}>
            {loading ? '...' : '➤'}
          </button>
        </div>
      </form>
    </div>
  );
}