/* ═══════════════════════════════════════════════════════
   progress.js — weight trend, measurements, photos, PRs
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey, daysAgoKey, uid } from '../store.js';
import { weightLabel, kgToLb, lbToKg, bmi, estimateBodyFat, relativeDay, fmt } from '../calc.js';
import { personalBest, workoutVolume } from '../program.js';
import { EXERCISES } from '../data/exercises.js';
import { lineChart, esc, icon, toast, openSheet, closeSheet, confirmSheet, $ } from '../ui.js';
import { openWeighIn } from './dashboard.js';

let tab = 'body';   // body | strength | photos

export function render(nav) {
  const s = get();
  return `
    <div class="fade-in">
      <div class="segmented" style="margin-bottom:18px">
        <button class="${tab === 'body' ? 'active' : ''}" data-tab="body">Body</button>
        <button class="${tab === 'strength' ? 'active' : ''}" data-tab="strength">Strength</button>
        <button class="${tab === 'photos' ? 'active' : ''}" data-tab="photos">Photos</button>
      </div>
      ${tab === 'body' ? renderBody(s) : tab === 'strength' ? renderStrength(s) : renderPhotos(s)}
    </div>`;
}

/* ── Body ──────────────────────────────────────────── */

function renderBody(s) {
  const imperial = s.profile.units === 'imperial';
  const points = s.weights.slice(-60).map((w) => ({
    x: new Date(w.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
    y: imperial ? Math.round(kgToLb(w.kg) * 10) / 10 : Math.round(w.kg * 10) / 10
  }));

  const current = s.weights.length ? s.weights[s.weights.length - 1].kg : s.profile.weightKg;
  const start = s.weights.length ? s.weights[0].kg : current;
  const change = current - start;
  const bmiVal = bmi(current, s.profile.heightCm);
  const bf = estimateBodyFat({ ...s.profile, weightKg: current });
  const last = s.measurements[s.measurements.length - 1];

  return `
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Weight trend</div><div class="card-sub">${s.weights.length} entries</div></div>
          <button class="btn btn-primary btn-sm" data-act="weigh">Log weight</button>
        </div>
        ${lineChart(points, { yLabel: 'Bodyweight' })}
      </section>

      <div class="grid grid-4">
        <div class="stat">
          <div class="stat-label">Current</div>
          <div class="stat-value" style="font-size:19px">${weightLabel(current, s.profile.units)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Change</div>
          <div class="stat-value" style="font-size:19px">${change >= 0 ? '+' : ''}${(imperial ? kgToLb(change) : change).toFixed(1)}<small>${imperial ? 'lb' : 'kg'}</small></div>
        </div>
        <div class="stat">
          <div class="stat-label">BMI</div>
          <div class="stat-value" style="font-size:19px">${bmiVal.toFixed(1)}</div>
          <div class="stat-delta flat">${bmiLabel(bmiVal)}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Est. body fat</div>
          <div class="stat-value" style="font-size:19px">${bf.toFixed(0)}<small>%</small></div>
          <div class="stat-delta flat">rough estimate</div>
        </div>
      </div>

      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Measurements</div><div class="card-sub">${last ? `Last taken ${relativeDay(last.date)}` : 'Tape measure beats the scale for recomp'}</div></div>
          <button class="btn btn-ghost btn-sm" data-act="measure">Add</button>
        </div>
        ${last ? `
          <div class="grid grid-4">
            ${[['Waist', last.waist], ['Chest', last.chest], ['Arms', last.arms], ['Thighs', last.thighs]].map(([l, v]) => `
              <div style="text-align:center">
                <div class="stat-value" style="font-size:18px">${v || '—'}${v ? `<small>${imperial ? 'in' : 'cm'}</small>` : ''}</div>
                <div class="stat-label">${l}</div>
              </div>`).join('')}
          </div>
          ${s.measurements.length > 1 ? renderMeasurementDeltas(s, imperial) : ''}
        ` : `<div class="empty" style="padding:16px 0"><p>No measurements yet. Waist is the single most useful one to track.</p></div>`}
      </section>

      <div class="callout">
        <span class="callout-icon">📊</span>
        <span>Daily weight bounces 1–2 kg on water alone. Judge the <strong>weekly average</strong>, not any single morning.</span>
      </div>
    </div>`;
}

function renderMeasurementDeltas(s, imperial) {
  const first = s.measurements[0];
  const last = s.measurements[s.measurements.length - 1];
  const unit = imperial ? 'in' : 'cm';
  const rows = [['Waist', 'waist'], ['Chest', 'chest'], ['Arms', 'arms'], ['Thighs', 'thighs']]
    .filter(([, k]) => first[k] && last[k])
    .map(([label, k]) => {
      const d = last[k] - first[k];
      return `<div class="row-between small" style="padding:7px 0;border-bottom:1px solid var(--hairline)">
        <span class="dim">${label} since ${relativeDay(first.date)}</span>
        <span style="font-weight:650;color:${Math.abs(d) < 0.2 ? 'var(--text-3)' : d < 0 ? 'var(--accent)' : 'var(--carbs)'}">${d >= 0 ? '+' : ''}${d.toFixed(1)} ${unit}</span>
      </div>`;
    }).join('');
  return rows ? `<div style="margin-top:14px">${rows}</div>` : '';
}

/* ── Strength ──────────────────────────────────────── */

function renderStrength(s) {
  if (!s.workoutLogs.length) {
    return `<div class="card"><div class="empty">
      <div class="empty-icon">🏆</div><h4>No lifts logged</h4>
      <p>Complete a workout and your personal bests and strength curves appear here.</p>
    </div></div>`;
  }

  const unit = s.profile.units === 'imperial' ? 'lb' : 'kg';
  const trained = [...new Set(s.workoutLogs.flatMap((w) => w.entries.map((e) => e.exerciseId)))];
  const prs = trained
    .map((id) => {
      const pb = personalBest(id, s.workoutLogs);
      const ex = EXERCISES.find((e) => e.id === id);
      return pb ? { id, name: ex?.name || id, ...pb } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.weight - a.weight);

  const totalVolume = s.workoutLogs.reduce((a, w) => a + workoutVolume(w), 0);
  const weekVol = s.workoutLogs.filter((w) => w.date >= daysAgoKey(6)).reduce((a, w) => a + workoutVolume(w), 0);

  return `
    <div class="stack">
      <div class="grid grid-3">
        <div class="stat"><div class="stat-label">Sessions</div><div class="stat-value">${s.workoutLogs.length}</div></div>
        <div class="stat"><div class="stat-label">This week</div><div class="stat-value" style="font-size:18px">${fmt(weekVol)}<small>${unit}</small></div></div>
        <div class="stat"><div class="stat-label">Lifetime</div><div class="stat-value" style="font-size:18px">${fmt(totalVolume)}<small>${unit}</small></div></div>
      </div>

      <section class="card">
        <div class="card-head"><div class="card-title">Personal bests</div><div class="card-sub">Heaviest set logged per exercise</div></div>
        <div class="list">
          ${prs.slice(0, 20).map((pr) => `
            <button class="list-item" data-pr="${esc(pr.id)}">
              <div class="thumb">🏆</div>
              <div class="list-item-main">
                <div class="list-item-title">${esc(pr.name)}</div>
                <div class="list-item-sub">${relativeDay(pr.date)} · ${pr.reps} reps</div>
              </div>
              <div class="list-item-end">
                <div class="list-item-value">${pr.weight}<small style="font-size:11px;color:var(--text-3)"> ${unit}</small></div>
              </div>
            </button>`).join('')}
        </div>
      </section>
    </div>`;
}

/* ── Photos ────────────────────────────────────────── */

function renderPhotos(s) {
  return `
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Progress photos</div><div class="card-sub">${s.photos.length} photo${s.photos.length === 1 ? '' : 's'} · stored only on this device</div></div>
          <button class="btn btn-primary btn-sm" data-act="add-photo">Add</button>
        </div>
        ${s.photos.length ? `
          <div class="photo-grid">
            ${[...s.photos].reverse().map((p) => `
              <button class="photo-tile" data-photo="${esc(p.id)}">
                <img src="${esc(p.dataUrl)}" alt="Progress photo from ${esc(p.date)}" loading="lazy"/>
                <div class="photo-date">${relativeDay(p.date)}</div>
              </button>`).join('')}
          </div>` : `
          <div class="empty">
            <div class="empty-icon">🪞</div>
            <h4>Take the before shot</h4>
            <p>Same spot, same light, same time of day. In eight weeks you will be glad you did.</p>
          </div>`}
      </section>

      <div class="callout">
        <span class="callout-icon">🔒</span>
        <span>Photos never leave this device — they are stored in your browser and are not uploaded anywhere.</span>
      </div>
    </div>`;
}

/* ── Events ────────────────────────────────────────── */

export function mount(host, nav) {
  host.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; nav(null); }));
  host.querySelector('[data-act="weigh"]')?.addEventListener('click', () => openWeighIn(nav));
  host.querySelector('[data-act="measure"]')?.addEventListener('click', () => openMeasurements(nav));
  host.querySelectorAll('[data-pr]').forEach((b) => b.addEventListener('click', () => showStrengthCurve(b.dataset.pr)));

  const input = $('#progressPhotoInput');
  host.querySelector('[data-act="add-photo"]')?.addEventListener('click', () => { input.value = ''; input.click(); });

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const { compressImage } = await import('../ai.js');
      const dataUrl = await compressImage(file, 900, 0.72);
      update((s) => { s.photos.push({ id: uid(), date: todayKey(), dataUrl, note: '' }); });
      toast('Photo saved');
      nav(null);
    } catch (err) {
      toast('Could not read that image', 'err');
    }
  };

  host.querySelectorAll('[data-photo]').forEach((b) => b.addEventListener('click', () => showPhoto(b.dataset.photo, nav)));
}

