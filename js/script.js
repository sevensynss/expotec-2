//* ===== DRAGSCROLL HORIZONTAL ===== */
//* Slider horizontal com arrastar e rolar
window.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.game-grid');
  if (!slider) {
    console.warn('game-grid não encontrado');
    return;
  }

  // Evita que as imagens sejam arrastáveis
  slider.querySelectorAll('img').forEach(img => {
    img.draggable = false;
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  let isDown = false;
  let startX;
  let scrollLeft;

  const pointerDown = (e) => {
    // Não iniciar drag se clicar em botão ou link
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
    const speed = 1.5; // Sensibilidade do scroll
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
    slider.scrollLeft += e.deltaY; // permite usar a roda do mouse
  });
  // Pointer events (mouse + touch)
  slider.addEventListener('pointerdown', pointerDown, { passive: false });
  document.addEventListener('pointermove', pointerMove, { passive: false });
  document.addEventListener('pointerup', pointerUp, { passive: false });
  document.addEventListener('pointercancel', pointerUp, { passive: false });

  // Fallback para navegadores sem pointer events
  if (!('onpointerdown' in window)) {
    slider.addEventListener('mousedown', pointerDown, { passive: false });
    document.addEventListener('mousemove', pointerMove, { passive: false });
    document.addEventListener('mouseup', pointerUp, { passive: false });
  }
});

// Controle de tema (dark/light)
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if(localStorage.getItem('theme') === 'light'){
  body.classList.add('light');
} else {
  body.classList.remove('light');
}
themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  localStorage.setItem('theme', body.classList.contains('light') ? 'light' : 'dark');
});


/* Função para abrir o modal de login */
const LoginModal = document.getElementById("loginModal");
function openModal() {
  LoginModal.style.display = "flex";
}


function CloseLoginModal() {
  LoginModal.style.display = "none";
  // Limpa os campos do formulário de login ao fechar o modal
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.reset();
    const mensagem = document.getElementById('mensagem-login');
    if (mensagem) mensagem.textContent = '';
  }
}

window.addEventListener("click", (event) => {
  if (event.target === LoginModal) {
    CloseLoginModal();
  }
});

/* Função para abrir o modal de registro */
const SignUpmodal = document.getElementById("SignUpModal");
function SignUpOpenModal() {
  SignUpmodal.style.display = "flex";
}


function CloseRegisterModal() {
  SignUpmodal.style.display = "none";
  // Limpa o formulário de registro ao fechar o modal
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.reset();
    const mensagem = document.getElementById('mensagem-registro');
    if (mensagem) mensagem.textContent = '';
  }
}

window.addEventListener("click", (event) => {
  if (event.target === SignUpmodal) {
    CloseRegisterModal();
  }
});

// Atualiza navbar (login/cadastro/logout) conforme status do usuário
function updateNavbarAuth() {
  const isLogged = !!localStorage.getItem('token');
  const loginBtn = document.getElementById('Loginbtn');
  const registerBtn = document.getElementById('Registerbtn');
  const logoutBtn = document.getElementById('logout');
  const balanceInfo = document.getElementById('balance-info');
  if (loginBtn) loginBtn.style.display = isLogged ? 'none' : 'inline-block';
  if (registerBtn) registerBtn.style.display = isLogged ? 'none' : 'inline-flex';
  if (logoutBtn) logoutBtn.classList[isLogged ? 'remove' : 'add']('invisible');
  if (balanceInfo) balanceInfo.classList[isLogged ? 'remove' : 'add']('invisible');
}

// Botão de logout
const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('token');
    updateNavbarAuth();
    CloseLoginModal();
    CloseRegisterModal();
    window.location.reload();
  });
}

// Atualiza navbar ao carregar
window.addEventListener('DOMContentLoaded', updateNavbarAuth);

// ===== LOGIN =====
const formLogin = document.getElementById('form-login');
if (formLogin) {
  formLogin.addEventListener('submit', async function (e) {
    e.preventDefault();
    const usuario = document.getElementById('username-login').value;
    const senha = document.getElementById('password-login').value;
    try {
      const resposta = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });
      const resultado = await resposta.json();
      const mensagem = document.getElementById('mensagem-login');
      mensagem.textContent = resultado.mensagem;
      if (resultado.auth && resultado.token) {
        localStorage.setItem('token', resultado.token);
        updateNavbarAuth();
        CloseLoginModal();
        // Se estiver no casino.html, abre modal da roleta se necessário
        if (window.location.pathname.includes('casino.html')) {
          if (typeof openRouletteModal === 'function') openRouletteModal();
        }
      }
    } catch (erro) {
      document.getElementById('mensagem-login').textContent = 'Erro ao conectar com o servidor.';
    }
  });
}

// ===== REGISTRO =====
const formRegistro = document.getElementById('form-registro');
if (formRegistro) {
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dados = {
      nome: document.getElementById('name').value,
      cpf: document.getElementById('cpf').value,
      data_nasc: document.getElementById('birth-date').value,
      usuario: document.getElementById('username-register').value,
      senha: document.getElementById('password-register').value
    };
    try {
      const resposta = await fetch('http://localhost:4000/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      const resultado = await resposta.json();
      const mensagem = document.getElementById('mensagem-registro');
      mensagem.textContent = resultado.mensagem;
      if (resultado.sucesso) {
        setTimeout(() => {
          CloseRegisterModal();
          LoginModal.style.display = "flex";
        }, 1200);
      }
    } catch (erro) {
      document.getElementById('mensagem-registro').textContent = 'Erro ao conectar com o servidor.';
    }
  });
}
