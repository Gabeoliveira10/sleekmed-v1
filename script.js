'use strict';

/* DRUG DATA */
const DRUGS = [
  { name: 'Atorvastatin', generic: 'Generic Lipitor', category: 'Cardiovascular', dosage: '40mg · 30 tabs', hospital: 312, insurance: 48, sleekmed: 8.40 },
  { name: 'Lisinopril', generic: 'Generic Zestril', category: 'Cardiovascular', dosage: '10mg · 30 tabs', hospital: 198, insurance: 35, sleekmed: 4.20 },
  { name: 'Amlodipine', generic: 'Generic Norvasc', category: 'Cardiovascular', dosage: '5mg · 30 tabs', hospital: 224, insurance: 38, sleekmed: 5.80 },
  { name: 'Metformin', generic: 'Generic Glucophage', category: 'Metabolic', dosage: '500mg · 60 tabs', hospital: 186, insurance: 32, sleekmed: 4.60 },
  { name: 'Ozempic', generic: 'Semaglutide', category: 'Endocrine', dosage: '0.5mg · 4 pens', hospital: 1142, insurance: 280, sleekmed: 189.00 },
  { name: 'Escitalopram', generic: 'Generic Lexapro', category: 'Mental Health', dosage: '10mg · 30 tabs', hospital: 228, insurance: 40, sleekmed: 6.20 },
  { name: 'Sertraline', generic: 'Generic Zoloft', category: 'Mental Health', dosage: '50mg · 30 tabs', hospital: 214, insurance: 36, sleekmed: 5.40 },
  { name: 'Omeprazole', generic: 'Generic Prilosec', category: 'Gastrointestinal', dosage: '20mg · 30 tabs', hospital: 142, insurance: 28, sleekmed: 3.80 },
  { name: 'Montelukast', generic: 'Generic Singulair', category: 'Respiratory', dosage: '10mg · 30 tabs', hospital: 198, insurance: 35, sleekmed: 7.20 },
  { name: 'Gabapentin', generic: 'Generic Neurontin', category: 'Pain & Inflammation', dosage: '300mg · 90 caps', hospital: 226, insurance: 38, sleekmed: 9.40 },
  { name: 'Amoxicillin', generic: 'Generic Amoxil', category: 'Antibiotic', dosage: '500mg · 30 caps', hospital: 148, insurance: 24, sleekmed: 4.00 },
  { name: 'Levothyroxine', generic: 'Generic Synthroid', category: 'Endocrine', dosage: '50mcg · 30 tabs', hospital: 152, insurance: 28, sleekmed: 3.40 }
];

/* UTILS */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => n < 10 ? '$' + n.toFixed(2) : '$' + Math.round(n).toLocaleString();

function initials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts.slice(0, 2).toUpperCase();
  return (parts + parts[parts.length - 1]).toUpperCase();
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

/* STATE */
let state = {
  loggedIn: false,
  isAdmin: false,
  user: { name: '', email: '', memberId: '' },
  activeTab: 'search',
};

/* BOOT & RENDER */
function bootApp() {
  updateUIForAuth();
  renderDrugGrid(DRUGS.slice(0, 6)); // Show only top 6 initially
  renderContractTable();
  switchTab(state.activeTab || 'search');
}

function updateUIForAuth() {
  const reqEls = $$('.auth-required');
  const adminEls = $$('.admin-only');
  
  if (state.loggedIn) {
    $('topbar-profile-text').textContent = 'Profile';
    $('sidebar-member-section').style.display = 'flex';
    reqEls.forEach(el => el.style.display = '');
    injectUserData();
  } else {
    $('topbar-profile-text').textContent = 'Sign In';
    $('sidebar-member-section').style.display = 'none';
    reqEls.forEach(el => el.style.display = 'none');
  }

  if (state.isAdmin) {
    adminEls.forEach(el => el.style.display = '');
  } else {
    adminEls.forEach(el => el.style.display = 'none');
  }
}

function injectUserData() {
  const { name, email, memberId } = state.user;
  const ini = initials(name || 'Member');
  
  $('sidebar-avatar').textContent = ini;
  $('sidebar-member-name').textContent = name;
  $('sidebar-member-email').textContent = email;

  $('card-member-name').textContent = name.toUpperCase();
  $('card-member-email').textContent = email;
  $('card-member-id').textContent = memberId;

  $('profile-avatar').textContent = ini;
  $('profile-name-display').textContent = name;
  $('pf-name').value = name;
  $('pf-email').value = email;
}

/* DRUG GRID & MODAL */
function renderDrugGrid(drugs) {
  const grid = $('drug-grid');
  grid.innerHTML = '';

  if (!drugs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">No medications found.</div>`;
    return;
  }

  drugs.forEach((d) => {
    const card = document.createElement('div');
    card.className = 'drug-card';
    card.innerHTML = `
      <div class="drug-name">${d.name}</div>
      <div class="drug-generic">${d.generic}</div>
      <div class="drug-footer">
        <div class="savings-badge">As low as ${fmt(d.sleekmed)}</div>
        <div class="drug-dosage">${d.dosage}</div>
      </div>
    `;
    card.addEventListener('click', () => openDrugModal(d));
    grid.appendChild(card);
  });
}

function filterDrugs() {
  const q = $('drug-search').value.trim().toLowerCase();
  $('grid-heading').textContent = q ? 'Search Results' : 'Popular Medications';
  
  const filtered = DRUGS.filter(d => 
    d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q)
  );
  
  // If searching, show all matches. If empty, show top 6.
  renderDrugGrid(q ? filtered : DRUGS.slice(0, 6));
}

function openDrugModal(d) {
  // Generate comparison prices
  const goodRx = d.sleekmed * 1.4;
  const costPlus = d.sleekmed * 1.25;
  
  $('modal-content').innerHTML = `
    <div class="modal-drug-title">${d.name}</div>
    <div class="modal-drug-sub">${d.generic} · ${d.dosage}</div>
    
    <div style="font-weight: 600; margin-bottom: 12px; color: var(--text-secondary);">Estimated Prices</div>
    <div class="price-comparison-list">
      <div class="price-row best-price">
        <span class="price-source">SleekMed Direct</span>
        <span class="price-value">${fmt(d.sleekmed)}</span>
      </div>
      <div class="price-row">
        <span class="price-source">Cost Plus Drugs</span>
        <span class="price-value">${fmt(costPlus)}</span>
      </div>
      <div class="price-row">
        <span class="price-source">GoodRx (Avg)</span>
        <span class="price-value">${fmt(goodRx)}</span>
      </div>
      <div class="price-row">
        <span class="price-source">Insurance Co-Pay (Avg)</span>
        <span class="price-value">${fmt(d.insurance)}</span>
      </div>
      <div class="price-row" style="opacity: 0.6;">
        <span class="price-source">Hospital Cash Pay</span>
        <span class="price-value" style="text-decoration: line-through;">${fmt(d.hospital)}</span>
      </div>
    </div>
    ${!state.loggedIn ? `<button class="gate-btn" style="margin-top: 24px;" onclick="closeModal(); openAuth();">Get Savings Card</button>` : ''}
  `;
  
  $('modal-overlay').classList.remove('hidden');
  $('drug-modal').classList.remove('hidden');
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
  $('drug-modal').classList.add('hidden');
}

/* AUTHENTICATION */
function openAuth() {
  $('auth-overlay').classList.remove('hidden');
  $('auth-panel').classList.remove('hidden');
}

function closeAuth() {
  $('auth-overlay').classList.add('hidden');
  $('auth-panel').classList.add('hidden');
}

function handleLogin() {
  const name = $('login-name').value.trim();
  const email = $('login-email').value.trim();
  const code = $('login-code').value.trim();

  if (!email) { $('login-email').focus(); return; }

  // Secret Admin check
  if (email === 'admin@sleekmed.com' && code === 'SM2026#') {
    state.isAdmin = true;
    showToast('Admin Portal Unlocked');
  } else {
    state.isAdmin = false;
  }

  state.loggedIn = true;
  state.user = {
    name: name || 'Valued Member',
    email: email,
    memberId: 'SM-' + Math.floor(100000 + Math.random() * 900000)
  };
  
  closeAuth();
  updateUIForAuth();
  switchTab(state.isAdmin ? 'partner' : 'access');
  showToast('Account verified. Access card ready.');
}

function handleLogout() {
  state.loggedIn = false;
  state.isAdmin = false;
  state.user = { name: '', email: '', memberId: '' };
  
  $('sidebar-close').click(); // close sidebar
  updateUIForAuth();
  switchTab('search');
  showToast('Successfully signed out.');
}

/* ADMIN PORTAL */
function renderContractTable() {
  const tbody = $('contract-tbody');
  tbody.innerHTML = `
    <tr><td>CVS Health Network</td><td>Retail Chain</td><td>2027-03-31</td><td style="color:var(--emerald-dim);font-weight:700;">ACTIVE</td></tr>
    <tr><td>Walgreens Rx Group</td><td>Retail Chain</td><td>2026-12-15</td><td style="color:var(--emerald-dim);font-weight:700;">ACTIVE</td></tr>
    <tr><td>Costco Pharmacy</td><td>Warehouse</td><td>2027-06-30</td><td style="color:var(--amber);font-weight:700;">PENDING</td></tr>
  `;
}

/* NAVIGATION */
function switchTab(tab) {
  state.activeTab = tab;
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = $('tab-' + tab);
  if (panel) panel.classList.add('active');

  $$('.bnav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.sidebar-link[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

/* EVENT LISTENERS */
document.addEventListener('DOMContentLoaded', () => {
  bootApp();

  // Topbar Profile Button
  $('topbar-profile-btn').addEventListener('click', () => {
    if (state.loggedIn) switchTab('profile');
    else openAuth();
  });

  // Auth Panel
  $('login-btn').addEventListener('click', handleLogin);
  $('close-auth').addEventListener('click', closeAuth);
  $('auth-overlay').addEventListener('click', closeAuth);

  // Modal
  $('close-modal').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', closeModal);

  // Search
  $('drug-search').addEventListener('input', filterDrugs);

  // Sidebar
  $('menu-btn').addEventListener('click', () => {
    $('sidebar').classList.add('open');
    $('sidebar-overlay').classList.add('open');
  });
  const closeSidebar = () => {
    $('sidebar').classList.remove('open');
    $('sidebar-overlay').classList.remove('open');
  };
  $('sidebar-close').addEventListener('click', closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);

  // Nav Links
  $$('.sidebar-link[data-tab], .bnav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      switchTab(tab);
      closeSidebar();
    });
  });

  // Profile Save
  $('save-profile-btn').addEventListener('click', () => {
    state.user.name = $('pf-name').value;
    state.user.email = $('pf-email').value;
    injectUserData();
    showToast('Profile and Access Card updated.');
  });

  $('logout-btn').addEventListener('click', handleLogout);
});
