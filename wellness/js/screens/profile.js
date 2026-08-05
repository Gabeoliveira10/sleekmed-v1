/* ═══════════════════════════════════════════════════════
   profile.js — profile, targets, AI settings, data management
   ═══════════════════════════════════════════════════════ */

import { get, update, resetAll, replaceAll, exportJSON, todayKey } from '../store.js';
import {
  ACTIVITY, GOALS, EXPERIENCE, computeTargets, weightLabel, heightLabel,
  kgToLb, lbToKg, cmToIn, inToCm, fmt
} from '../calc.js';
import { generateProgram } from '../program.js';
import { esc, icon, toast, openSheet, closeSheet, confirmSheet, $ } from '../ui.js';
import { aiMode, DEFAULT_MODEL } from '../ai.js';

export function render(nav) {
  const s = get();
  const p = s.profile;
  const t = s.targets;
  const mode = aiMode();

  return `
    <div class="stack fade-in">

      <!-- Identity -->
      <section class="card">
        <div class="row" style="gap:14px">
          <div class="avatar-btn" style="width:56px;height:56px;font-size:22px">${esc((p.name || '?')[0].toUpperCase())}</div>
          <div class="grow">
            <div style="font-family:var(--font-display);font-weight:700;font-size:19px">${esc(p.name || 'Your profile')}</div>
            <div class="tiny dim">${p.age}y · ${heightLabel(p.heightCm, p.units)} · ${weightLabel(p.weightKg, p.units)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="edit-profile">Edit</button>
        </div>
      </section>

      <!-- Targets -->
      <section class="card">
        <div class="card-head">
          <div>
            <div class="card-title">Daily targets</div>
            <div class="card-sub">${t.manual ? 'Set manually' : 'Calculated from your profile'}</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="edit-targets">Adjust</button>
        </div>
        <div class="grid grid-4">
          <div style="text-align:center"><div class="stat-value" style="font-size:20px;color:var(--accent)">${fmt(t.calories)}</div><div class="stat-label">kcal</div></div>
          <div style="text-align:center"><div class="stat-value" style="font-size:20px;color:var(--protein)">${t.protein}g</div><div class="stat-label">Protein</div></div>
          <div style="text-align:center"><div class="stat-value" style="font-size:20px;color:var(--carbs)">${t.carbs}g</div><div class="stat-label">Carbs</div></div>
          <div style="text-align:center"><div class="stat-value" style="font-size:20px;color:var(--fat)">${t.fat}g</div><div class="stat-label">Fat</div></div>
        </div>
        <div class="row-between tiny dim" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--hairline)">
          <span>Maintenance ≈ ${fmt(t.maintenance || computeTargets(p).maintenance)} kcal</span>
          <span>${GOALS[p.goal]?.label}</span>
        </div>
      </section>

      <!-- Goal & training -->
      <section class="card">
        <div class="card-head"><div class="card-title">Goal & training</div></div>
        <div class="list">
          ${settingRow('Goal', GOALS[p.goal]?.label || p.goal, 'goal')}
          ${settingRow('Activity level', ACTIVITY[p.activityLevel]?.label || p.activityLevel, 'activity')}
          ${settingRow('Experience', EXPERIENCE[p.experience]?.label || p.experience, 'experience')}
          ${settingRow('Days per week', `${p.daysPerWeek} days`, 'days')}
          ${settingRow('Session length', `${p.sessionMinutes} min`, 'session')}
          ${settingRow('Equipment', p.equipment.join(', '), 'equipment')}
          ${settingRow('Diet style', p.dietStyle, 'diet')}
        </div>
        <button class="btn btn-ghost btn-block" data-act="rebuild-program" style="margin-top:14px">
          Rebuild program from these settings
        </button>
      </section>

      <!-- AI -->
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">${icon('spark', 16)} AI coaching</div><div class="card-sub">Photo food logging, meal plans, coach chat</div></div>
          <div class="key-status">
            <span class="key-dot ${mode === 'proxy' || mode === 'direct' ? 'on' : 'off'}"></span>
            <span>${mode === 'proxy' ? 'Proxy' : mode === 'direct' ? 'Connected' : mode === 'off' ? 'Off' : 'Not set up'}</span>
          </div>
        </div>

        <label class="switch-row">
          <div>
            <div style="font-weight:600;font-size:14px">Enable AI features</div>
            <div class="tiny dim">Turn off to use the app fully offline</div>
          </div>
          <span class="switch"><input type="checkbox" id="aiToggle" ${s.settings.aiEnabled ? 'checked' : ''}/><span class="switch-track"></span></span>
        </label>

        <div class="field" style="margin-top:14px">
          <label for="apiKeyInput">Anthropic API key</label>
          <input class="input" id="apiKeyInput" type="password" autocomplete="off" spellcheck="false"
            placeholder="sk-ant-…" value="${esc(s.settings.apiKey)}"/>
          <span class="hint">Get one at console.anthropic.com. Stored in this browser only.</span>
        </div>

        <div class="field" style="margin-top:14px">
          <label for="proxyInput">Proxy endpoint <span class="hint">— recommended</span></label>
          <input class="input" id="proxyInput" placeholder="https://your-server.com/api/claude"
            value="${esc(s.settings.proxyUrl)}" autocomplete="off" spellcheck="false"/>
          <span class="hint">If set, requests go here instead and your key stays server-side. Takes priority over the key above.</span>
        </div>

        <div class="field" style="margin-top:14px">
          <label for="modelInput">Model</label>
          <select class="select" id="modelInput">
            ${[
              ['claude-opus-5', 'Claude Opus 5 — best quality'],
              ['claude-sonnet-5', 'Claude Sonnet 5 — faster, cheaper'],
              ['claude-haiku-4-5', 'Claude Haiku 4.5 — fastest']
            ].map(([id, label]) => `<option value="${id}" ${s.settings.model === id ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>

        <button class="btn btn-primary btn-block" data-act="save-ai" style="margin-top:16px">Save AI settings</button>

        <div class="callout warn" style="margin-top:16px">
          <span class="callout-icon">🔐</span>
          <span><strong>About the API key.</strong> A key pasted here is stored in this browser's local storage and sent
          straight from this page to Anthropic. That is fine for your own device. Do not use this mode for an app you hand
          to other people — anyone with access to the browser can read the key. For that, point the proxy field at a small
          server endpoint that holds the key instead.</span>
        </div>
      </section>

      <!-- App settings -->
      <section class="card">
        <div class="card-head"><div class="card-title">Preferences</div></div>
        <label class="switch-row">
          <div><div style="font-weight:600;font-size:14px">Rest timer sound</div><div class="tiny dim">Beep when rest is over</div></div>
          <span class="switch"><input type="checkbox" id="soundToggle" ${s.settings.soundOn ? 'checked' : ''}/><span class="switch-track"></span></span>
        </label>
        <div class="field" style="margin-top:14px">
          <label>Default rest between sets</label>
          <div class="chip-row">
            ${[60, 90, 120, 180].map((sec) => `
              <button class="chip ${s.settings.restSeconds === sec ? 'selected' : ''}" data-rest="${sec}">${sec >= 120 ? `${sec / 60} min` : `${sec}s`}</button>`).join('')}
          </div>
        </div>
        <div class="field" style="margin-top:14px">
          <label>Units</label>
          <div class="segmented">
            <button class="${p.units === 'metric' ? 'active' : ''}" data-units="metric">Metric</button>
            <button class="${p.units === 'imperial' ? 'active' : ''}" data-units="imperial">Imperial</button>
          </div>
        </div>
      </section>

      <!-- Data -->
      <section class="card">
        <div class="card-head">
          <div><div class="card-title">Your data</div><div class="card-sub">Everything lives in this browser</div></div>
        </div>
        <div class="grid grid-2">
          <div class="stat"><div class="stat-label">Meals logged</div><div class="stat-value">${Object.values(s.foodLogs).flat().length}</div></div>
          <div class="stat"><div class="stat-label">Workouts</div><div class="stat-value">${s.workoutLogs.length}</div></div>
          <div class="stat"><div class="stat-label">Weigh-ins</div><div class="stat-value">${s.weights.length}</div></div>
          <div class="stat"><div class="stat-label">Photos</div><div class="stat-value">${s.photos.length}</div></div>
        </div>
        <div class="row" style="gap:9px;margin-top:16px">
          <button class="btn btn-ghost grow btn-sm" data-act="export">Export JSON</button>
          <button class="btn btn-ghost grow btn-sm" data-act="import">Import</button>
        </div>
        <button class="btn btn-danger btn-block" data-act="reset" style="margin-top:10px">Erase everything</button>
      </section>

      <p class="tiny dim center" style="padding:8px 0 20px;line-height:1.6">
        Forge is a tracking tool, not medical advice.<br/>
        Talk to a doctor before starting a new training or nutrition programme.
      </p>
    </div>`;
}

function settingRow(label, value, key) {
  return `
    <button class="list-item" data-setting="${key}">
      <div class="list-item-main">
        <div class="list-item-title" style="font-size:14px">${esc(label)}</div>
      </div>
      <div class="list-item-end">
        <div class="small dim" style="text-transform:capitalize;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(value)}</div>
      </div>
    </button>`;
}

/* ── Events ────────────────────────────────────────── */

export function mount(host, nav) {
  host.querySelector('[data-act="edit-profile"]')?.addEventListener('click', () => openProfileEditor(nav));
  host.querySelector('[data-act="edit-targets"]')?.addEventListener('click', () => openTargetsEditor(nav));

  host.querySelectorAll('[data-setting]').forEach((b) => b.addEventListener('click', () => openSetting(b.dataset.setting, nav)));

  host.querySelector('[data-act="rebuild-program"]')?.addEventListener('click', async () => {
    if (await confirmSheet('Rebuild program?', 'Your current program will be replaced. Workout history is kept.', 'Rebuild')) {
      const program = generateProgram(get().profile);
      update((s) => { s.program = program; });
      toast(`Rebuilt — ${program.name}`);
      nav('workouts');
    }
  });

  host.querySelector('[data-act="save-ai"]')?.addEventListener('click', () => {
    const key = host.querySelector('#apiKeyInput').value.trim();
    const proxy = host.querySelector('#proxyInput').value.trim();

    if (proxy && !/^https:\/\//i.test(proxy)) { toast('Proxy URL must start with https://', 'err'); return; }
    if (key && !key.startsWith('sk-ant-')) { toast('That does not look like an Anthropic key', 'err'); return; }

    update((s) => {
      s.settings.apiKey = key;
      s.settings.proxyUrl = proxy;
      s.settings.model = host.querySelector('#modelInput').value;
      s.settings.aiEnabled = host.querySelector('#aiToggle').checked;
    });
    toast(key || proxy ? 'AI connected' : 'AI settings saved');
    nav(null);
  });

  host.querySelector('#aiToggle')?.addEventListener('change', (e) => {
    update((s) => { s.settings.aiEnabled = e.target.checked; });
  });

  host.querySelector('#soundToggle')?.addEventListener('change', (e) => {
    update((s) => { s.settings.soundOn = e.target.checked; });
  });

  host.querySelectorAll('[data-rest]').forEach((b) => b.addEventListener('click', () => {
    update((s) => { s.settings.restSeconds = Number(b.dataset.rest); });
    nav(null);
  }));

  host.querySelectorAll('[data-units]').forEach((b) => b.addEventListener('click', () => {
    update((s) => { s.profile.units = b.dataset.units; });
    nav(null);
  }));

  host.querySelector('[data-act="export"]')?.addEventListener('click', () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `forge-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Backup downloaded');
  });

  const importInput = $('#importInput');
  host.querySelector('[data-act="import"]')?.addEventListener('click', () => { importInput.value = ''; importInput.click(); });

  importInput.onchange = async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed.profile) throw new Error('not a Forge backup');
      if (await confirmSheet('Replace all data?', 'Everything currently in the app will be overwritten by this backup.', 'Import')) {
        replaceAll(parsed);
        toast('Backup restored');
        nav('dashboard');
      }
    } catch (err) {
      toast('That file is not a valid Forge backup', 'err');
    }
  };

  host.querySelector('[data-act="reset"]')?.addEventListener('click', async () => {
    if (await confirmSheet(
      'Erase everything?',
      'All workouts, meals, weights, photos and settings will be permanently deleted from this device. Export a backup first if you want to keep any of it.',
      'Erase everything'
    )) {
      resetAll();
      location.reload();
    }
  });
}

/* ── Editors ───────────────────────────────────────── */

function openProfileEditor(nav) {
  const p = get().profile;
  const imperial = p.units === 'imperial';
  const ft = Math.floor(p.heightCm / 30.48);
  const inch = Math.round(cmToIn(p.heightCm) - ft * 12);

  openSheet('Edit profile', `
    <div class="stack-sm" style="margin-bottom:18px">
      <div class="field"><label>Name</label><input class="input" id="pName" value="${esc(p.name)}"/></div>
      <div class="field"><label>Age</label><input class="input" id="pAge" type="number" inputmode="numeric" value="${p.age}"/></div>
      <div class="field">
        <label>Height</label>
        ${imperial ? `
          <div class="input-group">
            <input class="input" id="pFt" type="number" value="${ft}"/><div class="input-suffix">ft</div>
            <input class="input" id="pIn" type="number" value="${inch}"/><div class="input-suffix">in</div>
          </div>` : `
          <div class="input-group">
            <input class="input" id="pHeight" type="number" value="${Math.round(p.heightCm)}"/><div class="input-suffix">cm</div>
          </div>`}
      </div>
      <div class="field">
        <label>Weight</label>
        <div class="input-group">
          <input class="input" id="pWeight" type="number" step="0.1" value="${imperial ? Math.round(kgToLb(p.weightKg) * 10) / 10 : Math.round(p.weightKg * 10) / 10}"/>
          <div class="input-suffix">${imperial ? 'lb' : 'kg'}</div>
        </div>
      </div>
      <div class="field">
        <label>Biological sex</label>
        <select class="select" id="pSex">
          ${['male', 'female', 'other'].map((v) => `<option value="${v}" ${p.sex === v ? 'selected' : ''} style="text-transform:capitalize">${v}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Injuries or limitations</label>
        <textarea class="textarea" id="pLimits" rows="2">${esc(p.limitations)}</textarea>
      </div>
      <div class="field">
        <label>Allergies / foods to avoid</label>
        <textarea class="textarea" id="pAllergies" rows="2">${esc(p.allergies)}</textarea>
      </div>
    </div>
    <button class="btn btn-primary btn-block" id="pSave">Save & recalculate targets</button>
  `, (body) => {
    body.querySelector('#pSave').onclick = () => {
      const num = (id) => Number(body.querySelector(`#${id}`)?.value);
      update((s) => {
        const prof = s.profile;
        prof.name = body.querySelector('#pName').value.trim();
        const age = num('pAge'); if (age >= 13 && age <= 100) prof.age = age;
        if (imperial) {
          prof.heightCm = inToCm((num('pFt') || 5) * 12 + (num('pIn') || 0));
          const lb = num('pWeight'); if (lb > 0) prof.weightKg = lbToKg(lb);
        } else {
          const cm = num('pHeight'); if (cm > 0) prof.heightCm = cm;
          const kg = num('pWeight'); if (kg > 0) prof.weightKg = kg;
        }
        prof.sex = body.querySelector('#pSex').value;
        prof.limitations = body.querySelector('#pLimits').value.trim();
        prof.allergies = body.querySelector('#pAllergies').value.trim();

        if (!s.targets.manual) Object.assign(s.targets, computeTargets(prof));
      });
      closeSheet();
      toast('Profile updated');
      nav(null);
    };
  });
}

function openTargetsEditor(nav) {
  const s = get();
  const t = s.targets;
  const auto = computeTargets(s.profile);

  openSheet('Daily targets', `
    <div class="callout" style="margin-bottom:16px">
      <span class="callout-icon">🧮</span>
      <span>Calculated for you: <strong>${fmt(auto.calories)} kcal</strong>, ${auto.protein}g P / ${auto.carbs}g C / ${auto.fat}g F.
      Override any of them below if you are working from a coach's numbers.</span>
    </div>
    <div class="grid grid-2" style="margin-bottom:16px">
      <div class="field"><label>Calories</label><input class="input" id="tKcal" type="number" value="${t.calories}"/></div>
      <div class="field"><label>Protein (g)</label><input class="input" id="tP" type="number" value="${t.protein}"/></div>
      <div class="field"><label>Carbs (g)</label><input class="input" id="tC" type="number" value="${t.carbs}"/></div>
      <div class="field"><label>Fat (g)</label><input class="input" id="tF" type="number" value="${t.fat}"/></div>
      <div class="field"><label>Water (ml)</label><input class="input" id="tW" type="number" value="${t.waterMl}"/></div>
      <div class="field"><label>Steps</label><input class="input" id="tS" type="number" value="${t.steps}"/></div>
    </div>
    <div id="macroCheck" class="tiny dim center" style="margin-bottom:14px"></div>
    <button class="btn btn-primary btn-block" id="tSave">Save targets</button>
    <button class="btn btn-ghost btn-block" id="tReset" style="margin-top:10px">Reset to calculated</button>
  `, (body) => {
    const check = () => {
      const kcal = Number(body.querySelector('#tKcal').value) || 0;
      const fromMacros =
        (Number(body.querySelector('#tP').value) || 0) * 4 +
        (Number(body.querySelector('#tC').value) || 0) * 4 +
        (Number(body.querySelector('#tF').value) || 0) * 9;
      const diff = Math.round(fromMacros - kcal);
      body.querySelector('#macroCheck').innerHTML = Math.abs(diff) < 40
        ? '<span style="color:var(--accent)">✓ Macros add up to your calorie target</span>'
        : `Macros total ${fmt(fromMacros)} kcal — ${diff > 0 ? diff + ' over' : Math.abs(diff) + ' under'} your calorie target`;
    };
    body.querySelectorAll('input').forEach((i) => i.addEventListener('input', check));
    check();

    body.querySelector('#tSave').onclick = () => {
      update((st) => {
        st.targets = {
          ...st.targets,
          calories: Number(body.querySelector('#tKcal').value) || st.targets.calories,
          protein: Number(body.querySelector('#tP').value) || st.targets.protein,
          carbs: Number(body.querySelector('#tC').value) || st.targets.carbs,
          fat: Number(body.querySelector('#tF').value) || st.targets.fat,
          waterMl: Number(body.querySelector('#tW').value) || st.targets.waterMl,
          steps: Number(body.querySelector('#tS').value) || st.targets.steps,
          manual: true
        };
      });
      closeSheet();
      toast('Targets updated');
      nav(null);
    };

    body.querySelector('#tReset').onclick = () => {
      update((st) => { st.targets = { ...st.targets, ...computeTargets(st.profile), manual: false }; });
      closeSheet();
      toast('Back to calculated targets');
      nav(null);
    };
  });
}

