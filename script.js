'use strict';

const DRUGS = [
  { name: 'Albuterol', generic: 'Generic ProAir', category: 'Respiratory', variants: [
      { dosage: '90mcg', qty: '1 inhaler', hospital: 60, insurance: 20, costplus: 15, goodrx: 18, sleekmed: 12 },
      { dosage: '90mcg', qty: '3 inhalers', hospital: 180, insurance: 50, costplus: 40, goodrx: 45, sleekmed: 32 }
  ]},
  { name: 'Amlodipine', generic: 'Generic Norvasc', category: 'Cardiovascular', variants: [
      { dosage: '2.5mg', qty: '30 tablets', hospital: 180, insurance: 25, costplus: 6.00, goodrx: 8.00, sleekmed: 4.10 },
      { dosage: '5mg', qty: '30 tablets', hospital: 224, insurance: 38, costplus: 8.00, goodrx: 10.00, sleekmed: 5.80 },
      { dosage: '10mg', qty: '30 tablets', hospital: 250, insurance: 45, costplus: 9.50, goodrx: 12.00, sleekmed: 6.20 }
  ]},
  { name: 'Amoxicillin', generic: 'Generic Amoxil', category: 'Antibiotic', variants: [
      { dosage: '250mg', qty: '30 capsules', hospital: 110, insurance: 15, costplus: 5.00, goodrx: 6.00, sleekmed: 3.20 },
      { dosage: '500mg', qty: '30 capsules', hospital: 148, insurance: 24, costplus: 6.50, goodrx: 8.00, sleekmed: 4.00 },
      { dosage: '875mg', qty: '20 tablets', hospital: 160, insurance: 28, costplus: 7.00, goodrx: 9.00, sleekmed: 4.50 }
  ]},
  { name: 'Astelin', generic: 'Azelastine', category: 'Respiratory', variants: [
      { dosage: '137mcg', qty: '1 bottle', hospital: 85, insurance: 30, costplus: 12, goodrx: 15, sleekmed: 9.50 },
      { dosage: '137mcg', qty: '2 bottles', hospital: 160, insurance: 50, costplus: 20, goodrx: 25, sleekmed: 16.00 }
  ]},
  { name: 'Atorvastatin', generic: 'Generic Lipitor', category: 'Cardiovascular', variants: [
      { dosage: '10mg', qty: '30 tablets', hospital: 68.70, insurance: 20.00, costplus: 5.46, goodrx: 9.50, sleekmed: 4.20 },
      { dosage: '20mg', qty: '30 tablets', hospital: 66.60, insurance: 20.00, costplus: 5.74, goodrx: 11.20, sleekmed: 4.80 },
      { dosage: '40mg', qty: '30 tablets', hospital: 70.20, insurance: 20.00, costplus: 5.92, goodrx: 14.50, sleekmed: 5.10 },
      { dosage: '80mg', qty: '90 tablets', hospital: 190.00, insurance: 50.00, costplus: 14.00, goodrx: 25.00, sleekmed: 12.00 }
  ]},
  { name: 'Bupropion', generic: 'Generic Wellbutrin', category: 'Mental Health', variants: [
      { dosage: '150mg XL', qty: '30 tablets', hospital: 110, insurance: 25, costplus: 9, goodrx: 12, sleekmed: 7.20 },
      { dosage: '300mg XL', qty: '30 tablets', hospital: 150, insurance: 35, costplus: 14, goodrx: 18, sleekmed: 11.00 }
  ]},
  { name: 'Citalopram', generic: 'Generic Celexa', category: 'Mental Health', variants: [
      { dosage: '10mg', qty: '30 tablets', hospital: 80, insurance: 15, costplus: 4.50, goodrx: 6, sleekmed: 3.50 },
      { dosage: '20mg', qty: '30 tablets', hospital: 95, insurance: 20, costplus: 5.50, goodrx: 8, sleekmed: 4.50 }
  ]},
  { name: 'Duloxetine', generic: 'Generic Cymbalta', category: 'Mental Health', variants: [
      { dosage: '30mg', qty: '30 capsules', hospital: 180, insurance: 25, costplus: 10, goodrx: 14, sleekmed: 7.50 },
      { dosage: '60mg', qty: '30 capsules', hospital: 210, insurance: 35, costplus: 12, goodrx: 16, sleekmed: 9.80 }
  ]},
  { name: 'Escitalopram', generic: 'Generic Lexapro', category: 'Mental Health', variants: [
      { dosage: '5mg', qty: '30 tablets', hospital: 150, insurance: 25, costplus: 7.00, goodrx: 9.00, sleekmed: 4.80 },
      { dosage: '10mg', qty: '30 tablets', hospital: 228, insurance: 40, costplus: 8.50, goodrx: 11.00, sleekmed: 6.20 },
      { dosage: '20mg', qty: '30 tablets', hospital: 290, insurance: 50, costplus: 11.00, goodrx: 15.00, sleekmed: 8.10 }
  ]},
  { name: 'Fluticasone', generic: 'Generic Flonase', category: 'Respiratory', variants: [
      { dosage: '50mcg', qty: '1 bottle', hospital: 55, insurance: 15, costplus: 10, goodrx: 13, sleekmed: 8.00 },
      { dosage: '50mcg', qty: '3 bottles', hospital: 140, insurance: 35, costplus: 25, goodrx: 32, sleekmed: 21.00 }
  ]},
  { name: 'Furosemide', generic: 'Generic Lasix', category: 'Cardiovascular', variants: [
      { dosage: '20mg', qty: '30 tablets', hospital: 35, insurance: 10, costplus: 3.50, goodrx: 5, sleekmed: 3.00 },
      { dosage: '40mg', qty: '30 tablets', hospital: 45, insurance: 10, costplus: 4, goodrx: 6, sleekmed: 3.50 }
  ]},
  { name: 'Gabapentin', generic: 'Generic Neurontin', category: 'Anticonvulsant', variants: [
      { dosage: '100mg', qty: '90 capsules', hospital: 90, insurance: 15, costplus: 8, goodrx: 10, sleekmed: 6.00 },
      { dosage: '300mg', qty: '90 capsules', hospital: 140, insurance: 25, costplus: 11, goodrx: 15, sleekmed: 8.50 },
      { dosage: '600mg', qty: '90 tablets', hospital: 190, insurance: 35, costplus: 16, goodrx: 22, sleekmed: 12.00 }
  ]},
  { name: 'Keppra', generic: 'Levetiracetam', category: 'Anticonvulsant', variants: [
      { dosage: '250mg', qty: '90 tablets', hospital: 65.00, insurance: 30.00, costplus: 14.50, goodrx: 19.24, sleekmed: 12.00 },
      { dosage: '500mg', qty: '60 tablets', hospital: 85.74, insurance: 25.00, costplus: 12.80, goodrx: 9.00, sleekmed: 8.50 },
      { dosage: '750mg', qty: '60 tablets', hospital: 115.74, insurance: 35.00, costplus: 18.50, goodrx: 14.92, sleekmed: 13.00 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 134.24, insurance: 40.00, costplus: 22.00, goodrx: 23.86, sleekmed: 19.00 }
  ]},
  { name: 'Levothyroxine', generic: 'Generic Synthroid', category: 'Endocrine', variants: [
      { dosage: '25mcg', qty: '30 tablets', hospital: 35, insurance: 15, costplus: 4.50, goodrx: 7, sleekmed: 3.80 },
      { dosage: '50mcg', qty: '30 tablets', hospital: 40, insurance: 15, costplus: 5, goodrx: 8, sleekmed: 4.00 },
      { dosage: '100mcg', qty: '30 tablets', hospital: 45, insurance: 15, costplus: 5.50, goodrx: 9, sleekmed: 4.50 }
  ]},
  { name: 'Lisinopril', generic: 'Generic Prinivil', category: 'Cardiovascular', variants: [
      { dosage: '5mg', qty: '30 tablets', hospital: 45, insurance: 15, costplus: 4.00, goodrx: 6, sleekmed: 3.20 },
      { dosage: '10mg', qty: '30 tablets', hospital: 55, insurance: 15, costplus: 4.50, goodrx: 7, sleekmed: 3.80 },
      { dosage: '20mg', qty: '30 tablets', hospital: 65, insurance: 15, costplus: 5.00, goodrx: 8, sleekmed: 4.20 }
  ]},
  { name: 'Lorazepam', generic: 'Generic Ativan', category: 'Mental Health', variants: [
      { dosage: '0.5mg', qty: '30 tablets', hospital: 55, insurance: 15, costplus: 5.50, goodrx: 8, sleekmed: 4.20 },
      { dosage: '1mg', qty: '30 tablets', hospital: 65, insurance: 15, costplus: 6, goodrx: 9, sleekmed: 4.80 }
  ]},
  { name: 'Losartan', generic: 'Generic Cozaar', category: 'Cardiovascular', variants: [
      { dosage: '25mg', qty: '30 tablets', hospital: 75, insurance: 20, costplus: 6, goodrx: 9, sleekmed: 4.80 },
      { dosage: '50mg', qty: '30 tablets', hospital: 90, insurance: 20, costplus: 7, goodrx: 10, sleekmed: 5.50 }
  ]},
  { name: 'Metformin', generic: 'Generic Glucophage', category: 'Endocrine', variants: [
      { dosage: '500mg', qty: '60 tablets', hospital: 186, insurance: 32, costplus: 6.00, goodrx: 8.00, sleekmed: 4.60 },
      { dosage: '850mg', qty: '60 tablets', hospital: 210, insurance: 38, costplus: 7.50, goodrx: 10.00, sleekmed: 5.40 },
      { dosage: '1000mg', qty: '60 tablets', hospital: 240, insurance: 45, costplus: 9.00, goodrx: 12.00, sleekmed: 6.80 },
      { dosage: '1000mg ER', qty: '60 tablets', hospital: 300, insurance: 55, costplus: 12.00, goodrx: 15.00, sleekmed: 9.20 }
  ]},
  { name: 'Omeprazole', generic: 'Generic Prilosec', category: 'Gastrointestinal', variants: [
      { dosage: '20mg', qty: '30 capsules', hospital: 75, insurance: 20, costplus: 6, goodrx: 9, sleekmed: 5.00 },
      { dosage: '40mg', qty: '30 capsules', hospital: 90, insurance: 25, costplus: 8, goodrx: 12, sleekmed: 6.50 }
  ]},
  { name: 'Ozempic', generic: 'Semaglutide', category: 'Endocrine', variants: [
      { dosage: '0.25mg', qty: '1 pen', hospital: 1200.00, insurance: 300.00, costplus: 995.00, goodrx: 199.00, sleekmed: 185.00 },
      { dosage: '0.5mg', qty: '1 pen', hospital: 1232.00, insurance: 300.00, costplus: 995.00, goodrx: 199.00, sleekmed: 185.00 },
      { dosage: '1mg', qty: '1 pen', hospital: 1350.00, insurance: 300.00, costplus: 995.00, goodrx: 349.00, sleekmed: 320.00 },
      { dosage: '2mg', qty: '1 pen', hospital: 1475.12, insurance: 300.00, costplus: 995.00, goodrx: 499.00, sleekmed: 450.00 }
  ]},
  { name: 'Pantoprazole', generic: 'Generic Protonix', category: 'Gastrointestinal', variants: [
      { dosage: '20mg', qty: '30 tablets', hospital: 70, insurance: 20, costplus: 5.50, goodrx: 8, sleekmed: 4.50 },
      { dosage: '40mg', qty: '30 tablets', hospital: 85, insurance: 20, costplus: 6.50, goodrx: 10, sleekmed: 5.20 }
  ]},
  { name: 'Promethazine', generic: 'Generic Phenergan', category: 'Gastrointestinal', variants: [
      { dosage: '12.5mg', qty: '30 tablets', hospital: 50, insurance: 15, costplus: 4.50, goodrx: 7, sleekmed: 3.50 },
      { dosage: '25mg', qty: '30 tablets', hospital: 60, insurance: 15, costplus: 5, goodrx: 8, sleekmed: 4.00 }
  ]},
  { name: 'Rosuvastatin', generic: 'Generic Crestor', category: 'Cardiovascular', variants: [
      { dosage: '10mg', qty: '30 tablets', hospital: 150, insurance: 25, costplus: 7, goodrx: 10, sleekmed: 5.50 },
      { dosage: '20mg', qty: '30 tablets', hospital: 180, insurance: 30, costplus: 8, goodrx: 12, sleekmed: 6.50 },
      { dosage: '40mg', qty: '30 tablets', hospital: 210, insurance: 35, costplus: 10, goodrx: 15, sleekmed: 8.00 }
  ]},
  { name: 'Sertraline', generic: 'Generic Zoloft', category: 'Mental Health', variants: [
      { dosage: '25mg', qty: '30 tablets', hospital: 90, insurance: 20, costplus: 5, goodrx: 7, sleekmed: 3.80 },
      { dosage: '50mg', qty: '30 tablets', hospital: 120, insurance: 20, costplus: 6, goodrx: 9, sleekmed: 4.50 },
      { dosage: '100mg', qty: '30 tablets', hospital: 150, insurance: 25, costplus: 7.50, goodrx: 11, sleekmed: 5.80 }
  ]},
  { name: 'Trazodone', generic: 'Generic Desyrel', category: 'Mental Health', variants: [
      { dosage: '50mg', qty: '30 tablets', hospital: 50, insurance: 15, costplus: 5, goodrx: 8, sleekmed: 4.00 },
      { dosage: '100mg', qty: '30 tablets', hospital: 70, insurance: 15, costplus: 6.50, goodrx: 10, sleekmed: 5.50 }
  ]},
  { name: 'Venlafaxine', generic: 'Generic Effexor', category: 'Mental Health', variants: [
      { dosage: '37.5mg ER', qty: '30 capsules', hospital: 120, insurance: 25, costplus: 8, goodrx: 11, sleekmed: 6.00 },
      { dosage: '75mg ER', qty: '30 capsules', hospital: 160, insurance: 30, costplus: 11, goodrx: 15, sleekmed: 8.50 },
      { dosage: '150mg ER', qty: '30 capsules', hospital: 210, insurance: 40, costplus: 15, goodrx: 21, sleekmed: 12.00 }
  ]}
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
  tempLoginEmail: ''
};

