import React from 'react';

// Professional SVG Icons
const Icons = {
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  arrow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5l7 7-7 7"/>
    </svg>
  ),
  empty: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  )
};

const LEVEL_COLORS = {
  1: 'beginner',
  2: 'intermediate',
  3: 'advanced',
  4: 'expert'
};

function ProblemList({ problems, level, onProblemSelect, solvedIds = new Set() }) {
  const levelClass = LEVEL_COLORS[level] || 'intermediate';

  return (
    <div className="gf-problems-container">
      <div className="gf-problems-wrapper">
        {/* Header */}
        <div className="gf-problems-header">
          <h2 className="gf-problems-title">
            Level {level} Challenges
          </h2>
          <p className="gf-problems-subtitle">
            Select a problem to begin solving
          </p>
        </div>

        {/* Problems Grid */}
        {problems.length > 0 ? (
          <div className="gf-problems-grid">
            {problems.map((problem, index) => {
              const isSolved = solvedIds.has(problem.id);
              
              return (
                <div
                  key={problem.id}
                  className={`
                    gf-problem-card 
                    gf-level-card--${levelClass}
                    ${isSolved ? 'gf-problem-card--solved' : ''}
                  `}
                  onClick={() => onProblemSelect(problem)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="gf-problem-info">
                    <div className={`gf-problem-number ${isSolved ? 'gf-problem-number--solved' : ''}`}>
                      {isSolved ? Icons.check : String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="gf-problem-title">
                      {problem.title}
                    </div>
                  </div>
                  
                  {isSolved ? (
                    <div className="gf-solved-badge">
                      {Icons.check}
                      <span>Completed</span>
                    </div>
                  ) : (
                    <div className="gf-problem-arrow">{Icons.arrow}</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="gf-empty-state">
            <div className="gf-empty-icon">{Icons.empty}</div>
            <div className="gf-empty-text">
              No challenges available for this level yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemList;