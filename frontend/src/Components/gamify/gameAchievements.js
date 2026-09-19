/**
 * Gamification Badges, Achievements & Daily Quests
 */

export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    icon: '🚀',
    title: 'First Quantum Leap',
    description: 'Solve your very first quantum circuit challenge.',
    rewardXP: 50,
    check: (stats) => stats.solvedCount >= 1
  },
  {
    id: 'entangled',
    icon: '⚛️',
    title: 'Spooky Action',
    description: 'Create an entangled Bell state or GHZ state.',
    rewardXP: 100,
    check: (stats) => stats.solvedSet.has('prob-001') || stats.solvedSet.has('prob-005') || stats.solvedSet.has('prob-031')
  },
  {
    id: 'circuit_architect',
    icon: '⚡',
    title: 'Circuit Architect',
    description: 'Solve 5 visual wire studio challenges in Level 2.',
    rewardXP: 150,
    check: (stats) => stats.levelCounts[2] >= 5
  },
  {
    id: 'code_hacker',
    icon: '💻',
    title: 'Quantum Polyglot',
    description: 'Solve an Advanced or Expert problem in the Code Editor.',
    rewardXP: 200,
    check: (stats) => (stats.levelCounts[3] >= 1 || stats.levelCounts[4] >= 1)
  },
  {
    id: 'streak_fire',
    icon: '🔥',
    title: 'Coherence Streak',
    description: 'Solve 3 challenges in a single active session.',
    rewardXP: 100,
    check: (stats) => stats.streak >= 3
  },
  {
    id: 'algorithm_ace',
    icon: '🧠',
    title: 'Algorithm Alchemist',
    description: 'Solve Deutsch-Jozsa, Grover, or Bernstein-Vazirani.',
    rewardXP: 250,
    check: (stats) => stats.solvedSet.has('prob-054') || stats.solvedSet.has('prob-055') || stats.solvedSet.has('prob-008')
  },
  {
    id: 'ten_club',
    icon: '💎',
    title: 'Quantum Collector',
    description: 'Solve 10 or more quantum challenges.',
    rewardXP: 300,
    check: (stats) => stats.solvedCount >= 10
  },
  {
    id: 'grandmaster',
    icon: '👑',
    title: 'Quantum Grandmaster',
    description: 'Tackle and conquer an Expert Level 4 challenge.',
    rewardXP: 500,
    check: (stats) => stats.levelCounts[4] >= 1
  }
];

export const RANKS = [
  { name: 'Quantum Novice', minXP: 0, badge: '🌱', level: 1 },
  { name: 'Qubit Apprentice', minXP: 150, badge: '⚡', level: 2 },
  { name: 'Circuit Adept', minXP: 450, badge: '🔬', level: 3 },
  { name: 'Algorithm Wizard', minXP: 900, badge: '🧙‍♂️', level: 4 },
  { name: 'Quantum Pioneer', minXP: 1500, badge: '🚀', level: 5 },
  { name: 'Entanglement Master', minXP: 2500, badge: '🌌', level: 6 },
  { name: 'Quantum Grandmaster', minXP: 4000, badge: '👑', level: 7 }
];

export function getPlayerRank(xp) {
  let cur = RANKS[0];
  let next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXP) {
      cur = RANKS[i];
      next = RANKS[i + 1] || null;
    }
  }
  const currentBase = cur.minXP;
  const target = next ? next.minXP : cur.minXP + 1000;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - currentBase) / (target - currentBase)) * 100)));
  return {
    ...cur,
    nextRank: next ? next.name : 'Max Rank',
    nextXP: target,
    progress
  };
}
