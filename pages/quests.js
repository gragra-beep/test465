// ===== ЗАДАНИЯ =====

function openQuests() {
  console.log('Открываем задания');
  document.getElementById('questsModal').classList.add('show');
  renderQuests();
}

function closeQuests() {
  document.getElementById('questsModal').classList.remove('show');
}

function renderQuests() {
  const content = document.querySelector('#questsModal .modal-page-content');
  if (!content) return;
  
  content.innerHTML = '<p>Загрузка заданий...</p>';
  
  // Здесь будет код для отображения заданий
}

// Закрытие при клике на оверлей
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('questsModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeQuests();
    });
  }
});
