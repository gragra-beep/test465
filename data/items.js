// ===== БАЗА ПРЕДМЕТОВ =====
const ITEMS_DATABASE = [
  { itemId: 'herb', name: 'Трава', icon: '🌿', type: 'material', rarity: 'common', desc: 'Обычная трава. Используется в зельях.' },
  { itemId: 'poop', name: 'Какашка', icon: '💩', type: 'material', rarity: 'common', desc: 'Ну... это какашка.' },
  { itemId: 'apple', name: 'Яблоко', icon: '🍎', type: 'consumable', rarity: 'common', desc: 'Сочное яблоко.' },
  { itemId: 'violet', name: 'Фиалка', icon: '🪻', type: 'material', rarity: 'rare', desc: 'Красивый фиолетовый цветок.' },
  { itemId: 'tulip', name: 'Тюльпан', icon: '🌷', type: 'material', rarity: 'rare', desc: 'Яркий красный тюльпан.' },
  { itemId: 'scroll', name: 'Свиток', icon: '📜', type: 'special', rarity: 'epic', desc: 'Древний свиток с тайными знаниями.' },
  { itemId: 'lotus', name: 'Лотос', icon: '🪷', type: 'material', rarity: 'rare', desc: 'Священный цветок лотоса.' },
  { itemId: 'leaf', name: 'Лист', icon: '🍂', type: 'material', rarity: 'common', desc: 'Опавший лист дерева.' },
  { itemId: 'rose', name: 'Увядшая роза', icon: '🥀', type: 'material', rarity: 'rare', desc: 'Роза, потерявшая свою красоту.' },
  { itemId: 'sakura', name: 'Сакура', icon: '🌸', type: 'material', rarity: 'rare', desc: 'Цветок вишневого дерева.' },
  { itemId: 'rosette', name: 'Золотая розетка', icon: '🏵️', type: 'special', rarity: 'legendary', desc: 'Легендарная награда чемпиона.' }
];

function getItemById(itemId) {
  return ITEMS_DATABASE.find(i => i.itemId === itemId);
}
