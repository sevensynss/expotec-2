// 🎯 Elementos do DOM
const canvas = document.getElementById("aviator-grafico");
const ctx = canvas.getContext("2d");
const aviao = document.getElementById("aviator-aviao");
const multiplicadorEl = document.getElementById("aviator-multiplicador-atual");
const multiplicadorBg = document.getElementById("aviator-multiplicador-fundo");
const resultadoFinal = document.getElementById("aviator-resultado-final");
const iniciarBtn = document.getElementById("aviator-iniciar");
const saldoEl = document.getElementById("aviator-saldo-valor");
const historicoEl = document.getElementById("aviator-multiplicadores");
const escolherOngBtn = document.getElementById("aviator-choose-ong-btn");

// 💰 Estado financeiro
let saldo = 1000;
let apostas = {
  1: { valor: 0, ativo: false, multiplicador: null },
  2: { valor: 0, ativo: false, multiplicador: null }
};

// 🏷️ ONG selecionada
let ongSelecionada = null;

// 🕹️ Estado do jogo
let state = "waiting";
let startMs = 0;
let crashPoint = 0;
let rodadaEncerrada = false;
let multiplicadorCongelado = null;

// ✈️ Avião e animação
let airplane = { x: 0, y: 260 };
let path = [];
let particulas = [];
let t = 0;
let floatingX = null;
let floatingTime = 0; // ⬅️ controla a flutuação no topo
let crashAlpha = 1;
let crashFallSpeed = 0;
let lastTime = performance.now();
let resetTimer = 0;
let aviaoPathIndex = 0;
let aviaoOffsetX = 0;
let aviaoParado = false;

function atualizarSaldo() {
  saldoEl.textContent = saldo.toFixed(2);
}

function mostrarAviso(msg) {
  const aviso = document.createElement("div");
  aviso.className = "aviator-ganho-aviso";
  aviso.textContent = msg;
  document.querySelector(".aviator-grafico-container").appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
}

function adicionarHistorico(valor) {
  const span = document.createElement("span");
  span.textContent = `${valor.toFixed(2)}x`;
  span.style.color =
    valor < 2 ? "#00cfff" :
      valor < 10 ? "#b300ff" :
        valor < 100 ? "#ff00cc" : "#ff4444";
  historicoEl.prepend(span);
}

const ongModalAviator = document.getElementById("aviatorOngModal");
const selectedOngCardAviator = document.getElementById("selectedOngCardAviator");
const selectedOngTagAviator = document.getElementById("selectedOngTagAviator");
const selectedOngNameAviator = document.getElementById("selectedOngNameAviator");

function openAviatorOngModal() {
  ongModalAviator.style.display = "flex";
}

function closeAviatorOngModal() {
  ongModalAviator.style.display = "none";
}

function selectOngForAviator(num) {
  const card = document.querySelector(`#aviatorOngModal .ong-card-aviator[data-ong="${num}"]`);
  const nome = card.querySelector("h3").textContent;
  const tag = card.querySelector(".ong-tag-aviator").textContent;

  ongSelecionada = nome;
  selectedOngTagAviator.textContent = tag;
  selectedOngNameAviator.textContent = nome;
  selectedOngCardAviator.style.display = "block";

  closeAviatorOngModal();
}

escolherOngBtn.addEventListener("click", openAviatorOngModal);

