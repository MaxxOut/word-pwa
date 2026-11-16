import { describe, it, expect } from 'vitest'
import { parseAiLine, googleTranslateUrl, pickTranslation } from './translate.js'

describe('parseAiLine', () => {
  it('reads a plain line', () => {
    expect(parseAiLine('peep;подглядывать|выглядывать;[piːp];He peeped through the door.')).toEqual({
      word:          'peep',
      translation:   ['подглядывать', 'выглядывать'],
      transcription: '[piːp]',
      examples:      ['He peeped through the door.'],
    })
  })

  it('strips code fences, quotes and chatter around', () => {
    const answer = 'Вот строка:\n```\n"apple;яблоко;;"\n```'
    expect(parseAiLine(answer)).toMatchObject({ word: 'apple', translation: ['яблоко'], examples: [] })
  })

  it('needs word and translation', () => {
    expect(parseAiLine('apple;;[x];')).toBeNull()
    expect(parseAiLine('просто текст без формата')).toBeNull()
    expect(parseAiLine('')).toBeNull()
  })

  it('rejects text that is not an answer (e.g. the prompt pasted back)', () => {
    expect(parseAiLine('Якщо це граматична форма з тим самим значенням (множина), у першому полі дай початкову форму; самостійні слова залиш як є')).toBeNull()
    expect(parseAiLine('give up;сдаваться')).toMatchObject({ word: 'give up' })
  })

  it('ignores extra columns', () => {
    expect(parseAiLine('cat;кот;;;learned;2026-01-01')).not.toHaveProperty('progress')
  })
})

it('google url keeps the word encoded', () => {
  expect(googleTranslateUrl('über', 'de', 'uk')).toContain('text=%C3%BCber')
})

describe('buildPrompt', async () => {
  const { i18n }        = await import('@/core/i18n/index.js')
  const { buildPrompt } = await import('./prompt.js')
  const g = i18n.global

  it('has word, context, format and a sample in the interface language', () => {
    g.locale.value = 'ru'
    const p = buildPrompt(g, { word: 'peeped', context: 'He peeped in.', from: 'en', to: 'ru' })
    expect(p).toContain('Переведи английское слово на русский язык.')
    expect(p).toContain('Слово: peeped')
    expect(p).toContain('Предложение: He peeped in.')
    expect(p).toContain('слово;перевод1|перевод2;[транскрипция];пример1|пример2')
    expect(p).toContain('Пример ответа: apple;яблоко;[ˈæp.əl];I eat an apple every day.')
  })

  it('skips the sentence line without context; uk prompt for German', () => {
    g.locale.value = 'uk'
    const p = buildPrompt(g, { word: 'ging', context: '', from: 'de', to: 'uk' })
    expect(p).not.toContain('Речення')
    expect(p).toContain('Переклади німецьке слово українською мовою.')
    expect(p).toContain('Apfel;яблуко;')
    g.locale.value = 'ru'
  })
})

describe('prompt pasted back as an answer', async () => {
  const { i18n }        = await import('@/core/i18n/index.js')
  const { buildPrompt } = await import('./prompt.js')

  it('is never parsed as a word, in both languages', () => {
    for (const lang of ['ru', 'uk']) {
      i18n.global.locale.value = lang
      const p = buildPrompt(i18n.global, { word: 'limited', context: 'It was limited.', from: 'en', to: lang })
      expect(parseAiLine(p, { prompt: p })).toBeNull()
      expect(parseAiLine('limited;обмежений', { prompt: p })).toMatchObject({ word: 'limited' })
    }
    i18n.global.locale.value = 'ru'
  })
})

it('isEmail accepts only address-like values', async () => {
  const { isEmail } = await import('./translate.js')
  expect(isEmail('student@mail.com')).toBe(true)
  expect(isEmail('a@b')).toBe(false)
  expect(isEmail('name@')).toBe(false)
  expect(isEmail('')).toBe(false)
})

describe('pickTranslation', () => {
  it('skips junk and decodes entities', () => {
    expect(pickTranslation({ responseData: { translatedText: '&amp;' }, matches: [{ translation: '-', match: 1 }] })).toBe('')
    expect(pickTranslation({
      responseData: { translatedText: '.' },
      matches: [
        { translation: '.', match: 0.98, quality: '74' },
        { translation: 'Противоречия', match: 0.98, quality: '80' },
        { translation: 'Другое', match: 0.97, quality: '90' },
      ],
    })).toBe('Противоречия')
    expect(pickTranslation({ responseData: { translatedText: 'rock &amp; roll' } })).toBe('rock & roll')
  })
})
