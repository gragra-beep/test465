// ===== ДАРЫ =====

function openGifts() {
  console.log('Открываем дары');
  document.getElementById('giftsModal').classList.add('show');
  renderGifts();
}

function closeGifts() {
  document.getElementById('giftsModal').classList.remove('show');
}

function renderGifts() {
  const content = document.querySelector('#giftsModal .modal-page-content');
  if (!content) return;
  
  content.innerHTML = '<p>Загрузка даров...</p>';
  
  // Здесь будет код для отображения даров
}

// Закрытие при клике на оверлей
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('giftsModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeGifts();
    });
  }
});
