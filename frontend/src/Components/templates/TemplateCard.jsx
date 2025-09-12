import React, { useEffect, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import DataSaverOnIcon from '@mui/icons-material/DataSaverOn';

/**
 * TemplateCard
 * Auto-rotating placeholder carousel (no arrows).
 * props: { template, active, onApply }
 */
export default function TemplateCard({ template, active, onApply }) {
  const { name, tagline, id } = template;

  // Placeholder "image" slides (colored blocks). Real screenshots can replace later.
  const slides = [
    { bg: 'linear-gradient(135deg,var(--qt-accent),var(--qt-accent-alt))', label: `${name} preview 1` },
    { bg: 'linear-gradient(135deg,var(--qt-gradient-accent),var(--qt-gradient-main))', label: `${name} preview 2` },
    { bg: 'linear-gradient(135deg,var(--qt-surface),var(--qt-surface-alt))', label: `${name} preview 3` },
    { bg: 'linear-gradient(135deg,var(--qt-accent-alt),var(--qt-accent))', label: `${name} preview 4` }
  ];

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, 2400);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 18,
        border: active
          ? '2px solid var(--qt-accent)'
          : '1px solid var(--qt-border)',
        background: 'var(--qt-surface)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: active
          ? '0 8px 28px -6px rgba(0,0,0,0.55)'
          : '0 6px 20px -8px rgba(0,0,0,0.4)',
        minWidth: 280,
        overflow: 'hidden',
        transition: 'border-color .25s, box-shadow .3s, transform .4s',
      }}
    >
      {active && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'var(--qt-accent)',
            color: '#fff',
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 20,
            fontWeight: 600,
            letterSpacing: '.5px',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 14 }} /> ACTIVE
        </div>
      )}

      {/* Carousel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid var(--qt-border)',
          background: 'var(--qt-bg-alt)'
        }}
        aria-label={`${name} rotating preview`}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            aria-label={s.label}
            style={{
              position: 'absolute',
              inset: 0,
              background: s.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffffdd',
              letterSpacing: '.6px',
              opacity: index === i ? 1 : 0,
              transform: index === i ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 1.1s ease, transform 1.4s ease'
            }}
          >
            {name}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--qt-text)' }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--qt-text-dim)', lineHeight: 1.4 }}>
          {tagline}
        </div>
      </div>

      {/* Meta row (simple icons to differentiate types) */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--qt-text-dim)' }}>
        {id === 'neon' && <span style={metaStyle}><BoltIcon sx={{ fontSize: 14 }} /> Neon</span>}
        {id === 'wire' && <span style={metaStyle}><DataSaverOnIcon sx={{ fontSize: 14 }} /> Low GPU</span>}
        {id === 'ocean' && <span style={metaStyle}><BlurOnIcon sx={{ fontSize: 14 }} /> Soft</span>}
        {id === 'purewhite' && <span style={metaStyle}>Light Mode</span>}
        {id === 'dark' && <span style={metaStyle}>Default</span>}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
        <button
          onClick={() => onApply(id)}
          disabled={active}
          style={{
            flex: 1,
            background: active
              ? 'var(--qt-button-primary)'
              : 'var(--qt-button-primary)',
            border: '1px solid var(--qt-border)',
            color: '#fff',
            fontWeight: 600,
            padding: '10px 14px',
            borderRadius: 12,
            cursor: active ? 'default' : 'pointer',
            opacity: active ? 0.8 : 1,
            fontSize: 13,
            letterSpacing: '.4px',
            transition: 'background .25s'
          }}
          aria-label={active ? `${name} already active` : `Apply ${name} template`}
        >
          {active ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
}

const metaStyle = {
  background: 'var(--qt-surface-alt)',
  padding: '4px 8px',
  borderRadius: 8,
  border: '1px solid var(--qt-border)',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 4
};