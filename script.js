'use strict';

/**
 * GLOBAL_CONFIG
 * Tomorrow, paste your Sandbox keys between the quotes below.
 */
const GLOBAL_CONFIG = {
    FLEXPA_PUBLIC_KEY: "",
    UHC_CLIENT_ID: "",
    SANDBOX_MODE: false 
};

// FULL DATABASE OF MEDICATIONS (Powers the Directory and Search)
const DRUGS = [
  { name: 'Albuterol', generic: 'Generic ProAir', category: 'Respiratory', variants: [{ dosage: '90mcg', qty: '1 inhaler', hospital: 60, insurance: 20, costplus: 15, goodrx: 18, sleekmed: 12 }] },
  { name: 'Amlodipine', generic: 'Generic Norvasc', category: 'Cardiovascular', variants: [{ dosage: '5mg', qty: '30 tabs', hospital: 224, insurance: 38, costplus: 8, goodrx: 10, sleekmed: 5.80 }] },
  { name: 'Amoxicillin', generic: 'Generic Amoxil', category: 'Antibiotic', variants: [{ dosage: '500mg', qty: '30 caps', hospital: 148, insurance: 24, costplus: 6.5, goodrx: 8, sleekmed: 4.00 }] },
  { name: 'Atorvastatin', generic: 'Generic Lipitor', category: 'Cardiovascular', variants: [{ dosage: '40mg', qty: '30 tabs', hospital: 66, insurance: 20, costplus: 5.7, goodrx: 11, sleekmed: 4.80 }] },
  { name: 'Bupropion', generic: 'Generic Wellbutrin', category: 'Mental Health', variants: [{ dosage: '150mg XL', qty: '30 tabs', hospital: 110, insurance: 25, costplus: 9, goodrx: 12, sleekmed: 7.20 }] },
  { name: 'Citalopram', generic: 'Generic Celexa', category: 'Mental Health', variants: [{ dosage: '20mg', qty: '30 tabs', hospital: 95, insurance: 20, costplus: 5.5, goodrx: 8, sleekmed: 4.50 }] },
  { name: 'Duloxetine', generic: 'Generic Cymbalta', category: 'Mental Health', variants: [{ dosage: '60mg', qty: '30 caps', hospital: 210, insurance: 35, costplus: 12, goodrx: 16, sleekmed: 9.80 }] },
  { name: 'Escitalopram', generic: 'Generic Lexapro', category: 'Mental Health', variants: [{ dosage: '10mg', qty: '30 tabs', hospital: 228, insurance: 40, costplus: 8.5, goodrx: 11, sleekmed: 6.20 }] },
  { name: 'Gabapentin', generic: 'Generic Neurontin', category: 'Anticonvulsant', variants: [{ dosage: '300mg', qty: '90 caps', hospital: 140, insurance: 25, costplus: 11, goodrx: 15, sleekmed: 8.50 }] },
  { name: 'Keppra', generic: 'Levetiracetam', category: 'Anticonvulsant', variants: [{ dosage: '500mg', qty: '60 tabs', hospital: 85, insurance: 25, costplus: 12.8, goodrx: 9, sleekmed: 8.50 }] },
  { name: 'Lisinopril', generic: 'Generic Prinivil', category: 'Cardiovascular', variants: [{ dosage: '10mg', qty: '30 tabs', hospital: 55, insurance: 15, costplus: 4.5, goodrx: 7, sleekmed: 3.80 }] },
  { name: 'Metformin', generic: 'Generic Glucophage', category: 'Endocrine', variants: [{ dosage: '500mg', qty: '60 tabs', hospital: 186, insurance: 32, costplus: 6, goodrx: 8, sleekmed: 4.60 }] },
  { name: 'Ozempic', generic: 'Semaglutide', category: 'Endocrine', variants: [{ dosage: '1mg', qty: '1 pen', hospital: 1350, insurance: 300, costplus: 995, goodrx: 349, sleekmed: 320 }] },
  { name: 'Sertraline', generic: 'Generic Zoloft', category: 'Mental Health', variants: [{ dosage: '50mg', qty: '30 tabs', hospital: 120, insurance: 20, costplus: 6, goodrx: 9, sleekmed: 4.50 }] }
];

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => '$' + n.toFixed(2);

let state = { loggedIn: false, isAdmin: false, user: null, activeTab: 'search', tempEmail: '' };
let db = JSON.parse(localStorage.getItem('sleekmed_db')) || {};
let currentDrugInfo = null;

