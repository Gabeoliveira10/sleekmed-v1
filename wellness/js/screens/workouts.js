/* ═══════════════════════════════════════════════════════
   workouts.js — program view, live workout logger, history
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey, uid } from '../store.js';
import { generateProgram, nextProgramDay, lastPerformance, personalBest, workoutVolume } from '../program.js';
import { findExercise, searchExercises } from '../data/exercises.js';
import { relativeDay, weightLabel, fmt, epley1RM } from '../calc.js';
import { esc, icon, toast, openSheet, closeSheet, confirmSheet, lineChart, debounce } from '../ui.js';
import { aiConfigured, generateAIProgram } from '../ai.js';

let view = 'program';          // program | active | history
let restTimer = null;
let restInterval = null;

export function render(nav) {
  const s = get();
  if (s.activeWorkout) view = 'active';

  return `
    <div class="fade-in">
      ${view !== 'active' ? `
        <div class="segmented" style="margin-bottom:18px">
          <button class="${view === 'program' ? 'active' : ''}" data-view="program">Program</button>
          <button class="${view === 'history' ? 'active' : ''}" data-view="history">History</button>
        </div>` : ''}
      ${view === 'active' ? renderActive(s) : view === 'history' ? renderHistory(s) : renderProgram(s)}
    </div>`;
}

/* ═══════════ PROGRAM VIEW ═══════════ */

function renderProgram(s) {
  if (!s.program) {
    return `
      <div class="card">
        <div class="empty">
          <div class="empty-icon">🗺️</div>
          <h4>No program yet</h4>
          <p>Build a split from your goal, experience, schedule and available equipment.</p>
          <button class="btn btn-primary" data-act="generate">Generate program</button>
        </div>
      </div>`;
  }

  const next = nextProgramDay(s.program, s.workoutLogs);

  return `
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div>
            <div class="card-title">${esc(s.program.name)}</div>
            <div class="card-sub">${s.program.daysPerWeek} days/week · ${s.program.source === 'ai' ? 'AI-designed' : 'rule-based'}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="regen">Rebuild</button>
        </div>
        ${s.program.rationale ? `<p class="small muted" style="line-height:1.6;margin-bottom:14px">${esc(s.program.rationale)}</p>` : ''}
        ${next ? `
          <button class="today-workout" data-start="${esc(next.id)}" style="width:100%;text-align:left">
            <div class="today-workout-icon">▶</div>
            <div class="grow">
              <div class="tiny dim">Up next</div>
              <div style="font-weight:650;font-size:15px">${esc(next.name)}</div>
            </div>
            <span class="badge badge-accent">Start</span>
          </button>` : ''}
      </section>

      ${s.program.days.map((day, i) => `
        <section class="card card-tight">
          <button class="row-between" data-toggle-day="${i}" style="width:100%;text-align:left">
            <div>
              <div style="font-weight:650;font-size:14.5px">${esc(day.name)}</div>
              <div class="tiny dim">${day.exercises.length} exercises</div>
            </div>
            <div class="row" style="gap:8px">
              <button class="btn btn-ghost btn-sm" data-start="${esc(day.id)}">Start</button>
              <span class="dim" data-chevron="${i}">▾</span>
            </div>
          </button>
          <div data-day-body="${i}" hidden style="margin-top:12px;border-top:1px solid var(--hairline);padding-top:12px">
            ${day.exercises.map((ex, j) => {
              const meta = findExercise(ex.exerciseId);
              const pb = personalBest(ex.exerciseId, s.workoutLogs);
              return `
                <div class="row" style="padding:9px 0;border-bottom:1px solid var(--hairline);align-items:flex-start">
                  <span class="exercise-num" style="margin-top:1px">${j + 1}</span>
                  <div class="grow">
                    <div style="font-weight:600;font-size:14px">${esc(ex.name)}</div>
                    <div class="tiny dim">${ex.sets} × ${esc(ex.reps)} · rest ${ex.restSeconds}s${ex.rpe ? ` · RPE ${ex.rpe}` : ''}</div>
                    ${meta.tip ? `<div class="tiny dim" style="margin-top:3px;font-style:italic">${esc(meta.tip)}</div>` : ''}
                  </div>
                  ${pb ? `<div class="tiny" style="color:var(--warn);white-space:nowrap">PB ${weightLabel(pb.weight, s.profile.units)}</div>` : ''}
                </div>`;
            }).join('')}
          </div>
        </section>`).join('')}

      ${s.program.notes?.length ? `
        <section class="card">
          <div class="card-head"><div class="card-title">How to run this</div></div>
          <div class="stack-sm">
            ${s.program.notes.map((n) => `<div class="callout"><span class="callout-icon">→</span><span>${esc(n)}</span></div>`).join('')}
          </div>
        </section>` : ''}
    </div>`;
}

