import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { wordsRepo } from '@/core/words/repo.js'
import { saveReferenceWord, missingForms } from './save.js'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

const GO = {
  word:          'go',
  translation:   ['идти'],
  transcription: 'ɡəʊ',
  examples:      ['She has gone home.'],
  forms:         [{ word: 'went', note: 'Past Simple' }, { word: 'gone', note: 'Past Participle' }],
}

describe('справочник → словарь', () => {
  it('нового слова нет — создаёт с формами', async () => {
    const { word, created } = await saveReferenceWord('en', GO)
    expect(created).toBe(true)
    expect(word.forms.map(f => f.word)).toEqual(['went', 'gone'])
    expect((await wordsRepo.findByForm('en', 'went')).word.word).toBe('go')
  })

  it('слово уже есть — данные заменяются справочником, отметки изучения остаются', async () => {
    const old = await wordsRepo.create('en', { word: 'go', translation: ['ехать'], forms: [{ word: 'goes' }] })
    await wordsRepo.update(old.id, { is_learned: true })
    const { word, created } = await saveReferenceWord('en', GO)
    expect(created).toBe(false)
    expect(word.translation).toEqual(['идти'])
    expect(word.examples).toEqual(GO.examples)
    expect(word.forms.map(f => f.word)).toEqual(['went', 'gone'])
    expect(word.is_learned).toBe(true)
    expect(missingForms(word, GO)).toEqual([])
  })

  it('форма, совпадающая со словом, не считается недостающей', () => {
    const come = { word: 'come', forms: [{ word: 'came' }, { word: 'come' }] }
    expect(missingForms({ word: 'come', forms: [{ word: 'came' }] }, come)).toEqual([])
  })

  it('у старого слова нет поля forms — тоже заменяется', async () => {
    const old = await wordsRepo.create('en', { word: 'go', translation: ['идти'] })
    await db.words.where('id').equals(old.id).modify(w => { delete w.forms; delete w.form_keys })
    expect(missingForms(await wordsRepo.find('en', 'go'), GO)).toHaveLength(2)
    const { word } = await saveReferenceWord('en', GO)
    expect(word.forms.map(f => f.word)).toEqual(['went', 'gone'])
  })
})
