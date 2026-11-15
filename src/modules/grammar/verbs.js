// неправильные глаголы: справочник по библиотекам и поиск по любой форме или переводу
import en from './verbs/en.js'
import de from './verbs/de.js'

// названия форм по порядку (ключи перевода grammar.forms.*) и чем пример отличается
export const FORMS = {
  en: ['inf', 'past', 'participle'],
  de: ['infinitiv', 'praeteritum', 'perfekt'],
}

// forms — основные формы; ipa — транскрипции (только EN); present — er-форма (только DE);
// examples — [{ form, text, ru, uk }] на 2-ю и 3-ю форму; keys — все формы для поиска
function toVerb(row) {
  const keys = new Set()
  for (const f of [...row.v, row.er].filter(Boolean)) {
    for (const v of f.split('/')) keys.add(v.replace(/^(hat|ist) /, '').toLowerCase())
  }
  return {
    base:     row.v[0],
    forms:    row.v,
    ipa:      row.ipa ?? null,
    present:  row.er ?? null,
    ru:       row.ru,
    uk:       row.uk,
    note:     row.note ?? null,
    examples: row.ex.map(([text, ru, uk], i) => ({ form: i + 1, text, ru, uk })),
    keys:     [...keys],
  }
}

const VERBS = {
  en: en.map(toVerb),
  de: de.map(toVerb),
}

export function verbsOf(libraryId) {
  return VERBS[libraryId] ?? []
}

// подписи форм в словаре — термины, одинаковые для ru и uk
const FORM_NOTES = {
  en: [null, 'Past Simple', 'Past Participle'],
  de: [null, 'Präteritum', 'Perfekt'],
}

// глагол → слово для словаря (wordsRepo.create): перевод на языке интерфейса, остальные формы —
// формами слова (went, gone; DE — ещё er-форма; ist/hat — в подписи), примеры — без перевода
export function verbAsWord(verb, libraryId, locale) {
  const notes = FORM_NOTES[libraryId] ?? []
  const forms = []
  verb.forms.forEach((f, i) => {
    if (!i) return
    const ipa = verb.ipa?.[i].split('/') ?? []
    f.split('/').forEach((w, k) => {
      const aux = w.match(/^(hat|ist) /)?.[1]
      forms.push({
        word:          aux ? w.slice(aux.length + 1) : w,
        transcription: ipa[k] ?? null,
        note:          aux ? `${notes[i]} · ${aux}` : notes[i],
      })
    })
  })
  if (verb.present) forms.push({ word: verb.present, note: 'Präsens · er' })
  // форма, совпадающая со словом (come — came — come, hat vergessen), словарю не нужна
  const base = verb.base.toLowerCase()
  return {
    word:          verb.base,
    translation:   verb[locale].split(',').map(s => s.trim()),
    transcription: verb.ipa?.[0] ?? null,
    examples:      verb.examples.map(e => e.text),
    forms:         forms.filter(f => f.word.toLowerCase() !== base),
  }
}

// справочник для ядра (core/reference/reference.js): exact — нажатое слово целиком совпадает с формой (went)
export function verbReferences(libraryId, text, { locale, exact }) {
  const q    = text.trim().toLowerCase()
  const list = exact ? verbsOf(libraryId).filter(v => v.keys.includes(q)) : searchVerbs(libraryId, q, locale)
  return list.map(v => ({
    key:      v.base,
    title:    v.forms.join(' — '),
    subtitle: v[locale],
    word:     verbAsWord(v, libraryId, locale),
    to:       { name: 'grammar-verbs', query: { open: v.base } },
  }))
}

// форма с начала (wen → went) или перевод с любого слова (идти → go)
export function searchVerbs(libraryId, query, locale) {
  const q = query.trim().toLowerCase()
  const list = verbsOf(libraryId)
  if (!q) return list
  return list.filter(v => v.keys.some(k => k.startsWith(q))
    || v[locale]?.toLowerCase().split(/[\s,()]+/).some(w => w.startsWith(q)))
}
