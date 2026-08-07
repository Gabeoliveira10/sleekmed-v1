/* ═══════════════════════════════════════════════════════
   ui.js — rendering helpers, sheets, toasts, charts, icons
   ═══════════════════════════════════════════════════════ */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Escape untrusted text before it goes into an innerHTML template. */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Tagged template that escapes every interpolated value. */
export function html(strings, ...vals) {
  return strings.reduce((out, s, i) => {
    const v = vals[i - 1];
    const safe = Array.isArray(v) ? v.join('') : v?.__raw ? v.__raw : esc(v);
    return out + (i ? safe : '') + s;
  });
}

/** Mark a string as pre-escaped so `html` will not escape it again. */
export const raw = (s) => ({ __raw: s });

/* ── Icons (inline SVG paths) ──────────────────────── */

const ICON_PATHS = {
  home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11"/>',
  utensils: '<path d="M4 3v7a3 3 0 003 3v8M7 3v7M17 3c-1.5 2-2 4-2 6s.5 3 2 3v9"/>',
  camera: '<path d="M3 8.5A1.5 1.5 0 014.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0121 8.5v9A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5z"/><circle cx="12" cy="12.5" r="3.4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  message: '<path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.4 2"/>',
  fire: '<path d="M12 3c3 4 5 6 5 9a5 5 0 01-10 0c0-1.6.7-2.7 1.6-3.8.5 1 1.2 1.6 2 1.8-.4-2.6.5-5.2 1.4-7z"/>',
  edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 10-3-3L5 17z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  scale: '<path d="M12 3v4M4 21h16M6.5 21l1.6-11h7.8l1.6 11"/><circle cx="12" cy="5" r="2"/>'
};

export function icon(name, size = 20) {
  const path = ICON_PATHS[name] || ICON_PATHS.spark;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* ── Toasts ────────────────────────────────────────── */

export function toast(message, kind = 'ok', ms = 2600) {
  const stack = $('#toastStack');
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${esc(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .2s, transform .2s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 220);
  }, ms);
}

/* ── Bottom sheet ──────────────────────────────────── */

let sheetCloseHandler = null;

export function openSheet(title, bodyHTML, onMount) {
  $('#sheetTitle').textContent = title;
  $('#sheetBody').innerHTML = bodyHTML;
  $('#sheet').hidden = false;
  $('#scrim').hidden = false;
  document.body.style.overflow = 'hidden';
  if (onMount) onMount($('#sheetBody'));
}

export function closeSheet() {
  $('#sheet').hidden = true;
  $('#scrim').hidden = true;
  document.body.style.overflow = '';
  if (sheetCloseHandler) { sheetCloseHandler(); sheetCloseHandler = null; }
}

export function onSheetClose(fn) { sheetCloseHandler = fn; }

export function confirmSheet(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    openSheet(title, `
      <p class="muted" style="margin-bottom:20px;line-height:1.6">${esc(message)}</p>
      <div class="row" style="gap:10px">
        <button class="btn btn-ghost grow" data-act="cancel">Cancel</button>
        <button class="btn btn-danger grow" data-act="ok">${esc(confirmLabel)}</button>
      </div>
    `, (body) => {
      body.querySelector('[data-act="cancel"]').onclick = () => { closeSheet(); resolve(false); };
      body.querySelector('[data-act="ok"]').onclick = () => { closeSheet(); resolve(true); };
    });
  });
}

/* ── Rings ─────────────────────────────────────────── */

/**
 * Concentric progress ring.
 * @param {number} pct  0–1 (values above 1 are clamped visually)
 */
export function ring({ pct, size = 132, stroke = 11, color = 'var(--accent)', value, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, pct));
  const offset = c * (1 - clamped);
  const over = pct > 1.02;

  return `
    <div class="ring-wrap" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" style="transform:rotate(-90deg)">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
        <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
          stroke="${over ? 'var(--warn)' : color}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="ring-center">
        <div class="ring-value">${esc(value)}</div>
        <div class="ring-label">${esc(label)}</div>
      </div>
    </div>`;
}

export function macroBar(name, current, target, color) {
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  const over = target > 0 && current > target * 1.05;
  return `
    <div class="macro-row">
      <div class="macro-head">
        <span class="macro-name" style="color:${color}">${esc(name)}</span>
        <span class="macro-nums">${Math.round(current)} / ${Math.round(target)} g</span>
      </div>
      <div class="bar"><div class="bar-fill" style="width:${pct * 100}%;background:${over ? 'var(--warn)' : color}"></div></div>
    </div>`;
}

