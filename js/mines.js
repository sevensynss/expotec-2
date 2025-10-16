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
  if (!window.selectedOng) { msg.textContent = 'Escolha uma ONG antes de jogar!'; return; }

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

// Botão "Escolher ONG" abre o segundo modal
document.getElementById('chooseOngBtnMines').onclick = function() {
  document.getElementById('ongModal').style.display = 'flex';
};

// Fecha modal de seleção de ONG
function closeOngModal() {
  document.getElementById('ongModal').style.display = 'none';
}


//função de atualização para o Campo Minado
window.updateMinesOngCard = function() {
    if (!window.selectedOng) return;
    const card = document.querySelector(`#ongModal .ong-card[data-ong="${window.selectedOng}"]`);
    if (!card) return;

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