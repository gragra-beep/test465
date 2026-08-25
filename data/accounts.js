// ===== ИНВЕНТАРИ ИГРОКОВ =====

const PLAYER_ACCOUNTS = {
  'ooo': {
    password: '1234',
    cards: [
      { cardId: 'card_001', level: 5, broken: true },
      { cardId: 'card_002', level: 3, broken: true },
      { cardId: 'card_003', level: 0, broken: false },
      { cardId: 'card_005', level: 0, broken: false },
      { cardId: 'card_006', level: 0, broken: false },
    ],
    summons: 0, lastEpic: 0, lastLegendary: 0, lastMythic: 0
  }
};

// Стартовые карты для новых аккаунтов
const STARTER_CARDS = [
  { cardId: 'card_001', level: 0, broken: false },
  { cardId: 'card_002', level: 0, broken: false },
  { cardId: 'card_003', level: 0, broken: false },
  { cardId: 'card_005', level: 0, broken: false },
  { cardId: 'card_006', level: 0, broken: false }
];

// Стартовые пройденные локации (чтобы maxEnergy = 80)
const STARTER_COMPLETED_LOCS = [1, 2, 3];

// Создание нового аккаунта
function createAccount(login, password) {
  PLAYER_ACCOUNTS[login] = {
    password: password,
    cards: JSON.parse(JSON.stringify(STARTER_CARDS)), // глубокая копия
    summons: 0,
    lastEpic: 0,
    lastLegendary: 0,
    lastMythic: 0,
    completedLocs: [...STARTER_COMPLETED_LOCS],
    energy: 80,
    silver: 100
  };
}

// Получить инвентарь
function getPlayerInventory(login) {
  return PLAYER_ACCOUNTS[login] || null;
}

// Добавить карту
function addCardToPlayer(login, cardId, level = 0) {
  if (!PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login] = {
      password: '',
      cards: [],
      summons: 0, lastEpic: 0, lastLegendary: 0, lastMythic: 0
    };
  }
  PLAYER_ACCOUNTS[login].cards.push({ cardId, level, broken: false });
}

// Удалить карту
function removeCardFromPlayer(login, cardIndex) {
  if (PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login].cards.splice(cardIndex, 1);
  }
}
