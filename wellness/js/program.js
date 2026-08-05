/* ═══════════════════════════════════════════════════════
   program.js — rule-based training program generator
   Builds a split from days/week, experience, goal and available
   equipment, then fills each day from the exercise library with
   a priority order (compound → accessory → isolation → core).
   ═══════════════════════════════════════════════════════ */

import { EXERCISES, byId } from './data/exercises.js';

/* ── Split templates by weekly frequency ───────────── */

const SPLITS = {
  2: { name: 'Full Body 2×', days: ['fullA', 'fullB'] },
  3: { name: 'Full Body 3×', days: ['fullA', 'fullB', 'fullC'] },
  4: { name: 'Upper / Lower', days: ['upperA', 'lowerA', 'upperB', 'lowerB'] },
  5: { name: 'Push / Pull / Legs + Upper / Lower', days: ['push', 'pull', 'legs', 'upperB', 'lowerB'] },
  6: { name: 'Push / Pull / Legs ×2', days: ['push', 'pull', 'legs', 'pushB', 'pullB', 'legsB'] },
  7: { name: 'PPL ×2 + Conditioning', days: ['push', 'pull', 'legs', 'pushB', 'pullB', 'legsB', 'conditioning'] }
};

/* A day recipe is an ordered list of slots. Each slot names the movement
   pattern (and optionally a muscle) the generator should fill. */
