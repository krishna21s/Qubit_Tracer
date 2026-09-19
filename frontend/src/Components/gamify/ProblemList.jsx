import React, { useState, useMemo } from 'react';
import {
  Search,
  Xmark,
  CheckCircle,
  Play,
  Refresh,
  Cpu,
  Layers,
  Code,
  Shield,
  Bolt,
  ChevronLeft
} from 'reicon-react';
import sounds from './soundEffects';

export default function ProblemList({
  problems = [],
  level,
  onProblemSelect,
  solvedIds = new Set(),
  onBackToFeatured
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unsolved', 'solved'

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (level && Number(p.level) !== Number(level)) return false;
      const isSolved = solvedIds.has(p.id);
      if (filter === 'solved' && !isSolved) return false;
      if (filter === 'unsolved' && isSolved) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const titleMatch = p.title && p.title.toLowerCase().includes(term);
        const descMatch = p.description && p.description.toLowerCase().includes(term);
        return titleMatch || descMatch;
      }
      return true;
    });
  }, [problems, filter, searchTerm, solvedIds, level]);

  const solvedCount = problems.filter(p => solvedIds.has(p.id)).length;
  const totalCount = problems.length || 1;
  const progressPct = Math.round((solvedCount / totalCount) * 100);

  const getDifficulty = (lvl) => {
    if (lvl === 1) return { label: 'EASY', class: 'gf-diff-easy' };
    if (lvl === 2) return { label: 'MEDIUM', class: 'gf-diff-medium' };
    if (lvl === 3) return { label: 'HARD', class: 'gf-diff-hard' };
    return { label: 'EXPERT', class: 'gf-diff-expert' };
  };

  const getHeaderInfo = () => {
    if (!level) {
      return {
        icon: Cpu,
        title: 'All Quantum Challenges',
        badge: `${problems.length} Total Challenges`,
        desc: 'Master single-qubit identities, entanglement protocols, algorithm oracles, and error mitigation.'
      };
    }
    switch (Number(level)) {
      case 1:
        return {
          icon: Cpu,
          title: 'Beginner Challenges: Single-Qubit Foundations',
          badge: 'Beginner Level • Gate Studio',
          desc: 'Select gates to compose quantum circuits, test equivalence, and master single-qubit identities on the Bloch sphere.'
        };
      case 2:
        return {
          icon: Layers,
          title: 'Medium Challenges: Multi-Qubit Entanglement',
          badge: 'Medium Level • Wire Studio',
          desc: 'Build Bell states, multi-qubit entanglement, teleportation, and swap circuits visually with Q-Circuit Studio wire lines.'
        };
      case 3:
      default:
        return {
          icon: Code,
          title: 'Hard Challenges: Quantum Algorithms & Oracles',
          badge: 'Hard Level • Code Editor',
          desc: 'Implement foundational quantum algorithms (Deutsch-Jozsa, Grover) using Qiskit, Cirq, PennyLane, or OpenQASM with real-time test evaluation.'
        };
    }
  };

  const info = getHeaderInfo();
  const HeaderIcon = info.icon;

  return (
    <div className="gf-problem-list-viewport">
      <div className="gf-container">
        {/* Back button */}
        {onBackToFeatured && (
          <div style={{ marginBottom: '16px' }}>
            <button
              className="gf-back-featured-btn"
              onClick={() => {
                sounds.playClick();
                onBackToFeatured();
              }}
              type="button"
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Header Banner */}
        <div className="gf-problems-header">
          <div className="gf-problems-header-left">
            <div className="gf-problems-title-row">
              <div className="gf-level-icon-badge">
                <HeaderIcon size={20} />
              </div>
              <h1 className="gf-problems-title">{info.title}</h1>
              <span className="gf-problems-tier-tag">{info.badge}</span>
            </div>
            <p className="gf-problems-desc">{info.desc}</p>
          </div>

          {/* Quick Progress Indicator */}
          <div className="gf-problems-stat-pill">
            <div className="gf-psp-progress-ring">
              <span className="gf-psp-pct">{progressPct}%</span>
            </div>
            <div className="gf-psp-text">
              <span className="gf-psp-label">Completion</span>
              <span className="gf-psp-count">
                <strong>{solvedCount}</strong> of {problems.length} Solved
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar / Search & Filter */}
        <div className="gf-problems-toolbar">
          {/* Search Box */}
          <div className="gf-problems-search">
            <Search size={14} className="gf-search-icon" />
            <input
              type="text"
              placeholder={`Search ${problems.length} challenges...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="gf-search-clear"
                onClick={() => setSearchTerm('')}
                type="button"
                title="Clear search"
              >
                <Xmark size={13} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="gf-problems-filter-group">
            <button
              className={`gf-filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setFilter('all'); }}
              type="button"
            >
              All ({problems.length})
            </button>
            <button
              className={`gf-filter-btn ${filter === 'unsolved' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setFilter('unsolved'); }}
              type="button"
            >
              <Bolt size={12} />
              <span>Unsolved</span>
            </button>
            <button
              className={`gf-filter-btn ${filter === 'solved' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setFilter('solved'); }}
              type="button"
            >
              <CheckCircle size={12} />
              <span>Solved</span>
            </button>
          </div>
        </div>

        {/* Problems Table / List matching User Screenshot */}
        <div className="gf-table-container">
          <div className="gf-table-header-row">
            <span className="col-status">STATUS</span>
            <span className="col-title">CHALLENGE TITLE</span>
            <span className="col-diff">DIFFICULTY</span>
            <span className="col-qubits">QUBITS</span>
            <span className="col-reward">XP BOUNTY</span>
            <span className="col-action">ACTION</span>
          </div>

          <div className="gf-table-body">
            {filteredProblems.length === 0 ? (
              <div className="gf-table-empty">
                <Search size={24} />
                <p>No challenges match your current search or filter criteria.</p>
                <button
                  className="gf-reset-btn"
                  onClick={() => {
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  type="button"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredProblems.map((prob) => {
                const isSolved = solvedIds.has(prob.id);
                const diff = getDifficulty(prob.level || level || 1);
                const points = prob.points || ((prob.level || level || 1) * 50);

                return (
                  <div
                    key={prob.id}
                    className={`gf-table-row ${isSolved ? 'is-solved' : ''}`}
                    onClick={() => {
                      sounds.playClick();
                      onProblemSelect(prob);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {/* Status */}
                    <div className="col-status">
                      {isSolved ? (
                        <span className="gf-status-icon-solved" title="Solved">
                          <CheckCircle size={16} />
                        </span>
                      ) : (
                        <span className="gf-status-icon-todo" title="Unsolved">
                          <span className="gf-todo-dot" />
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div className="col-title">
                      <div className="gf-prob-title-text">{prob.title}</div>
                      {prob.description && (
                        <div className="gf-prob-desc-preview">{prob.description}</div>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="col-diff">
                      <span className={`gf-diff-badge ${diff.class}`}>
                        {diff.label}
                      </span>
                    </div>

                    {/* Qubits */}
                    <div className="col-qubits">
                      <span className="gf-qubit-tag">
                        {prob.num_qubits || 1}q
                      </span>
                    </div>

                    {/* Reward */}
                    <div className="col-reward">
                      <span className="gf-xp-bounty-tag">
                        <Bolt size={12} />
                        <span>+{points} XP</span>
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="col-action">
                      <button
                        className={`gf-row-action-btn ${isSolved ? 'review' : 'solve'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playClick();
                          onProblemSelect(prob);
                        }}
                        type="button"
                      >
                        {isSolved ? (
                          <>
                            <Refresh size={12} />
                            <span>Review</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} />
                            <span>Solve</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}