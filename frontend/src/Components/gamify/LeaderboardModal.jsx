import React from 'react';
import {
  CupTrophy,
  Crown,
  Award,
  Xmark,
  Bolt,
  CheckCircle,
  ChartBarTrendUp,
  Sparkles
} from 'reicon-react';

const LEADERBOARD_USERS = [
  { rank: 1, name: 'Alice_Qiskit', title: 'Quantum Grandmaster', xp: 4850, solved: 42, tier: 'Grandmaster' },
  { rank: 2, name: 'Bob_Entangled', title: 'Entanglement Master', xp: 3920, solved: 35, tier: 'Master' },
  { rank: 3, name: 'Charlie_Cirq', title: 'Quantum Pioneer', xp: 2840, solved: 29, tier: 'Pioneer' },
  { rank: 4, name: 'David_PennyLane', title: 'Algorithm Wizard', xp: 1980, solved: 22, tier: 'Wizard' },
  { rank: 5, name: 'Eva_BellState', title: 'Circuit Adept', xp: 1420, solved: 18, tier: 'Adept' },
  { rank: 6, name: 'Faythe_Teleport', title: 'Qubit Apprentice', xp: 880, solved: 12, tier: 'Apprentice' },
];

export default function LeaderboardModal({ userXP = 0, userSolved = 0, onClose }) {
  // Insert current user in ranking
  const allUsers = [...LEADERBOARD_USERS, {
    rank: 7,
    name: 'You (Quantum Explorer)',
    title: 'Active Researcher',
    xp: userXP,
    solved: userSolved,
    isYou: true,
    tier: 'Active'
  }].sort((a, b) => b.xp - a.xp).map((u, i) => ({
    ...u,
    rank: i + 1,
  }));

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="gf-podium-rank rank-1" title="1st Place (Gold)">
          <Crown size={15} />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="gf-podium-rank rank-2" title="2nd Place (Silver)">
          <Award size={14} />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="gf-podium-rank rank-3" title="3rd Place (Bronze)">
          <CupTrophy size={14} />
        </span>
      );
    }
    return <span className="gf-podium-rank rank-other">#{rank}</span>;
  };

  return (
    <div className="gf-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="gf-leaderboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gf-modal-header">
          <div className="gf-modal-header-info">
            <div className="gf-modal-icon-crest lb">
              <ChartBarTrendUp size={22} />
            </div>
            <div>
              <h3 className="gf-modal-header-title">
                Quantum League Leaderboard
              </h3>
              <p className="gf-modal-header-desc">
                Weekly Global Rankings based on Quantum XP and Verified Challenge Completions.
              </p>
            </div>
          </div>
          <button className="gf-modal-close-btn" onClick={onClose} title="Close" type="button">
            <Xmark size={16} />
          </button>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="gf-lb-podium">
          {allUsers.slice(0, 3).map((podiumUser) => (
            <div
              key={podiumUser.name}
              className={`gf-podium-card rank-${podiumUser.rank} ${podiumUser.isYou ? 'is-you' : ''}`}
            >
              <div className="gf-podium-crown">
                {podiumUser.rank === 1 && <Crown size={22} />}
                {podiumUser.rank === 2 && <Award size={20} />}
                {podiumUser.rank === 3 && <CupTrophy size={18} />}
              </div>
              <div className="gf-podium-rank-label">#{podiumUser.rank}</div>
              <div className="gf-podium-name">{podiumUser.name}</div>
              <div className="gf-podium-xp">
                <Bolt size={12} />
                <span>{podiumUser.xp.toLocaleString()} XP</span>
              </div>
            </div>
          ))}
        </div>

        {/* User Ranking List */}
        <div className="gf-leaderboard-list">
          {allUsers.map((user) => (
            <div
              key={user.rank + user.name}
              className={`gf-leaderboard-row ${user.isYou ? 'is-you' : ''}`}
            >
              <div className="gf-lb-rank">
                {getRankBadge(user.rank)}
              </div>
              
              <div className="gf-lb-avatar">
                <span className="gf-avatar-initials">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="gf-lb-details">
                <div className="gf-lb-name-row">
                  <span className="gf-lb-user-name">
                    {user.name}
                  </span>
                  {user.isYou && (
                    <span className="gf-lb-you-tag">YOU</span>
                  )}
                </div>
                <div className="gf-lb-user-sub">
                  <span>{user.title}</span>
                  <span>•</span>
                  <span>{user.solved} Solved</span>
                </div>
              </div>

              <div className="gf-lb-xp">
                <span className="gf-lb-xp-val">
                  <Bolt size={12} />
                  <span>{user.xp.toLocaleString()}</span>
                </span>
                <span className="gf-lb-xp-lbl">XP</span>
              </div>
            </div>
          ))}
        </div>

        <div className="gf-modal-footer">
          <button className="gf-game-btn secondary" onClick={onClose} type="button">
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
