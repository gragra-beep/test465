// ===== ОБЩЕЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  energy: 999999,
  maxEnergy: 999999,
  silver: 999999,
  currentLoc: null,
  currentCard: null,
  currentCardIndex: null,
  completedLocs: [],
  bannerRolls: 0,
  lastEpicRoll: 0,
  lastLegendaryRoll: 0,
  lastMythicRoll: 0
};

// ===== ЗАГРУЗКА АККАУНТОВ ПРИ СТАРТЕ =====
function loadAccounts() {
  const savedAccounts = localStorage.getItem('remanga_accounts');
  if (savedAccounts) {
    const accounts = JSON.parse(savedAccounts);
    Object.assign(PLAYER_ACCOUNTS, accounts);
  }
}
loadAccounts();

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
  localStorage.setItem('remanga_accounts', JSON.stringify(PLAYER_ACCOUNTS));
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
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value.trim();
  
  const account = PLAYER_ACCOUNTS[login];
  if (account && account.password === pass) {
    state.currentLogin = login;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('topbar').style.display = 'flex';
    document.getElementById('navBar').style.display = 'flex';
    document.getElementById('userMenuToggle').style.display = 'block';
    
    document.querySelector('.user-name').textContent = login;
    
    loadGame();
    state.maxEnergy = getMaxEnergy();
    if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;
    
    updateResources();
    initMap();
    renderCards();
    updateSummonCounters();
  } else {
    document.getElementById('loginError').textContent = 'Аккаунт не найден. Зарегистрируйтесь.';
    document.getElementById('loginError').style.color = '#f87171';
  }
}

document.getElementById('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('passwordInput').focus(); });

// ===== РЕГИСТРАЦИЯ =====
function doRegister() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value.trim();
  
  if (!login || !pass) {
    document.getElementById('loginError').textContent = 'Введите логин и пароль';
    document.getElementById('loginError').style.color = '#f87171';
    return;
  }
  
  if (PLAYER_ACCOUNTS[login]) {
    document.getElementById('loginError').textContent = 'Такой логин уже существует';
    document.getElementById('loginError').style.color = '#f87171';
    return;
  }
  
  createAccount(login, pass);
  localStorage.setItem('remanga_accounts', JSON.stringify(PLAYER_ACCOUNTS));
  
  document.getElementById('loginError').textContent = 'Аккаунт создан! Теперь войдите.';
  document.getElementById('loginError').style.color = '#34d399';
}

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
  
  // Обновляем дубли в меню
  if (document.getElementById('resEnergy3')) {
    document.getElementById('resEnergy3').textContent = state.energy;
    document.getElementById('resMaxEnergy3').textContent = state.maxEnergy;
  }
  if (document.getElementById('resSilver2')) {
    document.getElementById('resSilver2').textContent = state.silver;
  }
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
// ===== МЕНЮ ПОЛЬЗОВАТЕЛЯ =====
let menuOpen = false;

function toggleUserMenu() {
  menuOpen = !menuOpen;
  const menu = document.getElementById('userMenu');
  if (menuOpen) {
    menu.classList.add('show');
  } else {
    menu.classList.remove('show');
  }
}

// Закрытие меню при клике вне его
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  const toggle = document.getElementById('userMenuToggle');
  if (menu && menuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
    menuOpen = false;
    menu.classList.remove('show');
  }
});
// ===== МОДАЛЬНЫЕ СТРАНИЦЫ =====

function openInventory() {
  document.getElementById('inventoryModal').classList.add('show');
}

function closeInventory() {
  document.getElementById('inventoryModal').classList.remove('show');
}

function openQuests() {
  document.getElementById('questsModal').classList.add('show');
}

function closeQuests() {
  document.getElementById('questsModal').classList.remove('show');
}

function openGifts() {
  document.getElementById('giftsModal').classList.add('show');
}

function closeGifts() {
  document.getElementById('giftsModal').classList.remove('show');
}

// Закрытие модалок при клике на оверлей
document.getElementById('inventoryModal').addEventListener('click', e => {
  if (e.target === document.getElementById('inventoryModal')) closeInventory();
});
document.getElementById('questsModal').addEventListener('click', e => {
  if (e.target === document.getElementById('questsModal')) closeQuests();
});
document.getElementById('giftsModal').addEventListener('click', e => {
  if (e.target === document.getElementById('giftsModal')) closeGifts();
});
