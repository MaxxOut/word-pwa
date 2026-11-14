import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { wordsRepo as words } from '@/core/words/repo.js'
import { librariesRepo as libraries } from '@/core/library/repo.js'
import { parseWordsCsv, stringifyWordsCsv } from '@/core/words/csv.js'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

const byWord = async lib => Object.fromEntries((await words.all(lib)).map(x => [x.word, x]))

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
