import React, { useState, useEffect, useMemo, useRef } from 'react';
import LevelSelector from './LevelSelector';
import ProblemList from './ProblemList';
import ProblemSolver from './ProblemSolver';

const SESS_KEY = 'gamify_state_v1';

function GameAssistant() {
  const [currentView, setCurrentView] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [score, setScore] = useState(0);
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const pendingProblemIdRef = useRef(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          setScore(Number(s.score) || 0);
          setCurrentView(s.currentView || 'levels');
          setSelectedLevel(
            typeof s.selectedLevel === 'number' || typeof s.selectedLevel === 'string'
              ? Number(s.selectedLevel)
              : null
          );
          setSolvedIds(new Set(Array.isArray(s.solved) ? s.solved : []));
          pendingProblemIdRef.current = s.selectedProblemId || null;
        }
      }
    } catch { }
    finally { setHydrated(true); }
  }, []);

  useEffect(() => {
    const base = (import.meta?.env?.BASE_URL ?? '/').replace(/\/+$/, '/');
    const probsURL = `${base}gamify/problems.json`;
    const solsURL = `${base}gamify/solutions.json`;

    const safeFetch = async (url, fallback) => {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(String(res.status));
        return await res.json();
      } catch {
        if (fallback) {
          const res2 = await fetch(fallback, { cache: 'no-cache' });
          if (!res2.ok) throw new Error(String(res2.status));
          return await res2.json();
        }
        return [];
      }
    };

    (async () => {
      const probs = await safeFetch(probsURL, '/gamify/problems.json');
      setProblems(Array.isArray(probs) ? probs : []);
      const sols = await safeFetch(solsURL, '/gamify/solutions.json');
      setSolutions(Array.isArray(sols) ? sols : []);
    })();
  }, []);

  useEffect(() => {
    const savedId = pendingProblemIdRef.current;
    if (!savedId || !problems.length) return;
    const match = problems.find(p => p.id === savedId);
    setSelectedProblem(match || null);
    pendingProblemIdRef.current = null;
  }, [problems]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload = {
        score,
        currentView,
        selectedLevel,
        selectedProblemId: selectedProblem?.id || null,
        solved: Array.from(solvedIds)
      };
      sessionStorage.setItem(SESS_KEY, JSON.stringify(payload));
    } catch { }
  }, [hydrated, score, currentView, selectedLevel, selectedProblem, solvedIds]);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setSelectedProblem(null);
    setCurrentView('list');
  };
  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setCurrentView('solver');
  };
  const handleBackToLevels = () => { setCurrentView('levels'); setSelectedLevel(null); setSelectedProblem(null); };
  const handleBackToList = () => { setCurrentView('list'); setSelectedProblem(null); };

  const handleScoreUpdate = (points) => {
    const pid = selectedProblem?.id;
    if (!pid || solvedIds.has(pid)) return;
    setScore(prev => prev + (Number(points) || 0));
    setSolvedIds(prev => { const next = new Set(prev); next.add(pid); return next; });
  };

  const problemsForLevel = useMemo(() => {
    if (selectedLevel == null) return [];
    return problems.filter(p => Number(p.level) === Number(selectedLevel));
  }, [problems, selectedLevel]);

  return (
    <div className="gamify-root" style={{ height: 'calc(100% - 0px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <div
        style={{
          background: 'var(--qt-surface-alt, linear-gradient(90deg, #0f1a24 0%, #0b2433 100%))',
          border: '1px solid var(--qt-border, #254d60)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {(currentView === 'list' || currentView === 'solver') && (
              <button
                onClick={currentView === 'solver' ? handleBackToList : handleBackToLevels}
                className="animate-glow"
                style={{
                  background: 'var(--qt-button-primary, linear-gradient(135deg,#1d4c69,#123346))',
                  border: '1px solid var(--qt-border, #265774)',
                  color: 'var(--qt-button-contrast, #fff)',
                  fontWeight: 600,
                  padding: '8px 12px',
                  borderRadius: 10,
                  cursor: 'pointer'
                }}
                title={currentView === 'solver' ? 'Back to Problems' : 'Back to Levels'}
              >
                ← {currentView === 'solver' ? 'Problems' : 'Levels'}
              </button>
            )}
            <h1
              className="animate-float"
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                backgroundImage: 'linear-gradient(90deg, var(--qt-text, #e8f2ff), var(--qt-accent, #58a6ff))',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {currentView === 'solver' && selectedProblem
                ? selectedProblem.title
                : currentView === 'list' && selectedLevel
                  ? `Level ${selectedLevel} Problems`
                  : 'Game Assistant'}
            </h1>
          </div>

          <div
            className="animate-shimmer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--qt-surface-alt, linear-gradient(90deg,#0f2a3a 0%, #103448 100%))',
              border: '1px solid var(--qt-border, #2a536a)',
              borderRadius: 14,
              padding: '8px 12px',
              color: 'var(--qt-text, #e6f6ff)'
            }}
          >
            <span style={{ fontSize: 16 }}>🏅</span>
            <span style={{ fontWeight: 700 }}>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentView === 'levels' ? (
          <LevelSelector onLevelSelect={handleLevelSelect} />
        ) : currentView === 'list' ? (
          <ProblemList
            problems={problemsForLevel}
            level={selectedLevel}
            onProblemSelect={handleProblemSelect}
          />
        ) : (
          <ProblemSolver
            problem={selectedProblem}
            solutions={solutions}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default GameAssistant;