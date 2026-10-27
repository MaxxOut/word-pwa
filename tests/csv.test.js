import { describe, it, expect } from 'vitest'
import { parseWordsCsv, stringifyWordsCsv } from '../src/domain/csv.js'

describe('parseWordsCsv', () => {
  it('reads the old 4-column format without progress', () => {
    const [row] = parseWordsCsv('﻿cat;кот|кошка;kæt;a cat|the cat\r\n')
    expect(row).toEqual({
      word: 'cat', translation: ['кот', 'кошка'], transcription: 'kæt',
      examples: ['a cat', 'the cat'], progress: null,
    })
  })

  it('handles quotes, separators and newlines inside fields', () => {
    const [row] = parseWordsCsv('"a;b";"say ""hi""";;"line1\nline2"')
    expect(row.word).toBe('a;b')
    expect(row.translation).toEqual(['say "hi"'])
    expect(row.transcription).toBeNull()
    expect(row.examples).toEqual(['line1\nline2'])
  })

  it('skips empty lines and rows without a word', () => {
    expect(parseWordsCsv('\n;перевод\ndog;собака\n\n').map(r => r.word)).toEqual(['dog'])
  })

  it('reads progress columns', () => {
    const [row] = parseWordsCsv('cat;кот;;;learned|ignored;2026-01-02T10:00:00.000Z;;2026-01-01T00:00:00.000Z')
    expect(row.progress).toEqual({
      is_learned: true, is_ignored: true,
      learned_at: '2026-01-02T10:00:00.000Z', repeated_at: null,
      created_at: '2026-01-01T00:00:00.000Z',
    })
  })

  it('ignores dates of not learned words and broken dates', () => {
    const [a, b] = parseWordsCsv('a;x;;;;2026-01-02;2026-01-03;garbage\nb;y;;;learned;nonsense')
    expect(a.progress).toMatchObject({ is_learned: false, learned_at: null, repeated_at: null, created_at: null })
    expect(b.progress).toMatchObject({ is_learned: true, learned_at: null })
  })
})

describe('stringifyWordsCsv', () => {
  it('round-trips words with progress', () => {
    const words = [
      {
        word: 'a;b', translation: ['x "y"'], transcription: null, examples: ['one', 'two'],
        is_learned: true, is_ignored: false,
        learned_at: '2026-01-02T10:00:00.000Z', repeated_at: '2026-01-05T10:00:00.000Z',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      {
        word: 'dog', translation: [], transcription: 'dɒɡ', examples: [],
        is_learned: false, is_ignored: true, learned_at: null, repeated_at: null,
        created_at: '2026-01-03T00:00:00.000Z',
      },
    ]
    const csv = stringifyWordsCsv(words)
    expect(csv.startsWith('﻿')).toBe(true)

    const rows = parseWordsCsv(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ word: 'a;b', translation: ['x "y"'], examples: ['one', 'two'] })
    expect(rows[0].progress).toEqual({
      is_learned: true, is_ignored: false,
      learned_at: words[0].learned_at, repeated_at: words[0].repeated_at, created_at: words[0].created_at,
    })
    expect(rows[1].progress).toMatchObject({ is_learned: false, is_ignored: true })
  })
})

describe('stringifyWordsCsv без прогресса', () => {
  it('пишет только 4 колонки, и импорт не видит прогресса', async () => {
    const { stringifyWordsCsv, parseWordsCsv } = await import('../src/domain/csv.js')
    const csv = stringifyWordsCsv([{ word: 'peep', translation: [], transcription: '', examples: ['He peeped in.'], is_learned: true }], { progress: false })
    expect(csv.trim().replace('﻿', '')).toBe('peep;;;He peeped in.')
    const rows = parseWordsCsv(csv)
    expect(rows[0].progress).toBeFalsy()
  })
})
