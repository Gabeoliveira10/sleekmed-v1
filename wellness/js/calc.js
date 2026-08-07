/* ═══════════════════════════════════════════════════════
   calc.js — BMR / TDEE / macro targets, units, formatting
   ═══════════════════════════════════════════════════════ */

export const ACTIVITY = {
  sedentary: { label: 'Sedentary', desc: 'Desk job, little exercise', mult: 1.2 },
  light: { label: 'Lightly active', desc: 'Light exercise 1–3 days/wk', mult: 1.375 },
  moderate: { label: 'Moderately active', desc: 'Exercise 3–5 days/wk', mult: 1.55 },
  high: { label: 'Very active', desc: 'Hard exercise 6–7 days/wk', mult: 1.725 },
  athlete: { label: 'Athlete', desc: 'Training 2x/day or physical job', mult: 1.9 }
};

export const GOALS = {
  lose: { label: 'Lose fat', emoji: '🔥', desc: 'Calorie deficit, protein high' },
  recomp: { label: 'Recomposition', emoji: '⚖️', desc: 'Lose fat + build muscle' },
  gain: { label: 'Build muscle', emoji: '💪', desc: 'Lean surplus for growth' },
  maintain: { label: 'Maintain', emoji: '🎯', desc: 'Hold weight, improve fitness' },
  perform: { label: 'Performance', emoji: '⚡', desc: 'Strength and endurance first' }
};

export const EXPERIENCE = {
  beginner: { label: 'Beginner', desc: 'Under 1 year of consistent lifting' },
  intermediate: { label: 'Intermediate', desc: '1–3 years, know the main lifts' },
  advanced: { label: 'Advanced', desc: '3+ years, structured programming' }
};

/** Mifflin–St Jeor basal metabolic rate (kcal/day). */
export function bmrMifflin({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'female') return base - 161;
  if (sex === 'other') return base - 78;     // midpoint of the two constants
  return base + 5;
}

/**
 * Katch–McArdle BMR — uses real lean body mass, so it needs a body-fat / DEXA
 * measurement. More accurate than Mifflin for anyone whose composition is known,
 * because it doesn't assume an average muscle-to-fat ratio from height and weight.
 */
export function bmrKatch(leanMassKg) {
  return 370 + 21.6 * leanMassKg;
}

/**
 * Best available BMR: Katch–McArdle when a scan has given us lean mass,
 * otherwise Mifflin–St Jeor. This is what the rest of the app should call.
 */
export function bmr(profile) {
  if (profile.leanMassKg > 0) return bmrKatch(profile.leanMassKg);
  return bmrMifflin(profile);
}

/** Whether targets are being computed from a real body-composition scan. */
export const usingScan = (profile) => profile.leanMassKg > 0;

/** Total daily energy expenditure. */
export function tdee(profile) {
  const mult = ACTIVITY[profile.activityLevel]?.mult ?? 1.55;
  return bmr(profile) * mult;
}

/**
 * Calorie + macro targets derived from the profile.
 * Protein is set per kg of bodyweight and scaled by goal; fat gets a floor of
 * ~0.7 g/kg for hormonal health; carbs take the remainder.
 */
