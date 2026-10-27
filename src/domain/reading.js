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

// new — не открывали, reading — читается, finished — дочитан
export function readStatus(progress) {
  if (!progress) return 'new'
  return progress.finished ? 'finished' : 'reading'
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