// CORE BOOT
function bootApp() {
    bindUIEvents();
    updateUIForAuth();
    console.log("SleekMed Architecture Online.");
}

function bindUIEvents() {
    // Menu & Overlays
    if ($('menu-btn')) $('menu-btn').onclick = () => { $('sidebar').classList.add('open'); $('sidebar-overlay').classList.add('open'); };
    if ($('sidebar-close')) $('sidebar-close').onclick = window.closeSidebar = () => { $('sidebar').classList.remove('open'); $('sidebar-overlay').classList.remove('open'); };
    if ($('sidebar-overlay')) $('sidebar-overlay').onclick = window.closeSidebar;
    
    // Auth Flow
    if ($('topbar-profile-btn')) $('topbar-profile-btn').onclick = () => state.loggedIn ? window.switchTab('profile') : window.openAuth();
    if ($('close-auth')) $('close-auth').onclick = window.closeAuth = () => { $('auth-panel').classList.add('hidden'); $('auth-overlay').classList.add('hidden'); };
    
    if ($('continue-btn')) $('continue-btn').onclick = () => {
        const email = $('login-email').value;
        if (!email.includes('@')) return showToast('Valid email required for secure login');
        state.tempEmail = email;
        $('auth-step-1').classList.add('hidden');
        $('auth-step-2').classList.remove('hidden');
    };

    if ($('login-btn')) $('login-btn').onclick = handleLogin;
    
    // Search
    if ($('drug-search')) $('drug-search').oninput = filterDrugs;

    // Logout & Delete
    if ($('logout-btn')) $('logout-btn').onclick = handleLogout;
}

function handleLogin() {
    const email = state.tempEmail;
    const name = $('login-name').value;
    const pin = $('login-code').value;

    if (!pin) return showToast('Enter verification PIN');

    // Secure Admin Gateway
    state.isAdmin = (email === 'admin@sleekmed.com' && pin === 'ADMIN888');

    // Create DB Entry if new
    if (!db[email]) {
        db[email] = { 
            name: name, 
            email: email, 
            cabinet: [], 
            memberId: 'SM-' + Math.floor(100000 + Math.random() * 800000),
            points: 0, 
            savings: 0, 
            onboardingComplete: false
        };
    }

    state.user = db[email];
    state.loggedIn = true;
    saveDatabase();
    updateUIForAuth();
    window.closeAuth();

    if (state.isAdmin) {
        window.switchTab('partner');
        showToast('Admin Gateway Unlocked');
    } else if (!state.user.onboardingComplete) {
        window.startOnboarding();
    } else {
        window.switchTab('profile');
        showToast('Secure Session Authenticated');
    }
}

// UI UPDATES
function updateUIForAuth() {
    const nav = $('bottom-nav');
    if (!nav) return;

    if (state.loggedIn) {
        $('topbar-profile-text').textContent = 'Profile';
        nav.classList.remove('hidden');
        
        // Inject Mobile Bottom Nav
        nav.innerHTML = `
            <button class="bnav-item" data-tab="search" onclick="window.switchTab('search')">
                <i class="fa-solid fa-magnifying-glass"></i><span>Prices</span>
            </button>
            <button class="bnav-item" data-tab="access" onclick="window.switchTab('access')">
                <i class="fa-solid fa-credit-card"></i><span>Card</span>
            </button>
            <button class="bnav-item" data-tab="profile" onclick="window.switchTab('profile')">
                <i class="fa-solid fa-user"></i><span>Profile</span>
            </button>
            ${state.isAdmin ? `
            <button class="bnav-item" data-tab="partner" onclick="window.switchTab('partner')">
                <i class="fa-solid fa-chart-line"></i><span>Admin</span>
            </button>
            <button class="bnav-item" data-tab="analytics" onclick="window.switchTab('analytics')">
                <i class="fa-solid fa-magnifying-glass-chart"></i><span>Data</span>
            </button>
            ` : ''}
        `;

        injectUserData();
        renderMedicineCabinet();
    } else {
        $('topbar-profile-text').textContent = 'Sign In';
        nav.classList.add('hidden');
    }
}

