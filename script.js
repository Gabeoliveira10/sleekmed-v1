const meds = [
    { name: "Ozempic", cat: "Weight", GoodRx: 924.10, SingleCare: 938.00 },
    { name: "Lipitor", cat: "Heart", GoodRx: 4.12, SingleCare: 5.25 },
    { name: "Amoxicillin", cat: "Antibiotic", GoodRx: 2.50, SingleCare: 3.10 }
];

function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
}

function filterMeds() {
    const query = document.getElementById('medSearch').value.toLowerCase();
    const filtered = meds.filter(m => m.name.toLowerCase().includes(query));
    render(filtered);
}

function render(data) {
    const container = document.getElementById('med-feed');
    container.innerHTML = data.map(m => `
        <div class="med-card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="font-weight: 700;">${m.name}</div>
                <div style="font-size: 0.7rem; color: #059669; font-weight: 700;">${m.cat}</div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span>GoodRx</span>
                <span style="font-weight: 700; color: #059669;">$${m.GoodRx.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

render(meds);