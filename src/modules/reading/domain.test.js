import { describe, it, expect } from 'vitest'
import { parseChapter, readPercent, readStatus } from './domain.js'
import { textsOf, findText, TOPICS } from './content/index.js'

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

describe('слово из текста', async () => {
  const { cleanToken, exampleAround } = await import('./domain.js')
  const words = s => s.split(' ')

  it('чистит знаки по краям', () => {
    expect(cleanToken('"Grapes,')).toBe('Grapes')
    expect(cleanToken("don't.")).toBe("don't")
    expect(cleanToken('„Diese')).toBe('Diese')
    expect(cleanToken('—')).toBe('')
  })

  it('короткое предложение — целиком', () => {
    const t = words('The fox jumps. He cannot reach the grapes. He jumps again.')
    expect(exampleAround(t, 5)).toBe('He cannot reach the grapes.')
  })

  it('длинное — кусок между запятыми', () => {
    const t = words('The grapes are big, round and purple, and they look very sweet and juicy today.')
    expect(exampleAround(t, 9)).toBe('and they look very sweet and juicy today.')
    expect(exampleAround(t, 4)).toBe('round and purple')
  })

  it('длинный кусок — без примера', () => {
    const t = words('one two three four five six seven eight nine ten eleven twelve')
    expect(exampleAround(t, 10)).toBe('')
  })

  it('убирает кавычки прямой речи', () => {
    const t = words('"I want those grapes," says the fox.')
    expect(exampleAround(t, 3)).toBe('I want those grapes, says the fox.')
    const d = words('„Diese Trauben will ich haben“, sagt der Fuchs.')
    expect(exampleAround(d, 1)).toBe('Diese Trauben will ich haben, sagt der Fuchs.')
  })
})

describe('baseCandidates', async () => {
  const { baseCandidates } = await import('./domain.js')

  it('English endings', () => {
    for (const [form, base] of [
      ['dogs', 'dog'], ['boxes', 'box'], ['studies', 'study'], ['tried', 'try'], ['worked', 'work'],
      ['liked', 'like'], ['stopped', 'stop'], ['running', 'run'], ['making', 'make'], ['bigger', 'big'],
      ['happier', 'happy'], ["dog's", 'dog'],
    ]) expect(baseCandidates(form, 'en'), form).toContain(base)
    expect(baseCandidates('go', 'en')).toEqual([])
  })

  it('German endings and Partizip II', () => {
    for (const [form, base] of [
      ['macht', 'machen'], ['machte', 'machen'], ['gemacht', 'machen'], ['Hunde', 'hund'], ['Kindern', 'kind'],
    ]) expect(baseCandidates(form, 'de'), form).toContain(base)
  })
})
