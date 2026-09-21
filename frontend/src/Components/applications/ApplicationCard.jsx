import React from "react";
import {
  BrainCircuit,
  Compass,
  FlaskConical,
  Network,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";

const DOMAIN_ICONS = {
  BrainCircuit: BrainCircuit,
  Compass: Compass,
  FlaskConical: FlaskConical,
  Network: Network,
  ShieldCheck: ShieldCheck,
};

export default function ApplicationCard({
  problem,
  domainInfo,
  onSelect,
}) {
  const DomainIcon = domainInfo?.icon ? DOMAIN_ICONS[domainInfo.icon] || Sparkles : Sparkles;
  const domainColor = domainInfo?.color || "var(--qt-accent, #6366f1)";

  return (
    <div
      className="lp-tool-card qt-application-card"
      onClick={() => onSelect(problem)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(problem);
        }
      }}
    >
      {/* Top Section */}
      <div className="lp-tool-card-top">
        <div className="qt-tool-card-meta">
          <div
            className="qt-tool-domain-badge"
            style={{
              color: domainColor,
              backgroundColor: `${domainColor}14`,
              borderColor: `${domainColor}30`,
            }}
          >
            <DomainIcon size={13} className="qt-domain-mini-icon" />
            <span>{domainInfo?.shortTitle || domainInfo?.title || problem.domain.toUpperCase()}</span>
          </div>

          {problem.badge && (
            <span className="qt-tool-status-tag">
              {problem.badge}
            </span>
          )}
        </div>

        <h3 className="qt-tool-card-title">{problem.title}</h3>
        <p className="qt-tool-card-subtitle">{problem.subtitle}</p>
      </div>

      {/* Body Description & Advantage */}
      <div className="qt-tool-card-body">
        <p className="qt-tool-card-summary">{problem.summary}</p>
        
        {problem.advantageType && (
          <div className="qt-tool-advantage-pill">
            <Zap size={12} style={{ color: "#f59e0b", flexShrink: 0 }} />
            <span>{problem.advantageType}</span>
          </div>
        )}
      </div>
    </div>
  );
}
