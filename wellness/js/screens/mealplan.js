/* ═══════════════════════════════════════════════════════
   mealplan.js — AI meal plans + grocery list
   ═══════════════════════════════════════════════════════ */

import { get, update, addFoodEntry, uid } from '../store.js';
import { fmt } from '../calc.js';
import { esc, icon, toast, openSheet, closeSheet, confirmSheet } from '../ui.js';
import { aiConfigured, generateMealPlan } from '../ai.js';

let tab = 'plan';   // plan | grocery
let openDay = 0;

export function render(nav) {
  const s = get();

  return `
    <div class="fade-in">
      <div class="segmented" style="margin-bottom:18px">
        <button class="${tab === 'plan' ? 'active' : ''}" data-tab="plan">Meal plan</button>
        <button class="${tab === 'grocery' ? 'active' : ''}" data-tab="grocery">Grocery list</button>
      </div>
      ${tab === 'plan' ? renderPlan(s) : renderGrocery(s)}
    </div>`;
}

function renderPlan(s) {
  const plan = s.mealPlan;

  if (!plan) {
    return `
      <div class="stack">
        <div class="card">
          <div class="empty">
            <div class="empty-icon">🗒️</div>
            <h4>No meal plan yet</h4>
            <p>Generate a plan that hits ${fmt(s.targets.calories)} kcal and ${s.targets.protein}g protein a day, with a grocery list to match.</p>
            <button class="btn btn-primary" data-act="generate">Build a plan</button>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">How this works</div></div>
          <div class="stack-sm small muted" style="line-height:1.6">
            <p>Plans are built around your targets, diet style${s.profile.allergies ? ', and the foods you avoid' : ''}, and repeat ingredients across days so nothing goes to waste.</p>
            <p>Every meal can be logged to your food diary with one tap, so the plan and the tracker stay in sync.</p>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="stack">
      <section class="card">
        <div class="card-head">
          <div>
            <div class="card-title">${esc(plan.name)}</div>
            <div class="card-sub">${plan.days.length} days · target ${fmt(s.targets.calories)} kcal</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="generate">New plan</button>
        </div>
        <p class="small muted" style="line-height:1.6">${esc(plan.summary)}</p>
      </section>

      ${plan.days.map((day, i) => `
        <div class="plan-day">
          <button class="plan-day-head" data-day="${i}">
            <div>
              <div style="font-weight:650;font-size:15px">${esc(day.day)}</div>
              <div class="tiny dim">${Math.round(day.totals.calories)} kcal · P${Math.round(day.totals.protein_g)} C${Math.round(day.totals.carbs_g)} F${Math.round(day.totals.fat_g)}</div>
            </div>
            <span class="dim">${openDay === i ? '▴' : '▾'}</span>
          </button>
          ${openDay === i ? day.meals.map((meal, j) => `
            <div class="plan-meal">
              <div class="plan-meal-label">${esc(meal.slot)}</div>
              <div class="row-between" style="align-items:flex-start">
                <div class="grow">
                  <div class="plan-meal-name">${esc(meal.name)}</div>
                  <div class="plan-meal-macros">${Math.round(meal.calories)} kcal · P${Math.round(meal.protein_g)} C${Math.round(meal.carbs_g)} F${Math.round(meal.fat_g)}</div>
                </div>
                <div class="row" style="gap:6px">
                  <button class="btn btn-ghost btn-sm" data-recipe="${i}-${j}">Recipe</button>
                  <button class="btn btn-ghost btn-sm" data-log-meal="${i}-${j}">Log</button>
                </div>
              </div>
            </div>`).join('') : ''}
        </div>`).join('')}

      ${plan.prep_tips?.length ? `
        <section class="card">
          <div class="card-head"><div class="card-title">Prep tips</div></div>
          <div class="stack-sm">
            ${plan.prep_tips.map((tip) => `<div class="callout"><span class="callout-icon">→</span><span>${esc(tip)}</span></div>`).join('')}
          </div>
        </section>` : ''}
    </div>`;
}

function renderGrocery(s) {
  const list = s.grocery;
  if (!list.length) {
    return `<div class="card"><div class="empty">
      <div class="empty-icon">🛒</div><h4>Nothing on the list</h4>
      <p>Generate a meal plan and its grocery list lands here, grouped by aisle.</p>
      <button class="btn btn-primary" data-act="generate">Build a plan</button>
    </div></div>`;
  }

  const byCategory = list.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});
  const remaining = list.filter((i) => !i.checked).length;

  return `
    <div class="stack">
      <section class="card">
        <div class="row-between">
          <div>
            <div class="card-title">${remaining} item${remaining === 1 ? '' : 's'} to get</div>
            <div class="card-sub">${list.length - remaining} of ${list.length} in the basket</div>
          </div>
          <div class="row" style="gap:8px">
            <button class="btn btn-ghost btn-sm" data-act="uncheck-all">Reset</button>
            <button class="btn btn-ghost btn-sm" data-act="clear-list">Clear</button>
          </div>
        </div>
        <div class="bar" style="margin-top:14px">
          <div class="bar-fill" style="width:${((list.length - remaining) / list.length) * 100}%;background:var(--accent)"></div>
        </div>
      </section>

      ${Object.entries(byCategory).map(([cat, items]) => `
        <section class="card">
          <div class="card-head"><div class="card-title">${esc(cat)}</div></div>
          <div class="list">
            ${items.map((item) => `
              <button class="grocery-item ${item.checked ? 'checked' : ''}" data-grocery="${esc(item.id)}">
                <span class="grocery-check">${icon('check', 13)}</span>
                <span class="grow grocery-name" style="font-size:14.5px">${esc(item.name)}</span>
                <span class="tiny dim">${esc(item.qty)}</span>
              </button>`).join('')}
          </div>
        </section>`).join('')}

      <button class="btn btn-ghost btn-block" data-act="add-grocery">${icon('plus', 16)} Add an item</button>
    </div>`;
}

