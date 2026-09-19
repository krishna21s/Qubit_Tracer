import React from 'react';
import {
  CupTrophy,
  Star,
  Bolt,
  Diamonds,
  Flame,
  ChevronRight,
  Xmark,
  Sparkles
} from 'reicon-react';

export default function VictoryModal({ problem, points, onClose, onNext }) {
  if (!problem) return null;

  return (
    <div className="gf-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gf-victory-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="gf-modal-close-corner" onClick={onClose} title="Close celebration" type="button">
          <Xmark size={16} />
        </button>

        {/* Confetti particles */}
        <div className="gf-confetti-wrap" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={`gf-confetti-particle p-${i % 6}`} />
          ))}
        </div>

        {/* Holographic Victory Emblem */}
        <div className="gf-victory-badge-wrap">
          <div className="gf-victory-badge-glow" />
          <div className="gf-victory-badge">
            <CupTrophy size={42} />
          </div>
        </div>

        <div className="gf-victory-banner-tag">
          <Sparkles size={13} />
          <span>QUANTUM COHERENCE ACHIEVED</span>
        </div>

        <h2 className="gf-victory-title">QUEST COMPLETED!</h2>
        <p className="gf-victory-subtitle">Optimal state vector verified with zero fidelity loss</p>

        {/* 3 Glowing Stars */}
        <div className="gf-victory-stars">
          <span className="gf-star star-1">
            <Star size={24} />
          </span>
          <span className="gf-star star-2">
            <Star size={30} />
          </span>
          <span className="gf-star star-3">
            <Star size={24} />
          </span>
        </div>

        {/* Rewards Breakdown */}
        <div className="gf-victory-rewards">
          <div className="gf-reward-box">
            <span className="gf-reward-icon xp">
              <Bolt size={18} />
            </span>
            <div className="gf-reward-details">
              <span className="gf-reward-val">+{points || 150} XP</span>
              <span className="gf-reward-lbl">Mastery Experience</span>
            </div>
          </div>

          <div className="gf-reward-box">
            <span className="gf-reward-icon gems">
              <Diamonds size={18} />
            </span>
            <div className="gf-reward-details">
              <span className="gf-reward-val">+25 Gems</span>
              <span className="gf-reward-lbl">Quantum Crystals</span>
            </div>
          </div>

          <div className="gf-reward-box">
            <span className="gf-reward-icon streak">
              <Flame size={18} />
            </span>
            <div className="gf-reward-details">
              <span className="gf-reward-val">+1 Streak</span>
              <span className="gf-reward-lbl">Active Momentum</span>
            </div>
          </div>
        </div>

        {/* Solved Problem Summary */}
        <div className="gf-victory-problem-box">
          <div className="gf-vpb-label">Mastered Challenge</div>
          <div className="gf-vpb-title">{problem.title}</div>
        </div>

        {/* Actions */}
        <div className="gf-victory-actions">
          <button className="gf-game-btn secondary" onClick={onClose} type="button">
            Back to Challenges
          </button>
          {onNext && (
            <button className="gf-game-btn primary" onClick={onNext} type="button">
              <span>Next Quest</span>
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
