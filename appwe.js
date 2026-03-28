const PALETA_CORES = [
  "#dc2626", "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#4ade80",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

const timerDisplay = document.getElementById("timerDisplay");
const timerLabel = document.getElementById("timerLabel");
const ciclosSpan = document.getElementById("ciclosSpan");
const btnPlay = document.getElementById("btnPlay");
const btnPause = document.getElementById("btnPause");
const btnReset = document.getElementById("btnReset");
const notesArea = document.getElementById("notes");
const listaTarefasPendentes = document.getElementById("listaTarefasPendentes");
const listaTarefasConcluidas = document.getElementById("listaTarefasConcluidas");

const pomodorosHojeEl = document.getElementById("pomodorosHoje");
const minutosHojeEl = document.getElementById("minutosHoje");
const tarefasConcluidasEl = document.getElementById("tarefasConcluidas");
const streakDiasEl = document.getElementById("streakDias");
const streakMelhorEl = document.getElementById("streakMelhor");
const totalPomodorosEl = document.getElementById("totalPomodoros");
const totalMinutosEl = document.getElementById("totalMinutos");
const diasComPomodoroEl = document.getElementById("diasComPomodoro");

const backdropConfig = document.getElementById("backdropConfig");
const btnConfig = document.getElementById("btnConfig");
const btnFecharConfig = document.getElementById("btnFecharConfig");
const somFinalizacaoSelect = document.getElementById("somFinalizacao");
const notificacoesToggle = document.getElementById("notificacoesToggle");

const backdropStats = document.getElementById("backdropStats");
const btnStats = document.getElementById("btnStats");
const btnFecharStats = document.getElementById("btnFecharStats");

const backdropTarefaFixa = document.getElementById("backdropTarefaFixa");
const btnNovaTarefaFixa = document.getElementById("btnNovaTarefaFixa");
const criarTarefaFixaBtn = document.getElementById("criarTarefaFixa");
const cancelarTarefaFixaBtn = document.getElementById("cancelarTarefaFixa");
const tarefaFixaTituloInput = document.getElementById("tarefaFixaTitulo");
const tarefaFixaDuracaoInput = document.getElementById("tarefaFixaDuracao");

const backdropTarefaAvulsa = document.getElementById("backdropTarefaAvulsa");
const btnNovaTarefaAvulsa = document.getElementById("btnNovaTarefaAvulsa");
const criarTarefaAvulsaBtn = document.getElementById("criarTarefaAvulsa");
const cancelarTarefaAvulsaBtn = document.getElementById("cancelarTarefaAvulsa");
const tarefaAvulsaTituloInput = document.getElementById("tarefaAvulsaTitulo");

const backdropTarefaTime = document.getElementById("backdropTarefaTime");
const btnNovaTarefaTime = document.getElementById("btnNovaTarefaTime");
const criarTarefaTimeBtn = document.getElementById("criarTarefaTime");
const cancelarTarefaTimeBtn = document.getElementById("cancelarTarefaTime");
const tarefaTimeTituloInput = document.getElementById("tarefaTimeTitulo");
const tarefaTimeMinutosInput = document.getElementById("tarefaTimeMinutos");
const tarefaEmExecucaoDiv = document.getElementById("tarefaEmExecucao");
const tarefaEmExecucaoTitulo = document.getElementById("tarefaEmExecucaoTitulo");

let modo = "foco";
let cicloAtual = 0;
let tempoRestante = 20 * 60;
let intervalo = null;
let focoAtualMinutos = 20;
let tarefas = [];
let tarefaTimeAtual = null;
let ultimaVerificacaoData = new Date().toISOString().split("T")[0];
let audioContext = null;

const CONFIG_KEY = "pomodoro_config_v2";
const TAREFAS_KEY = "pomodoro_tarefas";
const NOTES_KEY = "pomodoro_notes";
const ULTIMA_DATA_KEY = "ultima_verificacao_data";

const estadoStats = {
  pomodorosHoje: 0,
  minutosHoje: 0,
  tarefasConcluidas: 0,
  streakDias: 0,
  streakMelhor: 0,
  totalPomodoros: 0,
  totalMinutos: 0,
  diasComPomodoro: 0
};

const config = {
  corFoco: "#dc2626",
  corDescansoCurto: "#10b981",
  corDescansoLongo: "#6366f1",
  corTarefaFixa: "#3b82f6",
  corTarefaAvulsa: "#8b5cf6",
  corTarefaTime: "#f59e0b",
  somFinalizacao: "beep",
  notificacoes: "off"
};

function carregarConfig() {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    aplicarConfigUI();
    salvarConfig();
    return;
  }

  try {
    const stored = JSON.parse(raw);
    Object.assign(config, stored);
  } catch (error) {
    console.error("Erro ao carregar config:", error);
  }

  aplicarConfigUI();
}

function salvarConfig() {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function aplicarConfigUI() {
  somFinalizacaoSelect.value = config.somFinalizacao || "beep";
  notificacoesToggle.value = config.notificacoes;

  renderizarPaleta("corFocoPalette", config.corFoco, "corFoco");
  renderizarPaleta("corDescansoCurtoPalette", config.corDescansoCurto, "corDescansoCurto");
  renderizarPaleta("corDescansoLongoPalette", config.corDescansoLongo, "corDescansoLongo");
  renderizarPaleta("corTarefaFixaPalette", config.corTarefaFixa, "corTarefaFixa");
  renderizarPaleta("corTarefaAvulsaPalette", config.corTarefaAvulsa, "corTarefaAvulsa");
  renderizarPaleta("corTarefaTimePalette", config.corTarefaTime, "corTarefaTime");
}

function renderizarPaleta(paletaId, corAtiva, configKey) {
  const container = document.getElementById(paletaId);
  container.innerHTML = "";

  PALETA_CORES.forEach((cor) => {
    const colorBtn = document.createElement("button");
    colorBtn.className = "color-option";
    colorBtn.style.backgroundColor = cor;

    if (cor === corAtiva) {
      colorBtn.classList.add("active");
    }

    colorBtn.addEventListener("click", () => {
      config[configKey] = cor;
      salvarConfig();
      renderizarPaleta(paletaId, cor, configKey);
      renderizarTarefas();
    });

    container.appendChild(colorBtn);
  });
}

function segundosParaMMSS(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function atualizarDisplayTempo(segundos) {
  const mmss = segundosParaMMSS(segundos);
  timerDisplay.textContent = mmss;
  document.title = `⏱ ${mmss} • Pomodoro`;
}

function atualizarLabel() {
  if (modo === "foco") {
    const minutos = Math.max(1, Math.round(tempoRestante / 60));
    timerLabel.textContent = `🔴 FOCO • ${minutos} min`;
  } else if (modo === "break-curto") {
    timerLabel.textContent = "🟢 DESCANSO CURTO";
  } else {
    timerLabel.textContent = "🔵 DESCANSO LONGO";
  }

  ciclosSpan.textContent = cicloAtual;
}

function aplicarPreset(presetStr) {
  const [foco] = presetStr.split("-").map((v) => parseInt(v, 10));
  focoAtualMinutos = foco;
  tempoRestante = foco * 60;
  modo = "foco";

  if (intervalo) clearInterval(intervalo);
  intervalo = null;

  atualizarDisplayTempo(tempoRestante);
  timerLabel.textContent = `🔴 FOCO • ${foco} min`;
}

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function tocarSomFinalizacao() {
  if (config.somFinalizacao === "none") return;
  if (!audioContext) return;

  const ctx = audioContext;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.frequency.value = config.somFinalizacao === "beep" ? 880 : 660;
  oscillator.type = "sine";
  oscillator.start();

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);

  oscillator.stop(ctx.currentTime + 1);
}

function enviarNotificacaoFinalizacao() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (config.notificacoes !== "on") return;

  const titulo = tarefaTimeAtual ? tarefaTimeAtual.titulo : "Tempo encerrado";
  const corpo =
    modo === "foco"
      ? `Ciclo de foco finalizado: ${titulo}`
      : modo === "break-curto"
      ? "Descanso curto finalizado"
      : "Descanso longo finalizado";

  new Notification("Tarefa concluída", { body: corpo });
}

