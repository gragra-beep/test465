// ===== СТАРТОВЫЕ ДАННЫЕ =====

const STARTER_CARDS = [
  { cardId: 'card_001', level: 0, broken: false },
  { cardId: 'card_002', level: 0, broken: false },
  { cardId: 'card_003', level: 0, broken: false },
  { cardId: 'card_005', level: 0, broken: false },
  { cardId: 'card_006', level: 0, broken: false }
];

const STARTER_ITEMS = [
  { itemId: 'herb', quantity: 1 }
];

window.PLAYER_ACCOUNTS = {};

function createAccount(login, password) {
  window.PLAYER_ACCOUNTS[login] = {
    password: password,
    cards: JSON.parse(JSON.stringify(STARTER_CARDS)),
    items: JSON.parse(JSON.stringify(STARTER_ITEMS)),
    energy: 50,
    silver: 100,
    completedLocs: [],
    bannerRolls: 0,
    lastEpicRoll: 0,
    lastLegendaryRoll: 0,
    lastMythicRoll: 0
  };
}

function getPlayerInventory(login) {
  return window.PLAYER_ACCOUNTS[login] || null;
}

function addCardToPlayer(login, cardId, level = 0) {
  if (!window.PLAYER_ACCOUNTS[login]) {
    window.PLAYER_ACCOUNTS[login] = { cards: [], items: [] };
  }
  if (!window.PLAYER_ACCOUNTS[login].cards) {
    window.PLAYER_ACCOUNTS[login].cards = [];
  }
  window.PLAYER_ACCOUNTS[login].cards.push({ cardId, level, broken: false });
}

function removeCardFromPlayer(login, cardIndex) {
  if (window.PLAYER_ACCOUNTS[login] && window.PLAYER_ACCOUNTS[login].cards) {
    window.PLAYER_ACCOUNTS[login].cards.splice(cardIndex, 1);
  }
}

function addItemToPlayer(login, itemId, quantity = 1) {
  if (!window.PLAYER_ACCOUNTS[login]) {
    window.PLAYER_ACCOUNTS[login] = { cards: [], items: [] };
  }
  if (!window.PLAYER_ACCOUNTS[login].items) {
    window.PLAYER_ACCOUNTS[login].items = [];
  }

  const items = window.PLAYER_ACCOUNTS[login].items;
  const existingItem = items.find(i => i.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    items.push({ itemId, quantity });
  }
}
