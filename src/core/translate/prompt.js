// промпт для любого ИИ-чата: слово → одна строка в формате CSV (см. core/words/csv.js)

// пример ответа для каждого языка; перевод подставляется на языке интерфейса
const SAMPLES = {
  en: { word: 'apple', transcription: '[ˈæp.əl]', example: 'I eat an apple every day.' },
  de: { word: 'Apfel', transcription: '[ˈapfl̩]', example: 'Ich esse jeden Tag einen Apfel.' },
}

const CONTEXT_LINE = 2 // строка «Предложение: …» — только если оно есть

// t, tm — из useI18n(); from — язык слова (en/de), to — язык интерфейса (ru/uk)
export function buildPrompt({ t, tm }, { word, context, from, to }) {
  const s      = SAMPLES[from] ?? SAMPLES.en
  const sample = [s.word, t('translate.sampleTranslation'), s.transcription, s.example].join(';')
  const params = {
    word,
    context,
    sample,
    lang:   t(`translate.lang.${from}`),
    target: t(`translate.target.${to}`),
  }
  return tm('translate.prompt')
    .map((_, i) => i)
    .filter(i => i !== CONTEXT_LINE || context)
    .map(i => t(`translate.prompt.${i}`, params))
    .join('\n')
}
