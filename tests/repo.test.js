import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../src/data/local/db.js'
import repo from '../src/data/local/index.js'
import { DuplicateWordError } from '../src/data/errors.js'
import { parseWordsCsv, stringifyWordsCsv } from '../src/domain/csv.js'
import { localDate } from '../src/domain/dates.js'

const { words, libraries, study, repeat, stats } = repo

beforeEach(async () => {
  await db.delete()
  await db.open()
})

const byWord = async lib => Object.fromEntries((await words.all(lib)).map(x => [x.word, x]))

describe('words', () => {
  it('rejects duplicates case-insensitively within a library only', async () => {
    await words.create('en', { word: 'Cat', translation: ['кот'] })
    await expect(words.create('en', { word: ' cat ' })).rejects.toBeInstanceOf(DuplicateWordError)
    await expect(words.create('de', { word: 'cat' })).resolves.toBeTruthy()
  })

  it('unmarking learned clears dates', async () => {
    const x = await words.create('en', { word: 'cat', translation: ['кот'] })
    await words.update(x.id, { is_learned: true })
    expect((await db.words.get(x.id)).learned_at).toBeTruthy()
    await words.update(x.id, { is_learned: false })
    expect(await db.words.get(x.id)).toMatchObject({ is_learned: false, learned_at: null, repeated_at: null })
  })
})

describe('import', () => {
  it('skips or replaces duplicates, also inside the file', async () => {
    await words.create('en', { word: 'cat', translation: ['кот'] })
    const rows = parseWordsCsv('Cat;кошка\ndog;собака\nDOG;пёс')

    expect(await words.import('en', rows, 'skip')).toEqual({ imported: 1, skipped: 2, replaced: 0 })
    expect((await byWord('en')).cat.translation).toEqual(['кот'])

    expect(await words.import('en', rows, 'replace')).toEqual({ imported: 0, skipped: 0, replaced: 3 })
    const all = await byWord('en')
    expect(all.Cat.translation).toEqual(['кошка'])
    expect(all.DOG.translation).toEqual(['пёс'])
  })

  it('restores progress from an exported file', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    await words.create('en', { word: 'dog', translation: ['собака'] })
    await words.update(a.id, { is_learned: true, is_ignored: true })
    const before = await byWord('en')

    const csv = stringifyWordsCsv(await words.all('en'))
    await libraries.clear('en')
    expect(await words.import('en', parseWordsCsv(csv))).toMatchObject({ imported: 2 })

    const after = await byWord('en')
    for (const key of ['is_learned', 'is_ignored', 'learned_at', 'repeated_at', 'created_at']) {
      expect(after.cat[key]).toEqual(before.cat[key])
      expect(after.dog[key]).toEqual(before.dog[key])
    }
  })

  it('replace with progress overwrites progress, without progress keeps it', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    await words.update(a.id, { is_learned: true })

    await words.import('en', parseWordsCsv('cat;кошка'), 'replace')
    expect(await db.words.get(a.id)).toMatchObject({ is_learned: true, translation: ['кошка'] })

    await words.import('en', parseWordsCsv('cat;кошка;;;'), 'replace')
    expect(await db.words.get(a.id)).toMatchObject({ is_learned: false, learned_at: null })
  })

  it('learned without date gets the import time', async () => {
    await words.import('en', parseWordsCsv('cat;кот;;;learned'))
    expect((await byWord('en')).cat.learned_at).toBeTruthy()
  })
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

    const s = await stats.library('en', 7)
    expect(s.activity.at(-1)).toEqual({ date: localDate(), studied: 2, repeated: 1 })
  })

  it('reset progress keeps words, clears marks and history', async () => {
    const a = await words.create('en', { word: 'cat', translation: ['кот'] })
    await study.complete('en', [a.id])
    await libraries.resetProgress('en')
    expect(await db.words.get(a.id)).toMatchObject({ is_learned: false, learned_at: null })
    expect(await db.sessions.count()).toBe(0)
  })
})
