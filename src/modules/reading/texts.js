// скачанные тексты: сам текст — в базе (reading_texts), в памяти — только какие скачаны.
// Там же свои тексты (внешние книги): id «user-…», только на телефоне — удалить = навсегда
import { reactive } from 'vue'
import { db } from '@/core/db.js'
import { nowIso } from '@/shared/utils/dates.js'
import { uuid } from '@/shared/utils/uuid.js'
import { fetchText, findText, textsOf } from './content/index.js'
import { textWords } from './importText.js'

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
  const row   = await db.reading_texts.get(id)
  if (!entry) return isUserText(id) ? row?.text ?? null : null
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

// ----- свои тексты (внешние книги) -----

export const isUserText = id => id.startsWith('user-')

// → id нового текста
export async function addUserText({ libraryId, title, chapters: raw }) {
  // из шторки главы приходят реактивными (Proxy) — IndexedDB их не сохранит: только простые объекты
  const chapters = raw.map(c => ({ title: c.title ?? '', text: c.text }))
  const id   = `user-${uuid()}`
  const text = { id, title, chapters, library_id: libraryId, user: true }
  await db.reading_texts.put({
    id, library_id: libraryId, user: true, title,
    words: textWords(chapters), chapters: chapters.length,
    text, saved_at: nowIso(),
  })
  saved.add(id)
  return id
}

// список без самих текстов: { id, title, words, chapters, saved_at }, новые сверху
export async function userTextsOf(libraryId) {
  const rows = await db.reading_texts.where('library_id').equals(libraryId).filter(r => !!r.user).toArray()
  return rows
    .map(({ id, title, words, chapters, saved_at }) => ({ id, title, words, chapters, saved_at }))
    .sort((a, b) => b.saved_at.localeCompare(a.saved_at))
}

// вместе с местом чтения: скачать заново неоткуда, закладка без текста не нужна
export async function removeUserText(id) {
  await db.transaction('rw', db.reading_texts, db.reading, async () => {
    await db.reading_texts.delete(id)
    await db.reading.delete(id)
  })
  saved.delete(id)
}

// для плитки «Продолжить чтение»: { title, chapters (названия), level } — из каталога или своя книга
export async function textInfo(id) {
  const entry = findText(id)
  if (entry) return { title: entry.title, chapters: entry.chapters, level: entry.level }
  if (!isUserText(id)) return null
  const row = await db.reading_texts.get(id)
  return row ? { title: row.title, chapters: row.text.chapters.map(c => c.title ?? ''), level: null } : null
}
