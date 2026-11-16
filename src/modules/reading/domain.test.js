import { describe, it, expect } from 'vitest'
import { reactive } from 'vue'
import { parseChapter, readPercent, readStatus, LEVELS, looksLikeBase } from './domain.js'
import { textsOf, findText, TOPICS } from './content/index.js'
import { catalogEntry } from './content/catalog-entry.js'
import CATALOG from './content/catalog.js'

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

  it('каталог совпадает с файлами текстов (иначе — npm run texts)', () => {
    const files = import.meta.glob('./content/*/*.text.js', { eager: true, import: 'default' })
    const built = Object.entries(files)
      .map(([path, text]) => catalogEntry(text, path.replace('./content/', '').replace(/\.text\.js$/, '')))
      .sort((a, b) => a.file.localeCompare(b.file))
    expect(CATALOG).toEqual(built)
  })

  it('тексты корректны', () => {
    const topics = TOPICS.map(t => t.id)
    for (const lib of ['en', 'de']) {
      for (const text of textsOf(lib)) {
        expect(text.id.startsWith(`${lib}-`), text.id).toBe(true)
        expect(topics).toContain(text.topic)
        expect(LEVELS).toContain(text.level)
        expect(text.chapters.length).toBeGreaterThan(0)
        expect(findText(text.id)).toBe(text)
      }
    }
  })
})

describe('скачанные тексты', async () => {
  const { db } = await import('@/core/db.js')
  const { saved, getText, downloadAll, removeTexts, savedStats } = await import('./texts.js')

  it('открытый текст сохраняется на телефоне, удаление — по выбору', async () => {
    await db.reading_texts.clear()
    saved.clear()

    const text = await getText('de-fuchs-trauben')
    expect(text.library_id).toBe('de')
    expect(text.chapters[0].text).toContain('Fuchs')
    expect(saved.has('de-fuchs-trauben')).toBe(true)

    await downloadAll('de')
    const all = textsOf('de').map(t => t.id)
    expect(savedStats('de').saved).toEqual(all)
    expect(savedStats('de').missingBytes).toBe(0)

    const stats = savedStats('de', new Set(['de-fuchs-trauben']))
    expect(stats.finished).toEqual(['de-fuchs-trauben'])
    await removeTexts(stats.finished)
    expect(await db.reading_texts.get('de-fuchs-trauben')).toBeUndefined()
    expect(savedStats('de').saved).toHaveLength(all.length - 1)
  })

  it('устаревшую копию заменяет новая', async () => {
    await db.reading_texts.update('de-e-auto', { hash: 'old', text: { title: 'old' } })
    expect((await getText('de-e-auto')).title).toBe(findText('de-e-auto').title)
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

describe('свои тексты', async () => {
  const { db } = await import('@/core/db.js')
  const { readingRepo } = await import('./repo.js')
  const { addUserText, userTextsOf, getText, textInfo, removeUserText } = await import('./texts.js')

  it('добавить, открыть, удалить вместе с местом чтения', async () => {
    const chapters = [{ title: 'One', text: 'Hello world.' }, { title: '', text: 'Bye now, friend.' }]
    // как из шторки: реактивные главы (Proxy) — база должна получить простые объекты
    const id = await addUserText({ libraryId: 'en', title: 'My book', chapters: reactive(chapters) })
    expect(id.startsWith('user-')).toBe(true)

    const list = await userTextsOf('en')
    expect(list.find(x => x.id === id)).toMatchObject({ title: 'My book', words: 5, chapters: 2 })
    expect((await userTextsOf('de')).some(x => x.id === id)).toBe(false)

    expect((await getText(id)).chapters).toEqual(chapters)
    expect(await textInfo(id)).toEqual({ title: 'My book', chapters: ['One', ''], level: null })

    await readingRepo.save({ text_id: id, library_id: 'en', chapter: 1, word: 0, percent: 50, finished: false })
    await removeUserText(id)
    expect(await getText(id)).toBeNull()
    expect(await readingRepo.get(id)).toBeUndefined()
    expect(await db.reading_texts.get(id)).toBeUndefined()
  })
})

describe('looksLikeBase', () => {
  it('начальная форма — да, другое слово — нет', () => {
    expect(looksLikeBase('peeped', 'peep', 'en')).toBe(true)
    expect(looksLikeBase('studies', 'study', 'en')).toBe(true)
    expect(looksLikeBase('children', 'child', 'en')).toBe(true)
    expect(looksLikeBase('contradictions', 'contradiction', 'en')).toBe(true)
    expect(looksLikeBase('gemacht', 'machen', 'de')).toBe(true)
    expect(looksLikeBase('enough', 'contradiction', 'en')).toBe(false)
    expect(looksLikeBase('house', 'horse', 'en')).toBe(false)
    expect(looksLikeBase('car', 'card', 'en')).toBe(false)
    expect(looksLikeBase('plan', 'planet', 'en')).toBe(false)
  })
})