/* ═══════════ ACTIVE WORKOUT ═══════════ */

function renderActive(s) {
  const w = s.activeWorkout;
  const done = w.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);
  const total = w.entries.reduce((n, e) => n + e.sets.length, 0);
  const volume = w.entries.reduce((n, e) => n + e.sets.reduce((v, set) => v + (set.done ? (set.weight || 0) * (set.reps || 0) : 0), 0), 0);
  const elapsed = Math.floor((Date.now() - w.startedAt) / 60000);

  return `
    <div class="stack">
      <section class="card">
        <div class="row-between" style="margin-bottom:14px">
          <div>
            <div class="tiny dim">In progress</div>
            <div class="card-title" style="font-size:18px">${esc(w.dayName)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="abandon">Discard</button>
        </div>
        <div class="grid grid-3">
          <div><div class="stat-label">Sets</div><div class="stat-value" style="font-size:19px">${done}<small>/${total}</small></div></div>
          <div><div class="stat-label">Volume</div><div class="stat-value" style="font-size:19px">${fmt(volume)}<small>${s.profile.units === 'imperial' ? 'lb' : 'kg'}</small></div></div>
          <div><div class="stat-label">Elapsed</div><div class="stat-value" style="font-size:19px">${elapsed}<small>min</small></div></div>
        </div>
        <div class="bar" style="margin-top:14px"><div class="bar-fill" style="width:${total ? (done / total) * 100 : 0}%;background:var(--accent)"></div></div>
      </section>

      <div>
        ${w.entries.map((entry, i) => renderExerciseCard(entry, i, s)).join('')}
      </div>

      <button class="btn btn-ghost btn-block" data-act="add-exercise">${icon('plus', 16)} Add exercise</button>
      <button class="btn btn-primary btn-block btn-lg" data-act="finish">Finish workout</button>
    </div>`;
}

function renderExerciseCard(entry, i, s) {
  const meta = findExercise(entry.exerciseId);
  const last = lastPerformance(entry.exerciseId, s.workoutLogs);
  const pb = personalBest(entry.exerciseId, s.workoutLogs);
  const allDone = entry.sets.length && entry.sets.every((x) => x.done);
  const unit = s.profile.units === 'imperial' ? 'lb' : 'kg';
  const open = entry.open !== false;

  return `
    <div class="exercise-card ${allDone ? 'complete' : ''}">
      <button class="exercise-head" data-toggle-ex="${i}">
        <span class="exercise-num">${allDone ? '✓' : i + 1}</span>
        <div class="grow">
          <div class="exercise-name">${esc(entry.name)}</div>
          <div class="exercise-meta">
            ${entry.targetSets} × ${esc(entry.targetReps)}
            ${last ? ` · last: ${last.weight}${unit} × ${last.reps}` : ' · first time'}
            ${pb ? ` · <span class="pr-flag">★ PB ${pb.weight}${unit}</span>` : ''}
          </div>
        </div>
        <span class="dim">${open ? '▾' : '▸'}</span>
      </button>
      <div class="exercise-body" ${open ? '' : 'hidden'}>
        <div class="set-row set-row-head">
          <span style="text-align:center">#</span><span>Weight (${unit})</span><span>Reps</span><span></span>
        </div>
        ${entry.sets.map((set, j) => `
          <div class="set-row">
            <span class="set-num">${j + 1}</span>
            <input class="set-input" type="number" inputmode="decimal" step="0.5"
              value="${set.weight ?? ''}" placeholder="${last ? last.weight : '—'}"
              data-set-w="${i}-${j}"/>
            <input class="set-input" type="number" inputmode="numeric"
              value="${set.reps ?? ''}" placeholder="${last ? last.reps : entry.targetReps.split('-')[0]}"
              data-set-r="${i}-${j}"/>
            <button class="set-check ${set.done ? 'done' : ''}" data-set-done="${i}-${j}" aria-label="Complete set">
              ${icon('check', 15)}
            </button>
          </div>`).join('')}
        <div class="row" style="gap:8px;margin-top:10px">
          <button class="btn btn-ghost btn-sm" data-add-set="${i}">+ Set</button>
          ${entry.sets.length > 1 ? `<button class="btn btn-ghost btn-sm" data-rm-set="${i}">− Set</button>` : ''}
          <button class="btn btn-ghost btn-sm" data-swap="${i}">Swap</button>
          <button class="btn btn-ghost btn-sm" data-rm-ex="${i}" style="margin-left:auto;color:var(--danger)">Remove</button>
        </div>
        ${meta.tip ? `<div class="tiny dim" style="margin-top:10px;font-style:italic">💡 ${esc(meta.tip)}</div>` : ''}
      </div>
    </div>`;
}

