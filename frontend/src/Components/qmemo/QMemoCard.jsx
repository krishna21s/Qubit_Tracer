import React, { useState } from 'react';
import './qmemo.css';

export default function QMemoCard({ item, onOpen }) {
  const [hover, setHover] = useState(false);
  const { title, description, duration, thumbnail, tags = [], category } = item;

  return (
    <div
      className="qmemo-card"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen?.(); } }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${title} – play video`}
    >
      <div className="qmemo-thumb-wrap">
        <img
          className="qmemo-thumb"
          src={thumbnail}
          alt={title}
          loading="lazy"
        />
        {duration && <div className="qmemo-duration">{duration}</div>}
        <div className={`qmemo-play ${hover ? 'visible' : ''}`}>▶</div>
        <div className="qmemo-thumb-gradient" />
      </div>

      <div className="qmemo-meta">
        <div className="qmemo-title" title={title}>{title}</div>
        <div className="qmemo-desc" title={description}>{description}</div>
        <div className="qmemo-tags">
          {category && <span className="qmemo-tag accent">{category}</span>}
          {tags.slice(0, 3).map((t, i) => (
            <span key={i} className="qmemo-tag">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}