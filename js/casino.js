// Sidebar: abre/fecha seções
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('casino-sidebar');
  if (!sidebar) return;

  // Cada cabeçalho que precede um submenu
  sidebar.querySelectorAll('.casino-sidebar-menu-item').forEach(header => {
    const submenu = header.nextElementSibling;
    if (!submenu || !submenu.classList.contains('casino-sidebar-submenu')) return;

    // Ícone setinha dentro do header
    const arrow = header.querySelector('svg');

    // Aplica estado inicial (mantém aberto se já estiver visível)
    const applyState = (open) => {
      submenu.classList.toggle('casino-hidden', !open);
      if (arrow) arrow.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
    };
    applyState(!submenu.classList.contains('casino-hidden'));

    // Click/Teclado para alternar
    header.addEventListener('click', () => applyState(submenu.classList.contains('casino-hidden')));
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
});


// Lógica do fluxo do botão "Jogar agora" da Roleta
function playRoulette() {
  if (!localStorage.getItem('token')) {
    // Não está logado: abre modal de login
    LoginModal.style.display = "flex";
  } else {
    // Está logado: abre modal da roleta
    openRouletteModal();
  }
};

// Troca para modal de cadastro a partir do login
function OpenRegisterFromLogin() {
  CloseLoginModal();
  SignUpOpenModal();
}
function checkRoletaForm() {
  const betInput = document.getElementById('bet-input');
  const spinBtn = document.getElementById('spinBtn');
  if (selectedOng && betInput.value && parseFloat(betInput.value) >= 1) {
    spinBtn.disabled = false;
    document.getElementById('bet-message').textContent = '';
  } else {
    spinBtn.disabled = true;
    document.getElementById('bet-message').textContent = '';
  }
}
document.getElementById('bet-input').addEventListener('input', checkRoletaForm);

// Confirmação de aposta
function confirmBet() {
  const betInput = document.getElementById('bet-input');
  const betMessage = document.getElementById('bet-message');
  const value = parseFloat(betInput.value);
  if (!selectedOng) {
    betMessage.textContent = 'Escolha uma ONG antes de apostar!';
    document.getElementById('spinBtn').disabled = true;
    return;
  }
  if (!value || value < 1) {
    betMessage.textContent = 'Digite um valor válido!';
    document.getElementById('spinBtn').disabled = true;
    return;
  }
  betMessage.textContent = 'Aposta confirmada! Clique em "Iniciar Jogo".';
  document.getElementById('spinBtn').disabled = false;
}

// Botão "Jogar" da Roleta
document.getElementById('game-play-roulette').addEventListener('click', function () {
  if (!localStorage.getItem('token')) {
    document.getElementById('loginModal').style.display = 'flex';
    return;
  }
  openRouletteModal();
});

// Modal da Roleta
const rouletteModal = document.getElementById('rouletteModal');
function openRouletteModal() {
  rouletteModal.style.display = 'flex';
  resetRouletteModal();
}
function closeRouletteModal() {
  rouletteModal.style.display = 'none';
  resetRouletteModal();
  const closeBtn = document.getElementById('close-game-btn');
  if (closeBtn) closeBtn.remove();
}
window.addEventListener("click", (event) => {
  if (event.target === rouletteModal) closeRouletteModal();
  const bjModal = document.getElementById('blackjackModal');
  if (event.target === bjModal) closeBlackjackModal?.();
  if (typeof LoginModal !== 'undefined' && event.target === LoginModal) CloseLoginModal();
  if (typeof SignUpmodal !== 'undefined' && event.target === SignUpmodal) CloseRegisterModal();
});

// Controle de seleção de ONG
let selectedOng = null;
let selectedBetType = null;

// Botão "Escolher ONG" abre o segundo modal
document.getElementById('chooseOngBtn').onclick = function() {
  document.getElementById('ongModal').style.display = 'flex';
};

// Fecha modal de seleção de ONG
function closeOngModal() {
  document.getElementById('ongModal').style.display = 'none';
}