/* ═══════════ HISTORY ═══════════ */

function renderHistory(s) {
  if (!s.workoutLogs.length) {
    return `<div class="card"><div class="empty">
      <div class="empty-icon">📋</div><h4>No workouts logged</h4>
      <p>Finish a session and it will show up here with volume, PRs, and trends.</p>
    </div></div>`;
  }

  const logs = [...s.workoutLogs].reverse();
  const unit = s.profile.units === 'imperial' ? 'lb' : 'kg';
  const volumePoints = s.workoutLogs.slice(-20).map((w) => ({
    x: new Date(w.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    y: workoutVolume(w)
  }));

  return `
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Total volume per session</div><div class="card-sub">Last ${volumePoints.length} workouts (${unit})</div></div>
        </div>
        ${lineChart(volumePoints, { color: 'var(--protein)', yLabel: 'Workout volume' })}
      </section>

      <div class="grid grid-3">
        <div class="stat"><div class="stat-label">Sessions</div><div class="stat-value">${s.workoutLogs.length}</div></div>
        <div class="stat"><div class="stat-label">Lifetime volume</div><div class="stat-value" style="font-size:18px">${fmt(s.workoutLogs.reduce((a, w) => a + workoutVolume(w), 0))}<small>${unit}</small></div></div>
        <div class="stat"><div class="stat-label">Avg length</div><div class="stat-value">${Math.round(s.workoutLogs.reduce((a, w) => a + (w.durationMin || 0), 0) / s.workoutLogs.length)}<small>min</small></div></div>
      </div>

      <section class="card">
        <div class="card-head"><div class="card-title">Recent sessions</div></div>
        <div class="list">
          ${logs.slice(0, 30).map((w) => `
            <button class="list-item" data-log="${esc(w.id)}">
              <div class="thumb">🏋️</div>
              <div class="list-item-main">
                <div class="list-item-title">${esc(w.dayName)}</div>
                <div class="list-item-sub">${relativeDay(w.date)} · ${w.entries.length} exercises · ${w.durationMin} min</div>
              </div>
              <div class="list-item-end">
                <div class="list-item-value">${fmt(workoutVolume(w))}</div>
                <div class="tiny dim">${unit} volume</div>
              </div>
            </button>`).join('')}
        </div>
      </section>
    </div>`;
}

/* ═══════════ MOUNT / EVENTS ═══════════ */

export function mount(host, nav) {
  const s = get();

  host.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view; nav(null);
  }));

  host.querySelector('[data-act="generate"]')?.addEventListener('click', () => openGenerateSheet(nav));
  host.querySelector('[data-act="regen"]')?.addEventListener('click', () => openGenerateSheet(nav));

  host.querySelectorAll('[data-toggle-day]').forEach((b) => b.addEventListener('click', (e) => {
    if (e.target.closest('[data-start]')) return;
    const i = b.dataset.toggleDay;
    const body = host.querySelector(`[data-day-body="${i}"]`);
    const chev = host.querySelector(`[data-chevron="${i}"]`);
    body.hidden = !body.hidden;
    chev.textContent = body.hidden ? '▾' : '▴';
  }));

  host.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    startWorkout(b.dataset.start, nav);
  }));

  // Active workout wiring
  host.querySelectorAll('[data-toggle-ex]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.toggleEx);
    update((st) => { st.activeWorkout.entries[i].open = st.activeWorkout.entries[i].open === false; });
    nav(null);
  }));

  host.querySelectorAll('[data-set-w]').forEach((input) => {
    input.addEventListener('change', () => {
      const [i, j] = input.dataset.setW.split('-').map(Number);
      update((st) => { st.activeWorkout.entries[i].sets[j].weight = input.value === '' ? null : Number(input.value); });
    });
  });

  host.querySelectorAll('[data-set-r]').forEach((input) => {
    input.addEventListener('change', () => {
      const [i, j] = input.dataset.setR.split('-').map(Number);
      update((st) => { st.activeWorkout.entries[i].sets[j].reps = input.value === '' ? null : Number(input.value); });
    });
  });

  host.querySelectorAll('[data-set-done]').forEach((b) => b.addEventListener('click', () => {
    const [i, j] = b.dataset.setDone.split('-').map(Number);
    const st = get();
    const entry = st.activeWorkout.entries[i];
    const set = entry.sets[j];

    // Auto-fill from the row's inputs, then from last session, so a tap is enough
    const wInput = host.querySelector(`[data-set-w="${i}-${j}"]`);
    const rInput = host.querySelector(`[data-set-r="${i}-${j}"]`);
    const last = lastPerformance(entry.exerciseId, st.workoutLogs);

    update((draft) => {
      const target = draft.activeWorkout.entries[i].sets[j];
      target.done = !set.done;
      if (target.done) {
        target.weight = Number(wInput?.value) || set.weight || last?.weight || 0;
        target.reps = Number(rInput?.value) || set.reps || last?.reps || Number(entry.targetReps.split('-')[0]) || 8;
      }
    });

    if (!set.done) {
      const pb = personalBest(entry.exerciseId, st.workoutLogs);
      const w = Number(wInput?.value) || last?.weight || 0;
      if (pb && w > pb.weight) toast(`New PB on ${entry.name} — ${w}!`);
      startRest(entry.restSeconds || st.settings.restSeconds, nav);
    }
    nav(null);
  }));

  host.querySelectorAll('[data-add-set]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.addSet);
    update((st) => { st.activeWorkout.entries[i].sets.push({ weight: null, reps: null, done: false }); });
    nav(null);
  }));

  host.querySelectorAll('[data-rm-set]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.rmSet);
    update((st) => { st.activeWorkout.entries[i].sets.pop(); });
    nav(null);
  }));

  host.querySelectorAll('[data-rm-ex]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.rmEx);
    update((st) => { st.activeWorkout.entries.splice(i, 1); });
    nav(null);
  }));

  host.querySelectorAll('[data-swap]').forEach((b) => b.addEventListener('click', () => {
    openExercisePicker((ex) => {
      const i = Number(b.dataset.swap);
      update((st) => {
        const entry = st.activeWorkout.entries[i];
        entry.exerciseId = ex.id;
        entry.name = ex.name;
      });
      closeSheet();
      toast(`Swapped to ${ex.name}`);
      nav(null);
    });
  }));

  host.querySelector('[data-act="add-exercise"]')?.addEventListener('click', () => {
    openExercisePicker((ex) => {
      update((st) => {
        st.activeWorkout.entries.push({
          exerciseId: ex.id, name: ex.name, targetSets: 3, targetReps: '8-12',
          restSeconds: 90, open: true,
          sets: Array.from({ length: 3 }, () => ({ weight: null, reps: null, done: false }))
        });
      });
      closeSheet();
      nav(null);
    });
  });

  host.querySelector('[data-act="finish"]')?.addEventListener('click', () => finishWorkout(nav));
  host.querySelector('[data-act="abandon"]')?.addEventListener('click', async () => {
    if (await confirmSheet('Discard workout?', 'Everything logged in this session will be lost.', 'Discard')) {
      update((st) => { st.activeWorkout = null; });
      stopRest();
      view = 'program';
      nav(null);
    }
  });

  host.querySelectorAll('[data-log]').forEach((b) => b.addEventListener('click', () => showLogDetail(b.dataset.log)));
}

