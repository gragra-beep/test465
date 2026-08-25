// ===== ИНВЕНТАРЬ =====

function openInventory() {
  console.log('Открываем инвентарь');
  document.getElementById('inventoryModal').classList.add('show');
  // Здесь будет логика загрузки инвентаря
  renderInventory();
}

function closeInventory() {
  document.getElementById('inventoryModal').classList.remove('show');
}

function renderInventory() {
  const content = document.querySelector('#inventoryModal .modal-page-content');
  if (!content) return;
  
  // Пока просто заглушка
  content.innerHTML = '<p>Загрузка инвентаря...</p>';
  
  // Здесь будет код для отображения предметов
}

// Закрытие при клике на оверлей
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('inventoryModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeInventory();
    });
  }
});
