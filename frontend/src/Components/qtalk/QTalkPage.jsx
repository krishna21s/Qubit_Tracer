import React, { useMemo, useState, useEffect, useCallback } from "react";
import QTalkSidebar from "./QTalkSidebar";
import QTalkChat from "./QTalkChat";
import "./qtalk.css";

const SESS_KEY = "qtalk_sessions";
const CURR_KEY = "qtalk_current_session_id";

export default function QTalkPage() {
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      return sessionStorage.getItem(CURR_KEY) || "";
    } catch {}
    return "";
  });

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("qtalk_preferred_language") || "en-US";
    } catch {}
    return "en-US";
  });

  const handleLanguageChange = useCallback((newLang) => {
    setLanguage(newLang);
    try {
      localStorage.setItem("qtalk_preferred_language", newLang);
    } catch {}
  }, []);

  const createSessionTemplate = useCallback(() => ({
    id: typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), []);

  // Ensure at least one session exists
  useEffect(() => {
    if (!sessions.length) {
      const first = createSessionTemplate();
      const arr = [first];
      setSessions(arr);
      setCurrentSessionId(first.id);
      try {
        sessionStorage.setItem(SESS_KEY, JSON.stringify(arr));
        sessionStorage.setItem(CURR_KEY, first.id);
      } catch {}
    }
  }, [sessions.length, createSessionTemplate]);

  // Persist sessions
  useEffect(() => {
    try {
      sessionStorage.setItem(SESS_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);

  // Persist current session ID
  useEffect(() => {
    try {
      if (currentSessionId) sessionStorage.setItem(CURR_KEY, currentSessionId);
    } catch {}
  }, [currentSessionId]);

  const handleNewSession = useCallback(() => {
    const fresh = createSessionTemplate();
    setSessions((prev) => [fresh, ...prev]);
    setCurrentSessionId(fresh.id);
  }, [createSessionTemplate]);

  const handleSelectSession = useCallback((id) => {
    setCurrentSessionId(id);
  }, []);

  const handleRenameSession = useCallback((id, title) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title, updatedAt: Date.now() } : s))
    );
  }, []);

  const handleDeleteSession = useCallback((id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (!remaining.length) {
        const fallback = createSessionTemplate();
        setCurrentSessionId(fallback.id);
        return [fallback];
      }
      if (id === currentSessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  }, [currentSessionId, createSessionTemplate]);

  const handleClearCurrentChat = useCallback(() => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
      )
    );
  }, [currentSessionId]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) || sessions[0],
    [sessions, currentSessionId]
  );

  return (
    <div className="qtalk-unified-root">
      {/* Left Sidebar: Sessions Drawer */}
      <div className="qtalk-sidebar-pane">
        <QTalkSidebar
          sessions={sessions}
          currentSession={currentSession}
          currentSessionId={currentSession?.id || ""}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          language={language}
          onLanguageChange={handleLanguageChange}
          onClearChat={handleClearCurrentChat}
        />
      </div>

      {/* Main Chat Area */}
      <main className="qtalk-chat-pane">
        {currentSession && (
          <QTalkChat
            session={currentSession}
            language={language}
            onLanguageChange={handleLanguageChange}
            onClearChat={handleClearCurrentChat}
            onSessionUpdate={(updated) => {
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === updated.id
                    ? { ...updated, updatedAt: Date.now() }
                    : s
                )
              );
            }}
          />
        )}
      </main>
    </div>
  );
}
