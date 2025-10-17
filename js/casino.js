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
  const sidebar = document.getElementById('casino-sidebar');
  if (!sidebar) return;

  // --- LÓGICA DO SUBMENU (ACORDEÃO) ---
  const menuHeader = sidebar.querySelector('.casino-sidebar-menu-item');
  const submenu = sidebar.querySelector('.casino-sidebar-submenu');

  if (menuHeader && submenu) {
    menuHeader.addEventListener('click', () => {
      // Adiciona/remove a classe que controla a seta e a abertura
      menuHeader.classList.toggle('submenu-open');
      submenu.classList.toggle('submenu-open');
    });
  }

  // --- LÓGICA DE SCROLL SUAVE AO CLICAR NO SUBMENU ---
  const submenuItems = submenu.querySelectorAll('.casino-sidebar-submenu-item');
  submenuItems.forEach(item => {
    item.addEventListener('click', () => {
      const categoryText = item.querySelector('h3').textContent.trim().toLowerCase();
      let targetId = '';

      // Mapeia o texto do botão para o ID da seção
      switch (categoryText) {
        case 'jogos populares':
          targetId = 'section-populares';
          break;
        case 'cartas':
          targetId = 'section-cartas';
          break;
        case 'cash':
          targetId = 'section-cash';
          break;
        case 'roleta':
          targetId = 'section-roleta';
          break;
        case 'slots':
          targetId = 'section-slots';
          break;
      }

      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          // O scroll suave é feito pelo CSS 'scroll-behavior: smooth;'
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
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
  if (typeof window.updateTigerOngCard === 'function') {
    window.updateTigerOngCard();
  }

  if (ongModal) ongModal.style.display = 'none';
}

function closeOngModal() {
  const ongModal = document.getElementById('ongModal');
  if (ongModal) ongModal.style.display = 'none';
}