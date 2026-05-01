'use strict';

const DRUGS = [
  { name: 'Albuterol', generic: 'Generic ProAir', variants: [{ dosage: '90mcg', qty: '1 inhaler', insurance: 20, costplus: 15, goodrx: 18, sleekmed: 12 }] },
  { name: 'Amlodipine', generic: 'Generic Norvasc', variants: [{ dosage: '5mg', qty: '30 tabs', insurance: 15, costplus: 8, goodrx: 10, sleekmed: 5.80 }] },
  { name: 'Atorvastatin', generic: 'Generic Lipitor', variants: [{ dosage: '40mg', qty: '30 tabs', insurance: 15, costplus: 6, goodrx: 11, sleekmed: 4.80 }] },
  { name: 'Escitalopram', generic: 'Generic Lexapro', variants: [{ dosage: '10mg', qty: '30 tabs', insurance: 20, costplus: 8.5, goodrx: 11, sleekmed: 6.20 }] },
  { name: 'Lisinopril', generic: 'Generic Prinivil', variants: [{ dosage: '10mg', qty: '30 tabs', insurance: 10, costplus: 4.5, goodrx: 7, sleekmed: 3.80 }] },
  { name: 'Metformin', generic: 'Generic Glucophage', variants: [{ dosage: '500mg', qty: '60 tabs', insurance: 10, costplus: 6, goodrx: 8, sleekmed: 4.60 }] },
  { name: 'Ozempic', generic: 'Semaglutide', variants: [{ dosage: '1mg', qty: '1 pen', insurance: 300, costplus: 995, goodrx: 349, sleekmed: 320 }] },
  { name: 'Sertraline', generic: 'Generic Zoloft', variants: [{ dosage: '50mg', qty: '30 tabs', insurance: 15, costplus: 6, goodrx: 9, sleekmed: 4.50 }] }
];

let state = { loggedIn: false, user: null, currentDrug: null };

// --- UI Navigation ---
window.switchTab = (tabId) => {
    document.querySelectorAll('.tab-section').forEach(t => t.classList.add('hidden'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    window.scrollTo(0,0);
};

// --- Authentication ---
window.openAuthModal = () => document.getElementById('auth-modal').classList.remove('hidden');
window.closeAuthModal = () => document.getElementById('auth-modal').classList.add('hidden');
window.showAuthStep1 = () => { document.getElementById('auth-step-2').classList.add('hidden'); document.getElementById('auth-step-1').classList.remove('hidden'); };
window.showAuthStep2 = () => { 
    if(!document.getElementById('login-email').value) return alert('Email required');
    document.getElementById('auth-step-1').classList.add('hidden'); document.getElementById('auth-step-2').classList.remove('hidden'); 
};
window.handleLogin = () => {
    state.loggedIn = true;
    state.user = { name: document.getElementById('login-name').value || 'Member', cabinet: [] };
    document.getElementById('pf-name').value = state.user.name;
    document.querySelector('.nav-actions').innerHTML = `<button class="btn-primary" onclick="window.switchTab('profile')">Profile</button>`;
    window.closeAuthModal();
    window.switchTab('profile');
};
window.handleLogout = () => {
    state.loggedIn = false; state.user = null;
    document.querySelector('.nav-actions').innerHTML = `<button class="btn-outline" onclick="window.openAuthModal()">Sign In</button>`;
    window.switchTab('search');
};

// --- Search Engine ---
document.getElementById('drug-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const list = document.getElementById('search-results');
    if (!q) return list.classList.add('hidden');

    const matches = DRUGS.filter(d => d.name.toLowerCase().includes(q) || d.generic.toLowerCase().includes(q));
    list.innerHTML = matches.map(d => `
        <li onclick="window.loadDrug('${d.name}')">
            <strong>${d.name}</strong> <span class="text-muted text-sm ml-2">${d.generic}</span>
        </li>
    `).join('');
    list.classList.remove('hidden');
});

// --- Drug Detail View ---
window.loadDrug = (name) => {
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('drug-search').value = '';
    
    const d = DRUGS.find(x => x.name === name);
    state.currentDrug = d;
    const v = d.variants;

    document.getElementById('drug-detail-content').innerHTML = `
        <div class="section-header flex justify-between items-center">
            <div>
                <h1 class="section-title mb-1">${d.name}</h1>
                <p class="text-muted">${d.generic} | ${v.dosage} | ${v.qty}</p>
            </div>
            ${state.loggedIn ? `<button class="btn-primary" onclick="window.saveToCabinet()"><i class="fa-solid fa-plus"></i> Save Rx</button>` : ''}
        </div>

        <div class="card-panel">
            <h2 class="panel-title">Comparative Market Pricing</h2>
            <div class="price-row bg-emerald-tint rounded-lg p-4 border border-emerald mb-4">
                <div>
                    <div class="price-source text-emerald">SleekMed Direct (Digital Card)</div>
                </div>
                <div class="price-val text-emerald font-bold">$${v.sleekmed.toFixed(2)}</div>
            </div>
            <div class="price-row">
                <div class="price-source">Cost Plus Drugs (Mail Order)</div>
                <div class="price-val">$${v.costplus.toFixed(2)}</div>
            </div>
            <div class="price-row">
                <div class="price-source">GoodRx (National Average)</div>
                <div class="price-val">$${v.goodrx.toFixed(2)}</div>
            </div>
            <div class="price-row">
                <div>
                    <div class="price-source text-muted">Standard Insurance Co-Pay</div>
                    <div class="text-xs text-muted">Based on Tier 2 formulary averages</div>
                </div>
                <div class="price-val text-muted">$${v.insurance.toFixed(2)}</div>
            </div>
        </div>
    `;
    window.switchTab('drug-detail');
};

// --- Profile & Cabinet ---
window.saveToCabinet = () => {
    if(!state.loggedIn) return;
    state.user.cabinet.push(state.currentDrug);
    document.getElementById('dash-pts').textContent = parseInt(document.getElementById('dash-pts').textContent) + 250;
    renderCabinet();
    alert('Medication Saved to Profile');
};

function renderCabinet() {
    const list = document.getElementById('cabinet-list');
    if (state.user.cabinet.length === 0) {
        list.innerHTML = `<p class="text-muted text-center py-6">No medications currently saved.</p>`;
        return;
    }
    list.innerHTML = state.user.cabinet.map((d, i) => `
        <div class="price-row">
            <div>
                <strong>${d.name}</strong>
                <div class="text-sm text-muted">${d.variants.dosage}</div>
            </div>
            <button class="btn-text text-red" onclick="window.removeCabinet(${i})"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

window.removeCabinet = (idx) => { state.user.cabinet.splice(idx, 1); renderCabinet(); };
window.saveProfile = () => alert('Profile Information Updated');
