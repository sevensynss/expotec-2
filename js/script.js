//* ===== DRAGSCROLL HORIZONTAL (HOME) ===== */
function setupDragScroll() {
  const slider = document.querySelector('.game-grid');
  if (!slider) return;

  slider.querySelectorAll('img').forEach(img => {
    img.draggable = false;
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  let isDown = false;
  let startX;
  let scrollLeft;

  const pointerDown = (e) => {
    if (e.target.closest('button, a')) return;
    isDown = true;
    slider.classList.add('active');
    startX = e.clientX;
    scrollLeft = slider.scrollLeft;
    document.body.style.userSelect = 'none';
    if (e.pointerId && slider.setPointerCapture) {
      try { slider.setPointerCapture(e.pointerId); } catch (err) { }
    }
    e.preventDefault();
  };

  const pointerMove = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const delta = e.clientX - startX;
    const speed = 1.5;
    slider.scrollLeft = scrollLeft - delta * speed;
  };

  const pointerUp = (e) => {
    if (!isDown) return;
    isDown = false;
    slider.classList.remove('active');
    document.body.style.userSelect = '';
    if (e.pointerId && slider.releasePointerCapture) {
      try { slider.releasePointerCapture(e.pointerId); } catch (err) { }
    }
  };

  slider.addEventListener('wheel', (e) => {
    e.preventDefault();
    slider.scrollLeft += e.deltaY;
  });

  slider.addEventListener('pointerdown', pointerDown, { passive: false });
  document.addEventListener('pointermove', pointerMove, { passive: false });
  document.addEventListener('pointerup', pointerUp, { passive: false });
  document.addEventListener('pointercancel', pointerUp, { passive: false });

  if (!('onpointerdown' in window)) {
    slider.addEventListener('mousedown', pointerDown, { passive: false });
    document.addEventListener('mousemove', pointerMove, { passive: false });
    document.addEventListener('mouseup', pointerUp, { passive: false });
  }
}

// ===== LÓGICA DE AUTENTICAÇÃO E UI (CENTRALIZADA) =====

// Funções para abrir/fechar modais de autenticação
const loginModal = document.getElementById("loginModal");
const signUpModal = document.getElementById("SignUpModal");

function openLoginModal() {
  if (loginModal)
  loginModal.style.display = "flex";
 }
function closeLoginModal() {
  if (loginModal) {
    loginModal.style.display = "none";
    const form = document.getElementById('form-login');
    if (form) { form.reset();
      const msg = document.getElementById('mensagem-login');
      if (msg) msg.textContent = '';
  }
    }
  }
function openRegisterModal() {
  if (signUpModal)
  signUpModal.style.display = "flex";
 }
function closeRegisterModal() {
  if (signUpModal) { signUpModal.style.display = "none";
  const form = document.getElementById('form-registro');
  if (form) {
    form.reset();
    const msg = document.getElementById('mensagem-registro');
    if (msg) msg.textContent = '';
}
}
}

function openRegisterFromLogin() {
  closeLoginModal();
  openRegisterModal(); }


// Atualiza a visibilidade dos botões e do saldo na navbar
function updateNavbarAuth() {
  const token = localStorage.getItem('token');
  const balanceInfo = document.getElementById('balance-info');
  const loginBtn = document.getElementById('Loginbtn');
  const registerBtn = document.getElementById('Registerbtn');
  const logoutBtn = document.getElementById('logout');

  if (token) {
    // Usuário LOGADO
    if (balanceInfo) balanceInfo.classList.remove('invisible');
    if (logoutBtn) logoutBtn.classList.remove('invisible');
    if (loginBtn) loginBtn.classList.add('invisible');
    if (registerBtn) registerBtn.classList.add('invisible');

    // Se a função de atualizar o texto do saldo existir (estamos na página do cassino), chame-a.
    // Isso garante que o saldo seja exibido em ambas as páginas.
    if (typeof window.updateBalanceInfo === 'function') {
      window.updateBalanceInfo();
    } else {
      // Se não estiver na página do cassino, busca o saldo do backend (exemplo)
      // Esta parte precisa ser implementada se o saldo for dinâmico na home.
      // Por agora, vamos usar um valor fixo para demonstração.
      const balanceText = document.getElementById('balance-text');
      if (balanceText) {
          // Aqui você faria um fetch para uma rota '/api/get-balance'
          // Por enquanto, vamos usar o valor do casino.js como exemplo.
          balanceText.textContent = "R$ 1.000,00";
      }
    }
  } else {
    // Usuário DESLOGADO
    if (balanceInfo) balanceInfo.classList.add('invisible');
    if (logoutBtn) logoutBtn.classList.add('invisible');
    if (loginBtn) loginBtn.classList.remove('invisible');
    if (registerBtn) registerBtn.classList.remove('invisible');
  }
}


// ===== EVENT LISTENERS GLOBAIS =====
document.addEventListener('DOMContentLoaded', () => {
  // 1. Funções que rodam em páginas específicas
  if (document.querySelector('.banner-full')) { // Se for a index.html
    setupDragScroll();
  }

  // Se for a about-us.html
  const ctaRegisterBtn = document.getElementById('cta-register-btn');
  if (ctaRegisterBtn) {
    ctaRegisterBtn.addEventListener('click', openRegisterModal);
  }

  // 2. Funções que rodam em TODAS as páginas
  updateNavbarAuth(); // Verifica o estado de login ao carregar a página

  // Controle de tema (dark/light)
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  if (themeToggle && body) {
    if (localStorage.getItem('theme') === 'light') { body.classList.add('light'); } else { body.classList.remove('light'); }
    themeToggle.addEventListener('click', () => { body.classList.toggle('light'); localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark'); });
  }

  // Botões da navbar
  const loginBtn = document.getElementById('Loginbtn');
  const registerBtn = document.getElementById('Registerbtn');
  const logoutBtn = document.getElementById('logout');
  if (loginBtn) loginBtn.onclick = openLoginModal;
  if (registerBtn) registerBtn.onclick = openRegisterModal;
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      updateNavbarAuth();
      window.location.reload();
    });
  }

  // 3. Configura o fechamento de modais (UNIFICADO)
  document.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    const isCloseButton = e.target.closest('.modal-close-btn, .close, .aviator-close');
    const isBackdrop = e.target.classList.contains('modal');

    if (modal && (isCloseButton || isBackdrop)) {
      e.preventDefault();
      const targetModal = isBackdrop ? e.target : modal;
      targetModal.style.display = 'none';

      // Chama a função de reset específica do modal fechado
      if (targetModal.id === 'loginModal') closeLoginModal();
      if (targetModal.id === 'SignUpModal') closeRegisterModal();
      if (targetModal.id === 'rouletteModal' && typeof resetRouletteModal === 'function') resetRouletteModal();
      if (targetModal.id === 'minesModal' && typeof resetMinesModal === 'function') resetMinesModal();
      if (targetModal.id === 'blackjackModal' && typeof resetBlackjackModal === 'function') resetBlackjackModal();
      if (targetModal.id === 'tigerModal' && typeof resetTigerModal === 'function') resetTigerModal();
    }
  });

  // Formulário de Login
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const dados = { usuario: document.getElementById('username-login').value, senha: document.getElementById('password-login').value };
      const mensagem = document.getElementById('mensagem-login');
      fetch('http://localhost:4000/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) })
      .then(resposta => resposta.json())
      .then(resultado => {
        mensagem.textContent = resultado.mensagem;
        if (resultado.auth && resultado.token) {
          localStorage.setItem('token', resultado.token);
          updateNavbarAuth();
          closeLoginModal();
        }
      })
      .catch(erro => { console.error('Erro de conexão:', erro); mensagem.textContent = 'Erro ao conectar com o servidor.'; });
    });
  }

  // Formulário de Registro
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      const dados = { nome: document.getElementById('name').value, cpf: document.getElementById('cpf').value, data_nasc: document.getElementById('birth-date').value, email: document.getElementById('email').value, usuario: document.getElementById('username-register').value, senha: document.getElementById('password-register').value };
      const mensagem = document.getElementById('mensagem-registro');
      fetch('http://localhost:4000/api/registrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) })
      .then(resposta => { if (!resposta.ok) { return resposta.json().then(err => { throw err; }); } return resposta.json(); })
      .then(resultado => {
        mensagem.textContent = resultado.mensagem;
        if (resultado.sucesso) { setTimeout(() => { closeRegisterModal(); openLoginModal(); }, 1200); }
      })
      .catch(erro => { console.error('Erro no registro:', erro); mensagem.textContent = erro.mensagem || 'Erro ao conectar com o servidor.'; });
    });
  }
});

