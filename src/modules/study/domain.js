// выбор слов для изучения и повторения
import { STATUS, wordStatus, hasTranslation } from '@/core/words/domain.js'
import { shuffle } from '@/shared/utils/shuffle.js'
import { daysAgo } from '@/shared/utils/dates.js'

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

export function dueCount(words, repeatSettings, now = new Date()) {
  return words.filter(w => isDue(w, repeatSettings, now)).length
}
