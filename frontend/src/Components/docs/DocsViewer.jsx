import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import documentationData from './documentationData.json';
import {
  parseInlineMarkdown,
  MarkdownParagraph,
  MarkdownList,
  Callout,
  KeyTakeaway,
  CodeBlock,
  DocTable,
  StepList,
} from './MarkdownRenderer';

/**
 * Enhanced DocsViewer - Rich documentation renderer with:
 * - Table of contents sidebar
 * - Markdown parsing for bold/italic/code
 * - Callouts, tips, warnings
 * - Prev/Next navigation
 * - Reading progress indicator
 */

function DocsViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);

  const doc = documentationData.find(d => d.slug === slug);
  
  // Find prev/next articles
  const { prevDoc, nextDoc, currentIndex } = useMemo(() => {
    if (!doc) return { prevDoc: null, nextDoc: null, currentIndex: -1 };
    
    // Get articles in same category
    const categoryArticles = documentationData.filter(d => d.category === doc.category);
    const idx = categoryArticles.findIndex(d => d.slug === slug);
    
    return {
      prevDoc: idx > 0 ? categoryArticles[idx - 1] : null,
      nextDoc: idx < categoryArticles.length - 1 ? categoryArticles[idx + 1] : null,
      currentIndex: idx,
    };
  }, [doc, slug]);

  // Extract table of contents from subtitles
  const tableOfContents = useMemo(() => {
    if (!doc?.content) return [];
    
    return doc.content
      .map((item, index) => {
        if (item.type === 'subtitle') {
          const id = `section-${index}`;
          return { id, title: item.value, index };
        }
        return null;
      })
      .filter(Boolean);
  }, [doc]);

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const container = contentRef.current;
      const scrollTop = window.scrollY;
      const docHeight = container.scrollHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      setReadingProgress(progress);

      // Find active section
      const sections = container.querySelectorAll('[data-section-id]');
      let currentSection = null;
      
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSection = section.getAttribute('data-section-id');
        }
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Render content item based on type
  const renderContentItem = (item, index) => {
    const sectionId = `section-${index}`;
    
    switch (item.type) {
      case 'paragraph':
        return (
          <MarkdownParagraph key={index}>
            {item.value}
          </MarkdownParagraph>
        );

      case 'subtitle':
        return (
          <h2 
            key={index} 
            className="doc-subtitle"
            data-section-id={sectionId}
            id={sectionId}
          >
            {item.value}
          </h2>
        );

      case 'subsubtitle':
        return (
          <h3 key={index} className="doc-subsubtitle">
            {item.value}
          </h3>
        );

      case 'list':
        return (
          <MarkdownList 
            key={index} 
            items={item.items} 
            ordered={item.ordered}
          />
        );

      case 'image':
        return (
          <figure key={index} className="doc-figure">
            <img src={item.url} alt={item.caption || ''} />
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        );

      case 'callout':
        return (
          <Callout key={index} type={item.calloutType || 'note'} title={item.title}>
            {item.value}
          </Callout>
        );

      case 'tip':
        return (
          <Callout key={index} type="tip" title={item.title}>
            {item.value}
          </Callout>
        );

      case 'warning':
        return (
          <Callout key={index} type="warning" title={item.title}>
            {item.value}
          </Callout>
        );

      case 'platform_note':
        return (
          <Callout key={index} type="platform" title={item.title || "In Qubit-Tracer"}>
            {item.value}
          </Callout>
        );

      case 'key_takeaway':
        return <KeyTakeaway key={index} items={item.items} />;

      case 'code':
        return (
          <CodeBlock 
            key={index} 
            code={item.value} 
            language={item.language || 'qasm'}
            caption={item.caption}
          />
        );

      case 'table':
        return (
          <DocTable 
            key={index}
            headers={item.headers}
            rows={item.rows}
            caption={item.caption}
          />
        );

      case 'steps':
        return <StepList key={index} steps={item.items} />;

      default:
        return null;
    }
  };

  if (!doc) {
    return (
      <div className="docs-root">
        <div className="doc-viewer-container doc-not-found">
          <div className="doc-not-found-icon">📚</div>
          <h2>Topic Not Found</h2>
          <p>The documentation you're looking for doesn't exist or has been moved.</p>
          <Link to="/docs" className="doc-back-button">
            ← Back to Documentation Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="docs-root">
      {/* Reading progress bar */}
      <div 
        className="doc-progress-bar"
        style={{ width: `${readingProgress}%` }}
      />

      <div className="doc-viewer-layout">
        {/* Table of Contents Sidebar */}
        {tableOfContents.length > 0 && (
          <aside className="doc-toc-sidebar">
            <div className="doc-toc-sticky">
              <div className="doc-toc-header">On This Page</div>
              <nav className="doc-toc-nav">
                {tableOfContents.map(section => (
                  <button
                    key={section.id}
                    className={`doc-toc-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => scrollToSection(section.id)}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="doc-viewer-container" ref={contentRef}>
          {/* Breadcrumb */}
          <nav className="doc-breadcrumb">
            <Link to="/docs">Documentation</Link>
            <span className="doc-breadcrumb-sep">›</span>
            <span className="doc-breadcrumb-category">{doc.category}</span>
          </nav>

          {/* Article Header */}
          <header className="doc-header">
            <h1 className="doc-title">{doc.question}</h1>
            {doc.summary && (
              <p className="doc-summary">{doc.summary}</p>
            )}
            {doc.difficulty && (
              <span className={`doc-difficulty doc-difficulty-${doc.difficulty}`}>
                {doc.difficulty}
              </span>
            )}
          </header>

          {/* Article Content */}
          <article className="doc-content">
            {doc.content.map((item, index) => renderContentItem(item, index))}
          </article>

          {/* Related Topics */}
          {doc.relatedArticles && doc.relatedArticles.length > 0 && (
            <section className="doc-related" style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--lightest-navy)' }}>
              <h3 className="doc-related-title" style={{ fontSize: '1.2rem', color: 'var(--lightest-slate)', marginBottom: '16px' }}>Related Topics</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {doc.relatedArticles.map(articleId => {
                  const related = documentationData.find(d => d.id === articleId);
                  if (!related) return null;
                  return (
                    <li key={articleId}>
                      <Link 
                        to={`/docs/${related.slug}`}
                        style={{ color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>•</span>
                        {related.question}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Prev/Next Navigation */}
          <nav className="doc-nav-prev-next">
            <div className="doc-nav-prev">
              {prevDoc && (
                <Link to={`/docs/${prevDoc.slug}`} className="doc-nav-link">
                  <span className="doc-nav-label">← Previous</span>
                  <span className="doc-nav-title">{prevDoc.question}</span>
                </Link>
              )}
            </div>
            <div className="doc-nav-next">
              {nextDoc && (
                <Link to={`/docs/${nextDoc.slug}`} className="doc-nav-link">
                  <span className="doc-nav-label">Next →</span>
                  <span className="doc-nav-title">{nextDoc.question}</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Back to docs link */}
          <Link to="/docs" className="doc-back-link">
            ← Back to all documentation
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DocsViewer;