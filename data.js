// ===== СОСТОЯНИЕ =====
const state = {
  energy: 90,
  maxEnergy: 90,
  silver: 1553,
  currentLoc: null,
  currentCard: null,
  completedLocs: [1, 2, 3],
};

// ===== ЛОКАЦИИ (energyCost = rewardSilver) =====
const locations = [
  { id: 1, name: 'Тропа Следов', cn: '迹', x: 12, y: 28, boss: 'Страж Тропы', bossIcon: '👤', desc: 'Древняя тропа, проложенная первыми мастерами мурим. Здесь начинающие воины учатся читать следы врагов.', energyCost: 3, rewardSilver: 3, rewardEnergy: 10, verdict: 'Лёгкая прогулка', barPct: 98 },
  { id: 2, name: 'Волчье ущелье', cn: '狼', x: 28, y: 38, boss: 'Король Серых Волков', bossIcon: '🐺', desc: 'Каменная теснина, где обитает зверь, вобравший внутреннюю силу павших мастеров. Здесь проверяют себя молодые воины мурим.', energyCost: 5, rewardSilver: 5, rewardEnergy: 10, verdict: 'Победа почти гарантирована', barPct: 95 },
  { id: 3, name: 'Скрытый храм', cn: '隐', x: 42, y: 30, boss: 'Теневой Монах', bossIcon: '🧘', desc: 'Заброшенный храм в горах, хранящий тайны древних техник. Монахи-отступники охраняют вход.', energyCost: 8, rewardSilver: 8, rewardEnergy: 10, verdict: 'Превосходство на вашей стороне', barPct: 88 },
  { id: 4, name: 'Храм Четырёх Ветров', cn: '寺', x: 62, y: 25, boss: 'Настоятель Ветра', bossIcon: '🌪️', desc: 'Древний храм на вершине горы. Четыре мастера ветра охраняют святыни предков.', energyCost: 12, rewardSilver: 12, rewardEnergy: 10, verdict: 'Бой будет непростым', barPct: 72, alert: true },
  { id: 5, name: 'Кровавый пруд', cn: '血', x: 52, y: 45, boss: 'Кровавый Дух', bossIcon: '', desc: 'Озеро, окрашенное кровью павших воинов. Духи жаждут мести.', energyCost: 15, rewardSilver: 15, rewardEnergy: 10, verdict: 'Опасно', barPct: 55 },
  { id: 6, name: 'Топь Забвения', cn: '沼', x: 38, y: 55, boss: 'Болотный Колосс', bossIcon: '🌿', desc: 'Гиблое место, где тонут даже опытные воины. Топь поглощает всё живое.', energyCost: 18, rewardSilver: 18, rewardEnergy: 10, verdict: 'Крайне опасно', barPct: 40 },
  { id: 7, name: 'Врата Дракона', cn: '关', x: 72, y: 38, boss: 'Страж Врат', bossIcon: '🐉', desc: 'Древние врата, за которыми скрыта сила драконьего клана.', energyCost: 20, rewardSilver: 20, rewardEnergy: 10, verdict: 'Очень опасно', barPct: 30 },
  { id: 8, name: 'Гробница Теней', cn: '墓', x: 22, y: 65, boss: 'Теневой Владыка', bossIcon: '💀', desc: 'Подземная гробница великого мастера. Его тень всё ещё охраняет покой.', energyCost: 25, rewardSilver: 25, rewardEnergy: 10, verdict: 'Смертельно', barPct: 20 },
  { id: 9, name: 'Логово Змея', cn: '蛇', x: 50, y: 70, boss: 'Древний Змей', bossIcon: '🐍', desc: 'Подводная пещера, где спит древний змей. Пробуждение принесёт катастрофу.', energyCost: 30, rewardSilver: 30, rewardEnergy: 10, verdict: 'Безумие', barPct: 15 },
  { id: 10, name: 'Нефритовый дворец', cn: '玉', x: 78, y: 55, boss: 'Нефритовый Император', bossIcon: '👑', desc: 'Вершина всех испытаний. Дворец великого императора мурим.', energyCost: 50, rewardSilver: 50, rewardEnergy: 10, verdict: 'Финал', barPct: 10 },
];

// ===== КАРТЫ =====
const cards = [
  { id: 1, name: 'Чок Хва', stars: 1, level: 5, power: 1382, broken: true, rarity: 'Обычная', atk: 520, def: 310, hp: 552, skill: 'Удар Тени', skillDesc: 'Наносит урон одному врагу.', skillStars: 3, chance: 0, price: 0, upAtk: 0, upDef: 0, upHp: 0, curLevel: 5, nextLevel: 6, img: 'linear-gradient(135deg, #2a1a2a, #1a1a2a)' },
  { id: 2, name: 'Хуа Чэн', stars: 2, level: 3, power: 690, broken: true, rarity: 'Редкая', atk: 280, def: 160, hp: 250, skill: 'Благословение Цветов', skillDesc: 'Восстанавливает HP всем союзникам.', skillStars: 4, chance: 0, price: 0, upAtk: 0, upDef: 0, upHp: 0, curLevel: 3, nextLevel: 4, img: 'linear-gradient(135deg, #1a2a2a, #2a1a3a)' },
  { id: 3, name: 'Чхон Мён', stars: 2, level: 0, power: 478, broken: false, rarity: 'Редкая', atk: 190, def: 111, hp: 587, skill: 'Ярость Багрового Зверя', skillDesc: 'Повышает ATK союзнику с наибольшей атакой на заданный процент.', skillStars: 4, chance: 95, price: 5, upAtk: 9, upDef: 5, upHp: 29, curLevel: 0, nextLevel: 1, img: 'linear-gradient(135deg, #e8d5f5, #c5b3e0)', flame: 700 },
  { id: 4, name: 'Хуа Чэн (Пробуждённый)', stars: 1, level: 10, power: 890, broken: false, rarity: 'Эпическая', atk: 380, def: 220, hp: 290, skill: 'Танец Бабочек', skillDesc: 'Наносит урон всем врагам и накладывает дебафф.', skillStars: 5, chance: 80, price: 10, upAtk: 15, upDef: 8, upHp: 35, curLevel: 10, nextLevel: 11, img: 'linear-gradient(135deg, #3a1a4a, #1a2a5a)' },
  { id: 5, name: 'Му Сан', stars: 2, level: 0, power: 520, broken: false, rarity: 'Редкая', atk: 210, def: 130, hp: 180, skill: 'Клинок Ветра', skillDesc: 'Быстрая атака с шансом критического удара.', skillStars: 3, chance: 90, price: 5, upAtk: 12, upDef: 6, upHp: 20, curLevel: 0, nextLevel: 1, img: 'linear-gradient(135deg, #4a3a2a, #3a2a1a)', flame: 500 },
  { id: 6, name: 'Ли Со', stars: 2, level: 0, power: 495, broken: false, rarity: 'Редкая', atk: 175, def: 145, hp: 175, skill: 'Щит Нефрита', skillDesc: 'Повышает защиту всем союзникам на 3 хода.', skillStars: 3, chance: 92, price: 5, upAtk: 7, upDef: 14, upHp: 22, curLevel: 0, nextLevel: 1, img: 'linear-gradient(135deg, #2a3a2a, #1a4a2a)', flame: 500 },
];
