// ===== ЛОКАЦИИ =====
// requiredBM — необходимая боевая мощь отряда для победы
// difficulty — текст сложности, barColor — цвет полоски, bossImage — картинка босса

const locations = [
  { 
    id: 1, name: '1', x: 12, y: 28, boss: 'Страж Тропы', bossImage: 'cards/boss_1.png',
    desc: 'Древняя тропа.', energyCost: 3, rewardSilver: 3, rewardEnergy: 10,
    requiredBM: 1250, difficulty: 'Очень легко', barColor: '#4ade80', barPct: 98,
    loot: [{ itemId: 'herb', quantity: 1, chance: 100 }]
  },
  { 
    id: 2, name: '2', x: 28, y: 38, boss: 'Король Серых Волков', bossImage: 'cards/boss_2.png',
    desc: 'Каменная теснина.', energyCost: 5, rewardSilver: 5, rewardEnergy: 10,
    requiredBM: 2500, difficulty: 'Легко', barColor: '#4ade80', barPct: 95,
    loot: [{ itemId: 'poop', quantity: 1, chance: 100 }]
  },
  { 
    id: 3, name: '3', x: 42, y: 30, boss: 'Теневой Монах', bossImage: 'cards/boss_3.png',
    desc: 'Заброшенный храм.', energyCost: 8, rewardSilver: 8, rewardEnergy: 10,
    requiredBM: 3000, difficulty: 'Умеренно', barColor: '#a3e635', barPct: 88,
    loot: [{ itemId: 'apple', quantity: 1, chance: 100 }]
  },
  { 
    id: 4, name: '4', x: 62, y: 25, boss: 'Настоятель Ветра', bossImage: 'cards/boss_4.png',
    desc: 'Древний храм.', energyCost: 12, rewardSilver: 12, rewardEnergy: 10,
    requiredBM: 4000, difficulty: 'Средне', barColor: '#facc15', barPct: 72, alert: true,
    loot: [{ itemId: 'violet', quantity: 1, chance: 100 }]
  },
  { 
    id: 5, name: '5', x: 52, y: 45, boss: 'Кровавый Дух', bossImage: 'cards/boss_5.png',
    desc: 'Озеро крови.', energyCost: 15, rewardSilver: 15, rewardEnergy: 10,
    requiredBM: 5000, difficulty: 'Сложно', barColor: '#fbbf24', barPct: 55,
    loot: [{ itemId: 'tulip', quantity: 1, chance: 100 }]
  },
  { 
    id: 6, name: '6', x: 38, y: 55, boss: 'Болотный Колосс', bossImage: 'cards/boss_6.png',
    desc: 'Гиблое место.', energyCost: 18, rewardSilver: 18, rewardEnergy: 10,
    requiredBM: 6000, difficulty: 'Очень сложно', barColor: '#fb923c', barPct: 40,
    loot: [{ itemId: 'scroll', quantity: 1, chance: 20 }]
  },
  { 
    id: 7, name: '7', x: 72, y: 38, boss: 'Страж Врат', bossImage: 'cards/boss_7.png',
    desc: 'Древние врата.', energyCost: 20, rewardSilver: 20, rewardEnergy: 10,
    requiredBM: 8000, difficulty: 'Экстремально', barColor: '#f97316', barPct: 30,
    loot: [
      { itemId: 'lotus', quantity: 1, chance: 50 },
      { itemId: 'leaf', quantity: 1, chance: 40 }
    ]
  },
  { 
    id: 8, name: '8', x: 22, y: 65, boss: 'Теневой Владыка', bossImage: 'cards/boss_8.png',
    desc: 'Подземная гробница.', energyCost: 25, rewardSilver: 25, rewardEnergy: 10,
    requiredBM: 90000, difficulty: 'Смертельно', barColor: '#f87171', barPct: 20,
    loot: [{ itemId: 'rose', quantity: 1, chance: 40 }]
  },
  { 
    id: 9, name: '9', x: 50, y: 70, boss: 'Древний Змей', bossImage: 'cards/boss_9.png',
    desc: 'Подводная пещера.', energyCost: 30, rewardSilver: 30, rewardEnergy: 10,
    requiredBM: 100000, difficulty: 'Безумие', barColor: '#ef4444', barPct: 15,
    loot: [{ itemId: 'sakura', quantity: 1, chance: 40 }]
  },
  { 
    id: 10, name: '10', x: 78, y: 55, boss: 'Нефритовый Император', bossImage: 'cards/boss_10.png',
    desc: 'Финал.', energyCost: 50, rewardSilver: 50, rewardEnergy: 10,
    requiredBM: 110000, difficulty: 'Невозможно', barColor: '#dc2626', barPct: 10,
    loot: [{ itemId: 'rosette', quantity: 1, chance: 10 }]
  }
];
