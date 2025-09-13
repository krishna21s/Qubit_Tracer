import React, { useEffect, useRef } from 'react';
import './qmemo.css';

export default function QMemoPlayerModal({ open, item, onClose }) {
  const lastFocused = useRef(null);
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      lastFocused.current?.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !item) return null;
  const { title, videoUrl, embed } = item;

  return (
    <div className="qmemo-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="qmemo-modal-backdrop" onClick={onClose} />
      <div className="qmemo-modal-inner">
        <div className="qmemo-modal-header">
          <div className="qmemo-modal-title">{title}</div>
          <button className="qmemo-close" onClick={onClose} aria-label="Close">✖</button>
        </div>
        <div className="qmemo-player">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="qmemo-video"
            />
          ) : embed ? (
            <iframe
              src={embed}
              title={title}
              className="qmemo-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="qmemo-player-empty">Video not available</div>
          )}
        </div>
      </div>
    </div>
  );
}