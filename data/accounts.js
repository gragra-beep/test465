const PLAYER_ACCOUNTS = {
  'ooo': {
    cards: [
      { cardId: 'card_001', level: 5, broken: true },
      { cardId: 'card_002', level: 3, broken: true },
      { cardId: 'card_003', level: 0, broken: false },
      { cardId: 'card_005', level: 0, broken: false },
      { cardId: 'card_006', level: 0, broken: false },
    ],
    summons: 0, lastEpic: 0, lastLegendary: 0, lastMythic: 0
  }
  
  'каза': {  // ← ДОБАВЬ ЭТО
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
};

function getPlayerInventory(login) {
  return PLAYER_ACCOUNTS[login] || null;
}

function addCardToPlayer(login, cardId, level = 0) {
  if (!PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login] = {
      cards: [], summons: 0, lastEpic: 0, lastLegendary: 0, lastMythic: 0
    };
  }
  PLAYER_ACCOUNTS[login].cards.push({ cardId, level, broken: false });
}

function removeCardFromPlayer(login, cardIndex) {
  if (PLAYER_ACCOUNTS[login]) {
    PLAYER_ACCOUNTS[login].cards.splice(cardIndex, 1);
  }
}