// Seleciona ONG no modal de ONGs e atualiza card no modal do jogo
function selectOngFromOngModal(num) {
  document.querySelectorAll('#ongModal .ong-card').forEach(card => card.classList.remove('selected'));
  document.querySelector('#ongModal .ong-card[data-ong="' + num + '"]').classList.add('selected');

  // Pega dados da ONG selecionada
  const card = document.querySelector('#ongModal .ong-card[data-ong="' + num + '"]');
  const tag = card.querySelector('.ong-tag').textContent;
  const name = card.querySelector('h3').textContent;
  const desc = card.querySelector('p').textContent;

  // Atualiza card no modal do jogo
  document.getElementById('selectedOngTag').textContent = tag;
  document.getElementById('selectedOngName').textContent = name;
  document.getElementById('selectedOngDesc').textContent = desc;
  document.getElementById('selectedOngCard').style.display = 'block';

  selectedOng = num;
  document.getElementById('bet-input').disabled = false;
  enableBetTypeButtons(true);
  checkRoletaForm();

  closeOngModal();
}

// Habilita/desabilita botões de cor de aposta
function enableBetTypeButtons(enable) {
  document.querySelectorAll('.bet-type-btn').forEach(btn => {
    btn.disabled = !enable;
    if (!enable) btn.classList.remove('selected');
  });
  selectedBetType = null;
}

// Seleção de cor de aposta
document.querySelectorAll('.bet-type-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (btn.disabled) return;
    document.querySelectorAll('.bet-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedBetType = btn.getAttribute('data-type');
    checkRoletaForm();
  });
});

// Validação para liberar botão de jogar
function checkRoletaForm() {
  const betInput = document.getElementById('bet-input');
  const spinBtn = document.getElementById('spinBtn');
  if (selectedOng && selectedBetType && betInput.value && parseFloat(betInput.value) >= 1) {
    spinBtn.disabled = false;
    document.getElementById('bet-message').textContent = '';
  } else {
    spinBtn.disabled = true;
    document.getElementById('bet-message').textContent = '';
  }
}

document.getElementById('bet-input').addEventListener('input', checkRoletaForm);

let userBalance = 1000; // Saldo inicial do usuário (exemplo)
function updateBalanceInfo() {
  const formatted = (userBalance ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const navText = document.getElementById('balance-text');
  if (navText) navText.textContent = formatted;
}
window.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
  updateBalanceInfo();
});

// Referência ao botão (garante que existe antes de usar)
const spinBtn = document.getElementById('spinBtn');


let rouletteAngle = 0;

function easeOutQuint(t) {
  return 1 - Math.pow(1 - t, 5);
}


function spinRoulette() {
  const betInput   = document.getElementById('bet-input');
  const betMessage = document.getElementById('bet-message');
  const resultEl   = document.getElementById('result');
  const spinBtn    = document.getElementById('spinBtn');

  if (!selectedOng)       { betMessage.textContent = 'Escolha uma ONG antes de jogar!'; return; }
  if (!selectedBetType)   { betMessage.textContent = 'Selecione o tipo de aposta!';   return; }

  const aposta = parseFloat(betInput.value);
  if (isNaN(aposta) || aposta < 1)  { betMessage.textContent = 'Valor inválido.';     return; }
  if (aposta > userBalance)         { betMessage.textContent = 'Saldo insuficiente.'; return; }

  betMessage.textContent = '';
  resultEl.textContent = 'Girando...';
  spinBtn.disabled = true;

  // Escolhe aleatoriamente um ângulo final e a rotação total (6 a 8 voltas)
  const targetAngle = Math.random() * Math.PI * 2;   // 0..2π
  const baseTurns   = 9 + Math.random() * 4;         // 6–8 voltas
  const totalRotation = baseTurns * Math.PI * 2 + ((targetAngle - (rouletteAngle % (Math.PI*2)) + Math.PI*2) % (Math.PI*2));

  const duration = 6000; // ms (ajuste fino se quiser mais/menos suave)
  let start = null;

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const t = Math.min(elapsed / duration, 1); // 0..1
    const eased = easeOutQuint(t);

    // Ângulo atual com easing (sem “snap” no final)
    const angle = rouletteAngle + totalRotation * eased;
    drawRouletteWheel(angle);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      // Congela no ângulo final exato
      rouletteAngle = (rouletteAngle + totalRotation) % (Math.PI * 2);
      drawRouletteWheel(rouletteAngle);

      // Descobre setor sorteado com base no ângulo final (mapeamento 0..2π)
      const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
      const colors  = ['green','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black','red','black'];

      // Normaliza para 0..2π
      const finalAngle = (rouletteAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      let sector = Math.floor((finalAngle / (Math.PI * 2)) * numbers.length);
      if (sector < 0) sector += numbers.length;

      const sorteado = numbers[sector];
      const cor = colors[sector];

      // Paga/retira aposta
      userBalance -= aposta;
      const payout = (cor === 'green') ? 36 : 2;
      const ganhou = (selectedBetType === cor);
      let premio = 0;
      if (ganhou) {
        premio = aposta * payout;
        userBalance += premio;
      }
      updateBalanceInfo();

      resultEl.textContent = ganhou
        ? `Número: ${sorteado} (${cor}) • Ganhou R$ ${premio.toFixed(2)}`
        : `Número: ${sorteado} (${cor}) • Perdeu R$ ${aposta.toFixed(2)}`;

      // Bloqueia inputs até reset
      betInput.disabled = true;
      enableBetTypeButtons(false);

      // Reinicia automaticamente após 6s
      setTimeout(() => {
        resetRouletteModal();
        // mantém o ângulo atual como ponto de partida para próxima animação
      }, 6000);
    }
  }

  requestAnimationFrame(frame);
}

