/* ═══════════════════════════════════════════════════════
   nutrition.js — food log, search, quick add, water
   ═══════════════════════════════════════════════════════ */

import { get, update, todayKey, daysAgoKey, dayTotals, foodLogFor, addFoodEntry, removeFoodEntry, uid } from '../store.js';
import { searchFoods, scaleFood, FOOD_GROUPS } from '../data/foods.js';
import { fmt, relativeDay, mealSlotForNow } from '../calc.js';
import { ring, macroBar, esc, icon, toast, openSheet, closeSheet, confirmSheet, debounce } from '../ui.js';
import { aiConfigured, analyzeMealText } from '../ai.js';

let viewDate = todayKey();

const SLOTS = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙' },
  { id: 'snack', label: 'Snacks', emoji: '🍎' }
];

export function render(nav) {
  const s = get();
  const t = s.targets;
  const entries = foodLogFor(viewDate);
  const eaten = dayTotals(viewDate);
  const remaining = t.calories - eaten.calories;
  const water = s.water[viewDate] || 0;
  const cups = Math.round(t.waterMl / 250);

  return `
    <div class="stack fade-in">

      <!-- Date nav -->
      <div class="row-between">
        <button class="icon-btn" data-date="-1">${icon('back', 16)}</button>
        <div class="center">
          <div style="font-weight:700;font-size:15px">${relativeDay(viewDate)}</div>
          <div class="tiny dim">${new Date(viewDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
        </div>
        <button class="icon-btn" data-date="1" ${viewDate >= todayKey() ? 'disabled style="opacity:.35"' : ''}>
          <span style="transform:rotate(180deg);display:block">${icon('back', 16)}</span>
        </button>
      </div>

      <!-- Summary -->
      <section class="card">
        <div class="calorie-summary">
          ${ring({
            pct: t.calories ? eaten.calories / t.calories : 0,
            size: 132,
            value: fmt(Math.abs(remaining)),
            label: remaining < 0 ? 'over' : 'left'
          })}
          <div class="calorie-macros">
            ${macroBar('Protein', eaten.protein, t.protein, 'var(--protein)')}
            ${macroBar('Carbs', eaten.carbs, t.carbs, 'var(--carbs)')}
            ${macroBar('Fat', eaten.fat, t.fat, 'var(--fat)')}
          </div>
        </div>
      </section>

      <!-- Add buttons -->
      <div class="row" style="gap:9px">
        <button class="btn btn-primary grow" data-act="search">${icon('plus', 16)} Add food</button>
        <button class="btn grow" data-go="snap">📸 Snap</button>
        <button class="btn grow" data-act="describe">✍️ Describe</button>
      </div>

      <!-- Meals -->
      ${SLOTS.map((slot) => {
        const items = entries.filter((e) => e.meal === slot.id);
        const kcal = items.reduce((a, i) => a + (i.kcal || 0), 0);
        return `
          <section class="meal-section">
            <div class="meal-head">
              <div class="meal-title">${slot.emoji} ${slot.label}</div>
              <div class="row" style="gap:10px">
                <span class="meal-kcal">${fmt(kcal)} kcal</span>
                <button class="icon-btn" style="width:30px;height:30px" data-add-slot="${slot.id}">${icon('plus', 15)}</button>
              </div>
            </div>
            <div class="card card-tight">
              ${items.length ? `
                <div class="list">
                  ${items.map((f) => `
                    <div class="list-item">
                      <div class="thumb">${f.photo ? `<img src="${esc(f.photo)}" alt="">` : (f.source === 'ai-photo' ? '📸' : f.source === 'ai-text' ? '✨' : '🍽️')}</div>
                      <button class="list-item-main" data-edit-food="${esc(f.id)}" style="text-align:left">
                        <div class="list-item-title">${esc(f.name)}</div>
                        <div class="list-item-sub">${esc(f.serving || '')} · P${Math.round(f.protein)} C${Math.round(f.carbs)} F${Math.round(f.fat)}</div>
                      </button>
                      <div class="list-item-end">
                        <div class="list-item-value">${fmt(f.kcal)}</div>
                      </div>
                      <button class="icon-btn" style="width:30px;height:30px;color:var(--text-3)" data-del-food="${esc(f.id)}" aria-label="Delete">
                        ${icon('trash', 14)}
                      </button>
                    </div>`).join('')}
                </div>` : `
                <button class="row" data-add-slot="${slot.id}" style="width:100%;padding:14px 0;color:var(--text-3);justify-content:center;font-size:13.5px">
                  ${icon('plus', 15)} Add to ${slot.label.toLowerCase()}
                </button>`}
            </div>
          </section>`;
      }).join('')}

      <!-- Water -->
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Water</div><div class="card-sub">${(water / 1000).toFixed(1)} L of ${(t.waterMl / 1000).toFixed(1)} L</div></div>
          <button class="btn btn-ghost btn-sm" data-water="250">+250 ml</button>
        </div>
        <div class="water-track">
          ${Array.from({ length: cups }, (_, i) => `
            <button class="water-cup ${i * 250 < water ? 'filled' : ''}" data-water-set="${(i + 1) * 250}" aria-label="Set water to ${(i + 1) * 250} ml"></button>`).join('')}
        </div>
      </section>

      <!-- Recent for one-tap re-log -->
      ${s.recentFoods.length ? `
        <section class="card">
          <div class="card-head"><div class="card-title">Log again</div><div class="card-sub">Your recent foods</div></div>
          <div class="chip-row">
            ${s.recentFoods.slice(0, 12).map((f, i) => `
              <button class="chip" data-recent="${i}">${esc(f.name)} · ${fmt(f.kcal)}</button>`).join('')}
          </div>
        </section>` : ''}
    </div>`;
}