document.querySelectorAll(".aviator-aposta-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    const input = document.getElementById(`aviator-valor${id}`);
    const valor = parseFloat(input.value);

    if (!ongSelecionada) {
      mostrarAviso("⚠️ Escolha uma ONG antes de apostar.");
      return;
    }

    if (!apostas[id] || !apostas[id].ativo) {
      if (state !== "waiting" || isNaN(valor) || valor <= 0 || valor > saldo) return;

      saldo -= valor;
      atualizarSaldo();
      apostas[id] = { valor, multiplicador: null, ativo: true };

      btn.textContent = "Retirar";
      btn.classList.add("selecionado");

      document.querySelectorAll(`.aviator-prevalor[data-id="${id}"], .aviator-ajuste-valor[data-id="${id}"]`).forEach(b => b.disabled = true);

      iniciarBtn.disabled = false;
      iniciarBtn.classList.add("pronto");
    } else if (state === "waiting") {
      saldo += apostas[id].valor;
      atualizarSaldo();
      apostas[id].ativo = false;
      apostas[id].multiplicador = null;

      btn.textContent = "Apostar";
      btn.classList.remove("selecionado");

      document.querySelectorAll(`.aviator-prevalor[data-id="${id}"], .aviator-ajuste-valor[data-id="${id}"]`).forEach(b => b.disabled = false);

      mostrarAviso("Aposta cancelada");
    } else if (!rodadaEncerrada) {
      const multiplicadorAtual = parseFloat(multiplicadorEl.textContent);
      const ganho = apostas[id].valor * multiplicadorAtual;
      saldo += ganho;
      atualizarSaldo();
      apostas[id].ativo = false;
      apostas[id].multiplicador = multiplicadorAtual;

      btn.textContent = "Apostar";
      btn.classList.remove("selecionado");

      mostrarAviso(`💰 Ganhou R$${ganho.toFixed(2)}!`);
    }
  });
});

document.querySelectorAll(".aviator-prevalor").forEach(btn => {
  btn.addEventListener("click", e => {
    if (state !== "waiting") return;
    const valor = parseFloat(e.target.dataset.valor).toFixed(2);
    const id = e.target.dataset.id;
    const input = document.getElementById(`aviator-valor${id}`);
    if (input) input.value = valor;

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
    if (input) {
      let atual = parseFloat(input.value) || 0;
      atual = Math.max(0, atual + delta);
      input.value = atual.toFixed(2);
      document.querySelectorAll(`.aviator-prevalor[data-id="${id}"]`).forEach(b => b.classList.remove("selecionado"));
    }
  });
});

function gerarCrash() {
  const r = Math.random();
  if (r < 0.5) return +(Math.random() * 0.5 + 1).toFixed(2);
  if (r < 0.8) return +(Math.random() * 1 + 1.5).toFixed(2);
  if (r < 0.95) return +(Math.random() * 3 + 2.5).toFixed(2);
  if (r < 0.995) return +(Math.random() * 10 + 5.5).toFixed(2);
  return +(Math.random() * 1000 + 15.5).toFixed(2);
}

