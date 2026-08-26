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

    // БЕЗ ИЕРОГЛИФОВ — показываем номер локации
    node.innerHTML = `<div class="node-icon ${iconClass}">${loc.id}${extra}</div><div class="node-num">${loc.id}</div>`;
    node.onclick = () => openLocModal(loc);
    container.appendChild(node);
  });
}

function getBossImagePath(loc) {
  if (!loc.bossImage) return '';
  return loc.bossImage.startsWith('/') ? loc.bossImage : '/test465/' + loc.bossImage;
}

function openLocModal(loc) {
  state.currentLoc = loc;

  document.getElementById('locModalLabel').textContent = 'ЛОКАЦИЯ ' + loc.id;
  document.getElementById('locModalTitle').textContent = loc.name;
  document.getElementById('locModalDesc').textContent = loc.desc;
  document.getElementById('locBossName').textContent = loc.boss;

  // Картинка босса (маленький квадрат)
  const bossImg = getBossImagePath(loc);
  document.getElementById('locBossAvatar').style.backgroundImage = bossImg ? `url('${bossImg}')` : '';
  document.getElementById('locBossAvatar').style.backgroundSize = 'cover';
  document.getElementById('locBossAvatar').style.backgroundPosition = 'center';
  document.getElementById('locModalBossImg').style.backgroundImage = bossImg ? `url('${bossImg}')` : '';

  // Сложность + цвет
  const diffEl = document.getElementById('locDifficulty');
  diffEl.textContent = loc.difficulty || 'Неизвестно';
  diffEl.style.color = loc.barColor || '#4ade80';

  // Необходимая БМ
  document.getElementById('locRequiredBM').textContent = loc.requiredBM || 0;

  // Твоя БМ отряда (зелёная если хватает, красная если нет)
  const squadBM = (typeof getSquadBM === 'function') ? getSquadBM() : 0;
  const squadBMEI = document.getElementById('locSquadBM');
  squadBMEI.textContent = squadBM;
  squadBMEI.className = (squadBM >= (loc.requiredBM || 0)) ? 'bm-ok' : 'bm-bad';

  // Полоска сложности
  const bar = document.getElementById('locBarFill');
  bar.style.width = loc.barPct + '%';
  bar.style.background = loc.barColor || '#4ade80';

  document.getElementById('locRewardEnergy').textContent = '+' + loc.rewardEnergy;
  document.getElementById('locRewardSilver').textContent = '+' + loc.rewardSilver;
  document.getElementById('locCostEnergy').textContent = '-' + loc.energyCost;
  document.getElementById('locRepeatSilver').textContent = '+' + loc.rewardSilver;
  document.getElementById('locEnergyCost').textContent = loc.energyCost;

  // Дроп
  if (typeof showLootInfo === 'function') showLootInfo(loc);

  document.getElementById('locModal').classList.add('show');
}

// ===== ПОКАЗАТЬ ДРОП В МОДАЛКЕ =====
function showLootInfo(loc) {
  const oldBlock = document.getElementById('lootInfoBlock');
  if (oldBlock) oldBlock.remove();
  
  if (!loc.loot || loc.loot.length === 0) return;
  
  const lootBlock = document.createElement('div');
  lootBlock.id = 'lootInfoBlock';
  lootBlock.innerHTML = `
    <div class="modal-section-title">ВОЗМОЖНЫЙ ДРОП</div>
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
  
  const modalBody = document.querySelector('#locModal .modal-body');
  const playBtn = document.querySelector('#locModal .play-again-btn');
  if (modalBody && playBtn) modalBody.insertBefore(lootBlock, playBtn);
}

function closeLocModal() {
  document.getElementById('locModal').classList.remove('show');
}

// ===== ДРОП ПРЕДМЕТОВ =====
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

// ===== ПРОХОЖДЕНИЕ ЛОКАЦИИ =====
function playAgain() {
  const loc = state.currentLoc;
  if (!loc) {
    showToast('Ошибка: локация не найдена', true);
    return;
  }
  
  if (state.energy < loc.energyCost) {
    showToast(`Не хватает энергии! Нужно: ${loc.energyCost}`, true);
    return;
  }
  
  // Энергия тратится ВСЕГДА (и при победе, и при поражении)
  state.energy -= loc.energyCost;
  
  const squadBM = (typeof getSquadBM === 'function') ? getSquadBM() : 0;
  
  // ===== ПОРАЖЕНИЕ =====
  if (squadBM < (loc.requiredBM || 0)) {
    updateResources();
    initMap();
    closeLocModal();
    showToast(`❌ Поражение! БМ ${squadBM} < ${loc.requiredBM}. Без наград. Энергия -${loc.energyCost}`, true);
    saveGame();
    return;
  }
  
  // ===== ПОБЕДА =====
  state.silver += loc.rewardSilver;

  const isFirstTime = !state.completedLocs.includes(loc.id);
  
  if (isFirstTime) {
    state.completedLocs.push(loc.id);
    state.maxEnergy = getMaxEnergy();
    state.energy = state.maxEnergy; // восстанавливаем энергию за первое прохождение
  } else {
    state.maxEnergy = getMaxEnergy();
  }

  // Дроп предметов
  const droppedItems = rollLoot(loc);
  let lootMessage = '';
  
  if (droppedItems.length > 0) {
    droppedItems.forEach((drop, idx) => {
      addItemToPlayer(state.currentLogin, drop.itemId, drop.quantity);
      const item = getItemById(drop.itemId);
      if (item) {
        lootMessage += `${item.icon} ${item.name} x${drop.quantity}`;
        if (idx < droppedItems.length - 1) lootMessage += ', ';
      }
    });
    if (typeof renderInventory === 'function') renderInventory();
  }

  updateResources();
  initMap();
  closeLocModal();
  
  if (isFirstTime) {
    showToast(`🎉 Пройдено впервые! +${loc.rewardSilver} серебра. Энергия восстановлена!`);
  } else {
    showToast(`Пройдено! +${loc.rewardSilver} серебра. Энергия: ${state.energy}/${state.maxEnergy}`);
  }
  
  if (lootMessage) {
    setTimeout(() => showToast(`🎁 Дроп: ${lootMessage}`), 500);
  }
  
  saveGame();
}
