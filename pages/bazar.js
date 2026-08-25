// ===== БАЗАР =====

function showBannerDetails() {
  const pool = document.getElementById('cardsPool');
  if (!pool) return;
  
  pool.innerHTML = '';

  CARDS_DATABASE.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'pool-card';
    
    // Безопасный путь к картинке
    const imagePath = card.image.startsWith('/') ? card.image : '/test465/' + card.image;
    
    cardEl.innerHTML = `
      <div class="card-tag">БОЕВАЯ</div>
      <div class="pool-card-img" style="background-image: url('${imagePath}');"></div>
      <div style="position:absolute; bottom:6px; left:6px; right:6px; font-size:10px; font-weight:600; text-shadow: 0 1px 3px rgba(0,0,0,0.9); text-align: center;">${card.name}</div>
    `;
    pool.appendChild(cardEl);
  });

  document.getElementById('bannerModal').classList.add('show');
}

function closeBannerModal() {
  document.getElementById('bannerModal').classList.remove('show');
}

function getRarityColor(rarity) {
  const colors = {
    common: '#6b7280, #374151',
    rare: '#34d399, #059669',
    epic: '#a78bfa, #7c3aed',
    legendary: '#fb923c, #ea580c',
    mythic: '#c084fc, #9333ea'
  };
  return colors[rarity] || colors.common;
}

function summon(count) {
  const cost = count * 40;
  if (state.silver < cost) {
    showToast(`Недостаточно серебра! Нужно ${cost}`, true);
    return;
  }

  state.silver -= cost;
  state.bannerRolls += count;

  const newCards = [];
  for (let i = 0; i < count; i++) {
    const card = rollCard();
    newCards.push(card);
    addCardToPlayer(state.currentLogin, card.id);
  }

  updateResources();
  updateSummonCounters();

  const cardsNames = newCards.map(c => c.name).join(', ');
  showToast(`Призвано: ${cardsNames}`);

  if (document.getElementById('autoDustCheck')?.checked) {
    autoDustDuplicates();
  }
  
  // 🔥 ФИКС: Обновляем колоду после призыва, чтобы новые карты сразу отображались
  if (typeof renderCards === 'function') renderCards();
  
  saveGame();
}

function rollCard() {
  const rand = Math.random() * 100;
  let rarity;

  // Проверка жесткого гаранта на эпическую карту
  if (state.bannerRolls - state.lastEpicRoll >= 20) {
    rarity = 'epic';
  } else if (rand < 2) {
    rarity = 'mythic';
  } else if (rand < 8) {
    rarity = 'legendary';
  } else if (rand < 25) {
    rarity = 'epic';
  } else if (rand < 60) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }

  const cardsOfRarity = getCardsByRarity(rarity);
  const card = cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];

  // Обновляем счетчики гарантов при выпадении
  if (rarity === 'epic') state.lastEpicRoll = state.bannerRolls;
  if (rarity === 'legendary') state.lastLegendaryRoll = state.bannerRolls;
  if (rarity === 'mythic') state.lastMythicRoll = state.bannerRolls;

  return card;
}

function updateSummonCounters() {
  const epicLeft = 20 - (state.bannerRolls - state.lastEpicRoll);
  const el = document.getElementById('epicCounter');
  if (el) el.textContent = Math.max(0, epicLeft);
}

function autoDustDuplicates() {
  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory) return;

  const seen = new Set();
  for (let i = inventory.cards.length - 1; i >= 0; i--) {
    const cardId = inventory.cards[i].cardId;
    if (seen.has(cardId)) {
      removeCardFromPlayer(state.currentLogin, i);
    } else {
      seen.add(cardId);
    }
  }
  showToast('Дубликаты распылены');
  saveGame();
}
