// ===== PLINKO GAME SCRIPT (PLACEHOLDER) =====

function playPlinko() {
  const token = localStorage.getItem('token');
  if (!token) {
    // Se não estiver logado, abre o modal de login global
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
    return; // Impede a abertura do jogo
  }

  // Se estiver logado, abre o modal do Plinko
  const plinkoModal = document.getElementById('plinkoModal');
  if (plinkoModal) {
    plinkoModal.style.display = 'flex';
  }
}

// Adiciona o event listener a todos os botões de jogar Plinko quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  // Usa querySelectorAll para encontrar todos os botões com o ID, tratando como classe
  document.querySelectorAll('#game-play-plinko').forEach(button => {
    button.addEventListener('click', playPlinko);
  });
});