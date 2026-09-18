import React from 'react';

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Alice_Qiskit', title: 'Quantum Grandmaster', xp: 4850, solved: 42, avatar: '🧙‍♂️', badge: '🥇' },
  { rank: 2, name: 'Bob_Entangled', title: 'Entanglement Master', xp: 3920, solved: 35, avatar: '🌌', badge: '🥈' },
  { rank: 3, name: 'Charlie_Cirq', title: 'Quantum Pioneer', xp: 2840, solved: 29, avatar: '🚀', badge: '🥉' },
  { rank: 4, name: 'David_PennyLane', title: 'Algorithm Wizard', xp: 1980, solved: 22, avatar: '⚡', badge: '4' },
  { rank: 5, name: 'Eva_BellState', title: 'Circuit Adept', xp: 1420, solved: 18, avatar: '🔬', badge: '5' },
  { rank: 6, name: 'Faythe_Teleport', title: 'Qubit Apprentice', xp: 880, solved: 12, avatar: '🌱', badge: '6' },
];

export default function LeaderboardModal({ userXP = 0, userSolved = 0, onClose }) {
  // Insert current user in ranking
  const allUsers = [...LEADERBOARD_USERS, {
    rank: 7,
    name: 'You (Quantum Explorer)',
    title: 'Active Player',
    xp: userXP,
    solved: userSolved,
    avatar: '🧑‍🚀',
    isYou: true,
    badge: '★'
  }].sort((a, b) => b.xp - a.xp).map((u, i) => ({
    ...u,
    rank: i + 1,
    badge: i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
  }));

  return (
    <div className="gf-modal-overlay" onClick={onClose}>
      <div className="gf-leaderboard-modal" onClick={e => e.stopPropagation()}>
        <div className="gf-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                Quantum League Leaderboard
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Weekly Global Rankings based on Quantum XP and Challenge completions.
              </p>
            </div>
          </div>
          <button className="gf-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="gf-leaderboard-list">
          {allUsers.map(user => (
            <div
              key={user.rank + user.name}
              className={`gf-leaderboard-row ${user.isYou ? 'is-you' : ''}`}
            >
              <div className="gf-lb-rank">
                <span>{user.badge}</span>
              </div>
              <div className="gf-lb-avatar">{user.avatar}</div>
              <div className="gf-lb-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', color: user.isYou ? '#38d1ff' : '#f8fafc' }}>
                    {user.name}
                  </span>
                  {user.isYou && (
                    <span style={{
                      fontSize: '10px',
                      background: 'rgba(56, 209, 255, 0.2)',
                      color: '#38d1ff',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {user.title} • {user.solved} Solved
                </div>
              </div>
              <div className="gf-lb-xp">
                <span style={{ fontWeight: '800', color: '#f59e0b' }}>⚡ {user.xp}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>XP</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button className="gf-game-btn secondary" onClick={onClose} style={{ width: '100%' }}>
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
