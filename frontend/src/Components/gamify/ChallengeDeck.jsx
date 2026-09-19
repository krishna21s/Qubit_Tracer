import React, { useMemo } from 'react';
import {
  ChevronRight,
  Cpu,
  Layers,
  Code,
  CheckCircle,
  Play,
  Refresh,
  Bolt
} from 'reicon-react';
import GamifyTopCards from './GamifyTopCards';
import sounds from './soundEffects';

export default function ChallengeDeck({
  problems = [],
  solvedIds = new Set(),
  streak = 3,
  score = 120,
  gems = 50,
  onProblemSelect,
  onSeeMore,
  onReward,
  onOpenLeaderboard,
  onOpenAchievements
}) {
  // 3 Beginner (Level 1), 3 Medium (Level 2), 3 Hard (Level 3 or 4)
  const beginnerProblems = useMemo(() => {
    const list = problems.filter(p => Number(p.level) === 1);
    return list.length > 0 ? list.slice(0, 3) : problems.slice(0, 3);
  }, [problems]);

  const mediumProblems = useMemo(() => {
    const list = problems.filter(p => Number(p.level) === 2);
    return list.length > 0 ? list.slice(0, 3) : problems.slice(3, 6);
  }, [problems]);

  const hardProblems = useMemo(() => {
    const list = problems.filter(p => Number(p.level) === 3 || Number(p.level) === 4);
    return list.length > 0 ? list.slice(0, 3) : problems.slice(6, 9);
  }, [problems]);

  const tiers = [
    {
      key: 'beginner',
      title: 'Beginner Challenges',
      level: 1,
      label: 'Beginner',
      badgeClass: 'tier-1',
      Icon: Cpu,
      mode: 'Gate Studio',
      tag: 'Single-Qubit Foundations',
      items: beginnerProblems
    },
    {
      key: 'medium',
      title: 'Medium Challenges',
      level: 2,
      label: 'Medium',
      badgeClass: 'tier-2',
      Icon: Layers,
      mode: 'Wire Studio',
      tag: 'Multi-Qubit Entanglement & Circuits',
      items: mediumProblems
    },
    {
      key: 'hard',
      title: 'Hard Challenges',
      level: 3,
      label: 'Hard',
      badgeClass: 'tier-3',
      Icon: Code,
      mode: 'Code Editor',
      tag: 'Quantum Algorithms & Oracles',
      items: hardProblems
    }
  ];

  const renderCard = (problem, tier) => {
    const isSolved = solvedIds.has(problem.id);
    const IconComponent = tier.Icon;
    const points = problem.points || (Number(problem.level || tier.level) * 50 || 50);

    return (
      <div
        key={problem.id}
        className={`gf-quest-card ${isSolved ? 'is-solved' : ''}`}
        onClick={() => {
          sounds.playClick();
          if (onProblemSelect) onProblemSelect(problem);
        }}
        role="button"
        tabIndex={0}
      >
        <div className="gf-quest-card-header">
          <span className={`gf-quest-tier-pill ${tier.badgeClass}`}>
            <IconComponent size={13} />
            <span>{tier.label}</span>
          </span>

          <span className={`gf-quest-status-badge ${isSolved ? 'solved' : 'open'}`}>
            {isSolved ? (
              <>
                <CheckCircle size={12} />
                <span>Solved</span>
              </>
            ) : (
              <span>Open</span>
            )}
          </span>
        </div>

        <h3 className="gf-quest-card-title">{problem.title}</h3>

        <div className="gf-quest-card-qubits">
          <span className="gf-quest-mode-badge">{tier.mode}</span>
          <span className="gf-quest-bullet">•</span>
          <span>{problem.num_qubits || 1} Qubit Line{problem.num_qubits > 1 ? 's' : ''}</span>
        </div>

        <p className="gf-quest-card-desc">{problem.description}</p>

        <div className="gf-quest-card-footer">
          <div className="gf-quest-bounty">
            <span className="bounty-label">BOUNTY</span>
            <span className="bounty-xp">
              <Bolt size={12} />
              <span>+{points} XP</span>
            </span>
          </div>

          <button
            className={`gf-quest-play-btn ${isSolved ? 'replay' : 'play'}`}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              if (onProblemSelect) onProblemSelect(problem);
            }}
            type="button"
          >
            {isSolved ? (
              <>
                <Refresh size={13} />
                <span>Review</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Solve</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="gf-deck-viewport">
      <div className="gf-deck-container">
        {/* ── Top 3 Cards Row (Streak, XP, Quiz of the Day) ── */}
        <GamifyTopCards
          streak={streak}
          score={score}
          gems={gems}
          onReward={onReward}
          onOpenLeaderboard={onOpenLeaderboard}
          onOpenAchievements={onOpenAchievements}
        />

        {/* ── Featured Challenges Portion (Seamless unified flow, no awkward gap) ── */}
        <div className="gf-challenges-unified-section">
          {/* Main Header with Title and global "See more" link */}
          <div className="gf-deck-header">
            <div className="gf-deck-header-left">
              <h2 className="gf-deck-title">Featured Challenges</h2>
              <p className="gf-deck-subtitle">
                Solve circuit challenges, test quantum states, and earn XP across all skill tiers.
              </p>
            </div>

            <button
              className="gf-see-more-link"
              onClick={() => {
                sounds.playClick();
                if (onSeeMore) onSeeMore(null);
              }}
              type="button"
            >
              <span>See more ({problems.length} challenges)</span>
              <ChevronRight size={15} />
            </button>
          </div>

          {/* 3 Tiers: Beginner, Medium, Hard with "See More" button on each */}
          {tiers.map((tier, idx) => {
            const SectionIcon = tier.Icon;
            return (
              <div key={tier.key} className="gf-tier-section">
                {/* Clean divider between tiers */}
                {idx > 0 && <div className="gf-tier-divider" />}

                {/* Tier Subheader */}
                <div className="gf-tier-header">
                  <div className="gf-tier-header-left">
                    <span className={`gf-quest-tier-pill ${tier.badgeClass}`}>
                      <SectionIcon size={13} />
                      <span>{tier.label}</span>
                    </span>
                    <h3 className="gf-tier-title">{tier.title}</h3>
                    <span className="gf-tier-tag-bullet">•</span>
                    <span className="gf-tier-tag-desc">{tier.tag}</span>
                  </div>

                  {/* "See More" button for this specific level */}
                  <button
                    className="gf-tier-see-more-btn"
                    onClick={() => {
                      sounds.playClick();
                      if (onSeeMore) onSeeMore(tier.level);
                    }}
                    type="button"
                    title={`View all ${tier.label} challenges`}
                  >
                    <span>See More</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* 3 Cards Grid */}
                <div className="gf-deck-grid three-cards">
                  {tier.items.map((prob) => renderCard(prob, tier))}
                </div>
              </div>
            );
          })}

          {/* Bottom Callout Banner inside the portion */}
          <div className="gf-unified-deck-footer">
            <div className="gf-dfc-text">
              <h4 className="gf-dfc-title">Explore All {problems.length} Challenges</h4>
              <p className="gf-dfc-desc">
                Browse the complete problem catalog with filters for difficulty, single and multi-qubit lines, and algorithmic oracles.
              </p>
            </div>
            <button
              className="gf-see-more-btn-primary"
              onClick={() => {
                sounds.playClick();
                if (onSeeMore) onSeeMore(null);
              }}
              type="button"
            >
              <span>See more challenges</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
