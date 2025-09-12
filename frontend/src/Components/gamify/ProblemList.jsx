import React from 'react';

function ProblemList({ problems, level, onProblemSelect }) {
  const levelColor = {
    1: '#ff7b72',
    2: '#3fb950',
    3: '#58a6ff',
    4: '#d2a8ff'
  }[level] || '#58a6ff';

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--qt-text, #eaf6ff)' }}>
            Level {level} Problems
          </h2>
          <div style={{ color: 'var(--qt-text-dim, #b6d5ea)', marginTop: 6 }}>Choose a problem to start solving</div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {problems.map((p) => (
            <div
              key={p.id}
              onClick={() => onProblemSelect(p)}
              style={{
                cursor: 'pointer',
                borderRadius: 16,
                padding: 16,
                background: 'var(--qt-surface, linear-gradient(145deg,#0f1e2a,#0b1a24))',
                border: '1px solid var(--qt-border, #274d62)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
                position: 'relative',
                transition: 'transform .2s, box-shadow .2s, border-color .2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = levelColor;
                e.currentTarget.style.boxShadow = '0 14px 30px rgba(0,0,0,0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--qt-border, #274d62)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.35)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--qt-text, #e6f6ff)' }}>{p.title}</h3>
                </div>
                <div style={{ color: 'var(--qt-text-dim, #9fc8e2)' }}>→</div>
              </div>
            </div>
          ))}
        </div>

        {!problems.length && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--qt-text-dim, #b6d5ea)' }}>
            <div style={{ fontSize: 42, opacity: 0.6, marginBottom: 10 }}>🏆</div>
            No problems available for this level
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemList;