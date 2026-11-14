import { describe, it, expect } from 'vitest'
import { STATUS, wordStatus, wordStats } from './domain.js'

function w(props) {
  return {
    id: props.word, translation: ['t'], is_learned: false, is_ignored: false,
    learned_at: null, repeated_at: null, created_at: '2026-01-01T00:00:00.000Z', ...props,
  }
}

describe('wordStatus', () => {
  it('ignored wins over learned, no translation = untranslated', () => {
    expect(wordStatus(w({ is_learned: true, is_ignored: true }))).toBe(STATUS.IGNORED)
    expect(wordStatus(w({ is_learned: true }))).toBe(STATUS.LEARNED)
    expect(wordStatus(w({ translation: [' '] }))).toBe(STATUS.UNTRANSLATED)
    expect(wordStatus(w({}))).toBe(STATUS.NEW)
  })
})

describe('wordStats', () => {
  it('counts statuses', () => {
    expect(wordStats([
      w({ word: 'a' }),
      w({ word: 'b', translation: [] }),
      w({ word: 'c', is_ignored: true }),
      w({ word: 'd', is_learned: true }),
    ])).toEqual({ words: 4, learned: 1, ignored: 1, untranslated: 1, new: 1 })
  })
})

describe('normalizeForms', async () => {
  const { normalizeForms } = await import('./domain.js')

  it('replaces CSV separators inside form fields', () => {
    expect(normalizeForms([{ word: 'went', translation: ['пошёл|ушёл'], note: 'разг. = colloq.' }])).toEqual([
      { word: 'went', translation: ['пошёл/ушёл'], transcription: null, note: 'разг. - colloq.' },
    ])
  })
})
