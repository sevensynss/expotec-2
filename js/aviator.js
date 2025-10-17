// ===================================================================
// ==               AVIATOR GAME SCRIPT (SELF-CONTAINED)          ==
// ===================================================================

// --- 🎯 DOM ELEMENTS ---
const aviatorModal = document.getElementById("aviatorModal");
const canvas = document.getElementById("aviator-grafico");
const ctx = canvas.getContext("2d");
const aviao = document.getElementById("aviator-aviao");
const multiplicadorEl = document.getElementById("aviator-multiplicador-atual");
const multiplicadorBg = document.getElementById("aviator-multiplicador-fundo");
const resultadoFinal = document.getElementById("aviator-resultado-final");
const iniciarBtn = document.getElementById("aviator-iniciar");
const saldoEl = document.getElementById("aviator-saldo-valor");
const historicoEl = document.getElementById("aviator-multiplicadores");

// --- Elementos do Modal de ONG (Específico do Aviator) ---
const escolherOngBtn = document.getElementById("aviator-choose-ong-btn");
const ongModalAviator = document.getElementById("aviatorOngModal");
const selectedOngCardAviator = document.getElementById("selectedOngCardAviator");
const selectedOngTagAviator = document.getElementById("selectedOngTagAviator");
const selectedOngNameAviator = document.getElementById("selectedOngNameAviator");

// --- 💰 GAME STATE & FINANCE ---
let saldo = 1000;
let apostas = {
  1: { valor: 0, ativo: false, multiplicador: null },
  2: { valor: 0, ativo: false, multiplicador: null }
};
let ongSelecionada = null; // Estado da ONG, local para o Aviator

// --- 🕹️ GAME LOGIC STATE ---
let state = "waiting";
let startMs = 0;
let crashPoint = 0;
let rodadaEncerrada = false;
let multiplicadorCongelado = null;

// --- ✈️ ANIMATION STATE ---
let airplane = { x: 0, y: 260 };
let path = [];
let particulas = [];
let t = 0;
let floatingTime = 0;
let crashAlpha = 1;
let crashFallSpeed = 0;
let lastTime = performance.now();
let resetTimer = 0;
let aviaoPathIndex = 0;

// ===================================================================
// ==                      CORE FUNCTIONS                         ==
// ===================================================================

/**
 * Abre o modal do Aviator, verificando o login do usuário primeiro.
 */
function playAviator() {
  const token = localStorage.getItem('token');
  if (!token) {
    // Chama a função de login global, se existir
    if (typeof openLoginModal === 'function') {
      openLoginModal();
    }
    return; // Impede a abertura do jogo
  }

  // Se logado, abre o modal do Aviator
  if (aviatorModal) {
    aviatorModal.style.display = "flex";
    resetAll(); // Garante que o jogo esteja limpo ao abrir
  }
}

/**
 * Reseta completamente o estado do jogo para uma nova sessão.
 * Chamado ao abrir/fechar o modal ou após o fim de uma rodada.
 */
function resetAll() {
  state = "waiting";
  rodadaEncerrada = false;
  multiplicadorCongelado = null;
  multiplicadorEl.textContent = "1.00x";
  resultadoFinal.textContent = "";
  resultadoFinal.style.opacity = "0";
  multiplicadorEl.style.color = "#ffffff";
  multiplicadorBg.style.backgroundColor = "rgba(255,255,255,0.2)";

  particulas = [];
  path = [];
  t = 0;
  aviaoPathIndex = 0;
  aviao.style.top = `260px`;
  aviao.style.left = `0px`;
  aviao.style.transform = "rotate(0deg) scale(1)";
  aviao.style.opacity = 1;

  // Reseta as apostas
  document.querySelectorAll(".aviator-aposta-btn").forEach(btn => {
    btn.textContent = "Apostar";
    btn.classList.remove("selecionado");
  });
  Object.values(apostas).forEach(aposta => {
    aposta.ativo = false;
    aposta.multiplicador = null;
  });
  document.querySelectorAll('.aviator-valor-aposta').forEach(input => input.value = "1.00");
  document.querySelectorAll('.aviator-prevalor, .aviator-ajuste-valor').forEach(btn => btn.disabled = false);

  // Reseta a ONG
  ongSelecionada = null;
  if (selectedOngCardAviator) selectedOngCardAviator.style.display = "none";

  // Reseta o botão de iniciar
  iniciarBtn.disabled = true;
  iniciarBtn.classList.remove("pronto");
}

