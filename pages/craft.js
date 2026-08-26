// ===== КРАФТ =====
let craftType = 'weapon';
let selectedCraftId = null;
let craftSlots = [null, null, null, null];

function openCraftPage(type) {
  craftType = type;
  selectedCraftId = null;
  craftSlots = [null, null, null, null];
  switchPage(type === 'weapon' ? 'smith' : 'alchemy');
  renderCraft();
}

function craftPrefix() { return craftType === 'weapon' ? 'sm' : 'al'; }

function itemImgPath(item) {
  if (!item || !item.image) return '';
  return item.image.startsWith('/') ? item.image : '/test465/' + item.image;
}

// ===== ГЛАВНЫЙ РЕНДЕР =====
function renderCraft() {
  const p = craftPrefix();

  // Квадратик выбора предмета
  const selImg = document.getElementById(p + 'SelectImg');
  const selName = document.getElementById(p + 'SelectName');
  const item = selectedCraftId ? getItemById(selectedCraftId) : null;
  if (item) {
    selImg.style.backgroundImage = `url('${itemImgPath(item)}')`;
    selName.textContent = item.name;
  } else {
    selImg.style.backgroundImage = '';
    selName.textContent = 'Выбрать предмет';
  }

  // Ячейки ингредиентов
  const slotsEl = document.getElementById(p + 'Slots');
  slotsEl.innerHTML = '';
  craftSlots.forEach((itemId, i) => {
    const slot = document.createElement('div');
    slot.className = 'craft-slot' + (itemId ? ' filled' : '');
    if (itemId) {
      const it = getItemById(itemId);
      slot.textContent = it ? it.icon : '?';
      slot.onclick = () => { craftSlots[i] = null; renderCraft(); };
    } else {
      slot.textContent = '+';
    }
    // Перетаскивание
    slot.ondragover = e => e.preventDefault();
    slot.ondrop = e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text');
      if (id) { placeIngredient(id, i); }
    };
    slotsEl.appendChild(slot);
  });

  // Рецепт
  const recEl = document.getElementById(p + 'Recipe');
  recEl.innerHTML = selectedCraftId ? recipeText(selectedCraftId) : '—';

  // Инвентарь под линией
  renderCraftInventory();
}

function recipeText(itemId) {
  const rec = getRecipe(itemId);
  const counts = {};
  rec.forEach(id => counts[id] = (counts[id] || 0) + 1);
  return Object.keys(counts).map(id => {
    const it = getItemById(id);
    return `${it ? it.icon : id} ×${counts[id]}`;
  }).join(' + ');
}

// ===== ИНВЕНТАРЬ ПОД ЛИНИЕЙ =====
function renderCraftInventory() {
  const grid = document.getElementById(craftPrefix() + 'Grid');
  if (!grid) return;
  grid.innerHTML = '';
  const inventory = getPlayerInventory(state.currentLogin);
  if (!inventory || !inventory.items) return;

  inventory.items.forEach(inv => {
    const it = getItemById(inv.itemId);
    if (!it) return;
    const slot = document.createElement('div');
    slot.className = 'inventory-slot';
    slot.draggable = true;
    slot.ondragstart = e => e.dataTransfer.setData('text', inv.itemId);
    const visual = it.image
      ? `<div class="item-img" style="background-image:url('${itemImgPath(it)}')"></div>`
      : `<div class="item-icon">${it.icon}</div>`;
    slot.innerHTML = `${visual}<div class="item-quantity">x${inv.quantity}</div>`;
    // Тап по предмету = положить в свободную ячейку (работает на телефоне)
    slot.onclick = () => addToCraftSlot(inv.itemId);
    grid.appendChild(slot);
  });
}

function placeIngredient(itemId, slotIndex) {
  const inventory = getPlayerInventory(state.currentLogin);
  const invItem = inventory && inventory.items.find(i => i.itemId === itemId);
  if (!invItem) return;
  const placed = craftSlots.filter(s => s === itemId).length;
  if (placed >= invItem.quantity) { showToast('Больше нет этого предмета', true); return; }
  craftSlots[slotIndex] = itemId;
  renderCraft();
}

function addToCraftSlot(itemId) {
  const free = craftSlots.indexOf(null);
  if (free === -1) { showToast('Нет свободных ячеек', true); return; }
  placeIngredient(itemId, free);
}

// ===== СПИСОК ВЫБОРА ПРЕДМЕТА =====
function openCraftList(type) {
  craftType = type;
  const grid = document.getElementById('craftListGrid');
  grid.innerHTML = '';
  CRAFT_ITEMS.filter(i => i.type === type).forEach(item => {
    const el = document.createElement('div');
    el.className = 'craft-list-item';
    el.innerHTML = `
      <div class="craft-list-img" style="background-image:url('${itemImgPath(item)}')"></div>
      <div class="craft-list-name">${item.name}</div>
    `;
    el.onclick = () => { selectedCraftId = item.itemId; closeCraftList(); renderCraft(); };
    grid.appendChild(el);
  });
  document.getElementById('craftListModal').classList.add('show');
}

function closeCraftList() {
  document.getElementById('craftListModal').classList.remove('show');
}

// ===== САМ КРАФТ =====
function tryCraft(type) {
  if (!selectedCraftId) { showToast('Сначала выбери предмет', true); return; }

  const rec = getRecipe(selectedCraftId).slice().sort();
  const placed = craftSlots.filter(Boolean).slice().sort();

  if (rec.length !== placed.length || rec.some((id, i) => id !== placed[i])) {
    showToast('❌ Нужно: ' + recipeText(selectedCraftId), true);
    return;
  }

  // Списываем ингредиенты
  const inventory = getPlayerInventory(state.currentLogin);
  placed.forEach(id => {
    const inv = inventory.items.find(i => i.itemId === id);
    if (inv) inv.quantity -= 1;
  });
  inventory.items = inventory.items.filter(i => i.quantity > 0);

  // Выдаём предмет
  addItemToPlayer(state.currentLogin, selectedCraftId, 1);
  const item = getItemById(selectedCraftId);

  craftSlots = [null, null, null, null];
  renderCraft();
  if (typeof renderInventory === 'function') renderInventory();
  saveGame();
  showToast(`✅ Скрафчено: ${item.name}!`);
}
