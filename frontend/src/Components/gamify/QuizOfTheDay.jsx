import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle,
  Xmark,
  Bolt,
  Sparkles,
  Refresh
} from 'reicon-react';
import sounds from './soundEffects';

const DAILY_QUIZ = {
  id: 'quiz-2026-09-19',
  question: 'Applying a Hadamard gate twice (H · H) to qubit state |0⟩ results in which state?',
  options: [
    { id: 'a', label: '|0⟩', isCorrect: true },
    { id: 'b', label: '|1⟩', isCorrect: false },
    { id: 'c', label: '|+⟩', isCorrect: false },
    { id: 'd', label: '|−⟩', isCorrect: false }
  ],
  explanation: 'Because the Hadamard gate is unitary and self-inverse (H = H† = H⁻¹), applying H twice returns any qubit back to its original state.',
  points: 50
};

export default function QuizOfTheDay({ onReward }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Hydrate quiz state from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`gamify_quiz_${DAILY_QUIZ.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedOption(parsed.selectedOption);
        setSubmitted(true);
        setIsCorrect(parsed.isCorrect);
      }
    } catch {}
  }, []);

  const handleSubmit = () => {
    if (!selectedOption || submitted) return;
    sounds.playClick();
    const chosen = DAILY_QUIZ.options.find(o => o.id === selectedOption);
    const correct = Boolean(chosen?.isCorrect);

    setIsCorrect(correct);
    setSubmitted(true);

    try {
      sessionStorage.setItem(
        `gamify_quiz_${DAILY_QUIZ.id}`,
        JSON.stringify({ selectedOption, isCorrect: correct })
      );
    } catch {}

    if (correct) {
      sounds.playSuccess();
      if (onReward) onReward(DAILY_QUIZ.points);
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    setSelectedOption(null);
    setSubmitted(false);
    setIsCorrect(false);
    try {
      sessionStorage.removeItem(`gamify_quiz_${DAILY_QUIZ.id}`);
    } catch {}
  };

  return (
    <div className="gf-top-stat-card gf-quiz-card">
      <div className="gf-quiz-header">
        <div className="gf-quiz-header-left">
          <div className="gf-quiz-badge">
            <Sparkles size={12} />
            <span>QUIZ OF THE DAY</span>
          </div>
          <h3 className="gf-quiz-title">Daily Quantum Teaser</h3>
        </div>
        <div className="gf-quiz-bounty-chip">
          <Bolt size={12} />
          <span>+{DAILY_QUIZ.points} XP</span>
        </div>
      </div>

      <p className="gf-quiz-question">{DAILY_QUIZ.question}</p>

      {/* Options */}
      <div className="gf-quiz-options-list">
        {DAILY_QUIZ.options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          let optClass = '';
          if (submitted) {
            if (opt.isCorrect) optClass = 'correct';
            else if (isSelected && !opt.isCorrect) optClass = 'wrong';
          } else if (isSelected) {
            optClass = 'selected';
          }

          return (
            <button
              key={opt.id}
              className={`gf-quiz-option-btn ${optClass}`}
              onClick={() => {
                if (!submitted) {
                  sounds.playClick();
                  setSelectedOption(opt.id);
                }
              }}
              disabled={submitted}
              type="button"
            >
              <span className="gf-quiz-opt-marker">{opt.id.toUpperCase()}</span>
              <span className="gf-quiz-opt-text">{opt.label}</span>
              {submitted && opt.isCorrect && (
                <CheckCircle size={14} className="gf-quiz-opt-icon correct" />
              )}
              {submitted && isSelected && !opt.isCorrect && (
                <Xmark size={14} className="gf-quiz-opt-icon wrong" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Feedback / Submit */}
      <div className="gf-quiz-footer">
        {!submitted ? (
          <button
            className="gf-quiz-submit-btn"
            disabled={!selectedOption}
            onClick={handleSubmit}
            type="button"
          >
            Submit Answer
          </button>
        ) : (
          <div className="gf-quiz-feedback-row">
            {isCorrect ? (
              <div className="gf-quiz-result success">
                <CheckCircle size={15} />
                <span>Correct! +{DAILY_QUIZ.points} XP earned</span>
              </div>
            ) : (
              <div className="gf-quiz-result error">
                <span>Not quite. Check the identity!</span>
                <button
                  className="gf-quiz-retry-btn"
                  onClick={handleRetry}
                  type="button"
                  title="Try again"
                >
                  <Refresh size={12} />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