function iniciarRodada() {
  const temApostaAtiva = Object.values(apostas).some(a => a.ativo);
  if (!temApostaAtiva) {
    mostrarAviso("⚠️ Nenhuma aposta ativa");
    return;
  }

  iniciarBtn.disabled = true;
  iniciarBtn.classList.remove("pronto");
  resultadoFinal.textContent = "";
  resultadoFinal.style.opacity = "0";
  resultadoFinal.style.transform = "scale(0.8)";
  resultadoFinal.style.transition = "none";

  startMs = performance.now();
  crashPoint = gerarCrash();
  state = "rising";
  rodadaEncerrada = false;
  multiplicadorCongelado = null;
  floatingX = null;
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

function update(dt, nowMs) {
  if (state === "waiting") return;

  const ms = nowMs - startMs;
  const multiplicador = (100 * Math.exp(0.000083 * ms)) / 100;
  multiplicadorEl.textContent = `${rodadaEncerrada ? multiplicadorCongelado.toFixed(2) : multiplicador.toFixed(2)}x`;

  // Estilo dinâmico do multiplicador
  if (!rodadaEncerrada) {
    let cor, sombra, fundo;
    if (multiplicador < 2) {
      cor = "#00cfff"; sombra = "0 0 20px rgba(0,255,242,.5)"; fundo = "rgba(0,255,242,.5)";
    } else if (multiplicador < 10) {
      cor = "#b300ff"; sombra = "0 0 20px rgba(179,0,255,.5)"; fundo = "rgba(179,0,255,.5)";
    } else {
      cor = "#ff00cc"; sombra = "0 0 20px rgba(255,0,204,.6)"; fundo = "rgba(255,0,204,.6)";
    }
    multiplicadorEl.style.color = cor;
    multiplicadorEl.style.textShadow = `0 0 10px ${cor}`;
    multiplicadorEl.style.boxShadow = sombra;
    multiplicadorBg.style.backgroundColor = fundo;
  }

  const aviaoWidth = aviao.offsetWidth || 80;
  const limiteFinalX = canvas.width - aviaoWidth - 10;

  // Subida
  if (state === "rising") {
    t += dt;
    const m = Math.exp(t * 0.55) - 1;
    const rise = Math.min(m * 55, 260 - 80);
    let nextX = (path.length > 0 ? path[path.length - 1].x : 0) + 200 * dt;
    let nextY = 260 - rise;

    if (path.length === 0) {
      aviaoOffsetX = nextX - aviaoWidth / 2;
      aviaoPathIndex = 0; // inicia imediatamente
    }

    if (nextX >= limiteFinalX) {
      nextX = limiteFinalX;
      state = "floating";
    }

    if (path.length === 0 || path[path.length - 1].x < limiteFinalX) {
      path.push({ x: nextX, y: nextY });
    }

    if (!aviaoParado && nextX >= limiteFinalX) {
      aviaoParado = true;
      aviaoPathIndex = path.length - 1;
    }

    particulas.push({
      x: nextX - 20,
      y: nextY + 40,
      alpha: 1,
      speedY: Math.random() * 10 + 5,
      speedX: Math.random() * 30 + 10,
      size: Math.random() * 2 + 1
    });
  }

  // Flutuação
  if (state === "floating") {
    floatingTime += dt;
    let fx = limiteFinalX; // Sempre no limite direito
    let fy = 86 + Math.sin(floatingTime * 6) * 2;

    path.push({ x: fx, y: fy });

    particulas.push({
      x: fx - 50,
      y: fy + 40,
      alpha: 1,
      speedY: Math.random() * 20 + 10,
      speedX: 0,
      size: Math.random() * 3 + 1
    });
  }

  // Avanço do avião até o ponto de parada
  if (!aviaoParado && aviaoPathIndex < path.length - 1) {
    aviaoPathIndex++;
  }


  // Partículas
  particulas.forEach(p => {
    p.y -= p.speedY * dt;
    p.x += p.speedX * dt;
    p.alpha -= dt * 0.5;
  });
  particulas = particulas.filter(p => p.alpha > 0 && p.x > 0 && p.x < canvas.width && p.y > 0 && p.y < canvas.height);

  if (!rodadaEncerrada && multiplicador >= crashPoint) {
    rodadaEncerrada = true;
    multiplicadorCongelado = crashPoint;
    multiplicadorEl.textContent = `${crashPoint.toFixed(2)}x`;
    resultadoFinal.textContent = "O Avião Caiu 💥";
    resultadoFinal.style.opacity = "1";
    resultadoFinal.style.transform = "scale(1)";
    resultadoFinal.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    adicionarHistorico(crashPoint);

    // Troca o estado para "crashing" para animar a queda
    state = "crashing";
    crashAlpha = 1;
    crashFallSpeed = 0;
    // Pega a posição final do path para iniciar a queda
    if (path.length > 0) {
      airplane.y = path[path.length - 1].y;
    }
  } else if (state === "crashing") {
    crashFallSpeed += 1800 * dt;
    airplane.y = Math.min(airplane.y + (300 + crashFallSpeed) * dt, 260);
    crashAlpha = Math.max(crashAlpha - dt * 1.2, 0.3);

    aviao.style.transform = `rotate(45deg) scale(${crashAlpha})`;
    aviao.style.opacity = crashAlpha;

    if (airplane.y >= 260 || crashAlpha <= 0.3) {
      state = "waiting-bottom";
      resetTimer = nowMs;
    }
  }

  if (state === "waiting-bottom") {
    if (nowMs - resetTimer > 900) {
      resetAll();
    }
  }
}


function drawPath() {
  if (path.length < 2) return;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255, 50, 50, 0.8)";
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.strokeStyle = "rgba(255, 80, 80, 1)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.strokeStyle = "rgba(255, 180, 180, 0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

function render() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fumaça
  particulas.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.fill();
  });

  // Trilha
  drawPath();

  // Avião seguindo o path
  if (path.length > 0) {
    const ponto = path[Math.min(aviaoPathIndex, path.length - 1)];
    const aviaoWidth = aviao.offsetWidth || 80;
    const aviaoHeight = aviao.offsetHeight || 40;

    const limiteFinalX = canvas.width - aviaoWidth - 10;
    const x = Math.min(ponto.x, limiteFinalX);
    const posX = x - aviaoWidth / 2;

    aviao.style.left = `${Math.max(0, posX - ponto.y)}px`;
    aviao.style.top = `${ponto.y - aviaoHeight * 0.4}px`;
  }
}


