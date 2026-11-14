import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { wordsRepo as words } from './repo.js'
import { DuplicateWordError } from './errors.js'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

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
