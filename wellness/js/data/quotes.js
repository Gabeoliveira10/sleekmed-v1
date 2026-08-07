/* ═══════════════════════════════════════════════════════
   quotes.js — daily motivation + achievement definitions
   ═══════════════════════════════════════════════════════ */

export const QUOTES = [
  { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee' },
  { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear' },
  { text: 'Everybody wants to be a bodybuilder, but nobody wants to lift no heavy-ass weights.', author: 'Ronnie Coleman' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'It never gets easier. You just go faster.', author: 'Greg LeMond' },
  { text: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
  { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
  { text: 'Motivation gets you started. Habit keeps you going.', author: 'Jim Ryun' },
  { text: 'Strength does not come from what you can do. It comes from overcoming what you thought you could not.', author: 'Rikki Rogers' },
  { text: 'The only bad workout is the one that did not happen.', author: 'Unknown' },
  { text: 'Take care of your body. It is the only place you have to live.', author: 'Jim Rohn' },
  { text: 'If it does not challenge you, it does not change you.', author: 'Fred DeVito' },
  { text: 'You are far better than you think you are. You can do more than you think you can.', author: 'Ken Chlouber' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'The pain you feel today will be the strength you feel tomorrow.', author: 'Arnold Schwarzenegger' },
  { text: 'Nobody cares. Work harder.', author: 'Cameron Hanes' },
  { text: 'Fall in love with the process and the results will come.', author: 'Eric Thomas' },
  { text: 'Consistency beats intensity, every single time.', author: 'Unknown' },
  { text: 'You cannot out-train a diet you refuse to look at.', author: 'Unknown' },
  { text: 'Rest is part of the program, not a break from it.', author: 'Unknown' },
  { text: 'Progress is progress, no matter how small the plate.', author: 'Unknown' },
  { text: 'What gets measured gets managed.', author: 'Peter Drucker' },
  { text: 'The groundwork for all happiness is good health.', author: 'Leigh Hunt' },
  { text: 'Show up on the days you do not feel like it. Those are the ones that count.', author: 'Unknown' },
  { text: 'A one-hour workout is 4% of your day. No excuses.', author: 'Unknown' },
  { text: 'Perfect is the enemy of consistent.', author: 'Unknown' },
  { text: 'Train hard. Eat well. Sleep like it is your job.', author: 'Unknown' },
  { text: 'You did not come this far to only come this far.', author: 'Unknown' },
  { text: 'The difference between who you are and who you want to be is what you do.', author: 'Unknown' },
  { text: 'Sweat is just fat crying.', author: 'Unknown' }
];

/** Deterministic quote-of-the-day so it does not change on every render. */
export function quoteOfDay(dateKey) {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  return QUOTES[h % QUOTES.length];
}

export const AFFIRMATIONS = [
  'You are one workout closer than you were yesterday.',
  'Your only competition is who you were last week.',
  'Hard days build the version of you that handles hard days.',
  'Log it honestly. Data you fudge cannot help you.',
  'Eat like you respect the work you put in.',
  'Sleep is the most underrated performance drug you own.',
  'You are allowed to start over as many times as it takes.',
  'The plan works when you do.',
  'Momentum is built, not found.',
  'Protein, sleep, steps. Nail the boring stuff.'
];

export const ACHIEVEMENTS = [
  { id: 'first-workout', icon: '🎬', title: 'First Rep', desc: 'Complete your first logged workout', test: (s) => s.workoutLogs.length >= 1 },
  { id: 'workouts-10', icon: '🏋️', title: 'Ten Sessions', desc: 'Complete 10 workouts', test: (s) => s.workoutLogs.length >= 10 },
  { id: 'workouts-50', icon: '🦾', title: 'Half Century', desc: 'Complete 50 workouts', test: (s) => s.workoutLogs.length >= 50 },
  { id: 'workouts-100', icon: '👑', title: 'Century Club', desc: 'Complete 100 workouts', test: (s) => s.workoutLogs.length >= 100 },
  { id: 'first-meal', icon: '🍽️', title: 'Tracking Started', desc: 'Log your first meal', test: (s) => Object.values(s.foodLogs).some((d) => d.length) },
  { id: 'ai-scan', icon: '📸', title: 'Eyes On', desc: 'Log a meal with the AI photo scanner', test: (s) => Object.values(s.foodLogs).flat().some((f) => f.source === 'ai-photo') },
  { id: 'streak-7', icon: '🔥', title: 'Week Strong', desc: 'Hit a 7-day activity streak', test: (s, ctx) => ctx.streak >= 7 },
  { id: 'streak-30', icon: '⚡', title: 'Month Locked In', desc: 'Hit a 30-day activity streak', test: (s, ctx) => ctx.streak >= 30 },
  { id: 'weigh-10', icon: '⚖️', title: 'Data Driven', desc: 'Log 10 bodyweight entries', test: (s) => s.weights.length >= 10 },
  { id: 'photo-first', icon: '🪞', title: 'Before Shot', desc: 'Add your first progress photo', test: (s) => s.photos.length >= 1 },
  { id: 'journal-7', icon: '📓', title: 'Reflective', desc: 'Write 7 journal entries', test: (s) => s.journal.length >= 7 },
  { id: 'protein-hit', icon: '🥩', title: 'Protein Pro', desc: 'Hit your protein target 5 days', test: (s, ctx) => ctx.proteinDays >= 5 },
  { id: 'volume-king', icon: '📈', title: 'Volume King', desc: 'Move 50,000 kg of total lifetime volume', test: (s, ctx) => ctx.totalVolume >= 50000 },
  { id: 'plan-made', icon: '🗺️', title: 'The Plan', desc: 'Generate a training program', test: (s) => !!s.program }
];
