/* ═══════════════════════════════════════════════════════
   store.js — application state + localStorage persistence
   ═══════════════════════════════════════════════════════ */

const KEY = 'forge.state.v1';

export const todayKey = (d = new Date()) => {
  const t = new Date(d);
  t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  return t.toISOString().slice(0, 10);
};

export const daysAgoKey = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function defaultState() {
  return {
    version: 1,
    profile: {
      name: '',
      sex: 'male',
      age: 30,
      heightCm: 178,
      weightKg: 80,
      activityLevel: 'moderate',
      goal: 'recomp',
      rateKgPerWeek: 0.4,
      experience: 'intermediate',
      daysPerWeek: 4,
      sessionMinutes: 60,
      equipment: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
      focus: [],
      limitations: '',
      dietStyle: 'omnivore',
      allergies: '',
      units: 'metric',
      onboarded: false,
      createdAt: null
    },
    targets: { calories: 0, protein: 0, carbs: 0, fat: 0, waterMl: 3000, steps: 8000, manual: false },
    program: null,
    workoutLogs: [],
    activeWorkout: null,
    foodLogs: {},        // { 'YYYY-MM-DD': [entry] }
    water: {},           // { 'YYYY-MM-DD': ml }
    weights: [],         // [{ date, kg }]
    measurements: [],    // [{ date, waist, chest, arms, thighs, bodyFat }]
    photos: [],          // [{ id, date, dataUrl, note }]
    journal: [],         // [{ date, mood, energy, note, win }]
    mealPlan: null,
    grocery: [],         // [{ id, name, qty, category, checked }]
    customFoods: [],
    recentFoods: [],
    coachThread: [],
    achievements: [],
    settings: {
      apiKey: '',
      proxyUrl: '',
      model: 'claude-opus-5',
      aiEnabled: true,
      restSeconds: 90,
      soundOn: true
    }
  };
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return deepMerge(defaultState(), parsed);
  } catch (err) {
    console.warn('[forge] state load failed, starting fresh', err);
    return defaultState();
  }
}

function deepMerge(base, patch) {
  if (Array.isArray(base) || Array.isArray(patch)) return patch ?? base;
  if (typeof base !== 'object' || base === null) return patch ?? base;
  if (typeof patch !== 'object' || patch === null) return base;
  const out = { ...base };
  for (const k of Object.keys(patch)) out[k] = deepMerge(base[k], patch[k]);
  return out;
}

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[forge] save failed — storage may be full', err);
    }
  }, 120);
}

/** Read-only snapshot of state. */
export const get = () => state;

/**
 * Mutate state via a callback, then persist + notify.
 * @param {(draft: object) => void} fn
 */
export function update(fn) {
  fn(state);
  persist();
  listeners.forEach((l) => l(state));
}

export function replaceAll(next) {
  state = deepMerge(defaultState(), next);
  persist();
  listeners.forEach((l) => l(state));
}

export function resetAll() {
  state = defaultState();
  localStorage.removeItem(KEY);
  listeners.forEach((l) => l(state));
}

/* ── Derived helpers ───────────────────────────────── */

export const foodLogFor = (dateKey = todayKey()) => state.foodLogs[dateKey] || [];

export function dayTotals(dateKey = todayKey()) {
  return foodLogFor(dateKey).reduce(
    (acc, f) => ({
      calories: acc.calories + (f.kcal || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fat: acc.fat + (f.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function addFoodEntry(entry, dateKey = todayKey()) {
  update((s) => {
    if (!s.foodLogs[dateKey]) s.foodLogs[dateKey] = [];
    s.foodLogs[dateKey].push({ id: uid(), loggedAt: Date.now(), ...entry });
    // keep a short recent-foods list for one-tap re-logging
    const stub = { name: entry.name, kcal: entry.kcal, protein: entry.protein, carbs: entry.carbs, fat: entry.fat, serving: entry.serving };
    s.recentFoods = [stub, ...s.recentFoods.filter((r) => r.name !== entry.name)].slice(0, 24);
  });
}

export function removeFoodEntry(id, dateKey = todayKey()) {
  update((s) => {
    s.foodLogs[dateKey] = (s.foodLogs[dateKey] || []).filter((f) => f.id !== id);
  });
}

export function latestWeight() {
  const w = state.weights;
  return w.length ? w[w.length - 1].kg : state.profile.weightKg;
}

export function logWeight(kg, dateKey = todayKey()) {
  update((s) => {
    const existing = s.weights.find((w) => w.date === dateKey);
    if (existing) existing.kg = kg;
    else s.weights.push({ date: dateKey, kg });
    s.weights.sort((a, b) => a.date.localeCompare(b.date));
    s.profile.weightKg = kg;
  });
}

/**
 * A day counts toward the streak if the user logged food, a workout, or a journal entry.
 */
export function computeStreak() {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const key = daysAgoKey(i);
    const active =
      (state.foodLogs[key] || []).length > 0 ||
      state.workoutLogs.some((w) => w.date === key) ||
      state.journal.some((j) => j.date === key);
    if (active) streak++;
    else if (i > 0) break;      // today not yet logged is forgiven
    else if (i === 0) continue;
  }
  return streak;
}

export function activeDays(n = 28) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const key = daysAgoKey(i);
    out.push({
      key,
      food: (state.foodLogs[key] || []).length > 0,
      workout: state.workoutLogs.some((w) => w.date === key)
    });
  }
  return out;
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}
