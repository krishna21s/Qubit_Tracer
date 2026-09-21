import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Play, Search, X } from 'lucide-react';
import QMemoPlayerModal from './QMemoPlayerModal';
import data from './qmemoData.sample.json';
import './qmemo.css';


/**
 * High-definition vector graphics posters tailored for each quantum lesson
 */
function QuantumThumbnailGraphic({ theme }) {
  switch (theme) {
    case 'superposition':
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="spn-bg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0d2847" />
              <stop offset="60%" stopColor="#081422" />
              <stop offset="100%" stopColor="#04080e" />
            </radialGradient>
            <radialGradient id="spn-coin" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>
            <filter id="spn-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="640" height="360" fill="url(#spn-bg)" />
          {/* Orbital grid lines */}
          <ellipse cx="320" cy="180" rx="220" ry="80" fill="none" stroke="rgba(56,189,248,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
          <ellipse cx="320" cy="180" rx="160" ry="140" fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1.5" />
          <ellipse cx="320" cy="180" rx="260" ry="60" fill="none" stroke="rgba(234,179,8,0.18)" strokeWidth="1.5" />
          <line x1="320" y1="30" x2="320" y2="330" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Poles */}
          <text x="320" y="26" fill="#38bdf8" fontSize="16" fontWeight="800" textAnchor="middle" fontFamily="monospace">|0⟩</text>
          <text x="320" y="348" fill="#38bdf8" fontSize="16" fontWeight="800" textAnchor="middle" fontFamily="monospace">|1⟩</text>
          {/* Central Spinning Golden Q-Coin */}
          <circle cx="320" cy="180" r="62" fill="url(#spn-coin)" filter="url(#spn-glow)" opacity="0.95" />
          <ellipse cx="320" cy="180" rx="54" ry="24" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
          <text x="320" y="190" fill="#451a03" fontSize="28" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">Q</text>
          {/* Formula banner pill */}
          <rect x="180" y="280" width="280" height="32" rx="16" fill="rgba(8,20,34,0.85)" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
          <text x="320" y="301" fill="#e0f2fe" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">|ψ⟩ = (|0⟩ + |1⟩) / √2</text>
        </svg>
      );

    case 'entanglement':
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="ent-bg" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#1a103c" />
              <stop offset="60%" stopColor="#0c071d" />
              <stop offset="100%" stopColor="#04020a" />
            </radialGradient>
            <filter id="ent-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="640" height="360" fill="url(#ent-bg)" />
          {/* Entanglement Bridge Beam */}
          <path d="M 190 180 Q 320 120 450 180" fill="none" stroke="#a855f7" strokeWidth="6" opacity="0.7" filter="url(#ent-glow)" />
          <path d="M 190 180 Q 320 240 450 180" fill="none" stroke="#06b6d4" strokeWidth="6" opacity="0.7" filter="url(#ent-glow)" />
          <line x1="190" y1="180" x2="450" y2="180" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.8" />
          {/* Left Particle (Alice) */}
          <circle cx="190" cy="180" r="48" fill="#7e22ce" filter="url(#ent-glow)" />
          <circle cx="190" cy="180" r="32" fill="#c084fc" />
          <text x="190" y="186" fill="#ffffff" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="monospace">qA</text>
          {/* Right Particle (Bob) */}
          <circle cx="450" cy="180" r="48" fill="#0891b2" filter="url(#ent-glow)" />
          <circle cx="450" cy="180" r="32" fill="#38bdf8" />
          <text x="450" y="186" fill="#ffffff" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="monospace">qB</text>
          {/* Bell State Formula Pill */}
          <rect x="170" y="280" width="300" height="32" rx="16" fill="rgba(12,7,29,0.85)" stroke="rgba(168,85,247,0.5)" strokeWidth="1" />
          <text x="320" y="301" fill="#f3e8ff" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">|Φ+⟩ = (|00⟩ + |11⟩) / √2</text>
        </svg>
      );

    case 'interference':
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="int-bg" cx="30%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#082f49" />
              <stop offset="60%" stopColor="#0c1829" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#int-bg)" />
          {/* Wave ripple arcs from double slits */}
          {[60, 100, 140, 180, 220, 260].map((r, i) => (
            <React.Fragment key={i}>
              <circle cx="160" cy="140" r={r} fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1.8" />
              <circle cx="160" cy="220" r={r} fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.8" />
            </React.Fragment>
          ))}
          {/* Slit barrier */}
          <rect x="150" y="20" width="10" height="100" fill="#334155" rx="3" />
          <rect x="150" y="150" width="10" height="60" fill="#334155" rx="3" />
          <rect x="150" y="240" width="10" height="100" fill="#334155" rx="3" />
          {/* Interference Fringes Detection Screen */}
          <rect x="520" y="20" width="16" height="320" fill="#1e293b" rx="4" />
          <rect x="522" y="40" width="12" height="16" fill="#38bdf8" opacity="0.9" />
          <rect x="522" y="90" width="12" height="28" fill="#38bdf8" opacity="0.95" />
          <rect x="522" y="160" width="12" height="40" fill="#38bdf8" opacity="1" />
          <rect x="522" y="240" width="12" height="28" fill="#38bdf8" opacity="0.95" />
          <rect x="522" y="295" width="12" height="16" fill="#38bdf8" opacity="0.9" />
          {/* Formula pill */}
          <rect x="180" y="280" width="280" height="32" rx="16" fill="rgba(8,20,34,0.85)" stroke="rgba(56,189,248,0.4)" strokeWidth="1" />
          <text x="320" y="301" fill="#bae6fd" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">P = |ψ₁ + ψ₂|²</text>
        </svg>
      );

    case 'grover':
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="grv-bg" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <filter id="grv-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="640" height="360" fill="url(#grv-bg)" />
          {/* Target Highlight Beam */}
          <rect x="335" y="60" width="55" height="190" fill="rgba(56,189,248,0.18)" rx="4" />
          {/* Amplitude histogram bars */}
          <rect x="110" y="200" width="45" height="50" fill="#475569" rx="4" />
          <rect x="170" y="195" width="45" height="55" fill="#475569" rx="4" />
          <rect x="230" y="205" width="45" height="45" fill="#475569" rx="4" />
          <text x="295" y="235" fill="#94a3b8" fontSize="20" fontWeight="800" textAnchor="middle">...</text>
          {/* Marked target amplitude (peaks high) */}
          <rect x="335" y="80" width="55" height="170" fill="#22c55e" rx="6" filter="url(#grv-glow)" />
          <text x="362" y="70" fill="#4ade80" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="monospace">|ω⟩</text>
          <rect x="410" y="200" width="45" height="50" fill="#475569" rx="4" />
          <rect x="470" y="195" width="45" height="55" fill="#475569" rx="4" />
          {/* Baseline */}
          <line x1="80" y1="250" x2="560" y2="250" stroke="#64748b" strokeWidth="2" />
          {/* Formula pill */}
          <rect x="180" y="280" width="280" height="32" rx="16" fill="rgba(15,23,42,0.85)" stroke="rgba(34,197,94,0.5)" strokeWidth="1" />
          <text x="320" y="301" fill="#86efac" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">Complexity: O(√N) Speedup</text>
        </svg>
      );

    case 'decoherence':
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="dch-bg" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="60%" stopColor="#0c0a09" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#dch-bg)" />
          {/* Fading Bloch wireframe */}
          <circle cx="320" cy="170" r="100" fill="none" stroke="rgba(244,63,94,0.3)" strokeWidth="1.5" strokeDasharray="5 5" />
          <ellipse cx="320" cy="170" rx="100" ry="40" fill="none" stroke="rgba(244,63,94,0.25)" strokeWidth="1.5" />
          <line x1="320" y1="50" x2="320" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          {/* Decayed vector spiraling toward center */}
          <path d="M 320 170 Q 350 140 370 120 T 340 150 T 325 165" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="3 3" />
          <line x1="320" y1="170" x2="345" y2="145" stroke="#f43f5e" strokeWidth="3" markerEnd="url(#arrow)" />
          <circle cx="345" cy="145" r="5" fill="#f43f5e" />
          {/* Thermal noise particles */}
          {[
            [260, 110], [390, 90], [240, 210], [410, 200], [280, 250], [370, 240]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#fb7185" opacity="0.6" />
          ))}
          {/* Formula pill */}
          <rect x="180" y="280" width="280" height="32" rx="16" fill="rgba(28,25,23,0.85)" stroke="rgba(244,63,94,0.5)" strokeWidth="1" />
          <text x="320" y="301" fill="#fecdd3" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">Decay: T₁ & T₂ Relaxation</text>
        </svg>
      );

    case 'qft':
    default:
      return (
        <svg className="yt-thumb-svg" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="qft-bg" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#qft-bg)" />
          {/* Circuit wire tracks */}
          <line x1="80" y1="110" x2="560" y2="110" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="80" y1="170" x2="560" y2="170" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="80" y1="230" x2="560" y2="230" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          {/* Qubit labels */}
          <text x="60" y="115" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">q[0]</text>
          <text x="60" y="175" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">q[1]</text>
          <text x="60" y="235" fill="#94a3b8" fontSize="14" fontWeight="700" fontFamily="monospace">q[2]</text>
          {/* Circuit Gates */}
          <rect x="150" y="88" width="44" height="44" rx="8" fill="#38bdf8" />
          <text x="172" y="116" fill="#0c1e33" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="monospace">H</text>
          <line x1="260" y1="110" x2="260" y2="170" stroke="#818cf8" strokeWidth="2" />
          <circle cx="260" cy="110" r="6" fill="#818cf8" />
          <rect x="238" y="148" width="44" height="44" rx="8" fill="#818cf8" />
          <text x="260" y="175" fill="#ffffff" fontSize="14" fontWeight="800" textAnchor="middle" fontFamily="monospace">R₂</text>
          <rect x="360" y="148" width="44" height="44" rx="8" fill="#38bdf8" />
          <text x="382" y="176" fill="#0c1e33" fontSize="18" fontWeight="800" textAnchor="middle" fontFamily="monospace">H</text>
          {/* Formula pill */}
          <rect x="170" y="280" width="300" height="32" rx="16" fill="rgba(15,23,42,0.85)" stroke="rgba(129,140,248,0.5)" strokeWidth="1" />
          <text x="320" y="301" fill="#c7d2fe" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="monospace">QFT: Discrete Fourier Transform</text>
        </svg>
      );
  }
}

