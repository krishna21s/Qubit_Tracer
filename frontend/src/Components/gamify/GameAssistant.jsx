import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft } from 'reicon-react';
import ChallengeDeck from './ChallengeDeck';
import ProblemList from './ProblemList';
import ProblemSolver from './ProblemSolver';
import VictoryModal from './VictoryModal';
import AchievementsModal from './AchievementsModal';
import LeaderboardModal from './LeaderboardModal';
import sounds from './soundEffects';
import { GAMIFY_PROBLEMS } from '../../data/gamifyProblems';
import { GAMIFY_SOLUTIONS } from '../../data/gamifySolutions';

const SESS_KEY = 'gamify_state_v3';

function GameAssistant() {
  const [currentView, setCurrentView] = useState('deck'); // 'deck' | 'list' | 'solver'
  const [previousView, setPreviousView] = useState('deck');
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [score, setScore] = useState(120);
  const [gems, setGems] = useState(50);
  const [streak, setStreak] = useState(3);
  const [solvedIds, setSolvedIds] = useState(() => new Set(['prob-002']));
  const [problems, setProblems] = useState(GAMIFY_PROBLEMS);
  const [solutions, setSolutions] = useState(GAMIFY_SOLUTIONS);
  const [hydrated, setHydrated] = useState(false);

  // Modals
  const [victoryData, setVictoryData] = useState(null); // { problem, points }
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const pendingProblemIdRef = useRef(null);

  // Hydrate from session storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          setScore(Number(s.score) || 120);
          setGems(Number(s.gems) || 50);
          setStreak(Number(s.streak) || 3);
          const restoredView = s.currentView === 'list' || s.currentView === 'solver' ? s.currentView : 'deck';
          setCurrentView(restoredView);
          setPreviousView(s.previousView === 'list' ? 'list' : 'deck');
          setSolvedIds(new Set(Array.isArray(s.solved) ? s.solved : ['prob-002']));
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
      if (Array.isArray(probs) && probs.length >= GAMIFY_PROBLEMS.length) {
        setProblems(probs);
      }
      const sols = await safeFetch(solsURL, '/gamify/solutions.json');
      if (Array.isArray(sols) && sols.length >= GAMIFY_SOLUTIONS.length) {
        setSolutions(sols);
      }
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
        gems,
        streak,
        currentView,
        previousView,
        selectedProblemId: selectedProblem?.id || null,
        solved: Array.from(solvedIds)
      };
      sessionStorage.setItem(SESS_KEY, JSON.stringify(payload));
    } catch { }
  }, [hydrated, score, gems, streak, currentView, previousView, selectedProblem, solvedIds]);

  // Handlers
  const handleProblemSelect = (problem) => {
    sounds.playClick();
    setSelectedProblem(problem);
    setPreviousView(currentView === 'solver' ? previousView : currentView);
    setCurrentView('solver');
  };

  const handleBackFromSolver = () => {
    sounds.playClick();
    setSelectedProblem(null);
    setCurrentView(previousView || 'deck');
  };

  const handleScoreUpdate = (points) => {
    const pid = selectedProblem?.id;
    const earnedPoints = Number(points) || (selectedProblem?.level ? selectedProblem.level * 50 : 100);
    
    // Play celebratory victory fanfare
    sounds.playSuccess();

    setScore(prev => prev + earnedPoints);
    setGems(prev => prev + 25);
    setStreak(prev => prev + 1);

    if (pid) {
      setSolvedIds(prev => {
        const next = new Set(prev);
        next.add(pid);
        return next;
      });
    }

    // Trigger victory modal
    setVictoryData({
      problem: selectedProblem,
      points: earnedPoints
    });
  };

  const handleNextProblem = () => {
    if (!selectedProblem) {
      setVictoryData(null);
      return;
    }
    const curIdx = problems.findIndex(p => p.id === selectedProblem.id);
    const nextProb = problems[curIdx + 1];
    setVictoryData(null);
    if (nextProb) {
      handleProblemSelect(nextProb);
    } else {
      handleBackFromSolver();
    }
  };

  const [selectedLevel, setSelectedLevel] = useState(null);

  // Stats bundle for achievements
  const playerStats = useMemo(() => {
    const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    solvedIds.forEach(id => {
      const match = problems.find(p => p.id === id);
      if (match && match.level) {
        levelCounts[match.level] = (levelCounts[match.level] || 0) + 1;
      }
    });
    return {
      xp: score,
      gems,
      streak,
      solvedCount: solvedIds.size,
      solvedSet: solvedIds,
      levelCounts
    };
  }, [score, gems, streak, solvedIds, problems]);

  const handleOpenList = (level = null) => {
    sounds.playClick();
    setSelectedLevel(level);
    setCurrentView('list');
  };

  const handleQuizReward = (points) => {
    setScore(prev => prev + (Number(points) || 50));
    setGems(prev => prev + 15);
  };

  return (
    <div className="gamify-root">
      {/* ── Solver Mode Top Bar (Aligned with Workspace) ── */}
      {currentView === 'solver' && (
        <div className="gf-solver-top-bar">
          <div className="gf-solver-top-bar-inner">
            <button
              className="gf-hud-back-btn"
              onClick={handleBackFromSolver}
              type="button"
            >
              <ChevronLeft size={16} />
              <span>Back to Challenges</span>
            </button>
            {selectedProblem && (
              <div className="gf-solver-quest-badge">
                <span className="gf-sq-title">{selectedProblem.title}</span>
                <span className="gf-sq-bounty">+{selectedProblem.points || ((selectedProblem.level || 1) * 50)} XP</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main View Area ── */}
      <div className="gf-main-viewport">
        {currentView === 'deck' ? (
          <ChallengeDeck
            problems={problems}
            solvedIds={solvedIds}
            streak={streak}
            score={score}
            gems={gems}
            onProblemSelect={handleProblemSelect}
            onSeeMore={handleOpenList}
            onReward={handleQuizReward}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenAchievements={() => setShowAchievements(true)}
          />
        ) : currentView === 'list' ? (
          <ProblemList
            problems={problems}
            level={selectedLevel}
            onProblemSelect={handleProblemSelect}
            solvedIds={solvedIds}
            onBackToFeatured={() => {
              setSelectedLevel(null);
              setCurrentView('deck');
            }}
          />
        ) : (
          <ProblemSolver
            problem={selectedProblem}
            solutions={solutions}
            onScoreUpdate={handleScoreUpdate}
          />
        )}
      </div>

      {/* ── Modals ── */}
      {victoryData && (
        <VictoryModal
          problem={victoryData.problem}
          points={victoryData.points}
          onClose={() => setVictoryData(null)}
          onNext={handleNextProblem}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          stats={playerStats}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          userXP={score}
          userSolved={solvedIds.size}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

export default GameAssistant;