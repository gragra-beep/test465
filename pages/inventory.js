// ===== ИНВЕНТАРЬ =====

function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  if (!grid) return;
  
  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory || !inventory.items || inventory.items.length === 0) {
    grid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">Инвентарь пуст</div>';
    return;
  }
  
  const filterType = document.getElementById('invFilterType').value;
  const sortType = document.getElementById('invSort').value;
  
  // Получаем полные данные предметов
  let items = inventory.items.map(invItem => {
    const itemData = getItemById(invItem.itemId);
    return itemData ? { ...itemData, quantity: invItem.quantity } : null;
  }).filter(i => i !== null);
  
  // Фильтр по типу
  if (filterType !== 'all') {
    items = items.filter(i => i.type === filterType);
  }
  
  // Сортировка
  if (sortType === 'name') {
    items.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === 'quantity') {
    items.sort((a, b) => b.quantity - a.quantity);
  } else if (sortType === 'rarity') {
    const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
    items.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0));
  }
  
  // Рендер
  grid.innerHTML = '';
  items.forEach(item => {
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.onclick = () => showToast(`${item.icon} ${item.name}: ${item.desc}`);
    slot.innerHTML = `
      <div class="item-icon">${item.icon}</div>
      <div class="item-quantity">x${item.quantity}</div>
    `;
    grid.appendChild(slot);
  });
}
