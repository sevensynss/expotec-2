// ===== ESTADO E FUNÇÕES GLOBAIS DO CASSINO =====

let userBalance = 1000; // Saldo inicial de exemplo
window.selectedOng = null;

// Atualiza o texto do saldo na navbar (só é chamado pelo script.js)
window.updateBalanceInfo = function() {
  const formatted = (userBalance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const navText = document.getElementById('balance-text');
  if (navText) navText.textContent = formatted;
}

// ===== INICIALIZAÇÃO ESPECÍFICA DO CASSINO =====
document.addEventListener('DOMContentLoaded', () => {
  // Configura a Sidebar
  const sidebar = document.getElementById('casino-sidebar');
  if (sidebar) {
    sidebar.querySelectorAll('.casino-sidebar-menu-item').forEach(header => {
      const submenu = header.nextElementSibling;
      if (!submenu || !submenu.classList.contains('casino-sidebar-submenu')) return;
      const arrow = header.querySelector('svg');
      const applyState = (open) => {
        submenu.classList.toggle('casino-hidden', !open);
        if (arrow) arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
      };
      applyState(!submenu.classList.contains('casino-hidden'));
      header.addEventListener('click', () => applyState(submenu.classList.contains('casino-hidden')));
    });
  }
});

// ===== FUNÇÕES UTILITÁRIAS PARA JOGOS =====

// Garante que inputs de aposta sejam números válidos
function sanitizeBetInput(el) {
    const max = 1_000_000;
    let v = el.value.replace(',', '.');
    let n = parseFloat(v);
    if (Number.isNaN(n)) { el.value = ''; return; }
    n = Math.max(1, Math.min(max, n));
    el.value = String(n);
}

// ===== FUNÇÃO CENTRAL DE SELEÇÃO DE ONG =====
function selectOngFromOngModal(num) {
  window.selectedOng = num;
  const ongModal = document.getElementById('ongModal');

  // Chama a função de atualização para cada jogo que a tiver
  if (typeof window.updateRouletteOngCard === 'function') {
    window.updateRouletteOngCard();
  }
  if (typeof window.updateMinesOngCard === 'function') {
    window.updateMinesOngCard();
  }
  if (typeof window.updateBlackjackOngCard === 'function') {
    window.updateBlackjackOngCard();
  }
  // Adicione aqui outros jogos se necessário

  if (ongModal) ongModal.style.display = 'none';
}

function closeOngModal() {
  const ongModal = document.getElementById('ongModal');
  if (ongModal) ongModal.style.display = 'none';
}