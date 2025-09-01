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

/* conexão com o banco de dados e exibição dos usuários */
document.getElementById('form-registro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('name').value,
        data_nasc: document.getElementById('birth-date').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('password-register').value,
        usuario: document.getElementById('username-register').value,
        cpf: document.getElementById('cpf').value,
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

    } catch (erro) {
        console.error('Erro de conexão:', erro);
        document.getElementById('mensagem-registro').textContent = 'Erro ao conectar com o servidor.';
    }
});

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        usuario: document.getElementById('username-login').value,
        senha: document.getElementById('password-login').value,
    };

    try {
        const resposta = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        const mensagem = document.getElementById('mensagem-login');
        mensagem.textContent = resultado.mensagem;

    } catch (erro) {
        console.error('Erro de conexão:', erro);
        document.getElementById('mensagem-login').textContent = 'Erro ao conectar com o servidor.';
    }
});

