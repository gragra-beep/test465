// ===== ПРЕДМЕТЫ КРАФТА =====
const CRAFT_ITEMS = [
  { itemId: 'weapon1', name: 'Меч новичка', icon: '🗡️', image: 'cards/weapon1.png', type: 'weapon', rarity: 'rare', desc: 'Простой меч из городской кузни.' },
  { itemId: 'weapon2', name: 'Лук охотника', icon: '🏹', image: 'cards/weapon2.png', type: 'weapon', rarity: 'rare', desc: 'Крепкий охотничий лук.' },
  { itemId: 'weapon3', name: 'Клинок мастера', icon: '⚔️', image: 'cards/weapon3.png', type: 'weapon', rarity: 'epic', desc: 'Клинок работы мастера.' },
  { itemId: 'potion1', name: 'Зелье лечения', icon: '🍯', image: 'cards/potion1.png', type: 'potion', rarity: 'rare', desc: 'Заживляет раны.' },
  { itemId: 'potion2', name: 'Зелье силы', icon: '🫙', image: 'cards/potion2.png', type: 'potion', rarity: 'rare', desc: 'Даёт силу в бою.' },
  { itemId: 'potion3', name: 'Зелье энергии', icon: '🏺', image: 'cards/potion3.png', type: 'potion', rarity: 'epic', desc: 'Восстанавливает энергию.' }
];

// Добавляем в общую базу предметов (чтобы лежали в инвентаре после крафта)
CRAFT_ITEMS.forEach(i => ITEMS_DATABASE.push(i));

// ===== РЕЦЕПТЫ =====
// Каждый ингредиент = 1 ячейка. Порядок не важен.
const RECIPES = {
  weapon1: ['leaf', 'leaf', 'herb'],
  weapon2: ['leaf', 'leaf', 'tulip'],
  weapon3: ['leaf', 'leaf', 'scroll'],
  potion1: ['herb', 'herb', 'apple'],
  potion2: ['herb', 'herb', 'violet'],
  potion3: ['herb', 'herb', 'lotus']
};

function getRecipe(itemId) {
  return RECIPES[itemId] || [];
}
