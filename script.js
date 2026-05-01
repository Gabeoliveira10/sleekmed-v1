/* ═══════════════════════════════════════════════════════════════
   SLEEKMED — PRODUCTION SCRIPT
   script.js — All functional modules
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── GLOBAL STATE ───────────────────────────────────────────── */
const State = {
  user: null,           // { name, email, avatar }
  vault: {},            // Insurance & identity fields
  cabinet: [],          // Saved medications
  currentDrug: null,
  currentVariant: null,
  adminLoggedIn: false,
  onboardStep: 1,
  activeFee: 2.50,
};

/* ─── MEDICATION DATABASE — 30+ DRUGS ───────────────────────── */
const DRUGS = [
  {
    name: "Metformin",
    category: "Diabetes",
    icon: "💊",
    variants: [
      { label: "500mg · 30 tabs", sleekmed: 4.87, goodrx: 6.20, costplus: 3.90, insurance: 15.00 },
      { label: "500mg · 90 tabs", sleekmed: 8.40, goodrx: 11.50, costplus: 7.20, insurance: 35.00 },
      { label: "1000mg · 30 tabs", sleekmed: 5.50, goodrx: 7.80, costplus: 4.50, insurance: 18.00 },
      { label: "1000mg · 90 tabs", sleekmed: 12.20, goodrx: 16.40, costplus: 9.80, insurance: 42.00 },
    ]
  },
  {
    name: "Lisinopril",
    category: "Blood Pressure",
    icon: "💊",
    variants: [
      { label: "5mg · 30 tabs", sleekmed: 3.50, goodrx: 5.10, costplus: 2.80, insurance: 12.00 },
      { label: "10mg · 30 tabs", sleekmed: 4.20, goodrx: 6.00, costplus: 3.30, insurance: 14.00 },
      { label: "20mg · 30 tabs", sleekmed: 4.80, goodrx: 7.20, costplus: 3.90, insurance: 16.00 },
      { label: "20mg · 90 tabs", sleekmed: 10.50, goodrx: 14.80, costplus: 8.40, insurance: 38.00 },
    ]
  },
  {
    name: "Atorvastatin",
    category: "Cholesterol",
    icon: "💊",
    variants: [
      { label: "10mg · 30 tabs", sleekmed: 7.40, goodrx: 10.20, costplus: 5.80, insurance: 22.00 },
      { label: "20mg · 30 tabs", sleekmed: 8.90, goodrx: 12.50, costplus: 6.90, insurance: 26.00 },
      { label: "40mg · 30 tabs", sleekmed: 10.20, goodrx: 14.80, costplus: 8.10, insurance: 30.00 },
      { label: "80mg · 30 tabs", sleekmed: 12.60, goodrx: 17.20, costplus: 9.80, insurance: 36.00 },
    ]
  },
  {
    name: "Ozempic",
    category: "Diabetes / Weight",
    icon: "💉",
    variants: [
      { label: "0.25mg/0.5mg · 1 pen", sleekmed: 89.00, goodrx: 136.50, costplus: 82.00, insurance: 178.00 },
      { label: "1mg · 1 pen", sleekmed: 112.00, goodrx: 158.00, costplus: 98.00, insurance: 210.00 },
      { label: "2mg · 1 pen", sleekmed: 134.00, goodrx: 188.00, costplus: 118.00, insurance: 245.00 },
    ]
  },
  {
    name: "Semaglutide",
    category: "Diabetes / Weight",
    icon: "💉",
    variants: [
      { label: "2.4mg weekly · 4 pens", sleekmed: 210.00, goodrx: 320.00, costplus: 195.00, insurance: 420.00 },
      { label: "Oral 7mg · 30 tabs", sleekmed: 88.00, goodrx: 140.00, costplus: 79.00, insurance: 185.00 },
      { label: "Oral 14mg · 30 tabs", sleekmed: 110.00, goodrx: 168.00, costplus: 98.00, insurance: 220.00 },
    ]
  },
  {
    name: "Adderall",
    category: "ADHD",
    icon: "💊",
    variants: [
      { label: "10mg IR · 30 tabs", sleekmed: 28.40, goodrx: 42.00, costplus: 24.50, insurance: 55.00 },
      { label: "20mg IR · 30 tabs", sleekmed: 34.80, goodrx: 52.00, costplus: 29.00, insurance: 65.00 },
      { label: "30mg XR · 30 caps", sleekmed: 48.20, goodrx: 68.00, costplus: 42.00, insurance: 88.00 },
    ]
  },
  {
    name: "Lexapro",
    category: "Antidepressant",
    icon: "💊",
    variants: [
      { label: "5mg · 30 tabs", sleekmed: 9.80, goodrx: 14.20, costplus: 7.90, insurance: 25.00 },
      { label: "10mg · 30 tabs", sleekmed: 11.40, goodrx: 16.80, costplus: 9.20, insurance: 28.00 },
      { label: "20mg · 30 tabs", sleekmed: 14.60, goodrx: 20.40, costplus: 11.80, insurance: 34.00 },
    ]
  },
  {
    name: "Omeprazole",
    category: "Acid Reflux",
    icon: "💊",
    variants: [
      { label: "20mg · 30 caps", sleekmed: 5.20, goodrx: 8.40, costplus: 4.10, insurance: 14.00 },
      { label: "40mg · 30 caps", sleekmed: 7.80, goodrx: 11.20, costplus: 5.90, insurance: 18.00 },
      { label: "20mg · 90 caps", sleekmed: 11.40, goodrx: 18.00, costplus: 9.20, insurance: 32.00 },
    ]
  },
  {
    name: "Sertraline",
    category: "Antidepressant",
    icon: "💊",
    variants: [
      { label: "50mg · 30 tabs", sleekmed: 6.40, goodrx: 10.20, costplus: 5.10, insurance: 18.00 },
      { label: "100mg · 30 tabs", sleekmed: 8.20, goodrx: 12.80, costplus: 6.40, insurance: 22.00 },
      { label: "50mg · 90 tabs", sleekmed: 14.80, goodrx: 22.00, costplus: 11.50, insurance: 42.00 },
    ]
  },
  {
    name: "Amlodipine",
    category: "Blood Pressure",
    icon: "💊",
    variants: [
      { label: "5mg · 30 tabs", sleekmed: 4.20, goodrx: 6.80, costplus: 3.40, insurance: 12.00 },
      { label: "10mg · 30 tabs", sleekmed: 5.80, goodrx: 8.90, costplus: 4.60, insurance: 15.00 },
    ]
  },
  {
    name: "Gabapentin",
    category: "Nerve Pain / Epilepsy",
    icon: "💊",
    variants: [
      { label: "100mg · 90 caps", sleekmed: 9.20, goodrx: 14.00, costplus: 7.40, insurance: 22.00 },
      { label: "300mg · 90 caps", sleekmed: 12.80, goodrx: 18.40, costplus: 10.20, insurance: 28.00 },
      { label: "600mg · 60 tabs", sleekmed: 16.40, goodrx: 23.00, costplus: 13.00, insurance: 36.00 },
    ]
  },
  {
    name: "Losartan",
    category: "Blood Pressure",
    icon: "💊",
    variants: [
      { label: "25mg · 30 tabs", sleekmed: 5.60, goodrx: 8.20, costplus: 4.40, insurance: 14.00 },
      { label: "50mg · 30 tabs", sleekmed: 6.80, goodrx: 10.00, costplus: 5.40, insurance: 17.00 },
      { label: "100mg · 30 tabs", sleekmed: 8.40, goodrx: 12.20, costplus: 6.60, insurance: 21.00 },
    ]
  },
  {
    name: "Levothyroxine",
    category: "Thyroid",
    icon: "💊",
    variants: [
      { label: "25mcg · 30 tabs", sleekmed: 6.20, goodrx: 9.40, costplus: 4.90, insurance: 16.00 },
      { label: "50mcg · 30 tabs", sleekmed: 7.40, goodrx: 11.00, costplus: 5.80, insurance: 18.00 },
      { label: "100mcg · 30 tabs", sleekmed: 8.80, goodrx: 13.20, costplus: 7.00, insurance: 22.00 },
    ]
  },
  {
    name: "Alprazolam",
    category: "Anxiety",
    icon: "💊",
    variants: [
      { label: "0.25mg · 30 tabs", sleekmed: 8.40, goodrx: 13.00, costplus: 6.80, insurance: 20.00 },
      { label: "0.5mg · 30 tabs", sleekmed: 9.80, goodrx: 15.20, costplus: 7.90, insurance: 24.00 },
      { label: "1mg · 30 tabs", sleekmed: 11.60, goodrx: 17.80, costplus: 9.20, insurance: 28.00 },
    ]
  },
  {
    name: "Bupropion",
    category: "Antidepressant / Smoking",
    icon: "💊",
    variants: [
      { label: "150mg SR · 60 tabs", sleekmed: 14.20, goodrx: 20.80, costplus: 11.40, insurance: 32.00 },
      { label: "300mg XL · 30 tabs", sleekmed: 18.60, goodrx: 26.40, costplus: 14.80, insurance: 42.00 },
    ]
  },
  {
    name: "Pantoprazole",
    category: "Acid Reflux",
    icon: "💊",
    variants: [
      { label: "20mg · 30 tabs", sleekmed: 6.80, goodrx: 10.40, costplus: 5.40, insurance: 16.00 },
      { label: "40mg · 30 tabs", sleekmed: 8.60, goodrx: 13.00, costplus: 6.80, insurance: 20.00 },
      { label: "40mg · 90 tabs", sleekmed: 18.40, goodrx: 26.80, costplus: 14.60, insurance: 42.00 },
    ]
  },
  {
    name: "Furosemide",
    category: "Diuretic / Heart",
    icon: "💊",
    variants: [
      { label: "20mg · 30 tabs", sleekmed: 4.40, goodrx: 7.20, costplus: 3.60, insurance: 12.00 },
      { label: "40mg · 30 tabs", sleekmed: 5.20, goodrx: 8.40, costplus: 4.20, insurance: 14.00 },
    ]
  },
  {
    name: "Trazodone",
    category: "Sleep / Depression",
    icon: "💊",
    variants: [
      { label: "50mg · 30 tabs", sleekmed: 7.20, goodrx: 11.40, costplus: 5.80, insurance: 18.00 },
      { label: "100mg · 30 tabs", sleekmed: 9.40, goodrx: 14.80, costplus: 7.60, insurance: 22.00 },
    ]
  },
  {
    name: "Clopidogrel",
    category: "Blood Thinners",
    icon: "💊",
    variants: [
      { label: "75mg · 30 tabs", sleekmed: 11.80, goodrx: 17.20, costplus: 9.40, insurance: 26.00 },
      { label: "75mg · 90 tabs", sleekmed: 28.40, goodrx: 40.00, costplus: 22.80, insurance: 60.00 },
    ]
  },
  {
    name: "Rosuvastatin",
    category: "Cholesterol",
    icon: "💊",
    variants: [
      { label: "5mg · 30 tabs", sleekmed: 8.80, goodrx: 13.20, costplus: 6.90, insurance: 22.00 },
      { label: "10mg · 30 tabs", sleekmed: 10.40, goodrx: 15.80, costplus: 8.20, insurance: 26.00 },
      { label: "20mg · 30 tabs", sleekmed: 13.20, goodrx: 19.40, costplus: 10.40, insurance: 32.00 },
    ]
  },
  {
    name: "Amoxicillin",
    category: "Antibiotic",
    icon: "💊",
    variants: [
      { label: "250mg · 21 caps", sleekmed: 5.80, goodrx: 9.20, costplus: 4.60, insurance: 15.00 },
      { label: "500mg · 21 caps", sleekmed: 7.40, goodrx: 11.80, costplus: 5.90, insurance: 18.00 },
      { label: "875mg · 20 tabs", sleekmed: 9.20, goodrx: 14.40, costplus: 7.40, insurance: 22.00 },
    ]
  },
  {
    name: "Doxycycline",
    category: "Antibiotic",
    icon: "💊",
    variants: [
      { label: "100mg · 14 caps", sleekmed: 8.40, goodrx: 12.80, costplus: 6.80, insurance: 20.00 },
      { label: "100mg · 30 caps", sleekmed: 14.20, goodrx: 21.00, costplus: 11.40, insurance: 32.00 },
    ]
  },
  {
    name: "Montelukast",
    category: "Allergy / Asthma",
    icon: "💊",
    variants: [
      { label: "10mg · 30 tabs", sleekmed: 7.80, goodrx: 12.40, costplus: 6.20, insurance: 20.00 },
      { label: "10mg · 90 tabs", sleekmed: 18.40, goodrx: 28.00, costplus: 14.80, insurance: 44.00 },
    ]
  },
  {
    name: "Duloxetine",
    category: "Antidepressant / Pain",
    icon: "💊",
    variants: [
      { label: "20mg · 30 caps", sleekmed: 12.40, goodrx: 18.80, costplus: 9.80, insurance: 28.00 },
      { label: "60mg · 30 caps", sleekmed: 16.80, goodrx: 24.40, costplus: 13.40, insurance: 36.00 },
      { label: "60mg · 90 caps", sleekmed: 38.40, goodrx: 56.00, costplus: 30.80, insurance: 82.00 },
    ]
  },
  {
    name: "Clonazepam",
    category: "Anxiety / Seizures",
    icon: "💊",
    variants: [
      { label: "0.5mg · 30 tabs", sleekmed: 9.20, goodrx: 14.80, costplus: 7.40, insurance: 22.00 },
      { label: "1mg · 30 tabs", sleekmed: 10.80, goodrx: 17.20, costplus: 8.60, insurance: 26.00 },
    ]
  },
  {
    name: "Citalopram",
    category: "Antidepressant",
    icon: "💊",
    variants: [
      { label: "10mg · 30 tabs", sleekmed: 6.20, goodrx: 10.00, costplus: 4.90, insurance: 16.00 },
      { label: "20mg · 30 tabs", sleekmed: 7.80, goodrx: 12.40, costplus: 6.20, insurance: 20.00 },
      { label: "40mg · 30 tabs", sleekmed: 9.40, goodrx: 14.80, costplus: 7.40, insurance: 24.00 },
    ]
  },
  {
    name: "Metoprolol",
    category: "Blood Pressure / Heart",
    icon: "💊",
    variants: [
      { label: "25mg · 30 tabs", sleekmed: 5.40, goodrx: 8.60, costplus: 4.30, insurance: 14.00 },
      { label: "50mg · 30 tabs", sleekmed: 6.80, goodrx: 10.40, costplus: 5.40, insurance: 17.00 },
      { label: "100mg · 30 tabs", sleekmed: 8.40, goodrx: 12.80, costplus: 6.60, insurance: 21.00 },
    ]
  },
  {
    name: "Fluoxetine",
    category: "Antidepressant",
    icon: "💊",
    variants: [
      { label: "10mg · 30 caps", sleekmed: 5.80, goodrx: 9.40, costplus: 4.60, insurance: 16.00 },
      { label: "20mg · 30 caps", sleekmed: 7.20, goodrx: 11.80, costplus: 5.80, insurance: 20.00 },
      { label: "40mg · 30 caps", sleekmed: 9.80, goodrx: 15.20, costplus: 7.80, insurance: 26.00 },
    ]
  },
  {
    name: "Cyclobenzaprine",
    category: "Muscle Relaxer",
    icon: "💊",
    variants: [
      { label: "5mg · 30 tabs", sleekmed: 7.60, goodrx: 12.00, costplus: 6.00, insurance: 18.00 },
      { label: "10mg · 30 tabs", sleekmed: 9.20, goodrx: 14.60, costplus: 7.40, insurance: 22.00 },
    ]
  },
  {
    name: "Hydrochlorothiazide",
    category: "Blood Pressure / Diuretic",
    icon: "💊",
    variants: [
      { label: "12.5mg · 30 tabs", sleekmed: 3.80, goodrx: 6.40, costplus: 3.00, insurance: 10.00 },
      { label: "25mg · 30 tabs", sleekmed: 4.60, goodrx: 7.80, costplus: 3.70, insurance: 12.00 },
    ]
  },
  {
    name: "Prednisone",
    category: "Corticosteroid",
    icon: "💊",
    variants: [
      { label: "5mg · 21 tabs (dose pack)", sleekmed: 6.40, goodrx: 10.20, costplus: 5.10, insurance: 16.00 },
      { label: "10mg · 30 tabs", sleekmed: 7.80, goodrx: 12.40, costplus: 6.20, insurance: 20.00 },
      { label: "20mg · 30 tabs", sleekmed: 9.20, goodrx: 14.80, costplus: 7.40, insurance: 24.00 },
    ]
  },
];

