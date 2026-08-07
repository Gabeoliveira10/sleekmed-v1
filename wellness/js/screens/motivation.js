/* ═══════════════════════════════════════════════════════
   motivation.js — quotes, streaks, achievements, journal
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey, daysAgoKey, computeStreak, activeDays, dayTotals } from '../store.js';
import { relativeDay } from '../calc.js';
import { workoutVolume } from '../program.js';
import { QUOTES, quoteOfDay, AFFIRMATIONS, ACHIEVEMENTS } from '../data/quotes.js';
import { esc, icon, toast, openSheet, closeSheet, confirmSheet } from '../ui.js';

const MOODS = [
  { emoji: '😫', label: 'Rough', value: 1 },
  { emoji: '😕', label: 'Low', value: 2 },
  { emoji: '😐', label: 'OK', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '🔥', label: 'Great', value: 5 }
];

export function render(nav) {
  const s = get();
  const streak = computeStreak();
  const q = quoteOfDay(todayKey());
  const ctx = achievementContext(s, streak);
  const unlocked = ACHIEVEMENTS.filter((a) => safeTest(a, s, ctx));
  const todaysJournal = s.journal.find((j) => j.date === todayKey());
  const affirmation = AFFIRMATIONS[new Date().getDate() % AFFIRMATIONS.length];

  return `
    <div class="stack fade-in">

      <section class="card quote-card">
        <div class="quote-mark">"</div>
        <div class="quote-text">${esc(q.text)}</div>
        <div class="row-between">
          <div class="quote-author">— ${esc(q.author)}</div>
          <button class="btn btn-ghost btn-sm" data-act="new-quote">Another</button>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <div><div class="card-title">🔥 ${streak}-day streak</div><div class="card-sub">Last 28 days</div></div>
        </div>
        <div class="streak-grid">
          ${activeDays(28).map((d, i, arr) => `
            <div class="streak-cell ${d.food || d.workout ? 'hit' : ''} ${i === arr.length - 1 ? 'today' : ''}" title="${d.key}">
              ${d.workout ? '🏋️' : d.food ? '·' : ''}
            </div>`).join('')}
        </div>
        <p class="tiny dim" style="margin-top:12px;line-height:1.5">${esc(streakMessage(streak))}</p>
      </section>

      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Today's check-in</div><div class="card-sub">${todaysJournal ? 'Logged' : 'Thirty seconds, once a day'}</div></div>
        </div>
        <div class="field" style="margin-bottom:14px">
          <label>How do you feel?</label>
          <div class="mood-picker">
            ${MOODS.map((m) => `
              <button class="mood-btn ${todaysJournal?.mood === m.value ? 'selected' : ''}" data-mood="${m.value}" title="${m.label}">${m.emoji}</button>`).join('')}
          </div>
        </div>
        <div class="field" style="margin-bottom:14px">
          <label>One win today <span class="hint">— however small</span></label>
          <input class="input" id="journalWin" value="${esc(todaysJournal?.win || '')}" placeholder="e.g. hit protein without thinking about it"/>
        </div>
        <div class="field" style="margin-bottom:14px">
          <label>Anything else? <span class="hint">optional</span></label>
          <textarea class="textarea" id="journalNote" rows="3" placeholder="Energy, sleep, soreness, what got in the way…">${esc(todaysJournal?.note || '')}</textarea>
        </div>
        <button class="btn btn-primary btn-block" data-act="save-journal">${todaysJournal ? 'Update check-in' : 'Save check-in'}</button>
      </section>

      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Achievements</div><div class="card-sub">${unlocked.length} of ${ACHIEVEMENTS.length} unlocked</div></div>
        </div>
        <div class="bar" style="margin-bottom:16px">
          <div class="bar-fill" style="width:${(unlocked.length / ACHIEVEMENTS.length) * 100}%;background:var(--warn)"></div>
        </div>
        <div class="stack-sm">
          ${ACHIEVEMENTS.map((a) => {
            const got = safeTest(a, s, ctx);
            return `
              <div class="achievement ${got ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${got ? a.icon : '🔒'}</div>
                <div class="grow">
                  <div style="font-weight:650;font-size:14px">${esc(a.title)}</div>
                  <div class="tiny dim">${esc(a.desc)}</div>
                </div>
                ${got ? '<span class="badge badge-warn">Unlocked</span>' : ''}
              </div>`;
          }).join('')}
        </div>
      </section>

      <section class="card">
        <div class="card-head"><div class="card-title">Your week, honestly</div></div>
        ${weeklyReview(s)}
      </section>

      ${s.journal.length ? `
        <section class="card">
          <div class="card-head">
            <div><div class="card-title">Journal</div><div class="card-sub">${s.journal.length} entries</div></div>
          </div>
          <div class="list">
            ${[...s.journal].reverse().slice(0, 12).map((j) => `
              <button class="list-item" data-journal="${esc(j.date)}">
                <div class="thumb">${MOODS.find((m) => m.value === j.mood)?.emoji || '📓'}</div>
                <div class="list-item-main">
                  <div class="list-item-title">${esc(j.win || 'Check-in')}</div>
                  <div class="list-item-sub">${relativeDay(j.date)}${j.note ? ` · ${esc(j.note.slice(0, 48))}${j.note.length > 48 ? '…' : ''}` : ''}</div>
                </div>
              </button>`).join('')}
          </div>
        </section>` : ''}

      <div class="callout accent">
        <span class="callout-icon">💚</span>
        <span>${esc(affirmation)}</span>
      </div>
    </div>`;
}

/* ── Events ────────────────────────────────────────── */