function saveDatabase() {
  if (state.loggedIn && state.user) {
    db[state.user.email] = state.user;
    localStorage.setItem('sleekmed_db', JSON.stringify(db));
  }
}

function bootApp() {
  updateUIForAuth();
  switchTab('search', 'fade');
  renderDirectory();
}

function updateUIForAuth() {
  const navContainer = $('bottom-nav');
  
  if (state.loggedIn) {
    $('topbar-profile-text').textContent = 'Profile';
    navContainer.classList.remove('hidden');
    
    navContainer.innerHTML = `
      <button class="bnav-item" data-tab="search" onclick="window.switchTab('search', 'fade')">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>Prices</span>
      </button>
      <button class="bnav-item" data-tab="access" onclick="window.switchTab('access', 'fade')">
        <i class="fa-solid fa-credit-card"></i>
        <span>Card</span>
      </button>
      <button class="bnav-item" data-tab="profile" onclick="window.switchTab('profile', 'fade')">
        <i class="fa-solid fa-user"></i>
        <span>Dashboard</span>
      </button>
      ${state.isAdmin ? `
      <button class="bnav-item" data-tab="partner" onclick="window.switchTab('partner', 'fade')">
        <i class="fa-solid fa-handshake"></i>
        <span>Partner</span>
      </button>
      <button class="bnav-item" data-tab="analytics" onclick="window.switchTab('analytics', 'fade')">
        <i class="fa-solid fa-chart-line"></i>
        <span>Analytics</span>
      </button>
      ` : ''}
    `;

    injectUserData();
    renderMedicineCabinet();
    updateRewardsDisplay();
    calcAdminRev();
    
    $$('.bnav-item').forEach(b => {
      if(b.dataset.tab === state.activeTab) b.classList.add('active');
    });

  } else {
    $('topbar-profile-text').textContent = 'Sign In';
    navContainer.innerHTML = '';
    navContainer.classList.add('hidden');
  }
}

