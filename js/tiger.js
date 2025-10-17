// ===== FORTUNE TIGER GAME  =====

// --- GAME STATE ---
let tigerBalance = 1000;
let tigerBet = 50;
let isSpinning = false;
const symbols = ["🐯", "💰", "💎", "🍊", "🎁", "🧧", "🏮"];

// --- DOM ELEMENTS ---
const tigerModal = document.getElementById('tigerModal');
const spinButton = document.getElementById('tiger-spin-btn');
const tigerResultEl = document.getElementById('tiger-result');
const tigerBalanceEl = document.getElementById('tiger-balance');

// --- CORE FUNCTIONS ---

function playTiger() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }
  if (tigerModal) {
    resetTigerModal();
    tigerModal.style.display = 'flex';
  }
}

function resetTigerModal() {
  tigerBalance = 1000;
  tigerBet = 50;
  isSpinning = false;
  window.selectedOng = null;

  if (tigerBalanceEl) tigerBalanceEl.textContent = tigerBalance.toFixed(2);
  document.getElementById('tiger-bet-input').value = tigerBet;
  if (tigerResultEl) tigerResultEl.textContent = "Escolha sua ONG e aposte!";
  document.getElementById('selectedOngCardTiger').style.display = 'none';
  if (spinButton) spinButton.disabled = true;

  // Reseta a aparência inicial dos rolos
  document.querySelectorAll('.tiger-reel').forEach(reel => {
    reel.innerHTML = '<div class="tiger-reel-symbol">🐯</div>';
  });
}

window.updateTigerOngCard = function() {
  if (!window.selectedOng) return;
  const card = document.querySelector(`#ongModal .ong-card[data-ong="${window.selectedOng}"]`);
  if (!card) return;

  const tag = card.querySelector('.ong-tag').textContent;
  const name = card.querySelector('h3').textContent;
  const desc = card.querySelector('p').textContent;

  document.getElementById('selectedOngTagTiger').textContent = tag;
  document.getElementById('selectedOngNameTiger').textContent = name;
  document.getElementById('selectedOngDescTiger').textContent = desc;
  document.getElementById('selectedOngCardTiger').style.display = 'block';

  if (spinButton) spinButton.disabled = false;
};

// Lógica de animação de rolagem aprimorada
function spinReel(reelElement, delay) {
  return new Promise(resolve => {
    // Cria a tira de símbolos para a animação
    const strip = document.createElement('div');
    strip.className = 'tiger-reel-strip';

    const repeatedSymbols = [...symbols, ...symbols, ...symbols, ...symbols, ...symbols]; // 5x para uma rolagem longa
    repeatedSymbols.forEach(symbol => {
      const div = document.createElement('div');
      div.className = 'tiger-reel-symbol';
      div.textContent = symbol;
      strip.appendChild(div);
    });
    reelElement.innerHTML = '';
    reelElement.appendChild(strip);

    // Define a posição final aleatória
    const finalSymbolIndex = Math.floor(Math.random() * symbols.length);
    const symbolHeight = 90; // Corresponde à altura do .tiger-reel e .tiger-reel-symbol
    const totalScrollHeight = (symbols.length * 4 * symbolHeight) + (finalSymbolIndex * symbolHeight);

    // Força um reflow para garantir que a transição seja aplicada
    reelElement.offsetHeight;

    // Aplica a transição com um pequeno delay para cada rolo
    setTimeout(() => {
      strip.style.transition = `transform 2.5s cubic-bezier(0.23, 1, 0.32, 1)`; // Efeito de "ease-out"
      strip.style.transform = `translateY(-${totalScrollHeight}px)`;
    }, delay);

    // Após a animação, reseta a posição para evitar overflow infinito
    setTimeout(() => {
      strip.style.transition = 'none';
      strip.style.transform = `translateY(-${finalSymbolIndex * symbolHeight}px)`;
      resolve(symbols[finalSymbolIndex]);
    }, 2500 + delay + 100); // Duração da animação + delay + buffer
  });
}

async function startSpin() {
  if (isSpinning) return;
  if (!window.selectedOng) {
    alert("Por favor, selecione uma ONG antes de jogar!");
    return;
  }
  if (tigerBalance < tigerBet) {
    alert("Saldo insuficiente!");
    return;
  }

  isSpinning = true;
  spinButton.disabled = true;

  tigerBalance -= tigerBet;
  tigerBalanceEl.textContent = tigerBalance.toFixed(2);
  tigerResultEl.textContent = "Girando... 🍀";

  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
  ];

  const results = await Promise.all([
    spinReel(reels[0], 0),      // Rolo 1 começa imediatamente
    spinReel(reels[1], 200),   // Rolo 2 começa com um pequeno atraso
    spinReel(reels[2], 400)    // Rolo 3 começa por último
  ]);

  const prizeMultiplier = calculatePrize(results);
  const winnings = tigerBet * prizeMultiplier;
  tigerBalance += winnings;

  let message = "";
  if (prizeMultiplier === 10) message = "🎉 JACKPOT! 3 iguais (x10)";
  else if (prizeMultiplier === 2) message = "✨ 2 iguais (x2)";
  else message = "😢 Nenhum prêmio";

  tigerResultEl.textContent = `${message} | +R$ ${winnings.toFixed(2)}`;
  tigerBalanceEl.textContent = tigerBalance.toFixed(2);

  // Lógica de reset automático após 6 segundos
  setTimeout(() => {
    if (!isSpinning) return; // Evita reset se o usuário já girou de novo
    tigerResultEl.textContent = "Pronto para a próxima rodada!";
    isSpinning = false;
    spinButton.disabled = false;
  }, 6000);
}

function calculatePrize(symbols) {
  const [a, b, c] = symbols;
  if (a === b && b === c) return 10;
  if (a === b || b === c || a === c) return 2;
  return 0;
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  const playButtons = document.querySelectorAll('.game-play-tiger-fortune');
  playButtons.forEach(button => {
    button.addEventListener('click', playTiger);
  });


  if (spinButton) spinButton.addEventListener('click', startSpin);

  const chooseOngButton = document.getElementById('chooseOngBtnTiger');
  if (chooseOngButton) {
    chooseOngButton.addEventListener('click', () => {
      const ongModal = document.getElementById('ongModal');
      if (ongModal) ongModal.style.display = 'flex';
    });
  }

  const betInput = document.getElementById('tiger-bet-input');
  const betMinus = document.getElementById('tiger-bet-minus');
  const betPlus = document.getElementById('tiger-bet-plus');

  function updateBet(value) {
    let newBet = Math.max(1, value);
    tigerBet = newBet;
    betInput.value = newBet;
  }

  if (betInput) betInput.addEventListener('change', () => updateBet(parseFloat(betInput.value)));
  if (betMinus) betMinus.addEventListener('click', () => updateBet(tigerBet - 10));
  if (betPlus) betPlus.addEventListener('click', () => updateBet(tigerBet + 10));
});