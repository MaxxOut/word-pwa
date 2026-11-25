// чтение: разбор текста на абзацы и слова, прогресс.
// Место чтения — номер слова в главе: не зависит от размера экрана и шрифта.

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

// абзацы → слова (слово — всё между пробелами, со знаками препинания)
export function parseChapter(text) {
  let i = 0
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => p.split(/\s+/).map(t => ({ t, i: i++ })))
}

export function chapterSizes(text) {
  return text.chapters.map(c => c.text.split(/\s+/).filter(Boolean).length)
}

// доля прочитанного 0–100 по главе и слову
export function readPercent(text, chapter, word) {
  const sizes = chapterSizes(text)
  const total = sizes.reduce((a, b) => a + b, 0)
  const done  = sizes.slice(0, chapter).reduce((a, b) => a + b, 0) + word
  return total ? Math.min(100, Math.round((done / total) * 100)) : 0
}

// ----- стадии текста -----
// два флага в записи о чтении, ставятся и снимаются в конце текста независимо:
// finished — «Прочитан» (ставится сам, когда дочитал), learned — «Изучен» (done — так было раньше).
// В списках: learned → read → reading (начат) → new (не открывали)
export const STAGES = ['new', 'reading', 'read', 'learned']

export function textStage(progress) {
  if (!progress) return 'new'
  if (progress.learned ?? progress.done) return 'learned'
  if (progress.finished) return 'read'
  return 'reading'
}

const isLearned = w => !!(w.is_learned || w.is_ignored)

// что учить из текста: невыученные с переводом
export function wordsToStudy(words) {
  return words.filter(w => !isLearned(w) && (w.translation ?? []).some(x => x.trim()))
}

// слова словаря, что встречаются в тексте целым словом (или формой), без учёта регистра.
// Фраза из нескольких слов — подстрокой по границам слов
export function matchWords(text, words) {
  const body   = text.chapters.map(c => c.text).join('\n').toLowerCase()
  const tokens = new Set(body.split(/\s+/).map(cleanToken).filter(Boolean))
  const has = raw => {
    const w = raw.trim().toLowerCase()
    if (!w) return false
    if (!/\s/.test(w)) return tokens.has(w)
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^\\p{L}\\p{N}])${esc}($|[^\\p{L}\\p{N}])`, 'u').test(body)
  }
  return words.filter(w => has(w.word) || (w.forms ?? []).some(f => has(f.word))).map(w => w.id)
}

// ----- слово из текста -----

const EDGE_PUNCT = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu

// «"Grapes,» → «Grapes»: знаки по краям прочь, апостроф и дефис внутри остаются
export function cleanToken(token) {
  return token.replace(EDGE_PUNCT, '')
}

// кавычки прямой речи в примере только мешают — убираем все (апостроф ’ в don’t не трогаем)
const QUOTES        = /["„“”«»]/g
const SENTENCE_END  = /[.!?…]["„“”«»'‘’)]*$/
const CLAUSE_END    = /[.!?…,;:]["„“”«»'‘’)]*$/
const DASH          = /^[—–-]$/

// пример к слову: предложение, если оно короткое; иначе — его кусок между знаками препинания;
// кусок тоже длинный — '' (обрывок посреди фразы примером не годится).
// tokens — слова абзаца, k — номер слова в абзаце
export function exampleAround(tokens, k, max = 8) {
  const span = (isEnd, from, to) => {
    let start = k
    while (start > from && !isEnd(tokens[start - 1])) start--
    let end = k
    while (end < to && !isEnd(tokens[end])) end++
    if (DASH.test(tokens[start] ?? '') && start < k) start++
    if (DASH.test(tokens[end] ?? '') && end > k) end--
    return [start, end]
  }

  const [sStart, sEnd] = span(t => SENTENCE_END.test(t), 0, tokens.length - 1)
  let [start, end] = [sStart, sEnd]

  if (end - start + 1 > max) {
    ;[start, end] = span(t => CLAUSE_END.test(t) || DASH.test(t), sStart, sEnd)
  }
  if (end - start + 1 > max) return ''

  let text = tokens.slice(start, end + 1).join(' ').replace(QUOTES, '').replace(/^\(|\)$/g, '')
  // кусок предложения — без запятой/двоеточия в конце
  if (start !== sStart || end !== sEnd) text = text.replace(/[,;:—–-]+$/, '')
  return text.trim()
}

// ----- возможная начальная форма (dogs → dog, worked → work, gemacht → machen) -----
// Только кандидаты по окончаниям: что из них есть в словаре, решает вызывающий,
// а присоединяет форму всегда пользователь — совпадение может быть случайным

const EN_RULES = [
  [/'s$/, ''], [/ies$/, 'y'], [/ied$/, 'y'], [/ier$/, 'y'], [/iest$/, 'y'],
  [/es$/, ''], [/s$/, ''], [/ed$/, ''], [/ed$/, 'e'], [/ing$/, ''], [/ing$/, 'e'],
  [/er$/, ''], [/est$/, ''], [/er$/, 'e'], [/est$/, 'e'],
  // удвоенная согласная: stopped → stop, running → run, bigger → big
  [/([bcdfgklmnprstvz])\1(ed|ing|er|est)$/, '$1'],
]

// немецкий: окончание прочь, к основе — варианты инфинитива и существительного
const DE_ENDINGS = ['ern', 'ens', 'est', 'ten', 'te', 'en', 'er', 'es', 'st', 'et', 'em', 'e', 'n', 's', 't']

function deStems(w) {
  const stems = new Set()
  for (const end of DE_ENDINGS) if (w.length > end.length + 2 && w.endsWith(end)) stems.add(w.slice(0, -end.length))
  // Partizip II: gemacht → mach, gesehen → seh
  const ge = w.match(/^ge(.+?)(t|en)$/)
  if (ge && ge[1].length > 1) stems.add(ge[1])
  return [...stems]
}

export function baseCandidates(text, lang) {
  const w   = text.toLowerCase()
  const out = new Set()
  if (lang === 'de') {
    for (const s of deStems(w)) [s, s + 'en', s + 'n', s + 'e'].forEach(c => out.add(c))
  } else {
    for (const [re, to] of EN_RULES) if (re.test(w)) out.add(w.replace(re, to))
  }
  out.delete(w)
  return [...out].filter(c => c.length > 1)
}

// ответ ИИ — начальная форма нажатого (peeped → peep, children → child, gemacht → machen)
// или вообще другое слово (в буфере остался ответ про прошлое слово). Неправильные глаголы
// (went → go) — по справочнику, это проверяет книга
export function looksLikeBase(form, base, lang) {
  const f = form.trim().toLowerCase()
  const b = base.trim().toLowerCase()
  if (f === b || baseCandidates(f, lang).includes(b)) return true
  // форма не короче основы: car — не форма card
  if (f.length < b.length) return false
  let n = 0
  while (n < f.length && f[n] === b[n]) n++
  return n >= 3 && n >= b.length - 2
}
