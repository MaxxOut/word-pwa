// место чтения встроенных текстов и своих книг, стадия текста и его слова
import { db } from '@/core/db.js'
import { wordsRepo } from '@/core/words/repo.js'
import { nowIso } from '@/shared/utils/dates.js'
import { textStage, matchWords } from './domain.js'

// запись о чтении: { text_id, library_id, chapter, word, percent, finished, done,
// word_ids — слова текста (добавлены из книги или найдены в нём), matched — сколько слов было в словаре при сверке текста }
const blank = (textId, libraryId) => ({
  text_id: textId, library_id: libraryId, chapter: 0, word: 0, percent: 0, finished: false,
})

// дописать поля в запись (нет записи — завести). В транзакции: место чтения и слова пишут вперемешку
function patch(textId, libraryId, fields) {
  return db.transaction('rw', db.reading, async () => {
    const old = await db.reading.get(textId)
    const row = { ...(old ?? blank(textId, libraryId)), ...fields(old), updated_at: nowIso() }
    await db.reading.put(row)
    return row
  })
}

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

  // { text_id, library_id, chapter, word, percent } и/или finished, done — остальное в записи остаётся
  save(progress) {
    return patch(progress.text_id, progress.library_id, () => progress)
  },

  // слово добавили из книги — связать с текстом
  link(textId, libraryId, wordId) {
    return patch(textId, libraryId, row => ({ word_ids: [...new Set([...(row?.word_ids ?? []), wordId])] }))
  },

  // слова текста из словаря. Словарь изменился (matched — сколько слов было при сверке) — сверить
  // текст заново: слова, добавленные не из книги (импорт, экран слов), после очистки библиотеки
  async words(text, all = null) {
    const words = all ?? await wordsRepo.all(text.library_id)
    let row = await db.reading.get(text.id)
    if (row?.matched !== words.length) {
      const known = new Set(words.map(w => w.id))
      const found = matchWords(text, words)
      row = await patch(text.id, text.library_id, r => ({
        word_ids: [...new Set([...(r?.word_ids ?? []).filter(id => known.has(id)), ...found])],
        matched:  words.length,
      }))
    }
    const ids = new Set(row.word_ids)
    return words.filter(w => ids.has(w.id))
  },

  // стадии текстов библиотеки: text_id → { stage, percent }
  async stages(libraryId) {
    const [rows, words] = await Promise.all([readingRepo.all(libraryId), wordsRepo.all(libraryId)])
    const byId = new Map(words.map(w => [w.id, w]))
    return new Map(rows.map(p => [p.text_id, {
      stage:   textStage(p, (p.word_ids ?? []).map(id => byId.get(id)).filter(Boolean)),
      percent: p.percent ?? 0,
    }]))
  },
}
