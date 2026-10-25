// CSV: «слово;перевод1|перевод2;транскрипция;пример1|пример2»
// совместим с форматом старого бэкенда (fputcsv с разделителем ;)

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

export function parseWordsCsv(text) {
  return parseRows(text.replace(/^﻿/, ''))
    .map(([word = '', translation, transcription, examples]) => ({
      word:          word.trim(),
      translation:   splitList(translation),
      transcription: (transcription ?? '').trim() || null,
      examples:      splitList(examples),
    }))
    .filter(r => r.word)
}

function escape(value) {
  const s = String(value ?? '')
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// BOM — чтобы Excel открыл UTF-8 без кракозябр
export function stringifyWordsCsv(words) {
  const lines = words.map(w => [
    w.word,
    (w.translation ?? []).join(LIST),
    w.transcription ?? '',
    (w.examples ?? []).join(LIST),
  ].map(escape).join(SEP))
  return BOM + lines.join('\r\n') + '\r\n'
}
