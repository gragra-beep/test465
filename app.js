// ===== ГЛОБАЛЬНОЕ СОСТОЯНИЕ =====
const state = {
  currentLogin: null,
  currentUserId: null,  // UID пользователя из Firebase
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

  // Firebase требует email, поэтому добавляем фиктивный домен
  const email = login.includes('@') ? login : `${login}@remanga.game`;

  try {
    errorEl.textContent = 'Создание аккаунта...';
    errorEl.style.color = '#fbbf24';

    // 1. Создаём пользователя в Firebase Auth
    const userCredential = await window.firebaseAPI.createUserWithEmailAndPassword(
      window.firebaseAuth, 
      email, 
      pass
    );
    const user = userCredential.user;

    // 2. Создаём стартовые данные в Firestore
    const starterCards = [
      { cardId: 'card_001', level: 0, broken: false },
      { cardId: 'card_002', level: 0, broken: false },
      { cardId: 'card_003', level: 0, broken: false },
      { cardId: 'card_005', level: 0, broken: false },
      { cardId: 'card_006', level: 0, broken: false }
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
        createdAt: new Date().toISOString()
      }
    );

    errorEl.textContent = '✅ Аккаунт создан! Выполняется вход...';
    errorEl.style.color = '#4ade80';

    // 3. Автоматический вход
    await loginSuccess(user, login);

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    if (error.code === 'auth/email-already-in-use') {
      errorEl.textContent = '❌ Этот логин уже занят';
    } else if (error.code === 'auth/weak-password') {
      errorEl.textContent = '❌ Пароль слишком слабый';
    } else if (error.code === 'auth/invalid-email') {
      errorEl.textContent = '❌ Неверный формат логина';
    } else {
      errorEl.textContent = '❌ Ошибка: ' + error.message;
    }
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

  const email = login.includes('@') ? login : `${login}@remanga.game`;

  try {
    errorEl.textContent = 'Вход...';
    errorEl.style.color = '#fbbf24';

    const userCredential = await window.firebaseAPI.signInWithEmailAndPassword(
      window.firebaseAuth, 
      email, 
      pass
    );

    await loginSuccess(userCredential.user, login);

  } catch (error) {
    console.error("Ошибка входа:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorEl.textContent = '❌ Неверный логин или пароль';
    } else {
      errorEl.textContent = '❌ Ошибка: ' + error.message;
    }
    errorEl.style.color = '#f87171';
  }
}

// ===== ВНУТРЕННЯЯ ФУНКЦИЯ УСПЕШНОГО ВХОДА =====
async function loginSuccess(user, login) {
  state.currentLogin = login;
  state.currentUserId = user.uid;

  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('topbar').style.display = 'flex';
  document.getElementById('navBar').style.display = 'flex';
  document.getElementById('topbarUsername').textContent = login;

  await loadGame();

  state.maxEnergy = getMaxEnergy();
  if (state.energy > state.maxEnergy) state.energy = state.maxEnergy;

  updateResources();
  if (typeof initMap === 'function') initMap();
  if (typeof renderCards === 'function') renderCards();
  if (typeof updateSummonCounters === 'function') updateSummonCounters();
}

// ===== ЗАГРУЗКА ИЗ FIREBASE =====
async function loadGame() {
  if (!state.currentUserId) return;

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

      // Сохраняем карты в глобальный объект для совместимости
      if (!window.PLAYER_ACCOUNTS) window.PLAYER_ACCOUNTS = {};
      window.PLAYER_ACCOUNTS[state.currentLogin] = {
        cards: data.cards || [],
        energy: state.energy,
        silver: state.silver
      };

      console.log("✅ Данные загружены из Firebase");
    } else {
      console.log("⚠️ Документ не найден, используются дефолтные значения");
    }
  } catch (error) {
    console.error("Ошибка загрузки из Firebase:", error);
    showToast("Ошибка загрузки данных", true);
  }
}

// ===== СОХРАНЕНИЕ В FIREBASE =====
async function saveGame() {
  if (!state.currentUserId) return;

  try {
    const userRef = window.firebaseAPI.doc(window.firebaseDb, "users", state.currentUserId);
    const cardsToSave = window.PLAYER_ACCOUNTS[state.currentLogin]?.cards || [];

    await window.firebaseAPI.updateDoc(userRef, {
      energy: state.energy,
      maxEnergy: state.maxEnergy,
      silver: state.silver,
      completedLocs: state.completedLocs,
      bannerRolls: state.bannerRolls,
      lastEpicRoll: state.lastEpicRoll,
      lastLegendaryRoll: state.lastLegendaryRoll,
      lastMythicRoll: state.lastMythicRoll,
      cards: cardsToSave,
      lastSaved: new Date().toISOString()
    });

    console.log("💾 Игра сохранена в Firebase");
  } catch (error) {
    console.error("Ошибка сохранения в Firebase:", error);
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
  setTimeout(() => {
    t.className = 'toast';
  }, 2500);
}

// ===== ОБРАБОТЧИКИ КЛАВИАТУРЫ =====
document.addEventListener('DOMContentLoaded', () => {
  const passInput = document.getElementById('passwordInput');
  const loginInput = document.getElementById('loginInput');

  if (passInput) passInput.addEventListener('keydown', e => { 
    if (e.key === 'Enter') doLogin(); 
  });
  if (loginInput) loginInput.addEventListener('keydown', e => { 
    if (e.key === 'Enter') passInput.focus(); 
  });

  // Закрытие модалок по клику на оверлей
  const locModal = document.getElementById('locModal');
  const cardModal = document.getElementById('cardModal');
  const bannerModal = document.getElementById('bannerModal');

  if (locModal) {
    locModal.addEventListener('click', e => {
      if (e.target === locModal && typeof closeLocModal === 'function') closeLocModal();
    });
  }
  if (cardModal) {
    cardModal.addEventListener('click', e => {
      if (e.target === cardModal && typeof closeCardModal === 'function') closeCardModal();
    });
  }
  if (bannerModal) {
    bannerModal.addEventListener('click', e => {
      if (e.target === bannerModal && typeof closeBannerModal === 'function') closeBannerModal();
    });
  }
});