export function mount(host, nav) {
  host.querySelectorAll('[data-date]').forEach((b) => b.addEventListener('click', () => {
    const delta = Number(b.dataset.date);
    const d = new Date(viewDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    const key = d.toISOString().slice(0, 10);
    if (key > todayKey()) return;
    viewDate = key;
    nav(null);
  }));

  host.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => nav(b.dataset.go)));
  host.querySelector('[data-act="search"]')?.addEventListener('click', () => openFoodSearch(mealSlotForNow(), nav));
  host.querySelector('[data-act="describe"]')?.addEventListener('click', () => openDescribeSheet(nav));

  host.querySelectorAll('[data-add-slot]').forEach((b) => b.addEventListener('click', () => openFoodSearch(b.dataset.addSlot, nav)));

  host.querySelectorAll('[data-del-food]').forEach((b) => b.addEventListener('click', () => {
    removeFoodEntry(b.dataset.delFood, viewDate);
    toast('Removed');
    nav(null);
  }));

  host.querySelectorAll('[data-edit-food]').forEach((b) => b.addEventListener('click', () => {
    const entry = foodLogFor(viewDate).find((f) => f.id === b.dataset.editFood);
    if (entry) openEditEntry(entry, nav);
  }));

  host.querySelector('[data-water]')?.addEventListener('click', () => {
    update((s) => { s.water[viewDate] = (s.water[viewDate] || 0) + 250; });
    nav(null);
  });

  host.querySelectorAll('[data-water-set]').forEach((b) => b.addEventListener('click', () => {
    const ml = Number(b.dataset.waterSet);
    update((s) => { s.water[viewDate] = s.water[viewDate] === ml ? ml - 250 : ml; });
    nav(null);
  }));

  host.querySelectorAll('[data-recent]').forEach((b) => b.addEventListener('click', () => {
    const f = get().recentFoods[Number(b.dataset.recent)];
    addFoodEntry({ ...f, meal: mealSlotForNow(), source: 'recent' }, viewDate);
    toast(`${f.name} logged`);
    nav(null);
  }));
}

/* ═══════════ Food search sheet ═══════════ */

export function openFoodSearch(slot, nav) {
  const s = get();

  const resultsHTML = (items) => items.length ? items.map((f, i) => `
    <button class="food-search-result" data-food="${i}">
      <div class="thumb">${FOOD_GROUPS[f.group]?.emoji || '🍽️'}</div>
      <div class="grow">
        <div style="font-weight:600;font-size:14px">${esc(f.name)}</div>
        <div class="tiny dim">${esc(f.servingLabel)} · P${f.p} C${f.c} F${f.f} per 100${f.unit || 'g'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700;font-variant-numeric:tabular-nums">${Math.round((f.kcal * f.serving) / 100)}</div>
        <div class="tiny dim">kcal</div>
      </div>
    </button>`).join('') : `<div class="empty"><p>Nothing matched. Try a simpler term, or use <strong>Custom food</strong> below.</p></div>`;

  let current = searchFoods('', s.customFoods);

  openSheet(`Add to ${slot}`, `
    <input class="input" id="foodSearch" placeholder="Search foods…" style="margin-bottom:14px" autocomplete="off" autofocus/>
    <div id="foodResults" style="max-height:46vh;overflow-y:auto">${resultsHTML(current)}</div>
    <div class="row" style="gap:8px;margin-top:14px">
      <button class="btn btn-ghost grow btn-sm" id="customFood">Custom food</button>
      <button class="btn btn-ghost grow btn-sm" id="quickCals">Quick calories</button>
    </div>
  `, (body) => {
    const results = body.querySelector('#foodResults');

    const wire = () => results.querySelectorAll('[data-food]').forEach((b) => b.addEventListener('click', () => {
      openPortionSheet(current[Number(b.dataset.food)], slot, nav);
    }));
    wire();

    body.querySelector('#foodSearch').addEventListener('input', debounce((e) => {
      current = searchFoods(e.target.value, get().customFoods);
      results.innerHTML = resultsHTML(current);
      wire();
    }, 140));

    body.querySelector('#customFood').onclick = () => openCustomFood(slot, nav);
    body.querySelector('#quickCals').onclick = () => openQuickCalories(slot, nav);
  });
}