/* ─── UTILS ──────────────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }
function $$(sel) { return document.querySelectorAll(sel); }
function fmt(n) { return '$' + Number(n).toFixed(2); }
function slug(s) { return s.toLowerCase().replace(/\s+/g, '-'); }

function showToast(msg, type = 'success') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

function loadState() {
  try {
    const u = localStorage.getItem('sm_user');
    const v = localStorage.getItem('sm_vault');
    const c = localStorage.getItem('sm_cabinet');
    if (u) State.user = JSON.parse(u);
    if (v) State.vault = JSON.parse(v);
    if (c) State.cabinet = JSON.parse(c);
  } catch(e) {}
}

function saveUser() { localStorage.setItem('sm_user', JSON.stringify(State.user)); }
function saveVault() { localStorage.setItem('sm_vault', JSON.stringify(State.vault)); }
function saveCabinet() { localStorage.setItem('sm_cabinet', JSON.stringify(State.cabinet)); }

/* ─── PAGE NAVIGATION ────────────────────────────────────────── */
function navigateTo(pageId) {
  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const target = $(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Update nav links
  $$('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });
  $$('[data-sidebar-link]').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageId);
  });

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Page-specific init
  if (pageId === 'cabinet') renderCabinet();
  if (pageId === 'vault') renderVault();
  if (pageId === 'card') renderCard();
  if (pageId === 'admin') initAdmin();
}

/* ─── SIDEBAR ────────────────────────────────────────────────── */
function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebarOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebarOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ─── AUTH ───────────────────────────────────────────────────── */
function openAuthModal(mode = 'signin') {
  $('authModalOverlay').classList.add('open');
  if (mode === 'register') showRegView();
  else showSignInView();
}

function closeAuthModal() {
  $('authModalOverlay').classList.remove('open');
}

function showSignInView() {
  $('authSignInView').style.display = 'block';
  $('authRegisterView').style.display = 'none';
  $('signInError').style.display = 'none';
}

function showRegView() {
  $('authSignInView').style.display = 'none';
  $('authRegisterView').style.display = 'block';
  goToOnboardStep(1);
}

function goToOnboardStep(step) {
  State.onboardStep = step;
  $$('.onboard-panel').forEach(p => p.classList.remove('active'));
  $(`onboardStep${step}`).classList.add('active');
  $$('.onboard-step').forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n === step) s.classList.add('active');
    if (n < step) s.classList.add('done');
  });
}

function doSignIn(email, password) {
  // Demo: accept any with basic validation, or test credentials
  const validEmail = email.trim().toLowerCase();
  const validPass = password.trim();
  if (!validEmail.includes('@') || validPass.length < 3) {
    $('signInError').style.display = 'block';
    return;
  }

  // Use existing vault name or generate from email
  const name = State.vault['vf-name'] || email.split('@')[0];
  State.user = { name, email: validEmail, avatar: name[0].toUpperCase() };
  saveUser();
  closeAuthModal();
  updateAuthUI();
  showToast(`Welcome back, ${name.split(' ')[0]}!`, 'success');
}

function doRegister() {
  const name = $('reg-name').value.trim();
  const email = $('reg-email').value.trim().toLowerCase();
  const password = $('reg-pass').value.trim();

  if (!name || !email.includes('@') || password.length < 8) {
    showToast('Please complete all required fields.', 'error');
    return;
  }

  // Save vault data from onboarding
  State.vault['vf-name'] = name;
  State.vault['vf-dob'] = $('reg-dob').value;
  State.vault['vf-carrier'] = $('reg-carrier').value;
  State.vault['vf-member'] = $('reg-member').value;
  State.vault['vf-group'] = $('reg-group').value;
  State.vault['vf-bin'] = $('reg-bin').value;
  State.vault['vf-pcn'] = $('reg-pcn').value;
  State.vault['vf-doctor'] = $('reg-doctor').value;
  State.vault['vf-zip'] = $('reg-zip').value;
  saveVault();

  State.user = { name, email, avatar: name[0].toUpperCase() };
  saveUser();
  closeAuthModal();
  updateAuthUI();
  showToast(`Account created! Welcome, ${name.split(' ')[0]}.`, 'success');
}

function signOut() {
  State.user = null;
  localStorage.removeItem('sm_user');
  updateAuthUI();
  navigateTo('home');
  showToast('You have been signed out.', 'success');
}

function updateAuthUI() {
  const loggedIn = !!State.user;

  $('btnSignIn').style.display = loggedIn ? 'none' : 'inline-flex';
  $('btnJoin').textContent = loggedIn ? 'My Account' : 'Get Started';

  const su = $('sidebarUser');
  if (loggedIn) {
    su.style.display = 'flex';
    $('sidebarAvatar').textContent = State.user.avatar;
    $('sidebarUsername').textContent = State.user.name;
    $('sidebarEmail').textContent = State.user.email;
  } else {
    su.style.display = 'none';
  }

  // Update insurance notice in search
  updateInsuranceNotice();
}

/* ─── VAULT ──────────────────────────────────────────────────── */
function renderVault() {
  const loggedIn = !!State.user;
  $('vaultAuthGate').style.display = loggedIn ? 'none' : 'block';
  $('vaultContent').style.display = loggedIn ? 'block' : 'none';

  if (!loggedIn) return;

  // Fill fields from vault
  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => {
    const el = $(id);
    if (el) el.value = State.vault[id] || '';
  });

  // Reset to locked
  $('secureEditToggle').checked = false;
  setVaultLocked(true);
}

function setVaultLocked(locked) {
  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => {
    const el = $(id);
    if (el) el.disabled = locked;
  });

  const dot = document.querySelector('.vault-status-dot');
  const txt = $('vaultStatusText');
  if (locked) {
    dot.className = 'vault-status-dot locked';
    txt.textContent = 'Vault Locked';
  } else {
    dot.className = 'vault-status-dot unlocked';
    txt.textContent = 'Edit Mode Active';
  }

  $('vaultActions').style.display = locked ? 'none' : 'flex';
}

function saveVaultData() {
  const fields = ['vf-name','vf-dob','vf-dl','vf-carrier','vf-member','vf-group','vf-bin','vf-pcn','vf-plan','vf-doctor','vf-zip'];
  fields.forEach(id => {
    const el = $(id);
    if (el) State.vault[id] = el.value;
  });
  saveVault();

  // Update user name if changed
  if (State.user && State.vault['vf-name']) {
    State.user.name = State.vault['vf-name'];
    State.user.avatar = State.vault['vf-name'][0].toUpperCase();
    saveUser();
    updateAuthUI();
  }

  // Show vault lock animation
  showVaultLockAnim();
}

function showVaultLockAnim() {
  const overlay = $('vaultLockOverlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
    $('secureEditToggle').checked = false;
    setVaultLocked(true);
    const dot = document.querySelector('.vault-status-dot');
    dot.className = 'vault-status-dot saved';
    $('vaultStatusText').textContent = 'Vault Secured';
    showToast('Vault Data Encrypted & Stored', 'success');
    updateInsuranceNotice();
    renderCard();
  }, 2000);
}

/* ─── DIGITAL CARD ───────────────────────────────────────────── */
function renderCard() {
  const vault = State.vault;
  const user = State.user;

  $('cardMemberName').textContent = (vault['vf-name'] || (user && user.name) || 'MEMBER NAME').toUpperCase();
  $('cardBIN').textContent = vault['vf-bin'] || '610524';
  $('cardPCN').textContent = vault['vf-pcn'] || 'SLKMD';
  $('cardGroup').textContent = vault['vf-group'] || 'SM2025';
  $('cardMemberID').textContent = vault['vf-member'] || '—';

  const carrier = vault['vf-carrier'];
  if (carrier) {
    $('cardInsuranceCarrier').textContent = `${carrier} (Member ID: ${vault['vf-member'] || '—'})`;
  } else {
    $('cardInsuranceCarrier').textContent = 'None — add in Security Vault for personalized estimates';
  }
}

/* ─── INSURANCE NOTICE ───────────────────────────────────────── */
function updateInsuranceNotice() {
  const notice = $('insuranceNoticeText');
  if (!notice) return;
  const carrier = State.vault && State.vault['vf-carrier'];
  if (State.user && carrier) {
    notice.innerHTML = `Showing estimated co-pay for <strong>${carrier}</strong>. <a href="#" data-page="vault">Update in Vault</a>.`;
  } else if (State.user) {
    notice.innerHTML = `No insurance on file. <a href="#" data-page="vault">Add in Security Vault</a> for personalized estimates.`;
  } else {
    notice.innerHTML = `Showing national average insurance co-pay. <a href="#" data-page="vault">Add your insurance</a> for personalized estimates.`;
  }
  // Re-attach link events
  notice.querySelectorAll('[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigateTo(a.dataset.page); });
  });
}

/* ─── SEARCH ENGINE ──────────────────────────────────────────── */
function initSearch() {
  // Popular tags
  const popularDrugs = ['Metformin', 'Ozempic', 'Lisinopril', 'Adderall', 'Atorvastatin', 'Lexapro'];
  const popCont = $('popularTagsSearch');
  if (popCont) {
    popularDrugs.forEach(name => {
      const tag = document.createElement('span');
      tag.className = 'hero-tag';
      tag.textContent = name;
      tag.addEventListener('click', () => { triggerSearch(name, 'page'); });
      popCont.appendChild(tag);
    });
  }

  // Hero tags
  $$('.hero-tag[data-search]').forEach(tag => {
    tag.addEventListener('click', () => {
      navigateTo('search');
      setTimeout(() => triggerSearch(tag.dataset.search, 'page'), 100);
    });
  });

  // Hero search
  setupSearchBox($('heroSearchInput'), $('heroSearchDropdown'), $('heroSearchClear'), 'hero');
  setupSearchBox($('pageSearchInput'), $('pageSearchDropdown'), $('pageSearchClear'), 'page');
}

