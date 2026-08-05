/* ═══════════════════════════════════════════════════════
   ai.js — Claude integration (Anthropic Messages API)

   Transport note: this app is a build-free static PWA, so there is
   no bundler to install @anthropic-ai/sdk into. Calls therefore go
   over raw HTTPS with fetch().

   Two modes:
     1. Proxy (recommended)  — POST the request body to your own
        endpoint, which attaches the API key server-side.
     2. Direct browser call  — requires the caller's own API key in
        localStorage plus the `anthropic-dangerous-direct-browser-access`
        header. Convenient for personal use; the key is readable by
        anything running on the page, so never ship it to other users.
   ═══════════════════════════════════════════════════════ */

import { get } from './store.js';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
export const DEFAULT_MODEL = 'claude-opus-5';

export class AIError extends Error {
  constructor(message, { status = 0, kind = 'api' } = {}) {
    super(message);
    this.name = 'AIError';
    this.status = status;
    this.kind = kind;
  }
}

export function aiConfigured() {
  const s = get().settings;
  return Boolean(s.aiEnabled && (s.proxyUrl?.trim() || s.apiKey?.trim()));
}

export function aiMode() {
  const s = get().settings;
  if (!s.aiEnabled) return 'off';
  if (s.proxyUrl?.trim()) return 'proxy';
  if (s.apiKey?.trim()) return 'direct';
  return 'unconfigured';
}

/* ── Core request ──────────────────────────────────── */

async function callClaude(body, { signal } = {}) {
  const s = get().settings;
  const mode = aiMode();

  if (mode === 'off') throw new AIError('AI features are switched off in Settings.', { kind: 'config' });
  if (mode === 'unconfigured') {
    throw new AIError('Add an Anthropic API key (or a proxy URL) in Settings to use AI features.', { kind: 'config' });
  }

  const url = mode === 'proxy' ? s.proxyUrl.trim() : API_URL;
  const headers = { 'content-type': 'application/json' };

  if (mode === 'direct') {
    headers['x-api-key'] = s.apiKey.trim();
    headers['anthropic-version'] = API_VERSION;
    // Opt in to browser-originated calls; the API blocks them otherwise.
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const payload = { model: s.model || DEFAULT_MODEL, ...body };

  let res;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload), signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new AIError('Could not reach the model. Check your connection and try again.', { kind: 'network' });
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || '';
    } catch { /* body was not JSON */ }

    if (res.status === 401) throw new AIError('That API key was rejected. Check it in Settings.', { status: 401, kind: 'auth' });
    if (res.status === 429) throw new AIError('Rate limited. Wait a moment and try again.', { status: 429, kind: 'rate' });
    if (res.status >= 500) throw new AIError('The model service is having trouble. Try again shortly.', { status: res.status, kind: 'server' });
    throw new AIError(detail || `Request failed (${res.status}).`, { status: res.status });
  }

  const data = await res.json();

  // Safety classifiers can decline a request: HTTP 200 with stop_reason "refusal".
  // Check this before touching content — on a refusal it may be empty.
  if (data.stop_reason === 'refusal') {
    throw new AIError(
      'The model declined this request. Try rephrasing, or ask a different question.',
      { kind: 'refusal' }
    );
  }

  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  if (data.stop_reason === 'max_tokens') {
    console.warn('[forge] response hit max_tokens and may be truncated');
  }

  return { text, raw: data };
}

/** Ask for JSON matching a schema, and parse it. */
async function callStructured(body, schema, opts) {
  const { text } = await callClaude(
    {
      ...body,
      output_config: {
        ...(body.output_config || {}),
        format: { type: 'json_schema', schema }
      }
    },
    opts
  );
  try {
    return JSON.parse(text);
  } catch {
    throw new AIError('The model returned something unreadable. Try again.', { kind: 'parse' });
  }
}

/* ── Shared context builder ────────────────────────── */

