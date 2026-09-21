import React from 'react';
import { createPortal } from 'react-dom';
import {
  CupTrophy,
  Award,
  Crown,
  Xmark,
  CheckCircle,
  Lock,
  Bolt,
  Sparkles,
  Cpu,
  Layers,
  Code,
  Shield,
  Flame,
  Diamonds
} from 'reicon-react';
import { ACHIEVEMENTS, getPlayerRank } from './gameAchievements';
import { useTemplate } from '../../context/TemplateContext';

export default function AchievementsModal({ stats, onClose }) {
  const { templateId } = useTemplate() || {};
  const rank = getPlayerRank(stats.xp || 0);

  const getAchievementIcon = (id) => {
    switch (id) {
      case 'first_step':
        return <Sparkles size={18} />;
      case 'entangled':
        return <Layers size={18} />;
      case 'circuit_architect':
        return <Cpu size={18} />;
      case 'code_hacker':
        return <Code size={18} />;
      case 'streak_fire':
        return <Flame size={18} />;
      case 'algorithm_ace':
        return <Bolt size={18} />;
      case 'ten_club':
        return <Diamonds size={18} />;
      case 'grandmaster':
        return <Crown size={18} />;
      default:
        return <Award size={18} />;
    }
  };

  const modalContent = (
    <div
      className="gf-modal-overlay"
      data-template={templateId || 'dark'}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="gf-achieve-modal"
        data-template={templateId || 'dark'}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gf-modal-header">
          <div className="gf-modal-header-info">
            <div className="gf-modal-icon-crest">
              <CupTrophy size={22} />
            </div>
            <div>
              <h3 className="gf-modal-header-title">
                Trophy Cabinet & Badges
              </h3>
              <p className="gf-modal-header-desc">
                Unlock badges and bonus quantum experience as you master circuits.
              </p>
            </div>
          </div>
          <button className="gf-modal-close-btn" onClick={onClose} title="Close" type="button">
            <Xmark size={16} />
          </button>
        </div>

        {/* Player summary in modal */}
        <div className="gf-modal-player-card">
          <div className="gf-modal-avatar-ring">
            <Crown size={20} />
            <span className="gf-modal-lvl-badge">Lv.{rank.level}</span>
          </div>
          <div className="gf-modal-player-stats">
            <div className="gf-mps-row">
              <span className="gf-mps-name">{rank.name}</span>
              <span className="gf-mps-xp">
                <Bolt size={13} />
                <span>{stats.xp.toLocaleString()} XP</span>
              </span>
            </div>
            <div className="gf-modal-xp-bar">
              <div
                className="gf-modal-xp-fill"
                style={{ width: `${Math.min(100, Math.max(0, rank.progress))}%` }}
              />
            </div>
            <div className="gf-mps-sub">
              <span>Tier {rank.level} Quantum Engineer</span>
              <span>Next: {rank.nextRank} ({rank.progress}%)</span>
            </div>
          </div>
        </div>

        {/* Badges list */}
        <div className="gf-badges-grid">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = ach.check(stats);
            const AchIcon = getAchievementIcon(ach.id);

            return (
              <div key={ach.id} className={`gf-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className={`gf-badge-icon-box ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  {isUnlocked ? AchIcon : <Lock size={16} />}
                </div>
                <div className="gf-badge-info">
                  <div className="gf-badge-name-row">
                    <span className="gf-badge-name">{ach.title}</span>
                    {isUnlocked && (
                      <CheckCircle size={13} className="gf-badge-check" />
                    )}
                  </div>
                  <div className="gf-badge-desc">{ach.description}</div>
                  <div className="gf-badge-reward">
                    {isUnlocked ? (
                      <span className="gf-badge-reward-unlocked">
                        <CheckCircle size={12} />
                        <span>Unlocked (+{ach.rewardXP} XP)</span>
                      </span>
                    ) : (
                      <span className="gf-badge-reward-locked">
                        <Bolt size={12} />
                        <span>Reward: +{ach.rewardXP} XP</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="gf-modal-footer">
          <button className="gf-game-btn primary" onClick={onClose} type="button">
            Awesome, Keep Exploring!
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
