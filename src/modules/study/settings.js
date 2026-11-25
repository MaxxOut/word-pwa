// настройки изучения и повторения (как в старом SettingsController)
export const defaults = {
  learning: {
    words_per_session: 4,
    extra_letters:     0,
    choices:           4, // вариантов в выборе перевода (и в повторении)
  },
  repeat: {
    words_per_session:   10,
    days_after_learning: 2,
    days_after_repeat:   5,
    days_known:          20, // слова «Знаю»
  },
  stages: {
    intro:       true,
    direct:      true,
    reverse:     true,
    constructor: true,
    listen:      true,
    input:       true,
  },
  // озвучка слова в изучении и повторении: перевод с изучаемого языка — сразу, остальное — после ответа
  speech: {
    auto: true,
  },
  // в повторении только переводы, свои переключатели
  repeat_stages: {
    direct:  true,
    reverse: true,
  },
}
