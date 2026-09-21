import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Sparkles,
  User,
  Mic,
  MicOff,
  Send,
  RotateCcw,
  Play,
  Pause,
  Bot
} from "lucide-react";

const PLAYBACK_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function QTalkChat({
  session,
  onSessionUpdate,
  language = "en-US",
  onClearChat
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [playerState, setPlayerState] = useState({
    activeMessageId: null,
    isPlaying: false,
    playbackRate: 1,
    currentTime: 0,
    duration: 0,
  });

  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const audioControllerRef = useRef({ audio: null, cleanup: null });

  const messages = session?.messages || [];
  const hasStarted = messages.some((m) => m.role === "user");

  // Keep ref to latest messages
  const latestMessagesRef = useRef(messages);
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input on session change
  useEffect(() => {
    inputRef.current?.focus();
  }, [session?.id]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      const controller = audioControllerRef.current;
      if (controller.audio) {
        controller.audio.pause();
      }
      controller.cleanup?.();
      controller.audio = null;
      controller.cleanup = null;
    };
  }, []);

  // Derive dynamic title from first user message
  useEffect(() => {
    if (!session) return;
    if (!session.title || session.title === "New chat" || session.title === "Untitled") {
      const firstUser = (session.messages || []).find((m) => m.role === "user");
      if (firstUser && firstUser.text) {
        const t = (firstUser.text || "").slice(0, 32).trim();
        if (t) {
          onSessionUpdate({ ...session, title: t, updatedAt: Date.now() });
        }
      }
    }
  }, [session, onSessionUpdate]);

  const pushMessage = useCallback(
    (role, text, extras = {}) => {
      if (!session) return null;
      const base = latestMessagesRef.current || [];
      const message = {
        id: extras.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text,
        ...extras,
      };
      const updatedMessages = [...base, message];
      latestMessagesRef.current = updatedMessages;
      const updatedSession = {
        ...session,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };
      onSessionUpdate(updatedSession);
      return message;
    },
    [session, onSessionUpdate]
  );

  const pauseActiveAudio = useCallback(() => {
    const controller = audioControllerRef.current;
    if (!controller.audio) return;
    controller.audio.pause();
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const attachAudio = useCallback(
    (url, messageId) => {
      if (!url) return null;
      const audio = new Audio(url);
      audio.playbackRate = playerState.playbackRate;

      const handleLoadedMetadata = () => {
        setPlayerState((prev) => ({
          ...prev,
          duration: audio.duration || 0,
        }));
      };

      const handleTimeUpdate = () => {
        setPlayerState((prev) => ({
          ...prev,
          currentTime: audio.currentTime || 0,
        }));
      };

      const handleEnded = () => {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          currentTime: 0,
        }));
      };

      const handlePlay = () => {
        setPlayerState((prev) => ({
          ...prev,
          activeMessageId: messageId,
          isPlaying: true,
        }));
      };

      const handlePause = () => {
        setPlayerState((prev) => {
          if (prev.activeMessageId === messageId) {
            return { ...prev, isPlaying: false };
          }
          return prev;
        });
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
      };

      const controller = audioControllerRef.current;
      controller.audio = audio;
      controller.cleanup = cleanup;

      return audio;
    },
    [playerState.playbackRate]
  );

  const playAudioForMessage = useCallback(
    (message) => {
      if (!message?.audioUrl) return;
      const controller = audioControllerRef.current;

      if (controller.audio && playerState.activeMessageId === message.id) {
        controller.audio.play().catch(() => {});
        return;
      }

      if (controller.audio) {
        controller.audio.pause();
        controller.cleanup?.();
      }

      const audio = attachAudio(message.audioUrl, message.id);
      if (audio) {
        audio.play().catch(() => {});
      }
    },
    [attachAudio, playerState.activeMessageId]
  );

  const handleAssistantReply = useCallback(
    (replyText, audioUrl) => {
      const message = pushMessage("assistant", replyText, { audioUrl });
      if (audioUrl && message) {
        playAudioForMessage(message);
      }
    },
    [playAudioForMessage, pushMessage]
  );

  const handleAsk = async (customPrompt) => {
    const text = (customPrompt || query).trim();
    if (!text) return;
    pushMessage("user", text);
    setQuery("");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/query", {
        query: text,
        top_k: 5,
      });
      const replyText = res.data.answer || "No answer returned.";
      const audioUrl = res.data?.audio
        ? "http://127.0.0.1:8000" + res.data.audio
        : undefined;
      handleAssistantReply(replyText, audioUrl);
    } catch {
      const mock = `In quantum computing, **${text}** represents a fundamental principle. Quantum states exist in superposition amplitudes $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, where probability of measuring state $|0\\rangle$ is $|\\alpha|^2$ and $|1\\rangle$ is $|\\beta|^2$.`;
      handleAssistantReply(mock);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleAsk();
    }
  };

  const startRecognition = () => {
    pauseActiveAudio();
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
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
      pushMessage("user", transcript);
      setLoading(true);
      try {
        const res = await axios.post("http://127.0.0.1:8000/voice-assist", {
          query: transcript,
          lang: language,
        });
        const replyText = res.data.reply || "No reply.";
        const audioUrl = res.data?.audio
          ? "http://127.0.0.1:8000" + res.data.audio
          : undefined;
        handleAssistantReply(replyText, audioUrl);
      } catch {
        alert("Voice Assist error.");
      } finally {
        setLoading(false);
      }
    };
    recognition.onerror = (err) => {
      setListening(false);
      setLoading(false);
      alert("Speech recognition error: " + err.error);
    };
    recognition.start();
  };

  const clearChat = () => {
    if (!session) return;
    pauseActiveAudio();
    const controller = audioControllerRef.current;
    controller.cleanup?.();
    if (controller.audio) {
      controller.audio.pause();
    }
    controller.audio = null;
    controller.cleanup = null;
    setPlayerState((prev) => ({
      ...prev,
      activeMessageId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }));
    if (onClearChat) {
      onClearChat();
    } else {
      onSessionUpdate({ ...session, messages: [], updatedAt: Date.now() });
    }
  };

  // Render input component (used either centered in hero or docked at bottom)
  const renderInputBox = (isCentered = false) => (
    <form
      className={`qtalk-input-card ${isCentered ? "centered" : "docked"}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading) handleAsk();
      }}
    >
      <div className="qtalk-input-main-row">
        <textarea
          ref={inputRef}
          className="qtalk-textarea"
          placeholder={
            isCentered
              ? "✦ Initiate a query or ask Q-Talk AI about quantum computing..."
              : "Ask anything about quantum algorithms, circuits, or Bloch states..."
          }
          rows={isCentered ? 2 : 1}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="qtalk-input-buttons">
          <button
            type="button"
            className={`qtalk-tool-btn mic ${listening ? "listening" : ""}`}
            onClick={startRecognition}
            title={listening ? "Listening..." : "Speak query (Voice Input)"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            type="submit"
            className="qtalk-send-pill"
            disabled={loading || !query.trim()}
            title="Send query (Enter)"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="qtalk-chat-wrapper">
      {/* ── Chat Body (100% full bleed, no top bar clutter) ── */}

      {/* ── Chat Body ── */}
      {!hasStarted ? (
        /* ── Centered Welcome Hero (Before chat starts - matching Screenshot 2) ── */
        <div className="qtalk-hero-viewport">
          <div className="qtalk-hero-inner">
            {/* Glowing Iridescent 3D Quantum Orb */}
            <div className="qtalk-hero-orb-wrap">
              <div className="qtalk-hero-orb">
                <div className="qtalk-orb-highlight" />
                <div className="qtalk-orb-ring" />
              </div>
            </div>

            {/* Welcome Headlines matching Reference UI */}
            <div className="qtalk-hero-copy">
              <div className="qtalk-hero-salutation">{getGreeting()}, Explorer</div>
              <h1 className="qtalk-hero-question">
                How Can I <span className="qtalk-gradient-word">Assist You Today?</span>
              </h1>
            </div>

            {/* Centered Floating Input Box */}
            <div className="qtalk-hero-input-wrap">
              {renderInputBox(true)}
            </div>
          </div>
        </div>
      ) : (
        /* ── Active Conversation Stream with Bottom-Docked Input ── */
        <div className="qtalk-conversation-layout">
          <div className="qtalk-messages-scroll" ref={chatRef}>
            {messages.map((m, idx) => {
              const key = m.id || idx;
              const isAssistant = m.role === "assistant";
              const isActiveAudio = isAssistant && playerState.activeMessageId === m.id;
              const activeDuration = isActiveAudio ? playerState.duration : 0;
              const activeTime = isActiveAudio ? playerState.currentTime : 0;
              const progress = activeDuration
                ? Math.min(100, Math.max(0, (activeTime / activeDuration) * 100))
                : 0;

              return (
                <div
                  key={key}
                  className={`qtalk-message-row ${isAssistant ? "assistant" : "user"}`}
                >
                  <div className="qtalk-message-bubble-wrap">
                    <div className="qtalk-msg-avatar">
                      {isAssistant ? <Bot size={15} /> : <User size={15} />}
                    </div>

                    <div className={`qtalk-msg-content ${isAssistant ? "assistant" : "user"}`}>
                      {isAssistant ? (
                        <>
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              p: ({ node, ...props }) => (
                                <p className="qtalk-md-p" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="qtalk-md-ul" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="qtalk-md-li" {...props} />
                              ),
                              code: ({ inline, className, children, ...props }) => (
                                <code
                                  className={inline ? "qtalk-inline-code" : "qtalk-block-code"}
                                  {...props}
                                >
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {m.text}
                          </ReactMarkdown>

                          {m.audioUrl ? (
                            <div className="qtalk-audio-bar">
                              <button
                                type="button"
                                className="qtalk-audio-btn"
                                onClick={() =>
                                  isActiveAudio && playerState.isPlaying
                                    ? pauseActiveAudio()
                                    : playAudioForMessage(m)
                                }
                                title={isActiveAudio && playerState.isPlaying ? "Pause audio" : "Play voice"}
                              >
                                {isActiveAudio && playerState.isPlaying ? (
                                  <Pause size={13} />
                                ) : (
                                  <Play size={13} />
                                )}
                              </button>

                              <input
                                type="range"
                                className="qtalk-audio-slider"
                                min={0}
                                max={100}
                                value={isActiveAudio ? progress : 0}
                                onChange={(e) => {
                                  if (!isActiveAudio || !activeDuration) return;
                                  const ratio = Number(e.target.value) / 100;
                                  const controller = audioControllerRef.current;
                                  if (controller.audio) {
                                    controller.audio.currentTime = ratio * activeDuration;
                                  }
                                }}
                                disabled={!isActiveAudio || !activeDuration}
                              />

                              <span className="qtalk-audio-time">
                                {formatTime(activeTime)} / {formatTime(activeDuration)}
                              </span>
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <div className="qtalk-user-text">{m.text}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="qtalk-message-row assistant thinking">
                <div className="qtalk-message-bubble-wrap">
                  <div className="qtalk-msg-avatar">
                    <Sparkles size={15} />
                  </div>
                  <div className="qtalk-msg-content assistant thinking">
                    <div className="qtalk-thinking-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <span className="qtalk-thinking-label">Synthesizing quantum state...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom Docked Input Bar ── */}
          <div className="qtalk-bottom-dock">
            {renderInputBox(false)}
          </div>
        </div>
      )}
    </div>
  );
}