function injectUserData() {
  if(!state.user) return;
  const { name, email, memberId, dob, insurance, idNum, idState, prefs } = state.user;
  
  $('card-member-name').textContent = name.toUpperCase() || 'VALUED MEMBER';
  $('card-member-email').textContent = email;
  $('card-member-id').textContent = memberId;

  $('profile-name-display').textContent = name || 'Member Name';
  $('pf-name').value = name;
  $('pf-email').value = email;
  $('pf-dob').value = dob || '';
  $('pf-idnum').value = idNum || '';
  
  if(insurance && typeof insurance === 'object') {
     $('pf-insurance').value = insurance.provider || '';
     $('pf-ins-member').value = insurance.memberId || '';
     $('pf-ins-group').value = insurance.group || '';
     $('pf-ins-bin').value = insurance.bin || '';
     $('pf-ins-pcn').value = insurance.pcn || '';
  }
  
  $('pref-alerts').checked = prefs ? prefs.alerts : true;
  $('pref-digest').checked = prefs ? prefs.digest : false;
}

function updateRewardsDisplay() {
  if(!state.user) return;
  
  let points = 0;
  if(state.user.name && state.user.dob) points += 500;
  if(state.user.cabinet && state.user.cabinet.length > 0) points += 250;
  
  $('dashboard-pts').textContent = `${points} points`;
  $('reward-points-display').textContent = `${points}`;
  
  const progress = Math.min((points / 500) * 100, 100);
  $('reward-progress-fill').style.width = `${progress}%`;
}

