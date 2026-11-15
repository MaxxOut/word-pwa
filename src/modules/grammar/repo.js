// результаты тренировок по темам: последний и лучший процент, сколько раз, когда
import { db } from '@/core/db.js'
import { nowIso, localDate } from '@/shared/utils/dates.js'

const key = (libraryId, topic) => `${libraryId}:${topic}`

export const grammarRepo = {
  get(libraryId, topic) {
    return db.grammar.get(key(libraryId, topic))
  },

  // только темы (без служебных строк): { topic → строка }
  async all(libraryId) {
    const rows = await db.grammar.where('library_id').equals(libraryId).toArray()
    return new Map(rows.filter(r => r.topic).map(r => [r.topic, r]))
  },

  // записать результат; → { prev — прошлый процент или null, row }
  async saveResult(libraryId, topic, percent) {
    const old = await grammarRepo.get(libraryId, topic)
    const row = {
      id:           key(libraryId, topic),
      library_id:   libraryId,
      topic,
      last:         percent,
      best:         Math.max(percent, old?.best ?? 0),
      count:        (old?.count ?? 0) + 1,
      practiced_at: nowIso(),
    }
    await db.grammar.put(row)
    return { prev: old?.last ?? null, row }
  },

  // тренировки по дням — для «Активности» на главной: { 'YYYY-MM-DD': сколько }
  async days(libraryId) {
    return (await db.grammar.get(key(libraryId, '_days')))?.days ?? {}
  },

  async markDay(libraryId) {
    const days  = await grammarRepo.days(libraryId)
    const today = localDate()
    days[today] = (days[today] ?? 0) + 1
    await db.grammar.put({ id: key(libraryId, '_days'), library_id: libraryId, days })
  },

  // когда какой неправильный глагол встречался в тренировках — чтобы чередовать: { глагол: дата }
  async recentVerbs(libraryId) {
    return (await db.grammar.get(key(libraryId, '_verbs')))?.used ?? {}
  },

  async markVerbs(libraryId, verbs) {
    const used = await grammarRepo.recentVerbs(libraryId)
    const now  = nowIso()
    for (const v of verbs) used[v] = now
    await db.grammar.put({ id: key(libraryId, '_verbs'), library_id: libraryId, used })
  },
}
