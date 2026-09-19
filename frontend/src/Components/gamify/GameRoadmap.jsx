import React, { useMemo } from 'react';
import {
  Cpu,
  Layers,
  Code,
  Shield,
  CheckCircle,
  Lock,
  Play,
  ChevronRight,
  CupTrophy,
  Sparkles,
  Bolt
} from 'reicon-react';
import sounds from './soundEffects';
import StreakWidget from './StreakWidget';
import './gameRoadmap.css';

/* ── Level config — maps to gamify problem levels 1-4 ── */
const LEVEL_CONFIG = [
  {
    level: 1,
    iconComponent: Cpu,
    title: 'Single-Qubit Foundations',
    subtitle: 'Superposition & Phase Space',
    difficulty: 'Easy',
    zone: 'beginner',
    zoneLabel: 'Phase I: Single-Qubit Foundations',
    description: 'Learn foundational unitary gates (H, X, Y, Z, S, T), state vector manipulation, and Bloch sphere rotations.',
    topics: ['Hadamard Gate', 'Pauli Matrices', 'Superposition', 'Bloch Sphere'],
  },
  {
    level: 2,
    iconComponent: Layers,
    title: 'Entanglement & Bell States',
    subtitle: 'Multi-Qubit Entanglement Protocols',
    difficulty: 'Medium',
    zone: 'intermediate',
    zoneLabel: 'Phase II: Multi-Qubit Entanglement',
    description: 'Construct Bell states, explore Einstein-Podolsky-Rosen paradoxes, quantum teleportation, and swap networks.',
    topics: ['Bell States', 'CNOT Operations', 'Teleportation', 'Entanglement'],
  },
  {
    level: 3,
    iconComponent: Code,
    title: 'Quantum Algorithms & Oracles',
    subtitle: 'Algorithmic Speedups',
    difficulty: 'Hard',
    zone: 'advanced',
    zoneLabel: 'Phase III: Quantum Algorithms',
    description: "Implement Deutsch-Jozsa, Bernstein-Vazirani, and Grover's search algorithm with multi-framework code verification.",
    topics: ['Deutsch-Jozsa', "Grover's Search", 'Phase Kickback', 'Quantum Oracles'],
  },
  {
    level: 4,
    iconComponent: Shield,
    title: 'Error Correction & Fault Tolerance',
    subtitle: 'Quantum State Protection',
    difficulty: 'Expert',
    zone: 'expert',
    zoneLabel: 'Phase IV: Fault-Tolerant Computing',
    description: 'Tackle bit-flip and phase-flip error correction codes, syndrome measurement, and state preservation.',
    topics: ['Bit-Flip Codes', 'Syndrome Detection', 'Stabilizers', 'Fault Tolerance'],
  },
];

/* XP reward per level */
const XP_PER_LEVEL = { 1: 50, 2: 120, 3: 200, 4: 300 };

