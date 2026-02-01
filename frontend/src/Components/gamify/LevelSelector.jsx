import React from 'react';

// Professional SVG Icons
const LevelIcons = {
  beginner: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  ),
  intermediate: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  advanced: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  expert: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
  points: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/>
      <path d="M12 5l7 7-7 7"/>
    </svg>
  ),
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
    </svg>
  ),
  trophy: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  )
};

const LEVEL_CONFIG = [
  { 
    level: 1, 
    title: 'Level 1', 
    difficulty: 'Beginner',
    iconKey: 'beginner',
    description: 'Basic quantum gates and simple circuits',
    points: 10,
    cssClass: 'beginner'
  },
  { 
    level: 2, 
    title: 'Level 2', 
    difficulty: 'Intermediate',
    iconKey: 'intermediate',
    description: 'Multi-qubit entanglement and quantum states',
    points: 20,
    cssClass: 'intermediate'
  },
  { 
    level: 3, 
    title: 'Level 3', 
    difficulty: 'Advanced',
    iconKey: 'advanced',
    description: 'Circuit optimization and error correction',
    points: 30,
    cssClass: 'advanced'
  },
  { 
    level: 4, 
    title: 'Level 4', 
    difficulty: 'Expert',
    iconKey: 'expert',
    description: 'Quantum algorithms and complex protocols',
    points: 40,
    cssClass: 'expert'
  }
];

function LevelSelector({ onLevelSelect, solvedIds = new Set(), problems = [] }) {
  // Calculate progress per level
  const getLevelProgress = (level) => {
    const levelProblems = problems.filter(p => Number(p.level) === level);
    const solved = levelProblems.filter(p => solvedIds.has(p.id)).length;
    const total = levelProblems.length;
    return { solved, total, percentage: total > 0 ? (solved / total) * 100 : 0 };
  };

  // Determine recommended level (first incomplete level)
  const getRecommendedLevel = () => {
    for (const lvl of LEVEL_CONFIG) {
      const progress = getLevelProgress(lvl.level);
      if (progress.percentage < 100) return lvl.level;
    }
    return null;
  };

  const recommendedLevel = getRecommendedLevel();

  return (
    <div className="gf-levels-container">
      <div className="gf-levels-wrapper">
        {/* Header */}
        <div className="gf-levels-header">
          <h2 className="gf-levels-title">
            Choose Your Challenge Level
          </h2>
          <p className="gf-levels-subtitle">
            Master quantum computing through progressive difficulty
          </p>
        </div>

        {/* Level Grid */}
        <div className="gf-levels-grid">
          {LEVEL_CONFIG.map((lvl) => {
            const progress = getLevelProgress(lvl.level);
            const isRecommended = lvl.level === recommendedLevel;
            const isCompleted = progress.percentage === 100;
            
            return (
              <div
                key={lvl.level}
                className={`
                  gf-level-card 
                  gf-level-card--${lvl.cssClass}
                  ${isRecommended ? 'gf-level-card--recommended' : ''}
                  ${isCompleted ? 'gf-level-card--completed' : ''}
                `}
                onClick={() => onLevelSelect(lvl.level)}
              >
                {/* Card Header */}
                <div className="gf-card-header">
                  <div className="gf-card-info">
                    <div className="gf-level-icon">
                      {isCompleted ? LevelIcons.check : LevelIcons[lvl.iconKey]}
                    </div>
                    <div className="gf-level-meta">
                      <div className="gf-level-number">{lvl.title}</div>
                      <div className="gf-level-difficulty">{lvl.difficulty}</div>
                    </div>
                  </div>
                  <div className="gf-points-badge">
                    {LevelIcons.points}
                    <span>+{lvl.points} pts</span>
                  </div>
                </div>

                {/* Description */}
                <p className="gf-card-description">
                  {lvl.description}
                </p>

                {/* Footer */}
                <div className="gf-card-footer">
                  <button 
                    className="gf-start-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLevelSelect(lvl.level);
                    }}
                  >
                    <span>{isCompleted ? 'Review' : isRecommended ? 'Continue' : 'Start'}</span>
                    {LevelIcons.arrow}
                  </button>
                  <span className="gf-card-hint">
                    {isRecommended && (
                      <>
                        {LevelIcons.sparkle}
                        <span>Recommended</span>
                      </>
                    )}
                    {!isRecommended && 'Click to explore'}
                  </span>
                </div>

                {/* Progress Bar */}
                {progress.total > 0 && (
                  <div className="gf-level-progress">
                    <div className="gf-progress-bar">
                      <div 
                        className="gf-progress-fill"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                    <span className="gf-progress-text">
                      {progress.solved}/{progress.total} solved
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="gf-footer-cta">
          <div className="gf-footer-badge">
            {LevelIcons.trophy}
            <span>Complete challenges to unlock quantum mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelSelector;