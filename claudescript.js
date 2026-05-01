/* ═══════════════════════════════════════════════════════════
   SleekMed — script.js
   Full application logic: auth, navigation, data, analytics
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── DRUG DATA (Top 30) ─── */
const DRUGS = [
  {
    name: 'Atorvastatin',
    generic: 'Generic Lipitor',
    category: 'Cardiovascular',
    dosage: '40mg · 30 tabs',
    hospital: 312,
    insurance: 48,
    sleekmed: 8.40,
  },
  {
    name: 'Lisinopril',
    generic: 'Generic Zestril',
    category: 'Cardiovascular',
    dosage: '10mg · 30 tabs',
    hospital: 198,
    insurance: 35,
    sleekmed: 4.20,
  },
  {
    name: 'Amlodipine',
    generic: 'Generic Norvasc',
    category: 'Cardiovascular',
    dosage: '5mg · 30 tabs',
    hospital: 224,
    insurance: 38,
    sleekmed: 5.80,
  },
  {
    name: 'Metoprolol Succinate',
    generic: 'Generic Toprol-XL',
    category: 'Cardiovascular',
    dosage: '50mg · 30 tabs',
    hospital: 264,
    insurance: 42,
    sleekmed: 11.20,
  },
  {
    name: 'Losartan',
    generic: 'Generic Cozaar',
    category: 'Cardiovascular',
    dosage: '50mg · 30 tabs',
    hospital: 248,
    insurance: 40,
    sleekmed: 9.80,
  },
  {
    name: 'Metformin',
    generic: 'Generic Glucophage',
    category: 'Metabolic',
    dosage: '500mg · 60 tabs',
    hospital: 186,
    insurance: 32,
    sleekmed: 4.60,
  },
  {
    name: 'Ozempic',
    generic: 'Semaglutide',
    category: 'Endocrine',
    dosage: '0.5mg · 4 pens',
    hospital: 1142,
    insurance: 280,
    sleekmed: 189.00,
  },
  {
    name: 'Jardiance',
    generic: 'Empagliflozin',
    category: 'Metabolic',
    dosage: '10mg · 30 tabs',
    hospital: 674,
    insurance: 95,
    sleekmed: 47.80,
  },
  {
    name: 'Eliquis',
    generic: 'Apixaban',
    category: 'Anticoagulant',
    dosage: '5mg · 60 tabs',
    hospital: 762,
    insurance: 110,
    sleekmed: 62.40,
  },
  {
    name: 'Escitalopram',
    generic: 'Generic Lexapro',
    category: 'Mental Health',
    dosage: '10mg · 30 tabs',
    hospital: 228,
    insurance: 40,
    sleekmed: 6.20,
  },
  {
    name: 'Sertraline',
    generic: 'Generic Zoloft',
    category: 'Mental Health',
    dosage: '50mg · 30 tabs',
    hospital: 214,
    insurance: 36,
    sleekmed: 5.40,
  },
  {
    name: 'Bupropion XL',
    generic: 'Generic Wellbutrin',
    category: 'Mental Health',
    dosage: '150mg · 30 tabs',
    hospital: 280,
    insurance: 44,
    sleekmed: 12.60,
  },
  {
    name: 'Sildenafil',
    generic: 'Generic Revatio / Viagra',
    category: 'Cardiovascular',
    dosage: '20mg · 30 tabs',
    hospital: 1024,
    insurance: 95,
    sleekmed: 18.40,
  },
  {
    name: 'Omeprazole',
    generic: 'Generic Prilosec',
    category: 'Gastrointestinal',
    dosage: '20mg · 30 tabs',
    hospital: 142,
    insurance: 28,
    sleekmed: 3.80,
  },
  {
    name: 'Pantoprazole',
    generic: 'Generic Protonix',
    category: 'Gastrointestinal',
    dosage: '40mg · 30 tabs',
    hospital: 162,
    insurance: 30,
    sleekmed: 5.10,
  },
  {
    name: 'Montelukast',
    generic: 'Generic Singulair',
    category: 'Respiratory',
    dosage: '10mg · 30 tabs',
    hospital: 198,
    insurance: 35,
    sleekmed: 7.20,
  },
  {
    name: 'Albuterol HFA',
    generic: 'Generic ProAir',
    category: 'Respiratory',
    dosage: '90mcg · 1 inhaler',
    hospital: 284,
    insurance: 55,
    sleekmed: 24.60,
  },
  {
    name: 'Fluticasone',
    generic: 'Generic Flonase',
    category: 'Respiratory',
    dosage: '50mcg · 120 sprays',
    hospital: 196,
    insurance: 38,
    sleekmed: 8.90,
  },
  {
    name: 'Gabapentin',
    generic: 'Generic Neurontin',
    category: 'Pain & Inflammation',
    dosage: '300mg · 90 caps',
    hospital: 226,
    insurance: 38,
    sleekmed: 9.40,
  },
  {
    name: 'Meloxicam',
    generic: 'Generic Mobic',
    category: 'Pain & Inflammation',
    dosage: '15mg · 30 tabs',
    hospital: 174,
    insurance: 30,
    sleekmed: 4.80,
  },
  {
    name: 'Trazodone',
    generic: 'Generic Desyrel',
    category: 'Mental Health',
    dosage: '100mg · 30 tabs',
    hospital: 186,
    insurance: 32,
    sleekmed: 4.60,
  },
  {
    name: 'Levothyroxine',
    generic: 'Generic Synthroid',
    category: 'Endocrine',
    dosage: '50mcg · 30 tabs',
    hospital: 152,
    insurance: 28,
    sleekmed: 3.40,
  },
  {
    name: 'Rosuvastatin',
    generic: 'Generic Crestor',
    category: 'Cardiovascular',
    dosage: '20mg · 30 tabs',
    hospital: 342,
    insurance: 52,
    sleekmed: 14.20,
  },
  {
    name: 'Doxycycline',
    generic: 'Antibiotic',
    category: 'Antibiotic',
    dosage: '100mg · 20 caps',
    hospital: 184,
    insurance: 30,
    sleekmed: 8.20,
  },
  {
    name: 'Amoxicillin',
    generic: 'Generic Amoxil',
    category: 'Antibiotic',
    dosage: '500mg · 30 caps',
    hospital: 148,
    insurance: 24,
    sleekmed: 4.00,
  },
  {
    name: 'Prednisone',
    generic: 'Generic Deltasone',
    category: 'Pain & Inflammation',
    dosage: '10mg · 30 tabs',
    hospital: 134,
    insurance: 22,
    sleekmed: 3.20,
  },
  {
    name: 'Clonazepam',
    generic: 'Generic Klonopin',
    category: 'Mental Health',
    dosage: '0.5mg · 30 tabs',
    hospital: 196,
    insurance: 34,
    sleekmed: 5.60,
  },
  {
    name: 'Azelastine',
    generic: 'Generic Astepro',
    category: 'Respiratory',
    dosage: '0.15% · 200 sprays',
    hospital: 212,
    insurance: 38,
    sleekmed: 14.40,
  },
  {
    name: 'Hydrocortisone Cream',
    generic: 'Generic Cortaid',
    category: 'Dermatology',
    dosage: '2.5% · 30g tube',
    hospital: 96,
    insurance: 18,
    sleekmed: 2.80,
  },
  {
    name: 'Tretinoin',
    generic: 'Generic Retin-A',
    category: 'Dermatology',
    dosage: '0.05% · 20g tube',
    hospital: 284,
    insurance: 48,
    sleekmed: 18.60,
  },
];

/* ─── CONTRACT DATA ─── */
const CONTRACTS = [
  { partner: 'CVS Health Network', type: 'Retail Chain', exp: '2027-03-31', locations: '9,847', volume: '2.1M/mo', status: 'active' },
  { partner: 'Walgreens Rx Group', type: 'Retail Chain', exp: '2026-12-15', locations: '7,312', volume: '1.8M/mo', status: 'active' },
  { partner: 'Walmart Pharmacy', type: 'Retail Chain', exp: '2026-08-30', locations: '4,624', volume: '940K/mo', status: 'pending' },
  { partner: 'Costco Pharmacy', type: 'Warehouse', exp: '2027-06-30', locations: '584', volume: '380K/mo', status: 'active' },
  { partner: 'Kroger Health', type: 'Grocery Chain', exp: '2025-11-30', locations: '2,218', volume: '620K/mo', status: 'expired' },
  { partner: 'Rite Aid Group', type: 'Retail Chain', exp: '2026-09-15', locations: '2,100', volume: '410K/mo', status: 'active' },
  { partner: 'Independent Rx Alliance', type: 'Independents', exp: '2027-01-31', locations: '48,727', volume: '3.4M/mo', status: 'active' },
];

/* ─── ANALYTICS DATA ─── */
const CATEGORY_SAVINGS = [
  { label: 'Cardiovascular', pct: 96 },
  { label: 'Mental Health', pct: 88 },
  { label: 'Endocrine', pct: 82 },
  { label: 'Metabolic', pct: 91 },
  { label: 'Pain & Inflammation', pct: 85 },
  { label: 'Respiratory', pct: 78 },
  { label: 'Gastrointestinal', pct: 93 },
  { label: 'Antibiotic', pct: 89 },
];

/* ──────────────────────────────────────────────────────────
   UTILITY
──────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function fmt(n) {
  return n < 10
    ? '$' + n.toFixed(2)
    : '$' + Math.round(n).toLocaleString();
}

function savings(drug) {
  const pct = Math.round(((drug.hospital - drug.sleekmed) / drug.hospital) * 100);
  return pct;
}

function initials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function genMemberId() {
  return 'SM-' + Math.floor(100000 + Math.random() * 900000);
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* ──────────────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────────────────── */
let state = {
  loggedIn: false,
  user: { name: '', email: '', memberId: '' },
  activeTab: 'search',
};

function loadState() {
  try {
    const saved = sessionStorage.getItem('sleekmed_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      return true;
    }
  } catch (_) {}
  return false;
}

function saveState() {
  try {
    sessionStorage.setItem('sleekmed_session', JSON.stringify(state));
  } catch (_) {}
}

/* ──────────────────────────────────────────────────────────
   LOGIN / LOGOUT
──────────────────────────────────────────────────────────── */
function handleLogin() {
  const name  = $('login-name').value.trim();
  const email = $('login-email').value.trim();
  const code  = $('login-code').value.trim();

  if (!name) { highlightField('login-name'); return; }
  if (!email || !email.includes('@')) { highlightField('login-email'); return; }
  if (!code) { highlightField('login-code'); return; }

  state.loggedIn = true;
  state.user.name     = name;
  state.user.email    = email;
  state.user.memberId = genMemberId();
  saveState();
  bootApp();
}

function highlightField(id) {
  const el = $(id);
  el.style.borderColor = 'var(--red)';
  el.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)';
  el.focus();
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 1800);
}

function handleLogout() {
  state.loggedIn = false;
  state.user = { name: '', email: '', memberId: '' };
  sessionStorage.removeItem('sleekmed_session');
  closeSidebar();
  $('app').classList.add('hidden');
  $('login-gate').style.display = '';
  $('login-name').value = '';
  $('login-email').value = '';
  $('login-code').value = '';
}

/* ──────────────────────────────────────────────────────────
   BOOT APP
──────────────────────────────────────────────────────────── */
function bootApp() {
  $('login-gate').style.display = 'none';
  $('app').classList.remove('hidden');

  injectUserData();
  renderDrugGrid(DRUGS);
  renderContractTable();
  renderAnalytics();
  populateProfile();

  switchTab(state.activeTab || 'search');
}

function injectUserData() {
  const { name, email, memberId } = state.user;
  const ini = initials(name);

  // Sidebar
  $('sidebar-avatar').textContent    = ini;
  $('sidebar-member-name').textContent = name;
  $('sidebar-member-email').textContent = email;

  // Access card
  $('card-member-name').textContent  = name.toUpperCase();
  $('card-member-email').textContent = email;
  $('card-member-id').textContent    = memberId;

  // Profile
  $('profile-avatar').textContent    = ini;
  $('profile-name-display').textContent = name;
  $('pf-name').value   = name;
  $('pf-email').value  = email;
}

/* ──────────────────────────────────────────────────────────
   DRUG GRID
──────────────────────────────────────────────────────────── */
function renderDrugGrid(drugs) {
  const grid = $('drug-grid');
  grid.innerHTML = '';

  if (!drugs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);font-family:var(--font-mono);font-size:12px;">NO RESULTS MATCH YOUR CRITERIA</div>`;
    return;
  }

  drugs.forEach((d, i) => {
    const pct = savings(d);
    const card = document.createElement('div');
    card.className = 'drug-card';
    card.style.animationDelay = (i * 25) + 'ms';
    card.innerHTML = `
      <div class="drug-card-header">
        <div>
          <div class="drug-name">${d.name}</div>
          <div class="drug-generic">${d.generic}</div>
        </div>
        <div class="drug-category-badge">${d.category}</div>
      </div>
      <div class="price-matrix">
        <div class="price-cell hospital">
          <div class="price-label">HOSP. CASH PAY</div>
          <div class="price-val">${fmt(d.hospital)}</div>
        </div>
        <div class="price-cell insurance">
          <div class="price-label">INS. CO-PAY AVG</div>
          <div class="price-val">${fmt(d.insurance)}</div>
        </div>
        <div class="price-cell sleekmed">
          <div class="price-label">SLEEKMED DIRECT</div>
          <div class="price-val">${fmt(d.sleekmed)}</div>
        </div>
      </div>
      <div class="drug-footer">
        <div class="savings-badge">SAVE ${pct}% vs Hospital</div>
        <div class="drug-dosage">${d.dosage}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterDrugs() {
  const q   = $('drug-search').value.trim().toLowerCase();
  const cat = $('filter-cat').value;
  const filtered = DRUGS.filter(d => {
    const matchQ   = !q || d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q);
    const matchCat = !cat || d.category === cat;
    return matchQ && matchCat;
  });
  renderDrugGrid(filtered);
}

/* ──────────────────────────────────────────────────────────
   CONTRACT TABLE
──────────────────────────────────────────────────────────── */
function renderContractTable() {
  const tbody = $('contract-tbody');
  tbody.innerHTML = '';
  CONTRACTS.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-primary);font-weight:500;">${c.partner}</td>
      <td>${c.type}</td>
      <td style="font-family:var(--font-mono);font-size:11px;">${c.exp}</td>
      <td style="font-family:var(--font-mono);">${c.locations}</td>
      <td style="font-family:var(--font-mono);">${c.volume}</td>
      <td><span class="contract-status ${c.status}">${c.status.toUpperCase()}</span></td>
      <td><button class="action-btn">VIEW</button></td>
    `;
    tbody.appendChild(tr);
  });
}

/* ──────────────────────────────────────────────────────────
   ANALYTICS
──────────────────────────────────────────────────────────── */
function renderAnalytics() {
  // Bar chart
  const chart = $('savings-bar-chart');
  chart.innerHTML = '';
  CATEGORY_SAVINGS.forEach(item => {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <div class="bar-label">${item.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:0%" data-target="${item.pct}%"></div>
      </div>
      <div class="bar-val">${item.pct}%</div>
    `;
    chart.appendChild(row);
  });

  // Animate bars
  requestAnimationFrame(() => {
    $$('.bar-fill').forEach(el => {
      el.style.width = el.dataset.target;
    });
  });

  // Top drugs list
  const sorted = [...DRUGS].sort((a,b) => (b.hospital - b.sleekmed) - (a.hospital - a.sleekmed)).slice(0,8);
  const list = $('top-drugs-list');
  list.innerHTML = '';
  sorted.forEach((d, i) => {
    const savedAmt = fmt(d.hospital - d.sleekmed);
    const row = document.createElement('div');
    row.className = 'top-drug-row';
    row.innerHTML = `
      <div class="top-drug-rank">${String(i+1).padStart(2,'0')}</div>
      <div class="top-drug-name">${d.name}</div>
      <div class="top-drug-savings">${savedAmt} saved</div>
    `;
    list.appendChild(row);
  });

  // Heatmap
  const heatmap = $('heatmap-grid');
  heatmap.innerHTML = '';
  const levels = [0.05,0.1,0.15,0.25,0.35,0.5,0.65,0.8,0.95,1.0];
  for (let i = 0; i < 91; i++) {
    const lvl = levels[Math.floor(Math.random() * levels.length)];
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.style.background = `rgba(16,185,129,${lvl})`;
    cell.title = `Day ${i+1}: ${Math.round(lvl * 12400)} claims`;
    heatmap.appendChild(cell);
  }
}

/* ──────────────────────────────────────────────────────────
   PROFILE
──────────────────────────────────────────────────────────── */
function populateProfile() {
  $('pf-name').value  = state.user.name;
  $('pf-email').value = state.user.email;
}

function saveProfile() {
  const newName  = $('pf-name').value.trim();
  const newEmail = $('pf-email').value.trim();
  if (!newName) { highlightField('pf-name'); return; }
  state.user.name  = newName || state.user.name;
  state.user.email = newEmail || state.user.email;
  saveState();
  injectUserData();
  showToast('Profile saved · Changes applied to Access Card');
}

/* ──────────────────────────────────────────────────────────
   TAB NAVIGATION
──────────────────────────────────────────────────────────── */
function switchTab(tab) {
  state.activeTab = tab;
  saveState();

  // Panels
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = $('tab-' + tab);
  if (panel) panel.classList.add('active');

  // Bottom nav
  $$('.bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });

  // Sidebar links
  $$('.sidebar-link[data-tab]').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}

/* ──────────────────────────────────────────────────────────
   SIDEBAR
──────────────────────────────────────────────────────────── */
function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebar-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────
   EVENT LISTENERS
──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Login
  $('login-btn').addEventListener('click', handleLogin);
  ['login-name','login-email','login-code'].forEach(id => {
    $(id).addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });

  // Sidebar
  $('menu-btn').addEventListener('click', openSidebar);
  $('sidebar-close').addEventListener('click', closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);

  // Sidebar nav
  $$('.sidebar-link[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      closeSidebar();
    });
  });

  // Logout
  $('logout-btn').addEventListener('click', handleLogout);

  // Bottom nav
  $$('.bnav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Drug search & filter
  $('drug-search').addEventListener('input', filterDrugs);
  $('filter-cat').addEventListener('change', filterDrugs);

  // Profile save
  $('save-profile-btn').addEventListener('click', saveProfile);

  // Partner action buttons (delegated)
  document.addEventListener('click', e => {
    if (e.target.classList.contains('action-btn')) {
      showToast('Contract detail view · Coming in v2.1');
    }
  });

  // Session restore
  if (loadState() && state.loggedIn) {
    bootApp();
  }
});