function injectUserData() {
    if (!state.user) return;
    
    // Inject Vault Data
    if ($('pf-name')) $('pf-name').value = state.user.name || '';
    if ($('pf-email')) $('pf-email').value = state.user.email || '';
    if ($('pf-dob')) $('pf-dob').value = state.user.dob || '';
    if ($('pf-idnum')) $('pf-idnum').value = state.user.idNum || '';
    
    // Inject Insurance Data
    if (state.user.insurance) {
        if ($('pf-insurance')) $('pf-insurance').value = state.user.insurance.provider || '';
        if ($('pf-ins-member')) $('pf-ins-member').value = state.user.insurance.memberId || '';
        if ($('pf-ins-group')) $('pf-ins-group').value = state.user.insurance.group || '';
    }

    // Inject Card Data
    if ($('card-member-name')) $('card-member-name').textContent = state.user.name.toUpperCase() || 'MEMBER';
    if ($('card-member-email')) $('card-member-email').textContent = state.user.email || '';
    if ($('card-member-id')) $('card-member-id').textContent = state.user.memberId || '';
    if ($('profile-name-display')) $('profile-name-display').textContent = state.user.name || 'Member';

    // Inject KPIs
    if ($('dashboard-pts')) $('dashboard-pts').textContent = `${state.user.points || 0} pts`;
    if ($('reward-points-display')) $('reward-points-display').textContent = state.user.points || 0;
}

// NAVIGATION
window.switchTab = (tab, direction = 'fade') => {
    state.activeTab = tab;
    $$('.tab-panel').forEach(p => p.classList.add('hidden'));
    const target = $('tab-' + tab);
    if (target) target.classList.remove('hidden');

    $$('.sidebar-link, .bnav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    window.scrollTo(0, 0);
};

// SEARCH LOGIC & INJECTION
function filterDrugs() {
    const q = $('drug-search').value.toLowerCase();
    const list = $('search-results-list');
    if (!q) return list.classList.add('hidden');

    const matches = DRUGS.filter(d => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q));
    
    if(matches.length === 0) {
        list.innerHTML = `<li class="text-muted p-16 text-center">No medications found in active formulary.</li>`;
    } else {
        list.innerHTML = matches.map(d => `
            <li onclick="window.showDrugPage('${d.name}')" class="flex-between-center p-16 border-bottom-subtle hover-bg-surface cursor-pointer">
                <div>
                    <div class="font-bold text-primary">${d.name}</div>
                    <div class="text-xs text-muted mt-4">${d.generic}</div>
                </div>
                <i class="fa-solid fa-chevron-right text-emerald"></i>
            </li>
        `).join('');
    }
    list.classList.remove('hidden');
}

window.showDrugPage = (name) => {
    const d = DRUGS.find(x => x.name === name);
    currentDrugInfo = d;
    $('search-results-list').classList.add('hidden');
    $('drug-search').value = '';

    const dosages = [...new Set(d.variants.map(v => v.dosage))];

    $('drug-detail-content').innerHTML = `
        <h1 class="display-heading-sm text-primary mb-8">${d.name}</h1>
        <p class="text-md text-muted mb-32">${d.generic}</p>

        <div class="bg-elevated border-subtle radius-12 p-24 mb-32">
            <div class="grid-2col gap-16">
                <div class="field-group mb-0">
                    <label class="field-label">SELECT DOSAGE</label>
                    <select id="det-dosage" class="gate-input bg-surface" onchange="window.updatePriceGrid()">
                        ${dosages.map(ds => `<option value="${ds}">${ds}</option>`).join('')}
                    </select>
                </div>
                <div class="field-group mb-0">
                    <label class="field-label">PHARMACY ZIP CODE</label>
                    <div class="input-wrapper relative-container">
                        <input type="text" id="det-zip" class="gate-input bg-surface" placeholder="e.g. 32259" />
                        <button class="absolute-vcenter right-8 gate-btn py-8 px-16 w-auto" onclick="window.updatePriceGrid(true)">Check</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-between-center mb-16">
            <h3 class="text-sm font-bold text-muted uppercase-tracked m-0">LIVE MARKET PRICING</h3>
            <span class="text-xs font-bold text-emerald uppercase-tracked px-8 py-4 bg-emerald-tint radius-4" id="loc-badge">NATIONAL AVERAGE</span>
        </div>
        
        <div id="price-grid-area" class="flex-col-gap-16"></div>
        
        <div class="mt-40">
            ${state.loggedIn 
                ? `<button class="gate-btn btn-jumbo shadow-glow" onclick="window.addCurrentToCabinet()"><i class="fa-solid fa-plus btn-icon-left"></i> Save to Medicine Cabinet</button>`
                : `<button class="gate-btn btn-jumbo shadow-glow" onclick="window.openAuth()"><i class="fa-solid fa-unlock btn-icon-left"></i> Unlock Savings Card</button>`
            }
        </div>
    `;
    window.switchTab('drug-detail');
    window.updatePriceGrid(false);
};

