alert('deck.js загружен!');
// ===== КОЛОДА =====

function renderCards() {
  const grid = document.getElementById('cardsGrid');
  const rank = document.getElementById('filterRank').value;
  const status = document.getElementById('filterStatus').value;
  const sort = document.getElementById('filterSort').value;

  const inventory = PLAYER_ACCOUNTS[state.currentLogin];
  if (!inventory || !inventory.cards) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Нет карт</div>';
    return;
  }

  let playerCards = inventory.cards.map((invCard, originalIndex) => {
    const baseCard = getCardById(invCard.cardId);
    return baseCard ? { ...baseCard, ...invCard, originalIndex: originalIndex } : null;
  }).filter(c => c !== null);

  if (rank !== 'any') playerCards = playerCards.filter(c => c.stars === parseInt(rank));
  if (status === 'broken') playerCards = playerCards.filter(c => c.broken);
  else if (status === 'normal') playerCards = playerCards.filter(c => !c.broken);

  if (sort === 'power') {
    playerCards.sort((a, b) => {
      const pA = a.baseStats.atk + a.baseStats.def + a.baseStats.hp;
      const pB = b.baseStats.atk + b.baseStats.def + b.baseStats.hp;
      return pB - pA;
    });
  } else if (sort === 'name') {
    playerCards.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    playerCards.sort((a, b) => b.stars - a.stars);
  }

  grid.innerHTML = '';
  playerCards.forEach((card) => {
    const el = document.createElement('div');
    el.className = 'card-item' + (card.broken ? ' broken' : '');
    el.onclick = () => openCardModal(card, card.originalIndex);

    const power = card.baseStats.atk + card.baseStats.def + card.baseStats.hp;

    el.innerHTML = `
      <div class="card-img" style="background-image: url('${card.image}'); background-size: cover; background-position: center; background-color: #2a1a3a;"></div>
      <div class="card-stars">★${card.stars}</div>
      <div class="card-level ${card.broken ? 'broken-lvl' : ''}">+${card.level}</div>
      ${card.broken ? '<div class="card-broken-stamp">СЛОМАНА</div>' : ''}
      <div class="card-name">${card.name}</div>
      <div class="card-sub">${card.rarity.toUpperCase()}</div>
      <div class="card-star-bottom">★</div>
      <div class="card-power">сил. ${power}</div>
    `;
    grid.appendChild(el);
  });
}

function filterCards() { renderCards(); }

// ===== СИСТЕМА ЗАТОЧКИ =====

function getUpgradeChance(level) {
  if (level < 10) return 99;
  if (level < 20) return 95;
  if (level < 30) return 90;
  if (level < 40) return 85;
  if (level < 50) return 80;
  if (level < 60) return 60;
  if (level < 70) return 50;
  if (level < 80) return 30;
  if (level < 90) return 15;
  return 5;
}

function getUpgradeCost(level) {
  if (level < 10) return 5;
  if (level < 20) return 7;
  if (level < 30) return 9;
  if (level < 40) return 10;
  if (level < 50) return 15;
  if (level < 60) return 30;
  if (level < 70) return 40;
  if (level < 80) return 45;
  if (level < 90) return 50;
  return 55;
}

function getRollbackLevel(level) {
  if (level < 10) return 0;
  if (level < 20) return 10;
  if (level < 30) return 20;
  if (level < 40) return 30;
  if (level < 50) return 40;
  if (level < 60) return 50;
  if (level < 70) return 60;
  if (level < 80) return 70;
  if (level < 90) return 80;
  return 90;
}

function getUpgradeBonuses(card) {
  const atkBonus = Math.floor(card.baseStats.atk * 0.05);
  const defBonus = Math.floor(card.baseStats.def * 0.05);
  const hpBonus = Math.floor(card.baseStats.hp * 0.05);
  return { atk: atkBonus, def: defBonus, hp: hpBonus };
}

