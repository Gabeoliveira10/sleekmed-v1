/* ═══════════════════════════════════════════════════════
   onboarding.js — first-run profile setup
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey } from '../store.js';
import { ACTIVITY, GOALS, EXPERIENCE, computeTargets, lbToKg, kgToLb, inToCm, weightLabel } from '../calc.js';
import { generateProgram } from '../program.js';
import { $, esc, toast } from '../ui.js';

const EQUIPMENT = [
  { id: 'barbell', label: 'Barbell & rack', emoji: '🏋️' },
  { id: 'dumbbell', label: 'Dumbbells', emoji: '💪' },
  { id: 'machine', label: 'Machines', emoji: '⚙️' },
  { id: 'cable', label: 'Cables', emoji: '🔗' },
  { id: 'kettlebell', label: 'Kettlebells', emoji: '🔔' },
  { id: 'bodyweight', label: 'Bodyweight only', emoji: '🤸' }
];

const FOCUS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'glutes', 'core', 'cardio'];

const DIETS = [
  { id: 'omnivore', label: 'No restrictions', emoji: '🍽️' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  { id: 'keto', label: 'Low carb / keto', emoji: '🥓' },
  { id: 'mediterranean', label: 'Mediterranean', emoji: '🫒' }
];

let draft = null;
let step = 0;
let onDone = null;

const STEPS = ['welcome', 'basics', 'body', 'goal', 'training', 'equipment', 'diet', 'review'];

export function startOnboarding(done) {
  onDone = done;
  draft = structuredClone(get().profile);
  step = 0;
  $('#onboarding').hidden = false;
  $('#app').hidden = true;
  render();
}

function next() { step = Math.min(STEPS.length - 1, step + 1); render(); }
function back() { step = Math.max(0, step - 1); render(); }

function render() {
  const host = $('#onboardingInner');
  const name = STEPS[step];

  const progress = step > 0
    ? `<div class="ob-progress">${STEPS.slice(1).map((_, i) => `<span class="${i < step ? 'done' : ''}"></span>`).join('')}</div>`
    : '';

  host.innerHTML = progress + renderStep(name);
  host.scrollTop = 0;
  window.scrollTo(0, 0);
  bind(name, host);
}

function renderStep(name) {
  switch (name) {
    case 'welcome': return stepWelcome();
    case 'basics': return stepBasics();
    case 'body': return stepBody();
    case 'goal': return stepGoal();
    case 'training': return stepTraining();
    case 'equipment': return stepEquipment();
    case 'diet': return stepDiet();
    case 'review': return stepReview();
  }
}

/* ── Steps ─────────────────────────────────────────── */

function stepWelcome() {
  return `
    <div class="ob-hero fade-in">
      <div class="ob-logo">F</div>
      <h1>Forge</h1>
      <p>Your training, your food, your progress — in one place, with an AI coach that actually knows your numbers.</p>
    </div>
    <div class="ob-features">
      ${[
        ['🏋️', 'Training built for you', 'A program generated from your goal, experience, schedule, and the equipment you actually have.'],
        ['📸', 'Snap your food', 'Photograph a plate and get the calories and macros back, logged against your targets.'],
        ['🎯', 'Macros that adapt', 'Calorie and macro targets calculated from your body and goal, not a generic table.'],
        ['💬', 'A coach on call', 'Ask anything. It answers using your logged data, not guesses.']
      ].map(([e, t, d]) => `
        <div class="ob-feature">
          <div class="ob-feature-icon">${e}</div>
          <div><h4>${t}</h4><p>${d}</p></div>
        </div>`).join('')}
    </div>
    <button class="btn btn-primary btn-lg btn-block" data-next>Set up my plan</button>
    <p class="tiny dim center" style="margin-top:14px">Takes about 90 seconds. Everything is stored on this device.</p>`;
}

