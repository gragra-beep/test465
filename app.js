// ===== ОБЩЕЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  energy: 5,
  maxEnergy: 50,
  silver: 100,
  currentLoc: null,
  currentCard: null,
  currentCardIndex: null,
  completedLocs: [],
  bannerRolls: 0,
  lastEpicRoll: 0,
  lastLegendaryRoll: 0,
  lastMythicRoll: 0
};

// ===== ЗАГРУЗКА АККАУНТОВ =====
function loadAccounts() {
  if (typeof db !== 'undefined') {
    db.ref('accounts').once('value').then((snapshot) => {
      const cloudAccounts = snapshot.val() || {};
      Object.assign(PLAYER_ACCOUNTS, cloudAccounts);
      console.log("✅ Аккаунты загружены из Firebase:", Object.keys(cloudAccounts));
    }).catch((error) => {
      console.error("⚠️ Ошибка Firebase, используем локальные данные:", error);
      loadLocalAccounts();
    });
  } else {
    console.log("⚠️ Переменная db не найдена, используем локальные данные");
    loadLocalAccounts();
  }
}

function loadLocalAccounts() {
  const savedAccounts = localStorage.getItem('remanga_accounts');
  if (savedAccounts) {
    Object.assign(PLAYER_ACCOUNTS, JSON.parse(savedAccounts));
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

// ===== СОХРАНЕНИЕ =====
function saveGame() {
  if (!state.currentLogin) return;
  const account = PLAYER_ACCOUNTS[state.currentLogin];
  if (!account) return;
  
  const saveData = {
    password: account.password,
    energy: state.energy,
    maxEnergy: state.maxEnergy,
    silver: state.silver,
    completedLocs: state.completedLocs,
    bannerRolls: state.bannerRolls,
    lastEpicRoll: state.lastEpicRoll,
    lastLegendaryRoll: state.lastLegendaryRoll,
    lastMythicRoll: state.lastMythicRoll,
    cards: account.cards || []
  };
  
  if (typeof db !== 'undefined') {
    db.ref('accounts/' + state.currentLogin).update(saveData)
      .catch((error) => console.error("Ошибка сохранения в Firebase:", error));
  } else {
    localStorage.setItem('remanga_save_' + state.currentLogin, JSON.stringify(saveData));
  }
}

function loadGame() {
  if (!state.currentLogin) return;
  const account = PLAYER_ACCOUNTS[state.currentLogin];
  if (!account) return;
  
  state.energy = account.energy !== undefined ? account.energy : state.energy;
  state.maxEnergy = account.maxEnergy !== undefined ? account.maxEnergy : state.maxEnergy;
  state.silver = account.silver !== undefined ? account.silver : state.silver;
  state.completedLocs = account.completedLocs || [];
  state.bannerRolls = account.bannerRolls || 0;
  
  if (account.cards) {
    PLAYER_ACCOUNTS[state.currentLogin].cards = account.cards;
  }
}

// ===== ЛОГИН =====
function doLogin() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value.trim();
  
  const account = PLAYER_ACCOUNTS[login];
  if (!account) {
    document.getElementById('loginError').textContent = 'Аккаунт не найден. Зарегистрируйтесь.';
    document.getElementById('loginError').style.color = '#f87171';
    return;
  }
  
  if (account.password !== pass) {
    document.getElementById('loginError').textContent = 'Неверный пароль';
    document.getElementById('loginError').style.color = '#f87171';
    return;
  }
  
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
  startEnergyRegen();
  initMap();
  renderCards();
  updateSummonCounters();
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
  
  // ПРОВЕРКА: есть ли Firebase?
  if (typeof db !== 'undefined') {
    db.ref('accounts/' + login).set(PLAYER_ACCOUNTS[login])
      .then(() => {
        console.log("✅ Успешно сохранено в Firebase!");
        document.getElementById('loginError').textContent = '✅ Аккаунт создан в облаке! Теперь войдите.';
        document.getElementById('loginError').style.color = '#34d399'; // Ярко-зелёный
      })
      .catch((error) => {
        console.error("Ошибка Firebase:", error);
        localStorage.setItem('remanga_accounts', JSON.stringify(PLAYER_ACCOUNTS));
        document.getElementById('loginError').textContent = '⚠️ Облако недоступно, сохранено локально.';
        document.getElementById('loginError').style.color = '#fbbf24'; // Жёлтый
      });
  } else {
    localStorage.setItem('remanga_accounts', JSON.stringify(PLAYER_ACCOUNTS));
    document.getElementById('loginError').textContent = '⚠️ Firebase не найден, сохранено локально.';
    document.getElementById('loginError').style.color = '#fbbf24'; // Жёлтый
  }
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
  if (menuOpen) menu.classList.add('show');
  else menu.classList.remove('show');
}

document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  const toggle = document.getElementById('userMenuToggle');
  if (menu && menuOpen && !menu.contains(e.target) && !toggle.contains(e.target)) {
    menuOpen = false;
    menu.classList.remove('show');
  }
});

// ===== АВТОМАТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ ЭНЕРГИИ =====
function startEnergyRegen() {
  setInterval(() => {
    if (state.currentLogin && state.energy < state.maxEnergy) {
      state.energy++;
      updateResources();
      saveGame();
    }
  }, 60000); // 1 минута
}
