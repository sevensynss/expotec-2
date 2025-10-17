// ===== ROULETTE GAME =====

// --- GAME STATE ---
let selectedBetType = null;
let rouletteAngle = 0;

// --- DOM ELEMENTS ---
const rouletteModal = document.getElementById('rouletteModal');
const spinBtn = document.getElementById('spinBtn');
const betInput = document.getElementById('bet-input');
const betMessage = document.getElementById('bet-message');
const resultEl = document.getElementById('result');

// --- CORE FUNCTIONS ---

// Abre o modal da roleta, verificando o login
function playRoulette() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }
  if (rouletteModal) {
    rouletteModal.style.display = 'flex';
    resetRouletteModal();
  }
}

// Fecha o modal da roleta
function closeRouletteModal() {
  if (rouletteModal) rouletteModal.style.display = 'none';
  resetRouletteModal();
}

// Reseta o estado do modal da roleta
function resetRouletteModal() {
  selectedBetType = null;
  betInput.value = '50';
  enableBetTypeButtons(false);
  betMessage.textContent = '';
  resultEl.textContent = '';
  spinBtn.disabled = true;
  betInput.disabled = true;

  document.getElementById('selectedOngCard').style.display = 'none';
  window.selectedOng = null;

  drawRouletteWheel(rouletteAngle); // Redesenha a roleta na posição atual
  if (typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();
}

// Atualiza o card da ONG (chamado pelo casino.js)
window.updateRouletteOngCard = function() {
  if (!window.selectedOng) return;
  const card = document.querySelector(`#ongModal .ong-card[data-ong="${window.selectedOng}"]`);
  if (!card) return;

  document.getElementById('selectedOngTag').textContent = card.querySelector('.ong-tag').textContent;
  document.getElementById('selectedOngName').textContent = card.querySelector('h3').textContent;
  document.getElementById('selectedOngDesc').textContent = card.querySelector('p').textContent;
  document.getElementById('selectedOngCard').style.display = 'block';

  betInput.disabled = false;
  enableBetTypeButtons(true);
  checkRoletaForm();
};

// Habilita/desabilita botões de tipo de aposta
function enableBetTypeButtons(enable) {
  document.querySelectorAll('.bet-type-btn').forEach(btn => {
    btn.disabled = !enable;
    if (!enable) btn.classList.remove('selected');
  });
  if (!enable) selectedBetType = null;
}

// Valida o formulário para liberar o botão de girar
function checkRoletaForm() {
  const betValue = parseFloat(betInput.value);
  const isValid = window.selectedOng && selectedBetType && !isNaN(betValue) && betValue >= 1;
  spinBtn.disabled = !isValid;
}

// --- ROULETTE SPINNING LOGIC ---

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}

function spinRoulette() {
  if (!window.selectedOng || !selectedBetType) return;
  const aposta = parseFloat(betInput.value);
  if (isNaN(aposta) || aposta < 1 || aposta > userBalance) {
    betMessage.textContent = aposta > userBalance ? 'Saldo insuficiente.' : 'Valor inválido.';
    return;
  }

  betMessage.textContent = '';
  resultEl.textContent = 'Girando...';
  spinBtn.disabled = true;
  betInput.disabled = true;
  enableBetTypeButtons(false);

  const targetAngle = Math.random() * Math.PI * 2;
  const baseTurns = 6 + Math.random() * 2;
  const totalRotation = baseTurns * Math.PI * 2 + ((targetAngle - (rouletteAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2));
  const duration = 5000;
  let start = null;

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutQuint(t);
    const angle = rouletteAngle + totalRotation * eased;
    drawRouletteWheel(angle);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      rouletteAngle = (rouletteAngle + totalRotation) % (Math.PI * 2);
      drawRouletteWheel(rouletteAngle);
      calculateResult(aposta);
    }
  }
  requestAnimationFrame(frame);
}

function calculateResult(aposta) {
  const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
  const finalAngle = (rouletteAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  let sector = Math.floor((finalAngle / (Math.PI * 2)) * numbers.length);
  if (sector < 0) sector += numbers.length;

  const sorteado = numbers[sector];
  const cor = colors[sector];
  userBalance -= aposta;
  const ganhou = (selectedBetType === cor);
  let premio = 0;

  if (ganhou) {
    const payout = (cor === 'green') ? 36 : 2;
    premio = aposta * payout;
    userBalance += premio;
  }
  window.updateBalanceInfo();

  resultEl.textContent = ganhou ?
    `Número: ${sorteado} (${cor}) • Ganhou R$ ${premio.toFixed(2)}` :
    `Número: ${sorteado} (${cor}) • Perdeu R$ ${aposta.toFixed(2)}`;

  setTimeout(resetRouletteModal, 6000);
}

// --- ROULETTE DRAWING ---
function drawRouletteWheel(angle = 0) {
  // ... (código de desenho do canvas permanece o mesmo)
  const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  const colors = ['green','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black'];
  const canvas = document.getElementById('rouletteWheel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 10;
  const angleStep = (2 * Math.PI) / numbers.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  for (let i = 0; i < numbers.length; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * angleStep, (i + 1) * angleStep);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.save();
    ctx.rotate(i * angleStep + angleStep / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillText(numbers[i], radius - 25, 5);
    ctx.restore();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff7f50";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0);
  ctx.beginPath();
  ctx.moveTo(0, -radius - 5);
  ctx.lineTo(-10, -radius - 25);
  ctx.lineTo(10, -radius - 25);
  ctx.closePath();
  ctx.fillStyle = "#ffd700";
  ctx.fill();
  ctx.restore();
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  // Botão para abrir o modal da roleta
  document.querySelectorAll('#game-play-roulette').forEach(button => {
    button.addEventListener('click', playRoulette);
  });

  // Botão para girar a roleta
  if (spinBtn) spinBtn.addEventListener('click', spinRoulette);

  // Botão para abrir o modal de ONGs
  const chooseOngBtn = document.getElementById('chooseOngBtn');
  if (chooseOngBtn) chooseOngBtn.onclick = () => {
    document.getElementById('ongModal').style.display = 'flex';
  };

  // Seleção de tipo de aposta
  document.querySelectorAll('.bet-type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (btn.disabled) return;
      document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedBetType = btn.getAttribute('data-type');
      checkRoletaForm();
    });
  });

  // Controles de valor de aposta
  if (betInput) betInput.addEventListener('input', () => {
    sanitizeBetInput(betInput);
    checkRoletaForm();
  });
  const betMinus = document.getElementById('bet-minus');
  if (betMinus) betMinus.onclick = () => {
    let val = parseInt(betInput.value, 10) || 0;
    betInput.value = Math.max(1, val - 10);
    checkRoletaForm();
  };
  const betPlus = document.getElementById('bet-plus');
  if (betPlus) betPlus.onclick = () => {
    let val = parseInt(betInput.value, 10) || 0;
    betInput.value = val + 10;
    checkRoletaForm();
  };

  // Desenho inicial da roleta
  drawRouletteWheel();
});