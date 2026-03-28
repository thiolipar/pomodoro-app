import { STORAGE_KEYS, loadJSON, saveJSON } from "./storage.js";

export const PALETA_CORES = [
  "#dc2626", "#f87171", "#fb923c", "#fbbf24", "#a3e635", "#4ade80",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
];

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

export function loadConfig() {
  const config = createDefaultConfig();
  const stored = loadJSON(STORAGE_KEYS.CONFIG, {});

  return { ...config, ...stored };
}

export function saveConfig(config) {
  saveJSON(STORAGE_KEYS.CONFIG, config);
}

export function renderColorPalette(paletteId, activeColor, configKey, config, onChange) {
  const container = document.getElementById(paletteId);
  container.innerHTML = "";

  PALETA_CORES.forEach((color) => {
    const colorBtn = document.createElement("button");
    colorBtn.className = "color-option";
    colorBtn.style.backgroundColor = color;

    if (color === activeColor) {
      colorBtn.classList.add("active");
    }

    colorBtn.addEventListener("click", () => {
      config[configKey] = color;
      saveConfig(config);
      onChange(color);
    });

    container.appendChild(colorBtn);
  });
}

export function applyConfigUI(config, callbacks = {}) {
  const {
    onTaskRender = () => {}
  } = callbacks;

  const somFinalizacaoSelect = document.getElementById("somFinalizacao");
  const notificacoesToggle = document.getElementById("notificacoesToggle");

  somFinalizacaoSelect.value = config.somFinalizacao || "beep";
  notificacoesToggle.value = config.notificacoes;

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

export function requestNotificationPermissionIfNeeded(config) {
  if (config.notificacoes === "on" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }
}