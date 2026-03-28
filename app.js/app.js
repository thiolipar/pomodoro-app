import { loadConfig, saveConfig, applyConfigUI, requestNotificationPermissionIfNeeded } from "./config.js";
import { createTimer } from "./timer.js";
import { createTasksModule } from "./tasks.js";

// =====================
// ELEMENTOS DOM
// =====================
const elements = {
  timerDisplay: document.getElementById("timerDisplay"),
  timerLabel: document.getElementById("timerLabel"),
  ciclosSpan: document.getElementById("ciclosSpan"),

  btnPlay: document.getElementById("btnPlay"),
  btnPause: document.getElementById("btnPause"),
  btnReset: document.getElementById("btnReset"),

  notesArea: document.getElementById("notes"),

  listaTarefasPendentes: document.getElementById("listaTarefasPendentes"),
  listaTarefasConcluidas: document.getElementById("listaTarefasConcluidas"),

  pomodorosHojeEl: document.getElementById("pomodorosHoje"),
  minutosHojeEl: document.getElementById("minutosHoje"),
  tarefasConcluidasEl: document.getElementById("tarefasConcluidas"),

  backdropConfig: document.getElementById("backdropConfig"),
  btnConfig: document.getElementById("btnConfig"),
  btnFecharConfig: document.getElementById("btnFecharConfig"),
  somFinalizacaoSelect: document.getElementById("somFinalizacao"),
  notificacoesToggle: document.getElementById("notificacoesToggle"),

  backdropStats: document.getElementById("backdropStats"),
  btnStats: document.getElementById("btnStats"),
  btnFecharStats: document.getElementById("btnFecharStats"),

  backdropTarefaFixa: document.getElementById("backdropTarefaFixa"),
  btnNovaTarefaFixa: document.getElementById("btnNovaTarefaFixa"),
  criarTarefaFixaBtn: document.getElementById("criarTarefaFixa"),
  cancelarTarefaFixaBtn: document.getElementById("cancelarTarefaFixa"),
  tarefaFixaTituloInput: document.getElementById("tarefaFixaTitulo"),
  tarefaFixaDuracaoInput: document.getElementById("tarefaFixaDuracao"),

  backdropTarefaAvulsa: document.getElementById("backdropTarefaAvulsa"),
  btnNovaTarefaAvulsa: document.getElementById("btnNovaTarefaAvulsa"),
  criarTarefaAvulsaBtn: document.getElementById("criarTarefaAvulsa"),
  cancelarTarefaAvulsaBtn: document.getElementById("cancelarTarefaAvulsa"),
  tarefaAvulsaTituloInput: document.getElementById("tarefaAvulsaTitulo"),

  backdropTarefaTime: document.getElementById("backdropTarefaTime"),
  btnNovaTarefaTime: document.getElementById("btnNovaTarefaTime"),
  criarTarefaTimeBtn: document.getElementById("criarTarefaTime"),
  cancelarTarefaTimeBtn: document.getElementById("cancelarTarefaTime"),
  tarefaTimeTituloInput: document.getElementById("tarefaTimeTitulo"),
  tarefaTimeMinutosInput: document.getElementById("tarefaTimeMinutos")
};

// =====================
// CONFIG
// =====================
const config = loadConfig();

// =====================
// TIMER
// =====================
const timer = createTimer({
  timerDisplay: elements.timerDisplay,
  timerLabel: elements.timerLabel,
  ciclosSpan: elements.ciclosSpan,
  pomodorosHojeEl: elements.pomodorosHojeEl,
  minutosHojeEl: elements.minutosHojeEl,
  config
});

// =====================
// TASKS
// =====================
const tasks = createTasksModule({
  config,
  timer,
  listaTarefasPendentes: elements.listaTarefasPendentes,
  listaTarefasConcluidas: elements.listaTarefasConcluidas,
  tarefasConcluidasEl: elements.tarefasConcluidasEl,
  notesArea: elements.notesArea
});

// =====================
// MODAIS
// =====================
function abrirModal(el) {
  el.style.display = "flex";
}

function fecharModal(el) {
  el.style.display = "none";
}

// =====================
// EVENTOS
// =====================
function registrarEventos() {
  // TIMER
  elements.btnPlay.addEventListener("click", timer.iniciarTimer);
  elements.btnPause.addEventListener("click", timer.pausarTimer);
  elements.btnReset.addEventListener("click", timer.resetarTimer);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      timer.aplicarPreset(chip.dataset.preset);
    });
  });

  // CONFIG
  elements.btnConfig.addEventListener("click", () => abrirModal(elements.backdropConfig));
  elements.btnFecharConfig.addEventListener("click", () => fecharModal(elements.backdropConfig));

  elements.somFinalizacaoSelect.addEventListener("change", () => {
    config.somFinalizacao = elements.somFinalizacaoSelect.value;
    saveConfig(config);
  });

  elements.notificacoesToggle.addEventListener("change", () => {
    config.notificacoes = elements.notificacoesToggle.value;
    saveConfig(config);
    requestNotificationPermissionIfNeeded(config);
  });

  // STATS
  elements.btnStats.addEventListener("click", () => abrirModal(elements.backdropStats));
  elements.btnFecharStats.addEventListener("click", () => fecharModal(elements.backdropStats));

  // TAREFA FIXA
  elements.btnNovaTarefaFixa.addEventListener("click", () => abrirModal(elements.backdropTarefaFixa));
  elements.cancelarTarefaFixaBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaFixa));

  elements.criarTarefaFixaBtn.addEventListener("click", () => {
    const titulo = elements.tarefaFixaTituloInput.value.trim();
    const dias = elements.tarefaFixaDuracaoInput.value;

    if (!titulo) return;

    tasks.criarTarefaFixa(titulo, dias);
    fecharModal(elements.backdropTarefaFixa);

    elements.tarefaFixaTituloInput.value = "";
  });

  // TAREFA AVULSA
  elements.btnNovaTarefaAvulsa.addEventListener("click", () => abrirModal(elements.backdropTarefaAvulsa));
  elements.cancelarTarefaAvulsaBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaAvulsa));

  elements.criarTarefaAvulsaBtn.addEventListener("click", () => {
    const titulo = elements.tarefaAvulsaTituloInput.value.trim();

    if (!titulo) return;

    tasks.criarTarefaAvulsa(titulo);
    fecharModal(elements.backdropTarefaAvulsa);

    elements.tarefaAvulsaTituloInput.value = "";
  });

  // TAREFA TIME
  elements.btnNovaTarefaTime.addEventListener("click", () => abrirModal(elements.backdropTarefaTime));
  elements.cancelarTarefaTimeBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaTime));

  elements.criarTarefaTimeBtn.addEventListener("click", () => {
    const titulo = elements.tarefaTimeTituloInput.value.trim();
    const minutos = elements.tarefaTimeMinutosInput.value;

    if (!titulo) return;

    tasks.criarTarefaTime(titulo, minutos);
    fecharModal(elements.backdropTarefaTime);

    elements.tarefaTimeTituloInput.value = "";
  });

  // NOTAS
  elements.notesArea.addEventListener("input", tasks.salvarNotas);
}

// =====================
// INIT
// =====================
function inicializar() {
  applyConfigUI(config, {
    onTaskRender: tasks.renderizarTarefas
  });

  timer.init();
  tasks.carregarTarefas();
  tasks.carregarNotas();

  registrarEventos();
}

inicializar();