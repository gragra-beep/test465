const CARDS_DATABASE = [
  { id: 'card_001', name: 'Чок Хва', rarity: 'common', stars: 1,
    baseStats: { atk: 520, def: 310, hp: 552 },
    skill: { name: 'Удар Тени', desc: 'Наносит урон одному врагу.', stars: 3 },
    image: './cards/hoshi.png', tags: ['боевая'] },
  { id: 'card_002', name: 'Хуа Чэн', rarity: 'rare', stars: 2,
    baseStats: { atk: 280, def: 160, hp: 250 },
    skill: { name: 'Благословение Цветов', desc: 'Восстанавливает HP всем союзникам.', stars: 4 },
    image: 'cards/hua_cheng.png', tags: ['поддержка'] },
  { id: 'card_003', name: 'Чхон Мён', rarity: 'rare', stars: 2,
    baseStats: { atk: 190, def: 111, hp: 587 },
    skill: { name: 'Ярость Багрового Зверя', desc: 'Повышает ATK союзнику с наибольшей атакой.', stars: 4 },
    image: 'cards/chon_myon.png', tags: ['боевая', 'бафф'] },
  { id: 'card_004', name: 'Хуа Чэн (Пробуждённый)', rarity: 'epic', stars: 3,
    baseStats: { atk: 380, def: 220, hp: 290 },
    skill: { name: 'Танец Бабочек', desc: 'Наносит урон всем врагам.', stars: 5 },
    image: 'cards/hua_cheng_awakened.png', tags: ['боевая', 'aoe'] },
  { id: 'card_005', name: 'Му Сан', rarity: 'rare', stars: 2,
    baseStats: { atk: 210, def: 130, hp: 180 },
    skill: { name: 'Клинок Ветра', desc: 'Быстрая атака с шансом крита.', stars: 3 },
    image: 'cards/mu_san.png', tags: ['боевая', 'крит'] },
  { id: 'card_006', name: 'Ли Со', rarity: 'rare', stars: 2,
    baseStats: { atk: 175, def: 145, hp: 175 },
    skill: { name: 'Щит Нефрита', desc: 'Повышает защиту всем союзникам на 3 хода.', stars: 3 },
    image: 'cards/li_so.png', tags: ['защита'] },
  { id: 'card_007', name: 'Аптекарь', rarity: 'legendary', stars: 4,
    baseStats: { atk: 320, def: 280, hp: 450 },
    skill: { name: 'Эликсир Жизни', desc: 'Восстанавливает 50% HP случайному союзнику.', stars: 5 },
    image: 'cards/apothecary.png', tags: ['поддержка'] },
  { id: 'card_008', name: 'Хяккимару', rarity: 'legendary', stars: 4,
    baseStats: { atk: 520, def: 180, hp: 320 },
    skill: { name: 'Тень Смерти', desc: 'Мгновенно убивает врага с HP < 30%.', stars: 5 },
    image: 'cards/hyakimaru.png', tags: ['убийца'] },
  { id: 'card_009', name: 'Со Джин', rarity: 'mythic', stars: 5,
    baseStats: { atk: 680, def: 320, hp: 580 },
    skill: { name: 'Пламя Бессмертия', desc: 'Воскрешает павшего союзника с 50% HP.', stars: 5 },
    image: 'cards/so_jin.png', tags: ['мифическая'] }
];

function getCardById(cardId) {
  return CARDS_DATABASE.find(c => c.id === cardId);
}

function getCardsByRarity(rarity) {
  return CARDS_DATABASE.filter(c => c.rarity === rarity);
}
