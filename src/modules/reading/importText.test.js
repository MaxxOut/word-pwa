import { describe, it, expect } from 'vitest'
import { decodeFile, parseFb2, parsePlain, splitLong, parseFile, CHAPTER_MAX } from './importText.js'

const words = n => Array.from({ length: n }, (_, i) => `w${i}`).join(' ')

describe('свой текст', () => {
  it('кодировка: UTF-8, windows-1251, из заголовка XML', () => {
    expect(decodeFile(new TextEncoder().encode('Привет'))).toBe('Привет')
    expect(decodeFile(new Uint8Array([0xCF, 0xF0, 0xE8]))).toBe('При')
    const xml = '<?xml version="1.0" encoding="windows-1251"?><a>'
    const bytes = new Uint8Array([...new TextEncoder().encode(xml), 0xCF])
    expect(decodeFile(bytes).endsWith('П')).toBe(true)
  })

  it('fb2: главы по секциям, без сносок и картинок, сущности', () => {
    const book = parseFb2(`<FictionBook><description><title-info><author><first-name>J.</first-name><last-name>Doe</last-name></author>
      <book-title>My Book</book-title></title-info></description>
      <body><title><p>My Book</p></title>
        <section><title><p>Chapter 1</p><p>The Boy</p></title><p>One &amp; two.</p><image l:href="#i1"/><p>Three.</p></section>
        <section><title><p>Chapter 2</p></title><p>Four <emphasis>five</emphasis>.</p><poem><stanza><v>Line</v></stanza></poem></section>
      </body>
      <body name="notes"><section><p>Note</p></section></body>
      <binary id="i1">AAAA</binary></FictionBook>`)
    expect(book.title).toBe('My Book')
    expect(book.author).toBe('J. Doe')
    expect(book.chapters).toEqual([
      { title: 'Chapter 1. The Boy', text: 'One & two.\n\nThree.' },
      { title: 'Chapter 2', text: 'Four five.\n\nLine' },
    ])
  })

  it('txt: абзацы по пустым строкам, главы по заголовкам', () => {
    const chapters = parsePlain('Chapter 1\n\nFirst para\nwraps here.\n\nSecond.\n\nCHAPTER 2\n\nThird.')
    expect(chapters).toEqual([
      { title: 'Chapter 1', text: 'First para wraps here.\n\nSecond.' },
      { title: 'CHAPTER 2', text: 'Third.' },
    ])
  })

  it('txt: строка-название перед первой главой — не глава', () => {
    expect(parsePlain('The Happy Prince\n\nChapter 1\n\nText.').map(c => c.title)).toEqual(['Chapter 1'])
    // длинное вступление перед главой — остаётся
    expect(parsePlain('A long preface paragraph that is clearly more than a title line, so it stays as text.\n\nChapter 1\n\nText.')).toHaveLength(2)
  })

  it('txt: русские и украинские заголовки глав', () => {
    expect(parsePlain('Глава 1\n\nТекст.\n\nРозділ 2\n\nЩе текст.').map(c => c.title)).toEqual(['Глава 1', 'Розділ 2'])
    expect(parsePlain('Главная мысль здесь.\n\nТекст.')).toHaveLength(1)
  })

  it('txt без пустых строк — абзац на строку; без заголовков — одна глава', () => {
    expect(parsePlain('One.\nTwo.\nThree.')).toEqual([{ title: '', text: 'One.\n\nTwo.\n\nThree.' }])
  })

  it('длинная глава режется по абзацам', () => {
    const text = Array.from({ length: 10 }, () => words(400)).join('\n\n')
    const parts = splitLong([{ title: 'Big', text }])
    expect(parts.length).toBeGreaterThan(1)
    expect(parts[0].title).toBe('Big (1)')
    for (const p of parts) expect(p.text.split(/\s+/).length).toBeLessThanOrEqual(CHAPTER_MAX)
  })

  it('название: из fb2 или из имени файла', () => {
    expect(parseFile('notes.txt', new TextEncoder().encode('Hello.')).title).toBe('notes')
  })
})