export function computeTargets(profile) {
  const maintenance = tdee(profile);
  const kgPerWeek = Math.abs(profile.rateKgPerWeek || 0.4);
  // 7700 kcal ≈ 1 kg of body mass, spread over 7 days
  const dailyDelta = (kgPerWeek * 7700) / 7;

  let calories = maintenance;
  let proteinPerKg = 1.8;

  switch (profile.goal) {
    case 'lose':
      calories = maintenance - dailyDelta;
      proteinPerKg = 2.2;
      break;
    case 'recomp':
      calories = maintenance - dailyDelta * 0.45;
      proteinPerKg = 2.2;
      break;
    case 'gain':
      calories = maintenance + Math.min(dailyDelta, 450);
      proteinPerKg = 2.0;
      break;
    case 'perform':
      calories = maintenance + 120;
      proteinPerKg = 1.9;
      break;
    default:
      calories = maintenance;
      proteinPerKg = 1.8;
  }

  // Never dip below a safe floor (~22 kcal/kg or BMR, whichever is higher)
  const floor = Math.max(bmr(profile) * 1.0, profile.weightKg * 22);
  calories = Math.max(calories, floor);

  const protein = Math.round(profile.weightKg * proteinPerKg);
  const fatFloor = Math.round(profile.weightKg * 0.7);
  const fatFromPct = Math.round((calories * 0.25) / 9);
  const fat = Math.max(fatFloor, fatFromPct);

  const carbKcal = calories - protein * 4 - fat * 9;
  const carbs = Math.max(40, Math.round(carbKcal / 4));

  return {
    calories: Math.round(calories / 5) * 5,
    protein,
    carbs,
    fat,
    maintenance: Math.round(maintenance),
    waterMl: Math.round((profile.weightKg * 35) / 100) * 100,
    steps: profile.goal === 'lose' ? 10000 : 8000
  };
}

/** Rough body-fat estimate from BMI + age (Deurenberg). Informational only. */
export function estimateBodyFat({ sex, weightKg, heightCm, age }) {
  const bmiVal = bmi(weightKg, heightCm);
  const sexFactor = sex === 'female' ? 0 : 1;
  return Math.max(3, 1.2 * bmiVal + 0.23 * age - 10.8 * sexFactor - 5.4);
}

export const bmi = (kg, cm) => kg / Math.pow(cm / 100, 2);

/* ── Body-composition targets (from a DEXA/InBody scan) ────────────
   Everything here works off two hard numbers the scan gives us:
   lean mass and fat mass. Lean mass is treated as held constant, so the
   projections answer "what happens if I keep my muscle and only lose fat".
*/

const LB = 0.453592;

/**
 * A DEXA scan reports THREE compartments — lean soft tissue, fat, and bone
 * mineral — and defines body-fat % as fat / (fat + lean), leaving bone out.
 * This returns those three masses in kg from a stored scan so every projection
 * uses the same convention the report does.
 */
export function scanBasis(dexa) {
  const weightKg = dexa.weightLbs * LB;
  const leanKg = dexa.leanMassLbs * LB;             // soft lean only
  const fatKg = dexa.fatMassLbs * LB;
  const boneKg = Math.max(0, weightKg - leanKg - fatKg);
  return { weightKg, leanKg, fatKg, boneKg, ffmKg: leanKg + boneKg };
}

/**
 * Fat mass now, assuming fat-free mass (lean + bone) held constant since the
 * scan — so every pound gained or lost on the scale is treated as fat. This is
 * the standard between-scans estimate; the next scan re-anchors it.
 */
export function currentFatKg(dexa, currentWeightKg) {
  const b = scanBasis(dexa);
  return Math.max(0, b.fatKg + (currentWeightKg - b.weightKg));
}

/** Current body-fat %, in the DEXA convention: fat / (fat + lean soft tissue). */
export function currentBodyFat(dexa, currentWeightKg) {
  const b = scanBasis(dexa);
  const f = currentFatKg(dexa, currentWeightKg);
  return (f / (f + b.leanKg)) * 100;
}

/** Scale weight at a target body-fat %, holding muscle and bone constant. */
export function weightAtBodyFat(dexa, targetPct) {
  const b = scanBasis(dexa);
  const p = targetPct / 100;
  const fatT = (p / (1 - p)) * b.leanKg;            // fat that yields target fat/(fat+lean)
  return b.leanKg + b.boneKg + fatT;
}

/** Fat-Free Mass Index — muscularity, height-normalized. ~18 average, 22+ well-built (natural). */
export function ffmi(ffmKg, heightCm) {
  const h = heightCm / 100;
  const raw = ffmKg / (h * h);
  return raw + 6.1 * (1.8 - h);   // normalized to 1.8 m so short/tall compare fairly
}

