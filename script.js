'use strict';

const DRUGS = [
  {
    name: 'Keppra', generic: 'Levetiracetam', category: 'Anticonvulsant',
    variants: [
      { dosage: '250mg', qty: '90 tablets', hospital: 65.00, insurance: 30.00, costplus: 14.50, goodrx: 19.24, sleekmed: 12.00 },
      { dosage: '500mg', qty: '60 tablets', hospital: 85.74, insurance: 25.00, costplus: 12.80, goodrx: 9.00, sleekmed: 8.50 },
      { dosage: '750mg', qty: '60 tablets', hospital: 115.74, insurance: 35.00, costplus: 18.50, goodrx: 14.92, sleekmed: 13.00 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 134.24, insurance: 40.00, costplus: 22.00, goodrx: 23.86, sleekmed: 19.00 }
    ]
  },
  {
    name: 'Atorvastatin', generic: 'Generic Lipitor', category: 'Cardiovascular',
    variants: [
      { dosage: '20mg', qty: '30 tablets', hospital: 68.70, insurance: 20.00, costplus: 5.46, goodrx: 9.50, sleekmed: 4.20 },
      { dosage: '40mg', qty: '30 tablets', hospital: 66.60, insurance: 20.00, costplus: 5.74, goodrx: 11.20, sleekmed: 4.80 },
      { dosage: '80mg', qty: '30 tablets', hospital: 70.20, insurance: 20.00, costplus: 5.92, goodrx: 14.50, sleekmed: 5.10 }
    ]
  },
  {
    name: 'Amlodipine', generic: 'Generic Norvasc', category: 'Cardiovascular',
    variants: [
      { dosage: '2.5mg', qty: '30 tablets', hospital: 180, insurance: 25, costplus: 6.00, goodrx: 8.00, sleekmed: 4.10 },
      { dosage: '5mg', qty: '30 tablets', hospital: 224, insurance: 38, costplus: 8.00, goodrx: 10.00, sleekmed: 5.80 },
      { dosage: '10mg', qty: '30 tablets', hospital: 250, insurance: 45, costplus: 9.50, goodrx: 12.00, sleekmed: 6.20 }
    ]
  },
  {
    name: 'Escitalopram', generic: 'Generic Lexapro', category: 'Mental Health',
    variants: [
      { dosage: '5mg', qty: '30 tablets', hospital: 150, insurance: 25, costplus: 7.00, goodrx: 9.00, sleekmed: 4.80 },
      { dosage: '10mg', qty: '30 tablets', hospital: 228, insurance: 40, costplus: 8.50, goodrx: 11.00, sleekmed: 6.20 },
      { dosage: '20mg', qty: '30 tablets', hospital: 290, insurance: 50, costplus: 11.00, goodrx: 15.00, sleekmed: 8.10 }
    ]
  },
  {
    name: 'Ozempic', generic: 'Semaglutide', category: 'Endocrine',
    variants: [
      { dosage: '0.25mg', qty: '1 pen', hospital: 1200.00, insurance: 300.00, costplus: 995.00, goodrx: 199.00, sleekmed: 185.00 },
      { dosage: '0.5mg', qty: '1 pen', hospital: 1232.00, insurance: 300.00, costplus: 995.00, goodrx: 199.00, sleekmed: 185.00 },
      { dosage: '1mg', qty: '1 pen', hospital: 1350.00, insurance: 300.00, costplus: 995.00, goodrx: 349.00, sleekmed: 320.00 },
      { dosage: '2mg', qty: '1 pen', hospital: 1475.12, insurance: 300.00, costplus: 995.00, goodrx: 499.00, sleekmed: 450.00 }
    ]
  },
  {
    name: 'Amoxicillin', generic: 'Generic Amoxil', category: 'Antibiotic',
    variants: [
      { dosage: '250mg', qty: '30 capsules', hospital: 110, insurance: 15, costplus: 5.00, goodrx: 6.00, sleekmed: 3.20 },
      { dosage: '500mg', qty: '30 capsules', hospital: 148, insurance: 24, costplus: 6.50, goodrx: 8.00, sleekmed: 4.00 },
      { dosage: '875mg', qty: '20 tablets', hospital: 160, insurance: 28, costplus: 7.00, goodrx: 9.00, sleekmed: 4.50 }
    ]
  },
  {
    name: 'Metformin', generic: 'Generic Glucophage', category: 'Metabolic',
    variants: [
      { dosage: '500mg', qty: '60 tablets', hospital: 186, insurance: 32, costplus: 6.00, goodrx: 8.00, sleekmed: 4.60 },
      { dosage: '850mg', qty: '60 tablets', hospital: 210, insurance: 38, costplus: 7.50, goodrx: 10.00, sleekmed: 5.40 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 240, insurance: 45, costplus: 9.00, goodrx: 12.00, sleekmed: 6.80 },
      { dosage: '1000mg ER', qty: '60 tablets', hospital: 300, insurance: 55, costplus: 12.00, goodrx: 15.00, sleekmed: 9.20 }
    ]
  }
];

let currentDrugInfo = null;

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => n < 10 ? '$' + n.toFixed(2) : '$' + Math.round(n).toLocaleString();

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

let db = JSON.parse(localStorage.getItem('sleekmed_db')) || {};

let state = {
  loggedIn: false,
  isAdmin: false,
  user: null, 
  activeTab: 'search',
};

function saveDatabase() {
  if (state.loggedIn && state.user) {
    db[state.user.email] = state.user;
    localStorage.setItem('sleekmed_db', JSON.stringify(db));
  }
}

function bootApp() {
  updateUIForAuth();
  renderPopularGrid(); 
  switchTab('search', 'fade');
}

function updateUIForAuth() {
  const navContainer = $('bottom-nav');
  
  if (state.loggedIn) {
    $('topbar-profile-text').textContent = 'Profile';
    navContainer.classList.remove('hidden');
    
    navContainer.innerHTML = `
      <button class="bnav-item active" data-tab="search" onclick="switchTab('search', 'fade')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21 4.35 4.35"/></svg>
        <span>Prices</span>
      </button>
      <button class="bnav-item" data-tab="access" onclick="switchTab('access', 'fade')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
        <span>Card</span>
      </button>
      <button class="bnav-item" data-tab="profile" onclick="switchTab('profile', 'fade')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0 4 3.6 7 8 7s8 3 8 7"/></svg>
        <span>Dashboard</span>
      </button>
      ${state.isAdmin ? `
      <button class="bnav-item" data-tab="partner" onclick="switchTab('partner', 'fade')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v 2a4 4 0 0 0 4 4H5a4 4 0 0 0 4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v 2a4 4 0 0 0 3 3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Partner</span>
      </button>
      ` : ''}
    `;

    injectUserData();
    renderMedicineCabinet();
  } else {
    $('topbar-profile-text').textContent = 'Sign In';
    navContainer.innerHTML = '';
    navContainer.classList.add('hidden');
  }
}

function injectUserData() {
  if(!state.user) return;
  const { name, email, memberId, dob, insurance, prefs } = state.user;
  
  $('card-member-name').textContent = name.toUpperCase() || 'VALUED MEMBER';
  $('card-member-email').textContent = email;
  $('card-member-id').textContent = memberId;

  $('profile-name-display').textContent = name || 'Member Name';
  $('pf-name').value = name;
  $('pf-email').value = email;
  $('pf-dob').value = dob || '';
  $('pf-insurance').value = insurance || '';
  
  $('pref-alerts').checked = prefs ? prefs.alerts : true;
  $('pref-digest').checked = prefs ? prefs.digest : false;
}

function renderMedicineCabinet() {
  const container = $('medicine-cabinet-list');
  if (!state.user.cabinet || state.user.cabinet.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 0;">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-light)" stroke-width="1.5" style="margin-bottom: 12px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; letter-spacing: 0.5px;">Cabinet is empty</div>
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Track refills, get reminders, and access member savings.</div>
        <button class="btn-secondary" style="margin: 0 auto; width: 100%; justify-content: center; color: var(--blue); border-color: var(--border);" onclick="switchTab('search', 'backward')">Search prescriptions</button>
      </div>`;
    return;
  }

  container.innerHTML = '';
  state.user.cabinet.forEach((drugName, index) => {
    const item = document.createElement('div');
    item.className = 'cabinet-item';
    item.innerHTML = `
      <div>
        <div class="cabinet-item-name">${drugName}</div>
        <div class="cabinet-item-sub">Active Prescription</div>
      </div>
      <button style="color: var(--red); font-weight: bold; padding: 8px;" onclick="removeFromCabinet(${index})">X</button>
    `;
    container.appendChild(item);
  });
}

function addToCabinet(drugName) {
  if (!state.loggedIn) {
    openAuth();
    return;
  }
  if (!state.user.cabinet) state.user.cabinet = [];
  if (!state.user.cabinet.includes(drugName)) {
    state.user.cabinet.push(drugName);
    saveDatabase();
    renderMedicineCabinet();
    showToast(`${drugName} added to cabinet.`);
  } else {
    showToast(`${drugName} is already in your cabinet.`);
  }
}

function removeFromCabinet(index) {
  state.user.cabinet.splice(index, 1);
  saveDatabase();
  renderMedicineCabinet();
  showToast(`Prescription removed.`);
}

function renderPopularGrid() {
  const grid = $('drug-grid');
  grid.innerHTML = '';
  
  DRUGS.forEach((d) => {
    const lowest = Math.min(...d.variants.map(v => v.sleekmed));
    const card = document.createElement('div');
    card.className = 'drug-card';
    card.innerHTML = `
      <div class="drug-name">${d.name}</div>
      <div class="drug-generic">${d.generic}</div>
      <div class="drug-footer">
        <div class="savings-badge">From ${fmt(lowest)}</div>
      </div>
    `;
    card.addEventListener('click', () => {
      $('search-results-list').classList.add('hidden');
      $('drug-search').value = '';
      showDrugPage(d);
    });
    grid.appendChild(card);
  });
}

function filterDrugs() {
  const q = $('drug-search').value.trim().toLowerCase();
  const list = $('search-results-list');
  
  if (!q) {
    list.classList.add('hidden');
    return;
  }
  
  list.innerHTML = '';
  const filtered = DRUGS.filter(d => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q));
  
  if (filtered.length === 0) {
    list.innerHTML = `<li style="color: var(--text-muted); justify-content: center;">No matches found.</li>`;
  } else {
    filtered.forEach(d => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="search-item-name">${d.name}</div>
          <div class="search-item-gen">${d.generic}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M9 18l6 6 6 6"/></svg>
      `;
      li.addEventListener('click', () => {
        list.classList.add('hidden');
        $('drug-search').value = '';
        showDrugPage(d);
      });
      list.appendChild(li);
    });
  }
  list.classList.remove('hidden');
}

function showDrugPage(drug) {
  currentDrugInfo = drug;
  const uniqueDosages = [...new Set(drug.variants.map(v => v.dosage))];
  
  $('drug-detail-content').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
      <div>
        <div class="panel-title" style="margin-bottom: 4px;">${drug.name}</div>
        <div class="panel-sub" style="font-size: 16px;">${drug.generic}</div>
      </div>
      ${state.loggedIn ? `
      <button class="btn-secondary" style="border-color: var(--blue); color: var(--blue);" onclick="addToCabinet('${drug.name}')">
        + Save to Cabinet
      </button>
      ` : ''}
    </div>
    
    <div class="variant-selectors">
      <div class="variant-col">
        <span class="variant-label">Form and Dosage</span>
        <select id="sel-dosage" class="variant-select">
          ${uniqueDosages.map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
      </div>
      <div class="variant-col">
        <span class="variant-label">Quantity</span>
        <select id="sel-qty" class="variant-select">
        </select>
      </div>
    </div>
    
    <div style="font-weight: 700; margin-bottom: 8px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px;">Estimated Prices</div>
    <div id="price-board" class="price-comparison-list">
    </div>
    
    ${!state.loggedIn ? `<button class="gate-btn" style="margin-top: 32px;" onclick="openAuth();">Get Savings Card</button>` : ''}
  `;

  $('sel-dosage').addEventListener('change', updateQuantities);
  $('sel-qty').addEventListener('change', updatePriceBoard);

  updateQuantities();
  switchTab('drug-detail', 'forward');
  window.scrollTo(0, 0);
}

function updateQuantities() {
  const selectedDosage = $('sel-dosage').value;
  const qtySelect = $('sel-qty');
  const matchingVariants = currentDrugInfo.variants.filter(v => v.dosage === selectedDosage);
  
  qtySelect.innerHTML = matchingVariants.map(v => `<option value="${v.qty}">${v.qty}</option>`).join('');
  updatePriceBoard();
}

function updatePriceBoard() {
  const selectedDosage = $('sel-dosage').value;
  const selectedQty = $('sel-qty').value;
  
  const v = currentDrugInfo.variants.find(v => v.dosage === selectedDosage && v.qty === selectedQty);
  if (!v) return;

  const insName = (state.loggedIn && state.user.insurance) 
    ? `${state.user.insurance} Co Pay (Avg)` 
    : 'Insurance Co Pay (Avg)';

  $('price-board').innerHTML = `
    <div class="price-row best-price">
      <span class="price-source">SleekMed Direct <span class="star-icon">★ Best Price</span></span>
      <span class="price-value">${fmt(v.sleekmed)}</span>
    </div>
    <div class="price-row">
      <span class="price-source">Cost Plus Drugs</span>
      <span class="price-value">${fmt(v.costplus)}</span>
    </div>
    <div class="price-row">
      <span class="price-source">GoodRx (Avg)</span>
      <span class="price-value">${fmt(v.goodrx)}</span>
    </div>
    <div class="price-row">
      <span class="price-source">${insName}</span>
      <span class="price-value">${fmt(v.insurance)}</span>
    </div>
    <div class="price-row" style="opacity: 0.5;">
      <span class="price-source">Hospital Cash Pay</span>
      <span class="price-value" style="text-decoration: line-through;">${fmt(v.hospital)}</span>
    </div>
  `;
}

function openAuth() {
  $('auth-overlay').classList.remove('hidden');
  $('auth-panel').classList.remove('hidden');
}

function closeAuth() {
  $('auth-overlay').classList.add('hidden');
  $('auth-panel').classList.add('hidden');
}

function openDeleteModal() {
  $('delete-modal-overlay').classList.remove('hidden');
  setTimeout(() => $('delete-modal-overlay').classList.add('modal-show'), 10);
}

function closeDeleteModal() {
  $('delete-modal-overlay').classList.remove('modal-show');
  setTimeout(() => $('delete-modal-overlay').classList.add('hidden'), 200);
}

function highlightField(id) {
  const el = $(id);
  el.style.borderColor = 'var(--red)';
  el.style.boxShadow   = '0 0 0 3px rgba(255,51,102,0.15)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
}

function handleLogin() {
  const name = $('login-name').value.trim();
  const email = $('login-email').value.trim();
  const code = $('login-code').value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) { 
    highlightField('login-email'); 
    showToast('Please enter a valid email address.');
    return; 
  }

  if (email === 'admin@sleekmed.com' && code === 'ADMIN888') {
    state.isAdmin = true;
  } else {
    state.isAdmin = false;
  }

  if (!db[email]) {
    db[email] = {
      name: name || 'Member',
      email: email,
      memberId: 'SM ' + Math.floor(100000 + Math.random() * 900000),
      dob: '',
      insurance: '',
      cabinet: [],
      prefs: { alerts: true, digest: false }
    };
  }
  
  state.loggedIn = true;
  state.user = db[email];
  saveDatabase();
  
  closeAuth();
  updateUIForAuth();
  
  if (state.isAdmin) {
    switchTab('partner', 'bounce');
    showToast('Admin Portal Unlocked');
  } else {
    switchTab('access', 'bounce');
    showToast('Account verified. Access card ready.');
  }
}

function handleLogout() {
  state.loggedIn = false;
  state.isAdmin = false;
  state.user = null;
  
  updateUIForAuth();
  switchTab('search', 'backward');
  showToast('Successfully signed out.');
}

function confirmDeleteAccount() {
  if (state.user && state.user.email) {
    delete db[state.user.email];
    localStorage.setItem('sleekmed_db', JSON.stringify(db));
    closeDeleteModal();
    handleLogout();
    showToast('Account data permanently deleted.');
  }
}

function switchTab(tab, direction = 'fade') {
  state.activeTab = tab;
  
  $$('.tab-panel').forEach(p => {
    p.classList.remove('active', 'slide-fwd', 'slide-bwd', 'bounce-in');
  });
  
  const panel = $('tab-' + tab);
  if (panel) {
    void panel.offsetWidth; 
    panel.classList.add('active');
    
    if (direction === 'forward') panel.classList.add('slide-fwd');
    else if (direction === 'backward') panel.classList.add('slide-bwd');
    else if (direction === 'bounce') panel.classList.add('bounce-in');
  }

  $$('.bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  bootApp();

  $('topbar-profile-btn').addEventListener('click', () => {
    if (state.loggedIn) switchTab('profile', 'bounce');
    else openAuth();
  });

  $('login-btn').addEventListener('click', handleLogin);
  $('close-auth').addEventListener('click', closeAuth);
  $('auth-overlay').addEventListener('click', closeAuth);

  $('drug-search').addEventListener('input', filterDrugs);
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      $('search-results-list').classList.add('hidden');
    }
  });

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

  $('save-profile-btn').addEventListener('click', () => {
    if (state.user) {
      const newEmail = $('pf-email').value.trim();
      const oldEmail = state.user.email;

      if (!newEmail || !newEmail.includes('@')) {
         highlightField('pf-email');
         showToast('Please enter a valid email.');
         return;
      }

      state.user.name = $('pf-name').value;
      state.user.dob = $('pf-dob').value;
      state.user.insurance = $('pf-insurance').value;
      state.user.prefs = {
        alerts: $('pref-alerts').checked,
        digest: $('pref-digest').checked
      };

      if (newEmail !== oldEmail) {
         state.user.email = newEmail;
         db[newEmail] = state.user;
         delete db[oldEmail];
         localStorage.setItem('sleekmed_db', JSON.stringify(db));
      } else {
         saveDatabase();
      }

      injectUserData();
      showToast('Profile and Preferences updated.');
    }
  });

  $('logout-btn').addEventListener('click', handleLogout);
});
