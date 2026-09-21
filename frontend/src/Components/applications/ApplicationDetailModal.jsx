import React, { useEffect } from "react";
import {
  X,
  ExternalLink,
  BookOpen,
  Zap,
  AlertCircle,
  Layers,
  Sparkles,
  BrainCircuit,
  Compass,
  FlaskConical,
  Network,
  ShieldCheck,
  FileText
} from "lucide-react";

const DOMAIN_ICONS = {
  BrainCircuit: BrainCircuit,
  Compass: Compass,
  FlaskConical: FlaskConical,
  Network: Network,
  ShieldCheck: ShieldCheck,
};

export default function ApplicationDetailModal({ problem, domainInfo, onClose }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!problem) return null;

  const DomainIcon = domainInfo?.icon ? DOMAIN_ICONS[domainInfo.icon] || Sparkles : Sparkles;
  const domainColor = domainInfo?.color || "var(--qt-accent, #6366f1)";

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="qt-app-modal-backdrop" onClick={handleBackdropClick}>
      <div className="qt-app-modal-container" role="dialog" aria-modal="true">
        {/* Header Bar */}
        <div className="qt-app-modal-header">
          <div className="qt-app-modal-meta">
            <span
              className="qt-app-modal-domain-badge"
              style={{
                backgroundColor: `${domainColor}16`,
                borderColor: `${domainColor}35`,
                color: domainColor,
              }}
            >
              <DomainIcon size={14} className="qt-app-modal-domain-icon" />
              {domainInfo?.title || problem.domain.toUpperCase()}
            </span>

            {problem.badge && (
              <span className="qt-app-modal-status-badge">
                {problem.badge}
              </span>
            )}

            {problem.advantageType && (
              <span className="qt-app-modal-advantage-badge">
                <Zap size={13} style={{ marginRight: 4, color: "#f59e0b" }} />
                {problem.advantageType}
              </span>
            )}
          </div>

          <button
            className="qt-app-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title Area */}
        <div className="qt-app-modal-titles">
          <h2 className="qt-app-modal-title">{problem.title}</h2>
          <p className="qt-app-modal-subtitle">{problem.subtitle}</p>
        </div>

        {/* Scrollable Content Body */}
        <div className="qt-app-modal-body">
          {/* Executive Summary */}
          <div className="qt-app-modal-section qt-app-summary-card">
            <h4 className="qt-app-section-heading">
              <Sparkles size={15} className="qt-section-icon" />
              Executive Problem Summary
            </h4>
            <p className="qt-app-summary-text">{problem.summary}</p>
          </div>

          {/* Comparative Section: Classical Bottleneck vs Quantum Advantage */}
          <div className="qt-app-comparison-grid">
            {/* Classical Bottleneck */}
            <div className="qt-app-comparison-col classical">
              <div className="qt-comparison-header classical-header">
                <AlertCircle size={16} className="qt-comp-icon" />
                <span>The Classical Bottleneck</span>
              </div>
              <p className="qt-comparison-body">
                {problem.classicalBottleneck}
              </p>
            </div>

            {/* Quantum Advantage */}
            <div className="qt-app-comparison-col quantum">
              <div className="qt-comparison-header quantum-header">
                <Zap size={16} className="qt-comp-icon" />
                <span>How Quantum Solves It</span>
              </div>
              <p className="qt-comparison-body">
                {problem.quantumMechanism}
              </p>
            </div>
          </div>

          {/* Circuit Approach & Algorithmic Blueprint */}
          {problem.circuitApproach && (
            <div className="qt-app-modal-section qt-app-circuit-card">
              <h4 className="qt-app-section-heading">
                <Layers size={15} className="qt-section-icon" />
                Algorithmic & Quantum Circuit Blueprint
              </h4>
              <p className="qt-circuit-text">{problem.circuitApproach}</p>
            </div>
          )}

          {/* Related Scientific Papers */}
          {problem.papers && problem.papers.length > 0 && (
            <div className="qt-app-modal-section qt-app-papers-section">
              <h4 className="qt-app-section-heading">
                <BookOpen size={15} className="qt-section-icon" />
                Peer-Reviewed Scientific Research & Publications
              </h4>
              <div className="qt-papers-list">
                {problem.papers.map((paper, idx) => (
                  <div key={idx} className="qt-paper-card">
                    <div className="qt-paper-header">
                      <div className="qt-paper-title-row">
                        <span className="qt-paper-index">[{idx + 1}]</span>
                        <a
                          href={paper.doiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="qt-paper-link"
                          title="Open peer-reviewed source in new tab"
                        >
                          <span className="qt-paper-title">{paper.title}</span>
                          <ExternalLink size={13} className="qt-external-icon" />
                        </a>
                      </div>
                    </div>

                    <div className="qt-paper-meta">
                      <span className="qt-paper-authors">{paper.authors}</span>
                      <span className="qt-paper-dot">•</span>
                      <span className="qt-paper-journal">{paper.journal}</span>
                      <span className="qt-paper-dot">•</span>
                      <span className="qt-paper-year">{paper.year}</span>
                    </div>

                    {paper.keyFinding && (
                      <div className="qt-paper-finding">
                        <span className="qt-finding-label">Key Empirical Finding:</span>{" "}
                        <span className="qt-finding-text">{paper.keyFinding}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Professional Clean Footer */}
        <div className="qt-app-modal-footer">
          <div className="qt-modal-footer-academic">
            <FileText size={15} style={{ color: "var(--qt-accent)" }} />
            <span>
              {problem.papers?.length || 0} Peer-Reviewed Citations Documented
            </span>
          </div>

          <button
            type="button"
            className="lp-btn-primary qt-modal-done-btn"
            onClick={onClose}
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
