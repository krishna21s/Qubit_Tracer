import React from 'react';

const LEVEL_CONFIG = [
  { 
    level: 1, 
    title: 'Beginner Circuits', 
    difficulty: 'Easy',
    description: 'Basic quantum gates and simple circuits. Learn how to manipulate single qubits.',
  },
  { 
    level: 2, 
    title: 'Entanglement Protocols', 
    difficulty: 'Medium',
    description: 'Multi-qubit entanglement, Bell states, and quantum communication protocols.',
  },
  { 
    level: 3, 
    title: 'Quantum Algorithms', 
    difficulty: 'Hard',
    description: 'Implement foundational quantum algorithms like Deutsch-Jozsa and Grover\'s search.',
  },
  { 
    level: 4, 
    title: 'Error Correction', 
    difficulty: 'Hard',
    description: 'Advanced challenges on quantum error correction and state teleportation.',
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

  return (
    <div className="gf-container" style={{ padding: '24px' }}>
      <h1 className="gf-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Study Plan</h1>
      <p style={{ color: 'var(--gf-text-dim)', marginBottom: '32px', fontSize: '14px' }}>
        Master quantum computing through structured challenges.
      </p>

      <div className="gf-dashboard-grid">
        {LEVEL_CONFIG.map((lvl) => {
          const progress = getLevelProgress(lvl.level);
          
          return (
            <div
              key={lvl.level}
              className="gf-category-card"
              onClick={() => onLevelSelect(lvl.level)}
            >
              <div className="gf-cat-header">
                <span className="gf-cat-title">{lvl.title}</span>
                <span style={{ 
                  fontSize: '12px', 
                  color: lvl.difficulty === 'Easy' ? 'var(--gf-easy)' : lvl.difficulty === 'Medium' ? 'var(--gf-medium)' : 'var(--gf-hard)' 
                }}>
                  {lvl.difficulty}
                </span>
              </div>
              
              <p className="gf-cat-desc">
                {lvl.description}
              </p>

              {progress.total > 0 && (
                <div className="gf-cat-progress">
                  <div className="gf-progress-bar">
                    <div 
                      className="gf-progress-fill"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <span>{progress.solved} / {progress.total} Solved</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LevelSelector;