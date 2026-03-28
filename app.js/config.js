import { STORAGE_KEYS, loadJSON, saveJSON } from "./storage.js";

export const PALETA_CORES = [
  "#dc2626", "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#4ade80",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

// =====================
// CONFIG PADRÃO
// =====================
export function createDefaultConfig() {
  return {
    corFoco: "#dc2626",
    corDescansoCurto: "#10b981",
    corDescansoLongo: "#6366f1",
    corTarefaFixa: "#3b82f6",
    corTarefaAvulsa: "#8b5cf6",
    corTarefaTime: "#f59e0b",
    somFinalizacao: "beep",
    notificacoes: "off"
  };
}

// =====================
// LOAD / SAVE
// =====================
export function loadConfig() {
  const defaultConfig = createDefaultConfig();
  const stored = loadJSON(STORAGE_KEYS.CONFIG, {});

  return { ...defaultConfig, ...stored };
}

export function saveConfig(config) {
  saveJSON(STORAGE_KEYS.CONFIG, config);
}

// =====================
// UI CONFIG
// =====================
export function renderColorPalette(paletteId, activeColor, configKey, config, onChange) {
  const container = document.getElementById(paletteId);
  if (!container) return;

  container.innerHTML = "";

  PALETA_CORES.forEach((color) => {
    const btn = document.createElement("button");
    btn.className = "color-option";
    btn.style.backgroundColor = color;

    if (color === activeColor) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      config[configKey] = color;
      saveConfig(config);
      onChange();
    });

    container.appendChild(btn);
  });
}

export function applyConfigUI(config, callbacks = {}) {
  const { onTaskRender = () => {} } = callbacks;

  const somFinalizacaoSelect = document.getElementById("somFinalizacao");
  const notificacoesToggle = document.getElementById("notificacoesToggle");

  if (somFinalizacaoSelect) {
    somFinalizacaoSelect.value = config.somFinalizacao;
  }

  if (notificacoesToggle) {
    notificacoesToggle.value = config.notificacoes;
  }

  renderColorPalette("corFocoPalette", config.corFoco, "corFoco", config, () => {
    applyConfigUI(config, callbacks);
  });

  renderColorPalette("corDescansoCurtoPalette", config.corDescansoCurto, "corDescansoCurto", config, () => {
    applyConfigUI(config, callbacks);
  });

  renderColorPalette("corDescansoLongoPalette", config.corDescansoLongo, "corDescansoLongo", config, () => {
    applyConfigUI(config, callbacks);
  });

  renderColorPalette("corTarefaFixaPalette", config.corTarefaFixa, "corTarefaFixa", config, () => {
    applyConfigUI(config, callbacks);
    onTaskRender();
  });

  renderColorPalette("corTarefaAvulsaPalette", config.corTarefaAvulsa, "corTarefaAvulsa", config, () => {
    applyConfigUI(config, callbacks);
    onTaskRender();
  });

  renderColorPalette("corTarefaTimePalette", config.corTarefaTime, "corTarefaTime", config, () => {
    applyConfigUI(config, callbacks);
    onTaskRender();
  });
}

// =====================
// NOTIFICAÇÕES
// =====================
export function requestNotificationPermissionIfNeeded(config) {
  if (config.notificacoes === "on" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}