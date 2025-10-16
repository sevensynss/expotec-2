// ===== BLACKJACK (modal) =====
let bjDeck = [];
let bjPlayer = [];
let bjDealer = [];
let bjRoundActive = false;
let bjFirstAction = true;
let bjBet = 100;

const BJ_SUITS = ["♠","♥","♦","♣"];
const BJ_VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

// Função auxiliar para buscar elementos dentro do modal do Blackjack
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
    const display = bjEl('bj-bet-display');
    if(display) display.textContent = String(bjBet);
}

function resetBlackjackModal() {
  bjDeck = bjCreateDeck();
  bjPlayer = [];
  bjDealer = [];
  bjRoundActive = false;
  bjFirstAction = true;

  // Reseta a aposta para o valor padrão do input
  const input = bjEl('bj-bet-input');
  if (input) input.value = '100';
  bjBet = 100;
  bjUpdateBetDisplays();

  // Reseta a ONG selecionada
  window.selectedOng = null;
  const ongCard = document.getElementById('selectedOngCardBlackjack');
  if (ongCard) ongCard.style.display = 'none';

  // Reseta os botões
  bjEl('bjStartBtn')?.removeAttribute('disabled');
  bjEl('bjHitBtn')?.setAttribute('disabled', 'true');
  bjEl('bjStandBtn')?.setAttribute('disabled', 'true');
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true');

  // Reseta a mensagem e renderiza o estado inicial
  bjSetMessage('Comece uma rodada!');
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
    if (typeof openLoginModal === 'function') openLoginModal();
    return;
  }
  openBlackjackModal();
};
window.closeBlackjackModal = closeBlackjackModal;

function bjDealInitial() {
  bjPlayer.push(bjDeck.pop());
  bjDealer.push(bjDeck.pop());
  bjPlayer.push(bjDeck.pop());
  bjDealer.push(bjDeck.pop());
}