// ===================================================================
// ==                  ONG MODAL FUNCTIONS (LOCAL)                ==
// ===================================================================

function openAviatorOngModal() {
  if (ongModalAviator) ongModalAviator.style.display = "flex";
}

function closeAviatorOngModal() {
  if (ongModalAviator) ongModalAviator.style.display = "none";
}

function selectOngForAviator(num) {
  // Procura o card correto dentro do modal de ONGs do Aviator
  const card = document.querySelector(`#aviatorOngModal .ong-card[data-ong="${num}"]`);
  if (!card) return;

  // Extrai as informações do card (que agora usa a estrutura padrão)
  const nome = card.querySelector("h3").textContent;
  const tag = card.querySelector(".ong-tag").textContent;

  ongSelecionada = nome; // Atualiza a variável de estado do Aviator

  // Atualiza o card de exibição DENTRO do modal do jogo Aviator
  if (selectedOngTagAviator) selectedOngTagAviator.textContent = tag;
  if (selectedOngNameAviator) selectedOngNameAviator.textContent = nome;
  if (selectedOngCardAviator) selectedOngCardAviator.style.display = "block";

  // Habilita os botões de aposta após a escolha
  document.querySelectorAll('.aviator-aposta-btn').forEach(btn => {
      btn.disabled = false;
  });
  if (iniciarBtn) iniciarBtn.disabled = false;

  closeAviatorOngModal();
}

// ===================================================================
// ==                  GAMEPLAY & UI FUNCTIONS                    ==
// ===================================================================

function atualizarSaldo() {
  if(saldoEl) saldoEl.textContent = saldo.toFixed(2);
}

function mostrarAviso(msg) {
  const container = document.querySelector(".aviator-grafico-container");
  if (!container) return;
  const aviso = document.createElement("div");
  aviso.className = "aviator-ganho-aviso";
  aviso.textContent = msg;
  container.appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
}

function adicionarHistorico(valor) {
  if (!historicoEl) return;
  const span = document.createElement("span");
  span.textContent = `${valor.toFixed(2)}x`;
  span.style.color = valor < 2 ? "#00cfff" : valor < 10 ? "#b300ff" : "#ff00cc";
  historicoEl.prepend(span);
  if (historicoEl.children.length > 20) {
    historicoEl.lastChild.remove();
  }
}

function gerarCrash() {
  const r = Math.random();
  if (r < 0.5) return +(Math.random() * 0.5 + 1).toFixed(2);
  if (r < 0.8) return +(Math.random() * 1 + 1.5).toFixed(2);
  if (r < 0.95) return +(Math.random() * 3 + 2.5).toFixed(2);
  return +(Math.random() * 1000 + 5.5).toFixed(2);
}

function iniciarRodada() {
  const temApostaAtiva = Object.values(apostas).some(a => a.ativo);
  if (!temApostaAtiva) {
    mostrarAviso("⚠️ Nenhuma aposta ativa");
    return;
  }
  if (!ongSelecionada) {
    mostrarAviso("⚠️ Escolha uma ONG antes de iniciar a rodada.");
    return;
  }

  iniciarBtn.disabled = true;
  iniciarBtn.classList.remove("pronto");
  resultadoFinal.textContent = "";
  resultadoFinal.style.opacity = "0";

  startMs = performance.now();
  crashPoint = gerarCrash();
  state = "rising";
  rodadaEncerrada = false;
  multiplicadorCongelado = null;
  floatingTime = 0;
  airplane.x = 0;
  airplane.y = 260;
  path = [];
  t = 0;
  aviaoPathIndex = 0;
  particulas = [];

  aviao.style.transform = "rotate(0deg) scale(1)";
  aviao.style.opacity = 1;
}

// ===================================================================
// ==                 ANIMATION & RENDER LOOP                     ==
// ===================================================================

