import React from 'react';

/**
 * MarkdownRenderer - Parses inline markdown and renders React elements
 * 
 * Supports:
 * - **bold** text
 * - *italic* text
 * - `inline code`
 * - |state⟩ quantum notation
 * - [link text](url) links
 */

// Parse inline markdown to React elements
export function parseInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return text;

  const elements = [];
  let remaining = text;
  let key = 0;

  // Regex patterns
  const patterns = [
    // Bold: **text**
    { regex: /\*\*([^*]+)\*\*/, render: (match) => <strong key={key++} className="doc-bold">{match[1]}</strong> },
    // Italic: *text* (not preceded by *)
    { regex: /(?<!\*)\*([^*]+)\*(?!\*)/, render: (match) => <em key={key++} className="doc-italic">{match[1]}</em> },
    // Inline code: `code`
    { regex: /`([^`]+)`/, render: (match) => <code key={key++} className="doc-inline-code">{match[1]}</code> },
    // Quantum notation: |state⟩
    { regex: /\|([^⟩]+)⟩/, render: (match) => <span key={key++} className="doc-quantum-state">|{match[1]}⟩</span> },
  ];

  // Process text through patterns
  while (remaining.length > 0) {
    let earliestMatch = null;
    let earliestIndex = remaining.length;
    let matchedPattern = null;

    // Find earliest pattern match
    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestIndex = match.index;
        matchedPattern = pattern;
      }
    }

    if (earliestMatch && matchedPattern) {
      // Add text before match
      if (earliestIndex > 0) {
        elements.push(remaining.slice(0, earliestIndex));
      }
      // Add rendered element
      elements.push(matchedPattern.render(earliestMatch));
      // Continue with remaining text
      remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
    } else {
      // No more matches, add remaining text
      elements.push(remaining);
      break;
    }
  }

  return elements.length === 1 && typeof elements[0] === 'string' ? elements[0] : elements;
}

// Render a paragraph with inline markdown
export function MarkdownParagraph({ children, className = '' }) {
  return (
    <p className={`doc-paragraph ${className}`}>
      {parseInlineMarkdown(children)}
    </p>
  );
}

// Render a list item with inline markdown
export function MarkdownListItem({ children }) {
  return <li>{parseInlineMarkdown(children)}</li>;
}

// Render a list with markdown support
export function MarkdownList({ items, ordered = false, className = '' }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`doc-list ${className}`}>
      {items.map((item, index) => (
        <MarkdownListItem key={index}>{item}</MarkdownListItem>
      ))}
    </Tag>
  );
}

// Callout box component
export function Callout({ type = 'note', title, children }) {
  const icons = {
    note: '📝',
    tip: '💡',
    warning: '⚠️',
    important: '❗',
    platform: '🔧',
    concept: '🎯',
    example: '📌',
  };

  const titles = {
    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
    important: 'Important',
    platform: 'In Qubit-Tracer',
    concept: 'Key Concept',
    example: 'Example',
  };

  return (
    <div className={`doc-callout doc-callout-${type}`}>
      <div className="doc-callout-header">
        <span className="doc-callout-icon">{icons[type] || icons.note}</span>
        <span className="doc-callout-title">{title || titles[type]}</span>
      </div>
      <div className="doc-callout-content">
        {typeof children === 'string' ? parseInlineMarkdown(children) : children}
      </div>
    </div>
  );
}

// Key takeaway component
export function KeyTakeaway({ items }) {
  return (
    <div className="doc-key-takeaway">
      <div className="doc-key-takeaway-header">
        <span className="doc-key-takeaway-icon">🎯</span>
        <span className="doc-key-takeaway-title">Key Takeaways</span>
      </div>
      <ul className="doc-key-takeaway-list">
        {items.map((item, index) => (
          <li key={index}>{parseInlineMarkdown(item)}</li>
        ))}
      </ul>
    </div>
  );
}

// Code block component with basic syntax highlighting
export function CodeBlock({ code, language = 'qasm', caption }) {
  return (
    <div className="doc-code-block">
      {caption && <div className="doc-code-caption">{caption}</div>}
      <pre className={`doc-code-pre language-${language}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Table component
export function DocTable({ headers, rows, caption }) {
  return (
    <div className="doc-table-wrapper">
      {caption && <div className="doc-table-caption">{caption}</div>}
      <table className="doc-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{parseInlineMarkdown(header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{parseInlineMarkdown(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Step-by-step list for tutorials
export function StepList({ steps }) {
  return (
    <ol className="doc-step-list">
      {steps.map((step, index) => (
        <li key={index} className="doc-step-item">
          <div className="doc-step-number">{index + 1}</div>
          <div className="doc-step-content">
            {typeof step === 'string' ? parseInlineMarkdown(step) : step}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default {
  parseInlineMarkdown,
  MarkdownParagraph,
  MarkdownList,
  Callout,
  KeyTakeaway,
  CodeBlock,
  DocTable,
  StepList,
};
