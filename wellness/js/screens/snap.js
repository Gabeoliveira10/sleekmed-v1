/* ═══════════════════════════════════════════════════════
   snap.js — AI photo food logging
   ═══════════════════════════════════════════════════════ */

import { get, dayTotals, todayKey } from '../store.js';
import { mealSlotForNow, fmt } from '../calc.js';
import { esc, toast, $ } from '../ui.js';
import { aiConfigured, aiMode, analyzeMealPhoto, compressImage } from '../ai.js';
import { showAnalysisResult, currentDate } from './nutrition.js';

let pending = null;      // { dataUrl }
let busy = false;
let abortCtl = null;

export function render(nav) {
  const s = get();
  const t = s.targets;
  const eaten = dayTotals(currentDate());
  const configured = aiConfigured();

  return `
    <div class="stack fade-in">

      ${!configured ? `
        <div class="callout warn">
          <span class="callout-icon">🔑</span>
          <span><strong>AI is not connected.</strong> Add an Anthropic API key or a proxy endpoint in Settings to use photo logging.</span>
        </div>
        <button class="btn btn-primary btn-block" data-go="profile">Set up AI</button>
      ` : ''}

      <section class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Snap your food</div>
            <div class="card-sub">Photograph the plate — get calories and macros back</div>
          </div>
          ${configured ? `<span class="badge badge-accent">${aiMode() === 'proxy' ? 'Proxy' : 'Direct'}</span>` : ''}
        </div>

        <div id="snapArea">
          ${pending ? renderPreview() : renderZone()}
        </div>
      </section>

      ${!pending ? `
        <section class="card">
          <div class="card-head"><div class="card-title">For the best estimate</div></div>
          <div class="stack-sm">
            ${[
              ['📐', 'Shoot from above at a slight angle so depth is visible'],
              ['🍴', 'Leave a fork, hand, or can in frame — it gives the model a size reference'],
              ['💡', 'Good light. Shadows hide sauces and oil'],
              ['🥣', 'One plate at a time beats a whole table'],
              ['✍️', 'Cooked in oil or butter? Say so on the review screen — it is the biggest hidden variable']
            ].map(([e, txt]) => `
              <div class="row" style="align-items:flex-start;gap:11px">
                <span style="font-size:16px">${e}</span>
                <span class="small muted" style="line-height:1.55">${txt}</span>
              </div>`).join('')}
          </div>
        </section>

        <section class="card">
          <div class="card-head">
            <div><div class="card-title">Today so far</div><div class="card-sub">Before this meal</div></div>
          </div>
          <div class="grid grid-4">
            <div><div class="stat-label">Calories</div><div class="stat-value" style="font-size:18px">${fmt(t.calories - eaten.calories)}<small>left</small></div></div>
            <div><div class="stat-label">Protein</div><div class="stat-value" style="font-size:18px;color:var(--protein)">${Math.round(t.protein - eaten.protein)}<small>g</small></div></div>
            <div><div class="stat-label">Carbs</div><div class="stat-value" style="font-size:18px;color:var(--carbs)">${Math.round(t.carbs - eaten.carbs)}<small>g</small></div></div>
            <div><div class="stat-label">Fat</div><div class="stat-value" style="font-size:18px;color:var(--fat)">${Math.round(t.fat - eaten.fat)}<small>g</small></div></div>
          </div>
          <p class="tiny dim" style="margin-top:12px;line-height:1.5">
            These numbers are sent with the photo so the coach note is about your day, not a generic diet.
          </p>
        </section>

        <section class="card">
          <div class="card-head"><div class="card-title">Recent AI logs</div></div>
          ${renderRecentAI(s)}
        </section>
      ` : ''}
    </div>`;
}

function renderZone() {
  return `
    <button class="snap-zone" id="snapPick" style="width:100%">
      <div class="snap-icon">📸</div>
      <div style="font-weight:650;font-size:16px;margin-bottom:5px">Take or choose a photo</div>
      <div class="small dim" style="max-width:280px;margin:0 auto;line-height:1.55">
        Works on anything — a home-cooked plate, a restaurant dish, a packet.
      </div>
    </button>`;
}