export default function GameRoadmap({
  onLevelSelect,
  solvedIds = new Set(),
  problems = [],
  streak = 3
}) {
  /* Calculate per-level progress */
  const progress = useMemo(() => {
    return LEVEL_CONFIG.reduce((acc, lvl) => {
      const lvlProblems = problems.filter(p => Number(p.level) === lvl.level);
      const solved = lvlProblems.filter(p => solvedIds.has(p.id)).length;
      const total = lvlProblems.length;
      acc[lvl.level] = { solved, total, pct: total > 0 ? Math.round((solved / total) * 100) : 0 };
      return acc;
    }, {});
  }, [problems, solvedIds]);

  /* Total solved count across all levels */
  const totalSolved = useMemo(() => {
    return problems.filter(p => solvedIds.has(p.id)).length;
  }, [problems, solvedIds]);

  const totalProblemsCount = problems.length || 1;
  const overallPct = Math.round((totalSolved / totalProblemsCount) * 100);

  /* Determine node state for each level */
  const getState = (level) => {
    const prog = progress[level];
    if (prog && prog.pct === 100) return 'done';
    if (prog && prog.pct > 0) return 'active';
    const prev = level - 1;
    if (prev < 1) return 'active';
    const prevProg = progress[prev];
    if (prevProg && prevProg.pct === 100) return 'unlocked';
    return 'locked';
  };

  /* Find current active level */
  const currentLevel = LEVEL_CONFIG.find(lvl => {
    const s = getState(lvl.level);
    return s === 'active' || s === 'unlocked';
  })?.level || 1;

  const allComplete = LEVEL_CONFIG.every(lvl => getState(lvl.level) === 'done');

  return (
    <div className="grm-root">
      {/* ── Learning Path Header Banner ── */}
      <div className="grm-path-header">
        <div className="grm-path-header-content">
          <div className="grm-path-badge">
            <Sparkles size={13} />
            <span>QUANTUM ODYSSEY CURRICULUM</span>
          </div>
          <h1 className="grm-path-title">Interactive Learning Roadmap</h1>
          <p className="grm-path-desc">
            Progress step-by-step through single-qubit identities, multipartite entanglement, algorithmic oracles, and quantum error mitigation.
          </p>
        </div>

        {/* Header Right: Streak Card & Progress Card (Matching Dashboard UI) */}
        <div className="grm-header-cards-row">
          {/* Weekly Streak Card matching Image 2 */}
          <div className="grm-streak-header-card">
            <StreakWidget streak={streak} />
          </div>

          {/* Global Journey Progress Card */}
          <div className="grm-path-progress-card">
            <div className="grm-ppc-header">
              <span className="grm-ppc-label">Mastery Progress</span>
              <span className="grm-ppc-val">{overallPct}%</span>
            </div>
            <div className="grm-ppc-bar">
              <div className="grm-ppc-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <div className="grm-ppc-sub">
              <span>{totalSolved} of {problems.length} Cleared</span>
              <span className="grm-ppc-xp">
                <Bolt size={12} />
                <span>Available</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Journey Track & Stations ── */}
      <div className="grm-map">
        <div className="grm-stations-list">
          {LEVEL_CONFIG.map((lvl, idx) => {
            const state = getState(lvl.level);
            const prog = progress[lvl.level] || { solved: 0, total: 0, pct: 0 };
            const isCurrent = lvl.level === currentLevel;
            const Icon = lvl.iconComponent;
            const isLocked = state === 'locked';

            return (
              <div key={lvl.level} className="grm-station-wrapper">
                {/* Circuit Bus Connector between stations */}
                {idx > 0 && (
                  <div className={`grm-bus-connector ${state === 'done' ? 'done' : state === 'locked' ? 'locked' : 'active'}`}>
                    <div className="grm-bus-line">
                      <div className="grm-bus-pulse" />
                    </div>
                  </div>
                )}

                {/* Station Card (Dashboard Style) */}
                <div
                  className={`grm-station-card ${state} ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    if (!isLocked) {
                      sounds.playClick();
                      onLevelSelect(lvl.level);
                    }
                  }}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                  aria-disabled={isLocked}
                >
                  {/* Left: Station Node Icon */}
                  <div className="grm-station-node">
                    <div className={`grm-node-glyph ${state}`}>
                      <Icon size={24} />
                      {state === 'done' && (
                        <div className="grm-node-check-badge">
                          <CheckCircle size={13} />
                        </div>
                      )}
                      {isLocked && (
                        <div className="grm-node-lock-badge">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>
                    <div className="grm-node-step-tag">LEVEL {lvl.level}</div>
                  </div>

                  {/* Middle: Station Information */}
                  <div className="grm-station-body">
                    <div className="grm-station-top">
                      <span className="grm-zone-tag">{lvl.zoneLabel}</span>
                      <span className={`grm-difficulty-pill ${lvl.difficulty.toLowerCase()}`}>
                        {lvl.difficulty}
                      </span>
                    </div>

                    <h2 className="grm-station-title">{lvl.title}</h2>
                    <p className="grm-station-desc">{lvl.description}</p>

                    {/* Topics Pill Cloud */}
                    <div className="grm-topics-cloud">
                      {lvl.topics.map(topic => (
                        <span key={topic} className="grm-topic-pill">{topic}</span>
                      ))}
                    </div>

                    {/* Progress Bar inside Station */}
                    <div className="grm-station-progress">
                      <div className="grm-sp-header">
                        <span className="grm-sp-label">
                          {state === 'done'
                            ? 'Station Completed'
                            : isLocked
                            ? 'Locked Station'
                            : `${prog.solved} of ${prog.total} Completed`}
                        </span>
                        <span className="grm-sp-pct">{prog.pct}%</span>
                      </div>
                      <div className="grm-sp-track">
                        <div
                          className={`grm-sp-fill ${state}`}
                          style={{ width: `${isLocked ? 0 : prog.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Station Action CTA */}
                  <div className="grm-station-action">
                    <div className="grm-bounty-chip">
                      <Bolt size={13} />
                      <span>+{XP_PER_LEVEL[lvl.level]} XP</span>
                    </div>

                    <button
                      className={`grm-launch-btn ${state}`}
                      disabled={isLocked}
                      type="button"
                    >
                      {state === 'done' ? (
                        <>
                          <span>Review</span>
                          <ChevronRight size={14} />
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock size={13} />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <span>Enter Hub</span>
                          <Play size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* All Levels Mastered Banner */}
          {allComplete && (
            <div className="grm-mastery-card">
              <div className="grm-mastery-icon">
                <CupTrophy size={36} />
              </div>
              <div className="grm-mastery-info">
                <h3 className="grm-mastery-title">Quantum Grandmaster Status Achieved</h3>
                <p className="grm-mastery-desc">
                  You have successfully solved every problem across all 4 learning phases! Maintain your daily streak and explore custom circuits.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