/* ── Events ────────────────────────────────────────── */

export function mount(host, nav) {
  host.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; nav(null); }));
  host.querySelectorAll('[data-act="generate"]').forEach((b) => b.addEventListener('click', () => openGenerator(nav)));

  host.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.day);
    openDay = openDay === i ? -1 : i;
    nav(null);
  }));

  host.querySelectorAll('[data-recipe]').forEach((b) => b.addEventListener('click', () => {
    const [i, j] = b.dataset.recipe.split('-').map(Number);
    showRecipe(get().mealPlan.days[i].meals[j]);
  }));

  host.querySelectorAll('[data-log-meal]').forEach((b) => b.addEventListener('click', () => {
    const [i, j] = b.dataset.logMeal.split('-').map(Number);
    const meal = get().mealPlan.days[i].meals[j];
    addFoodEntry({
      name: meal.name, meal: meal.slot,
      kcal: Math.round(meal.calories),
      protein: Math.round(meal.protein_g),
      carbs: Math.round(meal.carbs_g),
      fat: Math.round(meal.fat_g),
      serving: '1 serving', source: 'meal-plan'
    });
    toast(`${meal.name} logged`);
  }));

  host.querySelectorAll('[data-grocery]').forEach((b) => b.addEventListener('click', () => {
    update((s) => {
      const item = s.grocery.find((g) => g.id === b.dataset.grocery);
      if (item) item.checked = !item.checked;
    });
    nav(null);
  }));

  host.querySelector('[data-act="uncheck-all"]')?.addEventListener('click', () => {
    update((s) => s.grocery.forEach((g) => (g.checked = false)));
    nav(null);
  });

  host.querySelector('[data-act="clear-list"]')?.addEventListener('click', async () => {
    if (await confirmSheet('Clear grocery list?', 'Every item will be removed.', 'Clear')) {
      update((s) => { s.grocery = []; });
      nav(null);
    }
  });

  host.querySelector('[data-act="add-grocery"]')?.addEventListener('click', () => {
    openSheet('Add item', `
      <div class="stack-sm" style="margin-bottom:18px">
        <div class="field"><label>Item</label><input class="input" id="gName" placeholder="e.g. Greek yogurt" autofocus/></div>
        <div class="field"><label>Quantity</label><input class="input" id="gQty" placeholder="e.g. 1 kg tub"/></div>
        <div class="field">
          <label>Aisle</label>
          <select class="select" id="gCat">
            ${['Produce', 'Protein', 'Dairy', 'Pantry', 'Frozen', 'Other'].map((c) => `<option>${c}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-block" id="gAdd">Add</button>
    `, (body) => {
      body.querySelector('#gAdd').onclick = () => {
        const name = body.querySelector('#gName').value.trim();
        if (!name) { toast('Name the item', 'err'); return; }
        update((s) => {
          s.grocery.push({
            id: uid(), name,
            qty: body.querySelector('#gQty').value.trim() || '1',
            category: body.querySelector('#gCat').value,
            checked: false
          });
        });
        closeSheet();
        nav(null);
      };
    });
  });
}

/* ── Generator ─────────────────────────────────────── */

function openGenerator(nav) {
  if (!aiConfigured()) {
    openSheet('AI not connected', `
      <p class="small muted" style="line-height:1.6;margin-bottom:18px">
        Meal plans are generated by Claude. Add an Anthropic API key or a proxy endpoint in Settings first.
      </p>
      <button class="btn btn-primary btn-block" id="toSettings">Open Settings</button>
    `, (body) => { body.querySelector('#toSettings').onclick = () => { closeSheet(); nav('profile'); }; });
    return;
  }

  const s = get();
  openSheet('Build a meal plan', `
    <div class="stack-sm" style="margin-bottom:18px">
      <div class="field">
        <label>How many days?</label>
        <div class="chip-row" id="planDays">
          ${[1, 3, 5, 7].map((d) => `<button class="chip ${d === 3 ? 'selected' : ''}" data-days="${d}">${d} day${d > 1 ? 's' : ''}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>Cuisine or style <span class="hint">optional</span></label>
        <input class="input" id="planStyle" placeholder="e.g. Mediterranean, high-protein Asian, quick sheet-pan"/>
      </div>
      <div class="field">
        <label>Anything else? <span class="hint">optional</span></label>
        <input class="input" id="planBudget" placeholder="e.g. budget-friendly, meal-prep on Sunday, no oven"/>
      </div>
    </div>
    <div class="callout" style="margin-bottom:16px">
      <span class="callout-icon">🎯</span>
      <span>Targeting <strong>${fmt(s.targets.calories)} kcal</strong> and <strong>${s.targets.protein}g protein</strong> per day${s.profile.dietStyle !== 'omnivore' ? `, ${esc(s.profile.dietStyle)}` : ''}${s.profile.allergies ? `, avoiding ${esc(s.profile.allergies)}` : ''}.</span>
    </div>
    <button class="btn btn-primary btn-block" id="planGo">✨ Generate</button>
    <div id="planStatus" style="margin-top:16px"></div>
  `, (body) => {
    let days = 3;
    body.querySelectorAll('#planDays [data-days]').forEach((b) => b.addEventListener('click', () => {
      days = Number(b.dataset.days);
      body.querySelectorAll('#planDays [data-days]').forEach((x) => x.classList.toggle('selected', x === b));
    }));

    body.querySelector('#planGo').onclick = async () => {
      const status = body.querySelector('#planStatus');
      status.innerHTML = `
        <div class="ai-thinking" style="padding:24px 0">
          <div class="ai-orb" style="width:48px;height:48px"></div>
          <div class="small dim">Writing ${days} days of meals and consolidating the shopping list…</div>
        </div>`;
      body.querySelectorAll('button').forEach((b) => (b.disabled = true));

      try {
        const plan = await generateMealPlan({
          days,
          style: body.querySelector('#planStyle').value.trim(),
          budget: body.querySelector('#planBudget').value.trim()
        });

        update((st) => {
          st.mealPlan = plan;
          st.grocery = (plan.grocery_list || []).map((g) => ({
            id: uid(), name: g.item, qty: g.quantity, category: g.category, checked: false
          }));
        });

        closeSheet();
        openDay = 0;
        tab = 'plan';
        toast(`${days}-day plan ready`);
        nav(null);
      } catch (err) {
        status.innerHTML = `<div class="callout warn"><span class="callout-icon">⚠️</span><span>${esc(err.message)}</span></div>`;
        body.querySelectorAll('button').forEach((b) => (b.disabled = false));
      }
    };
  });
}

function showRecipe(meal) {
  openSheet(meal.name, `
    <div class="row" style="justify-content:space-around;text-align:center;margin-bottom:18px;padding:14px;background:var(--bg-2);border-radius:16px">
      <div><div class="stat-value" style="font-size:21px;color:var(--accent)">${Math.round(meal.calories)}</div><div class="stat-label">kcal</div></div>
      <div><div class="stat-value" style="font-size:16px;color:var(--protein)">${Math.round(meal.protein_g)}g</div><div class="stat-label">Protein</div></div>
      <div><div class="stat-value" style="font-size:16px;color:var(--carbs)">${Math.round(meal.carbs_g)}g</div><div class="stat-label">Carbs</div></div>
      <div><div class="stat-value" style="font-size:16px;color:var(--fat)">${Math.round(meal.fat_g)}g</div><div class="stat-label">Fat</div></div>
    </div>

    <div class="settings-group-title">Ingredients</div>
    <div class="list" style="margin-bottom:20px">
      ${(meal.ingredients || []).map((ing) => `
        <div class="list-item" style="padding:9px 0">
          <span style="color:var(--accent)">•</span>
          <span class="grow small">${esc(ing)}</span>
        </div>`).join('')}
    </div>

    <div class="settings-group-title">Method</div>
    <p class="small muted" style="line-height:1.7">${esc(meal.prep)}</p>
  `);
}