function onTimerFinish() {
  tocarSomFinalizacao();
  enviarNotificacaoFinalizacao();

  if (modo === "foco") {
    cicloAtual += 1;
    estadoStats.pomodorosHoje += 1;
    estadoStats.totalPomodoros += 1;
    estadoStats.minutosHoje += focoAtualMinutos;
    estadoStats.totalMinutos += focoAtualMinutos;

    pomodorosHojeEl.textContent = estadoStats.pomodorosHoje;
    minutosHojeEl.textContent = estadoStats.minutosHoje;
    totalPomodorosEl.textContent = estadoStats.totalPomodoros;
    totalMinutosEl.textContent = estadoStats.totalMinutos;

    if (cicloAtual % 4 === 0) {
      modo = "break-longo";
      tempoRestante = 25 * 60;
    } else {
      modo = "break-curto";
      tempoRestante = 5 * 60;
    }
  } else {
    modo = "foco";
    tempoRestante = focoAtualMinutos * 60;
    tarefaTimeAtual = null;
    limparTarefaEmExecucao();
  }

  atualizarDisplayTempo(tempoRestante);
  atualizarLabel();
}

function tick() {
  tempoRestante -= 1;

  if (tempoRestante <= 0) {
    clearInterval(intervalo);
    intervalo = null;
    tempoRestante = 0;
    atualizarDisplayTempo(tempoRestante);
    onTimerFinish();
  } else {
    atualizarDisplayTempo(tempoRestante);
  }
}

function iniciarTimer() {
  if (!audioContext) initAudioContext();
  if (intervalo) return;
  intervalo = setInterval(tick, 1000);
}

function pausarTimer() {
  if (!intervalo) return;
  clearInterval(intervalo);
  intervalo = null;
}

function resetarTimer() {
  pausarTimer();
  cicloAtual = 0;
  modo = "foco";
  tempoRestante = focoAtualMinutos * 60;
  atualizarDisplayTempo(tempoRestante);
  atualizarLabel();
  limparTarefaEmExecucao();
  tarefaTimeAtual = null;
}

function atualizarTarefaEmExecucao(titulo, minutos) {
  tarefaEmExecucaoTitulo.textContent = `${titulo} (${minutos}m)`;
  tarefaEmExecucaoDiv.style.display = "block";
}

function limparTarefaEmExecucao() {
  tarefaEmExecucaoDiv.style.display = "none";
  tarefaEmExecucaoTitulo.textContent = "";
}

function definirTimerCustom(segundos) {
  pausarTimer();
  modo = "foco";
  tempoRestante = segundos;
  focoAtualMinutos = Math.round(segundos / 60);
  atualizarDisplayTempo(tempoRestante);
  atualizarLabel();
}

function salvarTarefas() {
  localStorage.setItem(TAREFAS_KEY, JSON.stringify(tarefas));
}

function carregarTarefas() {
  const raw = localStorage.getItem(TAREFAS_KEY);
  if (!raw) return;

  try {
    tarefas = JSON.parse(raw) || [];
    verificarResetTarefasFixas();
    renderizarTarefas();
  } catch (error) {
    console.error("Erro ao carregar tarefas:", error);
  }
}

function verificarResetTarefasFixas() {
  const hoje = new Date().toISOString().split("T")[0];

  if (ultimaVerificacaoData !== hoje) {
    ultimaVerificacaoData = hoje;
    localStorage.setItem(ULTIMA_DATA_KEY, hoje);

    tarefas.forEach((tarefa) => {
      if (tarefa.tipo === "fixa") {
        if (!tarefa.dataCriacao) {
          tarefa.dataCriacao = new Date().toISOString().split("T")[0];
        }

        const dataCriacao = new Date(tarefa.dataCriacao);
        const hojeDate = new Date();
        const diasPassados = Math.floor(
          (hojeDate - dataCriacao) / (1000 * 60 * 60 * 24)
        );

        if (diasPassados >= parseInt(tarefa.dias, 10)) {
          tarefa.concluida = true;
        } else {
          tarefa.concluida = false;
        }
      }
    });

    salvarTarefas();
  }
}

function renderizarTarefas() {
  listaTarefasPendentes.innerHTML = "";
  listaTarefasConcluidas.innerHTML = "";

  tarefas.forEach((tarefa) => {
    const listaDestino = tarefa.concluida
      ? listaTarefasConcluidas
      : listaTarefasPendentes;

    const li = document.createElement("li");
    if (tarefa.concluida) li.classList.add("completed");

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!tarefa.concluida;

    const span = document.createElement("span");
    span.textContent = tarefa.titulo;

    let cor = config.corTarefaAvulsa;
    let tipoLabel = "avulsa";

    if (tarefa.tipo === "fixa") {
      cor = config.corTarefaFixa;
      tipoLabel = "fixa";
    } else if (tarefa.tipo === "time") {
      cor = config.corTarefaTime;
      tipoLabel = "time";
    }

    const badge = document.createElement("span");
    badge.className = "task-badge";
    badge.style.backgroundColor = cor;

    if (tarefa.tipo === "fixa") {
      badge.textContent = `${tipoLabel} (${tarefa.dias}d)`;
    } else if (tarefa.tipo === "time") {
      badge.textContent = `${tipoLabel} (${tarefa.minutosTime}m)`;
    } else {
      badge.textContent = tipoLabel;
    }

    const btnConcluir = document.createElement("button");
    btnConcluir.textContent = tarefa.concluida ? "↩ Reavivar" : "Concluir";
    btnConcluir.className = "btn-secondary";

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "btn-danger";

    li.appendChild(chk);
    li.appendChild(span);
    li.appendChild(badge);

    if (tarefa.tipo === "time") {
      const btnPlayTarefa = document.createElement("button");
      btnPlayTarefa.textContent = "▶ Play";
      btnPlayTarefa.className = "btn-primary";

      btnPlayTarefa.addEventListener("click", () => {
        definirTimerCustom(Number(tarefa.minutosTime) * 60);
        tarefaTimeAtual = tarefa;
        atualizarTarefaEmExecucao(tarefa.titulo, tarefa.minutosTime);

        if (tarefa.concluida) {
          tarefa.concluida = false;
          estadoStats.tarefasConcluidas = Math.max(
            0,
            estadoStats.tarefasConcluidas - 1
          );
          tarefasConcluidasEl.textContent = estadoStats.tarefasConcluidas;
        }

        salvarTarefas();
        renderizarTarefas();
      });

      li.appendChild(btnPlayTarefa);
    }

    li.appendChild(btnConcluir);
    li.appendChild(btnExcluir);

    chk.addEventListener("change", () => {
      tarefa.concluida = chk.checked;

      if (chk.checked) {
        estadoStats.tarefasConcluidas += 1;
      } else {
        estadoStats.tarefasConcluidas = Math.max(
          0,
          estadoStats.tarefasConcluidas - 1
        );
      }

      tarefasConcluidasEl.textContent = estadoStats.tarefasConcluidas;
      salvarTarefas();
      renderizarTarefas();
    });

    btnConcluir.addEventListener("click", () => {
      tarefa.concluida = !tarefa.concluida;

      if (tarefa.concluida) {
        estadoStats.tarefasConcluidas += 1;
      } else {
        estadoStats.tarefasConcluidas = Math.max(
          0,
          estadoStats.tarefasConcluidas - 1
        );
      }

      tarefasConcluidasEl.textContent = estadoStats.tarefasConcluidas;
      salvarTarefas();
      renderizarTarefas();
    });

    btnExcluir.addEventListener("click", () => {
      tarefas = tarefas.filter((t) => t.id !== tarefa.id);

      if (tarefa.concluida) {
        estadoStats.tarefasConcluidas = Math.max(
          0,
          estadoStats.tarefasConcluidas - 1
        );
        tarefasConcluidasEl.textContent = estadoStats.tarefasConcluidas;
      }

      renderizarTarefas();
      salvarTarefas();
    });

    listaDestino.appendChild(li);
  });
}

function abrirModal(element) {
  element.style.display = "flex";
}

function fecharModal(element) {
  element.style.display = "none";
}

