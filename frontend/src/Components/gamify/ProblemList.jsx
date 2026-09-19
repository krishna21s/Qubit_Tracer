import React, { useState, useMemo } from 'react';
import sounds from './soundEffects';

const Icons = {
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  todo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
};

function ProblemList({ problems, level, onProblemSelect, solvedIds = new Set() }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unsolved', 'solved'

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
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
  }, [problems, filter, searchTerm, solvedIds]);

  const getDifficulty = (lvl) => {
    if (lvl === 1) return { label: 'Easy', class: 'gf-difficulty-easy' };
    if (lvl === 2) return { label: 'Medium', class: 'gf-difficulty-medium' };
    return { label: 'Hard', class: 'gf-difficulty-hard' };
  };

  return (
    <div
      className="gf-problem-list-viewport"
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        padding: '24px 28px 120px',
        minHeight: 0,
        scrollBehavior: 'smooth'
      }}
    >
      <div className="gf-container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div className="gf-problems-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 className="gf-problems-title" style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--gf-text, #f1f5f9)', letterSpacing: '-0.5px' }}>
                {level === 1 ? '🌱 Beginner Circuits' : level === 2 ? '⚡ Intermediate Circuits & Algorithms' : `Level ${level} Challenges`}
              </h2>
              <span style={{
                fontSize: '13px',
                fontWeight: '700',
                padding: '4px 14px',
                borderRadius: '16px',
                background: 'rgba(56, 209, 255, 0.12)',
                color: '#38d1ff',
                border: '1px solid rgba(56, 209, 255, 0.35)',
                boxShadow: '0 0 12px rgba(56, 209, 255, 0.15)'
              }}>
                {problems.length} Challenges Total
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--gf-text-dim, #94a3b8)' }}>
              {level === 1
                ? 'Select gates to compose quantum circuits, test equivalence, and master single-qubit identities.'
                : level === 2
                ? 'Multi-qubit algorithms, Deutsch-Jozsa, Grover diffusion, teleportation, half-adders & Bell states built visually with Q-Circuit Studio wires.'
                : 'Write code in LeetCode style using your choice of Qiskit, Cirq, PennyLane, or OpenQASM with real-time test evaluation & acceptance rate.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Quick stats pill */}
            <div style={{
              fontSize: '13px',
              color: 'var(--gf-text-dim, #94a3b8)',
              background: 'rgba(255,255,255,0.04)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Progress:</span>
              <span style={{ color: '#22d3a5', fontWeight: '700' }}>
                {problems.filter(p => solvedIds.has(p.id)).length}
              </span>
              <span>/</span>
              <span style={{ fontWeight: '600' }}>{problems.length} Solved</span>
            </div>
          </div>
        </div>

        {/* Toolbar / Search & Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--gf-surface, #161b22)',
            border: '1px solid var(--gf-border, #30363d)',
            borderRadius: '8px',
            padding: '6px 14px',
            flex: '1',
            minWidth: '240px',
            maxWidth: '380px'
          }}>
            <span style={{ color: 'var(--gf-text-dim, #8b949e)', display: 'flex' }}>{Icons.search}</span>
            <input
              type="text"
              placeholder={`Search ${problems.length} challenges...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--gf-text, #c9d1d9)',
                fontSize: '13px',
                width: '100%'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gf-text-dim)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'unsolved', 'solved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: filter === f ? '1px solid #38d1ff' : '1px solid var(--gf-border, #30363d)',
                  background: filter === f ? 'rgba(56, 209, 255, 0.12)' : 'var(--gf-surface, #161b22)',
                  color: filter === f ? '#38d1ff' : 'var(--gf-text-dim, #8b949e)',
                  fontSize: '12px',
                  fontWeight: filter === f ? '700' : '500',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s'
                }}
              >
                {f} {f === 'all' ? `(${problems.length})` : f === 'solved' ? `(${problems.filter(p => solvedIds.has(p.id)).length})` : `(${problems.filter(p => !solvedIds.has(p.id)).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Problems Table */}
        <div className="gf-table-container" style={{
          border: '1px solid var(--gf-border, #30363d)',
          borderRadius: '10px',
          background: 'var(--gf-surface, #161b22)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }}>
          <table className="gf-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--gf-surface-alt, #0d1117)' }}>
                <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                <th style={{ width: '65px', textAlign: 'center' }}>Status</th>
                <th>Challenge Title</th>
                <th style={{ width: '110px' }}>Difficulty</th>
                <th style={{ width: '110px' }}>Acceptance</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem, idx) => {
                  const isSolved = solvedIds.has(problem.id);
                  const diff = getDifficulty(Number(problem.level));
                  const acceptance = (100 - (problem.level * 15) + (problem.id.charCodeAt(problem.id.length - 1) % 12)).toFixed(1) + '%';

                  return (
                    <tr
                      key={problem.id}
                      onClick={() => {
                        sounds.playClick();
                        onProblemSelect(problem);
                      }}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--gf-border, #30363d)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ textAlign: 'center', color: 'var(--gf-text-dim, #64748b)', fontSize: '12px', fontWeight: '600' }}>
                        {idx + 1}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: isSolved ? '#22d3a5' : 'var(--gf-text-dim, #64748b)' }}>
                          {isSolved ? Icons.check : Icons.todo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--gf-text, #f1f5f9)', fontSize: '14px' }}>
                          {problem.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--gf-text-dim, #8b949e)', marginTop: '2px', maxWidth: '600px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {problem.description}
                        </div>
                      </td>
                      <td>
                        <span className={diff.class} style={{ fontWeight: '600', fontSize: '12px' }}>
                          {diff.label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gf-text-dim, #94a3b8)', fontSize: '13px' }}>
                        {acceptance}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProblemSelect(problem);
                          }}
                          style={{
                            background: isSolved ? 'rgba(34, 211, 165, 0.12)' : 'rgba(56, 209, 255, 0.12)',
                            color: isSolved ? '#22d3a5' : '#38d1ff',
                            border: `1px solid ${isSolved ? 'rgba(34, 211, 165, 0.3)' : 'rgba(56, 209, 255, 0.3)'}`,
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isSolved ? 'Review' : 'Solve'} ➔
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--gf-text-dim)' }}>
                    No challenges matched your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProblemList;