// изучение, повторение и счётчики занятий по дням
import { db } from '@/core/db.js'
import { settingsRepo } from '@/core/settings/repo.js'
import { nowIso, localDate, lastDays } from '@/shared/utils/dates.js'
import { pickForStudy, pickForRepeat, pickExtra, soonDueAt, OUTCOME } from './domain.js'

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
  // ids — учить только из этих слов (например, слова текста из «Чтения»)
  async start(libraryId, ids = null) {
    const all      = await wordsOf(libraryId)
    const only     = ids && new Set(ids.map(String))
    const newWords = only ? pickForStudy(all.filter(w => only.has(String(w.id))), Infinity) : pickForStudy(all)
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

  // outcomes — { id слова: OUTCOME } (см. domain.js)
  async complete(libraryId, outcomes) {
    const now  = nowIso()
    const soon = soonDueAt()
    const ids  = kind => Object.keys(outcomes).filter(id => outcomes[id] === kind)

    await db.transaction('rw', db.words, db.sessions, async () => {
      // «Знаю»: остаётся или становится «Знаю» — повторяется раз в repeat.days_known дней
      await db.words.where('id').anyOf(ids(OUTCOME.KNOWN)).modify({
        is_ignored: true, repeated_at: now, repeat_soon_at: null, updated_at: now,
      })
      // помню — обычный график; «Знаю» с ошибкой становится обычным выученным
      await db.words.where('id').anyOf(ids(OUTCOME.OK)).modify(w => {
        Object.assign(w, {
          is_learned: true, is_ignored: false, learned_at: w.learned_at ?? now,
          repeated_at: now, repeat_soon_at: null, updated_at: now,
        })
      })
      // нужно закрепить — выученное, но вне очереди
      await db.words.where('id').anyOf(ids(OUTCOME.SOON)).modify(w => {
        Object.assign(w, {
          is_learned: true, is_ignored: false, learned_at: w.learned_at ?? now,
          repeated_at: now, repeat_soon_at: soon, updated_at: now,
        })
      })
      // заново — обратно в новые
      await db.words.where('id').anyOf(ids(OUTCOME.NEW)).modify({
        is_learned: false, is_ignored: false, learned_at: null, repeated_at: null,
        repeat_soon_at: null, updated_at: now,
      })
      const repeated = Object.values(outcomes).filter(o => o !== OUTCOME.NEW).length
      await addToSession(libraryId, 'words_repeated', repeated)
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