/**
 * A staged path from the current scan to a target body fat, holding muscle.
 * Returns the milestones a lifter actually feels: softer → lean → abs → shredded.
 */
export function pathToBodyFat(dexa, currentWeightKg, milestones = [20, 15, 12, 10]) {
  const current = currentBodyFat(dexa, currentWeightKg);
  return milestones
    .filter((m) => m < current)
    .map((pct) => {
      const w = weightAtBodyFat(dexa, pct);
      return { pct, weightKg: w, fatToLoseKg: currentWeightKg - w };
    });
}

const MALE_BF_BANDS = [
  [6, 'Competition lean'],
  [10, 'Shredded — clear six-pack'],
  [14, 'Athletic — abs visible'],
  [19, 'Fit'],
  [24, 'Average'],
  [30, 'Above average'],
  [100, 'High']
];
const FEMALE_BF_BANDS = [
  [16, 'Competition lean'],
  [20, 'Athletic — very defined'],
  [25, 'Fit'],
  [31, 'Average'],
  [37, 'Above average'],
  [100, 'High']
];

/** Plain-language label for a body-fat percentage. */
export function bodyFatBand(pct, sex = 'male') {
  const bands = sex === 'female' ? FEMALE_BF_BANDS : MALE_BF_BANDS;
  return (bands.find(([ceil]) => pct <= ceil) || bands[bands.length - 1])[1];
}

/**
 * Visceral fat context. DEXA reports it in pounds; these thresholds are the
 * commonly cited ranges where central fat starts carrying metabolic risk.
 */
export function visceralContext(lbs) {
  if (lbs < 1.0) return { level: 'low', note: 'Well within a healthy range.' };
  if (lbs < 2.0) return { level: 'moderate', note: 'Healthy range, but trending up — worth keeping an eye on.' };
  if (lbs < 3.0) return { level: 'elevated', note: 'Above ideal. A calorie deficit and steps bring this down fast.' };
  return { level: 'high', note: 'This is the fat most linked to metabolic risk. It responds quickly to a deficit.' };
}

/**
 * A/G (android-to-gynoid) ratio context. >1.0 means fat sits centrally (belly)
 * rather than on the hips — the pattern that hides abs and carries more risk.
 */
export function agContext(ratio, sex = 'male') {
  const high = sex === 'female' ? 1.0 : 1.0;
  if (ratio < 0.9) return { level: 'ideal', note: 'Fat is well distributed, not concentrated at the waist.' };
  if (ratio <= high) return { level: 'ok', note: 'Roughly balanced distribution.' };
  return { level: 'central', note: 'You store fat centrally — losing it is what uncovers the abs.' };
}

/** Epley one-rep-max estimate. */
export const epley1RM = (weight, reps) => (reps <= 1 ? weight : weight * (1 + reps / 30));

/* ── Units ─────────────────────────────────────────── */

export const kgToLb = (kg) => kg * 2.20462;
export const lbToKg = (lb) => lb / 2.20462;
export const cmToIn = (cm) => cm / 2.54;
export const inToCm = (i) => i * 2.54;

export function weightLabel(kg, units) {
  return units === 'imperial'
    ? `${Math.round(kgToLb(kg) * 10) / 10} lb`
    : `${Math.round(kg * 10) / 10} kg`;
}

export function heightLabel(cm, units) {
  if (units !== 'imperial') return `${Math.round(cm)} cm`;
  const total = cmToIn(cm);
  const ft = Math.floor(total / 12);
  const inch = Math.round(total - ft * 12);
  return `${ft}'${inch}"`;
}

/* ── Formatting ────────────────────────────────────── */

export const round = (n, d = 0) => {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
};

export const fmt = (n) => (Math.round(n) || 0).toLocaleString();

export function relativeDay(dateKey) {
  const today = new Date();
  const d = new Date(dateKey + 'T12:00:00');
  const diff = Math.round((today.setHours(12, 0, 0, 0) - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function mealSlotForNow() {
  const h = new Date().getHours();
  if (h < 10.5) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}
