// ===== КАРТА =====

function initMap() {
  const container = document.getElementById('mapContainer');
  if (!container) return;

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
  
  // 🔥 ПОКАЗЫВАЕМ ИНФОРМАЦИЮ О ДРОПЕ
  showLootInfo(loc);
  
  document.getElementById('locModal').classList.add('show');
}

// ===== ПОКАЗАТЬ ИНФОРМАЦИЮ О ДРОПЕ В МОДАЛКЕ =====
function showLootInfo(loc) {
  // Удаляем старый блок если он есть
  const oldBlock = document.getElementById('lootInfoBlock');
  if (oldBlock) oldBlock.remove();
  
  if (!loc.loot || loc.loot.length === 0) return;
  
  // Создаём новый блок
  const lootBlock = document.createElement('div');
  lootBlock.id = 'lootInfoBlock';
  lootBlock.innerHTML = `
    <div class="modal-section-title">ВОЗМОЖНЫЙ ДРОП 🎁</div>
    <div class="rewards-section">
      ${loc.loot.map(drop => {
        const item = getItemById(drop.itemId);
        if (!item) return '';
        const chanceColor = drop.chance >= 100 ? '#4ade80' : drop.chance >= 50 ? '#fbbf24' : '#f87171';
        return `
          <div class="reward-row">
            <span style="font-size: 24px; margin-right: 8px;">${item.icon}</span>
            <span class="rw-label" style="flex: 1;">${item.name} x${drop.quantity}</span>
            <span style="color: ${chanceColor}; font-weight: bold;">${drop.chance}%</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
  
  // Вставляем блок перед кнопкой "ПРОЙТИ СНОВА"
  const modalBody = document.querySelector('#locModal .modal-body');
  const playBtn = document.querySelector('#locModal .play-again-btn');
  if (modalBody && playBtn) {
    modalBody.insertBefore(lootBlock, playBtn);
  }
}

function closeLocModal() {
  document.getElementById('locModal').classList.remove('show');
}

// ===== ФУНКЦИЯ ДРОПА ПРЕДМЕТОВ =====
function rollLoot(loc) {
  if (!loc.loot || loc.loot.length === 0) return [];
  
  const droppedItems = [];
  
  for (const drop of loc.loot) {
    const roll = Math.random() * 100;
    if (roll < drop.chance) {
      droppedItems.push({ itemId: drop.itemId, quantity: drop.quantity });
    }
  }
  
  return droppedItems;
}

function playAgain() {
  const loc = state.currentLoc;
  if (!loc) {
    showToast('❌ Ошибка: локация не найдена', true);
    return;
  }
  
  if (state.energy < loc.energyCost) {
    showToast(`❌ Не хватает энергии! Нужно: ${loc.energyCost}`, true);
    return;
  }
  
  // Тратим энергию
  state.energy -= loc.energyCost;
  
  // Начисляем серебро
  state.silver += loc.rewardSilver;

  // Проверяем — первый ли раз проходим
  const isFirstTime = !state.completedLocs.includes(loc.id);
  
  if (isFirstTime) {
    // ПЕРВЫЙ РАЗ
    state.completedLocs.push(loc.id);
    state.maxEnergy = getMaxEnergy();
    state.energy = state.maxEnergy; // Восстанавливаем энергию
  } else {
    // ПОВТОРНЫЙ РАЗ
    state.maxEnergy = getMaxEnergy();
    // Энергия НЕ восстанавливается
  }

  // 🎁 ДРОП ПРЕДМЕТОВ
  const droppedItems = rollLoot(loc);
  let lootMessage = '';
  
  if (droppedItems.length > 0) {
    for (const drop of droppedItems) {
      addItemToPlayer(state.currentLogin, drop.itemId, drop.quantity);
      const item = getItemById(drop.itemId);
      if (item) {
        lootMessage += `${item.icon} ${item.name} x${drop.quantity}`;
        if (droppedItems.indexOf(drop) < droppedItems.length - 1) lootMessage += ', ';
      }
    }
    
    // Обновляем инвентарь
    if (typeof renderInventory === 'function') renderInventory();
  }

  updateResources();
  initMap();
  closeLocModal();
  
  // Показываем сообщение
  if (isFirstTime) {
    showToast(`🎉 Пройдено впервые! +${loc.rewardSilver} серебра. Энергия восстановлена!`);
  } else {
    showToast(`Пройдено! +${loc.rewardSilver} серебра. Энергия: ${state.energy}/${state.maxEnergy}`);
  }
  
  // Показываем дроп отдельным сообщением
  if (lootMessage) {
    setTimeout(() => showToast(`🎁 Дроп: ${lootMessage}`), 500);
  }
  
  saveGame();
}