function openPortionSheet(food, slot, nav) {
  const unit = food.unit || 'g';
  let amount = food.serving;

  const macrosHTML = (amt) => {
    const m = scaleFood(food, amt);
    return `
      <div class="row" style="justify-content:space-around;text-align:center;margin:18px 0">
        <div><div class="stat-value" style="font-size:26px;color:var(--accent)">${m.kcal}</div><div class="stat-label">kcal</div></div>
        <div><div class="stat-value" style="font-size:19px;color:var(--protein)">${m.protein}g</div><div class="stat-label">Protein</div></div>
        <div><div class="stat-value" style="font-size:19px;color:var(--carbs)">${m.carbs}g</div><div class="stat-label">Carbs</div></div>
        <div><div class="stat-value" style="font-size:19px;color:var(--fat)">${m.fat}g</div><div class="stat-label">Fat</div></div>
      </div>`;
  };

  openSheet(food.name, `
    <div id="portionMacros">${macrosHTML(amount)}</div>
    <div class="field" style="margin-bottom:14px">
      <label>Amount</label>
      <div class="serving-stepper">
        <button class="stepper-btn" data-step="-">−</button>
        <div class="input-group grow">
          <input class="input" id="portionAmount" type="number" inputmode="decimal" value="${amount}" style="text-align:center;font-weight:700"/>
          <div class="input-suffix">${unit}</div>
        </div>
        <button class="stepper-btn" data-step="+">+</button>
      </div>
      <span class="hint">One serving = ${esc(food.servingLabel)}</span>
    </div>
    <div class="chip-row" style="margin-bottom:18px">
      ${[0.5, 1, 1.5, 2, 3].map((m) => `<button class="chip" data-mult="${m}">${m}× serving</button>`).join('')}
    </div>
    <div class="field" style="margin-bottom:16px">
      <label>Meal</label>
      <div class="segmented">
        ${SLOTS.map((sl) => `<button class="${sl.id === slot ? 'active' : ''}" data-slot="${sl.id}">${sl.label}</button>`).join('')}
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="logFood">Log it</button>
  `, (body) => {
    let chosenSlot = slot;
    const input = body.querySelector('#portionAmount');
    const refresh = () => { body.querySelector('#portionMacros').innerHTML = macrosHTML(amount); input.value = amount; };

    body.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
      const step = food.serving >= 100 ? 25 : 5;
      amount = Math.max(1, amount + (b.dataset.step === '+' ? step : -step));
      refresh();
    }));
    body.querySelectorAll('[data-mult]').forEach((b) => b.addEventListener('click', () => {
      amount = Math.round(food.serving * Number(b.dataset.mult));
      refresh();
    }));
    input.addEventListener('input', () => { amount = Math.max(1, Number(input.value) || 1); body.querySelector('#portionMacros').innerHTML = macrosHTML(amount); });

    body.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => {
      chosenSlot = b.dataset.slot;
      body.querySelectorAll('[data-slot]').forEach((x) => x.classList.toggle('active', x === b));
    }));

    body.querySelector('#logFood').onclick = () => {
      const m = scaleFood(food, amount);
      addFoodEntry({
        name: food.name, meal: chosenSlot, kcal: m.kcal,
        protein: m.protein, carbs: m.carbs, fat: m.fat,
        serving: `${amount} ${unit}`, source: 'database'
      }, viewDate);
      closeSheet();
      toast(`${food.name} logged`);
      nav(null);
    };
  });
}