function registrarEventos() {
  btnPlay.addEventListener("click", iniciarTimer);
  btnPause.addEventListener("click", pausarTimer);
  btnReset.addEventListener("click", resetarTimer);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      aplicarPreset(chip.dataset.preset);
    });
  });

  btnConfig.addEventListener("click", () => abrirModal(backdropConfig));
  btnFecharConfig.addEventListener("click", () => fecharModal(backdropConfig));

  btnStats.addEventListener("click", () => abrirModal(backdropStats));
  btnFecharStats.addEventListener("click", () => fecharModal(backdropStats));

  btnNovaTarefaFixa.addEventListener("click", () => abrirModal(backdropTarefaFixa));
  cancelarTarefaFixaBtn.addEventListener("click", () => fecharModal(backdropTarefaFixa));

  criarTarefaFixaBtn.addEventListener("click", () => {
    if (!tarefaFixaTituloInput.value.trim()) return;

    const tarefa = {
      id: Date.now(),
      titulo: tarefaFixaTituloInput.value.trim(),
      dias: tarefaFixaDuracaoInput.value,
      dataCriacao: new Date().toISOString().split("T")[0],
      tipo: "fixa",
      concluida: false
    };

    tarefas.push(tarefa);
    renderizarTarefas();
    salvarTarefas();
    fecharModal(backdropTarefaFixa);

    tarefaFixaTituloInput.value = "";
    tarefaFixaDuracaoInput.value = "7";
  });

  btnNovaTarefaAvulsa.addEventListener("click", () => abrirModal(backdropTarefaAvulsa));
  cancelarTarefaAvulsaBtn.addEventListener("click", () => fecharModal(backdropTarefaAvulsa));

  criarTarefaAvulsaBtn.addEventListener("click", () => {
    if (!tarefaAvulsaTituloInput.value.trim()) return;

    const tarefa = {
      id: Date.now(),
      titulo: tarefaAvulsaTituloInput.value.trim(),
      tipo: "avulsa",
      concluida: false
    };

    tarefas.push(tarefa);
    renderizarTarefas();
    salvarTarefas();
    fecharModal(backdropTarefaAvulsa);

    tarefaAvulsaTituloInput.value = "";
  });

  btnNovaTarefaTime.addEventListener("click", () => abrirModal(backdropTarefaTime));
  cancelarTarefaTimeBtn.addEventListener("click", () => fecharModal(backdropTarefaTime));

  criarTarefaTimeBtn.addEventListener("click", () => {
    if (!tarefaTimeTituloInput.value.trim()) return;

    const tarefa = {
      id: Date.now(),
      titulo: tarefaTimeTituloInput.value.trim(),
      minutosTime: Number(tarefaTimeMinutosInput.value),
      tipo: "time",
      concluida: false
    };

    tarefas.push(tarefa);
    renderizarTarefas();
    salvarTarefas();
    fecharModal(backdropTarefaTime);

    tarefaTimeTituloInput.value = "";
    tarefaTimeMinutosInput.value = "30";

    definirTimerCustom(tarefa.minutosTime * 60);
    tarefaTimeAtual = tarefa;
    atualizarTarefaEmExecucao(tarefa.titulo, tarefa.minutosTime);
  });

  notesArea.addEventListener("input", () => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
  });

  somFinalizacaoSelect.addEventListener("change", () => {
    config.somFinalizacao = somFinalizacaoSelect.value;
    salvarConfig();
  });

  notificacoesToggle.addEventListener("change", () => {
    config.notificacoes = notificacoesToggle.value;
    salvarConfig();

    if (config.notificacoes === "on" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  });
}

function inicializar() {
  carregarConfig();
  ultimaVerificacaoData =
    localStorage.getItem(ULTIMA_DATA_KEY) || new Date().toISOString().split("T")[0];

  carregarTarefas();
  notesArea.value = localStorage.getItem(NOTES_KEY) || "";

  atualizarDisplayTempo(tempoRestante);
  atualizarLabel();
  registrarEventos();

  setInterval(verificarResetTarefasFixas, 5 * 60 * 1000);

  streakDiasEl.textContent = estadoStats.streakDias;
  streakMelhorEl.textContent = estadoStats.streakMelhor;
  diasComPomodoroEl.textContent = estadoStats.diasComPomodoro;
}

inicializar();