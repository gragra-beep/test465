// ===== ГОРОД =====
const TOWN_BUILDINGS = [
  { id: 'shop',    name: 'Магазин',    x: 65, y: 33, action: "switchPage('bazar')" },
  { id: 'shrine',  name: 'КнопОчка',  x: 30, y: 43, action: "showToast('скоро')" },
  { id: 'smith',   name: 'Кузня',      x: 28, y: 60, action: "openCraftPage('weapon')" },
  { id: 'stub',    name: 'КнопОчка',   x: 85, y: 56, action: "showToast('не очень скоро')" },
  { id: 'alchemy', name: 'Зельеварня', x: 60, y: 75, action: "openCraftPage('potion')" }
];

function initTown() {
  const container = document.getElementById('townContainer');
  if (!container) return;
  container.querySelectorAll('.town-node').forEach(n => n.remove());

  TOWN_BUILDINGS.forEach(b => {
    const node = document.createElement('div');
    node.className = 'town-node';
    node.style.left = b.x + '%';
    node.style.top = b.y + '%';
    node.innerHTML = `<div class="town-node-name">${b.name}</div>`;
    node.setAttribute('onclick', b.action);
    container.appendChild(node);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTown();
});