function renderMedicineCabinet() {
  const container = $('medicine-cabinet-list');
  const orderList = $('order-history-list');

  if (!state.user.cabinet || state.user.cabinet.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px 0;">
        <i class="fa-solid fa-prescription-bottle-medical" style="font-size: 48px; color: var(--border-light); margin-bottom: 16px;"></i>
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px; letter-spacing: 0.5px;">Cabinet is empty</div>
        <div style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Track refills and access member savings.</div>
      </div>`;
    orderList.innerHTML = `<div class="text-muted" style="text-align: center; padding: 20px 0;">No past orders found in your history.</div>`;
    return;
  }

  container.innerHTML = '';
  orderList.innerHTML = '';

  state.user.cabinet.forEach((drug, index) => {
    const item = document.createElement('div');
    item.className = 'cabinet-item';
    item.innerHTML = `
      <div>
        <div class="cabinet-item-name">${drug.name} <span style="color: var(--text-muted); font-size: 14px; font-weight: normal;">${drug.dosage}</span></div>
        <div class="cabinet-item-sub">Qty: ${drug.qty} | Refills: ${drug.refills}</div>
      </div>
      <button style="color: var(--red); font-weight: bold; padding: 8px; font-size: 16px; background: none; border: none; cursor: pointer;" onclick="removeFromCabinet(${index})"><i class="fa-solid fa-xmark"></i></button>
    `;
    container.appendChild(item);

    const hist = document.createElement('div');
    hist.style.cssText = "display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border);";
    hist.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 14px;">${drug.name}</div>
        <div style="font-size: 12px; color: var(--text-muted);">Filled at CVS Pharmacy</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700; font-size: 14px; color: var(--emerald);">COMPLETED</div>
        <div style="font-size: 12px; color: var(--text-muted);">04/15/2026</div>
      </div>
    `;
    orderList.appendChild(hist);
  });
}

