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

  const email = login.includes('@') ? login : `${login}@miyy.game`;

  try {
    console.log("🔄 Начало регистрации...");
    errorEl.textContent = 'Создание аккаунта...';
    errorEl.style.color = '#fbbf24';

    const userCredential = await window.firebaseAPI.createUserWithEmailAndPassword(
      window.firebaseAuth, email, pass
    );
    const user = userCredential.user;
    console.log("✅ Пользователь создан в Auth, UID:", user.uid);

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
        cards: starterCards,
        items: starterItems,
        createdAt: new Date().toISOString()
      }
    );
    console.log("✅ Данные сохранены в Firestore!");

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

  if (!login || !pass) {
    errorEl.textContent = 'Введите логин и пароль';
    errorEl.style.color = '#f87171';
    return;
  }

  const email = login.includes('@') ? login : `${login}@miyy.game`;

  try {
    console.log("🔄 Попытка входа...");
    errorEl.textContent = 'Вход...';
    errorEl.style.color = '#fbbf24';

    const userCredential = await window.firebaseAPI.signInWithEmailAndPassword(
      window.firebaseAuth, email, pass
    );
    console.log("✅ Успешный вход, UID:", userCredential.user.uid);
    await loginSuccess(userCredential.user, login);

  } catch (error) {
    console.error("❌ ОШИБКА ВХОДА:", error.code, error.message);
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
    console.log("🔄 Загрузка данных из Firestore для UID:", state.currentUserId);
    const docRef = window.firebaseAPI.doc(window.firebaseDb, "users", state.currentUserId);
    const docSnap = await window.firebaseAPI.getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("✅ Данные успешно загружены:", data);
      
      state.energy = data.energy !== undefined ? data.energy : 50;
      state.maxEnergy = data.maxEnergy !== undefined ? data.maxEnergy : 50;
      state.silver = data.silver !== undefined ? data.silver : 100;
      state.completedLocs = data.completedLocs || [];
      state.bannerRolls = data.bannerRolls || 0;
      state.lastEpicRoll = data.lastEpicRoll || 0;
      state.lastLegendaryRoll = data.lastLegendaryRoll || 0;
      state.lastMythicRoll = data.lastMythicRoll || 0;
            state.squad = data.squad || [];

      // Инициализируем PLAYER_ACCOUNTS
      if (!window.PLAYER_ACCOUNTS) window.PLAYER_ACCOUNTS = {};
      
      window.PLAYER_ACCOUNTS[state.currentLogin] = {
        cards: data.cards || [],
        items: data.items || [],
        energy: state.energy,
        silver: state.silver
      };
      
      console.log("💾 PLAYER_ACCOUNTS инициализирован:", window.PLAYER_ACCOUNTS[state.currentLogin]);
    } else {
      console.warn("⚠️ Документ не найден в базе. Создаем новый со стартовыми данными.");
      
      // Стартовые данные
      const starterCards = [
        { cardId: 'card_001', level: 0, broken: false },
        { cardId: 'card_002', level: 0, broken: false },
        { cardId: 'card_003', level: 0, broken: false },
        { cardId: 'card_005', level: 0, broken: false },
        { cardId: 'card_006', level: 0, broken: false }
      ];
      const starterItems = [{ itemId: 'herb', quantity: 1 }];
      
      // Сохраняем стартовые данные в память
      if (!window.PLAYER_ACCOUNTS) window.PLAYER_ACCOUNTS = {};
      window.PLAYER_ACCOUNTS[state.currentLogin] = { 
        cards: starterCards, 
        items: starterItems, 
        energy: 50, 
        silver: 100 
      };
      
      // 🔥 ФИКС: Автоматически создаем документ в базе, чтобы saveGame() не падал
      try {
        await window.firebaseAPI.setDoc(docRef, {
          login: state.currentLogin,
          email: `${state.currentLogin}@remanga.game`,
          energy: 50,
          maxEnergy: 50,
          silver: 100,
          completedLocs: [],
          bannerRolls: 0,
          lastEpicRoll: 0,
          lastLegendaryRoll: 0,
          lastMythicRoll: 0,
          cards: starterCards,
          items: starterItems,
          createdAt: new Date().toISOString()
        });
        console.log("✅ Стартовый документ создан в базе");
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
    
    // Безопасно получаем данные
    const playerData = window.PLAYER_ACCOUNTS[state.currentLogin] || {};
    const cardsToSave = playerData.cards || [];
    const itemsToSave = playerData.items || [];

    console.log("💾 Сохранение данных:", {
      energy: state.energy,
      silver: state.silver,
      cardsCount: cardsToSave.length,
      itemsCount: itemsToSave.length
    });

    // 🔥 ФИКС: squad ВНУТРИ объекта setDoc
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
      squad: state.squad || [],        // ← ПРАВИЛЬНО: внутри объекта
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
});
// Добавь в конец файла app.js (перед последним закрывающим тегом)

// ===== СИСТЕМА ВОССТАНОВЛЕНИЯ ЭНЕРГИИ =====
const ENERGY_REGEN_RATE = 1;        // Сколько энергии восстанавливается
const ENERGY_REGEN_INTERVAL = 300000; // Интервал в миллисекундах (5 минут = 300000)

function startEnergyRegen() {
  setInterval(() => {
    if (state.currentUserId && state.energy < state.maxEnergy) {
      state.energy = Math.min(state.energy + ENERGY_REGEN_RATE, state.maxEnergy);
      updateResources();
      saveGame();
      console.log(`⚡ Энергия восстановлена: ${state.energy}/${state.maxEnergy}`);
    }
  }, ENERGY_REGEN_INTERVAL);
}

// Запускаем восстановление энергии при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  startEnergyRegen();
});
