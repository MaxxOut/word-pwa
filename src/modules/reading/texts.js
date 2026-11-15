// скачанные тексты: сам текст — в базе (reading_texts), в памяти — только какие скачаны
import { reactive } from 'vue'
import { db } from '@/core/db.js'
import { nowIso } from '@/shared/utils/dates.js'
import { fetchText, findText, textsOf } from './content/index.js'

export const saved = reactive(new Set()) // id скачанных текстов

let loading = null

export function loadSaved() {
  // сбой (база занята обновлением в другой вкладке) не запоминаем — следующий вызов попробует снова
  loading ??= db.reading_texts.toCollection().primaryKeys().then(ids => {
    saved.clear()
    ids.forEach(id => saved.add(id))
  }, e => {
    loading = null
    throw e
  })
  return loading
}

async function download(entry) {
  const text = await fetchText(entry)
  // не сохранился (место кончилось) — всё равно читаем, просто без копии на телефоне
  try {
    await db.reading_texts.put({ id: entry.id, library_id: entry.library_id, hash: entry.hash, text, saved_at: nowIso() })
    saved.add(entry.id)
  } catch { /* остаётся облако — скачать снова */ }
  return text
}

// текст для книги: с телефона; нет или устарел (текст обновили) — скачать.
// Устаревший без сети — читаем старый
export async function getText(id) {
  const entry = findText(id)
  if (!entry) return null
  const row = await db.reading_texts.get(id)
  if (row?.hash === entry.hash) return row.text
  try {
    return await download(entry)
  } catch (e) {
    if (row) return row.text
    throw e
  }
}

// по одному: сбой посередине оставляет скачанное. onProgress(готово, всего)
export async function downloadAll(libraryId, onProgress) {
  await loadSaved()
  const missing = textsOf(libraryId).filter(t => !saved.has(t.id))
  for (const [i, entry] of missing.entries()) {
    onProgress?.(i, missing.length)
    await download(entry)
  }
}

export async function removeTexts(ids) {
  await db.reading_texts.bulkDelete(ids)
  ids.forEach(id => saved.delete(id))
}

// сводка для меню: id скачанных (и из них дочитанных) текстов библиотеки, место скачанное / недостающее
export function savedStats(libraryId, finishedIds = new Set()) {
  const all  = textsOf(libraryId)
  const have = all.filter(t => saved.has(t.id))
  const sum  = list => list.reduce((a, t) => a + t.bytes, 0)
  return {
    total:        all.length,
    saved:        have.map(t => t.id),
    finished:     have.filter(t => finishedIds.has(t.id)).map(t => t.id),
    savedBytes:   sum(have),
    missingBytes: sum(all) - sum(have),
  }
}
