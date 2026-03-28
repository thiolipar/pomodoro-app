import { STORAGE_KEYS, loadJSON, saveJSON, saveText, loadText, saveText as saveLocalText } from "./storage.js";

export function createTasksModule({
  config,
  timer,
  listaTarefasPendentes,
  listaTarefasConcluidas,
  tarefasConcluidasEl,
  notesArea
}) {
  let tarefas = [];
  let ultimaVerificacaoData = loadText(
    STORAGE_KEYS.ULTIMA_DATA,
    new Date().toISOString().split("T")[0]
  );

  const stats = {
    tarefasConcluidas: 0
  };

  function salvarTarefas() {
    saveJSON(STORAGE_KEYS.TAREFAS, tarefas);
  }

  function carregarTarefas() {
    tarefas = loadJSON(STORAGE_KEYS.TAREFAS, []);
    verificarResetTarefasFixas();
    renderizarTarefas();
  }

  function salvarNotas() {
    saveLocalText(STORAGE_KEYS.NOTES, notesArea.value);
  }

  function carregarNotas() {
    notesArea.value = loadText(STORAGE_KEYS.NOTES, "");
  }

  function verificarResetTarefasFixas() {
    const hoje = new Date().toISOString().split("T")[0];

    if (ultimaVerificacaoData !== hoje) {
      ultimaVerificacaoData = hoje;
      saveText(STORAGE_KEYS.ULTIMA_DATA, hoje);

      tarefas.forEach((tarefa) => {
        if (tarefa.tipo === "fixa") {
          if (!tarefa.dataCriacao) {
            tarefa.dataCriacao = hoje;
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

  function atualizarContadorConclusoes() {
    stats.tarefasConcluidas = tarefas.filter((t) => t.concluida).length;
    tarefasConcluidasEl.textContent = stats.tarefasConcluidas;
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
        const btnPlay = document.createElement("button");
        btnPlay.textContent = "▶ Play";
        btnPlay.className = "btn-primary";

        btnPlay.addEventListener("click", () => {
          timer.definirTimerCustom(Number(tarefa.minutosTime) * 60, tarefa);

          if (tarefa.concluida) {
            tarefa.concluida = false;
          }

          salvarTarefas();
          renderizarTarefas();
        });

        li.appendChild(btnPlay);
      }

      li.appendChild(btnConcluir);
      li.appendChild(btnExcluir);

      chk.addEventListener("change", () => {
        tarefa.concluida = chk.checked;
        salvarTarefas();
        renderizarTarefas();
      });

      btnConcluir.addEventListener("click", () => {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefas();
      });

      btnExcluir.addEventListener("click", () => {
        tarefas = tarefas.filter((t) => t.id !== tarefa.id);
        salvarTarefas();
        renderizarTarefas();
      });

      listaDestino.appendChild(li);
    });

    atualizarContadorConclusoes();
  }

  function criarTarefaFixa(titulo, dias) {
    tarefas.push({
      id: Date.now(),
      titulo: titulo.trim(),
      dias,
      dataCriacao: new Date().toISOString().split("T")[0],
      tipo: "fixa",
      concluida: false
    });

    salvarTarefas();
    renderizarTarefas();
  }

  function criarTarefaAvulsa(titulo) {
    tarefas.push({
      id: Date.now(),
      titulo: titulo.trim(),
      tipo: "avulsa",
      concluida: false
    });

    salvarTarefas();
    renderizarTarefas();
  }

  function criarTarefaTime(titulo, minutosTime) {
    const tarefa = {
      id: Date.now(),
      titulo: titulo.trim(),
      minutosTime: Number(minutosTime),
      tipo: "time",
      concluida: false
    };

    tarefas.push(tarefa);
    salvarTarefas();
    renderizarTarefas();
    timer.definirTimerCustom(tarefa.minutosTime * 60, tarefa);
  }

  return {
    carregarTarefas,
    renderizarTarefas,
    criarTarefaFixa,
    criarTarefaAvulsa,
    criarTarefaTime,
    salvarNotas,
    carregarNotas,
    verificarResetTarefasFixas,
    getStats: () => stats
  };
}