//* ===== ONGS =====
document.addEventListener('DOMContentLoaded', () => {
  // === UTILITÁRIOS ===
  function parseBRNumber(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d,\.]/g, '').trim();
    if (!cleaned) return 0;
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  }

  function getCategoryColor(category) {
    const rootStyles = getComputedStyle(document.documentElement);
    const map = {
      'educacao': 'cat-educacao',
      'saude': 'cat-saude',
      'meio-ambiente': 'cat-meioambiente',
      'combate-a-fome': 'cat-fome',
      'direitos-humanos': 'cat-direitos',
      'causa-animal': 'cat-animais',
      'assistencia-social': 'cat-social',
      'default': 'cat-default',
      'total-raised': 'cat-total-raised'
    };
    const varName = map[category] || 'cat-default';
    return rootStyles.getPropertyValue(`--${varName}`)?.trim() || '#ccc';
  }

  // === PROGRESSO DAS ONGs ===
  document.querySelectorAll('.ngos-card').forEach(card => {
    const tag = card.querySelector('.ngos-ong-tag');
    if (!tag) return;
    let cat = tag.getAttribute('data-category') || tag.textContent.trim().toLowerCase();
    cat = cat.replace(/\s+/g, '-');
    card.setAttribute('data-category', cat);

    const infoP = Array.from(card.querySelectorAll('p')).find(p => /arrecad/i.test(p.textContent));
    if (!infoP) return;

    const nums = Array.from(infoP.textContent.matchAll(/[\d\.\,]+/g)).map(m => m[0]);
    let raised = 0, target = 0;
    if (nums.length >= 2) {
      raised = parseBRNumber(nums[0]);
      target = parseBRNumber(nums[1]);
    } else {
      raised = parseBRNumber(card.dataset.raised);
      target = parseBRNumber(card.dataset.target);
    }

    const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

    let progressInner = card.querySelector('.progress-inner') || card.querySelector('.ngos-progress-inner');
    if (!progressInner) {
      const outer = card.querySelector('.progress-outer') || card.querySelector('.ngos-progress-outer');
      if (outer) {
        progressInner = outer.querySelector('div') || document.createElement('div');
        progressInner.classList.add('progress-inner');
        if (!outer.contains(progressInner)) outer.appendChild(progressInner);
      }
    }

    if (progressInner) {
      progressInner.style.width = percent + '%';
      progressInner.setAttribute('aria-valuenow', String(percent));
      progressInner.setAttribute('title', percent + '%');
      progressInner.style.backgroundColor = getCategoryColor(cat);
    }
  });

  // === PROGRESSO DO TOTAL ARRECADADO (opcional) ===
  function atualizarBarraTotal(idTexto, idBarra, categoria = 'total-raised') {
    const totalText = document.getElementById(idTexto);
    const totalBar = document.getElementById(idBarra);
    if (totalText && totalBar) {
      const nums = Array.from(totalText.textContent.matchAll(/[\d\.\,]+/g)).map(m => m[0]);
      if (nums.length >= 2) {
        const raised = parseBRNumber(nums[0]);
        const target = parseBRNumber(nums[1]);
        const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
        totalBar.style.width = percent + '%';
        totalBar.setAttribute('aria-valuenow', String(percent));
        totalBar.setAttribute('title', percent + '%');
        totalBar.style.background = getCategoryColor(categoria);
      }
    }
  }

  // Chamada para a barra de total arrecadado
  atualizarBarraTotal('expotec-progress-text', 'total-progress-bar', 'total-raised');


  // === FILTRO POR CATEGORIA + VER MAIS ===
  const categoryCards = Array.from(document.querySelectorAll('.ngos-categories-grid-card'));
  const ngoCards = Array.from(document.querySelectorAll('.ngos-card'));
  const seeMoreBtn = document.querySelector('.btn-see-more');
  const initialCount = 3;

  let showingAll = false;
  let activeCategory = null;

  function applyFilter() {
    const filtered = ngoCards.filter(card => {
      if (!activeCategory) return true;
      const tag = card.querySelector('.ngos-ong-tag');
      return tag && tag.getAttribute('data-category') === activeCategory;
    });

    ngoCards.forEach(c => c.style.display = 'none');

    if (activeCategory) {
      filtered.forEach(c => c.style.display = '');
      if (seeMoreBtn) seeMoreBtn.style.display = 'none';
      return;
    }

    if (showingAll) {
      filtered.forEach(c => c.style.display = '');
    } else {
      filtered.slice(0, initialCount).forEach(c => c.style.display = '');
    }

    if (seeMoreBtn) {
      if (filtered.length > initialCount) {
        seeMoreBtn.style.display = '';
        seeMoreBtn.textContent = showingAll ? 'Ver Menos' : 'Ver Todas as ONGs';
      } else {
        seeMoreBtn.style.display = 'none';
      }
    }
  }

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      categoryCards.forEach(c => c.classList.remove('active'));
      activeCategory = null;
      showingAll = false;

      if (!wasActive) {
        card.classList.add('active');
        activeCategory = card.getAttribute('data-category');
      }

      applyFilter();
    });
  });

  if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', () => {
      if (activeCategory) return;
      showingAll = !showingAll;
      applyFilter();
      if (showingAll) {
        document.querySelector('.ngos-ongs-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  applyFilter();
});