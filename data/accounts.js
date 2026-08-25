// ===== СТАРТОВЫЕ КАРТЫ ДЛЯ НОВЫХ АККАУНТОВ =====
const STARTER_CARDS = [
  { cardId: 'card_001', level: 0, broken: false },
  { cardId: 'card_002', level: 0, broken: false },
  { cardId: 'card_003', level: 0, broken: false },
  { cardId: 'card_005', level: 0, broken: false },
  { cardId: 'card_006', level: 0, broken: false }
];

// Глобальный объект для хранения данных текущего игрока в памяти
window.PLAYER_ACCOUNTS = {};

// Получить инвентарь текущего игрока
function getPlayerInventory(login) {
  return window.PLAYER_ACCOUNTS[login] || null;
}

// Добавить карту
function addCardToPlayer(login, cardId, level = 0) {
  if (!window.PLAYER_ACCOUNTS[login]) {
    window.PLAYER_ACCOUNTS[login] = { cards: [] };
  }
  window.PLAYER_ACCOUNTS[login].cards.push({ cardId, level, broken: false });
}

// Удалить карту по индексу
function removeCardFromPlayer(login, cardIndex) {
  if (window.PLAYER_ACCOUNTS[login]) {
    window.PLAYER_ACCOUNTS[login].cards.splice(cardIndex, 1);
  }
}
