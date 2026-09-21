import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Settings,
  Globe,
  RotateCcw,
  Download
} from 'lucide-react';
import QTalkExportButton from './QTalkExportButton';

export default function QTalkSidebar({
  sessions,
  currentSession,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  language = "en-US",
  onLanguageChange,
  onClearChat
}) {
  const [editingId, setEditingId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSettingsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  const saveRename = (id) => {
    onRenameSession(id, titleDraft.trim() || 'Untitled');
    setEditingId(null);
  };

  return (
    <aside className="qtalk-sidebar-inner" aria-label="QTalk Sessions">
      {/* Sidebar Header */}
      <div className="qtalk-sidebar-header">
        <div className="qtalk-sidebar-brand">
          <MessageSquare size={17} className="qtalk-brand-icon" />
          <span className="qtalk-title">Sessions</span>
        </div>
        <button
          className="qtalk-btn-new"
          onClick={onNewSession}
          title="Start a new chat session"
          type="button"
        >
          <Plus size={15} />
          <span>New</span>
        </button>
      </div>

      {/* Sessions Scrollable List */}
      <div className="qtalk-sessions-list">
        {sessions.map((s) => {
          const active = s.id === currentSessionId;
          const isEditing = editingId === s.id;
          const timeStr = new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
          const dateStr = new Date(s.updatedAt || s.createdAt).toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
          });

          return (
            <div
              key={s.id}
              className={`qtalk-session-item ${active ? 'active' : ''}`}
              onClick={() => onSelectSession(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectSession(s.id);
                }
              }}
              title={s.title}
            >
              <div className="qtalk-session-main">
                <MessageSquare size={14} className="qtalk-session-msg-icon" />

                {!isEditing ? (
                  <div className="qtalk-session-title">{s.title || 'Untitled'}</div>
                ) : (
                  <div className="qtalk-edit-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="qtalk-session-input"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(s.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => saveRename(s.id)}
                    />
                    <button
                      className="qtalk-action-btn"
                      onClick={() => saveRename(s.id)}
                      title="Save"
                      type="button"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      className="qtalk-action-btn"
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                      type="button"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {!isEditing && (
                  <div className="qtalk-session-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="qtalk-action-btn"
                      title="Rename session"
                      onClick={() => {
                        setEditingId(s.id);
                        setTitleDraft(s.title || '');
                      }}
                      type="button"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      className="qtalk-action-btn danger"
                      title="Delete session"
                      onClick={() => onDeleteSession(s.id)}
                      type="button"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div className="qtalk-session-sub">
                <Clock size={10} className="qtalk-sub-clock" />
                <span>{dateStr} • {timeStr}</span>
              </div>
            </div>
          );
        })}

        {!sessions.length && (
          <div className="qtalk-empty-sessions">
            <MessageSquare size={28} className="qtalk-empty-icon" />
            <p>No chat sessions yet.</p>
            <button className="qtalk-btn-start" onClick={onNewSession} type="button">
              Create First Chat
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Your Credits (500) + Settings Icon */}
      <div className="qtalk-sidebar-footer">
        {/* Settings Pop-up Card */}
        {isSettingsOpen && (
          <div className="qtalk-settings-popover" ref={popoverRef}>
            <div className="qtalk-popover-header">
              <span className="qtalk-popover-title">Chat Settings</span>
              <button
                type="button"
                className="qtalk-popover-close"
                onClick={() => setIsSettingsOpen(false)}
                title="Close settings"
              >
                <X size={14} />
              </button>
            </div>

            <div className="qtalk-popover-body">
              {/* Language Selection */}
              <div className="qtalk-popover-item">
                <div className="qtalk-popover-label">
                  <Globe size={14} className="qtalk-popover-icon" />
                  <span>Language</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                  className="qtalk-popover-select"
                  title="Voice & Chat Language"
                >
                  <option value="en-US">English</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="te-IN">Telugu</option>
                </select>
              </div>

              {/* Export Conversation */}
              <div className="qtalk-popover-item">
                <div className="qtalk-popover-label">
                  <Download size={14} className="qtalk-popover-icon" />
                  <span>Export Chat</span>
                </div>
                <QTalkExportButton
                  session={currentSession}
                  className="qtalk-popover-action-btn export"
                  label="Export"
                />
              </div>

              {/* Clear Conversation */}
              <div className="qtalk-popover-item">
                <div className="qtalk-popover-label">
                  <RotateCcw size={14} className="qtalk-popover-icon" />
                  <span>Clear Chat</span>
                </div>
                <button
                  type="button"
                  className="qtalk-popover-action-btn danger"
                  onClick={() => {
                    if (onClearChat) onClearChat();
                    setIsSettingsOpen(false);
                  }}
                  disabled={!currentSession || !currentSession.messages?.length}
                  title="Clear all messages in this session"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="qtalk-credits-card">
          <div className="qtalk-credits-info">
            <span className="qtalk-credits-title">Your Credits</span>
            <span className="qtalk-credits-subtitle">500</span>
          </div>

          <button
            type="button"
            className={`qtalk-settings-btn ${isSettingsOpen ? 'active' : ''}`}
            onClick={() => setIsSettingsOpen((prev) => !prev)}
            title="Chat Settings & Tools"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}