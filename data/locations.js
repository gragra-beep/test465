// ===== ЛОКАЦИИ =====
const locations = [
  { 
    id: 1, name: '1', cn: '迹', x: 12, y: 28, boss: 'Страж Тропы', bossIcon: '🛡️', desc: 'Древняя тропа.', 
    energyCost: 3, rewardSilver: 3, rewardEnergy: 10, verdict: 'Лёгкая прогулка', barPct: 98,
    loot: [
      { itemId: 'herb', quantity: 1, chance: 100 }
    ]
  },
  { 
    id: 2, name: '2', cn: '狼', x: 28, y: 38, boss: 'Король Серых Волков', bossIcon: '🐺', desc: 'Каменная теснина.', 
    energyCost: 5, rewardSilver: 5, rewardEnergy: 10, verdict: 'Победа почти гарантирована', barPct: 95,
    loot: [
      { itemId: 'poop', quantity: 1, chance: 100 }
    ]
  },
  { 
    id: 3, name: '3', cn: '隐', x: 42, y: 30, boss: 'Теневой Монах', bossIcon: '🧘', desc: 'Заброшенный храм.', 
    energyCost: 8, rewardSilver: 8, rewardEnergy: 10, verdict: 'Превосходство на вашей стороне', barPct: 88,
    loot: [
      { itemId: 'apple', quantity: 1, chance: 100 }
    ]
  },
  { 
    id: 4, name: '4', cn: '寺', x: 62, y: 25, boss: 'Настоятель Ветра', bossIcon: '🌪️', desc: 'Древний храм.', 
    energyCost: 12, rewardSilver: 12, rewardEnergy: 10, verdict: 'Бой будет непростым', barPct: 72, alert: true,
    loot: [
      { itemId: 'violet', quantity: 1, chance: 100 }
    ]
  },
  { 
    id: 5, name: '5', cn: '血', x: 52, y: 45, boss: 'Кровавый Дух', bossIcon: '🩸', desc: 'Озеро крови.', 
    energyCost: 15, rewardSilver: 15, rewardEnergy: 10, verdict: 'Опасно', barPct: 55,
    loot: [
      { itemId: 'tulip', quantity: 1, chance: 100 }
    ]
  },
  { 
    id: 6, name: '6', cn: '沼', x: 38, y: 55, boss: 'Болотный Колосс', bossIcon: '🦠', desc: 'Гиблое место.', 
    energyCost: 18, rewardSilver: 18, rewardEnergy: 10, verdict: 'Крайне опасно', barPct: 40,
    loot: [
      { itemId: 'scroll', quantity: 1, chance: 20 }
    ]
  },
  { 
    id: 7, name: '7', cn: '关', x: 72, y: 38, boss: 'Страж Врат', bossIcon: '🐉', desc: 'Древние врата.', 
    energyCost: 20, rewardSilver: 20, rewardEnergy: 10, verdict: 'Очень опасно', barPct: 30,
    loot: [
      { itemId: 'lotus', quantity: 1, chance: 50 },
      { itemId: 'leaf', quantity: 1, chance: 40 }
    ]
  },
  { 
    id: 8, name: '8', cn: '墓', x: 22, y: 65, boss: 'Теневой Владыка', bossIcon: '💀', desc: 'Подземная гробница.', 
    energyCost: 25, rewardSilver: 25, rewardEnergy: 10, verdict: 'Смертельно', barPct: 20,
    loot: [
      { itemId: 'rose', quantity: 1, chance: 40 }
    ]
  },
  { 
    id: 9, name: '9', cn: '蛇', x: 50, y: 70, boss: 'Древний Змей', bossIcon: '🐍', desc: 'Подводная пещера.', 
    energyCost: 30, rewardSilver: 30, rewardEnergy: 10, verdict: 'Безумие', barPct: 15,
    loot: [
      { itemId: 'sakura', quantity: 1, chance: 40 }
    ]
  },
  { 
    id: 10, name: '10', cn: '玉', x: 78, y: 55, boss: 'Нефритовый Император', bossIcon: '👑', desc: 'Финал.', 
    energyCost: 50, rewardSilver: 50, rewardEnergy: 10, verdict: 'Финал', barPct: 10,
    loot: [
      { itemId: 'rosette', quantity: 1, chance: 10 }
    ]
  }
];
