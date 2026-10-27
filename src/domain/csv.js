// CSV: «слово;перевод1|перевод2;транскрипция;пример1|пример2;статус;выучено;повторено;добавлено»
// первые 4 колонки — формат старого бэкенда (fputcsv с разделителем ;), такие файлы
// импортируются как новые слова. Остальные — прогресс: статус learned / ignored /
// learned|ignored / пусто, даты в ISO. Файл экспорта = резервная копия библиотеки.

const SEP  = ';'
const LIST = '|'
const BOM  = '﻿'

// разбор с учётом кавычек: "текст; с ""кавычками"""
function parseRows(text) {
  const rows = []
  let row = [], field = '', quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === SEP) { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row)
      row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

function splitList(value) {
  return (value ?? '').split(LIST).map(s => s.trim()).filter(Boolean)
}

// кривую дату считаем пустой — не ломать импорт из-за одной ячейки
function parseDate(value) {
  const s = (value ?? '').trim()
  if (!s) return null
  const d = new Date(s)
  return isNaN(d) ? null : d.toISOString()
}

function parseProgress([status, learnedAt, repeatedAt, createdAt]) {
  const flags      = splitList(status).map(s => s.toLowerCase())
  const is_learned = flags.includes('learned')
  return {
    is_learned,
    is_ignored:  flags.includes('ignored'),
    learned_at:  is_learned ? parseDate(learnedAt) : null,
    repeated_at: is_learned ? parseDate(repeatedAt) : null,
    created_at:  parseDate(createdAt),
  }
}

// progress — null, если в строке только 4 колонки (прогресса в файле нет)
export function parseWordsCsv(text) {
  return parseRows(text.replace(/^﻿/, ''))
    .map(([word = '', translation, transcription, examples, ...rest]) => ({
      word:          word.trim(),
      translation:   splitList(translation),
      transcription: (transcription ?? '').trim() || null,
      examples:      splitList(examples),
      progress:      rest.length ? parseProgress(rest) : null,
    }))
    .filter(r => r.word)
}

function statusOf(w) {
  return [w.is_learned && 'learned', w.is_ignored && 'ignored'].filter(Boolean).join(LIST)
}

function escape(value) {
  const s = String(value ?? '')
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// BOM — чтобы Excel открыл UTF-8 без кракозябр
// progress: false — только 4 колонки слова (например, отдать ИИ заполнить переводы):
// при импорте с заменой прогресс слов тогда не трогается
export function stringifyWordsCsv(words, { progress = true } = {}) {
  const lines = words.map(w => [
    w.word,
    (w.translation ?? []).join(LIST),
    w.transcription ?? '',
    (w.examples ?? []).join(LIST),
    ...(progress ? [statusOf(w), w.learned_at ?? '', w.repeated_at ?? '', w.created_at ?? ''] : []),
  ].map(escape).join(SEP))
  return BOM + lines.join('\r\n') + '\r\n'
}
