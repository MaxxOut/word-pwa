// настройки ядра; модули добавляют свои разделы в modules/*/settings.js
const CORE_DEFAULTS = {
  current_library_id: 'en',
  locale:     null,    // null — по языку телефона
  appearance: 'light', // тема: light | dark | system
  text_size:  'm',     // s | m | l | xl
}

const moduleDefaults = import.meta.glob('../../modules/*/settings.js', { eager: true, import: 'defaults' })

export const DEFAULT_SETTINGS = Object.assign({}, CORE_DEFAULTS, ...Object.values(moduleDefaults))

function isObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

// глубокое слияние, чтобы не затирать вложенные ключи
export function mergeSettings(base, patch) {
  const result = { ...base }
  for (const [key, value] of Object.entries(patch ?? {})) {
    result[key] = isObject(value) && isObject(base[key])
      ? mergeSettings(base[key], value)
      : value
  }
  return result
}

// сохранённые настройки поверх умолчаний; разделы удалённых модулей отбрасываются
export function withDefaults(stored) {
  const known = Object.fromEntries(
    Object.entries(stored ?? {}).filter(([key]) => key in DEFAULT_SETTINGS),
  )
  return mergeSettings(DEFAULT_SETTINGS, known)
}
