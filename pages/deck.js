// ===== КОЛОДА =====

function renderCards() {
  const grid = document.getElementById('cardsGrid');
  const rank = document.getElementById('filterRank').value;
  const status = document.getElementById('filterStatus').value;
  const sort = document.getElementById('filterSort').value;

  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">Нет карт</div>';
    return;
  }

  let playerCards = inventory.cards.map(invCard => {
    const baseCard = getCardById(invCard.cardId);
    return baseCard ? { ...baseCard, ...invCard } : null;
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
  playerCards.forEach((card, index) => {
    const el = document.createElement('div');
    el.className = 'card-item' + (card.broken ? ' broken' : '');
    el.onclick = () => openCardModal(card, index);

    const power = card.baseStats.atk + card.baseStats.def + card.baseStats.hp;

    el.innerHTML = `
      <div class="card-img" style="background: linear-gradient(135deg, #2a1a3a, #1a2a3a);"></div>
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

function openCardModal(card, index) {
  state.currentCard = card;
  state.currentCardIndex = index;
  const power = card.baseStats.atk + card.baseStats.def + card.baseStats.hp;

  document.getElementById('cdPower').textContent = power;
  document.getElementById('cdPowerBonus').textContent = '+' + Math.floor(power * 0.2);
  document.getElementById('cdName').textContent = card.name;
  document.getElementById('cdStars').textContent = '★'.repeat(card.stars);
  document.getElementById('cdRarity').textContent = card.rarity.toUpperCase();
  document.getElementById('cdAtk').textContent = card.baseStats.atk;
  document.getElementById('cdDef').textContent = card.baseStats.def;
  document.getElementById('cdHp').textContent = card.baseStats.hp;
  document.getElementById('cdSkillName').textContent = card.skill.name;
  document.getElementById('cdSkillDesc').textContent = card.skill.desc;
  document.getElementById('cdSkillStars').textContent = '★'.repeat(card.skill.stars) + '☆'.repeat(5 - card.skill.stars);
  document.getElementById('cdChance').textContent = 'Шанс: 95%';
  document.getElementById('cdCurLevel').textContent = '+' + card.level;
  document.getElementById('cdNextLevel').textContent = '+' + (card.level + 1);
  document.getElementById('cdUpAtk').textContent = '攻+' + Math.floor(card.baseStats.atk * 0.05);
  document.getElementById('cdUpDef').textContent = '守+' + Math.floor(card.baseStats.def * 0.05);
  document.getElementById('cdUpHp').textContent = '命+' + Math.floor(card.baseStats.hp * 0.05);
  document.getElementById('cdPrice').textContent = 5;
  document.getElementById('cdUpBtnLevel').textContent = card.level + 1;
  document.getElementById('cardModal').classList.add('show');
}

function closeCardModal() {
  document.getElementById('cardModal').classList.remove('show');
}

function upgradeCard() {
  const card = state.currentCard;
  if (!card) return;
  if (card.broken) { showToast('Карта сломана!', true); return; }
  if (state.silver < 5) { showToast('Недостаточно серебра!', true); return; }

  const roll = Math.random() * 100;
  if (roll < 95) {
    card.level++;
    card.baseStats.atk += Math.floor(card.baseStats.atk * 0.05);
    card.baseStats.def += Math.floor(card.baseStats.def * 0.05);
    card.baseStats.hp += Math.floor(card.baseStats.hp * 0.05);
    state.silver -= 5;
    updateResources();
    openCardModal(card, state.currentCardIndex);
    renderCards();
    showToast(`Улучшение успешно! ${card.name} +${card.level}`);
  } else {
    card.broken = true;
    state.silver -= 5;
    updateResources();
    closeCardModal();
    renderCards();
    showToast(`${card.name} сломана при заточке!`, true);
  }
}

function rerollCard() {
  const card = state.currentCard;
  if (!card) return;
  showToast('Нужны гемы (пока не реализовано)');
}
