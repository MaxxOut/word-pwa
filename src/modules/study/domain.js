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

// ----- «повторить вне очереди» -----
// ошибся в повторении и выбрал «Нужно закрепить»: слово ждёт не обычные дни,
// а только следующего дня и минимум 6 часов (учил в 23:50 → не раньше 05:50)
export const SOON_HOURS = 6

export function soonDueAt(now = new Date()) {
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  const later = new Date(now.getTime() + SOON_HOURS * 3600000)
  return (later > tomorrow ? later : tomorrow).toISOString()
}

// итог повторения слова: ok — помню (обычный график; «Знаю» → обычное выученное),
// known — оставить «Знаю», soon — нужно закрепить, new — учить заново
export const OUTCOME = { OK: 'ok', KNOWN: 'known', SOON: 'soon', NEW: 'new' }

// «нужно закрепить» действует только у обычного выученного (отметили «Знаю» — уже нет)
const isSoon = w => !!w.repeat_soon_at && w.is_learned && !w.is_ignored

// по умолчанию: без ошибки — как было; с ошибкой — «нужно закрепить», у «Знаю» — обычное выученное
export function defaultOutcome(word) {
  if (word.is_ignored) return word.has_error ? OUTCOME.OK : OUTCOME.KNOWN
  return word.has_error ? OUTCOME.SOON : OUTCOME.OK
}

// пора ли повторять: «вне очереди» — с наступлением срока; не повторялось — с изучения
// прошло N дней, иначе — с повторения M дней.
// «Знаю» — раз в K дней с последнего повторения (или с отметки), только с переводом
export function isDue(word, repeatSettings, now = new Date()) {
  const { days_after_learning, days_after_repeat, days_known } = repeatSettings
  if (word.is_ignored) {
    return hasTranslation(word) && new Date(repeatBase(word)) <= daysAgo(days_known ?? 20, now)
  }
  if (!word.is_learned) return false
  if (isSoon(word) && hasTranslation(word) && new Date(word.repeat_soon_at) <= now) return true
  if (!word.repeated_at) {
    return !!word.learned_at && new Date(word.learned_at) <= daysAgo(days_after_learning, now)
  }
  return new Date(word.repeated_at) <= daysAgo(days_after_repeat, now)
}

// слова к повторению — «вне очереди» первыми, дальше давно не виденные
export function pickForRepeat(words, repeatSettings, now = new Date()) {
  const due = words.filter(w => isDue(w, repeatSettings, now))
  due.sort((a, b) => (isSoon(b) - isSoon(a)) || repeatBase(a).localeCompare(repeatBase(b)))
  return {
    total: due.length,
    words: due.slice(0, repeatSettings.words_per_session),
  }
}

export function dueCount(words, repeatSettings, now = new Date()) {
  return words.filter(w => isDue(w, repeatSettings, now)).length
}
