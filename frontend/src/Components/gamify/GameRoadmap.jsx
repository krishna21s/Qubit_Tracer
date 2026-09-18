import React, { useMemo } from 'react';
import './gameRoadmap.css';

/* ── Level config — maps to existing gamify problem levels 1-4 ── */
const LEVEL_CONFIG = [
  {
    level: 1,
    icon: '⚛️',
    title: 'Beginner Circuits',
    subtitle: 'Start your journey',
    difficulty: 'Easy',
    zone: 'beginner',
    zoneLabel: '🌱 Beginner Zone',
    description: 'Basic quantum gates and simple circuits.',
  },
  {
    level: 2,
    icon: '🔗',
    title: 'Entanglement',
    subtitle: 'Connect the qubits',
    difficulty: 'Medium',
    zone: 'intermediate',
    zoneLabel: '⚡ Intermediate Zone',
    description: 'Bell states, multi-qubit entanglement protocols.',
  },
  {
    level: 3,
    icon: '🧠',
    title: 'Quantum Algorithms',
    subtitle: 'Think algorithmically',
    difficulty: 'Hard',
    zone: 'hard',
    zoneLabel: '🔥 Advanced Zone',
    description: "Deutsch-Jozsa, Grover's search and beyond.",
  },
  {
    level: 4,
    icon: '🛡️',
    title: 'Error Correction',
    subtitle: 'Protect the state',
    difficulty: 'Hard',
    zone: 'hard',
    description: 'Quantum error correction and state teleportation.',
  },
];

/* XP reward per level */
const XP_PER_LEVEL = { 1: 50, 2: 120, 3: 200, 4: 300 };

/* Which side the label appears (alternates for the Duolingo zigzag feel) */
const LABEL_SIDES = ['right', 'left', 'right', 'left'];

