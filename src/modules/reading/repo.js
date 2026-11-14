// место чтения встроенных текстов
import { db } from '@/core/db.js'
import { nowIso } from '@/shared/utils/dates.js'

export const readingRepo = {
  get(textId) {
    return db.reading.get(textId)
  },

  all(libraryId) {
    return db.reading.where('library_id').equals(libraryId).toArray()
  },

  // последний открытый текст библиотеки
  async last(libraryId) {
    const list = await readingRepo.all(libraryId)
    return list.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ?? null
  },

  // { text_id, library_id, chapter, word, percent, finished }
  async save(progress) {
    const row = { ...progress, updated_at: nowIso() }
    await db.reading.put(row)
    return row
  },
}
