import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";

import QTalkSidebar from "./QTalkSidebar";
import QTalkChat from "./QTalkChat";
import QTalkExportButton from "./QTalkExportButton";

import "./qtalk.css";

import "./qtalk.css";

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

  const createSessionTemplate = useCallback(() => ({
    id: (typeof crypto !== "undefined" && crypto.randomUUID)
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
      const first = {
        ...createSessionTemplate(),
        messages: [
          {
            role: "assistant",
            text: "Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.",
          },
        ],
      };
      const arr = [first];
      setSessions(arr);
      setCurrentSessionId(first.id);
      try {
        sessionStorage.setItem(SESS_KEY, JSON.stringify(arr));
        sessionStorage.setItem(CURR_KEY, first.id);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (per-tab, cleared when tab closes)
  useEffect(() => {
    try {
      sessionStorage.setItem(SESS_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);
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
        const fallback = {
          ...createSessionTemplate(),
          messages: [
            {
              role: "assistant",
              text: "Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.",
            },
          ],
        };
        setCurrentSessionId(fallback.id);
        return [fallback];
      }
      if (id === currentSessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  }, [currentSessionId, createSessionTemplate]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) || sessions[0],
    [sessions, currentSessionId]
  );

  return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: 2,
            overflow: "hidden",
            height: "100%",
          }}
        >
          <Box
            className="qtalk-sidebar"
            sx={{
              width: { xs: 0, sm: 260, md: 300 },
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              background: "var(--qt-surface, #0d1117)",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
            }}
          >
            <QTalkSidebar
              sessions={sessions}
              currentSessionId={currentSession?.id || ""}
              onNewSession={handleNewSession}
              onSelectSession={handleSelectSession}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
            />
          </Box>

          <Box
            className="qtalk-chat-root"
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              borderColor: "divider",
              background: "var(--qt-surface, #0d1117)",
              border: "1px solid var(--qt-border)",
            }}
          >
            {currentSession && (
              <QTalkChat
                session={currentSession}
                onSessionUpdate={(updated) => {
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === updated.id
                        ? { ...updated, updatedAt: Date.now() }
                        : s
                    )
                  );
                }}
                headerRight={<QTalkExportButton session={currentSession} />}
              />
            )}
          </Box>
        </Box>
  );
}
