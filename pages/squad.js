// ===== ОТРЯД =====

let currentSquadSlot = null;

// Суммарная БМ отряда (сумма БМ 5 карт)
function getSquadBM() {
  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory || !state.squad) return 0;
  let total = 0;
  state.squad.forEach(cardId => {
    if (!cardId) return;
    const invCard = inventory.cards.find(c => c.cardId === cardId);
    const base = getCardById(cardId);
    if (invCard && base) {
      const stats = invCard.baseStats || base.baseStats;
      total += stats.atk + stats.def + stats.hp;
    }
  });
  return total;
}

function updateSquadButton() {
  const el = document.getElementById('squadCount');
  if (!el) return;
  el.textContent = (state.squad || []).filter(Boolean).length;
}

// ===== ОТКРЫТИЕ ОТРЯДА =====
function openSquadModal() {
  renderSquadSlots();
  document.getElementById('squadModal').classList.add('show');
}

function closeSquadModal() {
  document.getElementById('squadModal').classList.remove('show');
}

function renderSquadSlots() {
  const container = document.getElementById('squadSlots');
  if (!container) return;
  container.innerHTML = '';
  
  const inventory = getPlayerInventory(state.currentLogin);
  if (!state.squad) state.squad = [];
  
  for (let i = 0; i < 5; i++) {
    const cardId = state.squad[i];
    const slot = document.createElement('div');
    slot.className = 'squad-slot';
    
    let filled = false;
    if (cardId && inventory) {
      const invCard = inventory.cards.find(c => c.cardId === cardId);
      const base = getCardById(cardId);
      if (invCard && base) {
        const stats = invCard.baseStats || base.baseStats;
        const power = stats.atk + stats.def + stats.hp;
        const imagePath = base.image.startsWith('/') ? base.image : '/test465/' + base.image;
        slot.innerHTML = `
          <div class="squad-card-img" style="background-image:url('${imagePath}'); background-size:cover; background-position:center;"></div>
          <div class="squad-card-stars">★${base.stars}</div>
          <div class="squad-card-level">+${invCard.level || 0}</div>
          <div class="squad-card-name">${base.name}</div>
          <div class="squad-card-power">БМ ${power}</div>
        `;
        filled = true;
      }
    }
    
    if (!filled) {
      slot.classList.add('empty');
      slot.innerHTML = `<div class="squad-empty-plus">+</div><div class="squad-empty-text">Слот ${i + 1}</div>`;
    }
    
    slot.onclick = () => openSquadPick(i);
    container.appendChild(slot);
  }
  
  const bmEl = document.getElementById('squadBM');
  if (bmEl) bmEl.textContent = getSquadBM();
}

function saveSquad() {
  // Синхронизируем state.squad с PLAYER_ACCOUNTS
  const inventory = getPlayerInventory(state.currentLogin);
  if (inventory) {
    inventory.squad = state.squad;
  }
  
  // Сохраняем в Firebase
  saveGame();
  
  // Обновляем UI
  updateSquadButton();
  showToast(`✅ Отряд сохранён! БМ: ${getSquadBM()}`);
}
// ===== ВЫБОР КАРТЫ В ОТРЯД =====
function openSquadPick(slotIndex) {
  currentSquadSlot = slotIndex;
  renderSquadPick();
  document.getElementById('squadPickModal').classList.add('show');
}

function closeSquadPickModal() {
  document.getElementById('squadPickModal').classList.remove('show');
}

function squadCardPower(c) {
  const s = c.baseStats || {};
  return (s.atk || 0) + (s.def || 0) + (s.hp || 0);
}

function renderSquadPick() {
  const grid = document.getElementById('squadPickGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory || !inventory.cards) return;
  
  const rarity = document.getElementById('squadFilterRarity').value;
  const rank = document.getElementById('squadFilterRank').value;
  const sort = document.getElementById('squadFilterSort').value;
  
  let cards = inventory.cards.map(inv => {
    const base = getCardById(inv.cardId);
    return base ? { ...base, ...inv } : null;
  }).filter(c => c !== null);
  
  if (rarity !== 'any') cards = cards.filter(c => c.rarity === rarity);
  if (rank !== 'any') cards = cards.filter(c => c.stars === parseInt(rank));
  
  if (sort === 'power') cards.sort((a, b) => squadCardPower(b) - squadCardPower(a));
  else if (sort === 'name') cards.sort((a, b) => a.name.localeCompare(b.name));
  else cards.sort((a, b) => b.stars - a.stars);
  
  cards.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card-item';
    const inSquad = (state.squad || []).includes(card.cardId);
    const imagePath = card.image.startsWith('/') ? card.image : '/test465/' + card.image;
    
    el.innerHTML = `
      <div class="card-img" style="background-image:url('${imagePath}'); background-size:cover; background-position:center; background-color:#2a1a3a;"></div>
      <div class="card-stars">★${card.stars}</div>
      <div class="card-level">+${card.level || 0}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-sub">${card.rarity.toUpperCase()}</div>
      <div class="card-power">сил. ${squadCardPower(card)}</div>
      ${inSquad ? '<div class="card-broken-stamp">В ОТРЯДЕ</div>' : ''}
    `;
    el.onclick = () => pickSquadCard(card.cardId);
    grid.appendChild(el);
  });
}

function pickSquadCard(cardId) {
  if (currentSquadSlot === null) return;
  if (!state.squad) state.squad = [];
  
  // Убираем карту из других слотов, если она там стоит
  for (let i = 0; i < state.squad.length; i++) {
    if (state.squad[i] === cardId) state.squad[i] = null;
  }
  
  state.squad[currentSquadSlot] = cardId;
  
  // Закрываем выбор и возвращаемся к отряду
  closeSquadPickModal();
  renderSquadSlots();
}

// Закрытие по клику на оверлей
document.addEventListener('DOMContentLoaded', () => {
  const sq = document.getElementById('squadModal');
  if (sq) sq.addEventListener('click', e => { if (e.target === sq) closeSquadModal(); });
  const pk = document.getElementById('squadPickModal');
  if (pk) pk.addEventListener('click', e => { if (e.target === pk) closeSquadPickModal(); });
});