let quoteOverride = null;

export function mount(host, nav) {
  host.querySelector('[data-act="new-quote"]')?.addEventListener('click', () => {
    quoteOverride = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    const card = host.querySelector('.quote-card');
    card.querySelector('.quote-text').textContent = quoteOverride.text;
    card.querySelector('.quote-author').textContent = `— ${quoteOverride.author}`;
  });

  let mood = get().journal.find((j) => j.date === todayKey())?.mood || null;
  host.querySelectorAll('[data-mood]').forEach((b) => b.addEventListener('click', () => {
    mood = Number(b.dataset.mood);
    host.querySelectorAll('[data-mood]').forEach((x) => x.classList.toggle('selected', x === b));
  }));

  host.querySelector('[data-act="save-journal"]')?.addEventListener('click', () => {
    const win = host.querySelector('#journalWin').value.trim();
    const note = host.querySelector('#journalNote').value.trim();
    if (!mood && !win && !note) { toast('Add a mood, a win, or a note', 'err'); return; }
    update((s) => {
      s.journal = s.journal.filter((j) => j.date !== todayKey());
      s.journal.push({ date: todayKey(), mood, win, note });
      s.journal.sort((a, b) => a.date.localeCompare(b.date));
    });
    toast('Check-in saved');
    nav(null);
  });

  host.querySelectorAll('[data-journal]').forEach((b) => b.addEventListener('click', () => showJournal(b.dataset.journal, nav)));
}

function showJournal(date, nav) {
  const j = get().journal.find((x) => x.date === date);
  if (!j) return;
  openSheet(relativeDay(date), `
    <div class="row" style="gap:12px;margin-bottom:16px;align-items:center">
      <div style="font-size:34px">${MOODS.find((m) => m.value === j.mood)?.emoji || '📓'}</div>
      <div>
        <div style="font-weight:650">${esc(MOODS.find((m) => m.value === j.mood)?.label || 'Check-in')}</div>
        <div class="tiny dim">${new Date(date + 'T12:00:00').toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
      </div>
    </div>
    ${j.win ? `<div class="callout accent" style="margin-bottom:12px"><span class="callout-icon">🏅</span><span>${esc(j.win)}</span></div>` : ''}
    ${j.note ? `<p class="small muted" style="line-height:1.7;white-space:pre-wrap">${esc(j.note)}</p>` : ''}
    <button class="btn btn-danger btn-block" id="delJ" style="margin-top:20px">Delete entry</button>
  `, (body) => {
    body.querySelector('#delJ').onclick = async () => {
      if (await confirmSheet('Delete entry?', 'This check-in will be removed.', 'Delete')) {
        update((s) => { s.journal = s.journal.filter((x) => x.date !== date); });
        closeSheet();
        nav(null);
      }
    };
  });
}

/* ── Helpers ───────────────────────────────────────── */

function achievementContext(s, streak) {
  const proteinDays = Object.keys(s.foodLogs).filter((k) => dayTotals(k).protein >= s.targets.protein * 0.95).length;
  const totalVolume = s.workoutLogs.reduce((a, w) => a + workoutVolume(w), 0);
  return { streak, proteinDays, totalVolume };
}

function safeTest(achievement, s, ctx) {
  try { return Boolean(achievement.test(s, ctx)); } catch { return false; }
}

function streakMessage(n) {
  if (n === 0) return 'Log anything today — a meal, a workout, a check-in — and the streak starts.';
  if (n < 3) return 'Early days. The first week is the hardest one.';
  if (n < 7) return 'Building. Protect the streak through the weekend.';
  if (n < 21) return 'This is becoming a habit rather than a decision.';
  if (n < 60) return 'Serious consistency. This is what results are made of.';
  return 'Outstanding. You are the person who does this now.';
}

function weeklyReview(s) {
  const week = [];
  for (let i = 6; i >= 0; i--) week.push(daysAgoKey(i));

  const workouts = s.workoutLogs.filter((w) => week.includes(w.date)).length;
  const loggedDays = week.filter((k) => (s.foodLogs[k] || []).length).length;
  const avgCals = Math.round(week.reduce((a, k) => a + dayTotals(k).calories, 0) / Math.max(1, loggedDays));
  const avgProtein = Math.round(week.reduce((a, k) => a + dayTotals(k).protein, 0) / Math.max(1, loggedDays));
  const target = s.targets;

  const rows = [
    ['Workouts', `${workouts} of ${s.profile.daysPerWeek}`, workouts >= s.profile.daysPerWeek],
    ['Days tracked', `${loggedDays} of 7`, loggedDays >= 5],
    ['Avg calories', loggedDays ? `${avgCals} vs ${target.calories}` : 'no data', loggedDays && Math.abs(avgCals - target.calories) < target.calories * 0.1],
    ['Avg protein', loggedDays ? `${avgProtein}g vs ${target.protein}g` : 'no data', loggedDays && avgProtein >= target.protein * 0.9]
  ];

  return `<div class="list">
    ${rows.map(([label, value, good]) => `
      <div class="list-item">
        <span style="font-size:16px">${good ? '✅' : '⚪'}</span>
        <div class="list-item-main"><div class="list-item-title" style="font-size:14px">${label}</div></div>
        <div class="list-item-end"><div class="small ${good ? 'up' : 'dim'}" style="font-weight:600">${esc(value)}</div></div>
      </div>`).join('')}
  </div>`;
}
