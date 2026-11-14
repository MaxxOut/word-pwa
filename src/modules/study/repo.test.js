import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { wordsRepo as words } from '@/core/words/repo.js'
import { librariesRepo as libraries } from '@/core/library/repo.js'
import { localDate } from '@/shared/utils/dates.js'
import { studyRepo as study, repeatRepo as repeat, activity } from './repo.js'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('study and repeat', () => {
  it('records learned words and session counters', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    const b = await words.create('en', { word: 'dog', translation: ['собака'] })
    await study.complete('en', [a.id, b.id])

    expect((await db.words.get(a.id)).is_learned).toBe(true)
    expect(await db.sessions.get(['en', localDate()])).toMatchObject({ words_studied: 2, words_repeated: 0 })

    await repeat.complete('en', [a.id], [b.id])
    expect((await db.words.get(a.id)).repeated_at).toBeTruthy()
    expect(await db.words.get(b.id)).toMatchObject({ is_learned: false, learned_at: null })
    expect(await db.sessions.get(['en', localDate()])).toMatchObject({ words_studied: 2, words_repeated: 1 })

    const days = await activity('en', 7)
    expect(days.at(-1)).toEqual({ date: localDate(), studied: 2, repeated: 1 })
  })

  // sessions объявлена в schema.js с library: ['reset', 'clear'] — ядро чистит её само
  it('reset progress keeps words, clears marks and history', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    await study.complete('en', [a.id])
    await libraries.resetProgress('en')
    expect(await db.words.get(a.id)).toMatchObject({ is_learned: false, learned_at: null })
    expect(await db.sessions.count()).toBe(0)
  })

  it('clear removes words and history of that library only', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    const b = await words.create('de', { word: 'Katze', translation: ['кошка'] })
    await study.complete('en', [a.id])
    await study.complete('de', [b.id])
    await libraries.clear('en')
    expect(await db.words.count()).toBe(1)
    expect(await db.sessions.where('library_id').equals('de').count()).toBe(1)
    expect(await db.sessions.where('library_id').equals('en').count()).toBe(0)
  })
})
