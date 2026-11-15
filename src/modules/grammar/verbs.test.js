import { describe, it, expect } from 'vitest'
import { verbsOf, searchVerbs, verbAsWord } from './verbs.js'

describe('неправильные глаголы', () => {
  it('у каждого глагола все формы и оба перевода, без повторов', () => {
    for (const lib of ['en', 'de']) {
      const list = verbsOf(lib)
      expect(list.length).toBeGreaterThan(50)
      for (const v of list) {
        expect(v.forms, v.base).toHaveLength(3)
        expect(v.forms.every(Boolean), v.base).toBe(true)
        expect(v.ru && v.uk, v.base).toBeTruthy()
        if (v.note) expect(v.note.ru && v.note.uk, v.base).toBeTruthy()
        expect(v.examples, v.base).toHaveLength(2)
        for (const e of v.examples) expect(e.text && e.ru && e.uk, v.base).toBeTruthy()
        if (lib === 'de') expect(v.present, v.base).toBeTruthy()
        // транскрипция — на каждую форму, с теми же вариантами (was/were → wɒz/wɜː)
        if (lib === 'en') {
          expect(v.ipa.map(x => x.split('/').length), v.base).toEqual(v.forms.map(x => x.split('/').length))
        }
      }
      expect(new Set(list.map(v => v.base)).size).toBe(list.length)
    }
  })

  it('глагол становится словом с формами', () => {
    const be = verbAsWord(verbsOf('en').find(v => v.base === 'be'), 'en', 'ru')
    expect(be.word).toBe('be')
    expect(be.translation).toEqual(['быть'])
    expect(be.transcription).toBe('biː')
    expect(be.forms.map(f => [f.word, f.transcription])).toEqual([['was', 'wɒz'], ['were', 'wɜː'], ['been', 'biːn']])
    expect(be.examples).toHaveLength(2)

    const gehen = verbAsWord(verbsOf('de').find(v => v.base === 'gehen'), 'de', 'uk')
    expect(gehen.forms.map(f => f.word)).toEqual(['ging', 'gegangen', 'geht'])
    expect(gehen.forms[1].note).toBe('Perfekt · ist')
    expect(gehen.translation).toEqual(['йти'])

    // форма = само слово — не форма
    expect(verbAsWord(verbsOf('en').find(v => v.base === 'put'), 'en', 'ru').forms).toEqual([])
    expect(verbAsWord(verbsOf('en').find(v => v.base === 'come'), 'en', 'ru').forms.map(f => f.word)).toEqual(['came'])
    expect(verbAsWord(verbsOf('de').find(v => v.base === 'vergessen'), 'de', 'ru').forms.map(f => f.word)).toEqual(['vergaß', 'vergisst'])
  })

  it('ищет по любой форме и по переводу', () => {
    expect(searchVerbs('en', 'went', 'ru').map(v => v.base)).toEqual(['go'])
    expect(searchVerbs('en', 'were', 'ru').map(v => v.base)).toEqual(['be'])
    expect(searchVerbs('de', 'gegangen', 'ru').map(v => v.base)).toEqual(['gehen'])
    expect(searchVerbs('de', 'nimmt', 'uk').map(v => v.base)).toEqual(['nehmen'])
    expect(searchVerbs('en', 'плавать', 'ru').map(v => v.base)).toEqual(['swim'])
    expect(searchVerbs('en', '', 'ru')).toHaveLength(verbsOf('en').length)
  })
})

describe('справочник для ядра', () => {
  it('точное совпадение — по любой форме, поиск — по началу', async () => {
    const { verbReferences } = await import('./verbs.js')
    const exact = verbReferences('en', 'Went', { locale: 'ru', exact: true })
    expect(exact.map(i => i.key)).toEqual(['go'])
    expect(exact[0].title).toBe('go — went — gone')
    expect(exact[0].to).toEqual({ name: 'grammar-verbs', query: { open: 'go' } })
    expect(verbReferences('en', 'wen', { locale: 'ru', exact: true })).toEqual([])
    expect(verbReferences('en', 'wen', { locale: 'ru', exact: false }).map(i => i.key)).toContain('go')
  })
})
