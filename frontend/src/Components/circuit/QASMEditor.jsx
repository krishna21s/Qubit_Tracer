import React, { useState, useEffect, useRef } from 'react';

/**
 * QASMEditor with:
 *  - line highlighting
 *  - per-line errors
 *  - incremental parse triggers
 *  - parse-all button
 *  - caret preservation
 *
 * (UPDATED)
 *  - Fix reversed typing: capture caret on every input (before state update)
 *  - Enforce LTR typing flow
 *  - Theme-aware colors via CSS variables (safe fallbacks)
 */
export default function QASMEditor({
  lines,
  onChange,
  lineErrors = {},
  hoverLine,
  onLineHover,
  onLineLeave,
  forceParseAll
}) {
  const [localLines, setLocalLines] = useState(lines);
  const textAreaRef = useRef(null);
  const lastSelectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => { setLocalLines(lines); }, [lines]);

  function getFullText(ls) { return ls.join('\n'); }

  function handleInput(e) {
    const ta = e.target;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    const value = ta.value;
    const newLines = value.split(/\r?\n/);

    const changed = [];
    const maxLen = Math.max(newLines.length, localLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (newLines[i] !== localLines[i]) changed.push(i);
    }

    lastSelectionRef.current = { start: selStart, end: selEnd };
    setLocalLines(newLines);
    onChange(getFullText(newLines), { forceFullParse: false });
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onChange(getFullText(localLines), { forceFullParse: true });
      return;
    }
  }

  function preserveCaret() {
    const ta = textAreaRef.current;
    if (!ta) return;
    lastSelectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  }

  function restoreCaret() {
    const ta = textAreaRef.current;
    if (!ta) return;
    const { start, end } = lastSelectionRef.current;
    requestAnimationFrame(() => {
      try {
        ta.selectionStart = start;
        ta.selectionEnd = end;
      } catch { }
    });
  }

  useEffect(() => { restoreCaret(); }, [localLines]);

  return (
    <div className="qt-panel qt-qasm-wrap" style={{ height: '100%', position: 'relative' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="m-0" style={{ color: 'var(--qt-text-dim, #a9c8dd)', fontWeight: 600, letterSpacing: '.5px' }}>
          OpenQASM (Live)
        </h6>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="qt-btn"
            style={{ padding: '4px 10px', fontSize: 11 }}
            onClick={() => forceParseAll?.()}
            title="Parse entire program (bulk paste)"
          >
            Parse All
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Gutter */}
        <div
          style={{
            width: 46,
            background: 'var(--qt-surface-glass, rgba(15,24,36,0.6))',
            borderRight: '1px solid var(--qt-border, #2d445b)',
            paddingTop: 4,
            fontSize: 12,
            userSelect: 'none'
          }}
        >
          {localLines.map((_, i) => {
            const isError = lineErrors[i];
            const isHover = hoverLine === i;
            return (
              <div
                key={i}
                onMouseEnter={() => onLineHover?.(i)}
                onMouseLeave={() => onLineLeave?.()}
                style={{
                  padding: '0 6px',
                  height: 18,
                  lineHeight: '18px',
                  color: isError ? '#ff8080' : (isHover ? 'var(--qt-text, #ffffff)' : 'var(--qt-text-dim, #88b6cc)'),
                  background: isHover ? 'var(--qt-accent-tint, rgba(80,150,200,0.18))' : 'transparent',
                  borderRadius: 4,
                  cursor: 'default',
                  position: 'relative'
                }}
              >
                {i + 1}
                {isError && (
                  <span
                    title={lineErrors[i]}
                    style={{
                      position: 'absolute',
                      right: 4,
                      top: 0,
                      color: '#ff8080',
                      fontWeight: 700
                    }}
                  >!</span>
                )}
              </div>
            );
          })}
        </div>
        {/* Overlay + textarea */}
        <div style={{ flex: 1, position: 'relative' }}>
          <pre
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              margin: 0,
              padding: '6px 10px',
              fontFamily: 'Courier New, monospace',
              fontSize: 12,
              lineHeight: '18px',
              whiteSpace: 'pre',
              overflow: 'auto',
              color: 'var(--qt-text, #d7ecf8)',
              pointerEvents: 'none'
            }}
          >
            {localLines.map((ln, i) => {
              const err = lineErrors[i];
              const hover = hoverLine === i;
              return (
                <div
                  key={i}
                  style={{
                    background: err
                      ? 'rgba(255,90,90,0.10)'
                      : (hover ? 'var(--qt-accent-tint, rgba(120,190,255,0.10))' : 'transparent'),
                    borderBottom: '1px solid color-mix(in srgb, var(--qt-border, #28415a) 80%, transparent)'
                  }}
                >
                  {ln || ' '}
                </div>
              );
            })}
          </pre>
          <textarea
            ref={textAreaRef}
            value={getFullText(localLines)}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onClick={preserveCaret}
            onKeyUp={preserveCaret}
            spellCheck={false}
            className="qt-qasm-textarea"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              color: 'transparent',       // keep overlay styling
              caretColor: 'var(--qt-accent, #66d8ff)',
              resize: 'none',
              whiteSpace: 'pre',
              fontFamily: 'Courier New, monospace',
              fontSize: 12,
              lineHeight: '18px',
              overflow: 'auto',
              direction: 'ltr',
              unicodeBidi: 'plaintext'
            }}
          />
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--qt-text-dim, #6fa8c6)' }}>
        Type gates ending with ;  •  Ctrl/Cmd+Enter = parse all  •  Hover to correlate code ↔ gates  •  Undo (Ctrl/Cmd+Z), Redo (Ctrl/Cmd+Y / Shift+Ctrl+Z)
      </div>
    </div>
  );
}