function renderPreview() {
  return `
    <img src="${esc(pending.dataUrl)}" class="snap-preview" alt="Meal to analyze"/>
    <div id="snapStatus" style="margin-top:14px"></div>
    <div class="row" style="gap:9px;margin-top:14px">
      <button class="btn btn-ghost grow" id="snapClear">Retake</button>
      <button class="btn btn-primary grow" id="snapAnalyze">✨ Analyze</button>
    </div>
    <div class="field" style="margin-top:14px">
      <label>Meal</label>
      <div class="segmented" id="snapSlot">
        ${['breakfast', 'lunch', 'dinner', 'snack'].map((sl) => `
          <button class="${sl === mealSlotForNow() ? 'active' : ''}" data-slot="${sl}" style="text-transform:capitalize">${sl}</button>`).join('')}
      </div>
    </div>`;
}

function renderRecentAI(s) {
  const recent = Object.entries(s.foodLogs)
    .flatMap(([date, items]) => items.filter((i) => i.source === 'ai-photo' || i.source === 'ai-text').map((i) => ({ ...i, date })))
    .sort((a, b) => (b.loggedAt || 0) - (a.loggedAt || 0))
    .slice(0, 6);

  if (!recent.length) {
    return `<div class="empty" style="padding:20px 0"><p>Nothing scanned yet. Your AI-logged meals will collect here.</p></div>`;
  }

  return `<div class="list">
    ${recent.map((f) => `
      <div class="list-item">
        <div class="thumb">${f.photo ? `<img src="${esc(f.photo)}" alt="">` : '✨'}</div>
        <div class="list-item-main">
          <div class="list-item-title">${esc(f.name)}</div>
          <div class="list-item-sub">${esc(f.serving || '')}${f.confidence ? ` · ${f.confidence} confidence` : ''}</div>
        </div>
        <div class="list-item-end"><div class="list-item-value">${fmt(f.kcal)}</div><div class="tiny dim">kcal</div></div>
      </div>`).join('')}
  </div>`;
}

/* ── Events ────────────────────────────────────────── */

export function mount(host, nav) {
  host.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.go)));

  const input = $('#photoInput');

  host.querySelector('#snapPick')?.addEventListener('click', () => {
    if (!aiConfigured()) { toast('Connect AI in Settings first', 'err'); return; }
    input.value = '';
    input.click();
  });

  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('That is not an image', 'err'); return; }
    try {
      pending = { dataUrl: await compressImage(file) };
      nav(null);
    } catch (err) {
      toast(err.message, 'err');
    }
  };

  host.querySelector('#snapClear')?.addEventListener('click', () => {
    abortCtl?.abort();
    pending = null;
    busy = false;
    nav(null);
  });

  let slot = mealSlotForNow();
  host.querySelectorAll('#snapSlot [data-slot]').forEach((b) => b.addEventListener('click', () => {
    slot = b.dataset.slot;
    host.querySelectorAll('#snapSlot [data-slot]').forEach((x) => x.classList.toggle('active', x === b));
  }));

  host.querySelector('#snapAnalyze')?.addEventListener('click', async () => {
    if (busy) return;
    busy = true;

    const status = host.querySelector('#snapStatus');
    status.innerHTML = `
      <div class="ai-thinking">
        <div class="ai-orb"></div>
        <div>
          <div style="font-weight:650;font-size:15px">Reading the plate</div>
          <div class="small dim" style="margin-top:4px">Identifying foods and estimating portions…</div>
        </div>
      </div>`;
    host.querySelector('#snapAnalyze').disabled = true;

    const t = get().targets;
    const eaten = dayTotals(currentDate());
    abortCtl = new AbortController();

    try {
      const result = await analyzeMealPhoto(
        pending.dataUrl,
        {
          mealSlot: slot,
          remaining: {
            calories: t.calories - eaten.calories,
            protein: t.protein - eaten.protein,
            carbs: t.carbs - eaten.carbs,
            fat: t.fat - eaten.fat
          }
        },
        { signal: abortCtl.signal }
      );

      const photo = pending.dataUrl;
      pending = null;
      busy = false;
      nav(null);
      showAnalysisResult(result, slot, photo, nav);
    } catch (err) {
      busy = false;
      if (err.name === 'AbortError') return;
      status.innerHTML = `
        <div class="callout warn">
          <span class="callout-icon">⚠️</span>
          <span>${esc(err.message)}</span>
        </div>`;
      const btn = host.querySelector('#snapAnalyze');
      if (btn) btn.disabled = false;
    }
  });
}

export function reset() { pending = null; busy = false; }
