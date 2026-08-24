// ===== УТИЛИТЫ =====
function getMaxEnergy() {
  return 50 + state.completedLocs.length * 10;
}

function getHighestCompleted() {
  return state.completedLocs.length > 0 ? Math.max(...state.completedLocs) : 0;
}

function isLocationUnlocked(loc) {
  return loc.id <= getHighestCompleted() + 1;
}

// ===== LOGIN =====
function doLogin() {
  const login = document.getElementById('loginInput').value;
  const pass = document.getElementById('passwordInput').value;
  if (login === 'ooo' && pass === '1234') {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('topbar').style.display = 'flex';
    document.getElementById('navBar').style.display = 'flex';
    state.maxEnergy = getMaxEnergy();
    state.energy = state.maxEnergy;
    updateResources();
    initMap();
    renderCards();
  } else {
    document.getElementById('loginError').textContent = 'Неверный логин или пароль';
  }
}
document.getElementById('passwordInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginInput').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('passwordInput').focus(); });

// ===== NAV =====
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');
}

// ===== MAP =====
function initMap() {
  const container = document.getElementById('mapContainer');
  // Удаляем старые ноды (кроме фона, реки, гор, сквада)
  container.querySelectorAll('.location-node').forEach(n => n.remove());

  locations.forEach(loc => {
    const node = document.createElement('div');
    node.className = 'location-node';
    node.style.left = loc.x + '%';
    node.style.top = loc.y + '%';

    let iconClass, extra = '';
    const isCompleted = state.completedLocs.includes(loc.id);
    const isUnlocked = isLocationUnlocked(loc);

    if (isCompleted) {
      iconClass = 'completed';
      extra = '<div class="node-check">✓</div>';
    } else if (isUnlocked) {
      iconClass = 'available';
      if (loc.alert) extra = '<div class="node-alert">!</div>';
    } else {
      iconClass = 'locked';
      extra = '<div class="node-lock">🔒</div>';
    }

    node.innerHTML = `<div class="node-icon ${iconClass}">${loc.cn}${extra}</div><div class="node-num">${loc.id}</div>`;
    node.onclick = () => openLocModal(loc);
    container.appendChild(node);
  });
}

function openLocModal(loc) {
  state.currentLoc = loc;
  document.getElementById('locModalLabel').textContent = 'ЛОКАЦИЯ ' + loc.id;
  document.getElementById('locModalTitle').textContent = loc.name;
  document.getElementById('locModalDesc').textContent = loc.desc;
  document.getElementById('locBossName').textContent = loc.boss;
  document.getElementById('locBossAvatar').textContent = loc.bossIcon;
  document.getElementById('locModalBossImg').textContent = loc.bossIcon;
  document.getElementById('locVerdict').textContent = '«' + loc.verdict + '»';
  document.getElementById('locBarFill').style.width = loc.barPct + '%';
  document.getElementById('locRewardEnergy').textContent = '+' + loc.rewardEnergy;
  document.getElementById('locRewardSilver').textContent = '+' + loc.rewardSilver;
  document.getElementById('locCostEnergy').textContent = '-' + loc.energyCost;
  document.getElementById('locRepeatSilver').textContent = '+' + loc.rewardSilver;
  document.getElementById('locEnergyCost').textContent = loc.energyCost;
  document.getElementById('locModal').classList.add('show');
}
function closeLocModal() { document.getElementById('locModal').classList.remove('show'); }

function playAgain() {
  const loc = state.currentLoc;
  if (!loc) return;
  if (state.energy < loc.energyCost) {
    showToast('Недостаточно энергии!', true);
    return;
  }
  state.energy -= loc.energyCost;
  state.silver += loc.rewardSilver;

  // Добавляем локацию в пройденные (если ещё не там)
  if (!state.completedLocs.includes(loc.id)) {
    state.completedLocs.push(loc.id);
  }

  // Пересчитываем макс. энергию
  state.maxEnergy = getMaxEnergy();

  updateResources();
  initMap();
  closeLocModal();
  showToast(`Пройдено! -${loc.energyCost} энергии, +${loc.rewardSilver} серебра. Макс. энергии: ${state.maxEnergy}`);
}

