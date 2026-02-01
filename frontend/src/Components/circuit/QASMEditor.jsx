import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * QASMEditor - Professional Code Editor
 * 
 * Features:
 *  - Synchronized scrolling between line numbers, overlay, and textarea
 *  - Consistent line-height alignment
 *  - Real-time error highlighting with tooltips
 *  - Caret preservation on state updates
 *  - Theme-aware colors via CSS variables
 */

const LINE_HEIGHT = 20; // Fixed line height in pixels

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
  const gutterRef = useRef(null);
  const overlayRef = useRef(null);
  const lastSelectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => { setLocalLines(lines); }, [lines]);

  function getFullText(ls) { return ls.join('\n'); }

  // Sync scroll between textarea, overlay, and gutter
  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const scrollLeft = e.target.scrollLeft;
    
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = scrollTop;
      overlayRef.current.scrollLeft = scrollLeft;
    }
    if (textAreaRef.current && e.target !== textAreaRef.current) {
      textAreaRef.current.scrollTop = scrollTop;
      textAreaRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  function handleInput(e) {
    const ta = e.target;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    const value = ta.value;
    const newLines = value.split(/\r?\n/);

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

  const hasErrors = Object.keys(lineErrors).length > 0;
  const errorCount = Object.keys(lineErrors).length;

  return (
    <div className="qt-panel qt-qasm-editor-wrap">
      {/* Header */}
      <div className="qt-qasm-header">
        <h6 className="qt-qasm-title">
          OpenQASM (Live)
          {hasErrors && (
            <span className="qt-qasm-error-badge" title={`${errorCount} error(s)`}>
              {errorCount}
            </span>
          )}
        </h6>
        <div className="qt-qasm-actions">
          <button
            className="qt-btn qt-btn-sm"
            onClick={() => forceParseAll?.()}
            title="Parse entire program (Ctrl/Cmd + Enter)"
          >
            Parse All
          </button>
        </div>
      </div>

      {/* Editor Container - unified scroll */}
      <div className="qt-qasm-editor-container">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="qt-qasm-gutter"
          style={{ lineHeight: `${LINE_HEIGHT}px` }}
        >
          {localLines.map((_, i) => {
            const isError = !!lineErrors[i];
            const isHover = hoverLine === i;
            return (
              <div
                key={i}
                className={`qt-qasm-line-num ${isError ? 'error' : ''} ${isHover ? 'hover' : ''}`}
                onMouseEnter={() => onLineHover?.(i)}
                onMouseLeave={() => onLineLeave?.()}
                style={{ height: LINE_HEIGHT }}
                title={isError ? lineErrors[i] : undefined}
              >
                <span className="qt-qasm-line-num-text">{i + 1}</span>
                {isError && <span className="qt-qasm-line-error-dot">●</span>}
              </div>
            );
          })}
        </div>

        {/* Code Area (Overlay + Textarea) */}
        <div className="qt-qasm-code-area">
          {/* Syntax Highlighting Overlay */}
          <pre
            ref={overlayRef}
            className="qt-qasm-overlay"
            aria-hidden="true"
            style={{ lineHeight: `${LINE_HEIGHT}px` }}
          >
            {localLines.map((ln, i) => {
              const isError = !!lineErrors[i];
              const isHover = hoverLine === i;
              return (
                <div
                  key={i}
                  className={`qt-qasm-code-line ${isError ? 'error' : ''} ${isHover ? 'hover' : ''}`}
                  style={{ height: LINE_HEIGHT, minHeight: LINE_HEIGHT }}
                  onMouseEnter={() => onLineHover?.(i)}
                  onMouseLeave={() => onLineLeave?.()}
                >
                  <span className="qt-qasm-code-text">
                    {highlightSyntax(ln)}
                  </span>
                  {isError && (
                    <span className="qt-qasm-inline-error" title={lineErrors[i]}>
                      ⚠ {lineErrors[i]}
                    </span>
                  )}
                </div>
              );
            })}
          </pre>

          {/* Textarea (invisible but interactive) */}
          <textarea
            ref={textAreaRef}
            value={getFullText(localLines)}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onClick={preserveCaret}
            onKeyUp={preserveCaret}
            onScroll={handleScroll}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="qt-qasm-textarea"
            style={{ lineHeight: `${LINE_HEIGHT}px` }}
          />
        </div>
      </div>

      {/* Footer hints */}
      <div className="qt-qasm-hints">
        <span>Type gates ending with <code>;</code></span>
        <span className="qt-qasm-hint-sep">•</span>
        <span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> = parse all</span>
        <span className="qt-qasm-hint-sep">•</span>
        <span>Hover to highlight gates</span>
      </div>
    </div>
  );
}

/**
 * Simple syntax highlighting for QASM
 */
function highlightSyntax(line) {
  if (!line || !line.trim()) return line || ' ';
  
  // Comments
  if (line.trim().startsWith('//')) {
    return <span className="qt-syn-comment">{line}</span>;
  }
  
  // Headers
  if (/^(OPENQASM|include)\s/i.test(line.trim())) {
    return <span className="qt-syn-header">{line}</span>;
  }
  
  // Register declarations
  if (/^(qreg|creg)\s/i.test(line.trim())) {
    return <span className="qt-syn-register">{line}</span>;
  }
  
  // Gate operations - match gate name and highlight
  const gateMatch = line.match(/^(\s*)(\w+)(\s*[\(\[]?.*)$/);
  if (gateMatch) {
    const [, indent, gateName, rest] = gateMatch;
    const gates = ['h', 'x', 'y', 'z', 's', 't', 'sdg', 'tdg', 'rx', 'ry', 'rz', 'u1', 'u2', 'u3', 'cx', 'cz', 'ccx', 'swap', 'measure', 'barrier', 'reset', 'id'];
    if (gates.includes(gateName.toLowerCase())) {
      return (
        <>
          {indent}
          <span className="qt-syn-gate">{gateName}</span>
          <span className="qt-syn-args">{rest}</span>
        </>
      );
    }
  }
  
  return line;
}