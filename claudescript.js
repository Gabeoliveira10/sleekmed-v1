document.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const authModalOverlay = document.getElementById('authModalOverlay');
  
  let isLoggedIn = false;

  const mockDrugs = [
    "Metformin", "Lisinopril", "Atorvastatin", "Ozempic", "Adderall",
    "Levothyroxine", "Amlodipine", "Albuterol", "Omeprazole", "Losartan"
  ];

  function switchPage(pageId) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');
    
    navLinks.forEach(l => {
      if (l.getAttribute('data-page') === pageId) {
        l.classList.add('active');
      }
    });
    window.scrollTo(0,0);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      if (pageId) switchPage(pageId);
    });
  });

  document.getElementById('btnSignIn').addEventListener('click', () => {
    authModalOverlay.style.display = 'flex';
  });
  
  document.getElementById('authModalClose').addEventListener('click', () => {
    authModalOverlay.style.display = 'none';
  });

  document.getElementById('doSignInBtn').addEventListener('click', () => {
    isLoggedIn = true;
    authModalOverlay.style.display = 'none';
    updateUIForAuth();
    switchPage('vault');
  });

  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    isLoggedIn = false;
    updateUIForAuth();
    switchPage('home');
  });

  function updateUIForAuth() {
    const authLinks = document.querySelectorAll('.req-auth');
    if (isLoggedIn) {
      document.getElementById('btnSignIn').style.display = 'none';
      document.getElementById('btnJoin').innerText = 'My Account';
      authLinks.forEach(link => link.style.display = 'block');
    } else {
      document.getElementById('btnSignIn').style.display = 'block';
      document.getElementById('btnJoin').innerText = 'Get Started';
      authLinks.forEach(link => link.style.display = 'none');
    }
  }

  // Autocomplete Logic
  function setupAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener('input', () => {
      const val = input.value.toLowerCase();
      dropdown.innerHTML = '';
      if (!val) {
        dropdown.style.display = 'none';
        return;
      }
      const matches = mockDrugs.filter(d => d.toLowerCase().includes(val));
      if (matches.length > 0) {
        dropdown.style.display = 'block';
        matches.forEach(match => {
          const div = document.createElement('div');
          div.className = 'autocomplete-item';
          div.innerText = match;
          div.addEventListener('click', () => {
            input.value = match;
            dropdown.style.display = 'none';
            executeSearch(match);
          });
          dropdown.appendChild(div);
        });
      } else {
        dropdown.style.display = 'none';
      }
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value) {
        dropdown.style.display = 'none';
        executeSearch(input.value);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target !== input) dropdown.style.display = 'none';
    });
  }

  setupAutocomplete('heroSearchInput', 'heroAutocomplete');
  setupAutocomplete('pageSearchInput', 'pageAutocomplete');

  function executeSearch(query) {
    switchPage('search');
    document.getElementById('pageSearchInput').value = query;
    document.getElementById('searchResultTitle').innerText = `Results for "${query}"`;
    document.getElementById('searchResultsPanel').style.display = 'block';
    
    // Generate mock pricing grid
    const grid = document.getElementById('priceGrid');
    grid.innerHTML = `
      <div class="price-card best-price">
        <div class="best-badge">★ Best Price</div>
        <div class="provider-name">SleekMed Direct</div>
        <div class="price-value">$4.87</div>
        <div class="payment-type">Cash / No Insurance</div>
      </div>
      <div class="price-card">
        <div class="provider-name">Cost Plus Drug Co.</div>
        <div class="price-value">$8.50</div>
        <div class="payment-type">Cash + Shipping</div>
      </div>
      <div class="price-card">
        <div class="provider-name">GoodRx Network</div>
        <div class="price-value">$12.40</div>
        <div class="payment-type">Discount Card</div>
      </div>
      <div class="price-card">
        <div class="provider-name">Avg. Insurance Co-Pay</div>
        <div class="price-value">$45.00</div>
        <div class="payment-type">Tier 2 Formulary</div>
      </div>
    `;
  }

  // FAQ Accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

  // Initialize
  updateUIForAuth();
});
document.addEventListener('DOMContentLoaded', () => {
  const mockDrugs = ["Metformin", "Lisinopril", "Atorvastatin", "Ozempic", "Adderall"];
  let isLoggedIn = false;

  const authOverlay = document.getElementById('authModalOverlay');
  const doSignInBtn = document.getElementById('doSignInBtn');
  const btnSignIn = document.getElementById('btnSignIn');
  const vaultSignInBtn = document.getElementById('vaultSignInBtn');
  const cabinetSignInBtn = document.getElementById('cabinetSignInBtn');
  
  function updateAuthUI() {
    const hiddenNavs = document.querySelectorAll('.auth-req');
    if (isLoggedIn) {
      hiddenNavs.forEach(nav => nav.style.display = 'block');
      document.getElementById('btnSignIn').style.display = 'none';
      if(document.getElementById('cabinetAuthGate')) document.getElementById('cabinetAuthGate').style.display = 'none';
      if(document.getElementById('cabinetContent')) document.getElementById('cabinetContent').style.display = 'block';
      if(document.getElementById('vaultAuthGate')) document.getElementById('vaultAuthGate').style.display = 'none';
      if(document.getElementById('vaultContent')) document.getElementById('vaultContent').style.display = 'block';
    }
  }

  function openAuth() { authOverlay.style.display = 'flex'; }
  
  if(btnSignIn) btnSignIn.addEventListener('click', openAuth);
  if(vaultSignInBtn) vaultSignInBtn.addEventListener('click', openAuth);
  if(cabinetSignInBtn) cabinetSignInBtn.addEventListener('click', openAuth);
  if(document.getElementById('authModalClose')) {
    document.getElementById('authModalClose').addEventListener('click', () => {
      authOverlay.style.display = 'none';
    });
  }

  if(doSignInBtn) {
    doSignInBtn.addEventListener('click', () => {
      isLoggedIn = true;
      authOverlay.style.display = 'none';
      updateAuthUI();
    });
  }

  const searchInput = document.getElementById('pageSearchInput');
  const searchDropdown = document.getElementById('pageSearchDropdown');

  if(searchInput && searchDropdown) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase();
      searchDropdown.innerHTML = '';
      if (!val) return;
      
      const matches = mockDrugs.filter(d => d.toLowerCase().includes(val));
      matches.forEach(match => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.cursor = 'pointer';
        div.style.borderBottom = '1px solid #1e2f4a';
        div.innerText = match;
        div.addEventListener('click', () => {
          searchInput.value = match;
          searchDropdown.innerHTML = '';
          executeSearch(match);
        });
        searchDropdown.appendChild(div);
      });
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchDropdown.innerHTML = '';
        executeSearch(searchInput.value);
      }
    });
  }

  function executeSearch(query) {
    document.getElementById('searchResultsPanel').style.display = 'block';
    const grid = document.getElementById('priceComparisonGrid');
    const basePrice = Math.random() * 30 + 10;
    
    grid.innerHTML = `
      <div class="price-card best-price">
        <div style="color: #10b981; font-size: 0.8rem; margin-bottom: 8px;">★ BEST PRICE</div>
        <div style="color: #94a3b8; font-size: 0.9rem;">Cost Plus Drug Co.</div>
        <div style="font-size: 2rem; color: #10b981;">$${basePrice.toFixed(2)}</div>
        <div style="font-size: 0.8rem; color: #94a3b8;">Direct Cash</div>
      </div>
      <div class="price-card">
        <div style="color: #94a3b8; font-size: 0.9rem;">GoodRx Gold</div>
        <div style="font-size: 2rem;">$${(basePrice * 1.3).toFixed(2)}</div>
        <div style="font-size: 0.8rem; color: #94a3b8;">Network Discount</div>
      </div>
      <div class="price-card">
        <div style="color: #94a3b8; font-size: 0.9rem;">Insurance Co-Pay</div>
        <div style="font-size: 2rem;">$${(basePrice * 3).toFixed(2)}</div>
        <div style="font-size: 0.8rem; color: #94a3b8;">Est. Tier 2</div>
      </div>
    `;
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const mockDrugs = ["Metformin", "Lisinopril", "Atorvastatin", "Ozempic", "Adderall"];
  let isLoggedIn = false;
  const authOverlay = document.getElementById('authModalOverlay');
  
  function updateAuth() {
    if (isLoggedIn) {
      document.querySelectorAll('.auth-req').forEach(el => el.style.display = 'block');
      document.getElementById('btnSignIn').style.display = 'none';
      if(document.getElementById('cabinetAuthGate')) document.getElementById('cabinetAuthGate').style.display = 'none';
      if(document.getElementById('cabinetContent')) document.getElementById('cabinetContent').style.display = 'block';
      if(document.getElementById('vaultAuthGate')) document.getElementById('vaultAuthGate').style.display = 'none';
      if(document.getElementById('vaultContent')) document.getElementById('vaultContent').style.display = 'block';
    }
  }

  const signBtn = document.getElementById('doSignInBtn');
  if (signBtn) {
    signBtn.addEventListener('click', () => {
      isLoggedIn = true;
      authOverlay.style.display = 'none';
      updateAuth();
    });
  }

  const searchInput = document.getElementById('heroSearchInput');
  const searchDropdown = document.getElementById('heroSearchDropdown');
  
  if(searchInput && searchDropdown) {
    searchInput.addEventListener('input', () => {
      const val = searchInput.value.toLowerCase();
      searchDropdown.innerHTML = '';
      if(!val) return;
      
      mockDrugs.filter(d => d.toLowerCase().includes(val)).forEach(match => {
        const div = document.createElement('div');
        div.innerText = match;
        div.addEventListener('click', () => {
          searchInput.value = match;
          searchDropdown.innerHTML = '';
        });
        searchDropdown.appendChild(div);
      });
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-search').classList.add('active');
        searchDropdown.innerHTML = '';
      }
    });
  }
});