// ===== CARDS =====
function renderCards() {
  const grid = document.getElementById('cardsGrid');
  const rank = document.getElementById('filterRank').value;
  const status = document.getElementById('filterStatus').value;
  const sort = document.getElementById('filterSort').value;
  let filtered = cards.filter(c => {
    if (rank !== 'any' && c.stars !== parseInt(rank)) return false;
    if (status === 'broken' && !c.broken) return false;
    if (status === 'normal' && c.broken) return false;
    return true;
  });
  if (sort === 'power') filtered.sort((a, b) => b.power - a.power);
  else if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  else filtered.sort((a, b) => b.stars - a.stars || b.power - a.power);

  grid.innerHTML = '';
  filtered.forEach(card => {
    const el = document.createElement('div');
    el.className = 'card-item' + (card.broken ? ' broken' : '');
    el.onclick = () => openCardModal(card);
    el.innerHTML = `
      <div class="card-img" style="background:${card.img};"></div>
      <div class="card-stars">★${card.stars}</div>
      <div class="card-level ${card.broken ? 'broken-lvl' : ''}">+${card.level}</div>
      ${card.broken ? '<div class="card-broken-stamp">СЛОМАНА</div>' : ''}
      <div class="card-name">${card.name}</div>
      <div class="card-sub">${card.rarity}</div>
      <div class="card-star-bottom">★</div>
      <div class="card-power">сил. ${card.power}</div>`;
    grid.appendChild(el);
  });
}
function filterCards() { renderCards(); }

function openCardModal(card) {
  state.currentCard = card;
  document.getElementById('cdPower').textContent = card.power;
  document.getElementById('cdPowerBonus').textContent = '+' + Math.floor(card.power * 0.2);
  document.getElementById('cdName').textContent = card.name;
  document.getElementById('cdStars').textContent = '★'.repeat(card.stars);
  document.getElementById('cdRarity').textContent = card.rarity.toUpperCase();
  document.getElementById('cdAtk').textContent = card.atk;
  document.getElementById('cdDef').textContent = card.def;
  document.getElementById('cdHp').textContent = card.hp;
  document.getElementById('cdSkillName').textContent = card.skill;
  document.getElementById('cdSkillDesc').textContent = card.skillDesc;
  document.getElementById('cdSkillStars').textContent = '★'.repeat(card.skillStars) + '☆'.repeat(5 - card.skillStars);
  document.getElementById('cdChance').textContent = 'Шанс: ' + card.chance + '%';
  document.getElementById('cdCurLevel').textContent = '+' + card.curLevel;
  document.getElementById('cdNextLevel').textContent = '+' + card.nextLevel;
  document.getElementById('cdUpAtk').textContent = '攻+' + card.upAtk;
  document.getElementById('cdUpDef').textContent = '守+' + card.upDef;
  document.getElementById('cdUpHp').textContent = '命+' + card.upHp;
  document.getElementById('cdPrice').textContent = card.price;
  document.getElementById('cdUpBtnLevel').textContent = card.nextLevel;
  document.getElementById('cardModal').classList.add('show');
}
function closeCardModal() { document.getElementById('cardModal').classList.remove('show'); }

function upgradeCard() {
  const card = state.currentCard;
  if (!card) return;
  if (card.broken) { showToast('Карта сломана!', true); return; }
  if (state.silver < card.price) { showToast('Недостаточно серебра!', true); return; }
  const roll = Math.random() * 100;
  if (roll < card.chance) {
    card.curLevel = card.nextLevel;
    card.nextLevel++;
    card.atk += card.upAtk; card.def += card.upDef; card.hp += card.upHp;
    card.power = card.atk + card.def + card.hp;
    state.silver -= card.price;
    updateResources(); openCardModal(card); renderCards();
    showToast(`Улучшение успешно! ${card.name} +${card.curLevel}`);
  } else {
    card.broken = true;
    state.silver -= card.price;
    updateResources(); closeCardModal(); renderCards();
    showToast(`${card.name} сломана при заточке!`, true);
  }
}
function rerollCard() {
  const card = state.currentCard;
  if (!card) return;
  if (state.gems < 1) { showToast('Недостаточно гемов!', true); return; }
  state.gems--;
  card.atk = Math.floor(card.atk * (0.8 + Math.random() * 0.4));
  card.def = Math.floor(card.def * (0.8 + Math.random() * 0.4));
  card.hp = Math.floor(card.hp * (0.8 + Math.random() * 0.4));
  card.power = card.atk + card.def + card.hp;
  updateResources(); openCardModal(card); renderCards();
  showToast('Статы перероллены! -1 гем');
}

// ===== RESOURCES =====
function updateResources() {
  document.getElementById('resEnergy').textContent = state.energy;
  document.getElementById('resMaxEnergy').textContent = state.maxEnergy;
  document.getElementById('resSilver').textContent = state.silver;
}

// ===== TOAST =====
function showToast(msg, isError) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.className = 'toast', 2500);
}

// Закрытие модалок по клику на оверлей
document.getElementById('locModal').addEventListener('click', e => {
  if (e.target === document.getElementById('locModal')) closeLocModal();
});
document.getElementById('cardModal').addEventListener('click', e => {
  if (e.target === document.getElementById('cardModal')) closeCardModal();
});
