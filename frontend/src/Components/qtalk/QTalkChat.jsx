import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const QbotImg = "https://placehold.co/44x44/122A4A/EAF6FF?text=Q";

const LANGUAGE_OPTIONS = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "te-IN", label: "Telugu" },
];

const PLAYBACK_SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function QTalkChat({ session, onSessionUpdate, headerRight }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [playerState, setPlayerState] = useState({
    activeMessageId: null,
    isPlaying: false,
    playbackRate: 1,
    currentTime: 0,
    duration: 0,
  });
  const chatRef = useRef(null);
  const audioControllerRef = useRef({ audio: null, cleanup: null });

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

  // Cleanup audio when component unmounts
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

  // Derive dynamic title (first user message snippet) if untitled
  useEffect(() => {
    if (!session) return;
    if (
      !session.title ||
      session.title === "New chat" ||
      session.title === "Untitled"
    ) {
      const firstUser = (session.messages || []).find((m) => m.role === "user");
      if (firstUser && firstUser.text) {
        const t = (firstUser.text || "").slice(0, 36).trim();
        if (t) {
          onSessionUpdate({ ...session, title: t, updatedAt: Date.now() });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.messages?.length]);

  // Append message using the freshest list to prevent losing the just-sent user message
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
      const controller = audioControllerRef.current;
      if (controller.audio && controller.audio.src === url) {
        setPlayerState((prev) => ({
          ...prev,
          activeMessageId: messageId,
          duration: controller.audio.duration || prev.duration,
        }));
        return controller.audio;
      }
      if (controller.audio) {
        controller.audio.pause();
        controller.cleanup?.();
      }
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.playbackRate = playerState.playbackRate;

      const handleTimeUpdate = () => {
        setPlayerState((prev) => ({
          ...prev,
          activeMessageId: messageId,
          currentTime: audio.currentTime,
          duration: audio.duration || prev.duration,
        }));
      };
      const handleEnded = () => {
        setPlayerState((prev) => ({
          ...prev,
          isPlaying: false,
          currentTime: audio.duration || 0,
        }));
      };
      const handleLoaded = () => {
        setPlayerState((prev) => ({
          ...prev,
          duration: audio.duration || prev.duration,
        }));
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("loadedmetadata", handleLoaded);

      controller.audio = audio;
      controller.cleanup = () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("loadedmetadata", handleLoaded);
      };

      setPlayerState((prev) => ({
        ...prev,
        activeMessageId: messageId,
        isPlaying: false,
        currentTime: 0,
        duration: audio.duration || 0,
      }));

      return audio;
    },
    [playerState.playbackRate]
  );

  const playAudioForMessage = useCallback(
    async (message) => {
      if (!message?.audioUrl) return;
      const audio = attachAudio(message.audioUrl, message.id);
      if (!audio) return;
      audio.playbackRate = playerState.playbackRate;
      try {
        await audio.play();
        setPlayerState((prev) => ({
          ...prev,
          activeMessageId: message.id,
          isPlaying: true,
        }));
      } catch (err) {
        console.error("Audio play failed:", err);
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      }
    },
    [attachAudio, playerState.playbackRate]
  );

  const replayAudio = useCallback(
    async (message) => {
      if (!message?.audioUrl) return;
      const audio = attachAudio(message.audioUrl, message.id);
      if (!audio) return;
      audio.currentTime = 0;
      audio.playbackRate = playerState.playbackRate;
      try {
        await audio.play();
        setPlayerState((prev) => ({
          ...prev,
          activeMessageId: message.id,
          isPlaying: true,
          currentTime: 0,
        }));
      } catch (err) {
        console.error("Audio replay failed:", err);
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      }
    },
    [attachAudio, playerState.playbackRate]
  );

  const handlePlaybackRateChange = useCallback((rate) => {
    const value = Number(rate) || 1;
    setPlayerState((prev) => ({ ...prev, playbackRate: value }));
    const audio = audioControllerRef.current.audio;
    if (audio) audio.playbackRate = value;
  }, []);

  const seekAudio = useCallback((timeInSeconds) => {
    const controller = audioControllerRef.current;
    if (!controller.audio || !Number.isFinite(timeInSeconds)) return;
    const audio = controller.audio;
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const clamped = Math.max(0, Math.min(timeInSeconds, duration || 0));
    audio.currentTime = clamped;
    setPlayerState((prev) => ({ ...prev, currentTime: clamped }));
  }, []);

  const handleAssistantReply = useCallback(
    (replyText, audioUrl) => {
      const extras = audioUrl ? { audioUrl } : {};
      const message = pushMessage("assistant", replyText, extras);
      if (audioUrl && message) {
        playAudioForMessage(message);
      }
    },
    [playAudioForMessage, pushMessage]
  );

  const handleAsk = async () => {
    const text = query.trim();
    if (!text) return;
    pushMessage("user", text);
    setQuery("");
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/query", {
        query: text,
        top_k: 5,
      });
      const replyText = res.data.answer || "No answer.";
      const audioUrl = res.data?.audio
        ? "http://127.0.0.1:8000" + res.data.audio
        : undefined;
      handleAssistantReply(replyText, audioUrl);
    } catch (err) {
      const mock = `API Error. Showing mock response: You asked "${text}". In quantum mechanics, probabilities are squares of amplitudes.`;
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
    onSessionUpdate({ ...session, messages: [], updatedAt: Date.now() });
  };

  return (
    <div className="qtalk-chat-wrap">
      {/* Header */}
      <div className="qtalk-chat-header">
        <div className="qtalk-chat-title">
          <img src={QbotImg} alt="Q" className="qtalk-logo" />
          <div>
            <div className="qtalk-title-text">{session?.title || "QTalk"}</div>
            <div className="qtalk-sub">LLM Assistant • Voice + Markdown</div>
          </div>
        </div>
        <div className="qtalk-header-actions">
          {headerRight}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="qtalk-language"
            title="Transcription language"
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.code} value={o.code}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="qtalk-btn" title="Clear chat" onClick={clearChat}>
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="qtalk-chat-body" ref={chatRef}>
        {messages.map((m, idx) => {
          const key = m.id || idx;
          const isAssistant = m.role === "assistant";
          const isActiveAudio =
            isAssistant && playerState.activeMessageId === m.id;
          const activeDuration = isActiveAudio ? playerState.duration : 0;
          const activeTime = isActiveAudio ? playerState.currentTime : 0;
          const progress = activeDuration
            ? Math.min(100, Math.max(0, (activeTime / activeDuration) * 100))
            : 0;

          return (
            <div
              key={key}
              className={`qtalk-msg ${isAssistant ? "assistant" : "user"}`}
            >
              <div className="qtalk-msg-inner">
                {isAssistant && <div className="qtalk-avatar">Q</div>}
                <div className={`qtalk-bubble ${m.role}`}>
                  {isAssistant ? (
                    <>
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p
                            style={{
                              margin: "0 0 10px 0",
                              padding: 0,
                              textAlign: "start",
                              fontSize: 14,
                              lineHeight: 1.6,
                            }}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            style={{ paddingLeft: "20px", margin: "10px 0" }}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li style={{ marginBottom: "4px" }} {...props} />
                        ),
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>

                    {m.audioUrl ? (
                      <div className="qtalk-audio-controls">
                        <button
                          type="button"
                          className="qtalk-audio-button"
                          onClick={() =>
                            isActiveAudio && playerState.isPlaying
                              ? pauseActiveAudio()
                              : playAudioForMessage(m)
                          }
                        >
                          {isActiveAudio && playerState.isPlaying
                            ? "Pause"
                            : "Play"}
                        </button>
                        <button
                          type="button"
                          className="qtalk-audio-button"
                          onClick={() => replayAudio(m)}
                        >
                          Replay
                        </button>
                        <input
                          type="range"
                          className="qtalk-audio-progress"
                          min={0}
                          max={100}
                          value={isActiveAudio ? progress : 0}
                          onChange={(e) => {
                            if (!isActiveAudio || !activeDuration) return;
                            const ratio = Number(e.target.value) / 100;
                            seekAudio(ratio * activeDuration);
                          }}
                          disabled={!isActiveAudio || !activeDuration}
                        />
                        <div className="qtalk-audio-times">
                          {formatTime(activeTime)} /{" "}
                          {formatTime(activeDuration)}
                        </div>
                        <select
                          className="qtalk-audio-select"
                          value={playerState.playbackRate}
                          onChange={(e) =>
                            handlePlaybackRateChange(Number(e.target.value))
                          }
                        >
                          {PLAYBACK_SPEED_OPTIONS.map((speed) => (
                            <option key={speed} value={speed}>
                              {speed === 1 ? "1x" : `${speed}x`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                )}
              </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="qtalk-msg assistant">
            <div className="qtalk-msg-inner">
              <div className="qtalk-avatar">Q</div>
              <div className="qtalk-bubble assistant">Thinking…</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="qtalk-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) handleAsk();
        }}
      >
        <div className="qtalk-input-container">
          <textarea
            className="qtalk-input"
            placeholder="Type your question…"
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <div className="qtalk-input-actions">
            <button
              type="button"
              className={`qtalk-mic ${listening ? "active" : ""}`}
              onClick={startRecognition}
            >
              {listening ? "🎙️" : "🎤"}
            </button>
            <button type="submit" className="qtalk-send" disabled={loading}>
              {loading ? "..." : "➤"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