function update(dt, nowMs) {
  if (state === "waiting") return;

  const ms = nowMs - startMs;
  const multiplicador = (100 * Math.exp(0.000083 * ms)) / 100;
  multiplicadorEl.textContent = `${rodadaEncerrada ? multiplicadorCongelado.toFixed(2) : multiplicador.toFixed(2)}x`;

  // ... (lógica de animação, subida, flutuação, queda, partículas) ...
  const aviaoWidth = aviao.offsetWidth || 80;
  const limiteFinalX = canvas.width - aviaoWidth - 10;
  if (state === "rising") { t += dt; const m = Math.exp(t * 0.55) - 1; const rise = Math.min(m * 55, 260 - 80); let nextX = (path.length > 0 ? path[path.length - 1].x : 0) + 200 * dt; let nextY = 260 - rise; if (nextX >= limiteFinalX) { nextX = limiteFinalX; state = "floating"; } if (path.length === 0 || path[path.length - 1].x < limiteFinalX) { path.push({ x: nextX, y: nextY }); } particulas.push({ x: nextX - 20, y: nextY + 40, alpha: 1, speedY: Math.random() * 10 + 5, speedX: Math.random() * 30 + 10, size: Math.random() * 2 + 1 }); }
  if (state === "floating") { floatingTime += dt; let fx = limiteFinalX; let fy = 86 + Math.sin(floatingTime * 6) * 2; path.push({ x: fx, y: fy }); particulas.push({ x: fx - 50, y: fy + 40, alpha: 1, speedY: Math.random() * 20 + 10, speedX: 0, size: Math.random() * 3 + 1 }); }
  if (aviaoPathIndex < path.length - 1) { aviaoPathIndex++; }
  particulas.forEach(p => { p.y -= p.speedY * dt; p.x += p.speedX * dt; p.alpha -= dt * 0.5; }); particulas = particulas.filter(p => p.alpha > 0);
  if (!rodadaEncerrada && multiplicador >= crashPoint) { rodadaEncerrada = true; multiplicadorCongelado = crashPoint; multiplicadorEl.textContent = `${crashPoint.toFixed(2)}x`; resultadoFinal.textContent = "O Avião Caiu 💥"; resultadoFinal.style.opacity = "1"; resultadoFinal.style.transform = "scale(1)"; adicionarHistorico(crashPoint); state = "crashing"; crashAlpha = 1; crashFallSpeed = 0; if (path.length > 0) { airplane.y = path[path.length - 1].y; } }
  else if (state === "crashing") { crashFallSpeed += 1800 * dt; airplane.y = Math.min(airplane.y + (300 + crashFallSpeed) * dt, 260); crashAlpha = Math.max(crashAlpha - dt * 1.2, 0.3); aviao.style.transform = `rotate(45deg) scale(${crashAlpha})`; aviao.style.opacity = crashAlpha; if (airplane.y >= 260 || crashAlpha <= 0.3) { state = "waiting-bottom"; resetTimer = nowMs; } }

  // Lógica de reset após o fim da rodada
  if (state === "waiting-bottom") {
    if (nowMs - resetTimer > 6000) { // Espera 6 segundos
      resetAll();
    }
  }
}

function drawPath() {
  if (path.length < 2) return;
  ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.shadowColor = "rgba(255, 50, 50, 0.8)"; ctx.shadowBlur = 18; ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y); for (let i = 1; i < path.length; i++) { ctx.lineTo(path[i].x, path[i].y); } ctx.strokeStyle = "rgba(255, 80, 80, 1)"; ctx.lineWidth = 3; ctx.stroke(); ctx.shadowBlur = 0; ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y); for (let i = 1; i < path.length; i++) { ctx.lineTo(path[i].x, path[i].y); } ctx.strokeStyle = "rgba(255, 180, 180, 0.6)"; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
}

