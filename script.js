const medDatabase = [
    { name: "Atorvastatin", cat: "Generic Lipitor", price: 20.64 },
    { name: "Sildenafil", cat: "Generic Revatio", price: 29.40 },
    { name: "Amlodipine", cat: "Generic Norvasc", price: 18.01 },
    { name: "Escitalopram", cat: "Generic Lexapro", price: 29.66 },
    { name: "Metformin", cat: "Generic Glucophage", price: 4.00 }
];

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

function switchTab(viewId, element) {
    document.getElementById('view-market').classList.add('hidden');
    document.getElementById('view-access').classList.add('hidden');
    
    if (viewId === 'market') {
        document.getElementById('view-market').classList.remove('hidden');
    } else {
        document.getElementById('view-access').classList.remove('hidden');
    }
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
    window.scrollTo(0,0);
}

function render(data) {
    const feed = document.getElementById('med-feed');
    feed.innerHTML = data.map(m => `
        <div class="med-card">
            <div class="med-name">${m.name}</div>
            <div class="med-cat">${m.cat}</div>
            <div class="price-box">
                <span class="price-lbl">GoodRx Network</span>
                <span class="price-val">$${m.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

function filterMeds() {
    const query = document.getElementById('medSearch').value.toLowerCase();
    const filtered = medDatabase.filter(m => m.name.toLowerCase().includes(query));
    render(filtered);
}

window.onload = () => render(medDatabase);
