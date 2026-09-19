import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  Gamepad,
  Flame,
  Diamonds,
  Bolt,
  ChartBarTrendUp,
  CupTrophy,
  Volume,
  VolumeMute,
  Sparkles
} from 'reicon-react';
import sounds from './soundEffects';
import StreakWidget from './StreakWidget';

export default function GamifyHUD({
  streak = 3,
  gems = 100,
  currentView = 'challenges',
  onBack,
  onOpenAchievements,
  onOpenLeaderboard,
  selectedProblem
}) {
  const [sfxOn, setSfxOn] = useState(sounds.enabled);
  const [showStreakPopover, setShowStreakPopover] = useState(false);
  const streakRef = useRef(null);

  const toggleSfx = () => {
    const next = sounds.toggle();
    setSfxOn(next);
    if (next) sounds.playClick();
  };

  // Close streak popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (streakRef.current && !streakRef.current.contains(event.target)) {
        setShowStreakPopover(false);
      }
    }
    if (showStreakPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStreakPopover]);

  return (
    <header className="gf-game-hud">
      <div className="gf-hud-inner">
        {/* Left: Navigation or Page Title */}
        <div className="gf-hud-left">
          {currentView === 'solver' ? (
            <button
              className="gf-hud-back-btn"
              onClick={() => {
                sounds.playClick();
                if (onBack) onBack();
              }}
              title="Return to Challenges"
              type="button"
            >
              <ChevronLeft size={16} />
              <span>Back to Challenges</span>
            </button>
          ) : (
            <div className="gf-hud-title-wrap">
              <Gamepad size={20} className="gf-hud-title-icon" />
              <span className="gf-hud-title-text">Quantum Challenges</span>
            </div>
          )}

          {/* Active quest badge in solver */}
          {currentView === 'solver' && selectedProblem && (
            <div className="gf-hud-active-quest-pill">
              <Sparkles size={14} className="gf-quest-fire-icon" />
              <span className="gf-quest-title">{selectedProblem.title}</span>
              <span className="gf-quest-xp">+{selectedProblem.points || 150} XP</span>
            </div>
          )}
        </div>

        {/* Right: Currencies, Streak Popover Toggle & Actions */}
        <div className="gf-hud-right">
          {/* Daily Streak with Interactive Popover */}
          <div className="gf-streak-trigger-wrap" ref={streakRef}>
            <button
              className={`gf-game-stat streak ${showStreakPopover ? 'active' : ''}`}
              onClick={() => setShowStreakPopover(prev => !prev)}
              title="Click to view weekly streak calendar"
              type="button"
            >
              <span className="gf-stat-icon flame">
                <Flame size={14} />
              </span>
              <span className="gf-stat-val">{streak}</span>
            </button>

            {/* Streak Popover Dropdown matching Image 2 */}
            {showStreakPopover && (
              <div className="gf-streak-popover-card">
                <StreakWidget streak={streak} />
              </div>
            )}
          </div>

          {/* Q-Gems */}
          <div className="gf-game-stat gem" title="Quantum Crystals">
            <span className="gf-stat-icon diamond">
              <Diamonds size={14} />
            </span>
            <span className="gf-stat-val">{gems}</span>
          </div>

          {/* Quantum Energy */}
          <div className="gf-game-stat energy" title="Quantum Coherence Energy">
            <span className="gf-stat-icon bolt">
              <Bolt size={14} />
            </span>
            <span className="gf-stat-val">5/5</span>
          </div>

          {/* Leaderboard Button */}
          <button
            className="gf-hud-icon-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenLeaderboard) onOpenLeaderboard();
            }}
            title="Quantum League Leaderboard"
            type="button"
          >
            <ChartBarTrendUp size={16} />
          </button>

          {/* Badges / Achievements Button */}
          <button
            className="gf-hud-icon-btn"
            onClick={() => {
              sounds.playClick();
              if (onOpenAchievements) onOpenAchievements();
            }}
            title="Trophy Cabinet & Badges"
            type="button"
          >
            <CupTrophy size={16} />
          </button>

          {/* Sound FX Toggle */}
          <button
            className={`gf-hud-icon-btn sound-toggle ${sfxOn ? 'on' : 'off'}`}
            onClick={toggleSfx}
            title={sfxOn ? 'Mute Sound FX' : 'Enable Sound FX'}
            type="button"
          >
            {sfxOn ? <Volume size={16} /> : <VolumeMute size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