function openSetting(key, nav) {
  const p = get().profile;

  const optionSheet = (title, options, currentValue, onPick, note = '') => {
    openSheet(title, `
      ${note ? `<p class="small muted" style="line-height:1.6;margin-bottom:14px">${esc(note)}</p>` : ''}
      <div class="option-grid one">
        ${options.map((o) => `
          <button class="option ${o.id === currentValue ? 'selected' : ''}" data-opt="${esc(o.id)}">
            <span class="option-title">${esc(o.label)}</span>
            ${o.desc ? `<span class="option-desc">${esc(o.desc)}</span>` : ''}
          </button>`).join('')}
      </div>
    `, (body) => {
      body.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
        onPick(b.dataset.opt);
        closeSheet();
        nav(null);
      }));
    });
  };

  const setAndRecalc = (field) => (value) => {
    update((s) => {
      s.profile[field] = isNaN(Number(value)) ? value : Number(value);
      if (!s.targets.manual) Object.assign(s.targets, computeTargets(s.profile));
    });
    toast('Updated');
  };

  switch (key) {
    case 'goal':
      return optionSheet('Your goal',
        Object.entries(GOALS).map(([id, v]) => ({ id, label: v.label, desc: v.desc })),
        p.goal, setAndRecalc('goal'), 'Changing this recalculates your calorie and protein targets.');

    case 'activity':
      return optionSheet('Activity level',
        Object.entries(ACTIVITY).map(([id, v]) => ({ id, label: v.label, desc: v.desc })),
        p.activityLevel, setAndRecalc('activityLevel'));

    case 'experience':
      return optionSheet('Training experience',
        Object.entries(EXPERIENCE).map(([id, v]) => ({ id, label: v.label, desc: v.desc })),
        p.experience, setAndRecalc('experience'), 'Affects set volume and rep ranges when you rebuild your program.');

    case 'days':
      return optionSheet('Training days per week',
        [2, 3, 4, 5, 6, 7].map((d) => ({ id: String(d), label: `${d} days`, desc: splitHint(d) })),
        String(p.daysPerWeek), setAndRecalc('daysPerWeek'), 'Rebuild your program afterwards to apply the new split.');

    case 'session':
      return optionSheet('Session length',
        [30, 45, 60, 75, 90].map((m) => ({ id: String(m), label: `${m} minutes` })),
        String(p.sessionMinutes), setAndRecalc('sessionMinutes'));

    case 'diet':
      return optionSheet('Diet style',
        ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'mediterranean'].map((d) => ({ id: d, label: d[0].toUpperCase() + d.slice(1) })),
        p.dietStyle, setAndRecalc('dietStyle'), 'Used when generating meal plans and food suggestions.');

    case 'equipment':
      return openEquipment(nav);
  }
}

