import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import './chatInput.css';
// Import Markdown and Math rendering libraries
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Import KaTeX stylesheet for math formatting.
// Your build setup (like Webpack or Vite) must be configured to handle CSS imports.
import 'katex/dist/katex.min.css';

// Using a placeholder for the image to resolve the path error.
const QbotImg = 'https://placehold.co/60x60/122A4A/EAF6FF?text=Q';

// Quantum Lens-inspired dark color palette
const CARD_BG = "rgba(18, 27, 43, 0.98)";
const USER_BG = "linear-gradient(90deg, #1271e0 60%, #4cc3fa 120%)";
const ASSISTANT_BG = "rgba(31, 54, 80, 0.99)";
const BORDER_COLOR = "#253b54";
const PLACEHOLDER_COLOR = "#b5d1f6";

const QuantumBotAssistant = () => {
  const [isOpen, setIsOpen] = useState(true); // Default to true for easier previewing
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    // Example message to show formatting on load
    {
      role: 'assistant',
      text: 'Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.'
    }
  ]);
  const chatRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [audio, setAudio] = useState(null);
  let recognition;
  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isOpen]);
  // At the top of your component
  const currentAudioRef = useRef(null); // React version. If not using React, use a global variable.


  // Example language options (customize as needed)
  const LANGUAGE_OPTIONS = [
    { code: "en-US", label: "English" },
    { code: "hi-IN", label: "Hindi" },
    { code: "te-IN", label: "Telugu" }
  ];

  const [language, setLanguage] = useState("en-US");

  const [showMenu, setShowMenu] = useState(false);

  // To close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e) {
      if (!e.target.closest(".more-menu-container")) setShowMenu(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  // Handle asking question
  const handleAsk = async () => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/query", {
        query: query,
        top_k: 5,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.answer, // The backend should send Markdown with LaTeX
          sources: res.data.contexts || [],
        },
      ]);
    } catch (err) {
      // Mock response for demonstration if API fails
      const mockAnswer = `You asked about "${query}". In quantum mechanics, the probability amplitude is a complex number whose modulus squared gives the probability. For a state $$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$, the probabilities are $|\\alpha|^2$ and $|\\beta|^2$.`
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "API Error. Showing mock response: " + mockAnswer,
        },
      ]);
    }
    setQuery("");
    setLoading(false);
  };

  // "Enter" to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleAsk();
    }
  };


  const startRecognition = () => {
    // Stop any currently playing audio before starting new recognition
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      console.log("Stopped previous audio due to new input.");
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language; // <- use selected language

    recognition.onstart = () => {
      setListening(true);
      console.log("Speech recognition started.");
    };

    recognition.onend = () => {
      setListening(false);
      console.log("Recognition ended.");
      // No auto-restart!
    };

    recognition.onresult = async (event) => {
      if (
        !event.results ||
        !event.results[0] ||
        !event.results[0][0] ||
        !event.results[0][0].transcript
      ) {
        console.error("No transcript available.");
        return;
      }
      const transcript = event.results[0][0].transcript;
      setMessages((prev) => [...prev, { role: "user", text: transcript }]);
      console.log("Transcript:", transcript);

      try {
        const res = await axios.post("http://127.0.0.1:8000/voice-assist", {
          query: transcript,
          lang: language, // <- send language to backend!
        });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: res.data.reply },
        ]);

        if (res.data.audio) {
          const audioUrl = "http://127.0.0.1:8000" + res.data.audio;
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          audio.onended = () => {
            currentAudioRef.current = null;
            console.log("Bot finished speaking.");
          };

          audio.onerror = (e) => {
            currentAudioRef.current = null;
            console.error("Audio playback error:", e);
          };

          try {
            await audio.play();
          } catch (playErr) {
            currentAudioRef.current = null;
            console.error("Error playing audio:", playErr);
          }
        }
      } catch (error) {
        console.error("Voice Assist Error:", error);
        alert("There was an error communicating with the assistant.");
      }
    };

    recognition.onerror = (err) => {
      setListening(false);
      console.error("Speech recognition error:", err);
      alert("Speech recognition error: " + err.error);
    };

    recognition.start();
  };




  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 9999,
          background: CARD_BG,
          color: "#fff",
          border: `2px solid ${BORDER_COLOR}`,
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          boxShadow: "0 4px 20px rgba(10,28,60,0.36)",
          cursor: "pointer",
          outline: "none",
          fontSize: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background .2s",
          padding: 0,
        }}
        aria-label="Open Quantum Assistant"
      >
        {isOpen ? "✖" :
          <img
            src={QbotImg}
            alt="QBot Assistant"
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: "cover",
              filter: "drop-shadow(0 0 6px #38b8ff70)",
            }}
          />
        }
      </button>

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "36px",
            width: "370px",
            maxWidth: "96vw",
            height: "500px",
            maxHeight: "80vh",
            background: CARD_BG,
            backdropFilter: "blur(8px)",
            borderRadius: "18px",
            boxShadow: "0 8px 36px rgba(10,28,60,0.31)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Segoe UI, sans-serif",
            overflow: "hidden",
            border: `1.5px solid ${BORDER_COLOR}`,
            transition: "all .25s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 22px 10px 22px",
              borderBottom: `1px solid ${BORDER_COLOR}`,
              fontWeight: 600,
              fontSize: "17px",
              letterSpacing: "0.02em",
              color: "#eaf6ff",
              background: "transparent",
              textAlign: "left",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 22, marginRight: 6 }}>
              <img src={QbotImg} alt="QBot Assistant" style={{ width: 38, height: 38, borderRadius: 6, background: "#1f3850", objectFit: "cover" }} />
            </span>
            <span style={{ marginBottom: 10 }}>Quantum Computing Assistant</span>
          </div>

          {/* Chat area */}
          <div
            ref={chatRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 18px 8px 18px",
              background: "transparent",
              scrollBehavior: "smooth",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "13px",
                }}
              >
                <div
                  style={{
                    padding: "10px 15px",
                    borderRadius: "8px",
                    maxWidth: "78%",
                    background: msg.role === "user" ? USER_BG : ASSISTANT_BG,
                    color: "#fff",
                    fontSize: "12px",
                    lineHeight: "1.6",
                    boxShadow: msg.role === "user"
                      ? "0 2px 8px #1271e01a"
                      : "0 2px 8px #1f38501a",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.role === 'user' ? (
                    <div style={{ textAlign: "start", fontSize: 13 }}>{msg.text}</div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ node, ...props }) => <p style={{ margin: '0 0 10px 0', padding: 0, textAlign: 'start', fontSize: 13, lineHeight: '1.6' }} {...props} />,
                        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '10px 0' }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: ASSISTANT_BG,
                    color: "#f2faff",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    opacity: 0.68,
                    boxShadow: "0 2px 8px #1f385011",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <form
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(90deg, #131c2a 0%, #17294a 100%)",
              borderTop: `1px solid ${BORDER_COLOR}`,
              padding: "12px 14px",
              boxShadow: "0 -2px 16px #00000018",
              position: "relative",
              zIndex: 10,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) handleAsk();
            }}
          >
            <textarea
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                padding: "11px 13px",
                fontSize: "16px",
                borderRadius: "10px",
                border: `1.5px solid ${BORDER_COLOR}`,
                outline: "none",
                background: "#141d2c",
                color: "#e6f0fa",
                minHeight: "44px",
                maxHeight: "90px",
                boxShadow: "0 2px 8px #1271e01a",
                boxSizing: "border-box",
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                transition: "border .2s",
              }}
              placeholder="Type your quantum question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              autoFocus
              className="no-scrollbar"
            />

            {/* 3-dots more menu */}
            <div className="more-menu-container">
              <button
                type="button"
                className="more-menu-button"
                aria-label="More options"
                onClick={() => setShowMenu(m => !m)}
              >
                <span style={{ fontSize: "22px", fontWeight: "bold" }}>⋯</span>
              </button>
              {showMenu && (
                <div className="more-menu-dropdown">
                  <label style={{ fontSize: "14px", color: "#e6f0fa", marginBottom: "4px" }}>Language</label>
                  <select
                    value={language}
                    onChange={e => {
                      setLanguage(e.target.value);
                      setShowMenu(false);
                    }}
                    style={{
                      background: "#17294a",
                      color: "#e6f0fa",
                      border: "none",
                      borderRadius: "7px",
                      fontSize: "14px",
                      fontWeight: 500,
                      padding: "6px 10px",
                      outline: "none",
                      appearance: "none",
                      cursor: "pointer",
                      minWidth: "110px"
                    }}
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                minWidth: "34px",
                height: "34px",
                background: loading
                  ? "#253b54"
                  : "linear-gradient(90deg,#1271e0 40%,#4cc3fa 120%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 6px #1271e01a",
                transition: "background .2s, transform .1s",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                padding: 0
              }}
              disabled={loading}
              aria-label="Send"
            >
              {loading ? (
                <span style={{ fontSize: 15, opacity: 0.7 }}>...</span>
              ) : (
                <span style={{ fontSize: 17 }}>➤</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => startRecognition()}
              style={{
                minWidth: "34px",
                height: "34px",
                background: listening
                  ? "linear-gradient(100deg, #4cc3fa 40%, #1271e0 120%)"
                  : "#253b54",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: listening ? "0 0 0 4px #1271e022" : "none",
                transition: "background 0.3s, box-shadow 0.2s",
                padding: 0
              }}
              aria-label="Voice Assist"
              className={listening ? "pulse-mic" : ""}
            >
              {listening ? "🎙️" : "🎤"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default QuantumBotAssistant;