function userContext() {
  const s = get();
  const p = s.profile;
  const t = s.targets;
  return [
    `Profile: ${p.age}y ${p.sex}, ${Math.round(p.heightCm)} cm, ${Math.round(p.weightKg)} kg.`,
    `Goal: ${p.goal}. Activity: ${p.activityLevel}. Training age: ${p.experience}, ${p.daysPerWeek} days/week.`,
    `Daily targets: ${t.calories} kcal, ${t.protein}g protein, ${t.carbs}g carbs, ${t.fat}g fat.`,
    p.dietStyle && p.dietStyle !== 'omnivore' ? `Diet style: ${p.dietStyle}.` : '',
    p.allergies?.trim() ? `Avoids: ${p.allergies.trim()}.` : '',
    p.limitations?.trim() ? `Injuries/limitations: ${p.limitations.trim()}.` : ''
  ].filter(Boolean).join(' ');
}

/* ═══════════ 1. Meal photo analysis ═══════════ */

const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    meal_name: { type: 'string', description: 'Short name for the whole plate, e.g. "Chicken burrito bowl"' },
    items: {
      type: 'array',
      description: 'Each distinct food visible in the photo',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          portion: { type: 'string', description: 'Estimated portion in plain language, e.g. "about 1.5 cups"' },
          grams: { type: 'number', description: 'Estimated edible weight in grams' },
          calories: { type: 'number' },
          protein_g: { type: 'number' },
          carbs_g: { type: 'number' },
          fat_g: { type: 'number' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
        },
        required: ['name', 'portion', 'grams', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'confidence'],
        additionalProperties: false
      }
    },
    total: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein_g: { type: 'number' },
        carbs_g: { type: 'number' },
        fat_g: { type: 'number' }
      },
      required: ['calories', 'protein_g', 'carbs_g', 'fat_g'],
      additionalProperties: false
    },
    coach_note: {
      type: 'string',
      description: 'Two sentences max, judging this meal against the stated daily targets and goal. Specific and practical, never preachy.'
    },
    uncertainty: {
      type: 'string',
      description: 'What could not be judged from the photo (hidden oil, sauces, cooking method). One sentence.'
    }
  },
  required: ['meal_name', 'items', 'total', 'coach_note', 'uncertainty'],
  additionalProperties: false
};

const MEAL_SYSTEM = `You estimate the nutritional content of a meal from a photograph for a fitness tracking app.

How to work:
- Identify every distinct food on the plate, including cooking oil and sauces you can infer from sheen, browning, or pooling.
- Use visible reference objects (plate diameter, fork, hand, can) to size portions. A dinner plate is ~27 cm; a standard fork is ~19 cm.
- Give one honest number per macro, not a range. Under-estimating hidden fat is the most common error in this task — do not do it.
- Set confidence per item: "high" for a clearly visible whole food, "medium" for a mixed dish, "low" for anything obscured or ambiguous.
- The total must equal the sum of the items.
- If the image contains no food, return an empty items array, zero totals, and say so in the uncertainty field.

Write the coach note against the user's actual targets — what this meal does to their remaining budget for the day, and what to eat next.`;

/**
 * @param {string} dataUrl  data: URL of the photo
 * @param {object} ctx      { remaining: {calories, protein, carbs, fat}, mealSlot }
 */
export async function analyzeMealPhoto(dataUrl, ctx = {}, opts = {}) {
  const { media_type, data } = splitDataUrl(dataUrl);

  const remaining = ctx.remaining
    ? `Remaining today before this meal: ${Math.round(ctx.remaining.calories)} kcal, ${Math.round(ctx.remaining.protein)}g protein, ${Math.round(ctx.remaining.carbs)}g carbs, ${Math.round(ctx.remaining.fat)}g fat.`
    : '';

  return callStructured(
    {
      max_tokens: 4000,
      output_config: { effort: 'medium' },
      system: MEAL_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type, data } },
            {
              type: 'text',
              text: `${userContext()}\n${remaining}\nThis is my ${ctx.mealSlot || 'meal'}. Estimate what is on the plate.`
            }
          ]
        }
      ]
    },
    MEAL_SCHEMA,
    opts
  );
}

/* ═══════════ 2. Describe-a-meal (no photo) ═══════════ */

export async function analyzeMealText(description, ctx = {}, opts = {}) {
  return callStructured(
    {
      max_tokens: 3000,
      output_config: { effort: 'low' },
      system: MEAL_SYSTEM.replace('from a photograph', 'from a written description'),
      messages: [
        {
          role: 'user',
          content: `${userContext()}\nI ate: ${description}\nBreak it into items and estimate the macros.`
        }
      ]
    },
    MEAL_SCHEMA,
    opts
  );
}

