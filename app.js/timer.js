export function createTimer({
  timerDisplay,
  timerLabel,
  ciclosSpan,
  pomodorosHojeEl,
  minutosHojeEl,
  config
}) {
  let modo = "foco";
  let cicloAtual = 0;
  let tempoRestante = 20 * 60;
  let intervalo = null;
  let focoAtualMinutos = 20;
  let tarefaTimeAtual = null;
  let audioContext = null;

  function segundosParaMMSS(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
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

    new Notification("Tarefa concluída", {
      body: corpo
    });
  }

  function onTimerFinish() {
    tocarSomFinalizacao();
    enviarNotificacaoFinalizacao();

    if (modo === "foco") {
      cicloAtual += 1;

      pomodorosHojeEl.textContent = Number(pomodorosHojeEl.textContent) + 1;
      minutosHojeEl.textContent = Number(minutosHojeEl.textContent) + focoAtualMinutos;

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
    if (!audioContext) {
      initAudioContext();
    }

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
    tarefaTimeAtual = null;

    atualizarDisplayTempo(tempoRestante);
    atualizarLabel();
  }

  function aplicarPreset(presetStr) {
    const [foco] = presetStr.split("-").map((v) => parseInt(v, 10));

    focoAtualMinutos = foco;
    tempoRestante = foco * 60;
    modo = "foco";

    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }

    atualizarDisplayTempo(tempoRestante);
    atualizarLabel();
  }

  function definirTimerCustom(segundos, tarefa = null) {
    pausarTimer();
    modo = "foco";
    tempoRestante = segundos;
    focoAtualMinutos = Math.round(segundos / 60);
    tarefaTimeAtual = tarefa;

    atualizarDisplayTempo(tempoRestante);
    atualizarLabel();
  }

  function init() {
    atualizarDisplayTempo(tempoRestante);
    atualizarLabel();
  }

  return {
    init,
    iniciarTimer,
    pausarTimer,
    resetarTimer,
    aplicarPreset,
    definirTimerCustom
  };
}