/* ── Charts (hand-rolled SVG, no dependencies) ─────── */

/* Charts stretch their SVG to the container width, so geometry uses a
   `preserveAspectRatio="none"` viewBox while every label is real HTML laid out
   around it. Putting <text> inside a non-uniformly scaled SVG would smear it
   horizontally, and circles would become ellipses. */

/**
 * Line + area chart.
 * @param {Array<{x:string, y:number}>} points
 */
export function lineChart(points, { height = 170, color = 'var(--accent)', yLabel = '' } = {}) {
  if (!points.length) {
    return `<div class="empty"><p>No data yet — log a few entries to see the trend.</p></div>`;
  }
  if (points.length === 1) {
    return `<div class="empty"><p>One data point so far. Log again tomorrow to start the trend line.</p></div>`;
  }

  const W = 100, H = 100;                 // unitless drawing space, stretched to fit
  const ys = points.map((p) => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max - min < 0.001) { max += 1; min -= 1; }
  const span = max - min;
  min -= span * 0.15; max += span * 0.15;

  const xAt = (i) => (W * i) / (points.length - 1);
  const yAt = (v) => H * (1 - (v - min) / (max - min));

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(2)},${yAt(p.y).toFixed(2)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  const grid = [0.25, 0.5, 0.75].map((f) =>
    `<line class="chart-grid-line" x1="0" y1="${H * f}" x2="${W}" y2="${H * f}" vector-effect="non-scaling-stroke"/>`
  ).join('');

  const fmtVal = (v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : Math.round(v * 10) / 10);

  const labelEvery = Math.max(1, Math.ceil(points.length / 5));
  const xLabels = points
    .map((p, i) => (i % labelEvery === 0 || i === points.length - 1 ? esc(p.x) : ''))
    .filter(Boolean);

  return `
    <div class="chart-box" role="img" aria-label="${esc(yLabel || 'Trend chart')}">
      <div class="chart-plot" style="height:${height}px">
        <svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          ${grid}
          <path class="chart-area" d="${area}" fill="${color}"/>
          <path d="${line}" fill="none" stroke="${color}" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
        </svg>
        <span class="chart-y chart-y-max">${fmtVal(max)}</span>
        <span class="chart-y chart-y-min">${fmtVal(min)}</span>
      </div>
      <div class="chart-x-labels">${xLabels.map((l) => `<span>${l}</span>`).join('')}</div>
    </div>`;
}

/** Vertical bar chart, used for weekly calories / volume. */
export function barChart(bars, { height = 150, color = 'var(--accent)', target = null } = {}) {
  if (!bars.length) return `<div class="empty"><p>No data yet.</p></div>`;

  const max = Math.max(...bars.map((b) => b.y), target || 0, 1);
  const H = 100;
  const slot = 100 / bars.length;
  const bw = slot * 0.62;

  const targetLine = target
    ? `<line class="chart-grid-line" x1="0" y1="${H * (1 - target / max)}" x2="100" y2="${H * (1 - target / max)}"
         stroke="var(--text-3)" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>`
    : '';

  const rects = bars.map((b, i) => {
    const h = Math.max(b.y ? 1.5 : 0.8, H * (b.y / max));
    const x = i * slot + (slot - bw) / 2;
    const over = target && b.y > target * 1.05;
    return `<rect x="${x}" y="${H - h}" width="${bw}" height="${h}"
      fill="${over ? 'var(--warn)' : color}" opacity="${b.y ? 0.9 : 0.22}"><title>${esc(b.x)}: ${Math.round(b.y)}</title></rect>`;
  }).join('');

  return `
    <div class="chart-box">
      <div class="chart-plot" style="height:${height}px">
        <svg class="chart" viewBox="0 0 100 ${H}" preserveAspectRatio="none" aria-hidden="true">${targetLine}${rects}</svg>
        ${target ? `<span class="chart-y chart-y-target" style="top:${(1 - target / max) * 100}%">${Math.round(target).toLocaleString()}</span>` : ''}
      </div>
      <div class="chart-x-labels chart-x-even">
        ${bars.map((b) => `<span>${esc(b.label || b.x)}</span>`).join('')}
      </div>
    </div>`;
}

/* ── Misc ──────────────────────────────────────────── */

export function debounce(fn, ms = 220) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function delegate(root, selector, event, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Convert markdown-ish coach text into safe HTML (bold, bullets, breaks). */
export function lightMarkdown(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '• $1')
    .replace(/\n{2,}/g, '\n\n');
}