function openCustomFood(slot, nav) {
  openSheet('Custom food', `
    <div class="stack-sm" style="margin-bottom:18px">
      <div class="field"><label>Name</label><input class="input" id="cfName" placeholder="e.g. Mum's lasagna"/></div>
      <div class="grid grid-2">
        <div class="field"><label>Calories</label><input class="input" id="cfKcal" type="number" inputmode="numeric" placeholder="0"/></div>
        <div class="field"><label>Protein (g)</label><input class="input" id="cfP" type="number" inputmode="decimal" placeholder="0"/></div>
        <div class="field"><label>Carbs (g)</label><input class="input" id="cfC" type="number" inputmode="decimal" placeholder="0"/></div>
        <div class="field"><label>Fat (g)</label><input class="input" id="cfF" type="number" inputmode="decimal" placeholder="0"/></div>
      </div>
      <div class="field">
        <label>Serving description</label>
        <input class="input" id="cfServing" placeholder="e.g. 1 large bowl"/>
      </div>
      <label class="switch-row" style="border:none;padding:6px 0">
        <span class="small">Save to my food list for next time</span>
        <span class="switch"><input type="checkbox" id="cfSave" checked/><span class="switch-track"></span></span>
      </label>
    </div>
    <button class="btn btn-primary btn-block" id="cfLog">Log it</button>
  `, (body) => {
    body.querySelector('#cfLog').onclick = () => {
      const name = body.querySelector('#cfName').value.trim();
      const kcal = Number(body.querySelector('#cfKcal').value) || 0;
      if (!name) { toast('Give it a name', 'err'); return; }
      const entry = {
        name, meal: slot, kcal,
        protein: Number(body.querySelector('#cfP').value) || 0,
        carbs: Number(body.querySelector('#cfC').value) || 0,
        fat: Number(body.querySelector('#cfF').value) || 0,
        serving: body.querySelector('#cfServing').value.trim() || '1 serving',
        source: 'custom'
      };
      addFoodEntry(entry, viewDate);

      if (body.querySelector('#cfSave').checked) {
        update((s) => {
          s.customFoods.unshift({
            name, kcal, p: entry.protein, c: entry.carbs, f: entry.fat,
            serving: 100, servingLabel: entry.serving, group: 'other', unit: 'g'
          });
          s.customFoods = s.customFoods.slice(0, 200);
        });
      }
      closeSheet();
      toast(`${name} logged`);
      nav(null);
    };
  });
}

function openQuickCalories(slot, nav) {
  openSheet('Quick calories', `
    <p class="small muted" style="margin-bottom:16px;line-height:1.6">
      For when you know roughly the calories but not the breakdown. Macros are estimated at a 25/45/30 split.
    </p>
    <div class="field" style="margin-bottom:18px">
      <label>Calories</label>
      <input class="input" id="qcKcal" type="number" inputmode="numeric" placeholder="500"
        style="font-size:24px;font-weight:700;text-align:center" autofocus/>
    </div>
    <button class="btn btn-primary btn-block" id="qcLog">Log</button>
  `, (body) => {
    body.querySelector('#qcLog').onclick = () => {
      const kcal = Number(body.querySelector('#qcKcal').value);
      if (!kcal) { toast('Enter a calorie amount', 'err'); return; }
      addFoodEntry({
        name: 'Quick entry', meal: slot, kcal,
        protein: Math.round((kcal * 0.25) / 4),
        carbs: Math.round((kcal * 0.45) / 4),
        fat: Math.round((kcal * 0.30) / 9),
        serving: 'estimated', source: 'quick'
      }, viewDate);
      closeSheet();
      toast('Logged');
      nav(null);
    };
  });
}

/* ═══════════ Describe-a-meal (AI, no photo) ═══════════ */

