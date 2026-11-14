// правила для слов: статусы и подсчёт

// IGNORED в интерфейсе — «Знаю»: слова, которые и так хорошо знаешь (cat, dog).
// Не учатся, повторяются редко — раз в repeat.days_known дней. Ключ и поле is_ignored
// оставлены прежними — так совместимы старые базы и CSV
export const STATUS = {
  NEW:          'new',
  LEARNED:      'learned',
  IGNORED:      'ignored',
  UNTRANSLATED: 'untranslated',
}

export function hasTranslation(word) {
  return (word.translation ?? []).some(t => t.trim())
}

export function wordStatus(word) {
  if (word.is_ignored) return STATUS.IGNORED
  if (word.is_learned) return STATUS.LEARNED
  if (!hasTranslation(word)) return STATUS.UNTRANSLATED
  return STATUS.NEW
}

export function normalizeWord(text) {
  return text.trim().toLowerCase()
}

// сколько слов в каждом статусе
export function wordStats(words) {
  const stats = { words: words.length, learned: 0, ignored: 0, untranslated: 0, new: 0 }
  for (const w of words) stats[wordStatus(w)]++
  return stats
}