export default function GameRoadmap({ onLevelSelect, solvedIds = new Set(), problems = [] }) {
  /* Calculate per-level progress */
  const progress = useMemo(() => {
    return LEVEL_CONFIG.reduce((acc, lvl) => {
      const lvlProblems = problems.filter(p => Number(p.level) === lvl.level);
      const solved = lvlProblems.filter(p => solvedIds.has(p.id)).length;
      const total = lvlProblems.length;
      acc[lvl.level] = { solved, total, pct: total > 0 ? (solved / total) * 100 : 0 };
      return acc;
    }, {});
  }, [problems, solvedIds]);

  /* Player XP total */
  const totalXP = LEVEL_CONFIG.reduce((sum, lvl) => {
    const prog = progress[lvl.level];
    if (!prog) return sum;
    return sum + Math.round((prog.pct / 100) * XP_PER_LEVEL[lvl.level]);
  }, 0);

  /* Determine node state for each level */
  const getState = (level) => {
    const prog = progress[level];
    if (prog && prog.pct === 100) return 'done';
    if (prog && prog.pct > 0) return 'active';
    // unlock next after previous fully solved
    const prev = level - 1;
    if (prev < 1) return 'active'; // level 1 always available
    const prevProg = progress[prev];
    if (prevProg && prevProg.pct === 100) return 'unlocked';
    if (prev === 0) return 'active';
    return 'locked';
  };

  /* Find the first non-completed active/unlocked level */
  const currentLevel = LEVEL_CONFIG.find(lvl => {
    const s = getState(lvl.level);
    return s === 'active' || s === 'unlocked';
  })?.level;

  const allComplete = LEVEL_CONFIG.every(lvl => getState(lvl.level) === 'done');

  /* Group levels by zone for zone banners */
  const zoneSeen = new Set();

  return (
    <div className="grm-root">
      {/* ── Stats Bar ── */}
      <div className="grm-stats">
        <div className="grm-player">
          <div className="grm-avatar">🧑‍🚀</div>
          <div className="grm-player-info">
            <div className="grm-player-name">Quantum Learner</div>
            <div className="grm-player-rank">Quantum Explorer</div>
          </div>
        </div>
        <div className="grm-stats-pills">
          <div className="grm-pill xp">
            <span>⚡</span>
            <span>{totalXP} XP</span>
          </div>
          <div className="grm-pill streak">
            <span>🔥</span>
            <span>{LEVEL_CONFIG.filter(l => getState(l.level) === 'done').length} done</span>
          </div>
          <div className="grm-pill gem">
            <span>💎</span>
            <span>{solvedIds.size} solved</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable Map ── */}
      <div className="grm-map">
        <div className="grm-track">
          {LEVEL_CONFIG.map((lvl, idx) => {
            const state = getState(lvl.level);
            const prog = progress[lvl.level] || { solved: 0, total: 0, pct: 0 };
            const isActive = lvl.level === currentLevel;
            const labelSide = LABEL_SIDES[idx];
            const showZone = lvl.zone && !zoneSeen.has(lvl.zone);
            if (lvl.zone) zoneSeen.add(lvl.zone);

            return (
              <React.Fragment key={lvl.level}>
                {/* Zone banner */}
                {showZone && (
                  <div className={`grm-zone ${lvl.zone}`}>
                    <div className="grm-zone-banner">{lvl.zoneLabel || lvl.zone}</div>
                    {prog.total > 0 && (
                      <div className="grm-zone-progress-bar">
                        <div className="grm-zone-progress-fill" style={{ width: `${prog.pct}%` }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Connector from previous node */}
                {idx > 0 && (
                  <div className="grm-connector">
                    <div className={`grm-connector-line ${state === 'done' ? 'done' : state === 'locked' ? 'locked' : 'active'}`} />
                    <div className={`grm-connector-arrow ${state === 'done' ? 'done' : state === 'locked' ? 'locked' : 'active'}`} />
                  </div>
                )}

                {/* Node row */}
                <div className="grm-node-row">
                  {/* Side label */}
                  <div className={`grm-side-label ${labelSide}`}>
                    <div className="grm-side-level">Level {lvl.level}</div>
                    <div className={`grm-side-title ${state === 'locked' ? 'locked' : ''}`}>{lvl.title}</div>
                    <span className={`grm-diff ${lvl.difficulty.toLowerCase()}`}>{lvl.difficulty}</span>
                    {prog.total > 0 && state !== 'locked' && (
                      <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                        {prog.solved}/{prog.total} solved
                      </div>
                    )}
                  </div>

                  {/* Main node button */}
                  <div style={{ position: 'relative' }}>
                    {/* Stars */}
                    {state === 'done' && (
                      <div className="grm-node-stars">
                        <span className="grm-star">⭐</span>
                        <span className="grm-star">⭐</span>
                        <span className="grm-star">⭐</span>
                      </div>
                    )}

                    {/* "You are here" badge */}
                    {isActive && (
                      <div className="grm-here-badge">YOU ARE HERE</div>
                    )}

                    <button
                      className={`grm-node-btn ${state}`}
                      onClick={() => state !== 'locked' && onLevelSelect(lvl.level)}
                      aria-label={`Level ${lvl.level}: ${lvl.title}`}
                    >
                      {/* SVG progress ring */}
                      {prog.total > 0 && state !== 'done' && state !== 'locked' && (
                        <svg className="grm-node-progress" viewBox="0 0 84 84">
                          <circle cx="42" cy="42" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                          <circle
                            cx="42" cy="42" r="38"
                            fill="none"
                            stroke="rgba(255,255,255,0.55)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 38}`}
                            strokeDashoffset={`${2 * Math.PI * 38 * (1 - prog.pct / 100)}`}
                            transform="rotate(-90 42 42)"
                            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                        </svg>
                      )}

                      <span className="grm-node-icon">
                        {state === 'locked' ? '🔒' : state === 'done' ? '✅' : lvl.icon}
                      </span>
                      <span className="grm-node-tag">
                        {state === 'done' ? 'Done' : state === 'locked' ? 'Locked' : `Lv.${lvl.level}`}
                      </span>
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Completion banner */}
          {allComplete && (
            <>
              <div className="grm-connector">
                <div className="grm-connector-line done" />
              </div>
              <div className="grm-complete-banner">
                <div className="grm-trophy-icon">🏆</div>
                <div className="grm-complete-title">All Levels Complete!</div>
                <div className="grm-complete-sub">You've mastered all quantum challenges. Legendary!</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