function openDescribeSheet(nav) {
  if (!aiConfigured()) {
    openSheet('AI not set up', `
      <p class="small muted" style="line-height:1.6;margin-bottom:18px">
        Describing meals in plain language needs an Anthropic API key or a proxy endpoint. Add one in Settings.
      </p>
      <button class="btn btn-primary btn-block" id="toSettings">Open Settings</button>
    `, (body) => { body.querySelector('#toSettings').onclick = () => { closeSheet(); nav('profile'); }; });
    return;
  }

  openSheet('Describe your meal', `
    <p class="small muted" style="line-height:1.6;margin-bottom:14px">
      Write what you ate the way you would tell a friend. The more detail on portions and cooking method, the better the estimate.
    </p>
    <textarea class="textarea" id="mealDesc" rows="4"
      placeholder="Two eggs fried in butter, three rashers of bacon, a slice of sourdough and a flat white"></textarea>
    <div class="field" style="margin:14px 0">
      <label>Meal</label>
      <div class="segmented">
        ${SLOTS.map((sl) => `<button class="${sl.id === mealSlotForNow() ? 'active' : ''}" data-slot="${sl.id}">${sl.label}</button>`).join('')}
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="descGo">✨ Estimate macros</button>
    <div id="descStatus" style="margin-top:16px"></div>
  `, (body) => {
    let slot = mealSlotForNow();
    body.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => {
      slot = b.dataset.slot;
      body.querySelectorAll('[data-slot]').forEach((x) => x.classList.toggle('active', x === b));
    }));

    body.querySelector('#descGo').onclick = async () => {
      const text = body.querySelector('#mealDesc').value.trim();
      if (!text) { toast('Describe what you ate first', 'err'); return; }
      const status = body.querySelector('#descStatus');
      status.innerHTML = `<div class="row" style="gap:10px"><div class="spinner"></div><span class="small dim">Working it out…</span></div>`;

      const t = get().targets;
      const eaten = dayTotals(viewDate);
      try {
        const result = await analyzeMealText(text, {
          mealSlot: slot,
          remaining: {
            calories: t.calories - eaten.calories, protein: t.protein - eaten.protein,
            carbs: t.carbs - eaten.carbs, fat: t.fat - eaten.fat
          }
        });
        closeSheet();
        showAnalysisResult(result, slot, null, nav);
      } catch (err) {
        status.innerHTML = `<div class="callout warn"><span class="callout-icon">⚠️</span><span>${esc(err.message)}</span></div>`;
      }
    };
  });
}

/* ═══════════ Shared: review an AI analysis before logging ═══════════ */

