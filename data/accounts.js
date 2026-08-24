// ===== ИНВЕНТАРИ ИГРОКОВ =====
// Каждая карта имеет: id карты, уровень заточки, статус (сломана/нет)

const PLAYER_ACCOUNTS = {
  'ooo': {  // логин игрока
    cards: [
      { cardId: 'card_001', level: 5, broken: true },   // Чок Хва +5 сломана
      { cardId: 'card_002', level: 3, broken: true },   // Хуа Чэн +3 сломана
      { cardId: 'card_003', level: 0, broken: false },  // Чхон Мён +0
      { cardId: 'card_005', level: 0, broken: false },  // Му Сан +0
      { cardId: 'card_006', level: 0, broken: false },  // Ли Со +0
    ],
    summons: 0,  // счётчик призывов для гаранта
    lastEpic: 0, // сколько призывов назад была эпическая
    lastLegendary: 0,
    lastMythic: 0
  }
};

// Функция получения инвентаря игрока
function getPlayerInventory(login) {
  return PLAYER_ACCOUNTS[login] || null;
}

// Функция добавления карты игроку
function addCardToPlayer(login, cardId, level = 0) {
  if (!PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login] = {
      cards: [],
      summons: 0,
      lastEpic: 0,
      lastLegendary: 0,
      lastMythic: 0
    };
  }
  PLAYER_ACCOUNTS[login].cards.push({
    cardId: cardId,
    level: level,
    broken: false
  });
}

// Функция удаления карты (распыление)
function removeCardFromPlayer(login, cardIndex) {
  if (PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login].cards.splice(cardIndex, 1);
  }
}
