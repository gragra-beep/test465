const CARDS_DATABASE = [
  { 
    id: 'card_001', 
    name: 'Хоши', 
    rarity: 'common', 
    stars: 1,
    baseStats: { atk: 520, def: 310, hp: 552 },
    skill: { name: 'Славянскиц зажим пальцем', desc: 'Бьет пальцем', stars: 3 },
    image: '/test465/cards/hoshi.png',
    tags: ['боевая'] 
  }, // ← ДОБАВЛЕНА ЗАПЯТАЯ
  { 
    id: 'card_002', 
    name: 'Ген', 
    rarity: 'rare', 
    stars: 2,
    baseStats: { atk: 280, def: 160, hp: 250 },
    skill: { name: 'Славчнский зажим хилом', desc: 'ресает хп', stars: 4 },
    image: '/test465/cards/gen.png', 
    tags: ['поддержка'] 
  },
  { 
    id: 'card_003', 
    name: 'КуроШиро', 
    rarity: 'rare', 
    stars: 2,
    baseStats: { atk: 190, def: 111, hp: 587 },
    skill: { name: 'Славянский зажим носом', desc: 'Бьет носом', stars: 4 },
    image: '/test465/cards/kuroshiro.png', 
    tags: ['боевая', 'бафф'] 
  },
  { 
    id: 'card_004', 
    name: 'Сора', 
    rarity: 'epic', 
    stars: 3,
    baseStats: { atk: 380, def: 220, hp: 290 },
    skill: { name: 'Бьет щекой', desc: 'Славянский зажим щекой', stars: 5 },
    image: '/test465/cards/sora.png', 
    tags: ['боевая', 'aoe'] 
  },
  { 
    id: 'card_005', 
    name: 'Аои', 
    rarity: 'rare', 
    stars: 2,
    baseStats: { atk: 210, def: 130, hp: 180 },
    skill: { name: 'Славянский зажим ресницей', desc: 'Бьет ресницей', stars: 3 },
    image: '/test465/cards/aoi.png', 
    tags: ['боевая', 'крит'] 
  },
  { 
    id: 'card_006', 
    name: 'Юкио', 
    rarity: 'rare', 
    stars: 2,
    baseStats: { atk: 175, def: 145, hp: 175 },
    skill: { name: 'Славянский защим ногой', desc: 'Обездвиживает противника ногой', stars: 3 },
    image: '/test465/cards/yukio.png', 
    tags: ['защита'] 
  },
  { 
    id: 'card_007', 
    name: 'Касуми', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 100, def: 70, hp: 110 },
    skill: { name: 'Славчнский захил', desc: 'Ресает хп', stars: 5 },
    image: '/test465/cards/kasumi.png', 
    tags: ['поддержка'] 
  },
  { 
    id: 'card_008', 
    name: 'Нана', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: 'Славчнский зажим кринжом', desc: 'Закринжовывает насмерть', stars: 5 },
    image: '/test465/cards/nana.png', 
    tags: ['убийца'] 
  },
  { 
    id: 'card_009', 
    name: 'Саки', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 90, def: 100, hp: 110 },
    skill: { name: 'Славянский зажим бровью', desc: 'Поигрывает бровями, доводя врагов до смерти', stars: 5 },
    image: '/test465/cards/saki.png', 
    tags: ['танк'] 
  },
    { 
    id: 'card_010', 
    name: 'Лихуа', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/lihua.png', 
    tags: ['убийца'] 
  },
  { 
    id: 'card_011', 
    name: 'Сюинь', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/suin.png', 
    tags: ['убийца'] 
  },
    { 
    id: 'card_012', 
    name: 'Хуан', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/huan.png', 
    tags: ['убийца'] 
  },
      { 
    id: 'card_013', 
    name: 'Шу', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/shy.png', 
    tags: ['убийца'] 
  },
        { 
    id: 'card_014', 
    name: 'Юань', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/uan.png', 
    tags: ['убийца'] 
  },
          { 
    id: 'card_015', 
    name: 'Юйшу', 
    rarity: 'rare', 
    stars: 1,
    baseStats: { atk: 80, def: 110, hp: 150 },
    skill: { name: '1', desc: '1', stars: 1 },
    image: '/test465/cards/uishy.png', 
    tags: ['убийца'] 
  }
];

function getCardById(cardId) {
  return CARDS_DATABASE.find(c => c.id === cardId);
}

function getCardsByRarity(rarity) {
  return CARDS_DATABASE.filter(c => c.rarity === rarity);
}
