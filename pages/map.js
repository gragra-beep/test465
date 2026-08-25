
// ===== КАРТА =====

function initMap() {
  const container = document.getElementById('mapContainer');
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

function closeLocModal() {
  document.getElementById('locModal').classList.remove('show');
}

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
  
  // ⭐ ВОССТАНАВЛИВАЕМ ЭНЕРГИЮ ДО МАКСИМУМА ПОСЛЕ ПРОХОЖДЕНИЯ
  state.energy = state.maxEnergy;

  updateResources();
  initMap();
  closeLocModal();
  showToast(`Пройдено! +${loc.rewardSilver} серебра. Энергия восстановлена! Макс: ${state.maxEnergy}`);
  
  saveGame();
}