/* ═══════════ 3. Program generation ═══════════ */

const PROGRAM_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    split: { type: 'string', description: 'e.g. "Upper / Lower", "Push Pull Legs"' },
    rationale: { type: 'string', description: 'Two or three sentences on why this structure fits this person.' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          focus: { type: 'string' },
          exercises: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                sets: { type: 'number' },
                reps: { type: 'string', description: 'A range like "6-8", or a duration like "30s"' },
                rest_seconds: { type: 'number' },
                rpe: { type: 'number' },
                note: { type: 'string', description: 'One short cue' }
              },
              required: ['name', 'sets', 'reps', 'rest_seconds', 'rpe', 'note'],
              additionalProperties: false
            }
          }
        },
        required: ['name', 'focus', 'exercises'],
        additionalProperties: false
      }
    },
    progression: { type: 'string', description: 'How to add weight or reps week to week.' },
    notes: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'split', 'rationale', 'days', 'progression', 'notes'],
  additionalProperties: false
};

export async function generateAIProgram(profile, opts = {}) {
  const equip = profile.equipment?.join(', ') || 'bodyweight only';
  const focus = profile.focus?.length ? profile.focus.join(', ') : 'balanced development';

  return callStructured(
    {
      max_tokens: 8000,
      output_config: { effort: 'high' },
      system: `You are a strength coach writing a training program. Build the number of training days requested — no more, no less. Only prescribe exercises the person can perform with the equipment listed. Respect stated injuries by choosing pain-free variations of the same movement pattern rather than dropping the pattern. Order each session compound-first. Keep sessions inside the stated time budget, assuming roughly nine minutes per exercise including rest. Be specific: real exercise names, real numbers, one useful cue per movement.`,
      messages: [
        {
          role: 'user',
          content: `${userContext()}
Equipment available: ${equip}.
Session length: ${profile.sessionMinutes} minutes.
Priority muscle groups: ${focus}.
${profile.limitations?.trim() ? `Injuries/limitations: ${profile.limitations.trim()}.` : ''}

Write me a ${profile.daysPerWeek}-day per week program.`
        }
      ]
    },
    PROGRAM_SCHEMA,
    opts
  );
}

/* ═══════════ 4. Meal plan ═══════════ */

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    summary: { type: 'string', description: 'Two sentences on the approach.' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'string' },
          meals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                slot: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
                name: { type: 'string' },
                ingredients: { type: 'array', items: { type: 'string' }, description: 'Each with a quantity' },
                prep: { type: 'string', description: 'Two sentences of method, max' },
                calories: { type: 'number' },
                protein_g: { type: 'number' },
                carbs_g: { type: 'number' },
                fat_g: { type: 'number' }
              },
              required: ['slot', 'name', 'ingredients', 'prep', 'calories', 'protein_g', 'carbs_g', 'fat_g'],
              additionalProperties: false
            }
          },
          totals: {
            type: 'object',
            properties: {
              calories: { type: 'number' }, protein_g: { type: 'number' },
              carbs_g: { type: 'number' }, fat_g: { type: 'number' }
            },
            required: ['calories', 'protein_g', 'carbs_g', 'fat_g'],
            additionalProperties: false
          }
        },
        required: ['day', 'meals', 'totals'],
        additionalProperties: false
      }
    },
    grocery_list: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Produce, Protein, Dairy, Pantry, Frozen, Other' },
          item: { type: 'string' },
          quantity: { type: 'string' }
        },
        required: ['category', 'item', 'quantity'],
        additionalProperties: false
      }
    },
    prep_tips: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'summary', 'days', 'grocery_list', 'prep_tips'],
  additionalProperties: false
};

export async function generateMealPlan({ days = 3, style = '', budget = '' } = {}, opts = {}) {
  const t = get().targets;
  return callStructured(
    {
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      system: `You write practical meal plans for people who cook for themselves on weeknights.

Rules:
- Every day must land within 5% of the calorie target and within 10 g of the protein target.
- Repeat ingredients across days so the grocery list stays short and nothing spoils.
- Real portions with weights or standard measures, not "a serving of".
- Nothing that takes more than 25 minutes of hands-on time.
- Respect every stated allergy and diet restriction absolutely.
- Consolidate the grocery list: one line per ingredient with the total quantity for the whole plan.`,
      messages: [
        {
          role: 'user',
          content: `${userContext()}
${style ? `Cuisine preference: ${style}.` : ''}
${budget ? `Budget: ${budget}.` : ''}

Write me a ${days}-day meal plan hitting ${t.calories} kcal / ${t.protein}g protein per day, with a consolidated grocery list.`
        }
      ]
    },
    PLAN_SCHEMA,
    opts
  );
}

