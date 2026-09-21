import React, { useState, useMemo } from "react";
import {
  BrainCircuit,
  Compass,
  FlaskConical,
  Network,
  ShieldCheck,
  Search,
  Layers,
  Sparkles
} from "lucide-react";

import { APPLICATION_DOMAINS, APPLICATION_PROBLEMS } from "./applicationsData";
import ApplicationCard from "./ApplicationCard";
import ApplicationDetailModal from "./ApplicationDetailModal";

import "../../styles/dashboardCards.css";
import "../../styles/applicationsCards.css";

const DOMAIN_ICONS = {
  BrainCircuit: BrainCircuit,
  Compass: Compass,
  FlaskConical: FlaskConical,
  Network: Network,
  ShieldCheck: ShieldCheck,
};

export default function ApplicationsContent() {
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProblem, setActiveProblem] = useState(null);

  // Map of domainId -> domainObject for fast lookup
  const domainMap = useMemo(() => {
    const map = {};
    APPLICATION_DOMAINS.forEach((d) => {
      map[d.id] = d;
    });
    return map;
  }, []);

  // Filter problems based on domain filter & search query
  const filteredProblems = useMemo(() => {
    return APPLICATION_PROBLEMS.filter((problem) => {
      const matchesDomain =
        selectedDomain === "all" || problem.domain === selectedDomain;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesDomain;

      const matchesSearch =
        problem.title.toLowerCase().includes(q) ||
        problem.subtitle.toLowerCase().includes(q) ||
        problem.summary.toLowerCase().includes(q) ||
        problem.quantumMechanism.toLowerCase().includes(q) ||
        problem.classicalBottleneck.toLowerCase().includes(q) ||
        (problem.advantageType && problem.advantageType.toLowerCase().includes(q)) ||
        problem.papers?.some(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.authors.toLowerCase().includes(q) ||
            p.journal.toLowerCase().includes(q)
        );

      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, searchQuery]);

  // Group filtered problems by domain
  const groupedByDomain = useMemo(() => {
    const groups = {};
    APPLICATION_DOMAINS.forEach((d) => {
      groups[d.id] = [];
    });
    filteredProblems.forEach((p) => {
      if (!groups[p.domain]) groups[p.domain] = [];
      groups[p.domain].push(p);
    });
    return groups;
  }, [filteredProblems]);

  return (
    <div className="lp-dashboard-root qt-applications-root">
      {/* 1. Header Section matching Dashboard Header */}
      <header className="lp-header qt-app-header">
        <div className="lp-header-left">
          <div className="lp-date-badge qt-app-icon-badge">
            <Sparkles size={26} style={{ color: "var(--qt-accent)" }} />
          </div>
          <div className="lp-greeting">
            <h1>Quantum Applications</h1>
            <p>Real-world computational challenges addressed through quantum advantage</p>
          </div>
        </div>

        <div className="lp-header-right">
          <div className="lp-search-box">
            <Search size={18} className="lp-search-icon" />
            <input
              type="text"
              placeholder="Search applications..."
              className="lp-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="qt-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Domain Filter Navigation Pills */}
      <div className="qt-domain-filter-bar">
        <button
          type="button"
          className={`qt-filter-pill ${selectedDomain === "all" ? "active" : ""}`}
          onClick={() => setSelectedDomain("all")}
        >
          <Layers size={14} />
          <span>All Domains</span>
          <span className="qt-pill-count">{APPLICATION_PROBLEMS.length}</span>
        </button>

        {APPLICATION_DOMAINS.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.icon] || Sparkles;
          const count = APPLICATION_PROBLEMS.filter((p) => p.domain === domain.id).length;
          const isActive = selectedDomain === domain.id;

          return (
            <button
              key={domain.id}
              type="button"
              className={`qt-filter-pill ${isActive ? "active" : ""}`}
              onClick={() => setSelectedDomain(domain.id)}
            >
              <Icon size={14} style={{ color: domain.color }} />
              <span>{domain.shortTitle}</span>
              <span className="qt-pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Applications Content Area */}
      <div className="qt-app-sections-wrapper">
        {filteredProblems.length === 0 ? (
          <div className="lp-hero qt-empty-state-card">
            <div className="lp-hero-header" style={{ textAlign: "center", width: "100%" }}>
              <h2>No Matching Applications Found</h2>
              <p>Try searching for a different keyword or switch to "All Domains".</p>
              <div style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  className="lp-btn-primary"
                  onClick={() => {
                    setSelectedDomain("all");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        ) : selectedDomain === "all" ? (
          // Render domain-by-domain sections matching Dashboard Hero cards
          APPLICATION_DOMAINS.map((domain) => {
            const domainProblems = groupedByDomain[domain.id] || [];
            if (domainProblems.length === 0) return null;

            return (
              <section key={domain.id} className="lp-hero qt-domain-hero-section">
                <div className="lp-hero-header">
                  <div className="qt-domain-heading-row">
                    <h2>{domain.title}</h2>
                    <span
                      className="qt-domain-count-badge"
                      style={{ color: domain.color, borderColor: `${domain.color}40` }}
                    >
                      {domainProblems.length} {domainProblems.length === 1 ? "Problem" : "Problems"}
                    </span>
                  </div>
                  <p>{domain.tagline}</p>
                </div>

                <div className="qt-hero-tool-grid">
                  {domainProblems.map((problem) => (
                    <ApplicationCard
                      key={problem.id}
                      problem={problem}
                      domainInfo={domain}
                      onSelect={(p) => setActiveProblem(p)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          // Single Selected Domain Section
          (() => {
            const domain = domainMap[selectedDomain];
            const domainProblems = groupedByDomain[selectedDomain] || [];

            return (
              <section className="lp-hero qt-domain-hero-section">
                <div className="lp-hero-header">
                  <div className="qt-domain-heading-row">
                    <h2>{domain?.title}</h2>
                    <span
                      className="qt-domain-count-badge"
                      style={{ color: domain?.color, borderColor: `${domain?.color}40` }}
                    >
                      {domainProblems.length} {domainProblems.length === 1 ? "Problem" : "Problems"}
                    </span>
                  </div>
                  <p>{domain?.description || domain?.tagline}</p>
                </div>

                <div className="qt-hero-tool-grid">
                  {domainProblems.map((problem) => (
                    <ApplicationCard
                      key={problem.id}
                      problem={problem}
                      domainInfo={domain}
                      onSelect={(p) => setActiveProblem(p)}
                    />
                  ))}
                </div>
              </section>
            );
          })()
        )}
      </div>

      {/* 4. Interactive Detail Modal */}
      {activeProblem && (
        <ApplicationDetailModal
          problem={activeProblem}
          domainInfo={domainMap[activeProblem.domain]}
          onClose={() => setActiveProblem(null)}
        />
      )}
    </div>
  );
}
