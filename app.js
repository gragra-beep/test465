// ===== ОБЩЕЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  energy: 50,
  maxEnergy: 50,
  silver: 100,
  currentLoc: null,
  currentCard: null,
  currentCardIndex: null,
  completedLocs: [],
  bannerRolls: 0,
  lastEpicRoll: 0,
  lastLegendaryRoll: 0,
  lastMythicRoll: 0,
  lastEnergyUpdate: Date.now(),
  energyRegenRate: 3 // минут на 1 энергию
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

// ===== ВОССТАНОВЛЕНИЕ ЭНЕРГИИ =====
function restoreEnergy() {
  const now = Date.now();
  const elapsed = now - state.lastEnergyUpdate;
  const minutesPassed = Math.floor(elapsed / (state.energyRegenRate * 60 * 1000));
  
  if (minutesPassed > 0) {
    state.energy = Math.min(state.energy + minutesPassed, state.maxEnergy);
    state.lastEnergyUpdate = now;
  }
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
    lastEnergyUpdate: state.lastEnergyUpdate,
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
    state.lastEnergyUpdate = data.lastEnergyUpdate || Date.now();

    // Восстанавливаем энергию за время отсутствия
    restoreEnergy();

    if (data.playerCards && PLAYER_ACCOUNTS[state.currentLogin]) {
      PLAYER_ACCOUNTS[state.currentLogin].cards = data.playerCards;
    }
  }
}

// ===== РЕГИСТРАЦИЯ =====
function doRegister() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value;
  const errorDiv = document.getElementById('loginError');
  
  if (!login || !pass) {
    errorDiv.textContent = 'Заполните все поля';
    return;
  }
  
  if (login.length < 3) {
    errorDiv.textContent = 'Логин должен быть не короче 3 символов';
    return;
  }
  
  if (pass.length < 4) {
    errorDiv.textContent = 'Пароль должен быть не короче 4 символов';
    return;
  }
  
  if (PLAYER_ACCOUNTS[login]) {
    errorDiv.textContent = 'Такой логин уже занят';
    return;
  }
  
  createAccount(login, pass);
  
  state.currentLogin = login;
  localStorage.setItem('remanga_current_login', login);
  
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('navBar').style.display = 'flex';
  
  document.querySelector('.user-name').textContent = login;
  
  loadGame();
  
  state.maxEnergy = getMaxEnergy();
  if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
  
  updateResources();
  initMap();
  renderCards();
  updateSummonCounters();
}

// ===== ВХОД =====
function doLogin() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value;
  const errorDiv = document.getElementById('loginError');
  
  if (!login || !pass) {
    errorDiv.textContent = 'Заполните все поля';
    return;
  }
  
  if (!PLAYER_ACCOUNTS[login]) {
    errorDiv.textContent = 'Аккаунт не найден. Зарегистрируйтесь.';
    return;
  }
  
  if (PLAYER_ACCOUNTS[login].password !== pass) {
    errorDiv.textContent = 'Неверный пароль';
    return;
  }
  
  state.currentLogin = login;
  localStorage.setItem('remanga_current_login', login);
  
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('navBar').style.display = 'flex';
  
  document.querySelector('.user-name').textContent = login;
  
  loadGame();
  
  state.maxEnergy = getMaxEnergy();
  if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
  
  updateResources();
  initMap();
  renderCards();
  updateSummonCounters();
}

// ===== АВТО-ВХОД =====
function checkAutoLogin() {
  const savedLogin = localStorage.getItem('remanga_current_login');
  if (savedLogin && PLAYER_ACCOUNTS[savedLogin]) {
    state.currentLogin = savedLogin;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('topbar').style.display = 'flex';
    document.getElementById('navBar').style.display = 'flex';
    
    document.querySelector('.user-name').textContent = savedLogin;
    
    loadGame();
    
    state.maxEnergy = getMaxEnergy();
    if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
    
    updateResources();
    initMap();
    renderCards();
    updateSummonCounters();
  }
}

// ===== ВЫХОД =====
function logout() {
  localStorage.removeItem('remanga_current_login');
  state.currentLogin = null;
  location.reload();
}

document.getElementById('passwordInput').addEventListener('keydown', e => { 
  if (e.key === 'Enter') doLogin();
});
document.getElementById('loginInput').addEventListener('keydown', e => { 
  if (e.key === 'Enter') document.getElementById('passwordInput').focus(); 
});

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

// ===== ЗАКРЫТИЕ МОДАЛОК =====
document.getElementById('locModal').addEventListener('click', e => {
  if (e.target === document.getElementById('locModal')) closeLocModal();
});
document.getElementById('cardModal').addEventListener('click', e => {
  if (e.target === document.getElementById('cardModal')) closeCardModal();
});
document.getElementById('bannerModal').addEventListener('click', e => {
  if (e.target === document.getElementById('bannerModal')) closeBannerModal();
});

// ЗАПУСК ПРОВЕРКИ АВТО-ВХОДА
checkAutoLogin();