function stepBasics() {
  return `
    <div class="ob-step fade-in">
      <h2>First, the basics</h2>
      <p class="lede">Used to calculate your energy needs. Nothing leaves your device.</p>
      <div class="ob-body">
        <div class="field">
          <label for="obName">What should I call you?</label>
          <input class="input" id="obName" placeholder="Your name" value="${esc(draft.name)}" autocomplete="given-name"/>
        </div>
        <div class="field">
          <label>Biological sex <span class="hint">— affects the metabolic formula</span></label>
          <div class="option-grid" style="grid-template-columns:repeat(3,1fr)">
            ${['male', 'female', 'other'].map((s) => `
              <button class="option ${draft.sex === s ? 'selected' : ''}" data-sex="${s}" style="text-align:center">
                <span class="option-title" style="text-transform:capitalize">${s}</span>
              </button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label for="obAge">Age</label>
          <div class="input-group">
            <input class="input" id="obAge" type="number" inputmode="numeric" min="13" max="100" value="${draft.age}"/>
            <div class="input-suffix">years</div>
          </div>
        </div>
        <div class="field">
          <label>Units</label>
          <div class="segmented">
            <button class="${draft.units === 'metric' ? 'active' : ''}" data-units="metric">Metric (kg / cm)</button>
            <button class="${draft.units === 'imperial' ? 'active' : ''}" data-units="imperial">Imperial (lb / ft)</button>
          </div>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepBody() {
  const imperial = draft.units === 'imperial';
  const ft = Math.floor(draft.heightCm / 30.48);
  const inch = Math.round((draft.heightCm / 2.54) - ft * 12);
  return `
    <div class="ob-step fade-in">
      <h2>Your measurements</h2>
      <p class="lede">Be honest — the math only works if the inputs are real.</p>
      <div class="ob-body">
        <div class="field">
          <label>Height</label>
          ${imperial ? `
            <div class="input-group">
              <input class="input" id="obFt" type="number" inputmode="numeric" min="3" max="8" value="${ft}"/>
              <div class="input-suffix">ft</div>
              <input class="input" id="obIn" type="number" inputmode="numeric" min="0" max="11" value="${inch}"/>
              <div class="input-suffix">in</div>
            </div>` : `
            <div class="input-group">
              <input class="input" id="obHeight" type="number" inputmode="numeric" min="120" max="230" value="${Math.round(draft.heightCm)}"/>
              <div class="input-suffix">cm</div>
            </div>`}
        </div>
        <div class="field">
          <label>Current weight</label>
          <div class="input-group">
            <input class="input" id="obWeight" type="number" inputmode="decimal" step="0.1"
              value="${imperial ? Math.round(kgToLb(draft.weightKg)) : Math.round(draft.weightKg * 10) / 10}"/>
            <div class="input-suffix">${imperial ? 'lb' : 'kg'}</div>
          </div>
        </div>
        <div class="field">
          <label>How active are you outside of training?</label>
          <div class="option-grid one">
            ${Object.entries(ACTIVITY).map(([k, v]) => `
              <button class="option ${draft.activityLevel === k ? 'selected' : ''}" data-activity="${k}">
                <span class="option-title">${v.label}</span>
                <span class="option-desc">${v.desc}</span>
              </button>`).join('')}
          </div>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepGoal() {
  return `
    <div class="ob-step fade-in">
      <h2>What are you here for?</h2>
      <p class="lede">This sets your calorie direction and how protein is allocated.</p>
      <div class="ob-body">
        <div class="option-grid one">
          ${Object.entries(GOALS).map(([k, v]) => `
            <button class="option ${draft.goal === k ? 'selected' : ''}" data-goal="${k}">
              <span class="option-emoji">${v.emoji}</span>
              <span class="option-title">${v.label}</span>
              <span class="option-desc">${v.desc}</span>
            </button>`).join('')}
        </div>
        <div class="field" id="rateField" ${['lose', 'gain', 'recomp'].includes(draft.goal) ? '' : 'hidden'}>
          <label>How fast? <span class="hint">— slower is more sustainable and holds more muscle</span></label>
          <div class="option-grid" style="grid-template-columns:repeat(3,1fr)">
            ${[[0.25, 'Gradual'], [0.5, 'Steady'], [0.75, 'Aggressive']].map(([r, l]) => `
              <button class="option ${Math.abs(draft.rateKgPerWeek - r) < 0.01 ? 'selected' : ''}" data-rate="${r}" style="text-align:center">
                <span class="option-title">${l}</span>
                <span class="option-desc">${draft.units === 'imperial' ? `${(r * 2.2).toFixed(1)} lb` : `${r} kg`}/wk</span>
              </button>`).join('')}
          </div>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepTraining() {
  return `
    <div class="ob-step fade-in">
      <h2>How do you train?</h2>
      <p class="lede">This determines your split and how much volume each session carries.</p>
      <div class="ob-body">
        <div class="field">
          <label>Experience level</label>
          <div class="option-grid one">
            ${Object.entries(EXPERIENCE).map(([k, v]) => `
              <button class="option ${draft.experience === k ? 'selected' : ''}" data-exp="${k}">
                <span class="option-title">${v.label}</span>
                <span class="option-desc">${v.desc}</span>
              </button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label>Days per week you can train</label>
          <div class="chip-row">
            ${[2, 3, 4, 5, 6, 7].map((d) => `
              <button class="chip ${draft.daysPerWeek === d ? 'selected' : ''}" data-days="${d}">${d} days</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label>Time per session</label>
          <div class="chip-row">
            ${[30, 45, 60, 75, 90].map((m) => `
              <button class="chip ${draft.sessionMinutes === m ? 'selected' : ''}" data-mins="${m}">${m} min</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label>Anything you want to prioritize? <span class="hint">optional</span></label>
          <div class="chip-row">
            ${FOCUS.map((f) => `
              <button class="chip ${draft.focus.includes(f) ? 'selected' : ''}" data-focus="${f}" style="text-transform:capitalize">${f}</button>`).join('')}
          </div>
        </div>
        <div class="field">
          <label for="obLimits">Injuries or movements to avoid? <span class="hint">optional</span></label>
          <textarea class="textarea" id="obLimits" placeholder="e.g. bad left knee, no overhead pressing">${esc(draft.limitations)}</textarea>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepEquipment() {
  return `
    <div class="ob-step fade-in">
      <h2>What do you have access to?</h2>
      <p class="lede">Your program only uses equipment you select here.</p>
      <div class="ob-body">
        <div class="option-grid">
          ${EQUIPMENT.map((e) => `
            <button class="option ${draft.equipment.includes(e.id) ? 'selected' : ''}" data-equip="${e.id}">
              <span class="option-emoji">${e.emoji}</span>
              <span class="option-title">${e.label}</span>
            </button>`).join('')}
        </div>
        <div class="callout">
          <span class="callout-icon">💡</span>
          <span>Training at home with nothing? Pick <strong>Bodyweight only</strong> — you will get a program built entirely around it.</span>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepDiet() {
  return `
    <div class="ob-step fade-in">
      <h2>How do you eat?</h2>
      <p class="lede">Used for meal plans and AI food suggestions.</p>
      <div class="ob-body">
        <div class="option-grid">
          ${DIETS.map((d) => `
            <button class="option ${draft.dietStyle === d.id ? 'selected' : ''}" data-diet="${d.id}">
              <span class="option-emoji">${d.emoji}</span>
              <span class="option-title">${d.label}</span>
            </button>`).join('')}
        </div>
        <div class="field">
          <label for="obAllergies">Allergies or foods you will not eat <span class="hint">optional</span></label>
          <textarea class="textarea" id="obAllergies" placeholder="e.g. peanuts, shellfish, no mushrooms">${esc(draft.allergies)}</textarea>
        </div>
      </div>
      ${nav()}
    </div>`;
}

function stepReview() {
  const t = computeTargets(draft);
  return `
    <div class="ob-step fade-in">
      <h2>Here are your numbers</h2>
      <p class="lede">Calculated from your body, activity, and goal. You can change any of it later.</p>

      <div class="card" style="margin-bottom:16px">
        <div class="row" style="justify-content:space-around;text-align:center;margin-bottom:18px">
          <div>
            <div class="stat-value" style="font-size:30px;color:var(--accent)">${t.calories.toLocaleString()}</div>
            <div class="stat-label">kcal / day</div>
          </div>
          <div>
            <div class="stat-value" style="font-size:30px">${t.maintenance.toLocaleString()}</div>
            <div class="stat-label">maintenance</div>
          </div>
        </div>
        <div class="grid grid-3">
          ${[['Protein', t.protein, 'var(--protein)'], ['Carbs', t.carbs, 'var(--carbs)'], ['Fat', t.fat, 'var(--fat)']].map(([l, v, c]) => `
            <div style="text-align:center">
              <div class="stat-value" style="font-size:19px;color:${c}">${v}g</div>
              <div class="stat-label">${l}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="ob-summary">
          <div class="ob-summary-row"><span>Goal</span><span>${GOALS[draft.goal].label}</span></div>
          <div class="ob-summary-row"><span>Training</span><span>${draft.daysPerWeek} days · ${draft.sessionMinutes} min</span></div>
          <div class="ob-summary-row"><span>Experience</span><span>${EXPERIENCE[draft.experience].label}</span></div>
          <div class="ob-summary-row"><span>Weight</span><span>${weightLabel(draft.weightKg, draft.units)}</span></div>
          <div class="ob-summary-row"><span>Water target</span><span>${(t.waterMl / 1000).toFixed(1)} L</span></div>
          <div class="ob-summary-row"><span>Step target</span><span>${t.steps.toLocaleString()}</span></div>
        </div>
      </div>

      <button class="btn btn-primary btn-lg btn-block" data-finish>Build my program →</button>
      <button class="btn btn-ghost btn-block" data-back style="margin-top:10px">Back</button>
    </div>`;
}

function nav() {
  return `<div class="ob-nav">
    <button class="btn btn-ghost" data-back>Back</button>
    <button class="btn btn-primary" data-next>Continue</button>
  </div>`;
}

/* ── Binding ───────────────────────────────────────── */

function bind(name, host) {
  host.querySelector('[data-next]')?.addEventListener('click', () => { if (commit(name)) next(); });
  host.querySelector('[data-back]')?.addEventListener('click', back);
  host.querySelector('[data-finish]')?.addEventListener('click', finish);

  // Every option button re-renders the step, so capture any typed input first —
  // otherwise picking an option after typing silently discards what was typed.
  const pick = (attr, key) => {
    host.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      btn.addEventListener('click', () => {
        capture(name);
        const v = btn.dataset[attr];
        draft[key] = v === '' || isNaN(Number(v)) ? v : Number(v);
        render();
      });
    });
  };

  pick('sex', 'sex');
  pick('activity', 'activityLevel');
  pick('exp', 'experience');
  pick('days', 'daysPerWeek');
  pick('mins', 'sessionMinutes');
  pick('diet', 'dietStyle');
  pick('rate', 'rateKgPerWeek');

  host.querySelectorAll('[data-goal]').forEach((btn) => btn.addEventListener('click', () => {
    capture(name);
    draft.goal = btn.dataset.goal;
    if (draft.goal === 'lose' && !draft.rateKgPerWeek) draft.rateKgPerWeek = 0.5;
    render();
  }));

  host.querySelectorAll('[data-units]').forEach((btn) => btn.addEventListener('click', () => {
    capture(name);
    draft.units = btn.dataset.units;
    render();
  }));

  host.querySelectorAll('[data-equip]').forEach((btn) => btn.addEventListener('click', () => {
    capture(name);
    const id = btn.dataset.equip;
    if (id === 'bodyweight' && !draft.equipment.includes('bodyweight')) draft.equipment = ['bodyweight'];
    else if (draft.equipment.includes(id)) draft.equipment = draft.equipment.filter((e) => e !== id);
    else draft.equipment = [...draft.equipment.filter((e) => e !== 'bodyweight'), id];
    if (!draft.equipment.length) draft.equipment = ['bodyweight'];
    render();
  }));

  host.querySelectorAll('[data-focus]').forEach((btn) => btn.addEventListener('click', () => {
    capture(name);
    const f = btn.dataset.focus;
    draft.focus = draft.focus.includes(f) ? draft.focus.filter((x) => x !== f) : [...draft.focus, f];
    render();
  }));
}

/**
 * Read whatever the user has typed on this step into the draft, without
 * validating. Safe to call on every re-render.
 */
function capture(name) {
  const num = (id) => Number($(`#${id}`)?.value);

  if (name === 'basics') {
    if ($('#obName')) draft.name = $('#obName').value.trim();
    const age = num('obAge');
    if (age >= 13 && age <= 100) draft.age = age;
  }

  if (name === 'body') {
    if (draft.units === 'imperial') {
      if ($('#obFt')) draft.heightCm = inToCm((num('obFt') || 5) * 12 + (num('obIn') || 0));
      const lb = num('obWeight');
      if (lb > 0) draft.weightKg = lbToKg(lb);
    } else {
      const cm = num('obHeight');
      if (cm > 0) draft.heightCm = cm;
      const kg = num('obWeight');
      if (kg > 0) draft.weightKg = kg;
    }
  }

  if (name === 'training' && $('#obLimits')) draft.limitations = $('#obLimits').value.trim();
  if (name === 'diet' && $('#obAllergies')) draft.allergies = $('#obAllergies').value.trim();
}

/** Capture, then validate before advancing. Returns false to block the step. */
function commit(name) {
  capture(name);

  if (name === 'basics' && $('#obAge')) {
    const age = Number($('#obAge').value);
    if (!(age >= 13 && age <= 100)) { toast('Enter an age between 13 and 100', 'err'); return false; }
  }

  if (name === 'body') {
    if (!(draft.weightKg >= 30 && draft.weightKg <= 300)) { toast('That weight looks off — check it', 'err'); return false; }
    if (!(draft.heightCm >= 120 && draft.heightCm <= 230)) { toast('That height looks off — check it', 'err'); return false; }
  }

  return true;
}

function finish() {
  const targets = computeTargets(draft);
  const program = generateProgram(draft);

  update((s) => {
    s.profile = { ...draft, onboarded: true, createdAt: Date.now() };
    s.targets = { ...s.targets, ...targets, manual: false };
    s.program = program;
    if (!s.weights.length) s.weights.push({ date: todayKey(), kg: draft.weightKg });
  });

  $('#onboarding').hidden = true;
  $('#app').hidden = false;
  toast(`Program ready — ${program.name}`);
  onDone?.();
}
