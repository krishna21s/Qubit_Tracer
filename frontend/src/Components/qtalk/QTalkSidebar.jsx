import React, { useState } from 'react';

export default function QTalkSidebar({
  sessions,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onRenameSession,
  onDeleteSession
}) {
  const [editingId, setEditingId] = useState(null);
  const [titleDraft, setTitleDraft] = useState('');

  return (
    <div className="qtalk-sidebar-inner">
      <div className="qtalk-sidebar-header">
        <div className="qtalk-title">QTalk Sessions</div>
        <button className="qtalk-btn primary" onClick={onNewSession}>＋ New</button>
      </div>

      <div className="qtalk-sessions-list">
        {sessions.map(s => {
          const active = s.id === currentSessionId;
          const isEditing = editingId === s.id;
          return (
            <div
              key={s.id}
              className={`qtalk-session-item ${active ? 'active' : ''}`}
              onClick={() => onSelectSession(s.id)}
              title={s.title}
            >
              <div className="qtalk-session-main">
                {!isEditing ? (
                  <div className="qtalk-session-title">{s.title || 'Untitled'}</div>
                ) : (
                  <input
                    autoFocus
                    className="qtalk-session-input"
                    value={titleDraft}
                    onClick={(e) => e.stopPropagation()}
                    onChange={e => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onRenameSession(s.id, titleDraft.trim() || 'Untitled');
                        setEditingId(null);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                      }
                    }}
                    onBlur={() => {
                      onRenameSession(s.id, titleDraft.trim() || 'Untitled');
                      setEditingId(null);
                    }}
                  />
                )}
                <div className="qtalk-session-actions" onClick={(e) => e.stopPropagation()}>
                  {!isEditing && (
                    <button
                      className="qtalk-icon-btn"
                      title="Rename"
                      onClick={() => {
                        setEditingId(s.id);
                        setTitleDraft(s.title || '');
                      }}
                    >✏</button>
                  )}
                  <button
                    className="qtalk-icon-btn danger"
                    title="Delete"
                    onClick={() => onDeleteSession(s.id)}
                  >✖</button>
                </div>
              </div>
              <div className="qtalk-session-sub">
                {new Date(s.updatedAt || s.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}

        {!sessions.length && (
          <div className="qtalk-empty">No sessions yet. Create one.</div>
        )}
      </div>
    </div>
  );
}