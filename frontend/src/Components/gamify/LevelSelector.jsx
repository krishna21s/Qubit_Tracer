import React from 'react';

function LevelSelector({ onLevelSelect }) {
  const levels = [
    { level: 1, title: 'Level 1', subtitle: 'Beginner', description: 'Basic quantum gates and simple circuits', points: '+10 points each', color: '#ff7b72' },
    { level: 2, title: 'Level 2', subtitle: 'Intermediate', description: 'Multi-qubit entanglement and quantum states', points: '+20 points each', color: '#3fb950' },
    { level: 3, title: 'Level 3', subtitle: 'Advanced', description: 'Circuit optimization and error correction', points: '+30 points each', color: '#58a6ff' },
    { level: 4, title: 'Level 4', subtitle: 'Expert', description: 'Quantum algorithms and complex protocols', points: '+40 points each', color: '#d2a8ff' }
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h2
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 800,
              backgroundImage: 'linear-gradient(90deg,#58a6ff,#3fb950,#ff7b72)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 24px rgba(88,166,255,0.15)'
            }}
          >
            Choose Your Challenge Level
          </h2>
          <div style={{ color: '#b6d5ea', marginTop: 8, fontSize: 16 }}>
            Master quantum computing through progressive difficulty
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 16
          }}
        >
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              onClick={() => onLevelSelect(lvl.level)}
              style={{
                cursor: 'pointer',
                borderRadius: 18,
                padding: 18,
                background: 'linear-gradient(145deg,#0f1e2a,#0b1a24)',
                border: '1px solid #274d62',
                boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                position: 'relative',
                transition: 'transform .2s, box-shadow .2s, border-color .2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#58a6ff';
                e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#274d62';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.35)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="animate-glow"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: '1px solid #355c72',
                      background: '#11283a',
                      color: lvl.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22
                    }}
                  >
                    🎯
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{lvl.title}</div>
                    <div style={{ fontSize: 13, color: '#9fc8e2', marginTop: 2 }}>{lvl.subtitle}</div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#cfefff',
                    padding: '6px 10px',
                    borderRadius: 10,
                    border: '1px solid #2b536a',
                    background: 'rgba(18,42,58,0.6)'
                  }}
                >
                  {lvl.points}
                </div>
              </div>
              <div style={{ color: '#d5eefc', lineHeight: 1.55, fontSize: 14 }}>{lvl.description}</div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="animate-shimmer"
                  style={{
                    background: 'linear-gradient(90deg,#1b3a4c,#154056)',
                    border: '1px solid #2a536a',
                    color: '#e6f6ff',
                    borderRadius: 12,
                    padding: '8px 12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Start Level →
                </button>
                <div style={{ color: '#88b6cc', fontSize: 12 }}>Click to explore problems</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid #2a536a',
              background: 'rgba(18,42,58,0.5)'
            }}
          >
            <span>🏆</span>
            <span style={{ color: '#cfefff' }}>Complete challenges to unlock quantum mastery</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelSelector;