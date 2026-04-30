'use strict';

/* DRUG DATA */
const DRUGS = [
  {
    name: 'Keppra', generic: 'Levetiracetam', category: 'Anticonvulsant',
    variants: [
      { dosage: '250mg', qty: '90 tablets', hospital: 99.38, insurance: 30.00, sleekmed: 12.41 },
      { dosage: '500mg', qty: '60 tablets', hospital: 85.74, insurance: 25.00, sleekmed: 6.18 },
      { dosage: '750mg', qty: '60 tablets', hospital: 115.74, insurance: 35.00, sleekmed: 11.02 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 134.24, insurance: 40.00, sleekmed: 15.48 }
    ]
  },
  {
    name: 'Amlodipine', generic: 'Generic Norvasc', category: 'Cardiovascular',
    variants: [
      { dosage: '2.5mg', qty: '30 tablets', hospital: 180, insurance: 25, sleekmed: 4.10 },
      { dosage: '5mg', qty: '30 tablets', hospital: 224, insurance: 38, sleekmed: 5.80 },
      { dosage: '5mg', qty: '90 tablets', hospital: 600, insurance: 90, sleekmed: 12.40 },
      { dosage: '10mg', qty: '30 tablets', hospital: 250, insurance: 45, sleekmed: 6.20 }
    ]
  },
  {
    name: 'Atorvastatin', generic: 'Generic Lipitor', category: 'Cardiovascular',
    variants: [
      { dosage: '10mg', qty: '30 tablets', hospital: 190, insurance: 30, sleekmed: 5.20 },
      { dosage: '20mg', qty: '30 tablets', hospital: 240, insurance: 38, sleekmed: 6.80 },
      { dosage: '40mg', qty: '30 tablets', hospital: 312, insurance: 48, sleekmed: 8.40 },
      { dosage: '80mg', qty: '90 tablets', hospital: 900, insurance: 110, sleekmed: 19.50 }
    ]
  },
  {
    name: 'Escitalopram', generic: 'Generic Lexapro', category: 'Mental Health',
    variants: [
      { dosage: '5mg', qty: '30 tablets', hospital: 150, insurance: 25, sleekmed: 4.80 },
      { dosage: '10mg', qty: '30 tablets', hospital: 228, insurance: 40, sleekmed: 6.20 },
      { dosage: '20mg', qty: '30 tablets', hospital: 290, insurance: 50, sleekmed: 8.10 },
      { dosage: '20mg', qty: '90 tablets', hospital: 800, insurance: 100, sleekmed: 18.40 }
    ]
  },
  {
    name: 'Ozempic', generic: 'Semaglutide', category: 'Endocrine',
    variants: [
      { dosage: '0.25mg', qty: '1 pen', hospital: 1050, insurance: 250, sleekmed: 175.00 },
      { dosage: '0.5mg', qty: '1 pen', hospital: 1142, insurance: 280, sleekmed: 189.00 },
      { dosage: '1mg', qty: '1 pen', hospital: 1200, insurance: 300, sleekmed: 195.00 },
      { dosage: '2mg', qty: '1 pen', hospital: 1350, insurance: 350, sleekmed: 215.00 }
    ]
  },
  {
    name: 'Amoxicillin', generic: 'Generic Amoxil', category: 'Antibiotic',
    variants: [
      { dosage: '250mg', qty: '30 capsules', hospital: 110, insurance: 15, sleekmed: 3.20 },
      { dosage: '500mg', qty: '30 capsules', hospital: 148, insurance: 24, sleekmed: 4.00 },
      { dosage: '875mg', qty: '20 tablets', hospital: 160, insurance: 28, sleekmed: 4.50 }
    ]
  },
  {
    name: 'Metformin', generic: 'Generic Glucophage', category: 'Metabolic',
    variants: [
      { dosage: '500mg', qty: '60 tablets', hospital: 186, insurance: 32, sleekmed: 4.60 },
      { dosage: '850mg', qty: '60 tablets', hospital: 210, insurance: 38, sleekmed: 5.40 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 240, insurance: 45, sleekmed: 6.80 },
      { dosage: '1000mg ER', qty: '60 tablets', hospital: 300, insurance: 55, sleekmed: 9.20 }
    ]
  }
];

let currentDrugInfo = null;

/* UTILS */
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

/* STATE */
let state = {
  loggedIn: false,
  isAdmin: false,
  user: { name: '', email: '', memberId: '' },
  activeTab: 'search',
};

/* BOOT AND RENDER */
function bootApp() {
  updateUIForAuth();
  renderPopularGrid(); 
  renderContractTable();
  switchTab(state.activeTab || 'search');
}

function updateUIForAuth() {
  const reqEls = $$('.auth-required');
  const adminEls = $$('.admin-only');
  
  if (state.loggedIn) {
    $('topbar-profile-text').textContent = 'Profile';
    reqEls.forEach(el => el.style.display = '');
    injectUserData();
  } else {
    $('topbar-profile-text').textContent = 'Sign In';
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
  
  $('card-member-name').textContent = name.toUpperCase() || 'VALUED MEMBER';
  $('card-member-email').textContent = email;
  $('card-member-id').textContent = memberId;

  $('profile-name-display').textContent = name || 'Member Name';
  $('pf-name').value = name;
  $('pf-email').value = email;
}

/* PROFILE DYNAMICS */
$('pf-name').addEventListener('input', function() {
  const val = this.value;
  $('profile-name-display').textContent = val || 'Member Name';
});

$('clear-name-btn').addEventListener('click', function() {
  $('pf-name').value = '';
  $('profile-name-display').textContent = 'Member Name';
  $('pf-name').focus();
});


/* SEARCH AND LIST VIEW */
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
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

/* DRUG DETAIL PAGE DYNAMICS */
function showDrugPage(drug) {
  currentDrugInfo = drug;
  
  const uniqueDosages = [...new Set(drug.variants.map(v => v.dosage))];
  
  $('drug-detail-content').innerHTML = `
    <div class="panel-title" style="margin-bottom: 4px;">${drug.name}</div>
    <div class="panel-sub" style="margin-bottom: 24px; font-size: 16px;">${drug.generic}</div>
    
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
  
  switchTab('drug-detail');
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

  const goodRx = v.sleekmed * 1.4;
  const costPlus = v.sleekmed * 1.25;

  $('price-board').innerHTML = `
    <div class="price-row best-price">
      <span class="price-source">SleekMed Direct <span class="star-icon">★ Best Price</span></span>
      <span class="price-value">${fmt(v.sleekmed)}</span>
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
      <span class="price-source">Insurance Copay (Avg)</span>
      <span class="price-value">${fmt(v.insurance)}</span>
    </div>
    <div class="price-row" style="opacity: 0.5;">
      <span class="price-source">Hospital Cash Pay</span>
      <span class="price-value" style="text-decoration: line-through;">${fmt(v.hospital)}</span>
    </div>
  `;
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

function highlightField(id) {
  const el = $(id);
  el.style.borderColor = 'var(--red)';
  el.style.boxShadow   = '0 0 0 3px rgba(255,51,102,0.15)';
  el.focus();
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 2000);
}

function handleLogin() {
  const name = $('login-name').value.trim();
  const email = $('login-email').value.trim();
  const code = $('login-code').value.trim();

  // Strict email regex added here
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

  state.loggedIn = true;
  state.user = {
    name: name || 'Member',
    email: email,
    memberId: 'SM-' + Math.floor(100000 + Math.random() * 900000)
  };
  
  closeAuth();
  updateUIForAuth();
  
  if (state.isAdmin) {
    switchTab('partner');
    showToast('Admin Portal Unlocked');
  } else {
    switchTab('access');
    showToast('Account verified. Access card ready.');
  }
}

function handleLogout() {
  state.loggedIn = false;
  state.isAdmin = false;
  state.user = { name: '', email: '', memberId: '' };
  
  updateUIForAuth();
  switchTab('search');
  showToast('Successfully signed out.');
}

/* ADMIN PORTAL */
function renderContractTable() {
  const tbody = $('contract-tbody');
  tbody.innerHTML = `
    <tr><td>CVS Health Network</td><td>Retail Chain</td><td>2027-03-31</td><td style="color:var(--emerald-text);font-weight:700;">ACTIVE</td></tr>
    <tr><td>Walgreens Rx Group</td><td>Retail Chain</td><td>2026-12-15</td><td style="color:var(--emerald-text);font-weight:700;">ACTIVE</td></tr>
    <tr><td>Costco Pharmacy</td><td>Warehouse</td><td>2027-06-30</td><td style="color:var(--amber);font-weight:700;">PENDING</td></tr>
  `;
}

/* NAVIGATION */
function switchTab(tab) {
  state.activeTab = tab;
  $$('.tab-panel').forEach(p => p.classList.remove('active'));
  
  const panel = $('tab-' + tab);
  if (panel) {
    // This trick forces the slide animation to restart on every click
    void panel.offsetWidth; 
    panel.classList.add('active');
  }

  $$('.bnav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
}

/* EVENT LISTENERS */
document.addEventListener('DOMContentLoaded', () => {
  bootApp();

  $('topbar-profile-btn').addEventListener('click', () => {
    if (state.loggedIn) switchTab('profile');
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

  $('back-to-search').addEventListener('click', () => {
    $('drug-search').value = '';
    switchTab('search');
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

  $$('.bnav-item, .sidebar-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      if (tab) {
        switchTab(tab);
        closeSidebar();
      }
    });
  });

  $('save-profile-btn').addEventListener('click', () => {
    state.user.name = $('pf-name').value;
    injectUserData();
    showToast('Profile and Access Card updated.');
  });

  $('logout-btn').addEventListener('click', handleLogout);
});