// Reset modal roleta
function resetRouletteModal() {
  selectedOng = null;
  selectedBetType = null;
  const betEl = document.getElementById('bet-input');
  betEl.value = '';
  enableBetTypeButtons(false);
  document.getElementById('bet-message').textContent = '';
  document.getElementById('result').textContent = '';
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('selectedOngCard').style.display = 'none';
  document.getElementById('selectedOngTag').textContent = '';
  document.getElementById('selectedOngName').textContent = '';
  document.getElementById('selectedOngDesc').textContent = '';
  const closeBtn = document.getElementById('close-game-btn');
  if (closeBtn) closeBtn.remove();
  drawRouletteWheel();
  updateBalanceInfo();
}

// ao digitar, sanitiza e revalida
document.getElementById('bet-input').addEventListener('input', (e) => {
  sanitizeBetInput(e.target);
  checkRoletaForm();
});

// Funções para login/registro
function CloseLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.reset();
    const mensagem = document.getElementById('mensagem-login');
    if (mensagem) mensagem.textContent = '';
  }
}
function CloseRegisterModal() {
  document.getElementById('SignUpModal').style.display = 'none';
  const formRegistro = document.getElementById('form-registro');
  if (formRegistro) {
    formRegistro.reset();
    const mensagem = document.getElementById('mensagem-registro');
    if (mensagem) mensagem.textContent = '';
  }
}
function OpenRegisterFromLogin() {
  CloseLoginModal();
  document.getElementById('SignUpModal').style.display = 'flex';
}

// Botão de valor da aposta
document.getElementById('bet-minus').onclick = function() {
  const input = document.getElementById('bet-input');
  let val = parseInt(input.value, 10) || 0;
  if (val > 10) input.value = val - 10;
  else input.value = 1;
  checkRoletaForm();
};
document.getElementById('bet-plus').onclick = function() {
  const input = document.getElementById('bet-input');
  let val = parseInt(input.value, 10) || 0;
  input.value = val + 10;
  checkRoletaForm();
};

window.addEventListener('DOMContentLoaded', () => drawRouletteWheel());

