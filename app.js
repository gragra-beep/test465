// ===== ОБЩЕЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  energy: 8000,
  maxEnergy: 80,
  silver: 1000553,
  currentLoc: null,
  currentCard: null,
  currentCardIndex: null,
  completedLocs: [1, 2, 3],
  bannerRolls: 0,
  lastEpicRoll: 0,
  lastLegendaryRoll: 0,
  lastMythicRoll: 0
};

// ===== УТИЛИТЫ =====
function getMaxEnergy() {
  return 50 + state.completedLocs.length * 10;
}

function getHighestCompleted() {
  return state.completedLocs.length > 0 ? Math.max(...state.completedLocs) : 0;
}

function isLocationUnlocked(loc) {
  return loc.id <= getHighestCompleted() + 1;
}

// ===== СОХРАНЕНИЕ/ЗАГРУЗКА =====
function saveGame() {
  const currentInventory = PLAYER_ACCOUNTS[state.currentLogin] 
    ? PLAYER_ACCOUNTS[state.currentLogin].cards 
    : [];

  const saveData = {
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    silver: state.silver,
    completedLocs: state.completedLocs,
    bannerRolls: state.bannerRolls,
    lastEpicRoll: state.lastEpicRoll,
    lastLegendaryRoll: state.lastLegendaryRoll,
    lastMythicRoll: state.lastMythicRoll,
    playerCards: currentInventory
  };
  localStorage.setItem('remanga_save_' + state.currentLogin, JSON.stringify(saveData));
}

function loadGame() {
  if (!state.currentLogin) return;
  const saved = localStorage.getItem('remanga_save_' + state.currentLogin);
  if (saved) {
    const data = JSON.parse(saved);
    
    state.energy = data.energy !== undefined ? data.energy : state.energy;
    state.maxEnergy = data.maxEnergy !== undefined ? data.maxEnergy : state.maxEnergy;
    state.silver = data.silver !== undefined ? data.silver : state.silver;
    state.completedLocs = data.completedLocs || [];
    state.bannerRolls = data.bannerRolls || 0;
    state.lastEpicRoll = data.lastEpicRoll || 0;
    state.lastLegendaryRoll = data.lastLegendaryRoll || 0;
    state.lastMythicRoll = data.lastMythicRoll || 0;

    if (data.playerCards && PLAYER_ACCOUNTS[state.currentLogin]) {
      PLAYER_ACCOUNTS[state.currentLogin].cards = data.playerCards;
    }
  }
}

// ===== ЛОГИН =====
function doLogin() {
  const login = document.getElementById('loginInput').value;
  const pass = document.getElementById('passwordInput').value;
  if (login === 'ooo' && pass === '1234') {
    state.currentLogin = login;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('topbar').style.display = 'flex';
    document.getElementById('navBar').style.display = 'flex';
    
    loadGame();
    
    state.maxEnergy = getMaxEnergy();
    if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
    
    updateResources();
    initMap();
    renderCards();
    updateSummonCounters();
  } else {
    document.getElementById('loginError').textContent = 'Неверный логин или пароль';
  }
}
document.getElementById('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('passwordInput').focus(); });

// ===== НАВИГАЦИЯ =====
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
}

// ===== РЕСУРСЫ =====
function updateResources() {
  document.getElementById('resEnergy').textContent = state.energy;
  document.getElementById('resMaxEnergy').textContent = state.maxEnergy;
  document.getElementById('resSilver').textContent = state.silver;
}

// ===== TOAST =====
function showToast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.className = 'toast', 2500);
}

// ===== ЗАКРЫТИЕ МОДАЛОК ПО КЛИКУ НА ОВЕРЛЕЙ =====
document.getElementById('locModal').addEventListener('click', e => {
  if (e.target === document.getElementById('locModal')) closeLocModal();
});
document.getElementById('cardModal').addEventListener('click', e => {
  if (e.target === document.getElementById('cardModal')) closeCardModal();
});
document.getElementById('bannerModal').addEventListener('click', e => {
  if (e.target === document.getElementById('bannerModal')) closeBannerModal();
});
