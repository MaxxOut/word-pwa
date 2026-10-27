import { describe, it, expect } from 'vitest'
import {
  STATUS, wordStatus, pickForStudy, pickExtra, isDue, pickForRepeat, libraryStats,
} from '../src/domain/words.js'

const NOW = new Date('2026-03-10T12:00:00')
const RS  = { words_per_session: 2, days_after_learning: 2, days_after_repeat: 5 }

function w(props) {
  return {
    id: props.word, translation: ['t'], is_learned: false, is_ignored: false,
    learned_at: null, repeated_at: null, created_at: '2026-01-01T00:00:00.000Z', ...props,
  }
}

const daysBefore = n => new Date(NOW.getTime() - n * 86400000).toISOString()

describe('wordStatus', () => {
  it('ignored wins over learned, no translation = untranslated', () => {
    expect(wordStatus(w({ is_learned: true, is_ignored: true }))).toBe(STATUS.IGNORED)
    expect(wordStatus(w({ is_learned: true }))).toBe(STATUS.LEARNED)
    expect(wordStatus(w({ translation: [' '] }))).toBe(STATUS.UNTRANSLATED)
    expect(wordStatus(w({}))).toBe(STATUS.NEW)
  })
})

describe('pickForStudy', () => {
  it('takes only new words, newest first, with limit', () => {
    const list = [
      w({ word: 'old', created_at: '2026-01-01' }),
      w({ word: 'new', created_at: '2026-02-01' }),
      w({ word: 'learned', is_learned: true }),
      w({ word: 'ignored', is_ignored: true }),
      w({ word: 'empty', translation: [] }),
    ]
    expect(pickForStudy(list).map(x => x.word)).toEqual(['new', 'old'])
    expect(pickForStudy(list, 1).map(x => x.word)).toEqual(['new'])
  })
})

describe('pickExtra', () => {
  it('takes learned words with translation, excluding given ids', () => {
    const list = [
      w({ word: 'a', is_learned: true }),
      w({ word: 'b', is_learned: true }),
      w({ word: 'c', is_learned: true, translation: [] }),
      w({ word: 'd' }),
    ]
    expect(pickExtra(list, ['a']).map(x => x.word)).toEqual(['b'])
  })
})

describe('isDue / pickForRepeat', () => {
  it('uses days after learning when never repeated', () => {
    expect(isDue(w({ is_learned: true, learned_at: daysBefore(2) }), RS, NOW)).toBe(true)
    expect(isDue(w({ is_learned: true, learned_at: daysBefore(1) }), RS, NOW)).toBe(false)
  })

  it('uses days after repeat when repeated', () => {
    const learned = daysBefore(30)
    expect(isDue(w({ is_learned: true, learned_at: learned, repeated_at: daysBefore(5) }), RS, NOW)).toBe(true)
    expect(isDue(w({ is_learned: true, learned_at: learned, repeated_at: daysBefore(4) }), RS, NOW)).toBe(false)
  })

  it('not learned words are never due; «Знаю» — not before days_known', () => {
    expect(isDue(w({ learned_at: daysBefore(10) }), RS, NOW)).toBe(false)
    expect(isDue(w({ is_learned: true, is_ignored: true, learned_at: daysBefore(10) }), RS, NOW)).toBe(false)
  })

  it('oldest seen first, limited by session size', () => {
    const list = [
      w({ word: 'a', is_learned: true, learned_at: daysBefore(3) }),
      w({ word: 'b', is_learned: true, learned_at: daysBefore(40), repeated_at: daysBefore(20) }),
      w({ word: 'c', is_learned: true, learned_at: daysBefore(10) }),
      w({ word: 'd', is_learned: true, learned_at: daysBefore(1) }),
    ]
    const { total, words } = pickForRepeat(list, RS, NOW)
    expect(total).toBe(3)
    expect(words.map(x => x.word)).toEqual(['b', 'c'])
  })
})

describe('libraryStats', () => {
  it('counts statuses and due words', () => {
    const stats = libraryStats([
      w({ word: 'a' }),
      w({ word: 'b', translation: [] }),
      w({ word: 'c', is_ignored: true }), // «Знаю», отмечено давно — пора повторить
      w({ word: 'd', is_learned: true, learned_at: daysBefore(3) }),
      w({ word: 'e', is_learned: true, learned_at: daysBefore(1) }),
    ], RS, NOW)
    expect(stats).toEqual({ words: 5, learned: 2, ignored: 1, untranslated: 1, new: 1, due: 2 })
  })
})

describe('слова «Знаю»', () => {
  const RSK = { ...RS, days_known: 20 }

  it('повторяются раз в days_known дней с последнего повторения или отметки', () => {
    expect(isDue(w({ is_ignored: true, updated_at: daysBefore(20) }), RSK, NOW)).toBe(true)
    expect(isDue(w({ is_ignored: true, updated_at: daysBefore(19) }), RSK, NOW)).toBe(false)
    expect(isDue(w({ is_ignored: true, updated_at: daysBefore(40), repeated_at: daysBefore(5) }), RSK, NOW)).toBe(false)
  })

  it('без перевода не повторяются', () => {
    expect(isDue(w({ is_ignored: true, translation: [], updated_at: daysBefore(40) }), RSK, NOW)).toBe(false)
  })

  it('идут в отвлекалки', () => {
    expect(pickExtra([w({ word: 'cat', is_ignored: true })]).map(x => x.id)).toEqual(['cat'])
  })
})