/* ── Workout lifecycle ─────────────────────────────── */

function startWorkout(dayId, nav) {
  const s = get();
  const day = s.program?.days.find((d) => d.id === dayId) || s.program?.days[0];
  if (!day) return;

  if (s.activeWorkout) {
    toast('Finish or discard the workout in progress first', 'err');
    view = 'active';
    nav(null);
    return;
  }

  update((st) => {
    st.activeWorkout = {
      id: uid(),
      dayId: day.id,
      dayName: day.name,
      startedAt: Date.now(),
      entries: day.exercises.map((ex, i) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        targetSets: ex.sets,
        targetReps: ex.reps,
        restSeconds: ex.restSeconds,
        open: i === 0,
        sets: Array.from({ length: ex.sets }, () => ({ weight: null, reps: null, done: false }))
      }))
    };
  });
  view = 'active';
  nav(null);
}

async function finishWorkout(nav) {
  const s = get();
  const w = s.activeWorkout;
  const completed = w.entries.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);

  if (!completed) {
    if (!(await confirmSheet('Nothing logged', 'No sets were marked complete. Save this workout anyway?', 'Save empty'))) return;
  }

  const durationMin = Math.max(1, Math.round((Date.now() - w.startedAt) / 60000));
  const entries = w.entries.map((e) => ({
    exerciseId: e.exerciseId,
    name: e.name,
    sets: e.sets.filter((x) => x.done).map((x) => ({ weight: x.weight || 0, reps: x.reps || 0, done: true }))
  })).filter((e) => e.sets.length);

  const log = { id: w.id, date: todayKey(), dayId: w.dayId, dayName: w.dayName, durationMin, entries, finishedAt: Date.now() };

  update((st) => { st.workoutLogs.push(log); st.activeWorkout = null; });
  stopRest();
  view = 'program';

  const vol = workoutVolume(log);
  toast(`${w.dayName} logged — ${completed} set${completed === 1 ? '' : 's'}, ${fmt(vol)} total volume`);
  nav(null);
}