function openEquipment(nav) {
  const p = get().profile;
  const ALL = [
    ['barbell', 'Barbell & rack'], ['dumbbell', 'Dumbbells'], ['machine', 'Machines'],
    ['cable', 'Cables'], ['kettlebell', 'Kettlebells'], ['bodyweight', 'Bodyweight only']
  ];

  openSheet('Available equipment', `
    <p class="small muted" style="line-height:1.6;margin-bottom:14px">Your program only uses what you select here.</p>
    <div class="option-grid" id="equipGrid">
      ${ALL.map(([id, label]) => `
        <button class="option ${p.equipment.includes(id) ? 'selected' : ''}" data-equip="${id}">
          <span class="option-title">${label}</span>
        </button>`).join('')}
    </div>
    <button class="btn btn-primary btn-block" id="equipSave" style="margin-top:18px">Save</button>
  `, (body) => {
    let selected = [...p.equipment];
    const paint = () => body.querySelectorAll('[data-equip]').forEach((b) =>
      b.classList.toggle('selected', selected.includes(b.dataset.equip)));

    body.querySelectorAll('[data-equip]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.equip;
      if (id === 'bodyweight' && !selected.includes('bodyweight')) selected = ['bodyweight'];
      else if (selected.includes(id)) selected = selected.filter((x) => x !== id);
      else selected = [...selected.filter((x) => x !== 'bodyweight'), id];
      if (!selected.length) selected = ['bodyweight'];
      paint();
    }));

    body.querySelector('#equipSave').onclick = () => {
      update((s) => { s.profile.equipment = selected; });
      closeSheet();
      toast('Equipment updated — rebuild your program to apply it');
      nav(null);
    };
  });
}

const splitHint = (d) => ({
  2: 'Full body twice a week', 3: 'Full body three times', 4: 'Upper / lower split',
  5: 'Push / pull / legs + upper / lower', 6: 'Push / pull / legs twice', 7: 'PPL twice plus conditioning'
}[d] || '');