function setupSearchBox(input, dropdown, clearBtn, context) {
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'block' : 'none';
    if (q.length < 1) { dropdown.classList.remove('open'); return; }
    const results = DRUGS.filter(d => d.name.toLowerCase().includes(q.toLowerCase()));
    renderDropdown(dropdown, results, context, input);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    dropdown.classList.remove('open');
    if (context === 'page') resetSearchPage();
  });

  document.addEventListener('click', e => {
    if (!input.closest('.hero-search-wrap, .page-hero-small').contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

function renderDropdown(dropdown, results, context, input) {
  if (!results.length) {
    dropdown.innerHTML = `<div class="dropdown-item" style="justify-content:center;color:var(--text-muted);font-size:13px">No results found</div>`;
  } else {
    dropdown.innerHTML = results.slice(0, 8).map(d => `
      <div class="dropdown-item" data-name="${d.name}">
        <div>
          <div class="dropdown-drug-name">${d.name}</div>
          <div class="dropdown-drug-cat">${d.category}</div>
        </div>
        <div class="dropdown-drug-price">from ${fmt(Math.min(...d.variants.map(v => v.sleekmed)))}</div>
      </div>
    `).join('');
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const name = item.dataset.name;
        input.value = name;
        dropdown.classList.remove('open');
        if (context === 'hero') {
          navigateTo('search');
          setTimeout(() => triggerSearch(name, 'page'), 150);
        } else {
          triggerSearch(name, 'page');
        }
      });
    });
  }
  dropdown.classList.add('open');
}

function triggerSearch(name, context) {
  const drug = DRUGS.find(d => d.name.toLowerCase() === name.toLowerCase());
  if (!drug) return;

  State.currentDrug = drug;
  State.currentVariant = drug.variants[0];

  if (context === 'page') {
    const input = $('pageSearchInput');
    if (input) input.value = drug.name;
    $('pageSearchClear').style.display = 'block';
    renderSearchResults(drug);
  }
}

function renderSearchResults(drug) {
  const panel = $('searchResultsPanel');
  const empty = $('searchEmptyState');
  panel.style.display = 'block';
  empty.style.display = 'none';

  $('resultsTitle').textContent = `${drug.name} — Price Comparison`;

  // Variant selector
  const vs = $('variantSelector');
  vs.innerHTML = drug.variants.map((v, i) => `
    <button class="variant-btn ${i === 0 ? 'active' : ''}" data-index="${i}">${v.label}</button>
  `).join('');
  vs.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      vs.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.currentVariant = drug.variants[parseInt(btn.dataset.index)];
      renderPriceCards(State.currentVariant, drug.name);
    });
  });

  renderPriceCards(drug.variants[0], drug.name);
  updateInsuranceNotice();
}

function renderPriceCards(variant, drugName) {
  const carrier = State.vault && State.vault['vf-carrier'];
  const insuranceLabel = carrier ? `Est. ${carrier} Co-pay` : 'Avg. Insurance Co-pay';

  const prices = [
    { source: 'SleekMed Direct', amount: variant.sleekmed, action: 'Use This Card', best: true, id: 'sm' },
    { source: 'GoodRx', amount: variant.goodrx, action: 'View on GoodRx', best: false, id: 'grx' },
    { source: 'Cost Plus Drugs', amount: variant.costplus, action: 'View on Cost Plus', best: false, id: 'cp' },
    { source: insuranceLabel, amount: variant.insurance, action: 'Use Your Insurance', best: false, id: 'ins' },
  ];

  const bestPrice = Math.min(...prices.map(p => p.amount));
  const grid = $('priceComparisonGrid');

  grid.innerHTML = prices.map(p => {
    const isBest = p.amount === bestPrice;
    return `
      <div class="price-card ${isBest ? 'best-price' : ''}">
        ${isBest ? '<div class="price-card-badge">Lowest Price</div>' : ''}
        <div class="price-source">${p.source}</div>
        <div class="price-amount">${fmt(p.amount)}</div>
        <div class="price-per-unit">${variant.label}</div>
        <button class="price-action">${p.action}</button>
      </div>
    `;
  }).join('');

  // Savings callout
  const maxPrice = Math.max(...prices.map(p => p.amount));
  const saved = maxPrice - bestPrice;
  if (saved > 0) {
    const callout = document.createElement('div');
    callout.className = 'detail-callout';
    callout.style.marginBottom = '24px';
    callout.innerHTML = `<strong>💰 Potential Savings:</strong> Using the lowest price option saves you <strong style="color:var(--mint)">${fmt(saved)}</strong> vs. the highest available price on this page.`;
    const existingCallout = grid.parentElement.querySelector('.detail-callout');
    if (existingCallout) existingCallout.remove();
    grid.after(callout);
  }
}

function resetSearchPage() {
  $('searchResultsPanel').style.display = 'none';
  $('searchEmptyState').style.display = 'block';
  State.currentDrug = null;
}

/* ─── MEDICINE CABINET ───────────────────────────────────────── */
function renderCabinet() {
  const loggedIn = !!State.user;
  $('cabinetAuthGate').style.display = loggedIn ? 'none' : 'block';
  $('cabinetContent').style.display = loggedIn ? 'block' : 'none';
  if (!loggedIn) return;

  // Demo meds if empty
  if (State.cabinet.length === 0) {
    State.cabinet = [
      { id: 1, name: 'Metformin', variant: '1000mg · 90 tabs', fills: 3, maxFills: 5, icon: '💊' },
      { id: 2, name: 'Lisinopril', variant: '10mg · 30 tabs', fills: 1, maxFills: 5, icon: '💊' },
      { id: 3, name: 'Atorvastatin', variant: '40mg · 30 tabs', fills: 4, maxFills: 5, icon: '💊' },
    ];
    saveCabinet();
  }

  const list = $('medList');
  if (State.cabinet.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">No medications saved. Use Savings Finder to search and add drugs.</div>`;
  } else {
    list.innerHTML = State.cabinet.map(med => {
      const pct = (med.fills / med.maxFills) * 100;
      const barClass = pct <= 20 ? 'critical' : pct <= 40 ? 'low' : '';
      return `
        <div class="med-item" data-id="${med.id}">
          <div class="med-icon">${med.icon}</div>
          <div class="med-info">
            <div class="med-name">${med.name}</div>
            <div class="med-detail">${med.variant}</div>
          </div>
          <div class="med-refill">
            <div class="refill-count">${med.fills} fill${med.fills !== 1 ? 's' : ''} remaining</div>
            <div class="refill-bar-wrap">
              <div class="refill-bar ${barClass}" style="width:${pct}%"></div>
            </div>
          </div>
          <button class="med-remove" data-id="${med.id}" title="Remove">✕</button>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.med-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        State.cabinet = State.cabinet.filter(m => m.id != btn.dataset.id);
        saveCabinet();
        renderCabinet();
      });
    });
  }

  // Tracker
  const tg = $('trackerGrid');
  tg.innerHTML = State.cabinet.map(med => `
    <div class="tracker-card">
      <div class="tracker-drug">${med.name}</div>
      <div class="tracker-fills-left">${med.fills}</div>
      <div class="tracker-fills-label">fills remaining</div>
    </div>
  `).join('');

  if (State.cabinet.length === 0) {
    tg.innerHTML = `<div style="color:var(--text-muted);font-size:13px">No medications tracked.</div>`;
  }
}

function addMedToCabinet(drugName, variantLabel) {
  const drug = DRUGS.find(d => d.name === drugName);
  if (!drug) return;
  const id = Date.now();
  State.cabinet.push({
    id,
    name: drugName,
    variant: variantLabel,
    fills: Math.floor(Math.random() * 4) + 1,
    maxFills: 5,
    icon: drug.icon,
  });
  saveCabinet();
  showToast(`${drugName} added to Medicine Cabinet`, 'success');
}

/* ─── STAT COUNTER ANIMATION ─────────────────────────────────── */
function animateCounters() {
  $$('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(ease * target);
      el.textContent = value >= 1000 ? value.toLocaleString() : value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString() + (target >= 10000 ? '+' : '+');
    }
    requestAnimationFrame(step);
  });
}

/* ─── ADMIN PORTAL ───────────────────────────────────────────── */
function initAdmin() {
  if (State.adminLoggedIn) {
    $('adminLoginGate').style.display = 'none';
    $('adminDashboard').style.display = 'block';
  } else {
    $('adminLoginGate').style.display = 'flex';
    $('adminDashboard').style.display = 'none';
  }
}

function calcMRR() {
  const claims = parseInt($('claimsSlider').value);
  const fee = State.activeFee;
  const mrr = claims * fee;
  const arr = mrr * 12;
  $('claimsVal').textContent = claims.toLocaleString();
  $('calcMRR').textContent = '$' + mrr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  $('calcARR').textContent = '$' + arr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ─── DATA PURGE ─────────────────────────────────────────────── */
function openPurgeModal() {
  $('purgeModalOverlay').classList.add('open');
  $('purgeConfirmInput').value = '';
}

function closePurgeModal() {
  $('purgeModalOverlay').classList.remove('open');
}

function executePurge() {
  if ($('purgeConfirmInput').value.trim().toUpperCase() !== 'DELETE') {
    showToast('Please type DELETE to confirm.', 'error');
    return;
  }
  localStorage.clear();
  sessionStorage.clear();
  State.user = null;
  State.vault = {};
  State.cabinet = [];
  closePurgeModal();
  updateAuthUI();
  navigateTo('home');
  showToast('All data permanently purged.', 'success');
}

/* ─── EVENT LISTENERS ────────────────────────────────────────── */
function bindEvents() {

  // Hamburger / Sidebar
  $('hamburgerBtn').addEventListener('click', openSidebar);
  $('sidebarClose').addEventListener('click', closeSidebar);
  $('sidebarOverlay').addEventListener('click', closeSidebar);

  // Page navigation (nav links)
  $$('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  // Header buttons
  $('btnSignIn').addEventListener('click', () => openAuthModal('signin'));
  $('btnJoin').addEventListener('click', () => {
    if (State.user) navigateTo('vault');
    else openAuthModal('register');
  });

  // Auth modal
  $('authModalClose').addEventListener('click', closeAuthModal);
  $('authModalOverlay').addEventListener('click', e => {
    if (e.target === $('authModalOverlay')) closeAuthModal();
  });

  $('switchToRegister').addEventListener('click', e => { e.preventDefault(); showRegView(); });
  $('switchToSignIn').addEventListener('click', e => { e.preventDefault(); showSignInView(); });

  $('doSignInBtn').addEventListener('click', () => {
    doSignIn($('signInEmail').value, $('signInPass').value);
  });

  $('signInEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doSignIn($('signInEmail').value, $('signInPass').value); });
  $('signInPass').addEventListener('keydown', e => { if (e.key === 'Enter') doSignIn($('signInEmail').value, $('signInPass').value); });

  // Onboarding steps
  $('onboardNext1').addEventListener('click', () => {
    if (!$('reg-name').value || !$('reg-email').value.includes('@') || $('reg-pass').value.length < 8) {
      showToast('Please fill in all required fields (password min 8 chars).', 'error');
      return;
    }
    goToOnboardStep(2);
  });

  $('onboardNext2').addEventListener('click', () => goToOnboardStep(3));
  $('onboardSkip2').addEventListener('click', () => goToOnboardStep(3));
  $('completeRegBtn').addEventListener('click', doRegister);

  // Vault
  $('secureEditToggle').addEventListener('change', e => {
    setVaultLocked(!e.target.checked);
  });

  $('saveVaultBtn').addEventListener('click', saveVaultData);
  $('cancelVaultBtn').addEventListener('click', () => {
    $('secureEditToggle').checked = false;
    setVaultLocked(true);
    renderVault();
  });

  $('vaultAuthGate') && $('vaultSignInBtn').addEventListener('click', () => openAuthModal('signin'));
  $('vaultCreateBtn') && $('vaultCreateBtn').addEventListener('click', () => openAuthModal('register'));

  $('signOutBtn').addEventListener('click', signOut);
  $('sidebarSignOut').addEventListener('click', signOut);

  $('purgeBtn').addEventListener('click', openPurgeModal);
  $('confirmPurgeBtn').addEventListener('click', executePurge);
  $('cancelPurgeBtn').addEventListener('click', closePurgeModal);

  $('purgeModalOverlay').addEventListener('click', e => {
    if (e.target === $('purgeModalOverlay')) closePurgeModal();
  });

  // Cabinet auth gates
  $('cabinetSignInBtn').addEventListener('click', () => openAuthModal('signin'));
  $('cabinetCreateBtn').addEventListener('click', () => openAuthModal('register'));

  // Add med button
  $('addMedBtn') && $('addMedBtn').addEventListener('click', () => {
    navigateTo('search');
    showToast('Search for a medication to add it to your cabinet.', 'success');
  });

  // Price card actions — "Use This Card" saves to cabinet
  document.addEventListener('click', e => {
    if (e.target.classList.contains('price-action') && e.target.textContent === 'Use This Card') {
      if (!State.user) { openAuthModal('signin'); return; }
      if (State.currentDrug && State.currentVariant) {
        addMedToCabinet(State.currentDrug.name, State.currentVariant.label);
      }
    }
  });

  // Admin
  $('adminLoginBtn').addEventListener('click', () => {
    const email = $('adminEmail').value.trim();
    const pass = $('adminPass').value.trim();
    if (email === 'admin@sleekmed.com' && pass === 'ADMIN888') {
      State.adminLoggedIn = true;
      $('adminLoginGate').style.display = 'none';
      $('adminDashboard').style.display = 'block';
      showToast('Welcome to the Partner Portal.', 'success');
    } else {
      $('adminLoginError').style.display = 'block';
    }
  });

  $('adminLogoutBtn').addEventListener('click', () => {
    State.adminLoggedIn = false;
    initAdmin();
  });

  // Admin calculator
  $('claimsSlider').addEventListener('input', calcMRR);
  $$('.fee-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.fee-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.activeFee = parseFloat(btn.dataset.fee);
      calcMRR();
    });
  });

  // Telehealth notify
  $('teleNotifyBtn') && $('teleNotifyBtn').addEventListener('click', () => {
    showToast('You\'ll be notified when Online Care launches!', 'success');
  });

  // Footer nav links
  $$('.footer-col [data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.page);
    });
  });

  // Filter buttons (cabinet)
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* ─── INTERSECTION OBSERVER (stat counter trigger) ───────────── */
function observeStats() {
  const strip = document.querySelector('.hero-stat-strip');
  if (!strip) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(strip);
}

/* ─── INITIAL CALC for admin ─────────────────────────────────── */
function initCalcDisplay() {
  $('claimsVal').textContent = '5,000';
  $('calcMRR').textContent = '$12,500';
  $('calcARR').textContent = '$150,000';
}

/* ─── KEYBOARD SHORTCUTS ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeAuthModal();
    closePurgeModal();
    closeSidebar();
  }
});

/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  bindEvents();
  initSearch();
  updateAuthUI();
  observeStats();
  initCalcDisplay();
  renderCard();
  navigateTo('home');
});
