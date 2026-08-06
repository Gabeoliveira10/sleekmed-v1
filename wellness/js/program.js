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

/**
 * Body-part-per-day splits for an aesthetic/physique goal (recomp or lose).
 * Unlike Upper/Lower, chest gets its own dedicated session instead of sharing
 * a day with back — the classic bodybuilding split, and the shape that makes
 * "chest day" its own thing rather than one slot among many.
 */
const SPLITS_AESTHETIC = {
  4: { name: 'Chest / Back / Legs / Shoulders', days: ['chestTri', 'backBi', 'legs', 'shoulders'] },
  5: { name: 'Chest / Back / Legs / Shoulders / Arms', days: ['chestTri', 'backBi', 'legs', 'shoulders', 'armsCore'] }
};

/** Suggested weekday per split-day index, always starting Monday. Advisory —
 *  the app still lets you train the next day in rotation whenever you show up. */
const WEEKDAY_SUGGESTIONS = {
  2: ['Monday', 'Thursday'],
  3: ['Monday', 'Wednesday', 'Friday'],
  4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
  5: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  7: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
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
  },

  // ── Aesthetic split: chest gets its own day, not shared with back ──
  chestTri: {
    label: 'Chest & Triceps',
    slots: [
      { pattern: 'push-h', role: 'primary' },
      { muscle: 'upper chest', role: 'secondary' },
      { muscle: 'chest', role: 'accessory' },
      { muscle: 'chest', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' },
      { muscle: 'triceps', role: 'accessory' }
    ]
  },
  backBi: {
    label: 'Back & Biceps',
    slots: [
      { pattern: 'pull-v', role: 'primary' },
      { pattern: 'pull-h', role: 'secondary' },
      { muscle: 'lats', role: 'accessory' },
      { muscle: 'back', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' },
      { muscle: 'biceps', role: 'accessory' }
    ]
  },
  shoulders: {
    label: 'Shoulders',
    slots: [
      { pattern: 'push-v', role: 'primary' },
      { muscle: 'side delts', role: 'secondary' },
      { muscle: 'side delts', role: 'accessory' },
      { muscle: 'rear delts', role: 'accessory' },
      { muscle: 'traps', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  },
  armsCore: {
    label: 'Arms & Core',
    slots: [
      { muscle: 'biceps', role: 'primary' },
      { muscle: 'triceps', role: 'primary' },
      { muscle: 'biceps', role: 'secondary' },
      { muscle: 'triceps', role: 'secondary' },
      { pattern: 'core', role: 'accessory' },
      { pattern: 'core', role: 'accessory' }
    ]
  }
};

/* ── Set / rep prescriptions ───────────────────────── */

/** Physique/definition goal — moderate-high reps, shorter rest, closer to failure. */
const isAestheticGoal = (goal) => goal === 'recomp' || goal === 'lose';

function prescribe(role, goal, experience) {
  const strengthLean = goal === 'perform' || goal === 'gain';
  const aesthetic = isAestheticGoal(goal);

  const base = aesthetic
    ? {
        primary: { sets: 4, reps: '8-10', rest: 105, rpe: 8 },
        secondary: { sets: 3, reps: '10-12', rest: 90, rpe: 8 },
        accessory: { sets: 3, reps: '12-15', rest: 60, rpe: 9 }
      }[role]
    : {
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

/** A high-rep, short-rest close to the session — the "finish hard" burnout block. */
function prescribeFinisher() {
  return { sets: 3, reps: '15-20', rest: 45, rpe: 9 };
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
  const aesthetic = isAestheticGoal(profile.goal);
  // Aesthetic goals at 4–5 days get a dedicated body-part split (chest gets
  // its own day); everything else keeps the Upper/Lower or PPL structure.
  const split = (aesthetic && SPLITS_AESTHETIC[freq]) || SPLITS[freq];
  const equipment = profile.equipment?.length ? profile.equipment : ['bodyweight'];
  const focus = profile.focus || [];
  const weekdays = WEEKDAY_SUGGESTIONS[freq] || [];

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

    // Aesthetic goals close every session with a high-rep finisher block —
    // added on top of the cap above, not counted against it, since a
    // short-rest burnout takes far less time than a full straight set.
    if (aesthetic && recipeKey !== 'conditioning') {
      const hasCore = exercises.some((e) => byId[e.exerciseId]?.pattern === 'core');
      if (!hasCore) {
        const core = EXERCISES.find((e) => e.pattern === 'core' && equipment.includes(e.equip) && !used.has(e.id));
        if (core) {
          used.add(core.id);
          const fin = prescribeFinisher();
          exercises.push({ exerciseId: core.id, name: core.name, role: 'finisher', sets: fin.sets, reps: fin.reps, restSeconds: fin.rest, rpe: fin.rpe });
        }
      }
      const cardio = EXERCISES.find((e) => e.pattern === 'cardio' && equipment.includes(e.equip));
      if (cardio) {
        exercises.push({
          exerciseId: cardio.id, name: cardio.name, role: 'finisher',
          sets: 1, reps: '10-15 min', restSeconds: 0, rpe: 7
        });
      }
    }

    return { id: recipeKey + '-' + i, key: recipeKey, name: recipe.label, weekday: weekdays[i] || null, exercises };
  });

  return {
    name: split.name,
    split: split.name,
    daysPerWeek: freq,
    style: aesthetic ? 'aesthetic' : 'strength',
    createdAt: Date.now(),
    source: 'built-in',
    notes: buildNotes(profile, aesthetic),
    days
  };
}

function buildNotes(profile, aesthetic) {
  const notes = [];
  const goalNote = {
    lose: 'Training keeps the muscle you have while the deficit removes fat. Keep the loads heavy — do not turn lifting into cardio.',
    recomp: 'Push weight on the primary lifts and keep protein high. Recomp is slow but it works.',
    gain: 'Add reps or load to the primary lifts every week. Eat the surplus consistently.',
    perform: 'Prioritize the top sets of the primaries. Leave a rep in reserve on accessories.',
    maintain: 'Consistency over intensity. Two hard sets per muscle group per week maintains almost everything.'
  }[profile.goal];
  if (goalNote) notes.push(goalNote);

  if (aesthetic) {
    notes.push('This is a body-part split built for definition, not raw strength: 8–15 reps, shorter rest, closer to failure on the last set of each exercise — the look you want comes from total volume per muscle, not the number on the bar.');
    notes.push('Every session ends with a high-rep finisher (the last exercise, tagged "finisher") and a short conditioning piece. Push those hard — that is the block doing the most for visible definition and the fat-loss side of the deficit.');
    notes.push('This split is not a copy of any specific trainer\'s program — I don\'t have a verified source for anyone\'s exact written plan, and I won\'t pretend to. It\'s built in the training style you described: chest-first Monday, body-part focus, high volume, finish every session hard.');
  }

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
