// ===== ГЛОБАЛЬНОЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  currentUserId: null,
  energy: 50,
  maxEnergy: 50,
  silver: 100,
  currentLoc: null,
  currentCard: null,
  currentCardIndex: null,
  squad: [],
  completedLocs: [],
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

// ===== РЕГИСТРАЦИЯ =====
async function doRegister() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value;
  const errorEl = document.getElementById('loginError');

  if (!window.firebaseAPI) {
    errorEl.textContent = '❌ Firebase не загрузился! Обнови страницу';
    errorEl.style.color = '#f87171';
    return;
  }

  if (!login || !pass) {
    errorEl.textContent = 'Введите логин и пароль';
    errorEl.style.color = '#f87171';
    return;
  }
  if (pass.length < 6) {
    errorEl.textContent = 'Пароль должен быть не менее 6 символов';
    errorEl.style.color = '#f87171';
    return;
  }

  const email = login.includes('@') ? login : `${login}@remanga.game`;

  try {
    errorEl.textContent = 'Создание аккаунта...';
    errorEl.style.color = '#fbbf24';

    const userCredential = await window.firebaseAPI.createUserWithEmailAndPassword(
      window.firebaseAuth, email, pass
    );
    const user = userCredential.user;

    const starterCards = [
      { cardId: 'card_001', level: 0, broken: false },
      { cardId: 'card_002', level: 0, broken: false },
      { cardId: 'card_003', level: 0, broken: false },
      { cardId: 'card_005', level: 0, broken: false },
      { cardId: 'card_006', level: 0, broken: false }
    ];

    const starterItems = [
      { itemId: 'herb', quantity: 1 }
    ];

    await window.firebaseAPI.setDoc(
      window.firebaseAPI.doc(window.firebaseDb, "users", user.uid), 
      {
        login: login,
        email: email,
        energy: 50,
        maxEnergy: 50,
        silver: 100,
        completedLocs: [],
        bannerRolls: 0,
        lastEpicRoll: 0,
        lastLegendaryRoll: 0,
        lastMythicRoll: 0,
        squad: [],
        cards: starterCards,
        items: starterItems,
        createdAt: new Date().toISOString()
      }
    );

    errorEl.textContent = '✅ Аккаунт создан! Вход...';
    errorEl.style.color = '#4ade80';
    await loginSuccess(user, login);

  } catch (error) {
    console.error("❌ ОШИБКА РЕГИСТРАЦИИ:", error.code, error.message);
    if (error.code === 'auth/email-already-in-use') errorEl.textContent = '❌ Логин занят';
    else if (error.code === 'auth/weak-password') errorEl.textContent = '❌ Пароль < 6 символов';
    else errorEl.textContent = '❌ Ошибка: ' + error.message;
    errorEl.style.color = '#f87171';
  }
}

