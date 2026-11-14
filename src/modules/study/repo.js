// изучение, повторение и счётчики занятий по дням
import { db } from '@/core/db.js'
import { settingsRepo } from '@/core/settings/repo.js'
import { nowIso, localDate, lastDays } from '@/shared/utils/dates.js'
import { pickForStudy, pickForRepeat, pickExtra } from './domain.js'

function wordsOf(libraryId) {
  return db.words.where('library_id').equals(libraryId).toArray()
}

async function addToSession(libraryId, field, count) {
  if (!count) return
  const key      = [libraryId, localDate()]
  const existing = await db.sessions.get(key)
  if (existing) {
    await db.sessions.update(key, { [field]: existing[field] + count })
  } else {
    await db.sessions.add({
      library_id: libraryId, date: key[1],
      words_studied: 0, words_repeated: 0, [field]: count,
    })
  }
}

export const studyRepo = {
  async start(libraryId) {
    const all      = await wordsOf(libraryId)
    const newWords = pickForStudy(all)
    return { newWords, extraWords: pickExtra(all) }
  },

  async complete(libraryId, learnedIds) {
    const now = nowIso()
    await db.transaction('rw', db.words, db.sessions, async () => {
      await db.words.where('id').anyOf(learnedIds).modify({
        is_learned: true, learned_at: now, updated_at: now,
      })
      await addToSession(libraryId, 'words_studied', learnedIds.length)
    })
  },
}

export const repeatRepo = {
  async start(libraryId) {
    const { repeat: rs } = await settingsRepo.get()
    const all            = await wordsOf(libraryId)
    const { words: due, total } = pickForRepeat(all, rs)

    if (due.length < rs.words_per_session) {
      return { hasEnough: false, required: rs.words_per_session, count: total }
    }

    return {
      hasEnough:  true,
      words:      due,
      extraWords: pickExtra(all, due.map(w => w.id)),
    }
  },

  async complete(libraryId, repeatedIds, failedIds) {
    const now = nowIso()
    await db.transaction('rw', db.words, db.sessions, async () => {
      await db.words.where('id').anyOf(repeatedIds).modify({ repeated_at: now, updated_at: now })
      // проваленные — обратно в невыученные (и «Знаю» тоже — значит, не так уж и знаю)
      await db.words.where('id').anyOf(failedIds).modify({
        is_learned: false, is_ignored: false, learned_at: null, repeated_at: null, updated_at: now,
      })
      await addToSession(libraryId, 'words_repeated', repeatedIds.length)
    })
  },
}

// выучено / повторено по дням за последние N дней
export async function activity(libraryId, days = 30) {
  const sessions = await db.sessions.where('library_id').equals(libraryId).toArray()
  const byDate   = new Map(sessions.map(s => [s.date, s]))
  return lastDays(days).map(date => ({
    date,
    studied:  byDate.get(date)?.words_studied  ?? 0,
    repeated: byDate.get(date)?.words_repeated ?? 0,
  }))
}