/* ── Rest timer ────────────────────────────────────── */

function startRest(seconds, nav) {
  stopRest();
  let left = seconds || 90;
  const el = document.createElement('div');
  el.className = 'rest-timer';
  el.id = 'restTimer';
  el.innerHTML = `
    <span class="rest-time" id="restTime">${format(left)}</span>
    <div class="row" style="gap:6px">
      <button class="btn btn-ghost btn-sm" data-rest="-15">−15</button>
      <button class="btn btn-ghost btn-sm" data-rest="+15">+15</button>
      <button class="btn btn-ghost btn-sm" data-rest="skip">Skip</button>
    </div>`;
  document.body.appendChild(el);
  restTimer = el;

  el.querySelectorAll('[data-rest]').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.rest;
    if (v === 'skip') return stopRest();
    left = Math.max(5, left + Number(v));
    el.querySelector('#restTime').textContent = format(left);
  }));

  restInterval = setInterval(() => {
    left--;
    const t = el.querySelector('#restTime');
    if (t) t.textContent = format(left);
    if (left <= 0) {
      stopRest();
      if (get().settings.soundOn) beep();
      toast('Rest over — next set');
    }
  }, 1000);
}

function stopRest() {
  clearInterval(restInterval);
  restInterval = null;
  restTimer?.remove();
  restTimer = null;
}

const format = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(); osc.stop(ctx.currentTime + 0.36);
  } catch { /* audio blocked — silent is fine */ }
}

/* ── Sheets ────────────────────────────────────────── */

function openExercisePicker(onPick) {
  const s = get();
  const listHTML = (items) => items.slice(0, 60).map((ex) => `
    <button class="food-search-result" data-ex="${esc(ex.id)}">
      <div class="thumb">🏋️</div>
      <div class="grow">
        <div style="font-weight:600;font-size:14px">${esc(ex.name)}</div>
        <div class="tiny dim">${esc(ex.muscles.join(', '))} · ${esc(ex.equip)}</div>
      </div>
    </button>`).join('');

  openSheet('Choose an exercise', `
    <input class="input" id="exSearch" placeholder="Search exercises…" style="margin-bottom:14px" autocomplete="off"/>
    <div id="exResults">${listHTML(searchExercises('', s.profile.equipment))}</div>
  `, (body) => {
    const results = body.querySelector('#exResults');
    const wire = () => results.querySelectorAll('[data-ex]').forEach((b) => b.addEventListener('click', () => {
      const ex = searchExercises('').find((e) => e.id === b.dataset.ex);
      onPick(ex);
    }));
    wire();
    body.querySelector('#exSearch').addEventListener('input', debounce((e) => {
      results.innerHTML = listHTML(searchExercises(e.target.value));
      wire();
    }, 150));
  });
}

