import React from 'react';
import { Flame, Shield } from 'reicon-react';

const WEEKDAYS = [
  { key: 'mo', label: 'Mo', dayIndex: 1 },
  { key: 'tu', label: 'Tu', dayIndex: 2 },
  { key: 'we', label: 'We', dayIndex: 3 },
  { key: 'th', label: 'Th', dayIndex: 4 },
  { key: 'fr', label: 'Fr', dayIndex: 5 },
  { key: 'sa', label: 'Sa', dayIndex: 6 },
  { key: 'su', label: 'Su', dayIndex: 0 },
];

export default function StreakWidget({ streak = 3, compact = false }) {
  // Current day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const today = new Date().getDay();
  // Map dayIndex to 0-6 where Monday is 0, Sunday is 6
  const currentWeekdayIndex = today === 0 ? 6 : today - 1;

  // Compute active days in current week based on streak
  // E.g. if streak is 4 and today is Thursday (index 3), days 0,1,2,3 are active
  const activeDaysCount = Math.min(7, Math.max(1, (streak % 7) || streak));

  return (
    <div className={`gf-streak-widget ${compact ? 'compact' : ''}`}>
      {/* Weekday Row */}
      <div className="gf-streak-week-row">
        {WEEKDAYS.map((d) => (
          <span key={d.key} className="gf-streak-day-label">
            {d.label}
          </span>
        ))}
      </div>

      {/* Days Track with Connected Highlight Pill */}
      <div className="gf-streak-track-container">
        {/* Connecting highlight track behind active days */}
        <div
          className="gf-streak-active-track-pill"
          style={{
            width: `calc(${(activeDaysCount / 7) * 100}% + 4px)`,
          }}
        />

        {WEEKDAYS.map((d, index) => {
          const isActive = index < activeDaysCount;
          const isToday = index === currentWeekdayIndex;

          return (
            <div
              key={d.key}
              className={`gf-streak-node ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
            >
              <div className="gf-streak-circle">
                {isActive ? (
                  <Flame size={15} className="gf-streak-icon-flame" />
                ) : (
                  <span className="gf-streak-empty-dot" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Status Row */}
      <div className="gf-streak-bottom-row">
        <div className="gf-streak-count-col">
          <Flame size={16} className="gf-streak-icon-bottom" />
          <span className="gf-streak-days-text">
            <strong>{streak}</strong> {streak === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="gf-streak-freeze-group" title="Streak Freeze Active">
          <span className="gf-streak-freeze-chip" title="Streak Shield 1">
            <Shield size={11} />
          </span>
          <span className="gf-streak-freeze-chip" title="Streak Shield 2">
            <Shield size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}