// ===== ВХОД =====
async function doLogin() {
  const login = document.getElementById('loginInput').value.trim();
  const pass = document.getElementById('passwordInput').value;
  const errorEl = document.getElementById('loginError');

  if (!window.firebaseAPI) {
    errorEl.textContent = '❌ Firebase не загрузился! Обнови страницу';
    errorEl.style.color = '#f87171';
    return;
  }

  if (!login || !pass) {
    errorEl.textContent = 'Введите логин и пароль';
    errorEl.style.color = '#f87171';
    return;
  }

  // Пробуем оба домена — чтобы входили и старые, и новые аккаунты
  const candidates = login.includes('@') ? [login] : [login + '@remanga.game'];

  errorEl.textContent = 'Вход...';
  errorEl.style.color = '#fbbf24';

  let userCredential = null;
  let lastError = null;

  for (const email of candidates) {
    try {
      userCredential = await window.firebaseAPI.signInWithEmailAndPassword(
        window.firebaseAuth, email, pass
      );
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (userCredential) {
    await loginSuccess(userCredential.user, login);
  } else {
    console.error("❌ ОШИБКА ВХОДА:", lastError && lastError.code, lastError && lastError.message);
    errorEl.textContent = '❌ Неверный логин или пароль';
    errorEl.style.color = '#f87171';
  }
}

// ===== УСПЕШНЫЙ ВХОД =====
async function loginSuccess(user, login) {
  state.currentLogin = login;
  state.currentUserId = user.uid;

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('navBar').style.display = 'flex';
  
  const usernameEl = document.getElementById('topbarUsername');
  if (usernameEl) usernameEl.textContent = login;

  await loadGame();

  state.maxEnergy = getMaxEnergy();
  if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;

  updateResources();
  if (typeof initMap === 'function') initMap();
  if (typeof renderCards === 'function') renderCards();
  if (typeof renderInventory === 'function') renderInventory();
  if (typeof updateSquadButton === 'function') updateSquadButton();
  if (typeof updateSummonCounters === 'function') updateSummonCounters();
}

// ===== ЗАГРУЗКА ИЗ FIREBASE =====
async function loadGame() {
  if (!state.currentUserId) {
    console.warn("⚠️ Нет currentUserId, загрузка невозможна");
    return;
  }

  try {
    const docRef = window.firebaseAPI.doc(window.firebaseDb, "users", state.currentUserId);
    const docSnap = await window.firebaseAPI.getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      state.energy = data.energy !== undefined ? data.energy : 50;
      state.maxEnergy = data.maxEnergy !== undefined ? data.maxEnergy : 50;
      state.silver = data.silver !== undefined ? data.silver : 100;
      state.completedLocs = data.completedLocs || [];
      state.bannerRolls = data.bannerRolls || 0;
      state.lastEpicRoll = data.lastEpicRoll || 0;
      state.lastLegendaryRoll = data.lastLegendaryRoll || 0;
      state.lastMythicRoll = data.lastMythicRoll || 0;
      state.squad = data.squad || [];

      if (!window.PLAYER_ACCOUNTS) window.PLAYER_ACCOUNTS = {};
      
      window.PLAYER_ACCOUNTS[state.currentLogin] = {
        cards: data.cards || [],
        items: data.items || [],
        energy: state.energy,
        silver: state.silver
      };
    } else {
      const starterCards = [
        { cardId: 'card_001', level: 0, broken: false },
        { cardId: 'card_002', level: 0, broken: false },
        { cardId: 'card_003', level: 0, broken: false },
        { cardId: 'card_005', level: 0, broken: false },
        { cardId: 'card_006', level: 0, broken: false }
      ];
      const starterItems = [{ itemId: 'herb', quantity: 1 }];
      
      if (!window.PLAYER_ACCOUNTS) window.PLAYER_ACCOUNTS = {};
      window.PLAYER_ACCOUNTS[state.currentLogin] = { 
        cards: starterCards, 
        items: starterItems, 
        energy: 50, 
        silver: 100 
      };
      
      try {
        await window.firebaseAPI.setDoc(docRef, {
          login: state.currentLogin,
          email: `${state.currentLogin}@miyy.game`,
          energy: 50,
          maxEnergy: 50,
          silver: 100,
          completedLocs: [],
          bannerRolls: 0,
          lastEpicRoll: 0,
          lastLegendaryRoll: 0,
          lastMythicRoll: 0,
          squad: [],
          cards: starterCards,
          items: starterItems,
          createdAt: new Date().toISOString()
        });
      } catch (createErr) {
        console.error("❌ Не удалось создать стартовый документ:", createErr);
      }
    }
  } catch (error) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА ЗАГРУЗКИ:", error);
    showToast("Ошибка загрузки данных", true);
  }
}

