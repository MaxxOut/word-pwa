import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { wordsRepo as words } from './repo.js'
import { DuplicateWordError, FormsLimitError } from './errors.js'

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

describe('forms', () => {
  it('found by form within the library, case-insensitively', async () => {
    const dog = await words.create('en', { word: 'dog', translation: ['собака'] })
    await words.addForm(dog.id, { word: 'Dogs' })
    expect((await words.findByForm('en', 'dogs')).word.id).toBe(dog.id)
    expect((await words.findByForm('en', 'dogs')).form.word).toBe('Dogs')
    expect(await words.findByForm('de', 'dogs')).toBeNull()
  })

  it('cleans forms: no empty, no duplicates, not the word itself, max 5', async () => {
    const w = await words.create('en', { word: 'go', forms: [
      { word: 'went' }, { word: ' WENT ' }, { word: '' }, { word: 'Go' },
      { word: 'goes' }, { word: 'gone' }, { word: 'going' }, { word: 'goed' }, { word: 'gos' },
    ] })
    expect(w.forms.map(f => f.word)).toEqual(['went', 'goes', 'gone', 'going', 'goed'])
    await expect(words.addForm(w.id, { word: 'x' })).rejects.toBeInstanceOf(FormsLimitError)
    expect((await words.addForm(w.id, { word: 'went' })).forms).toHaveLength(5) // уже есть — без ошибки
  })

  it('search finds a word by its form', async () => {
    const dog = await words.create('en', { word: 'dog' })
    await words.addForm(dog.id, { word: 'dogs' })
    expect((await words.page('en', { search: 'dogs' })).items.map(w => w.word)).toEqual(['dog'])
  })

  it('detach: form becomes a word; existing word — error, nothing changes', async () => {
    const go = await words.create('en', { word: 'go', forms: [{ word: 'went', translation: ['пошёл'] }, { word: 'gone' }] })
    const { created } = await words.detachForm(go.id, 'WENT')
    expect(created).toMatchObject({ word: 'went', translation: ['пошёл'] })
    expect((await db.words.get(go.id)).forms.map(f => f.word)).toEqual(['gone'])
    expect(await words.findByForm('en', 'went')).toBeNull()

    await words.create('en', { word: 'gone' })
    await expect(words.detachForm(go.id, 'gone')).rejects.toBeInstanceOf(DuplicateWordError)
    expect((await db.words.get(go.id)).forms.map(f => f.word)).toEqual(['gone'])
  })
})

it('detach takes unsaved fields from the card', async () => {
  const go = await words.create('en', { word: 'go', forms: [{ word: 'went' }] })
  const { created } = await words.detachForm(go.id, 'went', { translation: [' пошёл '], transcription: 'went' })
  expect(created).toMatchObject({ word: 'went', translation: ['пошёл'], transcription: 'went' })
})
