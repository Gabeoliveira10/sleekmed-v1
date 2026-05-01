document.addEventListener('DOMContentLoaded', () => {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
  const authModalOverlay = document.getElementById('authModalOverlay');
  const purgeModalOverlay = document.getElementById('purgeModalOverlay');
  
  let isLoggedIn = false;

  // Navigation Logic
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
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      if (pageId) switchPage(pageId);
    });
  });

  // Modal Triggers
  function openModal(modal) {
    modal.style.display = 'flex';
  }
  
  function closeModal(modal) {
    modal.style.display = 'none';
  }

  // Open Auth Modal
  document.getElementById('btnSignIn').addEventListener('click', () => openModal(authModalOverlay));
  document.getElementById('cabinetSignInBtn')?.addEventListener('click', () => openModal(authModalOverlay));
  document.getElementById('vaultSignInBtn')?.addEventListener('click', () => openModal(authModalOverlay));
  
  // Close Auth Modal
  document.getElementById('authModalClose').addEventListener('click', () => closeModal(authModalOverlay));

  // Switch between Sign In and Register inside Modal
  const signInView = document.getElementById('authSignInView');
  const registerView = document.getElementById('authRegisterView');

  document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    signInView.style.display = 'none';
    registerView.style.display = 'block';
  });

  document.getElementById('switchToSignIn').addEventListener('click', (e) => {
    e.preventDefault();
    registerView.style.display = 'none';
    signInView.style.display = 'block';
  });

  // Handle Mock Login Execution
  document.getElementById('doSignInBtn').addEventListener('click', () => {
    isLoggedIn = true;
    closeModal(authModalOverlay);
    updateUIForAuth();
  });

  document.getElementById('completeRegBtn').addEventListener('click', () => {
    isLoggedIn = true;
    closeModal(authModalOverlay);
    updateUIForAuth();
  });

  // Update UI based on Login State
  function updateUIForAuth() {
    if (isLoggedIn) {
      document.getElementById('btnSignIn').style.display = 'none';
      document.getElementById('btnJoin').innerText = 'My Account';
      
      // Cabinet Update
      document.getElementById('cabinetAuthGate').style.display = 'none';
      document.getElementById('cabinetContent').style.display = 'block';

      // Vault Update
      document.getElementById('vaultAuthGate').style.display = 'none';
      document.getElementById('vaultContent').style.display = 'block';
      
      // Card Update
      document.getElementById('cardMemberName').innerText = "GABRIEL OLIVEIRA";
    } else {
      document.getElementById('btnSignIn').style.display = 'block';
      document.getElementById('btnJoin').innerText = 'Get Started';
      
      // Cabinet Update
      document.getElementById('cabinetAuthGate').style.display = 'block';
      document.getElementById('cabinetContent').style.display = 'none';

      // Vault Update
      document.getElementById('vaultAuthGate').style.display = 'block';
      document.getElementById('vaultContent').style.display = 'none';
      
      // Card Update
      document.getElementById('cardMemberName').innerText = "MEMBER NAME";
    }
  }

  // Handle Sign Out
  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    isLoggedIn = false;
    updateUIForAuth();
    switchPage('home');
  });

  // Purge Modal Logic
  document.getElementById('purgeBtn')?.addEventListener('click', () => openModal(purgeModalOverlay));
  document.getElementById('cancelPurgeBtn')?.addEventListener('click', () => closeModal(purgeModalOverlay));
  document.getElementById('confirmPurgeBtn')?.addEventListener('click', () => {
    const input = document.getElementById('purgeConfirmInput').value;
    if (input === 'DELETE') {
      isLoggedIn = false;
      closeModal(purgeModalOverlay);
      updateUIForAuth();
      switchPage('home');
      alert('Data permanently purged.');
    } else {
      alert('You must type DELETE to confirm.');
    }
  });

  // Search Logic (Mock)
  const heroSearchInput = document.getElementById('heroSearchInput');
  heroSearchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      switchPage('search');
      document.getElementById('pageSearchInput').value = heroSearchInput.value;
      document.getElementById('searchResultsPanel').style.display = 'block';
      document.getElementById('searchEmptyState').style.display = 'none';
    }
  });

  const pageSearchInput = document.getElementById('pageSearchInput');
  pageSearchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('searchResultsPanel').style.display = 'block';
      document.getElementById('searchEmptyState').style.display = 'none';
    }
  });
});
