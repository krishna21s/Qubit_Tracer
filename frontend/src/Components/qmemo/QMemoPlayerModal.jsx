import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !item) return null;
  const { title, videoUrl, embed } = item;

  return (
    <div className="yt-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="yt-modal-backdrop" onClick={onClose} />
      <div className="yt-modal-inner">
        {/* Top bar with title and close button */}
        <div className="yt-modal-topbar">
          <div className="yt-modal-topbar-title">{title}</div>
          <button className="yt-modal-close-btn" onClick={onClose} aria-label="Close modal" type="button">
            <X size={18} />
          </button>
        </div>

        {/* 16:9 Theater Video Player */}
        <div className="yt-player-viewport">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="yt-player-video"
              playsInline
            />
          ) : embed ? (
            <iframe
              src={embed}
              title={title}
              className="yt-player-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="yt-player-empty">Video stream not available</div>
          )}
        </div>
      </div>
    </div>
  );
}