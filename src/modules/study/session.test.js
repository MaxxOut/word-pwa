import { describe, it, expect } from 'vitest'
import { pickSet, replaceInSet, addToSet, pickDistractors, contextOf } from './domain.js'

const pool = ['a', 'b', 'c', 'd'].map(id => ({ id }))

describe('набор слов занятия', () => {
  it('готовый набор — первые n', () => {
    expect(pickSet(pool, 2)).toEqual(['a', 'b'])
    expect(pickSet(pool, 10)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('замена — на слово не из набора, на том же месте', () => {
    expect(replaceInSet(['a', 'b'], 'a', pool, () => 0)).toEqual(['c', 'b'])
    expect(replaceInSet(['a', 'b', 'c', 'd'], 'a', pool)).toBeNull()
  })

  it('добавить — пока есть свободные', () => {
    expect(addToSet(['a'], pool, () => 0)).toEqual(['a', 'b'])
    expect(addToSet(['a', 'b', 'c', 'd'], pool)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('варианты ответа', () => {
  const of = w => w.t
  it('без правильного и повторов, нужное число', () => {
    const session = [{ t: 'кот' }, { t: 'Пёс' }]
    const extra   = [{ t: 'пёс' }, { t: 'дом' }, { t: 'кот' }, { t: 'дерево' }]
    const out = pickDistractors('кот', session, extra, 3, of, () => 0)
    expect(out).toHaveLength(3)
    expect(out).not.toContain('кот')
    expect(new Set(out.map(v => v.toLowerCase())).size).toBe(3)
  })

  it('при равной длине слова занятия — раньше прочих', () => {
    expect(pickDistractors('кот', [{ t: 'пёс' }], [{ t: 'дом' }], 1, of, () => 0)).toEqual(['пёс'])
  })

  it('похожей длины — раньше сильно отличающихся', () => {
    expect(pickDistractors('кот', [], [{ t: 'черепаха' }, { t: 'дом' }], 1, of, () => 0)).toEqual(['дом'])
  })
})

describe('пример для «В контексте»', () => {
  const w = (word, examples) => ({ word, examples })

  it('находит форму слова целым словом, без учёта регистра', () => {
    expect(contextOf(w('run', ['I run every day.']))).toEqual({ before: 'I ', match: 'run', after: ' every day.' })
    expect(contextOf(w('the', ['The cat sleeps.'])).match).toBe('The')
  })

  it('часть другого слова и другая форма — не подходят', () => {
    expect(contextOf(w('run', ['She runs fast.', 'A rerun.']))).toBeNull()
    expect(contextOf(w('cat', []))).toBeNull()
    expect(contextOf(w('cat', undefined))).toBeNull()
  })

  it('фраза из нескольких слов', () => {
    expect(contextOf(w('give up', ['Never give up!'])).after).toBe('!')
  })
})