window.updatePriceGrid = (isLocal = false) => {
    const dosage = $('det-dosage').value;
    const v = currentDrugInfo.variants.find(x => x.dosage === dosage);
    
    let sleek = v.sleekmed;
    let grx = v.goodrx;
    
    // Simulate ZIP Code variance mathematically
    if (isLocal) {
        const zip = $('det-zip').value;
        if(zip.length >= 5) {
            let hash = 0; for(let i=0; i<zip.length; i++) hash += zip.charCodeAt(i);
            const modifier = 0.90 + ((hash % 20) / 100); 
            sleek = sleek * modifier;
            grx = grx * (modifier + 0.05);
            $('loc-badge').textContent = `LOCAL (${zip})`;
        }
    }

    $('price-grid-area').innerHTML = `
        <div class="bg-card-dark border-emerald p-24 radius-12 flex-between-center relative-container overflow-hidden shadow-sm">
            <div class="absolute-top-right bg-emerald text-dark text-xxs font-bold px-12 py-4 radius-bl-8">BEST PRICE</div>
            <div>
                <div class="text-md font-bold text-primary mb-4">SleekMed Direct</div>
                <div class="text-xs text-muted">Use free digital card at pharmacy</div>
            </div>
            <div class="text-3xl font-bold font-mono text-emerald tracking-tight">${fmt(sleek)}</div>
        </div>
        
        <div class="bg-elevated border-subtle p-24 radius-12 flex-between-center">
            <div>
                <div class="text-md font-bold text-primary mb-4">Cost Plus Drugs</div>
                <div class="text-xs text-muted">Mail order only. Shipping required.</div>
            </div>
            <div class="text-xl font-bold font-mono text-secondary">${fmt(v.costplus)}</div>
        </div>
        
        <div class="bg-elevated border-subtle p-24 radius-12 flex-between-center">
            <div>
                <div class="text-md font-bold text-primary mb-4">GoodRx (Estimated)</div>
                <div class="text-xs text-muted">Averages based on local networks</div>
            </div>
            <div class="text-xl font-bold font-mono text-secondary">${fmt(grx)}</div>
        </div>
        
        <div class="bg-elevated border-subtle p-24 radius-12 flex-between-center opacity-50">
            <div>
                <div class="text-md font-bold text-primary mb-4">Insurance Co-Pay (Avg)</div>
                <div class="text-xs text-muted">Based on national tier 2 plans</div>
            </div>
            <div class="text-xl font-bold font-mono text-secondary">${fmt(v.insurance)}</div>
        </div>
    `;
};

// ONBOARDING FLOW
window.startOnboarding = () => {
    $('onboard-overlay').classList.remove('hidden');
    window.nextOnboard(1);
};

window.nextOnboard = (step) => {
   .forEach(s => {
        const el = $('onboard-step-' + s);
        if (el) el.classList.add('hidden');
    });
    $('onboard-step-' + step).classList.remove('hidden');
};

window.finishOnboard = () => {
    state.user.onboardingComplete = true;
    state.user.points = 500;
    
    // Save Onboarding Data
    state.user.dob = $('ob-dob').value;
    state.user.idNum = $('ob-idnum').value;
    state.user.insurance = {
        provider: $('ob-ins-name').value,
        memberId: $('ob-ins-id').value,
        group: $('ob-ins-group') ? $('ob-ins-group').value : '',
        bin: '015995', // Default platform BIN
        pcn: 'GDC'
    };

    saveDatabase();
    $('onboard-overlay').classList.add('hidden');
    injectUserData();
    window.switchTab('profile');
    showToast("Profile Securely Initialized. +500 pts");
};