function openMeasurements(nav) {
  const s = get();
  const imperial = s.profile.units === 'imperial';
  const unit = imperial ? 'in' : 'cm';
  const last = s.measurements[s.measurements.length - 1] || {};

  openSheet('Add measurements', `
    <p class="small muted" style="line-height:1.6;margin-bottom:16px">
      Measure relaxed, first thing in the morning. Waist at the navel, arms flexed at the peak.
    </p>
    <div class="grid grid-2" style="margin-bottom:18px">
      ${[['Waist', 'waist'], ['Chest', 'chest'], ['Arms', 'arms'], ['Thighs', 'thighs']].map(([label, key]) => `
        <div class="field">
          <label>${label}</label>
          <div class="input-group">
            <input class="input" id="m-${key}" type="number" inputmode="decimal" step="0.1" value="${last[key] ?? ''}" placeholder="—"/>
            <div class="input-suffix">${unit}</div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" id="mSave">Save</button>
  `, (body) => {
    body.querySelector('#mSave').onclick = () => {
      const entry = { date: todayKey() };
      let any = false;
      ['waist', 'chest', 'arms', 'thighs'].forEach((k) => {
        const v = Number(body.querySelector(`#m-${k}`).value);
        if (v > 0) { entry[k] = v; any = true; }
      });
      if (!any) { toast('Enter at least one measurement', 'err'); return; }
      update((st) => {
        st.measurements = st.measurements.filter((m) => m.date !== todayKey());
        st.measurements.push(entry);
        st.measurements.sort((a, b) => a.date.localeCompare(b.date));
      });
      closeSheet();
      toast('Measurements saved');
      nav(null);
    };
  });
}

