// слова библиотек — общие для всех модулей (IndexedDB через Dexie)

import { db } from '@/core/db.js'
import { uuid } from '@/shared/utils/uuid.js'
import { nowIso } from '@/shared/utils/dates.js'
import { DuplicateWordError, NotFoundError } from './errors.js'
import { normalizeWord, wordStatus } from './domain.js'

const SORT_FIELDS = ['word', 'created_at', 'learned_at', 'repeated_at']

function wordsOf(libraryId) {
  return db.words.where('library_id').equals(libraryId).toArray()
}

function cleanList(list) {
  return (list ?? []).map(s => s.trim()).filter(Boolean)
}

async function findDuplicate(libraryId, text, exceptId = null) {
  const found = await db.words
    .where('[library_id+word_lc]').equals([libraryId, normalizeWord(text)])
    .first()
  return found && found.id !== exceptId ? found : null
}

// ----- слова -----

export const wordsRepo = {
  async page(libraryId, {
    page = 1, perPage = 20, search = '', isLearned = null, isIgnored = null,
    statuses = [], sort = 'created_at', sortDir = 'desc',
  } = {}) {
    let list = await wordsOf(libraryId)

    if (isLearned !== null) list = list.filter(w => w.is_learned === isLearned)
    if (isIgnored !== null) list = list.filter(w => w.is_ignored === isIgnored)
    if (statuses.length)    list = list.filter(w => statuses.includes(wordStatus(w)))
    if (search.trim()) {
      const q = normalizeWord(search)
      list = list.filter(w => w.word_lc.includes(q))
    }

    const field = SORT_FIELDS.includes(sort) ? sort : 'created_at'
    const dir   = sortDir === 'asc' ? 1 : -1
    list.sort((a, b) => (a[field] ?? '').localeCompare(b[field] ?? '') * dir)

    const size = Math.min(perPage, 100)
    return {
      items: list.slice((page - 1) * size, page * size),
      total: list.length,
    }
  },

  all(libraryId) {
    return wordsOf(libraryId)
  },

  // слово библиотеки без учёта регистра или null
  async find(libraryId, text) {
    return (await findDuplicate(libraryId, text)) ?? null
  },

  async create(libraryId, data) {
    const text = data.word.trim()
    if (await findDuplicate(libraryId, text)) throw new DuplicateWordError(text)

    const now  = nowIso()
    const word = {
      id:            uuid(),
      library_id:    libraryId,
      word:          text,
      word_lc:       normalizeWord(text),
      translation:   cleanList(data.translation),
      transcription: data.transcription?.trim() || null,
      examples:      cleanList(data.examples),
      is_learned:    false,
      is_ignored:    false,
      learned_at:    null,
      repeated_at:   null,
      created_at:    now,
      updated_at:    now,
    }
    await db.words.add(word)
    return word
  },

  async update(id, data) {
    const word = await db.words.get(id)
    if (!word) throw new NotFoundError(`word ${id}`)

    const patch = { updated_at: nowIso() }

    if (data.word !== undefined) {
      const text = data.word.trim()
      if (await findDuplicate(word.library_id, text, id)) throw new DuplicateWordError(text)
      patch.word    = text
      patch.word_lc = normalizeWord(text)
    }
    if (data.translation   !== undefined) patch.translation   = cleanList(data.translation)
    if (data.examples      !== undefined) patch.examples      = cleanList(data.examples)
    if (data.transcription !== undefined) patch.transcription = data.transcription?.trim() || null
    if (data.is_ignored    !== undefined) patch.is_ignored    = !!data.is_ignored

    // отметили выученным — ставим дату; сняли отметку — сбрасываем даты
    if (data.is_learned !== undefined && !!data.is_learned !== word.is_learned) {
      patch.is_learned  = !!data.is_learned
      patch.learned_at  = data.is_learned ? nowIso() : null
      patch.repeated_at = null
    }

    await db.words.update(id, patch)
    return { ...word, ...patch }
  },

  remove(id) {
    return db.words.delete(id)
  },

  // импорт строк из CSV; strategy: skip | replace.
  // Если в строке есть прогресс — он переносится (и при замене дубля тоже)
  async import(libraryId, rows, strategy = 'skip') {
    const result = { imported: 0, skipped: 0, replaced: 0 }

    await db.transaction('rw', db.words, async () => {
      const existing = new Map((await wordsOf(libraryId)).map(w => [w.word_lc, w]))
      const now      = nowIso()
      const toAdd    = []

      for (const row of rows) {
        const key = normalizeWord(row.word)
        const dup = existing.get(key)

        if (dup && strategy === 'skip') { result.skipped++; continue }

        const content = {
          word:          row.word.trim(),
          translation:   cleanList(row.translation),
          transcription: row.transcription || null,
          examples:      cleanList(row.examples),
        }
        const progress = row.progress && progressFrom(row.progress, now)

        if (dup) {
          const patch = { ...content, ...progress, updated_at: now }
          if (progress) patch.created_at = row.progress.created_at ?? dup.created_at
          await db.words.update(dup.id, patch)
          Object.assign(dup, patch)
          result.replaced++
          continue
        }

        const word = {
          id: uuid(), library_id: libraryId, word_lc: key, ...content,
          is_learned: false, is_ignored: false,
          learned_at: null, repeated_at: null,
          ...progress,
          created_at: row.progress?.created_at ?? now, updated_at: now,
        }
        existing.set(key, word) // дубли внутри самого файла
        toAdd.push(word)
        result.imported++
      }

      await db.words.bulkAdd(toAdd)
    })

    return result
  },
}

// выученное без даты — считаем выученным сейчас, иначе не попадёт в повторение
function progressFrom(p, now) {
  return {
    is_learned:  p.is_learned,
    is_ignored:  p.is_ignored,
    learned_at:  p.is_learned ? (p.learned_at ?? now) : null,
    repeated_at: p.is_learned || p.is_ignored ? p.repeated_at : null,
  }
}