// ===== СОХРАНЕНИЕ В FIREBASE =====
async function saveGame() {
  if (!state.currentUserId) {
    console.warn("⚠️ Попытка сохранения без currentUserId");
    return;
  }

  try {
    const userRef = window.firebaseAPI.doc(window.firebaseDb, "users", state.currentUserId);
    
    const playerData = window.PLAYER_ACCOUNTS[state.currentLogin] || {};
    const cardsToSave = playerData.cards || [];
    const itemsToSave = playerData.items || [];

    await window.firebaseAPI.setDoc(userRef, {
      energy: state.energy,
      maxEnergy: state.maxEnergy,
      silver: state.silver,
      completedLocs: state.completedLocs,
      bannerRolls: state.bannerRolls,
      lastEpicRoll: state.lastEpicRoll,
      lastLegendaryRoll: state.lastLegendaryRoll,
      lastMythicRoll: state.lastMythicRoll,
      cards: cardsToSave,
      items: itemsToSave,
      squad: state.squad || [],
      lastSaved: new Date().toISOString()
    }, { merge: true });
    
    console.log("✅ Игра успешно сохранена в Firebase");
  } catch (error) {
    console.error("❌ ОШИБКА СОХРАНЕНИЯ:", error);
    if (error.code !== 'invalid-argument' && error.code !== 'permission-denied') {
      showToast("Ошибка сохранения: " + (error.message || error.code), true);
    }
  }
}

// ===== НАВИГАЦИЯ =====
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const targetPage = document.getElementById('page-' + page);
  if (targetPage) targetPage.classList.add('active');
  
  const targetNav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (targetNav) targetNav.classList.add('active');
}

// ===== ВЫПАДАЮЩЕЕ МЕНЮ =====
function toggleUserMenu() {
  const menu = document.getElementById('userDropdown');
  if (menu) menu.classList.toggle('show');
}

function doLogout() {
  state.currentLogin = null;
  state.currentUserId = null;
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('navBar').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('loginError').textContent = '';
}

// Закрытие меню при клике вне его
document.addEventListener('click', e => {
  if (!e.target.closest('.user-info')) {
    const menu = document.getElementById('userDropdown');
    if (menu) menu.classList.remove('show');
  }
});

// ===== РЕСУРСЫ =====
function updateResources() {
  const elEnergy = document.getElementById('resEnergy');
  const elMaxEnergy = document.getElementById('resMaxEnergy');
  const elSilver = document.getElementById('resSilver');
  if (elEnergy) elEnergy.textContent = state.energy;
  if (elMaxEnergy) elMaxEnergy.textContent = state.maxEnergy;
  if (elSilver) elSilver.textContent = state.silver;
}

// ===== TOAST =====
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { t.className = 'toast'; }, 2500);
}

// ===== ВОССТАНОВЛЕНИЕ ЭНЕРГИИ =====
const ENERGY_REGEN_RATE = 1;
const ENERGY_REGEN_INTERVAL = 300000; // 5 минут

function startEnergyRegen() {
  setInterval(() => {
    if (state.currentUserId && state.energy < state.maxEnergy) {
      state.energy = Math.min(state.energy + ENERGY_REGEN_RATE, state.maxEnergy);
      updateResources();
      saveGame();
    }
  }, ENERGY_REGEN_INTERVAL);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('passwordInput');
  const loginInput = document.getElementById('loginInput');
  
  if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  if (loginInput) loginInput.addEventListener('keydown', e => { if (e.key === 'Enter') passInput.focus(); });

  const locModal = document.getElementById('locModal');
  const cardModal = document.getElementById('cardModal');
  const bannerModal = document.getElementById('bannerModal');

  if (locModal) locModal.addEventListener('click', e => { if (e.target === locModal && typeof closeLocModal === 'function') closeLocModal(); });
  if (cardModal) cardModal.addEventListener('click', e => { if (e.target === cardModal && typeof closeCardModal === 'function') closeCardModal(); });
  if (bannerModal) bannerModal.addEventListener('click', e => { if (e.target === bannerModal && typeof closeBannerModal === 'function') closeBannerModal(); });

  startEnergyRegen();
});
