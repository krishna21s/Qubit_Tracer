import React from 'react';
import { ACHIEVEMENTS, getPlayerRank } from './gameAchievements';

export default function AchievementsModal({ stats, onClose }) {
  const rank = getPlayerRank(stats.xp || 0);

  return (
    <div className="gf-modal-overlay" onClick={onClose}>
      <div className="gf-achieve-modal" onClick={e => e.stopPropagation()}>
        <div className="gf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                Trophy Room & Badges
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Unlock badges and earn bonus XP as you master quantum circuits.
              </p>
            </div>
          </div>
          <button className="gf-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Player summary in modal */}
        <div className="gf-modal-player-card">
          <div className="gf-modal-avatar">{rank.badge}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', fontSize: '15px', color: '#f8fafc' }}>{rank.name}</span>
              <span style={{ fontSize: '12px', color: '#38d1ff', fontWeight: '700' }}>{stats.xp} XP</span>
            </div>
            <div className="gf-modal-xp-bar">
              <div className="gf-modal-xp-fill" style={{ width: `${rank.progress}%` }} />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Level {rank.level}</span>
              <span>Next: {rank.nextRank} ({rank.progress}%)</span>
            </div>
          </div>
        </div>

        {/* Badges list */}
        <div className="gf-badges-grid">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = ach.check(stats);
            return (
              <div key={ach.id} className={`gf-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="gf-badge-icon-box">
                  <span className="gf-badge-icon">{isUnlocked ? ach.icon : '🔒'}</span>
                </div>
                <div className="gf-badge-info">
                  <div className="gf-badge-name">{ach.title}</div>
                  <div className="gf-badge-desc">{ach.description}</div>
                  <div className="gf-badge-reward">
                    {isUnlocked ? (
                      <span style={{ color: '#22d3a5', fontWeight: '700' }}>✅ Unlocked (+{ach.rewardXP} XP)</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Reward: +{ach.rewardXP} XP</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="gf-game-btn primary" onClick={onClose} style={{ width: '100%' }}>
            Awesome, Keep Exploring!
          </button>
        </div>
      </div>
    </div>
  );
}