function openGenerateSheet(nav) {
  const s = get();
  const hasAI = aiConfigured();

  openSheet('Build your program', `
    <p class="small muted" style="line-height:1.6;margin-bottom:18px">
      Built from your profile: ${s.profile.daysPerWeek} days/week, ${s.profile.sessionMinutes} min sessions,
      ${esc(s.profile.experience)} level, goal is ${esc(s.profile.goal)}.
      <button class="btn btn-ghost btn-sm" data-act="edit-profile" style="margin-top:10px">Change these</button>
    </p>
    <div class="stack-sm">
      <button class="btn btn-primary btn-block" data-mode="rules">Generate instantly</button>
      <button class="btn ${hasAI ? '' : 'btn-ghost'} btn-block" data-mode="ai" ${hasAI ? '' : 'disabled'}>
        ✨ Design with AI ${hasAI ? '' : '(needs API key)'}
      </button>
    </div>
    <p class="tiny dim" style="margin-top:14px;line-height:1.5">
      The instant version uses the built-in exercise library and periodization rules — no network needed.
      The AI version writes a bespoke program and explains its reasoning.
    </p>
    <div id="genStatus" style="margin-top:16px"></div>
  `, (body) => {
    body.querySelector('[data-act="edit-profile"]').onclick = () => { closeSheet(); nav('profile'); };

    body.querySelector('[data-mode="rules"]').onclick = () => {
      const program = generateProgram(get().profile);
      update((st) => { st.program = program; });
      closeSheet();
      toast(`Program built — ${program.name}`);
      nav(null);
    };

    body.querySelector('[data-mode="ai"]')?.addEventListener('click', async () => {
      const status = body.querySelector('#genStatus');
      status.innerHTML = `<div class="row" style="gap:10px"><div class="spinner"></div><span class="small dim">Designing your program… this takes a moment.</span></div>`;
      body.querySelectorAll('button').forEach((b) => (b.disabled = true));
      try {
        const ai = await generateAIProgram(get().profile);
        const program = {
          name: ai.name,
          split: ai.split,
          rationale: ai.rationale,
          daysPerWeek: ai.days.length,
          createdAt: Date.now(),
          source: 'ai',
          notes: [...(ai.notes || []), ai.progression].filter(Boolean),
          days: ai.days.map((d, i) => ({
            id: `ai-${i}`,
            key: `ai-${i}`,
            name: d.name,
            exercises: d.exercises.map((e) => ({
              exerciseId: slugify(e.name),
              name: e.name,
              role: 'primary',
              sets: e.sets,
              reps: e.reps,
              restSeconds: e.rest_seconds,
              rpe: e.rpe,
              note: e.note
            }))
          }))
        };
        update((st) => { st.program = program; });
        closeSheet();
        toast('AI program ready');
        nav(null);
      } catch (err) {
        status.innerHTML = `<div class="callout warn"><span class="callout-icon">⚠️</span><span>${esc(err.message)}</span></div>`;
        body.querySelectorAll('button').forEach((b) => (b.disabled = false));
      }
    });
  });
}

function showLogDetail(id) {
  const s = get();
  const w = s.workoutLogs.find((x) => x.id === id);
  if (!w) return;
  const unit = s.profile.units === 'imperial' ? 'lb' : 'kg';

  openSheet(w.dayName, `
    <div class="row-between small dim" style="margin-bottom:16px">
      <span>${relativeDay(w.date)}</span>
      <span>${w.durationMin} min · ${fmt(workoutVolume(w))} ${unit}</span>
    </div>
    ${w.entries.map((e) => `
      <div style="padding:12px 0;border-bottom:1px solid var(--hairline)">
        <div style="font-weight:650;font-size:14px;margin-bottom:6px">${esc(e.name)}</div>
        <div class="row wrap" style="gap:6px">
          ${e.sets.map((set) => `<span class="chip" style="padding:4px 10px;font-size:12px">${set.weight}${unit} × ${set.reps}</span>`).join('')}
        </div>
        <div class="tiny dim" style="margin-top:6px">
          Est. 1RM: ${Math.round(Math.max(...e.sets.map((x) => epley1RM(x.weight, x.reps))))} ${unit}
        </div>
      </div>`).join('')}
    <button class="btn btn-danger btn-block" id="delLog" style="margin-top:18px">Delete this workout</button>
  `, (body) => {
    body.querySelector('#delLog').onclick = async () => {
      if (await confirmSheet('Delete workout?', 'This cannot be undone.', 'Delete')) {
        update((st) => { st.workoutLogs = st.workoutLogs.filter((x) => x.id !== id); });
        closeSheet();
        toast('Workout deleted');
        document.dispatchEvent(new CustomEvent('forge:rerender'));
      }
    };
  });
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function setView(v) { view = v; }