function openCardModal(card, index) {
  state.currentCard = card;
  state.currentCardIndex = index;
  
  const power = card.baseStats.atk + card.baseStats.def + card.baseStats.hp;

  document.getElementById('cdCardImage').style.backgroundImage = `url('${card.image}')`;
  document.getElementById('cdPower').textContent = power;
  document.getElementById('cdPowerBonus').textContent = '+' + Math.floor(power * 0.2);
  document.getElementById('cdName').textContent = card.name;
  document.getElementById('cdStars').textContent = '★'.repeat(card.stars);
  document.getElementById('cdRarityBadge').textContent = card.rarity.toUpperCase().substring(0, 1);
  document.getElementById('cdRankLetter').textContent = card.rarity.toUpperCase().substring(0, 1);

  document.getElementById('cdAtk').textContent = card.baseStats.atk;
  document.getElementById('cdDef').textContent = card.baseStats.def;
  document.getElementById('cdHp').textContent = card.baseStats.hp;

  document.getElementById('cdSkillName').textContent = card.skill.name;
  document.getElementById('cdSkillDesc').textContent = card.skill.desc;
  document.getElementById('cdSkillStars').textContent = '★'.repeat(card.skill.stars) + '☆'.repeat(5 - card.skill.stars);

  const chance = getUpgradeChance(card.level);
  const cost = getUpgradeCost(card.level);
  const bonuses = getUpgradeBonuses(card);
  const nextLevel = Math.min(card.level + 1, 100);

  document.getElementById('cdChance').textContent = 'Шанс: ' + chance + '%';
  document.getElementById('cdCurLevel').textContent = '+' + card.level;
  document.getElementById('cdNextLevel').textContent = '+' + nextLevel;
  document.getElementById('cdUpAtk').textContent = '+' + bonuses.atk;
  document.getElementById('cdUpDef').textContent = '+' + bonuses.def;
  document.getElementById('cdUpHp').textContent = '+' + bonuses.hp;
  document.getElementById('cdPrice').textContent = cost;
  document.getElementById('cdUpBtnLevel').textContent = nextLevel - card.level;

  const warningEl = document.getElementById('cdUpgradeWarning');
  if (card.level >= 100) {
    warningEl.textContent = 'Максимальный уровень достигнут';
    warningEl.style.color = '#888';
  } else {
    const rollback = getRollbackLevel(card.level);
    warningEl.textContent = 'При провале — откат до +' + rollback;
    warningEl.style.color = '#f87171';
  }

  document.getElementById('cardModal').classList.add('show');
}

function closeCardModal() {
  document.getElementById('cardModal').classList.remove('show');
}

function upgradeCard() {
  const index = state.currentCardIndex;
  const inventory = PLAYER_ACCOUNTS[state.currentLogin];
  
  if (!inventory || !inventory.cards || !inventory.cards[index]) {
    showToast('Ошибка: карта не найдена', true);
    return;
  }
  
  // Получаем карту из инвентаря (там только cardId, level, broken)
  const savedCard = inventory.cards[index];
  
  // Получаем полную карту из базы данных
  const fullCard = getCardById(savedCard.cardId);
  
  if (!fullCard) {
    showToast('Ошибка: карта не найдена в базе', true);
    return;
  }
  
  // Объединяем: берём level и broken из сохранения, остальное из базы
  const card = {
    ...fullCard,
    level: savedCard.level,
    broken: savedCard.broken,
    baseStats: { ...fullCard.baseStats } // Копируем статы чтобы не менять базу
  };
  
  if (card.level >= 100) {
    showToast('Максимальный уровень достигнут!', true);
    return;
  }

  const cost = getUpgradeCost(card.level);
  if (state.silver < cost) {
    showToast(`Недостаточно серебра! Нужно ${cost}`, true);
    return;
  }

  const chance = getUpgradeChance(card.level);
  const roll = Math.random() * 100;

  if (roll < chance) {
    // Успех
    savedCard.level++; // Меняем В savedCard (в инвентаре)
    const bonuses = getUpgradeBonuses(card);
    card.baseStats.atk += bonuses.atk;
    card.baseStats.def += bonuses.def;
    card.baseStats.hp += bonuses.hp;
    
    state.silver -= cost;
    updateResources();
    
    state.currentCard = card;
    openCardModal(card, index);
    renderCards();
    showToast(`Улучшение успешно! ${card.name} +${savedCard.level}`);
  } else {
    // Провал
    const rollback = getRollbackLevel(savedCard.level);
    savedCard.level = rollback; // Меняем В savedCard (в инвентаре)
    
    state.silver -= cost;
    updateResources();
    
    state.currentCard = card;
    openCardModal(card, index);
    renderCards();
    showToast(`Провал! ${card.name} откатилась до +${rollback}`, true);
  }
  
  saveGame();
}

function rerollCard() {
  showToast('Возвышение — скоро будет доступно');
      }