export function showAnalysisResult(result, slot, photo, nav) {
  const items = result.items || [];

  openSheet('Review the estimate', `
    ${photo ? `<img src="${esc(photo)}" class="snap-preview" style="margin-bottom:16px;max-height:180px" alt="Logged meal"/>` : ''}
    <div style="font-weight:700;font-size:16px;margin-bottom:4px">${esc(result.meal_name)}</div>
    <div class="row" style="justify-content:space-around;text-align:center;margin:16px 0;padding:14px;background:var(--bg-2);border-radius:16px">
      <div><div class="stat-value" style="font-size:24px;color:var(--accent)">${Math.round(result.total.calories)}</div><div class="stat-label">kcal</div></div>
      <div><div class="stat-value" style="font-size:17px;color:var(--protein)">${Math.round(result.total.protein_g)}g</div><div class="stat-label">Protein</div></div>
      <div><div class="stat-value" style="font-size:17px;color:var(--carbs)">${Math.round(result.total.carbs_g)}g</div><div class="stat-label">Carbs</div></div>
      <div><div class="stat-value" style="font-size:17px;color:var(--fat)">${Math.round(result.total.fat_g)}g</div><div class="stat-label">Fat</div></div>
    </div>

    ${items.length ? `<div style="margin-bottom:16px">
      ${items.map((it, i) => `
        <div class="analysis-item">
          <span class="confidence-dot confidence-${esc(it.confidence)}"></span>
          <div class="grow">
            <div style="font-weight:600;font-size:14px">${esc(it.name)}</div>
            <div class="tiny dim">${esc(it.portion)} · ~${Math.round(it.grams)}g · P${Math.round(it.protein_g)} C${Math.round(it.carbs_g)} F${Math.round(it.fat_g)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;font-variant-numeric:tabular-nums">${Math.round(it.calories)}</div>
            <button class="tiny" data-drop-item="${i}" style="color:var(--danger)">remove</button>
          </div>
        </div>`).join('')}
    </div>` : `<div class="empty"><p>No food was identified in that.</p></div>`}

    ${result.coach_note ? `<div class="callout accent" style="margin-bottom:12px"><span class="callout-icon">💬</span><span>${esc(result.coach_note)}</span></div>` : ''}
    ${result.uncertainty ? `<div class="callout warn" style="margin-bottom:16px"><span class="callout-icon">⚠️</span><span>${esc(result.uncertainty)}</span></div>` : ''}

    <div class="field" style="margin-bottom:14px">
      <label>Adjust total calories if you know better</label>
      <input class="input" id="adjKcal" type="number" inputmode="numeric" value="${Math.round(result.total.calories)}"/>
    </div>

    <div class="row" style="gap:9px">
      <button class="btn btn-ghost grow" id="cancelAnalysis">Discard</button>
      <button class="btn btn-primary grow" id="logAnalysis">Log ${items.length > 1 ? 'all items' : 'it'}</button>
    </div>
    <p class="tiny dim center" style="margin-top:12px;line-height:1.5">
      Estimates from an image are approximate. Adjust anything that looks off — the log is yours.
    </p>
  `, (body) => {
    let live = structuredClone(result);

    body.querySelectorAll('[data-drop-item]').forEach((b) => b.addEventListener('click', () => {
      const i = Number(b.dataset.dropItem);
      live.items.splice(i, 1);
      live.total = live.items.reduce((a, it) => ({
        calories: a.calories + it.calories, protein_g: a.protein_g + it.protein_g,
        carbs_g: a.carbs_g + it.carbs_g, fat_g: a.fat_g + it.fat_g
      }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
      closeSheet();
      showAnalysisResult(live, slot, photo, nav);
    }));

    body.querySelector('#cancelAnalysis').onclick = closeSheet;

    body.querySelector('#logAnalysis').onclick = () => {
      const adjusted = Number(body.querySelector('#adjKcal').value) || live.total.calories;
      const scale = live.total.calories ? adjusted / live.total.calories : 1;
      const source = photo ? 'ai-photo' : 'ai-text';

      if (live.items.length) {
        live.items.forEach((it, i) => {
          addFoodEntry({
            name: it.name, meal: slot,
            kcal: Math.round(it.calories * scale),
            protein: Math.round(it.protein_g * scale * 10) / 10,
            carbs: Math.round(it.carbs_g * scale * 10) / 10,
            fat: Math.round(it.fat_g * scale * 10) / 10,
            serving: it.portion, source,
            photo: i === 0 ? photo : null,
            confidence: it.confidence
          }, viewDate);
        });
      } else {
        addFoodEntry({
          name: live.meal_name, meal: slot, kcal: Math.round(adjusted),
          protein: Math.round(live.total.protein_g * scale),
          carbs: Math.round(live.total.carbs_g * scale),
          fat: Math.round(live.total.fat_g * scale),
          serving: 'AI estimate', source, photo
        }, viewDate);
      }

      closeSheet();
      toast(`${live.meal_name} logged`);
      nav('nutrition');
    };
  });
}

function openEditEntry(entry, nav) {
  openSheet(entry.name, `
    <div class="grid grid-2" style="margin-bottom:18px">
      <div class="field"><label>Calories</label><input class="input" id="edKcal" type="number" value="${entry.kcal}"/></div>
      <div class="field"><label>Protein (g)</label><input class="input" id="edP" type="number" step="0.1" value="${entry.protein}"/></div>
      <div class="field"><label>Carbs (g)</label><input class="input" id="edC" type="number" step="0.1" value="${entry.carbs}"/></div>
      <div class="field"><label>Fat (g)</label><input class="input" id="edF" type="number" step="0.1" value="${entry.fat}"/></div>
    </div>
    <div class="field" style="margin-bottom:18px">
      <label>Meal</label>
      <div class="segmented">
        ${SLOTS.map((sl) => `<button class="${sl.id === entry.meal ? 'active' : ''}" data-slot="${sl.id}">${sl.label}</button>`).join('')}
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="edSave">Save changes</button>
    <button class="btn btn-danger btn-block" id="edDel" style="margin-top:10px">Delete entry</button>
  `, (body) => {
    let meal = entry.meal;
    body.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => {
      meal = b.dataset.slot;
      body.querySelectorAll('[data-slot]').forEach((x) => x.classList.toggle('active', x === b));
    }));

    body.querySelector('#edSave').onclick = () => {
      update((s) => {
        const target = (s.foodLogs[viewDate] || []).find((f) => f.id === entry.id);
        if (!target) return;
        target.kcal = Number(body.querySelector('#edKcal').value) || 0;
        target.protein = Number(body.querySelector('#edP').value) || 0;
        target.carbs = Number(body.querySelector('#edC').value) || 0;
        target.fat = Number(body.querySelector('#edF').value) || 0;
        target.meal = meal;
      });
      closeSheet();
      toast('Updated');
      nav(null);
    };

    body.querySelector('#edDel').onclick = () => {
      removeFoodEntry(entry.id, viewDate);
      closeSheet();
      toast('Removed');
      nav(null);
    };
  });
}

export const currentDate = () => viewDate;
export const setDate = (d) => { viewDate = d; };
