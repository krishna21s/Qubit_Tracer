import React from 'react';

export default function VictoryModal({ problem, points, onClose, onNext }) {
  if (!problem) return null;

  return (
    <div className="gf-modal-overlay">
      <div className="gf-victory-card">
        {/* Confetti particles */}
        <div className="gf-confetti-wrap">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={`gf-confetti-particle p-${i % 6}`} />
          ))}
        </div>

        <div className="gf-victory-badge">🏆</div>
        <h2 className="gf-victory-title">QUEST COMPLETED!</h2>
        <p className="gf-victory-subtitle">Quantum Coherence Achieved</p>

        {/* 3 Stars */}
        <div className="gf-victory-stars">
          <span className="gf-star star-1">⭐</span>
          <span className="gf-star star-2">⭐</span>
          <span className="gf-star star-3">⭐</span>
        </div>

        <div className="gf-victory-rewards">
          <div className="gf-reward-box">
            <span className="gf-reward-icon">⚡</span>
            <span className="gf-reward-val">+{points || 150} XP</span>
          </div>
          <div className="gf-reward-box">
            <span className="gf-reward-icon">💎</span>
            <span className="gf-reward-val">+25 Gems</span>
          </div>
          <div className="gf-reward-box">
            <span className="gf-reward-icon">🔥</span>
            <span className="gf-reward-val">+1 Streak</span>
          </div>
        </div>

        <div className="gf-victory-problem-box">
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Solved Challenge
          </div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
            {problem.title}
          </div>
        </div>

        <div className="gf-victory-actions">
          <button className="gf-game-btn secondary" onClick={onClose}>
            Back to Challenges
          </button>
          {onNext && (
            <button className="gf-game-btn primary" onClick={onNext}>
              Next Quest ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
