import React, { useState } from 'react';
import { getPlayerRank } from './gameAchievements';
import sounds from './soundEffects';

export default function GamifyHUD({
  score = 0,
  streak = 1,
  gems = 100,
  solvedCount = 0,
  currentView = 'levels',
  activeTab = 'roadmap', // 'roadmap' | 'arena'
  onTabChange,
  onBack,
  onOpenAchievements,
  onOpenLeaderboard,
  selectedLevel,
  selectedProblem
}) {
  const [sfxOn, setSfxOn] = useState(sounds.enabled);
  const rank = getPlayerRank(score);

  const toggleSfx = () => {
    const next = sounds.toggle();
    setSfxOn(next);
    if (next) sounds.playClick();
  };

  return (
    <header className="gf-game-hud">
      <div className="gf-hud-inner">
        {/* Left: Player Profile & Back Navigation */}
        <div className="gf-hud-left">
          {currentView !== 'levels' ? (
            <button
              className="gf-hud-back-btn"
              onClick={() => {
                sounds.playClick();
                if (onBack) onBack();
              }}
              title="Return to Previous Menu"
            >
              <span style={{ fontSize: '15px' }}>◀</span>
              <span>{currentView === 'solver' ? 'Challenge List' : 'Quest Map'}</span>
            </button>
          ) : (
            <div className="gf-hud-player-pill" onClick={onOpenAchievements} title="View Profile & Badges">
              <div className="gf-hud-avatar-ring">
                <span className="gf-hud-avatar">{rank.badge}</span>
                <span className="gf-hud-lvl-tag">{rank.level}</span>
              </div>
              <div className="gf-hud-player-text">
                <div className="gf-hud-player-name">{rank.name}</div>
                <div className="gf-hud-xp-sub">
                  <div className="gf-hud-xp-mini-track">
                    <div className="gf-hud-xp-mini-fill" style={{ width: `${rank.progress}%` }} />
                  </div>
                  <span>{score} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* If in problem solver, display the active quest badge */}
          {currentView === 'solver' && selectedProblem && (
            <div className="gf-hud-active-quest-pill">
              <span className="gf-quest-fire">⚔️</span>
              <span className="gf-quest-title">{selectedProblem.title}</span>
              <span className="gf-quest-xp">+{selectedProblem.points || 150} XP</span>
            </div>
          )}
        </div>

        {/* Center: Gamify Hub Navigation Tabs (Roadmap vs Arena) */}
        {currentView === 'levels' && (
          <div className="gf-hud-center-nav">
            <button
              className={`gf-hud-tab ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                if (onTabChange) onTabChange('roadmap');
              }}
            >
              <span>🗺️</span>
              <span>Quest Map</span>
            </button>
            <button
              className={`gf-hud-tab ${activeTab === 'arena' ? 'active' : ''}`}
              onClick={() => {
                sounds.playClick();
                if (onTabChange) onTabChange('arena');
              }}
            >
              <span>⚔️</span>
              <span>Challenge Deck</span>
            </button>
          </div>
        )}

        {/* Right: Game Currencies, Streak, Badges & Audio Toggle */}
        <div className="gf-hud-right">
          {/* Daily Streak */}
          <div className="gf-game-stat streak" title="Daily Solution Streak">
            <span className="gf-stat-icon flame">🔥</span>
            <span className="gf-stat-val">{streak}</span>
          </div>

          {/* Q-Gems */}
          <div className="gf-game-stat gem" title="Quantum Crystals">
            <span className="gf-stat-icon diamond">💎</span>
            <span className="gf-stat-val">{gems}</span>
          </div>

          {/* Quantum Energy */}
          <div className="gf-game-stat energy" title="Quantum Coherence Energy">
            <span className="gf-stat-icon bolt">⚡</span>
            <span className="gf-stat-val">5/5</span>
          </div>

          {/* Leaderboard Button */}
          <button
            className="gf-hud-icon-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenLeaderboard) onOpenLeaderboard();
            }}
            title="Weekly Leaderboard"
          >
            📊
          </button>

          {/* Badges / Achievements Button */}
          <button
            className="gf-hud-icon-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenAchievements) onOpenAchievements();
            }}
            title="Trophy Cabinet & Badges"
          >
            🏆
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`gf-hud-icon-btn sound-toggle ${sfxOn ? 'on' : 'off'}`}
            onClick={toggleSfx}
            title={sfxOn ? 'Mute Game SFX' : 'Enable Game SFX'}
          >
            {sfxOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
}