const DAY_RECIPES = {
  fullA: {
    label: 'Full Body A',
    slots: [
      { pattern: 'squat', role: 'primary' },
      { pattern: 'push-h', role: 'primary' },
      { pattern: 'pull-h', role: 'primary' },
      { pattern: 'hinge', role: 'secondary' },
      { pattern: 'push-v', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  fullB: {
    label: 'Full Body B',
    slots: [
      { pattern: 'hinge', role: 'primary' },
      { pattern: 'pull-v', role: 'primary' },
      { pattern: 'push-v', role: 'primary' },
      { pattern: 'lunge', role: 'secondary' },
      { muscle: 'biceps', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  fullC: {
    label: 'Full Body C',
    slots: [
      { pattern: 'squat', role: 'primary' },
      { pattern: 'push-h', role: 'primary' },
      { pattern: 'pull-h', role: 'primary' },
      { muscle: 'side delts', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' },
      { muscle: 'calves', role: 'accessory' }
    ]
  },
  upperA: {
    label: 'Upper A — Push focus',
    slots: [
      { pattern: 'push-h', role: 'primary' },
      { pattern: 'pull-h', role: 'primary' },
      { pattern: 'push-v', role: 'secondary' },
      { pattern: 'pull-v', role: 'secondary' },
      { muscle: 'side delts', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' }
    ]
  },
  upperB: {
    label: 'Upper B — Pull focus',
    slots: [
      { pattern: 'pull-v', role: 'primary' },
      { pattern: 'push-v', role: 'primary' },
      { pattern: 'pull-h', role: 'secondary' },
      { pattern: 'push-h', role: 'secondary' },
      { muscle: 'rear delts', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' }
    ]
  },
  lowerA: {
    label: 'Lower A — Quad focus',
    slots: [
      { pattern: 'squat', role: 'primary' },
      { pattern: 'hinge', role: 'secondary' },
      { pattern: 'lunge', role: 'secondary' },
      { muscle: 'quads', role: 'accessory' },
      { muscle: 'calves', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  lowerB: {
    label: 'Lower B — Posterior focus',
    slots: [
      { pattern: 'hinge', role: 'primary' },
      { pattern: 'squat', role: 'secondary' },
      { muscle: 'glutes', role: 'secondary' },
      { muscle: 'hamstrings', role: 'accessory' },
      { muscle: 'calves', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  push: {
    label: 'Push — Chest / Shoulders / Triceps',
    slots: [
      { pattern: 'push-h', role: 'primary' },
      { pattern: 'push-v', role: 'primary' },
      { muscle: 'upper chest', role: 'secondary' },
      { muscle: 'chest', role: 'accessory' },
      { muscle: 'side delts', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' }
    ]
  },
  pushB: {
    label: 'Push B — Volume',
    slots: [
      { pattern: 'push-v', role: 'primary' },
      { pattern: 'push-h', role: 'primary' },
      { muscle: 'chest', role: 'accessory' },
      { muscle: 'side delts', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  pull: {
    label: 'Pull — Back / Biceps',
    slots: [
      { pattern: 'pull-v', role: 'primary' },
      { pattern: 'pull-h', role: 'primary' },
      { muscle: 'lats', role: 'secondary' },
      { muscle: 'rear delts', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' },
      { muscle: 'traps', role: 'accessory' }
    ]
  },
  pullB: {
    label: 'Pull B — Volume',
    slots: [
      { pattern: 'pull-h', role: 'primary' },
      { pattern: 'pull-v', role: 'primary' },
      { muscle: 'back', role: 'secondary' },
      { muscle: 'rear delts', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' },
      { muscle: 'forearms', role: 'accessory' }
    ]
  },
  legs: {
    label: 'Legs — Quad focus',
    slots: [
      { pattern: 'squat', role: 'primary' },
      { pattern: 'hinge', role: 'secondary' },
      { pattern: 'lunge', role: 'secondary' },
      { muscle: 'quads', role: 'accessory' },
      { muscle: 'calves', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  legsB: {
    label: 'Legs B — Hamstring / Glute focus',
    slots: [
      { pattern: 'hinge', role: 'primary' },
      { muscle: 'glutes', role: 'primary' },
      { muscle: 'hamstrings', role: 'secondary' },
      { pattern: 'squat', role: 'accessory' },
      { muscle: 'calves', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  conditioning: {
    label: 'Conditioning & Core',
    slots: [
      { pattern: 'cardio', role: 'primary' },
      { pattern: 'carry', role: 'secondary' },
      { pattern: 'core', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  }
};

/* ── Set / rep prescriptions ───────────────────────── */

function prescribe(role, goal, experience) {
  const strengthLean = goal === 'perform' || goal === 'gain';
  const base = {
    primary: strengthLean
      ? { sets: 4, reps: '4-6', rest: 180, rpe: 8 }
      : { sets: 4, reps: '6-8', rest: 150, rpe: 8 },
    secondary: { sets: 3, reps: '8-10', rest: 120, rpe: 8 },
    accessory: { sets: 3, reps: '10-15', rest: 75, rpe: 9 }
  }[role];

  if (experience === 'beginner') {
    return { ...base, sets: Math.max(2, base.sets - 1), reps: role === 'primary' ? '8-10' : base.reps, rpe: 7 };
  }
  if (experience === 'advanced' && role !== 'accessory') {
    return { ...base, sets: base.sets + 1 };
  }
  return base;
}

/* ── Selection ─────────────────────────────────────── */

function pickExercise(slot, { equipment, used, focus }) {
  const pool = EXERCISES.filter((ex) => {
    if (!equipment.includes(ex.equip)) return false;
    if (slot.pattern && ex.pattern !== slot.pattern) return false;
    if (slot.muscle && !ex.muscles.includes(slot.muscle)) return false;
    if (slot.role === 'primary' && slot.pattern && !ex.compound && ex.pattern !== 'cardio') return false;
    return true;
  });

  if (!pool.length) return null;

  // Rank: not-yet-used first, then focus-muscle match, then compound for primaries.
  const scored = pool.map((ex) => {
    let score = 0;
    if (used.has(ex.id)) score -= 100;
    if (focus.some((f) => ex.muscles.includes(f))) score += 12;
    if (slot.role === 'primary' && ex.compound) score += 6;
    if (slot.role === 'accessory' && !ex.compound) score += 4;
    // Prefer free weights for primaries, machines/cables for accessories
    if (slot.role === 'primary' && (ex.equip === 'barbell' || ex.equip === 'dumbbell')) score += 5;
    if (slot.role === 'accessory' && (ex.equip === 'cable' || ex.equip === 'machine')) score += 3;
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].ex;
}

/**
 * Build a full program from a profile.
 * @param {object} profile
 * @returns {{name, split, daysPerWeek, createdAt, notes, days: Array}}
 */
export function generateProgram(profile) {
  const freq = Math.min(7, Math.max(2, profile.daysPerWeek || 4));
  const split = SPLITS[freq];
  const equipment = profile.equipment?.length ? profile.equipment : ['bodyweight'];
  const focus = profile.focus || [];

  // Trim volume to fit the session length: ~9 min per exercise incl. rest
  const maxExercises = Math.max(4, Math.floor((profile.sessionMinutes || 60) / 9));

  const days = split.days.map((recipeKey, i) => {
    const recipe = DAY_RECIPES[recipeKey];
    const used = new Set();
    const exercises = [];

    for (const slot of recipe.slots.slice(0, maxExercises)) {
      const ex = pickExercise(slot, { equipment, used, focus });
      if (!ex) continue;
      used.add(ex.id);
      const rx = prescribe(slot.role, profile.goal, profile.experience);
      exercises.push({
        exerciseId: ex.id,
        name: ex.name,
        role: slot.role,
        sets: rx.sets,
        reps: rx.reps,
        restSeconds: rx.rest,
        rpe: rx.rpe
      });
    }

    // Cutting/recomp goals get a short finisher on non-conditioning days
    if ((profile.goal === 'lose' || profile.goal === 'recomp') && recipeKey !== 'conditioning' && exercises.length < maxExercises) {
      const cardio = EXERCISES.find((e) => e.pattern === 'cardio' && equipment.includes(e.equip));
      if (cardio) {
        exercises.push({
          exerciseId: cardio.id, name: cardio.name, role: 'finisher',
          sets: 1, reps: '10-15 min', restSeconds: 0, rpe: 6
        });
      }
    }

    return { id: recipeKey + '-' + i, key: recipeKey, name: recipe.label, exercises };
  });

  return {
    name: split.name,
    split: split.name,
    daysPerWeek: freq,
    createdAt: Date.now(),
    source: 'built-in',
    notes: buildNotes(profile),
    days
  };
}

function buildNotes(profile) {
  const notes = [];
  const goalNote = {
    lose: 'Training keeps the muscle you have while the deficit removes fat. Keep the loads heavy — do not turn lifting into cardio.',
    recomp: 'Push weight on the primary lifts and keep protein high. Recomp is slow but it works.',
    gain: 'Add reps or load to the primary lifts every week. Eat the surplus consistently.',
    perform: 'Prioritize the top sets of the primaries. Leave a rep in reserve on accessories.',
    maintain: 'Consistency over intensity. Two hard sets per muscle group per week maintains almost everything.'
  }[profile.goal];
  if (goalNote) notes.push(goalNote);

  notes.push('Progression: when you hit the top of the rep range on every set, add 2.5–5 kg (5–10 lb) next session.');
  notes.push(`Rest as prescribed — ${profile.experience === 'beginner' ? 'do not rush the compounds' : 'longer rest on primaries, shorter on accessories'}.`);
  if (profile.limitations?.trim()) {
    notes.push(`You noted: "${profile.limitations.trim()}". Swap any painful movement for a pain-free variation — the pattern matters more than the exercise.`);
  }
  notes.push('Deload every 5–7 weeks: same exercises, 2 sets, ~60% of your usual load.');
  return notes;
}

/** Which program day comes next, based on what has already been logged. */
export function nextProgramDay(program, workoutLogs) {
  if (!program?.days?.length) return null;
  const last = workoutLogs[workoutLogs.length - 1];
  if (!last) return program.days[0];
  const idx = program.days.findIndex((d) => d.id === last.dayId);
  if (idx === -1) return program.days[0];
  return program.days[(idx + 1) % program.days.length];
}

/** Best previous performance for an exercise, for the "last time" hint. */
export function lastPerformance(exerciseId, workoutLogs) {
  for (let i = workoutLogs.length - 1; i >= 0; i--) {
    const entry = workoutLogs[i].entries?.find((e) => e.exerciseId === exerciseId);
    if (entry) {
      const done = entry.sets.filter((s) => s.done && s.weight);
      if (done.length) {
        const best = done.reduce((a, b) => (b.weight * b.reps > a.weight * a.reps ? b : a));
        return { date: workoutLogs[i].date, weight: best.weight, reps: best.reps, sets: done.length };
      }
    }
  }
  return null;
}

export function personalBest(exerciseId, workoutLogs) {
  let best = null;
  for (const w of workoutLogs) {
    const entry = w.entries?.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    for (const s of entry.sets) {
      if (!s.done || !s.weight) continue;
      if (!best || s.weight > best.weight) best = { weight: s.weight, reps: s.reps, date: w.date };
    }
  }
  return best;
}

export function workoutVolume(log) {
  return (log.entries || []).reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + (set.done ? (set.weight || 0) * (set.reps || 0) : 0), 0),
    0
  );
}

export { byId as exerciseById };
