/* ═══════════════════════════════════════════════════════
   app.js — router, shell wiring, boot
   ═══════════════════════════════════════════════════════ */

import { get, update, computeStreak, todayKey } from './store.js';
import { $, icon, esc, toast, closeSheet, openSheet } from './ui.js';
import { initInteractions } from './interaction.js';
import { startOnboarding } from './screens/onboarding.js';

import * as dashboard from './screens/dashboard.js';
import * as workouts from './screens/workouts.js';
import * as nutrition from './screens/nutrition.js';
import * as snap from './screens/snap.js';
import * as mealplan from './screens/mealplan.js';
import * as progress from './screens/progress.js';
import * as motivation from './screens/motivation.js';
import * as coach from './screens/coach.js';
import * as profile from './screens/profile.js';

/* ── Screen registry ───────────────────────────────── */

const SCREENS = {
  dashboard: { mod: dashboard, title: 'Today', sub: () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }), icon: 'home', label: 'Today', tab: true },
  workouts: { mod: workouts, title: 'Training', sub: () => get().program?.name || 'No program yet', icon: 'dumbbell', label: 'Train', tab: true },
  nutrition: { mod: nutrition, title: 'Nutrition', sub: () => `${get().targets.calories} kcal target`, icon: 'utensils', label: 'Food', tab: true },
  snap: { mod: snap, title: 'AI Snap', sub: () => 'Photo → macros', icon: 'camera', label: 'Snap', tab: true, primary: true },
  mealplan: { mod: mealplan, title: 'Meal plan', sub: () => get().mealPlan?.name || 'Plan and shop', icon: 'calendar', label: 'Plan' },
  progress: { mod: progress, title: 'Progress', sub: () => `${get().weights.length} weigh-ins logged`, icon: 'chart', label: 'Progress', tab: true },
  motivation: { mod: motivation, title: 'Motivation', sub: () => `${computeStreak()}-day streak`, icon: 'fire', label: 'Motivation' },
  coach: { mod: coach, title: 'AI Coach', sub: () => 'Knows your numbers', icon: 'message', label: 'Coach' },
  profile: { mod: profile, title: 'Profile & settings', sub: () => get().profile.name || '', icon: 'user', label: 'Profile' }
};

const NAV_ORDER = ['dashboard', 'workouts', 'nutrition', 'snap', 'mealplan', 'progress', 'motivation', 'coach', 'profile'];
const TAB_ORDER = ['dashboard', 'workouts', 'snap', 'nutrition', 'progress'];

let current = 'dashboard';

/* ── Router ────────────────────────────────────────── */

/**
 * Navigate to a screen, or pass null to re-render the current one.
 * @param {string|null} name
 */
function nav(name) {
  if (name && SCREENS[name]) {
    current = name;
    if (location.hash !== `#${name}`) history.replaceState(null, '', `#${name}`);
  }
  renderScreen();
  if (name) window.scrollTo({ top: 0, behavior: 'instant' });
  closeMobileSidebar();
}

function renderScreen() {
  const screen = SCREENS[current];
  const host = $('#screen');

  $('#screenTitle').textContent = screen.title;
  $('#screenSub').textContent = screen.sub();

  host.innerHTML = screen.mod.render(nav);
  screen.mod.mount?.(host, nav);

  paintNav();
}

function paintNav() {
  $('#sidebarNav').innerHTML = NAV_ORDER.map((key) => {
    const s = SCREENS[key];
    return `
      <button class="nav-item ${key === current ? 'active' : ''}" data-nav="${key}">
        ${icon(s.icon, 19)}<span>${s.label}</span>
      </button>`;
  }).join('');

  $('#tabbar').innerHTML = TAB_ORDER.map((key) => {
    const s = SCREENS[key];
    if (s.primary) {
      return `<button class="tab snap-tab ${key === current ? 'active' : ''}" data-nav="${key}">
        <span class="tab-orb">${icon(s.icon, 20)}</span><span>${s.label}</span>
      </button>`;
    }
    return `<button class="tab ${key === current ? 'active' : ''}" data-nav="${key}">
      ${icon(s.icon, 21)}<span>${s.label}</span>
    </button>`;
  }).join('');

  document.querySelectorAll('[data-nav]').forEach((b) =>
    b.addEventListener('click', () => nav(b.dataset.nav)));

  $('#sidebarStreakCount').textContent = computeStreak();
  $('#avatarInitial').textContent = (get().profile.name || '?')[0].toUpperCase();
}

/* ── Shell wiring ──────────────────────────────────── */

function openMobileSidebar() {
  $('#sidebar').classList.add('open');
  $('#scrim').hidden = false;
}

function closeMobileSidebar() {
  $('#sidebar').classList.remove('open');
  if ($('#sheet').hidden) $('#scrim').hidden = true;
}

function wireShell() {
  $('#menuBtn').addEventListener('click', openMobileSidebar);
  $('#profileBtn').addEventListener('click', () => nav('profile'));
  $('#sheetClose').addEventListener('click', closeSheet);

  $('#scrim').addEventListener('click', () => {
    closeSheet();
    closeMobileSidebar();
  });

  $('#quickAddBtn').addEventListener('click', openQuickAdd);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSheet(); closeMobileSidebar(); }
  });

  window.addEventListener('hashchange', () => {
    const key = location.hash.slice(1);
    if (SCREENS[key] && key !== current) nav(key);
  });

  // Screens can request a re-render after an out-of-band mutation
  document.addEventListener('forge:rerender', () => nav(null));

  // A day boundary while the app is open should refresh "today"
  let lastDay = todayKey();
  setInterval(() => {
    if (todayKey() !== lastDay) { lastDay = todayKey(); nav(null); }
  }, 60000);
}

function openQuickAdd() {
  openSheet('Quick add', `
    <div class="grid grid-2" style="gap:10px">
      ${[
        ['📸', 'Snap food', 'snap'],
        ['🍽️', 'Log food', 'nutrition'],
        ['🏋️', 'Start workout', 'workouts'],
        ['⚖️', 'Log weight', 'weigh'],
        ['📓', 'Daily check-in', 'motivation'],
        ['💬', 'Ask the coach', 'coach']
      ].map(([emoji, label, target]) => `
        <button class="option" data-quick="${target}" style="text-align:center">
          <span class="option-emoji" style="margin-bottom:6px">${emoji}</span>
          <span class="option-title">${label}</span>
        </button>`).join('')}
    </div>
  `, (body) => {
    body.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
      const target = b.dataset.quick;
      closeSheet();
      if (target === 'weigh') dashboard.openWeighIn(nav);
      else nav(target);
    }));
  });
}

/* ── Boot ──────────────────────────────────────────── */

function boot() {
  wireShell();
  initInteractions();

  const s = get();
  if (!s.profile.onboarded) {
    startOnboarding(() => {
      current = 'dashboard';
      nav('dashboard');
    });
    return;
  }

  $('#app').hidden = false;

  const hashed = location.hash.slice(1);
  current = SCREENS[hashed] ? hashed : 'dashboard';

  // Resume an interrupted workout instead of dropping the user on Today
  if (s.activeWorkout && current === 'dashboard') {
    current = 'workouts';
    toast('You have a workout in progress');
  }

  nav(current);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* ── Service worker (offline shell) ────────────────── */

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  });
}
