import React, { useState, useEffect, useMemo, useRef } from 'react';
import LevelSelector from './LevelSelector';
import ProblemList from './ProblemList';
import ProblemSolver from './ProblemSolver';

const SESS_KEY = 'gamify_state_v1';

// Professional SVG Icons
const Icons = {
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </svg>
  ),
  medal: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  )
};

function GameAssistant() {
  const [currentView, setCurrentView] = useState('levels');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [score, setScore] = useState(0);
  const [solvedIds, setSolvedIds] = useState(() => new Set());
  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [scoreUpdating, setScoreUpdating] = useState(false);
  const pendingProblemIdRef = useRef(null);

  // Hydrate from session storage
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

  // Fetch problems and solutions
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

  // Restore selected problem after hydration
  useEffect(() => {
    const savedId = pendingProblemIdRef.current;
    if (!savedId || !problems.length) return;
    const match = problems.find(p => p.id === savedId);
    setSelectedProblem(match || null);
    pendingProblemIdRef.current = null;
  }, [problems]);

  // Persist to session storage
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

  // Handlers
  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setSelectedProblem(null);
    setCurrentView('list');
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    setCurrentView('solver');
  };

  const handleBackToLevels = () => {
    setCurrentView('levels');
    setSelectedLevel(null);
    setSelectedProblem(null);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProblem(null);
  };

  const handleScoreUpdate = (points) => {
    const pid = selectedProblem?.id;
    if (!pid || solvedIds.has(pid)) return;
    
    // Trigger score animation
    setScoreUpdating(true);
    setTimeout(() => setScoreUpdating(false), 400);
    
    setScore(prev => prev + (Number(points) || 0));
    setSolvedIds(prev => {
      const next = new Set(prev);
      next.add(pid);
      return next;
    });
  };

  const problemsForLevel = useMemo(() => {
    if (selectedLevel == null) return [];
    return problems.filter(p => Number(p.level) === Number(selectedLevel));
  }, [problems, selectedLevel]);

  // Get title based on current view
  const getTitle = () => {
    if (currentView === 'solver' && selectedProblem) {
      return selectedProblem.title;
    }
    if (currentView === 'list' && selectedLevel) {
      return `Level ${selectedLevel} Challenges`;
    }
    return 'Challenge Hub';
  };

  return (
    <div className="gamify-root" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {(currentView === 'list' || currentView === 'solver') && (
        <div className="gf-header">
          <div className="gf-header-left">
            <button
              className="gf-back-btn"
              onClick={currentView === 'solver' ? handleBackToList : handleBackToLevels}
            >
              {Icons.back}
              <span>{currentView === 'solver' ? 'Problems' : 'Levels'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {currentView === 'levels' ? (
          <LevelSelector 
            onLevelSelect={handleLevelSelect}
            solvedIds={solvedIds}
            problems={problems}
          />
        ) : currentView === 'list' ? (
          <ProblemList
            problems={problemsForLevel}
            level={selectedLevel}
            onProblemSelect={handleProblemSelect}
            solvedIds={solvedIds}
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