export const STORAGE_KEYS = {
  CONFIG: "pomodoro_config_v2",
  TAREFAS: "pomodoro_tarefas",
  NOTES: "pomodoro_notes",
  ULTIMA_DATA: "ultima_verificacao_data"
};

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadJSON(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Erro ao carregar JSON da chave ${key}:`, error);
    return fallback;
  }
}

export function saveText(key, value) {
  localStorage.setItem(key, value);
}

export function loadText(key, fallback = "") {
  return localStorage.getItem(key) ?? fallback;
}