function bjStart() {
  if (!window.selectedOng) { bjSetMessage('Escolha uma ONG antes de jogar!'); return; }
  const v = parseFloat(bjEl('bj-bet-input')?.value || bjBet);
  if (isNaN(v) || v < 1) { bjSetMessage('Digite um valor de aposta válido!'); return; }
  if (v > userBalance) { bjSetMessage('Saldo insuficiente!'); return; }
  bjBet = Math.floor(v);
  bjUpdateBetDisplays();

  userBalance -= bjBet;
  if(typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();

  bjRoundActive = true;
  bjFirstAction = true;

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

  const p = bjHandValue(bjPlayer);
  const d = bjHandValue(bjDealer);
  if (p === 21) {
    bjFirstAction = false;
    bjRender();
    if (d === 21) {
      userBalance += bjBet;
      bjSetMessage('Empate: Blackjack para ambos.');
    } else {
      userBalance += Math.floor(bjBet * 2.5);
      bjSetMessage('Blackjack! Você venceu (3:2).');
    }
    if(typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();
    bjEndRound();
  } else {
    bjSetMessage('Sua vez: Peça, Pare ou Dobre.');
  }
}

function bjHit() {
  if (!bjRoundActive) return;
  bjPlayer.push(bjDeck.pop());
  bjFirstAction = false;
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true');
  bjRender();
  const p = bjHandValue(bjPlayer);
  if (p > 21) {
    bjSetMessage(`Você estourou com ${p}.`);
    bjEndRound();
  }
}

function bjStand() {
  if (!bjRoundActive) return;
  bjFirstAction = false;
  while (bjHandValue(bjDealer) < 17) {
    bjDealer.push(bjDeck.pop());
  }
  bjRender();

  const p = bjHandValue(bjPlayer);
  const d = bjHandValue(bjDealer);

  if (d > 21 || p > d) {
    userBalance += bjBet * 2;
    bjSetMessage(`Você venceu! (+R$ ${bjBet.toFixed(2)})`);
  } else if (p === d) {
    userBalance += bjBet;
    bjSetMessage('Empate. Aposta devolvida.');
  } else {
    bjSetMessage(`Dealer ${d} vs Você ${p}. Você perdeu.`);
  }
  if(typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();
  bjEndRound();
}

function bjDouble() {
  if (!bjRoundActive || !bjFirstAction) return;
  if (userBalance < bjBet) {
    bjSetMessage('Saldo insuficiente para dobrar.');
    return;
  }
  userBalance -= bjBet;
  bjBet *= 2;
  if(typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();
  bjUpdateBetDisplays();

  bjPlayer.push(bjDeck.pop());
  bjFirstAction = false;
  bjRender();
  const p = bjHandValue(bjPlayer);
  if (p > 21) {
    bjSetMessage(`Você estourou com ${p}.`);
    bjEndRound();
    return;
  }

  while (bjHandValue(bjDealer) < 17) {
    bjDealer.push(bjDeck.pop());
  }
  bjRender();
  const d = bjHandValue(bjDealer);
  if (d > 21 || p > d) {
    userBalance += bjBet * 2;
    bjSetMessage(`Você venceu dobrado! (+R$ ${bjBet.toFixed(2)})`);
  } else if (p === d) {
    userBalance += bjBet;
    bjSetMessage('Empate. Aposta devolvida.');
  } else {
    bjSetMessage(`Dealer ${d} vs Você ${p}. Você perdeu.`);
  }
  if(typeof window.updateBalanceInfo === 'function') window.updateBalanceInfo();
  bjEndRound();
}

function bjEndRound() {
  bjRoundActive = false;
  bjEl('bjHitBtn')?.setAttribute('disabled', 'true');
  bjEl('bjStandBtn')?.setAttribute('disabled', 'true');
  bjEl('bjDoubleBtn')?.setAttribute('disabled', 'true');
  setTimeout(() => {
    bjEl('bjStartBtn')?.removeAttribute('disabled');
    bjSetMessage('Pronto para a próxima rodada.');
  }, 6000);
}

// Liga botões e inicializa o jogo
(function initBlackjackUI() {
    const modal = document.getElementById('blackjackModal');
    if (!modal) return;

    // Ações do jogo
    bjEl('bjStartBtn')?.addEventListener('click', bjStart);
    bjEl('bjHitBtn')?.addEventListener('click', bjHit);
    bjEl('bjStandBtn')?.addEventListener('click', bjStand);
    bjEl('bjDoubleBtn')?.addEventListener('click', bjDouble);

    // Controles de aposta
    const bjBetInput = bjEl('bj-bet-input');
    if (bjBetInput) {
        bjBetInput.addEventListener('input', (e) => {
            if(typeof sanitizeBetInput === 'function') sanitizeBetInput(e.target);
            bjBet = parseFloat(e.target.value) || 100;
            bjUpdateBetDisplays();
        });
    }
    bjEl('bj-bet-minus')?.addEventListener('click', () => {
        const currentVal = parseFloat(bjBetInput.value) || 0;
        bjBetInput.value = Math.max(1, currentVal - 10);
        bjBetInput.dispatchEvent(new Event('input'));
    });
    bjEl('bj-bet-plus')?.addEventListener('click', () => {
        const currentVal = parseFloat(bjBetInput.value) || 0;
        bjBetInput.value = currentVal + 10;
        bjBetInput.dispatchEvent(new Event('input'));
    });

    // Botão de escolher ONG
    bjEl('chooseOngBtnBlackjack')?.addEventListener('click', () => {
        const ongModal = document.getElementById('ongModal');
        if (ongModal) ongModal.style.display = 'flex';
    });

    // Botões "Jogar" nos cards da página principal
    document.querySelectorAll('#game-play-blackjack').forEach((btn) => {
        btn.addEventListener('click', playBlackjack);
    });

    // Inicializa estado visual
    resetBlackjackModal();
})();

// Função para o sistema global de ONG atualizar o card do Blackjack
window.updateBlackjackOngCard = function() {
    const wrap = document.getElementById('selectedOngCardBlackjack');
    if (!wrap) return;
    if (!window.selectedOng) {
        wrap.style.display = 'none';
        return;
    }
    const card = document.querySelector(`#ongModal .ong-card[data-ong="${window.selectedOng}"]`);
    if (!card) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';
    document.getElementById('selectedOngTagBlackjack').textContent = card.querySelector('.ong-tag')?.textContent || '';
    document.getElementById('selectedOngNameBlackjack').textContent = card.querySelector('h3')?.textContent || '';
    document.getElementById('selectedOngDescBlackjack').textContent = card.querySelector('p')?.textContent || '';
};


