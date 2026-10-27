import { describe, it, expect } from 'vitest'
import { parseChapter, readPercent, readStatus } from '../src/domain/reading.js'
import { textsOf, findText, TOPICS } from '../src/content/reading/index.js'

describe('reading', () => {
  it('разбирает главу на абзацы и сквозные номера слов', () => {
    const paras = parseChapter('One two.\n\n  Three  four five.\n')
    expect(paras).toHaveLength(2)
    expect(paras[1].map(w => w.t)).toEqual(['Three', 'four', 'five.'])
    expect(paras[1][0].i).toBe(2)
  })

  it('считает процент по всем главам', () => {
    const text = { chapters: [{ text: 'a b c d' }, { text: 'e f g h' }] }
    expect(readPercent(text, 0, 0)).toBe(0)
    expect(readPercent(text, 1, 0)).toBe(50)
    expect(readPercent(text, 1, 2)).toBe(75)
  })

  it('статус текста', () => {
    expect(readStatus(null)).toBe('new')
    expect(readStatus({ finished: false })).toBe('reading')
    expect(readStatus({ finished: true })).toBe('finished')
  })

  it('встроенные тексты корректны', () => {
    const topics = TOPICS.map(t => t.id)
    for (const lib of ['en', 'de']) {
      for (const text of textsOf(lib)) {
        expect(text.library_id).toBe(lib)
        expect(topics).toContain(text.topic)
        expect(text.chapters.length).toBeGreaterThan(0)
        expect(findText(text.id)).toBe(text)
      }
    }
  })
})