function showPhoto(id, nav) {
  const photo = get().photos.find((p) => p.id === id);
  if (!photo) return;

  openSheet(relativeDay(photo.date), `
    <img src="${esc(photo.dataUrl)}" style="width:100%;border-radius:16px;margin-bottom:16px" alt="Progress photo"/>
    <div class="field" style="margin-bottom:16px">
      <label>Note</label>
      <input class="input" id="photoNote" value="${esc(photo.note || '')}" placeholder="e.g. week 4, morning, fasted"/>
    </div>
    <div class="row" style="gap:9px">
      <button class="btn btn-ghost grow" id="photoSave">Save note</button>
      <button class="btn btn-danger grow" id="photoDel">Delete</button>
    </div>
  `, (body) => {
    body.querySelector('#photoSave').onclick = () => {
      update((s) => {
        const p = s.photos.find((x) => x.id === id);
        if (p) p.note = body.querySelector('#photoNote').value.trim();
      });
      closeSheet();
      toast('Saved');
    };
    body.querySelector('#photoDel').onclick = async () => {
      if (await confirmSheet('Delete photo?', 'This cannot be undone.', 'Delete')) {
        update((s) => { s.photos = s.photos.filter((x) => x.id !== id); });
        closeSheet();
        nav(null);
      }
    };
  });
}

function showStrengthCurve(exerciseId) {
  const s = get();
  const unit = s.profile.units === 'imperial' ? 'lb' : 'kg';
  const ex = EXERCISES.find((e) => e.id === exerciseId);

  const points = s.workoutLogs
    .map((w) => {
      const entry = w.entries.find((e) => e.exerciseId === exerciseId);
      if (!entry?.sets.length) return null;
      const top = Math.max(...entry.sets.map((set) => set.weight || 0));
      return { x: new Date(w.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), y: top };
    })
    .filter(Boolean);

  openSheet(ex?.name || exerciseId, `
    <div class="card-sub" style="margin-bottom:14px">Top set per session (${unit})</div>
    ${lineChart(points, { color: 'var(--warn)' })}
    ${ex?.tip ? `<div class="callout" style="margin-top:16px"><span class="callout-icon">💡</span><span>${esc(ex.tip)}</span></div>` : ''}
  `);
}

const bmiLabel = (v) => (v < 18.5 ? 'under' : v < 25 ? 'normal' : v < 30 ? 'over' : 'obese');
