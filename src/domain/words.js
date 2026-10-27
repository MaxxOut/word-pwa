// правила для слов: статусы, выбор для изучения и повторения, статистика

import { daysAgo } from './dates.js'

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

export function shuffle(list) {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// слова для изучения: невыученные, не в игноре, с переводом — новые сначала
export function pickForStudy(words, limit = 50) {
  return words
    .filter(w => wordStatus(w) === STATUS.NEW)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
}

// варианты-«отвлекалки» для тестов: выученные и «знаю» с переводом
export function pickExtra(words, excludeIds = [], limit = 20) {
  const exclude = new Set(excludeIds)
  return shuffle(
    words.filter(w => (w.is_learned || w.is_ignored) && hasTranslation(w) && !exclude.has(w.id)),
  ).slice(0, limit)
}

// с чего отсчитывать повторение слова
const repeatBase = w => w.repeated_at ?? w.learned_at ?? w.updated_at ?? w.created_at

// пора ли повторять: не повторялось — с изучения прошло N дней, иначе — с повторения M дней.
// «Знаю» — раз в K дней с последнего повторения (или с отметки), только с переводом
export function isDue(word, repeatSettings, now = new Date()) {
  const { days_after_learning, days_after_repeat, days_known } = repeatSettings
  if (word.is_ignored) {
    return hasTranslation(word) && new Date(repeatBase(word)) <= daysAgo(days_known ?? 20, now)
  }
  if (!word.is_learned) return false
  if (!word.repeated_at) {
    return !!word.learned_at && new Date(word.learned_at) <= daysAgo(days_after_learning, now)
  }
  return new Date(word.repeated_at) <= daysAgo(days_after_repeat, now)
}

// слова к повторению — давно не виденные сначала
export function pickForRepeat(words, repeatSettings, now = new Date()) {
  const due = words.filter(w => isDue(w, repeatSettings, now))
  due.sort((a, b) => repeatBase(a).localeCompare(repeatBase(b)))
  return {
    total: due.length,
    words: due.slice(0, repeatSettings.words_per_session),
  }
}

export function libraryStats(words, repeatSettings, now = new Date()) {
  const stats = { words: words.length, learned: 0, ignored: 0, untranslated: 0, new: 0, due: 0 }
  for (const w of words) {
    const status = wordStatus(w)
    if (status === STATUS.LEARNED) stats.learned++
    else if (status === STATUS.IGNORED) stats.ignored++
    else if (status === STATUS.UNTRANSLATED) stats.untranslated++
    else stats.new++
    if (isDue(w, repeatSettings, now)) stats.due++
  }
  return stats
}
