document.addEventListener('DOMContentLoaded', () => {
  const mockDrugs = ["Metformin", "Lisinopril", "Atorvastatin", "Ozempic", "Adderall"];
  let isLoggedIn = false;
  const authOverlay = document.getElementById('authModalOverlay');

  // 1. Tab Switching Logic
  document.querySelectorAll('.nav-link, .sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-page');
      if(!targetId) return;
      
      // Hide all pages
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      // Deselect all nav links
      document.querySelectorAll('.nav-link, .sidebar-link').forEach(l => l.classList.remove('active'));
      
      // Show requested page
      document.getElementById('page-' + targetId)?.classList.add('active');
      // Highlight requested link
      link.classList.add('active');
      window.scrollTo(0,0);
    });
  });

  // 2. Auth Button Wiring
  document.getElementById('btnSignIn')?.addEventListener('click', () => authOverlay.style.display = 'flex');
  document.getElementById('btnJoin')?.addEventListener('click', () => authOverlay.style.display = 'flex');
  document.getElementById('authModalClose')?.addEventListener('click', () => authOverlay.style.display = 'none');
  
  document.getElementById('doSignInBtn')?.addEventListener('click', () => {
    isLoggedIn = true;
    authOverlay.style.display = 'none';
    // Reveal restricted tabs
    document.querySelectorAll('.auth-req').forEach(el => el.style.display = 'inline-block');
    document.getElementById('btnSignIn').style.display = 'none';
  });

  // 3. Autocomplete & Search Logic
  const setupAutocomplete = (inputId, dropdownId) => {
    const input = document.getElementById(inputId);
    const drop = document.getElementById(dropdownId);
    if (!input || !drop) return;

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase();
      drop.innerHTML = '';
      if (!val) {
        drop.style.display = 'none';
        return;
      }
      
      const matches = mockDrugs.filter(d => d.toLowerCase().includes(val));
      if (matches.length > 0) {
        drop.style.display = 'block';
        matches.forEach(match => {
          const div = document.createElement('div');
          div.innerText = match;
          div.onclick = () => { 
            input.value = match; 
            drop.style.display = 'none';
            executeSearch(match); 
          };
          drop.appendChild(div);
        });
      } else {
        drop.style.display = 'none';
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        drop.style.display = 'none';
        executeSearch(input.value);
      }
    });
  };

  // 4. Executing Search to show Results
  function executeSearch(query) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-search').classList.add('active');
    document.getElementById('searchResultsPanel').style.display = 'block';
    
    document.getElementById('priceComparisonGrid').innerHTML = `
      <div class="price-card best-price">
        <div class="best-badge">★ BEST PRICE</div>
        <p>Cost Plus Drug Co.</p>
        <div class="price-val">$8.50</div>
      </div>
      <div class="price-card">
        <p>Est. Insurance Co-Pay</p>
        <div class="price-val">$45.00</div>
      </div>
      <div class="price-card">
        <p>GoodRx Gold</p>
        <div class="price-val">$12.40</div>
      </div>
    `;
  }

  // Initialize Search Bars
  setupAutocomplete('heroSearchInput', 'heroSearchDropdown');
  setupAutocomplete('pageSearchInput', 'pageSearchDropdown');
});