function drawRouletteWheel(angle = 0) {
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

    // Números
    ctx.save();
    ctx.rotate(i * angleStep + angleStep / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Segoe UI';
    ctx.fillText(numbers[i], radius - 25, 5);
    ctx.restore();
  }

  // Pino indicador
  ctx.restore();
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff7f50";
  ctx.fill();
  ctx.restore();

  // Indicador de topo
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

// CAMPO MINADO
function playMines () {
    if (!localStorage.getItem('token')) {
      document.getElementById('loginModal').style.display = 'flex';
      return;
    }
    openMinesModal();
  };

// ===== MINES: ESTADO =====
const minesModal = document.getElementById('minesModal');
let minesRows = 5, minesCols = 5;
let minesBoard = [];        // true = mina, false = seguro
let minesRevealed = 0;
let minesCountState = 3;
let minesRoundActive = false;
let minesCurrentMultiplier = 1;
let minesBet = 0;


// ===== MINES: ABRIR/FECHAR/RESET =====
function openMinesModal() {
  minesModal.style.display = 'flex';
  resetMinesModal();
}
function closeMinesModal() {
  minesModal.style.display = 'none';
  resetMinesModal();
}
window.addEventListener('click', (e) => { if (e.target === minesModal) closeMinesModal(); });

function resetMinesModal() {
  const grid = document.getElementById('minesGrid');
  const msg = document.getElementById('mines-message');
  const res = document.getElementById('minesResult');
  const input = document.getElementById('mines-bet-input');
  minesRoundActive = false;
  minesCurrentMultiplier = 1;
  minesRevealed = 0;
  grid.innerHTML = '';
  res.textContent = '';
  msg.textContent = '';
  document.getElementById('selectedOngCardMines').style.display = 'none';
  document.getElementById('selectedOngTagMines').textContent = '';
  document.getElementById('selectedOngNameMines').textContent = '';
  document.getElementById('selectedOngDescMines').textContent = '';
  document.getElementById('minesCashoutBtn').disabled = true;
  input.value = input.value || 50;
  input.disabled = false;

  buildMinesGrid(false);
  updateBalanceInfo();
}

// Campo Minado: sanitiza ao digitar
document.getElementById('mines-bet-input').addEventListener('input', (e) => {
  sanitizeBetInput(e.target);
});


// Cria/atualiza a grade visual
function buildMinesGrid(enableClicks) {
  const grid = document.getElementById('minesGrid');
  grid.innerHTML = '';
  for (let r = 0; r < minesRows; r++) {
    for (let c = 0; c < minesCols; c++) {
      const idx = r * minesCols + c;
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'mines-cell' + (enableClicks ? '' : ' disabled');
      cell.dataset.index = idx;
      if (enableClicks) {
        cell.addEventListener('click', onMinesCellClick, { once: false });
      }
      grid.appendChild(cell);
    }
  }
}

// Distribui minas
function generateMinesBoard(minesCount) {
  minesBoard = Array(minesRows * minesCols).fill(false);
  let placed = 0;
  while (placed < minesCount) {
    const i = Math.floor(Math.random() * minesBoard.length);
    if (!minesBoard[i]) {
      minesBoard[i] = true;
      placed++;
    }
  }
}

// Clique em célula
function onMinesCellClick(e) {
  if (!minesRoundActive) return;
  const btn = e.currentTarget;
  const i = parseInt(btn.dataset.index, 10);
  if (btn.classList.contains('safe')) return;

  const res = document.getElementById('minesResult');

  if (minesBoard[i]) {
    // Explodiu
    btn.classList.add('mine');
    document.querySelectorAll('.mines-cell').forEach(b=>{
      b.classList.add('disabled');
      const ix = parseInt(b.dataset.index,10);
      if (minesBoard[ix]) b.classList.add('mine');
    });
    minesRoundActive = false;
    document.getElementById('minesCashoutBtn').disabled = true;
    res.textContent = `Bumm! Você perdeu R$ ${minesBet.toFixed(2)}.`;
    // Reinicia em 6s
    setTimeout(resetMinesModal, 6000);
    return;
  }

  // Seguro
  btn.classList.add('safe');
  btn.textContent = '✓';
  minesRevealed++;

  // Multiplicador incremental (odds-based)
  const closedBefore = minesRows * minesCols - (minesRevealed - 1);
  const stepMult = closedBefore / (closedBefore - minesCountState);
  minesCurrentMultiplier *= stepMult;

  const potential = minesBet * minesCurrentMultiplier;
  document.getElementById('minesCashoutBtn').disabled = false;
  res.textContent = `Seguro! Multiplicador: ${minesCurrentMultiplier.toFixed(2)} • Saque: R$ ${potential.toFixed(2)}`;
}

// Iniciar rodada
document.getElementById('minesStartBtn').addEventListener('click', () => {
  const betInput = document.getElementById('mines-bet-input');
  const msg = document.getElementById('mines-message');
  if (!selectedOng) { msg.textContent = 'Escolha uma ONG antes de jogar!'; return; }

  const v = parseFloat(betInput.value);
  if (isNaN(v) || v < 1) { msg.textContent = 'Digite um valor válido!'; return; }
  if (v > userBalance) { msg.textContent = 'Saldo insuficiente!'; return; }

  // Debita aposta no início
  minesBet = v;
  userBalance -= minesBet;
  updateBalanceInfo();

  // Configura rodada
  msg.textContent = '';
  document.getElementById('minesResult').textContent = 'Abrindo o campo...';
  const minesCount = parseInt(document.getElementById('mines-count').value,10) || 3;
  minesCountState = minesCount;
  minesCurrentMultiplier = 1;
  minesRevealed = 0;
  minesRoundActive = true;

  generateMinesBoard(minesCount);
  buildMinesGrid(true);
});

// Saque
document.getElementById('minesCashoutBtn').addEventListener('click', () => {
  if (!minesRoundActive && minesRevealed === 0) return;
  const prize = minesBet * minesCurrentMultiplier;
  userBalance += prize;
  updateBalanceInfo();
  document.getElementById('minesResult').textContent = `Você sacou R$ ${prize.toFixed(2)}!`;
  // Desabilita grade
  document.querySelectorAll('.mines-cell').forEach(b => b.classList.add('disabled'));
  document.getElementById('minesCashoutBtn').disabled = true;
  minesRoundActive = false;
  setTimeout(resetMinesModal, 6000);
});

// Controles de aposta e minas
document.getElementById('mines-bet-minus').onclick = function () {
  const input = document.getElementById('mines-bet-input');
  let val = parseInt(input.value, 10) || 0;
  input.value = Math.max(1, val - 10);
};
document.getElementById('mines-bet-plus').onclick = function () {
  const input = document.getElementById('mines-bet-input');
  let val = parseInt(input.value, 10) || 0;
  input.value = val + 10;
};
document.getElementById('mines-count').addEventListener('input', (e)=>{
  document.getElementById('mines-count-value').textContent = e.target.value;
});

// Botão "Escolher ONG" do Mines usa o mesmo modal de ONGs
const chooseOngBtnMines = document.getElementById('chooseOngBtnMines');
if (chooseOngBtnMines) chooseOngBtnMines.onclick = function () {
  document.getElementById('ongModal').style.display = 'flex';
};

// Atualiza seleção de ONG também no card do Mines
const originalSelectOng = selectOngFromOngModal;
selectOngFromOngModal = function (num) {
  originalSelectOng(num); // atualiza a roleta
  // também atualiza o Mines, se os elementos existirem
  const card = document.querySelector('#ongModal .ong-card[data-ong="' + num + '"]');
  if (card) {
    const tag = card.querySelector('.ong-tag').textContent;
    const name = card.querySelector('h3').textContent;
    const desc = card.querySelector('p').textContent;

    const tagEl  = document.getElementById('selectedOngTagMines');
    const nameEl = document.getElementById('selectedOngNameMines');
    const descEl = document.getElementById('selectedOngDescMines');
    const wrap   = document.getElementById('selectedOngCardMines');
    if (tagEl && nameEl && descEl && wrap) {
      tagEl.textContent = tag;
      nameEl.textContent = name;
      descEl.textContent = desc;
      wrap.style.display = 'block';
      document.getElementById('mines-bet-input').disabled = false;
    }
  }
};

// Sanitize genérico para inputs de aposta
function sanitizeBetInput(el) {
  const max = 1_000_000; // limite opcional
  let v = el.value.replace(',', '.');
  let n = parseFloat(v);
  if (Number.isNaN(n)) { el.value = ''; return; }
  n = Math.max(1, Math.min(max, n));
  el.value = String(n);
}


// Ajuste nos botões +/- para manter coerência
document.getElementById('mines-bet-minus').onclick = function () {
  const input = document.getElementById('mines-bet-input');
  let val = parseInt(input.value || '0', 10);
  input.value = Math.max(1, (Number.isNaN(val) ? 0 : val) - 10);
};
document.getElementById('mines-bet-plus').onclick = function () {
  const input = document.getElementById('mines-bet-input');
  let val = parseInt(input.value || '0', 10);
  input.value = (Number.isNaN(val) ? 0 : val) + 10;
};

// Roleta +/- já chamam checkRoletaForm; mantém
document.getElementById('bet-minus').onclick = function() {
  const input = document.getElementById('bet-input');
  let val = parseInt(input.value || '0', 10);
  input.value = Math.max(1, (Number.isNaN(val) ? 0 : val) - 10);
  checkRoletaForm();
};
document.getElementById('bet-plus').onclick = function() {
  const input = document.getElementById('bet-input');
  let val = parseInt(input.value || '0', 10);
  input.value = (Number.isNaN(val) ? 0 : val) + 10;
  checkRoletaForm();
};


  //fecha o modal do botão X e chama o reset correto (se existir)
function closeAnyModal(btn) {
  const modal = btn.closest('.modal');
  if (!modal) return;
  switch (modal.id) {
    case 'rouletteModal':
      if (typeof closeRouletteModal === 'function') closeRouletteModal(); else modal.style.display = 'none';
      break;
    case 'minesModal':
      if (typeof closeMinesModal === 'function') closeMinesModal(); else modal.style.display = 'none';
      break;
    case 'blackjackModal':
      if (typeof closeBlackjackModal === 'function') closeBlackjackModal(); else modal.style.display = 'none';
      break;
    default:
      modal.style.display = 'none';
  }
}

// Delegação: qualquer .modal-close-btn ou .close fecha o modal
document.addEventListener('click', (e) => {
  const xBtn = e.target.closest('.modal-close-btn, .close');
  if (!xBtn) return;
  e.preventDefault();
  closeAnyModal(xBtn);
});

// ...existing code...

// Corrige listener global de clique (evita ReferenceError e fecha modais pelo backdrop)
window.addEventListener("click", (event) => {
  if (event.target === rouletteModal) closeRouletteModal();
  const bjModal = document.getElementById('blackjackModal');
  if (event.target === bjModal) closeBlackjackModal?.();
  if (typeof LoginModal !== 'undefined' && event.target === LoginModal) CloseLoginModal();
  if (typeof SignUpmodal !== 'undefined' && event.target === SignUpmodal) CloseRegisterModal();
});

// Atualiza função do botão X para incluir o Blackjack
function closeAnyModal(btn) {
  const modal = btn.closest('.modal');
  if (!modal) return;
  switch (modal.id) {
    case 'rouletteModal':
      if (typeof closeRouletteModal === 'function') closeRouletteModal(); else modal.style.display = 'none';
      break;
    case 'minesModal':
      if (typeof closeMinesModal === 'function') closeMinesModal(); else modal.style.display = 'none';
      break;
    case 'blackjackModal':
      if (typeof closeBlackjackModal === 'function') closeBlackjackModal(); else modal.style.display = 'none';
      break;
    default:
      modal.style.display = 'none';
  }
}

// ===== BLACKJACK (modal) =====
let bjDeck = [];
let bjPlayer = [];
let bjDealer = [];
let bjRoundActive = false;
let bjFirstAction = true;
let bjBet = 100;

const BJ_SUITS = ["♠","♥","♦","♣"];
const BJ_VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function bjEl(id) {
  const m = document.getElementById('blackjackModal');
  return m ? m.querySelector(`#${id}`) : document.getElementById(id);
}

function bjCreateDeck() {
  const deck = [];
  for (const s of BJ_SUITS) for (const v of BJ_VALUES) deck.push({ r: v, s });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
function bjCardValue(r) {
  if (r === 'A') return 11;
  if (['K','Q','J'].includes(r)) return 10;
  return parseInt(r, 10);
}
function bjHandValue(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    total += bjCardValue(c.r);
    if (c.r === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; aces--;
  }
  return total;
}

function bjRender() {
  const dEl = bjEl("bj-dealer");
  const pEl = bjEl("bj-player");
  const dVal = bjEl("bj-dealer-value");
  const pVal = bjEl("bj-player-value");
  if (!dEl || !pEl) return;
  dEl.innerHTML = '';
  pEl.innerHTML = '';

  bjDealer.forEach((c, idx) => {
    const div = document.createElement('div');
    const red = (c.s === '♥' || c.s === '♦') ? ' red' : '';
    if (bjRoundActive && bjFirstAction && idx === 1) {
      div.className = 'bj-card back';
      div.textContent = '';
    } else {
      div.className = 'bj-card' + red;
      div.textContent = `${c.r}${c.s}`;
    }
    dEl.appendChild(div);
  });

  bjPlayer.forEach(c => {
    const div = document.createElement('div');
    const red = (c.s === '♥' || c.s === '♦') ? ' red' : '';
    div.className = 'bj-card' + red;
    div.textContent = `${c.r}${c.s}`;
    pEl.appendChild(div);
  });

  const pv = bjHandValue(bjPlayer);
  const dv = (bjRoundActive && bjFirstAction)
    ? bjCardValue(bjDealer[0]?.r || 0)
    : bjHandValue(bjDealer);

  if (pVal) pVal.textContent = pv || 0;
  if (dVal) dVal.textContent = dv || 0;
}

function bjSetMessage(text) {
  const el = bjEl('bj-result');
  if (el) el.textContent = text || '';
}

function bjUpdateBetDisplays() {
  const d1 = bjEl('bj-bet-display');
  const d2 = bjEl('bj-bet-display-2');
  if (d1) d1.textContent = String(bjBet);
  if (d2) d2.textContent = String(bjBet);
}

function resetBlackjackModal() {
  bjDeck = bjCreateDeck();
  bjPlayer = [];
  bjDealer = [];
  bjRoundActive = false;
  bjFirstAction = true;

  // lê valor do input oculto (fallback para 100)
  const input = bjEl('bj-bet-input');
  const v = parseFloat(input?.value || '100');
  bjBet = isNaN(v) || v < 1 ? 100 : Math.floor(v);
  bjUpdateBetDisplays();

  // estados de botões
  bjEl('bjStartBtn')?.removeAttribute('disabled');
  bjEl('bjHitBtn')?.setAttribute('disabled', 'true');
  bjEl('bjStandBtn')?.setAttribute('disabled', 'true');
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true');

  bjSetMessage('');
  bjRender();
}

function openBlackjackModal() {
  const m = document.getElementById('blackjackModal');
  if (!m) return;
  m.style.display = 'flex';
  resetBlackjackModal();
}
function closeBlackjackModal() {
  const m = document.getElementById('blackjackModal');
  if (!m) return;
  m.style.display = 'none';
  resetBlackjackModal();
}
window.playBlackjack = function () {
  if (!localStorage.getItem('token')) {
    if (typeof LoginModal !== 'undefined') LoginModal.style.display = 'flex';
    return;
  }
  openBlackjackModal();
};
window.closeBlackjackModal = closeBlackjackModal;

// ONG no Blackjack (reusa o modal)
const chooseOngBtnBlackjack = document.getElementById('chooseOngBtnBlackjack');
if (chooseOngBtnBlackjack) {
  chooseOngBtnBlackjack.addEventListener('click', () => {
    document.getElementById('ongModal').style.display = 'flex';
  });
}

// Integra seleção de ONG (mantém a já existente para Roleta/Mines)
const _prevSelectOng = selectOngFromOngModal;
selectOngFromOngModal = function(num) {
  _prevSelectOng(num);
  // nada específico no BJ (usa selectedOng global)
};

// Controles de aposta (sincroniza displays ao mudar input oculto)
const bjBetInput = document.getElementById('bj-bet-input');
if (bjBetInput) {
  bjBetInput.addEventListener('input', (e) => {
    sanitizeBetInput(e.target);
    bjBet = parseFloat(e.target.value) || 100;
    bjUpdateBetDisplays();
  });
}

// Ações do jogo
function bjDealInitial() {
  bjPlayer.push(bjDeck.pop());
  bjDealer.push(bjDeck.pop());
  bjPlayer.push(bjDeck.pop());
  bjDealer.push(bjDeck.pop());
}

function bjStart() {
  if (!selectedOng) { bjSetMessage('Escolha uma ONG antes de jogar!'); return; }
  const v = parseFloat(bjEl('bj-bet-input')?.value || bjBet);
  if (isNaN(v) || v < 1) { bjSetMessage('Digite um valor válido!'); return; }
  if (v > userBalance) { bjSetMessage('Saldo insuficiente!'); return; }
  bjBet = Math.floor(v);
  bjUpdateBetDisplays();

  // Debita aposta
  userBalance -= bjBet;
  updateBalanceInfo();

  bjRoundActive = true;
  bjFirstAction = true;

  // Botões
  bjEl('bjStartBtn')?.setAttribute('disabled', 'true');
  bjEl('bjHitBtn')?.removeAttribute('disabled');
  bjEl('bjStandBtn')?.removeAttribute('disabled');
  bjEl('bjDoubleBtn')?.removeAttribute('disabled');

  bjSetMessage('Cartas distribuídas...');
  bjDeck = bjCreateDeck();
  bjPlayer = [];
  bjDealer = [];
  bjDealInitial();
  bjRender();

  // Blackjack natural
  const p = bjHandValue(bjPlayer);
  const d = bjHandValue(bjDealer);
  if (p === 21) {
    bjFirstAction = false;
    bjRender();
    if (d === 21) {
      // Push
      userBalance += bjBet;
      bjSetMessage('Empate: Blackjack para ambos.');
    } else {
      // 3:2 (total recebido = aposta + lucro 1.5x)
      userBalance += Math.floor(bjBet * 2.5);
      bjSetMessage('Blackjack! Você venceu (3:2).');
    }
    updateBalanceInfo();
    bjEndRound();
  } else {
    bjSetMessage('Sua vez: HIT, STAND ou DOUBLE.');
  }
}

function bjHit() {
  if (!bjRoundActive) return;
  bjPlayer.push(bjDeck.pop());
  bjFirstAction = false;
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true'); // não pode dobrar após ação
  bjRender();
  const p = bjHandValue(bjPlayer);
  if (p > 21) {
    bjSetMessage(`Você estourou (${p}).`);
    // perde a aposta já debitada
    bjEndRound();
  }
}

function bjStand() {
  if (!bjRoundActive) return;
  bjFirstAction = false;
  // Dealer compra até 17+
  while (bjHandValue(bjDealer) < 17) {
    bjDealer.push(bjDeck.pop());
  }
  bjRender();

  const p = bjHandValue(bjPlayer);
  const d = bjHandValue(bjDealer);

  if (d > 21 || p > d) {
    // vitória 1:1 (recebe aposta + lucro)
    userBalance += bjBet * 2;
    bjSetMessage(`Você venceu! (+R$ ${bjBet.toFixed(2)})`);
  } else if (p === d) {
    // push (devolve)
    userBalance += bjBet;
    bjSetMessage('Empate. Aposta devolvida.');
  } else {
    bjSetMessage(`Dealer ${d} x Você ${p}. Você perdeu R$ ${bjBet.toFixed(2)}.`);
  }
  updateBalanceInfo();
  bjEndRound();
}

function bjDouble() {
  if (!bjRoundActive || !bjFirstAction) return; // só na primeira ação
  if (userBalance < bjBet) {
    bjSetMessage('Saldo insuficiente para dobrar.');
    return;
  }
  // debita aposta adicional e dobra
  userBalance -= bjBet;
  bjBet *= 2;
  updateBalanceInfo();
  bjUpdateBetDisplays();

  // uma carta e parar
  bjPlayer.push(bjDeck.pop());
  bjFirstAction = false;
  bjRender();
  const p = bjHandValue(bjPlayer);
  if (p > 21) {
    bjSetMessage(`Você estourou (${p}).`);
    bjEndRound();
    return;
  }
  // stand automático
  while (bjHandValue(bjDealer) < 17) {
    bjDealer.push(bjDeck.pop());
  }
  bjRender();
  const d = bjHandValue(bjDealer);
  if (d > 21 || p > d) {
    userBalance += bjBet * 2;
    bjSetMessage(`Você venceu! (+R$ ${(bjBet/2).toFixed(2)})`);
  } else if (p === d) {
    userBalance += bjBet;
    bjSetMessage('Empate. Aposta devolvida.');
  } else {
    bjSetMessage(`Dealer ${d} x Você ${p}. Você perdeu R$ ${bjBet.toFixed(2)}.`);
  }
  updateBalanceInfo();
  bjEndRound();
}

function bjEndRound() {
  bjRoundActive = false;
  // desabilita ações e reabilita START em 6s
  bjEl('bjHitBtn')?.setAttribute('disabled', 'true');
  bjEl('bjStandBtn')?.setAttribute('disabled', 'true');
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true');
  setTimeout(() => {
    bjEl('bjStartBtn')?.removeAttribute('disabled');
    bjSetMessage('');
    // mantém cartas até o próximo start
  }, 6000);
}

// Liga botões do modal do Blackjack
(function initBlackjackUI() {
  const modal = document.getElementById('blackjackModal');
  if (!modal) return;

  const startBtn = bjEl('bjStartBtn');
  const hitBtn = bjEl('bjHitBtn');
  const standBtn = bjEl('bjStandBtn');
  const doubleBtn = bjEl('bjDoubleBtn');

  startBtn?.addEventListener('click', bjStart);
  hitBtn?.addEventListener('click', bjHit);
  standBtn?.addEventListener('click', bjStand);
  doubleBtn?.addEventListener('click', bjDouble);

  // Botões "Jogar blackjack" nos cards (os com ou sem onclick)
  document.querySelectorAll('#game-play-blackjack').forEach((btn) => {
    if (btn.getAttribute('onclick')) return;
    btn.addEventListener('click', () => {
      if (!localStorage.getItem('token')) {
        if (typeof LoginModal !== 'undefined') LoginModal.style.display = 'flex';
        return;
      }
      playBlackjack();
    });
  });

  // Inicializa estado visual
  resetBlackjackModal();
})();

