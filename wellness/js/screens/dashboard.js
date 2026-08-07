/* ═══════════════════════════════════════════════════════
   dashboard.js — "Today" home screen
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey, daysAgoKey, dayTotals, computeStreak, activeDays } from '../store.js';
import { greeting, fmt, weightLabel, relativeDay } from '../calc.js';
import { nextProgramDay } from '../program.js';
import { quoteOfDay, AFFIRMATIONS } from '../data/quotes.js';
import { ring, macroBar, barChart, esc, icon, toast, openSheet, closeSheet } from '../ui.js';
import { aiConfigured, dailyBriefing } from '../ai.js';

let briefingCache = { date: null, text: null };

export function render(nav) {
  const s = get();
  const t = s.targets;
  const eaten = dayTotals();
  const streak = computeStreak();
  const p = s.profile;
  const remaining = Math.max(0, t.calories - eaten.calories);
  const pct = t.calories ? eaten.calories / t.calories : 0;
  const next = nextProgramDay(s.program, s.workoutLogs);
  const didWorkoutToday = s.workoutLogs.some((w) => w.date === todayKey());
  const waterToday = s.water[todayKey()] || 0;
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  return `
    <div class="stack fade-in">

      <!-- Calorie hero -->
      <section class="card hero-card">
        <div class="row-between" style="margin-bottom:18px">
          <div>
            <div class="greeting">${greeting()}${p.name ? ',' : ''}</div>
            <div class="greeting-name">${esc(p.name || 'Let\'s go')}</div>
          </div>
          <div class="streak-pill">
            <span class="streak-flame">🔥</span><span>${streak}</span>
          </div>
        </div>

        <div class="calorie-summary">
          ${ring({
            pct,
            size: 146,
            value: fmt(remaining),
            label: pct > 1 ? 'over' : 'left',
            color: 'var(--calories)'
          })}
          <div class="calorie-macros">
            ${macroBar('Protein', eaten.protein, t.protein, 'var(--protein)')}
            ${macroBar('Carbs', eaten.carbs, t.carbs, 'var(--carbs)')}
            ${macroBar('Fat', eaten.fat, t.fat, 'var(--fat)')}
            <div class="row-between tiny dim" style="margin-top:2px">
              <span>${fmt(eaten.calories)} eaten</span>
              <span>${fmt(t.calories)} target</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick actions -->
      <div class="quick-actions">
        <button class="quick-action" data-go="snap">
          <span class="quick-action-icon">📸</span><span>Snap food</span>
        </button>
        <button class="quick-action" data-go="nutrition">
          <span class="quick-action-icon">🍽️</span><span>Log meal</span>
        </button>
        <button class="quick-action" data-go="workouts">
          <span class="quick-action-icon">🏋️</span><span>Train</span>
        </button>
        <button class="quick-action" data-act="weigh">
          <span class="quick-action-icon">⚖️</span><span>Weigh in</span>
        </button>
      </div>

      <!-- Today's training -->
      <section class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Today's training</div>
            <div class="card-sub">${s.program ? esc(s.program.name) : 'No program yet'}</div>
          </div>
          ${didWorkoutToday ? '<span class="badge badge-accent">Done ✓</span>' : ''}
        </div>
        ${next ? `
          <div class="today-workout">
            <div class="today-workout-icon">${didWorkoutToday ? '✅' : '🏋️'}</div>
            <div class="grow">
              <div style="font-weight:650;font-size:15px">${esc(next.name)}</div>
              <div class="tiny dim" style="margin-top:2px">${next.exercises.length} exercises · ~${Math.round(next.exercises.length * 9)} min</div>
            </div>
            <button class="btn ${didWorkoutToday ? 'btn-ghost' : 'btn-primary'} btn-sm" data-go="workouts">
              ${didWorkoutToday ? 'View' : 'Start'}
            </button>
          </div>` : `
          <div class="empty" style="padding:18px 0">
            <p>Generate a training program tuned to your goal and equipment.</p>
            <button class="btn btn-primary btn-sm" data-go="workouts">Build my program</button>
          </div>`}
      </section>

      <!-- AI briefing -->
      <section class="card" id="briefingCard">
        <div class="card-head">
          <div class="card-title">${icon('spark', 16)} Coach's read</div>
          ${aiConfigured() ? '<button class="btn btn-ghost btn-sm" data-act="refresh-brief">Refresh</button>' : ''}
        </div>
        <div id="briefingBody">
          ${aiConfigured()
            ? `<div class="row" style="gap:10px"><div class="spinner"></div><span class="small dim">Reading your week…</span></div>`
            : `<p class="small muted" style="line-height:1.6">${esc(affirmation)}</p>
               <button class="btn btn-ghost btn-sm" data-go="profile" style="margin-top:12px">Turn on AI coaching</button>`}
        </div>
      </section>

      <!-- Stats row -->
      <div class="grid grid-4">
        ${statTile('Weight', weightLabel(latest(s), p.units), weightDelta(s), 'scale')}
        ${statTile('Workouts', `${weekWorkouts(s)}<small>/wk</small>`, null)}
        ${statTile('Water', `${(waterToday / 1000).toFixed(1)}<small>L</small>`, null)}
        ${statTile('Streak', `${streak}<small>d</small>`, null)}
      </div>

      <!-- Week of calories -->
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Last 7 days</div><div class="card-sub">Calories vs target</div></div>
        </div>
        ${barChart(weekCalories(s), { target: t.calories, height: 140 })}
      </section>

      <!-- Consistency -->
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Consistency</div><div class="card-sub">Last 28 days — a day counts if you logged food or a workout</div></div>
        </div>
        <div class="streak-grid">
          ${activeDays(28).map((d, i, arr) => `
            <div class="streak-cell ${d.food || d.workout ? 'hit' : ''} ${i === arr.length - 1 ? 'today' : ''}"
                 title="${d.key}">${d.workout ? '🏋️' : d.food ? '·' : ''}</div>`).join('')}
        </div>
      </section>

      <!-- Quote -->
      <section class="card quote-card">
        <div class="quote-mark">"</div>
        <div class="quote-text">${esc(quoteOfDay(todayKey()).text)}</div>
        <div class="quote-author">— ${esc(quoteOfDay(todayKey()).author)}</div>
      </section>
    </div>`;
}

export function mount(host, nav) {
  host.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.go)));
  host.querySelector('[data-act="weigh"]')?.addEventListener('click', () => openWeighIn(nav));
  host.querySelector('[data-act="refresh-brief"]')?.addEventListener('click', () => loadBriefing(host, true));
  if (aiConfigured()) loadBriefing(host, false);
}

/* ── Briefing ──────────────────────────────────────── */