function resetAll() {
  state = "waiting";
  rodadaEncerrada = false;
  multiplicadorCongelado = null;
  multiplicadorEl.textContent = "1.00x";
  resultadoFinal.textContent = "";
  resultadoFinal.style.opacity = "0";
  resultadoFinal.style.transform = "scale(0.8)";
  resultadoFinal.style.transition = "opacity 0.4s ease, transform 0.4s ease";

  multiplicadorEl.style.color = "#ffffff";
  multiplicadorEl.style.textShadow = "0 0 10px rgba(255,255,255,0.6)";
  multiplicadorEl.style.boxShadow = "0 0 20px rgba(255,255,255,0.2)";
  multiplicadorBg.style.backgroundColor = "rgba(255,255,255,0.2)";

  particulas = [];
  airplane.x = 0;
  airplane.y = 260;
  path = [];
  t = 0;
  aviaoPathIndex = 0;

  aviao.style.top = `260px`;
  aviao.style.left = `0px`;
  aviao.style.transform = "rotate(0deg) scale(1)";
  aviao.style.opacity = 1;

  document.querySelectorAll(".aviator-aposta-btn").forEach(btn => {
    btn.textContent = "Apostar";
    btn.classList.remove("selecionado");
  });

  Object.entries(apostas).forEach(([id, aposta]) => {
    aposta.ativo = false;
    aposta.multiplicador = null;
  });

  iniciarBtn.disabled = true;
  iniciarBtn.classList.remove("pronto");

  document.querySelectorAll(".aviator-prevalor, .aviator-ajuste-valor").forEach(btn => {
    btn.disabled = false;
  });
}

function loop(nowMs) {
  const dt = Math.min(0.05, (nowMs - lastTime) / 1000);
  lastTime = nowMs;
  update(dt, nowMs);
  render();
  requestAnimationFrame(loop);
}

// Abrir e fechar modal do Aviator
document.addEventListener("DOMContentLoaded", () => {
  const aviatorModal = document.getElementById("aviatorModal");
  const aviatorBtn = document.getElementById("game-play-aviator");
  const aviatorClose = document.querySelector(".aviator-close");

  if (aviatorBtn && aviatorModal) {
    aviatorBtn.addEventListener("click", () => {
      aviatorModal.style.display = "flex";
      resetAll();
    });
  }

  if (aviatorClose) {
    aviatorClose.addEventListener("click", () => {
      aviatorModal.style.display = "none";
      resetAll();
    });
  }

  window.addEventListener("click", e => {
    if (e.target === aviatorModal) {
      aviatorModal.style.display = "none";
      resetAll();
    }
  });

  // Inicialização do jogo Aviator
  atualizarSaldo();
  resetAll();
  requestAnimationFrame(loop);
});

iniciarBtn.addEventListener("click", () => {
  if (!ongSelecionada) {
    mostrarAviso("⚠️ Escolha uma ONG antes de iniciar a rodada.");
    return;
  }
  iniciarRodada();
});

document.querySelectorAll(".game-play-aviator").forEach(btn => {
  btn.addEventListener("click", () => {
    const aviatorModal = document.getElementById("aviatorModal");
    aviatorModal.style.display = "flex";
    resetAll();
  });
});