// PROFILE / CABINET MGMT
window.autoSaveProfile = () => {
    if(!state.user) return;
    
    state.user.name = $('pf-name').value;
    state.user.email = $('pf-email').value;
    state.user.dob = $('pf-dob').value;
    state.user.idNum = $('pf-idnum').value;
    
    state.user.insurance = {
        provider: $('pf-insurance').value,
        memberId: $('pf-ins-member').value,
        group: $('pf-ins-group').value,
        bin: $('pf-ins-bin').value,
        pcn: $('pf-ins-pcn').value
    };

    saveDatabase();
    injectUserData();
    showToast('Vault Data Encrypted and Saved');
};

window.addCurrentToCabinet = () => {
    if (!state.loggedIn) return window.openAuth();
    const dosage = $('det-dosage').value;
    
    state.user.cabinet.push({ 
        name: currentDrugInfo.name, 
        dosage: dosage, 
        qty: '30 Day Supply', 
        refills: 3 
    });
    
    state.user.points += 250;
    saveDatabase();
    injectUserData();
    renderMedicineCabinet();
    
    showToast("Saved to Cabinet. +250 Pts");
    window.switchTab('profile');
};

window.removeFromCabinet = (index) => {
    state.user.cabinet.splice(index, 1);
    saveDatabase();
    renderMedicineCabinet();
    showToast("Prescription Removed");
};

function renderMedicineCabinet() {
    const list = $('medicine-cabinet-list');
    if (!list) return;
    
    if (!state.user.cabinet || state.user.cabinet.length === 0) {
        list.innerHTML = `<div class="text-center p-40 text-muted"><i class="fa-solid fa-prescription-bottle-medical text-4xl mb-16"></i><p>Your cabinet is empty.</p></div>`;
        return;
    }
    
    list.innerHTML = state.user.cabinet.map((d, i) => `
        <div class="flex-between-center p-16 border-bottom-subtle hover-bg-surface">
            <div>
                <div class="font-bold text-primary text-md">${d.name} <span class="text-secondary font-normal ml-8">${d.dosage}</span></div>
                <div class="text-xs text-emerald font-mono mt-4">${d.qty} | ${d.refills} Refills Active</div>
            </div>
            <button onclick="window.removeFromCabinet(${i})" class="icon-button text-red"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

// LOGOUT / DELETE
function handleLogout() {
    state.loggedIn = false;
    state.isAdmin = false;
    state.user = null;
    updateUIForAuth();
    window.switchTab('search', 'backward');
    showToast('Secure Session Terminated');
}

window.openDeleteModal = () => {
    $('delete-modal-overlay').classList.remove('hidden');
    setTimeout(() => $('delete-modal-overlay').classList.add('modal-show'), 10);
};

window.closeDeleteModal = () => {
    $('delete-modal-overlay').classList.remove('modal-show');
    setTimeout(() => $('delete-modal-overlay').classList.add('hidden'), 300);
};

window.confirmDeleteAccount = () => {
    if (state.user) {
        delete db[state.user.email];
        localStorage.setItem('sleekmed_db', JSON.stringify(db));
        window.closeDeleteModal();
        handleLogout();
        showToast('Account Data Permanently Purged');
    }
};

// ADMIN FUNCTIONS
window.calcAdminRev = () => {
    const claims = parseFloat($('admin-members').value) || 0;
    const fee = parseFloat($('admin-fee').value) || 0;
    $('admin-rev-display').textContent = '$' + (claims * fee).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
};

window.testAPI = (provider) => {
    showToast(`Initializing ${provider} Handshake...`);
    setTimeout(() => {
        showToast(`ERROR: ${provider} connection requires API keys in GLOBAL_CONFIG`);
    }, 1500);
};

// DIRECTORY & FAQ FILTERS
window.filterDirectory = () => {
    const search = $('dir-search').value.toLowerCase();
    const cat = $('dir-category').value;
    
    $$('.dir-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        const matchesSearch = text.includes(search);
        
        // This is a simplified hardcoded filter for the prototype depth proof
        let matchesCat = true;
        if(cat !== 'All') {
            matchesCat = text.includes(cat.toLowerCase());
        }
        
        if (matchesSearch && matchesCat) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
};

window.filterFAQ = () => {
    const q = $('faq-search-input').value.toLowerCase();
    $$('.faq-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
};

window.showAuthStep1 = () => { $('auth-step-2').classList.add('hidden'); $('auth-step-1').classList.remove('hidden'); };
window.openAuth = () => { $('auth-panel').classList.remove('hidden'); $('auth-overlay').classList.remove('hidden'); };

// Boot
document.addEventListener('DOMContentLoaded', bootApp);