function toggleCabinetSearch() {
  window.switchTab('search', 'backward');
}

function addToCabinet(drugName, dosage, qty) {
  if (!state.loggedIn) {
    openAuth();
    return;
  }
  if (!state.user.cabinet) state.user.cabinet = [];
  
  const exists = state.user.cabinet.find(d => d.name === drugName && d.dosage === dosage);
  
  if (!exists) {
    state.user.cabinet.push({
      name: drugName,
      dosage: dosage,
      qty: qty,
      refills: 3
    });
    saveDatabase();
    renderMedicineCabinet();
    updateRewardsDisplay();
    showToast(`${drugName} added to cabinet.`);
  } else {
    showToast(`${drugName} is already in your cabinet.`);
  }
}

function removeFromCabinet(index) {
  state.user.cabinet.splice(index, 1);
  saveDatabase();
  renderMedicineCabinet();
  updateRewardsDisplay();
  showToast(`Prescription removed.`);
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
        <i class="fa-solid fa-chevron-right text-muted"></i>
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

function renderDirectory() {
  const container = $('directory-list');
  const catFilter = $('dir-category').value;
  const searchFilter = $('dir-search').value.trim().toLowerCase();
  
  let filtered = DRUGS.filter(d => {
    const matchCat = catFilter === 'All' || d.category === catFilter;
    const matchSearch = d.name.toLowerCase().includes(searchFilter) || d.generic.toLowerCase().includes(searchFilter);
    return matchCat && matchSearch;
  });
  
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  
  container.innerHTML = '';
  if(filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; color: var(--text-muted); padding: 40px;">No medications match your criteria.</div>`;
    return;
  }

  let currentLetter = '';
  let grid;

  filtered.forEach(d => {
    const firstLetter = d.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      const group = document.createElement('div');
      group.className = 'dir-group';
      group.innerHTML = `<div class="dir-letter">${currentLetter}</div><div class="dir-grid"></div>`;
      container.appendChild(group);
      grid = group.querySelector('.dir-grid');
    }
    
    const item = document.createElement('div');
    item.className = 'dir-item';
    item.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 16px;">${d.name}</div>
        <div style="font-size: 13px; color: var(--text-muted);">${d.generic}</div>
        <div class="dir-item-cat">${d.category}</div>
      </div>
      <i class="fa-solid fa-chevron-right" style="color: var(--emerald);"></i>
    `;
    item.addEventListener('click', () => showDrugPage(d));
    grid.appendChild(item);
  });
}

function filterDirectory() {
  renderDirectory();
}

function filterFAQ() {
  const q = $('faq-search-input').value.toLowerCase();
  const items = $$('.faq-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if(text.includes(q)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function showDrugPage(drug) {
  currentDrugInfo = drug;
  const uniqueDosages = [...new Set(drug.variants.map(v => v.dosage))];
  
  $('drug-detail-content').innerHTML = `
    <div class="flex-between" style="margin-bottom: 24px;">
      <div>
        <div class="panel-title" style="margin-bottom: 4px;">${drug.name}</div>
        <div class="panel-sub" style="font-size: 16px;">${drug.generic}</div>
      </div>
      ${state.loggedIn ? `
      <button class="btn-secondary" style="border-color: var(--blue); color: var(--blue);" onclick="window.saveCurrentDrugToCabinet()">
        <i class="fa-solid fa-plus"></i> Save
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
      <div class="variant-col">
        <span class="variant-label">Location (Optional)</span>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="detail-zip" class="gate-input" placeholder="Zip Code" style="flex: 2; padding: 12px; font-size: 16px;">
          <button class="gate-btn" style="flex: 1; margin: 0; padding: 12px;" onclick="window.simulateLocalPricing()"><i class="fa-solid fa-location-crosshairs"></i></button>
        </div>
      </div>
    </div>
    
    <div class="flex-between" style="align-items: center; margin-bottom: 8px; margin-top: 16px;">
      <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px;">Estimated Prices</div>
      <div id="location-badge" style="font-size: 11px; color: var(--emerald); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">National Average</div>
    </div>
    <div id="price-board" class="price-comparison-list">
    </div>
    
    ${!state.loggedIn ? `<button class="gate-btn" style="margin-top: 32px;" onclick="openAuth();">Get Savings Card</button>` : ''}
  `;

  $('sel-dosage').addEventListener('change', updateQuantities);
  $('sel-qty').addEventListener('change', () => updatePriceBoard(false));

  updateQuantities();
  switchTab('drug-detail', 'forward');
  window.scrollTo(0, 0);
}

function saveCurrentDrugToCabinet() {
  const dName = currentDrugInfo.name;
  const dos = $('sel-dosage').value;
  const qty = $('sel-qty').value;
  addToCabinet(dName, dos, qty);
}

function updateQuantities() {
  const selectedDosage = $('sel-dosage').value;
  const qtySelect = $('sel-qty');
  const matchingVariants = currentDrugInfo.variants.filter(v => v.dosage === selectedDosage);
  
  qtySelect.innerHTML = matchingVariants.map(v => `<option value="${v.qty}">${v.qty}</option>`).join('');
  updatePriceBoard(false);
}

function updatePriceBoard(isLocal) {
  const selectedDosage = $('sel-dosage').value;
  const selectedQty = $('sel-qty').value;
  
  const v = currentDrugInfo.variants.find(v => v.dosage === selectedDosage && v.qty === selectedQty);
  if (!v) return;

  const insName = (state.loggedIn && state.user.insurance && state.user.insurance.provider) 
    ? `${state.user.insurance.provider} Co Pay (Avg)` 
    : 'Insurance Co Pay (Avg)';
    
  let sPrice = v.sleekmed;
  let gPrice = v.goodrx;
  
  if (isLocal) {
    const zip = $('detail-zip').value.trim();
    let hash = 0;
    for(let i=0; i<zip.length; i++) hash += zip.charCodeAt(i);
    
    const modifier = 0.90 + ((hash % 20) / 100); 
    
    sPrice = sPrice * modifier;
    gPrice = gPrice * (modifier + 0.05); 
    $('location-badge').textContent = `Local Pricing (${zip})`;
  } else {
    $('location-badge').textContent = `National Average`;
  }

  $('price-board').innerHTML = `
    <div class="price-row best-price">
      <span class="price-source">SleekMed Direct <span class="star-icon"><i class="fa-solid fa-star"></i> Best Price</span></span>
      <span class="price-value">${fmt(sPrice)}</span>
    </div>
    <div class="price-row">
      <span class="price-source">Cost Plus Drugs</span>
      <span class="price-value">${fmt(v.costplus)}</span>
    </div>
    <div class="price-row">
      <span class="price-source">GoodRx (Avg)</span>
      <span class="price-value">${fmt(gPrice)}</span>
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

function simulateLocalPricing() {
  const zip = $('detail-zip').value.trim();
  if(!zip || zip.length < 5) {
    showToast("Enter a valid zip code.");
    return;
  }
  
  $('price-board').innerHTML = `<div style="text-align:center; padding: 40px; color: var(--emerald);"><i class="fa-solid fa-circle-notch fa-spin" style="font-size: 32px; margin-bottom: 16px;"></i><br>Scanning local pharmacies...</div>`;
  
  setTimeout(() => {
    updatePriceBoard(true);
    showToast("Prices updated for " + zip);
  }, 800);
}

function openAuth() {
  $('auth-overlay').classList.remove('hidden');
  $('auth-panel').classList.remove('hidden');
  $('auth-step-1').classList.remove('hidden');
  $('auth-step-2').classList.add('hidden');
}

function closeAuth() {
  $('auth-overlay').classList.add('hidden');
  $('auth-panel').classList.add('hidden');
}

function showAuthStep1() {
  $('auth-step-1').classList.remove('hidden');
  $('auth-step-2').classList.add('hidden');
}

function showAuthStep2() {
  const email = $('login-email').value.trim();
  const name = $('login-name').value.trim();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) { 
    highlightField('login-email'); 
    showToast('Please enter a valid email address.');
    return; 
  }
  
  state.tempLoginEmail = email;
  
  if (email === 'admin@sleekmed.com') {
    $('code-label').textContent = 'ADMINISTRATOR PIN';
    $('code-subtext').textContent = 'Enter secure access PIN to unlock partner portal.';
  } else {
    $('code-label').textContent = 'ENTER VERIFICATION CODE';
    $('code-subtext').textContent = 'A 6 digit code was sent to your email. (Any code works for demo).';
  }
  
  $('auth-step-1').classList.add('hidden');
  $('auth-step-2').classList.remove('hidden');
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
  const email = state.tempLoginEmail;
  const name = $('login-name').value.trim();
  const code = $('login-code').value.trim();

  if (!code) { 
    highlightField('login-code');
    return; 
  }

  if (email === 'admin@sleekmed.com' && code === 'ADMIN888') {
    state.isAdmin = true;
  } else if (email === 'admin@sleekmed.com') {
    highlightField('login-code');
    showToast('Invalid Administrator PIN.');
    return;
  } else {
    state.isAdmin = false;
  }

  let isNewUser = false;
  if (!db[email]) {
    isNewUser = true;
    db[email] = {
      name: name || 'Member',
      email: email,
      memberId: 'SM-' + Math.floor(100000 + Math.random() * 900000),
      dob: '',
      idNum: '',
      idState: '',
      insurance: { provider: '', memberId: '', group: '', bin: '', pcn: '' },
      cabinet: [],
      prefs: { alerts: true, digest: false },
      onboardingComplete: false
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
  } else if (isNewUser || !state.user.onboardingComplete) {
    startOnboarding();
  } else {
    switchTab('access', 'bounce');
    showToast('Account verified. Access card ready.');
  }
}

function startOnboarding() {
  $('onboard-overlay').classList.remove('hidden');
  nextOnboard(1);
}

function nextOnboard(step) {
  $('onboard-step-1').classList.add('hidden');
  $('onboard-step-2').classList.add('hidden');
  $('onboard-step-3').classList.add('hidden');
  $('onboard-step-' + step).classList.remove('hidden');
}

function finishOnboard() {
  state.user.dob = $('ob-dob').value;
  state.user.onboardingComplete = true;
  saveDatabase();
  
  $('onboard-overlay').classList.add('hidden');
  injectUserData();
  updateRewardsDisplay();
  switchTab('profile', 'bounce');
  showToast('Profile setup complete. You earned 500 points.');
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

function calcAdminRev() {
  if(!state.isAdmin) return;
  const mem = parseFloat($('admin-members').value) || 0;
  const fee = parseFloat($('admin-fee').value) || 0;
  const rev = Math.round(mem * fee);
  $('admin-rev-display').textContent = '$' + rev.toLocaleString();
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

  $$('.bnav-item, .sidebar-link').forEach(b => {
    b.classList.remove('active');
    if(b.dataset.tab === tab) b.classList.add('active');
  });
}

function autoSaveProfile() {
  if (state.user) {
      const newEmail = $('pf-email').value.trim();
      const oldEmail = state.user.email;

      if (!newEmail || !newEmail.includes('@')) {
         return;
      }

      state.user.name = $('pf-name').value;
      state.user.dob = $('pf-dob').value;
      state.user.idNum = $('pf-idnum').value;
      
      state.user.insurance = {
         provider: $('pf-insurance').value,
         memberId: $('pf-ins-member').value,
         group: $('pf-ins-group').value,
         bin: $('pf-ins-bin').value,
         pcn: $('pf-ins-pcn').value
      };
      
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
      updateRewardsDisplay();
  }
}

window.switchTab = switchTab;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteAccount = confirmDeleteAccount;
window.openDeleteModal = openDeleteModal;
window.showAuthStep1 = showAuthStep1;
window.toggleCabinetSearch = toggleCabinetSearch;
window.handleCabinetAdd = handleCabinetAdd;
window.filterFAQ = filterFAQ;
window.filterDirectory = filterDirectory;
window.autoSaveProfile = autoSaveProfile;
window.simulateLocalPricing = simulateLocalPricing;
window.calcAdminRev = calcAdminRev;
window.saveCurrentDrugToCabinet = saveCurrentDrugToCabinet;
window.nextOnboard = nextOnboard;
window.finishOnboard = finishOnboard;

document.addEventListener('DOMContentLoaded', () => {
  bootApp();

  $('topbar-profile-btn').addEventListener('click', () => {
    if (state.loggedIn) switchTab('profile', 'bounce');
    else openAuth();
  });

  $('continue-btn').addEventListener('click', showAuthStep2);
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
  
  window.closeSidebar = closeSidebar;
  
  $('sidebar-close').addEventListener('click', closeSidebar);
  $('sidebar-overlay').addEventListener('click', closeSidebar);
  
  $('logout-btn').addEventListener('click', handleLogout);
});
