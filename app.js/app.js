import { loadConfig, saveConfig, applyConfigUI, requestNotificationPermissionIfNeeded } from "./config.js";
import { createTimer } from "./timer.js";
import { createTasksModule } from "./tasks.js";

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
  streakDiasEl: document.getElementById("streakDias"),
  streakMelhorEl: document.getElementById("streakMelhor"),
  totalPomodorosEl: document.getElementById("totalPomodoros"),
  totalMinutosEl: document.getElementById("totalMinutos"),
  diasComPomodoroEl: document.getElementById("diasComPomodoro"),

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
  tarefaTimeMinutosInput: document.getElementById("tarefaTimeMinutos"),

  tarefaEmExecucaoDiv: document.getElementById("tarefaEmExecucao"),
  tarefaEmExecucaoTitulo: document.getElementById("tarefaEmExecucaoTitulo")
};

const config = loadConfig();

const timer = createTimer({
  timerDisplay: elements.timerDisplay,
  timerLabel: elements.timerLabel,
  ciclosSpan: elements.ciclosSpan,
  pomodorosHojeEl: elements.pomodorosHojeEl,
  minutosHojeEl: elements.minutosHojeEl,
  totalPomodorosEl: elements.totalPomodorosEl,
  totalMinutosEl: elements.totalMinutosEl,
  tarefaEmExecucaoDiv: elements.tarefaEmExecucaoDiv,
  tarefaEmExecucaoTitulo: elements.tarefaEmExecucaoTitulo,
  config
});

const tasks = createTasksModule({
  config,
  timer,
  listaTarefasPendentes: elements.listaTarefasPendentes,
  listaTarefasConcluidas: elements.listaTarefasConcluidas,
  tarefasConcluidasEl: elements.tarefasConcluidasEl,
  notesArea: elements.notesArea
});

function abrirModal(element) {
  element.style.display = "flex";
}

function fecharModal(element) {
  element.style.display = "none";
}

function registrarEventos() {
  elements.btnPlay.addEventListener("click", timer.iniciarTimer);
  elements.btnPause.addEventListener("click", timer.pausarTimer);
  elements.btnReset.addEventListener("click", timer.resetarTimer);

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      timer.aplicarPreset(chip.dataset.preset);
    });
  });

  elements.btnConfig.addEventListener("click", () => abrirModal(elements.backdropConfig));
  elements.btnFecharConfig.addEventListener("click", () => fecharModal(elements.backdropConfig));

  elements.btnStats.addEventListener("click", () => abrirModal(elements.backdropStats));
  elements.btnFecharStats.addEventListener("click", () => fecharModal(elements.backdropStats));

  elements.btnNovaTarefaFixa.addEventListener("click", () => abrirModal(elements.backdropTarefaFixa));
  elements.cancelarTarefaFixaBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaFixa));

  elements.criarTarefaFixaBtn.addEventListener("click", () => {
    const titulo = elements.tarefaFixaTituloInput.value.trim();
    const dias = elements.tarefaFixaDuracaoInput.value;

    if (!titulo) return;

    tasks.criarTarefaFixa(titulo, dias);
    fecharModal(elements.backdropTarefaFixa);
    elements.tarefaFixaTituloInput.value = "";
    elements.tarefaFixaDuracaoInput.value = "7";
  });

  elements.btnNovaTarefaAvulsa.addEventListener("click", () => abrirModal(elements.backdropTarefaAvulsa));
  elements.cancelarTarefaAvulsaBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaAvulsa));

  elements.criarTarefaAvulsaBtn.addEventListener("click", () => {
    const titulo = elements.tarefaAvulsaTituloInput.value.trim();
    if (!titulo) return;

    tasks.criarTarefaAvulsa(titulo);
    fecharModal(elements.backdropTarefaAvulsa);
    elements.tarefaAvulsaTituloInput.value = "";
  });

  elements.btnNovaTarefaTime.addEventListener("click", () => abrirModal(elements.backdropTarefaTime));
  elements.cancelarTarefaTimeBtn.addEventListener("click", () => fecharModal(elements.backdropTarefaTime));

  elements.criarTarefaTimeBtn.addEventListener("click", () => {
    const titulo = elements.tarefaTimeTituloInput.value.trim();
    const minutos = elements.tarefaTimeMinutosInput.value;

    if (!titulo) return;

    tasks.criarTarefaTime(titulo, minutos);
    fecharModal(elements.backdropTarefaTime);
    elements.tarefaTimeTituloInput.value = "";
    elements.tarefaTimeMinutosInput.value = "30";
  });

  elements.notesArea.addEventListener("input", tasks.salvarNotas);

  elements.somFinalizacaoSelect.addEventListener("change", () => {
    config.somFinalizacao = elements.somFinalizacaoSelect.value;
    saveConfig(config);
  });

  elements.notificacoesToggle.addEventListener("change", () => {
    config.notificacoes = elements.notificacoesToggle.value;
    saveConfig(config);
    requestNotificationPermissionIfNeeded(config);
  });
}

function inicializar() {
  applyConfigUI(config, {
    onTaskRender: tasks.renderizarTarefas
  });

  timer.init();
  tasks.carregarTarefas();
  tasks.carregarNotas();

  elements.streakDiasEl.textContent = "0";
  elements.streakMelhorEl.textContent = "0";
  elements.diasComPomodoroEl.textContent = "0";

  registrarEventos();

  setInterval(() => {
    tasks.verificarResetTarefasFixas();
    tasks.renderizarTarefas();
  }, 5 * 60 * 1000);
}

inicializar();