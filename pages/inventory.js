// ===== ИНВЕНТАРЬ =====

// База предметов (можно расширять)
const ITEMS_DATABASE = {
  'herb': { id: 'herb', name: 'Трава', icon: '🌿', type: 'material', rarity: 1 },
  'potion': { id: 'potion', name: 'Зелье', icon: '🧪', type: 'consumable', rarity: 2 },
  'scroll': { id: 'scroll', name: 'Свиток', icon: '📜', type: 'special', rarity: 3 },
};

// Инвентарь игрока (хранится в PLAYER_ACCOUNTS)
function getPlayerItems(login) {
  if (!window.PLAYER_ACCOUNTS[login]) return [];
  return window.PLAYER_ACCOUNTS[login].items || [];
}

function addItemToPlayer(login, itemId, quantity = 1) {
  if (!window.PLAYER_ACCOUNTS[login]) return;
  if (!window.PLAYER_ACCOUNTS[login].items) {
    window.PLAYER_ACCOUNTS[login].items = [];
  }
  
  const items = window.PLAYER_ACCOUNTS[login].items;
  const existing = items.find(i => i.itemId === itemId);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ itemId, quantity });
  }
}

function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;
  
  const filterType = document.getElementById('invFilterType')?.value || 'all';
  const sortBy = document.getElementById('invSort')?.value || 'name';
  
  let items = getPlayerItems(state.currentLogin);
  
  // Фильтр по типу
  if (filterType !== 'all') {
    items = items.filter(inv => {
      const base = ITEMS_DATABASE[inv.itemId];
      return base && base.type === filterType;
    });
  }
  
  // Сортировка
  if (sortBy === 'name') {
    items.sort((a, b) => {
      const nameA = ITEMS_DATABASE[a.itemId]?.name || '';
      const nameB = ITEMS_DATABASE[b.itemId]?.name || '';
      return nameA.localeCompare(nameB);
    });
  } else if (sortBy === 'quantity') {
    items.sort((a, b) => b.quantity - a.quantity);
  } else if (sortBy === 'rarity') {
    items.sort((a, b) => {
      const rarA = ITEMS_DATABASE[a.itemId]?.rarity || 0;
      const rarB = ITEMS_DATABASE[b.itemId]?.rarity || 0;
      return rarB - rarA;
    });
  }
  
  // Рендер ячеек (минимум 12 слотов)
  grid.innerHTML = '';
  const totalSlots = Math.max(12, items.length);
  
  for (let i = 0; i < totalSlots; i++) {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    
    if (i < items.length) {
      const inv = items[i];
      const base = ITEMS_DATABASE[inv.itemId];
      if (base) {
        slot.classList.add('has-item');
        slot.innerHTML = `
          <div class="item-icon">${base.icon}</div>
          <div class="item-quantity">x${inv.quantity}</div>
        `;
        slot.onclick = () => showToast(`${base.name}: ${inv.quantity} шт.`);
      } else {
        slot.classList.add('empty');
      }
    } else {
      slot.classList.add('empty');
    }
    
    grid.appendChild(slot);
  }
}

// Инициализация при загрузке
if (typeof state !== 'undefined' && state.currentLogin) {
  renderInventory();
}
