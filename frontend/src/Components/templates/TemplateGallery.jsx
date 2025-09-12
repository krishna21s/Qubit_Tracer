import React from 'react';
import { useTemplate } from '../../context/TemplateContext';
import { THEME_TEMPLATES } from '../../themeTemplates';
import TemplateCard from './TemplateCard';

export default function TemplateGallery() {
  const { templateId, applyTemplate } = useTemplate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ maxWidth: 880 }}>
        <h2 style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 800,
          background: 'var(--qt-gradient-accent)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          letterSpacing: '.6px'
        }}>
          Visual Experience Templates
        </h2>
        <p style={{
          margin: '8px 0 4px',
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--qt-text-dim)'
        }}>
          Choose a visual template. The entire dashboard (and other pages) instantly adopts the style. Your selection is remembered.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))'
        }}
      >
        {THEME_TEMPLATES.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            active={t.id === templateId}
            onApply={applyTemplate}
          />
        ))}
      </div>

      <div style={{
        marginTop: 10,
        fontSize: 11.5,
        color: 'var(--qt-text-dim)',
        lineHeight: 1.5,
        background: 'var(--qt-surface-alt)',
        padding: '12px 16px',
        borderRadius: 12,
        border: '1px solid var(--qt-border)',
        maxWidth: 920
      }}>
        Templates are purely cosmetic in this first step. Future iterations will add Bloch environment palettes,
        performance modes (wireframe spheres), and custom path glow. Screenshots may be added later; these previews auto-rotate as placeholders.
      </div>
    </div>
  );
}