async function loadBriefing(host, force) {
  const body = host.querySelector('#briefingBody');
  if (!body) return;

  if (!force && briefingCache.date === todayKey() && briefingCache.text) {
    body.innerHTML = `<p class="small" style="line-height:1.65">${esc(briefingCache.text)}</p>`;
    return;
  }

  const s = get();
  try {
    const text = await dailyBriefing({
      streak: computeStreak(),
      weekWorkouts: weekWorkouts(s),
      yesterday: dayTotals(daysAgoKey(1)),
      nextWorkout: nextProgramDay(s.program, s.workoutLogs)?.name
    });
    briefingCache = { date: todayKey(), text };
    body.innerHTML = `<p class="small" style="line-height:1.65">${esc(text)}</p>`;
  } catch (err) {
    body.innerHTML = `<p class="small dim">${esc(err.message)}</p>`;
  }
}

/* ── Weigh-in sheet ────────────────────────────────── */

export function openWeighIn(nav) {
  const s = get();
  const imperial = s.profile.units === 'imperial';
  const current = latest(s);
  const shown = imperial ? Math.round(current * 2.20462 * 10) / 10 : Math.round(current * 10) / 10;

  openSheet('Log your weight', `
    <div class="field" style="margin-bottom:18px">
      <label>Today's weight</label>
      <div class="input-group">
        <input class="input" id="weighValue" type="number" inputmode="decimal" step="0.1" value="${shown}"
          style="font-size:24px;font-weight:700;text-align:center" autofocus/>
        <div class="input-suffix">${imperial ? 'lb' : 'kg'}</div>
      </div>
      <span class="hint">Weigh at the same time each day — first thing, after the bathroom, before food.</span>
    </div>
    <button class="btn btn-primary btn-block" id="weighSave">Save</button>
  `, (body) => {
    const input = body.querySelector('#weighValue');
    setTimeout(() => { input.focus(); input.select(); }, 60);
    body.querySelector('#weighSave').onclick = () => {
      const v = Number(input.value);
      if (!v || v <= 0) { toast('Enter a valid weight', 'err'); return; }
      const kg = imperial ? v / 2.20462 : v;
      if (kg < 25 || kg > 350) { toast('That weight looks off', 'err'); return; }
      update((st) => {
        const existing = st.weights.find((w) => w.date === todayKey());
        if (existing) existing.kg = kg;
        else st.weights.push({ date: todayKey(), kg });
        st.weights.sort((a, b) => a.date.localeCompare(b.date));
        st.profile.weightKg = kg;
      });
      closeSheet();
      toast('Weight logged');
      nav?.(null);   // re-render current screen
    };
  });
}

/* ── Small helpers ─────────────────────────────────── */

function statTile(label, value, delta, iconName) {
  return `
    <div class="stat">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${value}</div>
      ${delta ? `<div class="stat-delta ${delta.dir}">${esc(delta.text)}</div>` : ''}
    </div>`;
}

const latest = (s) => (s.weights.length ? s.weights[s.weights.length - 1].kg : s.profile.weightKg);

function weightDelta(s) {
  if (s.weights.length < 2) return null;
  const recent = s.weights.slice(-8);
  const diff = recent[recent.length - 1].kg - recent[0].kg;
  const imperial = s.profile.units === 'imperial';
  const shown = imperial ? diff * 2.20462 : diff;
  if (Math.abs(shown) < 0.15) return { dir: 'flat', text: 'holding steady' };

  // Is the trend moving the way this goal wants it to?
  const goingRightWay = {
    lose: diff < 0,
    gain: diff > 0,
    recomp: diff <= 0.5,        // flat or slightly down is the point of a recomp
    maintain: Math.abs(diff) < 1,
    perform: true               // scale weight is not the scoreboard here
  }[s.profile.goal] ?? true;

  return {
    dir: goingRightWay ? 'up' : 'down',
    text: `${shown > 0 ? '+' : ''}${shown.toFixed(1)} ${imperial ? 'lb' : 'kg'}`
  };
}

function weekWorkouts(s) {
  const cutoff = daysAgoKey(6);
  return s.workoutLogs.filter((w) => w.date >= cutoff).length;
}

function weekCalories(s) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const key = daysAgoKey(i);
    const total = (s.foodLogs[key] || []).reduce((a, f) => a + (f.kcal || 0), 0);
    const d = new Date(key + 'T12:00:00');
    out.push({ x: key, label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), y: total });
  }
  return out;
}
