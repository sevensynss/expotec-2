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
}

window.addEventListener("click", (event) => {
  if (event.target === SignUpmodal) {
    CloseRegisterModal();
  }
});
