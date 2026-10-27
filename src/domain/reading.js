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
