import { describe, it, expect } from 'vitest'
import { levelsOf, levelFor, parseVerb, level2Item, level3Item, isRight, makeLevelSession } from './levels.js'
import { LEVEL2, LEVEL3 } from './phrases.js'
import { TENSES } from './en.js'

const active = TENSES.filter(x => x.active).map(x => x.id)

describe('уровни', () => {
  it('у каждого готового времени — все три уровня, у неготового — только первый', () => {
    for (const x of active) expect(levelsOf(x)).toEqual([1, 2, 3])
    expect(levelsOf('future-perfect')).toEqual([1])
    expect(levelFor('future-perfect', 3)).toBe(1)
    expect(levelFor(['present-simple', 'past-simple'], 2)).toBe(2)
  })

  it('глагол: правильный, неправильный, своё -ing', () => {
    expect(parseVerb('work')).toEqual({ v: 'work' })
    expect(parseVerb('go/went/gone')).toEqual({ v: 'go', past: 'went', pp: 'gone' })
    expect(parseVerb('stop/stopped/stopped/stopping')).toMatchObject({ ing: 'stopping' })
  })
})

describe('уровень 2', () => {
  it('фразы: по 8+, один пропуск, 4 разных варианта, правильный среди них', () => {
    for (const x of active) {
      expect(LEVEL2[x].length).toBeGreaterThanOrEqual(8)
      for (const row of LEVEL2[x]) {
        expect(row[1].split('___')).toHaveLength(2)
        for (let n = 0; n < 10; n++) {
          const it = level2Item(x, row)
          expect(it.gaps[0].options).toHaveLength(4)
          expect(new Set(it.gaps[0].options).size).toBe(4)
          expect(it.gaps[0].options).toContain(it.gaps[0].answer)
        }
      }
    }
  })

  it('ответ строит генератор', () => {
    expect(level2Item('present-perfect', LEVEL2['present-perfect'][0]).sentence).toBe('I have lost my keys.')
    expect(level2Item('present-simple', LEVEL2['present-simple'][1]).gaps[0].answer).toBe("don't understand")
    expect(level2Item('present-continuous', LEVEL2['present-continuous'][7]).sentence).toBe('Excuse me, you are standing on my foot!')
  })
})

describe('уровень 3', () => {
  it('фразы: 6+, пропусков столько же, сколько вариантов; хотя бы один — во времени темы', () => {
    for (const x of active) {
      expect(LEVEL3[x].length).toBeGreaterThanOrEqual(6)
      for (const row of LEVEL3[x]) {
        const it = level3Item(x, row)
        expect(it.texts).toHaveLength(row[1].length + 1)
        expect(it.gaps.some(g => g.tense === x)).toBe(true)
        for (const g of it.gaps) {
          expect(g.options).toHaveLength(4)
          expect(new Set(g.options).size).toBe(4)
          expect(g.options).toContain(g.answer)
          expect(g.hint).toBeTruthy()
        }
      }
    }
  })

  it('предложение целиком и проверка ответа', () => {
    const it = level3Item('past-simple', LEVEL3['past-simple'][0])
    expect(it.sentence).toBe('I had left before she called.')
    expect(it.gaps.map(g => g.hint)).toEqual(['leave', 'call'])
    expect(isRight(it, ['had left', 'called'])).toBe(true)
    expect(isRight(it, ['had left', 'has called'])).toBe(false)
    expect(isRight(it, ['had left'])).toBe(false)
  })
})

describe('тренировка по уровню', () => {
  it('уровень 1 — генератор, 2 — 10 фраз, 3 — 6 предложений', () => {
    const one = makeLevelSession('past-simple', 1)
    expect(one).toHaveLength(10)
    expect(one.every(x => x.level === 1 && x.gaps.length === 1 && x.texts.join(x.answer) === x.sentence)).toBe(true)
    expect(makeLevelSession('past-simple', 2).every(x => x.level === 2)).toBe(true)
    expect(makeLevelSession('past-simple', 3, { count: 6 })).toHaveLength(6)
  })

  it('смешанная — поровну по временам', () => {
    const s = makeLevelSession(['present-simple', 'past-simple'], 2, { count: 10 })
    expect(s.filter(x => x.tense === 'past-simple')).toHaveLength(5)
    expect(new Set(s.map(x => x.sentence)).size).toBe(10)
  })
})
