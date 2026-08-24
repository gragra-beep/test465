const locations = [
  { id: 1, name: 'Тропа Следов', cn: '迹', x: 12, y: 28, boss: 'Страж Тропы', bossIcon: '👤', desc: 'Древняя тропа, проложенная первыми мастерами мурим.', energyCost: 3, rewardSilver: 3, rewardEnergy: 10, verdict: 'Лёгкая прогулка', barPct: 98 },
  { id: 2, name: 'Волчье ущелье', cn: '狼', x: 28, y: 38, boss: 'Король Серых Волков', bossIcon: '', desc: 'Каменная теснина, где обитает зверь.', energyCost: 5, rewardSilver: 5, rewardEnergy: 10, verdict: 'Победа почти гарантирована', barPct: 95 },
  { id: 3, name: 'Скрытый храм', cn: '隐', x: 42, y: 30, boss: 'Теневой Монах', bossIcon: '🧘', desc: 'Заброшенный храм в горах.', energyCost: 8, rewardSilver: 8, rewardEnergy: 10, verdict: 'Превосходство на вашей стороне', barPct: 88 },
  { id: 4, name: 'Храм Четырёх Ветров', cn: '寺', x: 62, y: 25, boss: 'Настоятель Ветра', bossIcon: '🌪️', desc: 'Древний храм на вершине горы.', energyCost: 12, rewardSilver: 12, rewardEnergy: 10, verdict: 'Бой будет непростым', barPct: 72, alert: true },
  { id: 5, name: 'Кровавый пруд', cn: '血', x: 52, y: 45, boss: 'Кровавый Дух', bossIcon: '🩸', desc: 'Озеро, окрашенное кровью павших воинов.', energyCost: 15, rewardSilver: 15, rewardEnergy: 10, verdict: 'Опасно', barPct: 55 },
  { id: 6, name: 'Топь Забвения', cn: '沼', x: 38, y: 55, boss: 'Болотный Колосс', bossIcon: '🌿', desc: 'Гиблое место.', energyCost: 18, rewardSilver: 18, rewardEnergy: 10, verdict: 'Крайне опасно', barPct: 40 },
  { id: 7, name: 'Врата Дракона', cn: '关', x: 72, y: 38, boss: 'Страж Врат', bossIcon: '', desc: 'Древние врата.', energyCost: 20, rewardSilver: 20, rewardEnergy: 10, verdict: 'Очень опасно', barPct: 30 },
  { id: 8, name: 'Гробница Теней', cn: '墓', x: 22, y: 65, boss: 'Теневой Владыка', bossIcon: '💀', desc: 'Подземная гробница.', energyCost: 25, rewardSilver: 25, rewardEnergy: 10, verdict: 'Смертельно', barPct: 20 },
  { id: 9, name: 'Логово Змея', cn: '蛇', x: 50, y: 70, boss: 'Древний Змей', bossIcon: '🐍', desc: 'Подводная пещера.', energyCost: 30, rewardSilver: 30, rewardEnergy: 10, verdict: 'Безумие', barPct: 15 },
  { id: 10, name: 'Нефритовый дворец', cn: '玉', x: 78, y: 55, boss: 'Нефритовый Император', bossIcon: '👑', desc: 'Финал.', energyCost: 50, rewardSilver: 50, rewardEnergy: 10, verdict: 'Финал', barPct: 10 }
];
