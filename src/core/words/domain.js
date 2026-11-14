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

// ----- формы слова (dogs → dog, went → go) -----
// Форма — дополнение к слову, не отдельное слово: не учится и не повторяется.
// У формы необязательные перевод, транскрипция и пометка (мн. ч., прош. вр. — пишет пользователь)
export const MAX_FORMS = 5

// | и = разделяют формы и их поля в CSV (core/words/csv.js) — внутри полей заменяем
const safe         = text => text.replace(/\|/g, '/').replace(/=/g, '-')
const cleanStrings = list => (list ?? []).map(s => safe(s.trim())).filter(Boolean)

// привести формы к виду для базы: без пустых, без повторов и без самого слова, не больше MAX_FORMS
export function normalizeForms(forms, word = '') {
  const seen = new Set([normalizeWord(word)])
  const out  = []
  for (const f of forms ?? []) {
    const text = safe((f.word ?? '').trim())
    const key  = normalizeWord(text)
    if (!text || seen.has(key)) continue
    seen.add(key)
    out.push({
      word:          text,
      translation:   cleanStrings(f.translation),
      transcription: safe(f.transcription?.trim() ?? '') || null,
      note:          safe(f.note?.trim() ?? '') || null,
    })
  }
  return out.slice(0, MAX_FORMS)
}

// ключи индекса «форма → слово»: библиотека + форма в нижнем регистре
export function formKeys(libraryId, forms) {
  return (forms ?? []).map(f => `${libraryId}:${normalizeWord(f.word)}`)
}
