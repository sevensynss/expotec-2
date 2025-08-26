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