/* ═══════════ 5. Coach chat ═══════════ */

const COACH_SYSTEM = `You are the user's fitness and nutrition coach inside a tracking app. You can see their profile, targets, and recent activity.

How you talk:
- Direct and warm. Answer the question first, then give the reasoning if it matters.
- Concrete numbers over vague advice. "Add 20 g protein at breakfast" beats "try to eat more protein."
- Two to four short paragraphs at most, unless they ask for a full plan.
- Reference their actual logged data when it is relevant. Do not invent data you were not given.
- Never shame them about food or a missed session. Note the pattern, offer the next action.

Boundaries: you are not a doctor. For pain that persists, disordered eating, medication questions, or anything that sounds clinical, say plainly that this needs a professional and stop giving advice on it.`;

export async function coachChat(history, ctx = {}, opts = {}) {
  const s = get();
  const recentWorkouts = s.workoutLogs.slice(-5).map((w) => `${w.date}: ${w.dayName} (${w.entries?.length || 0} exercises)`).join('; ') || 'none logged yet';
  const t = s.targets;

  const situation = `${userContext()}
Today so far: ${Math.round(ctx.eaten?.calories || 0)} kcal, ${Math.round(ctx.eaten?.protein || 0)}g protein (targets ${t.calories} / ${t.protein}g).
Current weight trend: ${trendSummary(s.weights)}.
Recent workouts: ${recentWorkouts}.
Streak: ${ctx.streak || 0} days.`;

  const messages = [
    { role: 'user', content: `Here is my current situation. Keep it in mind for everything that follows.\n\n${situation}` },
    { role: 'assistant', content: 'Got it — I have your numbers. What do you want to work on?' },
    ...history.map((m) => ({ role: m.role, content: m.content }))
  ];

  const { text } = await callClaude(
    {
      max_tokens: 4000,
      output_config: { effort: 'low' },
      system: COACH_SYSTEM,
      messages
    },
    opts
  );
  return text;
}

/* ═══════════ 6. Daily briefing ═══════════ */

export async function dailyBriefing(ctx = {}, opts = {}) {
  const s = get();
  const { text } = await callClaude(
    {
      max_tokens: 700,
      output_config: { effort: 'low' },
      system: 'You write a two-sentence daily check-in for a fitness app. Sentence one: the single most useful observation from their data. Sentence two: one concrete action for today. No greeting, no sign-off, no emoji, no hedging.',
      messages: [
        {
          role: 'user',
          content: `${userContext()}
Streak: ${ctx.streak || 0} days. Workouts logged in the last 7 days: ${ctx.weekWorkouts || 0}.
Yesterday: ${Math.round(ctx.yesterday?.calories || 0)} kcal, ${Math.round(ctx.yesterday?.protein || 0)}g protein.
Weight trend: ${trendSummary(s.weights)}.
Next scheduled session: ${ctx.nextWorkout || 'unscheduled'}.`
        }
      ]
    },
    opts
  );
  return text.trim();
}

/* ── Helpers ───────────────────────────────────────── */

function trendSummary(weights) {
  if (weights.length < 2) return 'not enough data yet';
  const recent = weights.slice(-14);
  const delta = recent[recent.length - 1].kg - recent[0].kg;
  const dir = delta > 0.3 ? 'up' : delta < -0.3 ? 'down' : 'flat';
  return `${dir} ${Math.abs(delta).toFixed(1)} kg over the last ${recent.length} weigh-ins`;
}

function splitDataUrl(dataUrl) {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new AIError('That image could not be read.', { kind: 'input' });
  return { media_type: match[1], data: match[2] };
}

/**
 * Downscale + re-encode an image before sending it. Keeps requests small and
 * fast without meaningfully hurting the model's portion estimates.
 */
export function compressImage(file, maxEdge = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new AIError('Could not read that file.', { kind: 'input' }));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new AIError('That file is not a readable image.', { kind: 'input' }));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
