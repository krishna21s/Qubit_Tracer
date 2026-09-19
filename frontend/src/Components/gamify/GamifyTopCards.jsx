import React, { useState } from 'react';
import {
  Flame,
  Bolt,
  Diamonds,
  ChartBarTrendUp,
  CupTrophy,
  Volume,
  VolumeMute,
  Sparkles
} from 'reicon-react';
import StreakWidget from './StreakWidget';
import QuizOfTheDay from './QuizOfTheDay';
import sounds from './soundEffects';

export default function GamifyTopCards({
  streak = 3,
  score = 120,
  gems = 50,
  onReward,
  onOpenLeaderboard,
  onOpenAchievements
}) {
  const [sfxOn, setSfxOn] = useState(sounds.enabled);

  const toggleSfx = () => {
    const next = sounds.toggle();
    setSfxOn(next);
    if (next) sounds.playClick();
  };

  // Next level milestone calculation (e.g. 300 XP for Level 2)
  const nextLevelXP = 300;
  const progressPct = Math.min(100, Math.round((score / nextLevelXP) * 100));

  return (
    <div className="gf-top-cards-grid">
      {/* ── CARD 1: DAILY STREAK CARD ── */}
      <div className="gf-top-stat-card gf-streak-card">
        <div className="gf-top-stat-header">
          <div className="gf-tsh-left">
            <div className="gf-tsh-icon-wrap flame">
              <Flame size={16} />
            </div>
            <div>
              <div className="gf-tsh-tag">WEEKLY STREAK</div>
              <h3 className="gf-tsh-title">{streak} Day Momentum</h3>
            </div>
          </div>
          <span className="gf-streak-active-pill">Active</span>
        </div>

        <div className="gf-streak-card-body">
          <StreakWidget streak={streak} />
        </div>
      </div>

      {/* ── CARD 2: XP & QUANTUM STATUS CARD ("ex card") ── */}
      <div className="gf-top-stat-card gf-xp-card">
        <div className="gf-top-stat-header">
          <div className="gf-tsh-left">
            <div className="gf-tsh-icon-wrap xp">
              <Bolt size={16} />
            </div>
            <div>
              <div className="gf-tsh-tag">PLAYER PROGRESS</div>
              <h3 className="gf-tsh-title">Level 1 • Quantum Novice</h3>
            </div>
          </div>

          <div className="gf-xp-header-actions">
            <button
              className="gf-mini-icon-btn"
              onClick={() => {
                sounds.playClick();
                if (onOpenLeaderboard) onOpenLeaderboard();
              }}
              title="Quantum Leaderboard"
              type="button"
            >
              <ChartBarTrendUp size={15} />
            </button>
            <button
              className="gf-mini-icon-btn"
              onClick={() => {
                sounds.playClick();
                if (onOpenAchievements) onOpenAchievements();
              }}
              title="Achievements & Badges"
              type="button"
            >
              <CupTrophy size={15} />
            </button>
            <button
              className={`gf-mini-icon-btn ${sfxOn ? 'on' : 'off'}`}
              onClick={toggleSfx}
              title={sfxOn ? 'Mute Sound FX' : 'Enable Sound FX'}
              type="button"
            >
              {sfxOn ? <Volume size={15} /> : <VolumeMute size={15} />}
            </button>
          </div>
        </div>

        <div className="gf-xp-main-display">
          <div className="gf-xp-big-number">
            <span className="gf-xp-num-val">{score}</span>
            <span className="gf-xp-num-label">TOTAL XP</span>
          </div>

          <div className="gf-xp-bar-wrap">
            <div className="gf-xp-bar-labels">
              <span>Next Rank: Level 2</span>
              <span>{score} / {nextLevelXP} XP</span>
            </div>
            <div className="gf-xp-track">
              <div
                className="gf-xp-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="gf-xp-chips-row">
          <div className="gf-currency-chip gem" title="Quantum Crystals">
            <Diamonds size={13} className="gem-icon" />
            <span className="chip-val">{gems}</span>
            <span className="chip-lbl">Q-Crystals</span>
          </div>

          <div className="gf-currency-chip energy" title="Coherence Energy">
            <Bolt size={13} className="energy-icon" />
            <span className="chip-val">5/5</span>
            <span className="chip-lbl">Coherence</span>
          </div>
        </div>
      </div>

      {/* ── CARD 3: QUIZ OF THE DAY CARD ── */}
      <QuizOfTheDay onReward={onReward} />
    </div>
  );
}
