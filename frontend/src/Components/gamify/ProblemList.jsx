import React from 'react';

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
  )
};

function ProblemList({ problems, level, onProblemSelect, solvedIds = new Set() }) {
  const getDifficulty = (lvl) => {
    if (lvl === 1) return { label: 'Easy', class: 'gf-difficulty-easy' };
    if (lvl === 2) return { label: 'Medium', class: 'gf-difficulty-medium' };
    return { label: 'Hard', class: 'gf-difficulty-hard' };
  };

  return (
    <div className="gf-container" style={{ padding: '24px' }}>
      <div className="gf-problems-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h2 className="gf-problems-title" style={{ fontSize: '20px', fontWeight: '600' }}>
          Problem List
        </h2>
      </div>

      <div className="gf-table-container">
        <table className="gf-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Status</th>
              <th>Title</th>
              <th style={{ width: '150px' }}>Difficulty</th>
              <th style={{ width: '150px' }}>Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? (
              problems.map((problem) => {
                const isSolved = solvedIds.has(problem.id);
                const diff = getDifficulty(Number(problem.level));
                // Mock acceptance rate
                const acceptance = (100 - (problem.level * 15) + (problem.id.charCodeAt(0) % 10)).toFixed(1) + '%';
                
                return (
                  <tr key={problem.id} onClick={() => onProblemSelect(problem)}>
                    <td style={{ textAlign: 'center' }}>
                      <span className={isSolved ? "gf-status-icon" : ""} style={{ color: isSolved ? 'var(--gf-easy)' : 'var(--gf-text-dim)' }}>
                        {isSolved ? Icons.check : Icons.todo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--gf-text)' }}>
                      {problem.title}
                    </td>
                    <td>
                      <span className={diff.class}>{diff.label}</span>
                    </td>
                    <td style={{ color: 'var(--gf-text-dim)' }}>
                      {acceptance}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--gf-text-dim)' }}>
                  No challenges available for this category yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProblemList;