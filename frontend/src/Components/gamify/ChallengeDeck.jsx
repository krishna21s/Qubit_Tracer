import React, { useState, useMemo } from 'react';
import sounds from './soundEffects';

export default function ChallengeDeck({
  problems = [],
  solvedIds = new Set(),
  onProblemSelect
}) {
  const [tierFilter, setTierFilter] = useState('all'); // 'all' | '1' | '2' | '3' | '4'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unsolved' | 'solved'
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return problems.filter(p => {
      if (tierFilter !== 'all' && Number(p.level) !== Number(tierFilter)) return false;
      const isSolved = solvedIds.has(p.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [problems, tierFilter, statusFilter, search, solvedIds]);

  const getTierMeta = (level) => {
    switch (Number(level)) {
      case 1:
        return { label: 'Beginner', badgeColor: '#22d3a5', icon: '🌱', mode: 'Gate Studio' };
      case 2:
        return { label: 'Intermediate', badgeColor: '#818cf8', icon: '⚡', mode: 'Wire Studio' };
      case 3:
        return { label: 'Advanced', badgeColor: '#f59e0b', icon: '🔥', mode: 'Code Editor' };
      case 4:
      default:
        return { label: 'Expert', badgeColor: '#ec4899', icon: '🛡️', mode: 'Code Editor' };
    }
  };

  return (
    <div className="gf-deck-viewport">
      <div className="gf-deck-container">
        {/* Daily Quest Banner */}
        <div className="gf-daily-quest-card">
          <div className="gf-daily-quest-icon">🎯</div>
          <div className="gf-daily-quest-info">
            <div className="gf-daily-quest-tag">DAILY QUANTUM BOUNTY</div>
            <div className="gf-daily-quest-title">Master Multipartite Coherence</div>
            <div className="gf-daily-quest-desc">
              Solve any 2 intermediate or advanced circuit challenges today to earn bonus rewards!
            </div>
          </div>
          <div className="gf-daily-quest-rewards">
            <span className="gf-reward-chip">⚡ +100 Bonus XP</span>
            <span className="gf-reward-chip">💎 +50 Crystals</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="gf-deck-toolbar">
          {/* Level tabs */}
          <div className="gf-deck-tier-tabs">
            <button
              className={`gf-tier-btn ${tierFilter === 'all' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setTierFilter('all'); }}
            >
              All Tiers ({problems.length})
            </button>
            <button
              className={`gf-tier-btn tier-1 ${tierFilter === '1' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setTierFilter('1'); }}
            >
              🌱 Beginner
            </button>
            <button
              className={`gf-tier-btn tier-2 ${tierFilter === '2' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setTierFilter('2'); }}
            >
              ⚡ Intermediate
            </button>
            <button
              className={`gf-tier-btn tier-3 ${tierFilter === '3' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setTierFilter('3'); }}
            >
              🔥 Advanced
            </button>
            <button
              className={`gf-tier-btn tier-4 ${tierFilter === '4' ? 'active' : ''}`}
              onClick={() => { sounds.playClick(); setTierFilter('4'); }}
            >
              🛡️ Expert
            </button>
          </div>

          {/* Search & Status toggle */}
          <div className="gf-deck-right-filters">
            <div className="gf-deck-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search quantum challenges..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="gf-deck-status-pills">
              <button
                className={`gf-status-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setStatusFilter('all'); }}
              >
                All
              </button>
              <button
                className={`gf-status-btn ${statusFilter === 'unsolved' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setStatusFilter('unsolved'); }}
              >
                ⚡ Unsolved
              </button>
              <button
                className={`gf-status-btn ${statusFilter === 'solved' ? 'active' : ''}`}
                onClick={() => { sounds.playClick(); setStatusFilter('solved'); }}
              >
                ✅ Solved
              </button>
            </div>
          </div>
        </div>

        {/* Quest Cards Grid */}
        <div className="gf-deck-grid">
          {filtered.map(p => {
            const isSolved = solvedIds.has(p.id);
            const meta = getTierMeta(p.level);

            return (
              <div
                key={p.id}
                className={`gf-quest-card ${isSolved ? 'is-solved' : ''}`}
                onClick={() => {
                  sounds.playClick();
                  onProblemSelect(p);
                }}
              >
                {/* Card Top Ribbon */}
                <div className="gf-quest-card-header">
                  <div className="gf-quest-tier-pill" style={{ borderColor: meta.badgeColor, color: meta.badgeColor }}>
                    <span>{meta.icon}</span>
                    <span>Level {p.level} • {meta.label}</span>
                  </div>

                  {isSolved ? (
                    <span className="gf-quest-status-badge solved">
                      ✅ COMPLETED
                    </span>
                  ) : (
                    <span className="gf-quest-status-badge open">
                      ⚡ {meta.mode}
                    </span>
                  )}
                </div>

                {/* Card Title & Qubits */}
                <h3 className="gf-quest-card-title">{p.title}</h3>
                <div className="gf-quest-card-qubits">
                  <span>⚛️ {p.num_qubits || 2} Qubits</span>
                  <span className="gf-quest-bullet">•</span>
                  <span>{p.points || (p.level * 50)} XP Bounty</span>
                </div>

                {/* Description */}
                <p className="gf-quest-card-desc">
                  {p.description}
                </p>

                {/* Bottom Action Footer */}
                <div className="gf-quest-card-footer">
                  <div className="gf-quest-bounty">
                    <span className="bounty-label">REWARD:</span>
                    <span className="bounty-xp">⚡ +{p.points || (p.level * 50)} XP</span>
                  </div>

                  <button className={`gf-quest-play-btn ${isSolved ? 'replay' : 'play'}`}>
                    {isSolved ? '↺ Replay' : '▶ Play Quest'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="gf-deck-empty">
            <span style={{ fontSize: '36px' }}>🛸</span>
            <h4>No Challenges Found</h4>
            <p>Try adjusting your search query or tier filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
