// настройки по умолчанию (как в старом SettingsController) + интерфейс

export const DEFAULT_SETTINGS = {
  learning: {
    words_per_session: 4,
    extra_letters:     0,
  },
  repeat: {
    words_per_session:   10,
    days_after_learning: 2,
    days_after_repeat:   5,
    days_known:          20, // слова «Знаю»
  },
  stages: {
    direct:      true,
    reverse:     true,
    constructor: true,
    input:       true,
  },
  // в повторении только переводы, свои переключатели
  repeat_stages: {
    direct:  true,
    reverse: true,
  },
  current_library_id: 'en',
  locale:    null,     // null — по языку телефона
  appearance: 'light', // тема: light | dark | system
  text_size: 'm',      // s | m | l | xl
}

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