export default function QMemoGrid({ items }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(null);
  const searchInputRef = useRef(null);

  const list = items && Array.isArray(items) ? items : data;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(item => {
      const text = `${item.title} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }, [list, query]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.target.closest('input,textarea')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="yt-qmemo-container">
      {/* ── Top Bar: Search Bar Styled to Theme ── */}
      <div className="yt-topbar-wrapper">
        <div className="yt-search-container">
          <div className="yt-search-box">
            <Search size={16} className="yt-search-icon" />
            <input
              ref={searchInputRef}
              id="qmemo-search"
              className="yt-search-input"
              placeholder="Search quantum lessons or concepts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="yt-search-clear"
                onClick={() => setQuery('')}
                title="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}
            <div className="yt-search-shortcut-hint" title="Press / to search">/</div>
          </div>
        </div>
      </div>

      {/* ── YouTube Video Cards Grid ── */}
      <div className="yt-video-grid">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="yt-video-card"
              onClick={() => setActive(item)}
            >
              {/* 16:9 Thumbnail Box with Video Starting Frame */}
              <div
                className="yt-thumbnail-wrapper"
                title={`Play "${item.title}"`}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="yt-thumb-img"
                    loading="lazy"
                  />
                ) : item.videoUrl ? (
                  <video
                    src={`${item.videoUrl}#t=0.001`}
                    preload="metadata"
                    muted
                    playsInline
                    className="yt-thumb-video"
                  />
                ) : (
                  <QuantumThumbnailGraphic theme={item.thumbnailTheme} />
                )}

                {/* Play Overlay with Blur */}
                <div className="yt-thumbnail-overlay">
                  <div className="yt-play-icon-circle">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge (Bottom-Right corner, black translucent pill) */}
                <div className="yt-duration-badge">
                  {item.duration || '10:00'}
                </div>
              </div>

              {/* Title only below thumbnail (no views, no years ago, no channel icon) */}
              <div className="yt-card-info">
                <h3 className="yt-video-title" title={item.title}>
                  {item.title}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <div className="yt-empty-feed">
            <div className="yt-empty-icon">
              <Search size={36} />
            </div>
            <div className="yt-empty-title">No videos found</div>
            <div className="yt-empty-sub">
              Try different keywords to explore quantum micro-lessons.
            </div>
            <button
              className="yt-empty-reset-btn"
              onClick={() => setQuery('')}
              type="button"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* ── Theater Mode Video Player Modal ── */}
      <QMemoPlayerModal
        open={!!active}
        item={active}
        onClose={() => setActive(null)}
      />
    </div>
  );
}