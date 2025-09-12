import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { findTemplate } from '../themeTemplates';

const TemplateContext = createContext({ templateId: 'dark', applyTemplate: () => { } });

export function TemplateProvider({ children }) {
  const [templateId, setTemplateId] = useState(() => {
    try {
      return localStorage.getItem('qt_template') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTemplate = useCallback((id) => {
    const t = findTemplate(id);
    // Persist selection
    try { localStorage.setItem('qt_template', t.id); } catch { }
    setTemplateId(t.id);

    // Expose template id for any CSS selectors (optional)
    try { document.body.dataset.template = t.id; } catch { }

    // Apply all cssVars to :root
    try {
      const root = document.documentElement;
      Object.entries(t.cssVars || {}).forEach(([k, v]) => {
        root.style.setProperty(k, v);
      });
    } catch { }
  }, []);

  // Initialize on mount
  useEffect(() => {
    applyTemplate(templateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TemplateContext.Provider value={{ templateId, applyTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error('useTemplate must be used within TemplateProvider');
  return ctx;
}