function render() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particulas.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`; ctx.fill(); });
  drawPath();
  if (path.length > 0) { const ponto = path[Math.min(aviaoPathIndex, path.length - 1)]; const aviaoWidth = aviao.offsetWidth || 80; const aviaoHeight = aviao.offsetHeight || 40; const limiteFinalX = canvas.width - aviaoWidth - 10; const x = Math.min(ponto.x, limiteFinalX); const posX = x - aviaoWidth / 2; aviao.style.left = `${Math.max(0, posX - ponto.y)}px`; aviao.style.top = `${ponto.y - aviaoHeight * 0.4}px`; }
}

function loop(nowMs) {
  const dt = Math.min(0.05, (nowMs - lastTime) / 1000);
  lastTime = nowMs;
  update(dt, nowMs);
  render();
  requestAnimationFrame(loop);
}

// ===================================================================
// ==                      EVENT LISTENERS                        ==
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- Botões de abrir o jogo ---
  document.querySelectorAll("#game-play-aviator, .game-play-aviator").forEach(btn => {
    if (btn) btn.addEventListener("click", playAviator);
  });

  // --- Botões de fechar o modal (específico do Aviator) ---
  const aviatorCloseBtn = document.querySelector("#aviatorModal .aviator-close");
  if (aviatorCloseBtn) {
    aviatorCloseBtn.addEventListener("click", () => {
      if (aviatorModal) aviatorModal.style.display = "none";
      resetAll();
    });
  }
  window.addEventListener("click", e => {
    if (e.target === aviatorModal) {
      aviatorModal.style.display = "none";
      resetAll();
    }
  });

  // --- Botão de escolher ONG (específico do Aviator) ---
  if (escolherOngBtn) {
    escolherOngBtn.addEventListener("click", openAviatorOngModal);
  }
  const ongCloseBtn = document.querySelector("#aviatorOngModal .close");
  if (ongCloseBtn) ongCloseBtn.addEventListener("click", closeAviatorOngModal);
  window.addEventListener("click", e => {
    if (e.target === ongModalAviator) closeAviatorOngModal();
  });
  // Atribui a função de seleção aos cards de ONG do Aviator
  document.querySelectorAll('#aviatorOngModal .ong-card-aviator').forEach(card => {
    card.onclick = () => selectOngForAviator(card.dataset.ong);
  });

  // --- Botão de iniciar rodada ---
  if (iniciarBtn) {
    iniciarBtn.addEventListener("click", iniciarRodada);
  }

  // --- Lógica dos botões de aposta ---
  document.querySelectorAll(".aviator-aposta-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const input = document.getElementById(`aviator-valor${id}`);
      const valor = parseFloat(input.value);

      if (!ongSelecionada) {
        mostrarAviso("⚠️ Escolha uma ONG antes de apostar.");
        return;
      }

      if (!apostas[id] || !apostas[id].ativo) { // APOSTAR
        if (state !== "waiting" || isNaN(valor) || valor <= 0 || valor > saldo) return;
        saldo -= valor;
        atualizarSaldo();
        apostas[id] = { valor, multiplicador: null, ativo: true };
        btn.textContent = "Retirar";
        btn.classList.add("selecionado");
        document.querySelectorAll(`.aviator-prevalor[data-id="${id}"], .aviator-ajuste-valor[data-id="${id}"]`).forEach(b => b.disabled = true);
        iniciarBtn.disabled = false;
        iniciarBtn.classList.add("pronto");
      } else if (state === "waiting") { // CANCELAR
        saldo += apostas[id].valor;
        atualizarSaldo();
        apostas[id].ativo = false;
        btn.textContent = "Apostar";
        btn.classList.remove("selecionado");
        document.querySelectorAll(`.aviator-prevalor[data-id="${id}"], .aviator-ajuste-valor[data-id="${id}"]`).forEach(b => b.disabled = false);
        mostrarAviso("Aposta cancelada");
      } else if (!rodadaEncerrada) { // RETIRAR
        const multiplicadorAtual = parseFloat(multiplicadorEl.textContent);
        const ganho = apostas[id].valor * multiplicadorAtual;
        saldo += ganho;
        atualizarSaldo();
        apostas[id].ativo = false;
        btn.textContent = "Apostar";
        btn.classList.remove("selecionado");
        mostrarAviso(`💰 Ganhou R$${ganho.toFixed(2)}!`);
      }
    });
  });

  // --- Lógica dos botões de valor ---
  document.querySelectorAll(".aviator-prevalor").forEach(btn => {
    btn.addEventListener("click", e => {
      if (state !== "waiting") return;
      const valor = parseFloat(e.target.dataset.valor).toFixed(2);
      const id = e.target.dataset.id;
      document.getElementById(`aviator-valor${id}`).value = valor;
      document.querySelectorAll(`.aviator-prevalor[data-id="${id}"]`).forEach(b => b.classList.remove("selecionado"));
      e.target.classList.add("selecionado");
    });
  });
  document.querySelectorAll(".aviator-ajuste-valor").forEach(btn => {
    btn.addEventListener("click", e => {
      if (state !== "waiting") return;
      const id = e.target.dataset.id;
      const delta = parseFloat(e.target.dataset.delta);
      const input = document.getElementById(`aviator-valor${id}`);
      let atual = parseFloat(input.value) || 0;
      input.value = Math.max(1, atual + delta).toFixed(2);
      document.querySelectorAll(`.aviator-prevalor[data-id="${id}"]`).forEach(b => b.classList.remove("selecionado"));
    });
  });

  // --- Inicialização do jogo ---
  atualizarSaldo();
  resetAll();
  requestAnimationFrame(loop);
});