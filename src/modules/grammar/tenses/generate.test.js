import { describe, it, expect } from 'vitest'
import { third, ing, past, pp, makeItem, makeSession, GENERATED } from './generate.js'
import { VERBS, SUBJECTS } from './en.js'

const verb = v => VERBS.find(x => x.v === v)
const subj = t => SUBJECTS.find(x => x.t === t)

describe('формы глагола', () => {
  it('3-е лицо, -ing, прошедшее', () => {
    expect(['watch', 'study', 'go', 'play', 'wait'].map(third)).toEqual(['watches', 'studies', 'goes', 'plays', 'waits'])
    expect(['write', 'study', 'swim', 'visit', 'make'].map(v => ing(verb(v)))).toEqual(['writing', 'studying', 'swimming', 'visiting', 'making'])
    expect(['study', 'play', 'visit', 'go', 'read'].map(v => past(verb(v)))).toEqual(['studied', 'played', 'visited', 'went', 'read'])
    expect(['go', 'make', 'swim', 'work'].map(v => pp(verb(v)))).toEqual(['gone', 'made', 'swum', 'worked'])
  })
})

describe('задания', () => {
  const item = (tense, kind, v, s) => makeItem({ tense, kind, verb: verb(v), subject: subj(s), object: 'to the park', marker: 'every day' })

  it('Present Simple: утверждение, отрицание, вопрос', () => {
    expect(item('present-simple', 'affirm', 'go', 'she').sentence).toBe('She goes to the park every day.')
    expect(item('present-simple', 'negative', 'go', 'they').sentence).toBe("They don't go to the park every day.")
    expect(item('present-simple', 'question', 'go', 'Tom').sentence).toBe('Does Tom go to the park every day?')
  })

  it('Present Continuous и Past Simple', () => {
    expect(item('present-continuous', 'affirm', 'go', 'I').sentence).toBe('I am going to the park every day.')
    expect(item('present-continuous', 'question', 'go', 'my parents').sentence).toBe('Are my parents going to the park every day?')
    expect(item('past-simple', 'negative', 'go', 'he').sentence).toBe("He didn't go to the park every day.")
    expect(item('past-simple', 'question', 'go', 'you').sentence).toBe('Did you go to the park every day?')
  })

  it('Future Simple, Past Continuous, Present Perfect', () => {
    expect(item('future-simple', 'negative', 'go', 'she').sentence).toBe("She won't go to the park every day.")
    expect(item('past-continuous', 'affirm', 'go', 'they').sentence).toBe('They were going to the park every day.')
    expect(item('past-continuous', 'question', 'go', 'I').sentence).toBe('Was I going to the park every day?')
    expect(item('present-perfect', 'affirm', 'go', 'Tom').sentence).toBe('Tom has gone to the park every day.')
    expect(item('present-perfect', 'question', 'go', 'you').sentence).toBe('Have you gone to the park every day?')
  })

  it('тоже верная форма другого времени — не среди неверных', () => {
    for (let n = 0; n < 30; n++) {
      expect(item('future-simple', 'affirm', 'go', 'she').options).not.toContain('is going')
      expect(item('past-continuous', 'affirm', 'go', 'she').options).not.toContain('went')
      expect(item('present-perfect', 'affirm', 'read', 'I').options).not.toContain('read')
    }
  })

  it('смешанная: по 5 заданий на время, в каждом есть утверждение, отрицание и вопрос', () => {
    const tenses  = ['present-simple', 'future-simple', 'present-perfect']
    const session = makeSession(tenses, { count: 15, irregular: 3 })
    expect(session).toHaveLength(15)
    for (const x of tenses) {
      const own = session.filter(it => it.tense === x)
      expect(own).toHaveLength(5)
      expect(new Set(own.map(it => it.kind))).toEqual(new Set(['affirm', 'negative', 'question']))
    }
  })

  it('среди вариантов — то же время для другого лица (go / goes)', () => {
    for (let n = 0; n < 20; n++) {
      const it = item('present-simple', 'affirm', 'go', 'they')
      expect(it.options).toEqual(expect.arrayContaining(['go', 'goes']))
      expect(it).not.toHaveProperty('hint')
    }
  })

  it('варианты: 4 разных, правильный среди них', () => {
    for (const tense of GENERATED) {
      for (let n = 0; n < 30; n++) {
        for (const it of makeSession(tense)) {
          expect(it.options).toHaveLength(4)
          expect(new Set(it.options).size).toBe(4)
          expect(it.options).toContain(it.answer)
        }
      }
    }
  })

  it('в тренировке 10 заданий, 2 с неправильными глаголами, давно не встречавшиеся — первыми', () => {
    const recent = Object.fromEntries(VERBS.filter(v => v.past && v.v !== 'swim' && v.v !== 'eat').map(v => [v.v, '2026-11-15']))
    const session = makeSession('past-simple', { recent })
    expect(session).toHaveLength(10)
    const irr = session.filter(x => x.irregular).map(x => x.verb).sort()
    expect(irr).toEqual(['eat', 'swim'])
    expect(new Set(session.map(x => x.verb)).size).toBe(10)
  })
})

describe('смешанная', () => {
  it('задания поровну по временам', () => {
    const session = makeSession(['present-simple', 'past-simple'])
    expect(session.filter(x => x.tense === 'past-simple')).toHaveLength(5)
    expect(session.filter(x => x.tense === 'present-simple')).toHaveLength(5)
  })
})

describe('итог тренировки', async () => {
  const { percentOf, trend } = await import('./result.js')

  it('процент и сравнение с прошлым разом', () => {
    expect(percentOf(7, 10)).toBe(70)
    expect(trend(70, null)).toBe('first')
    expect(trend(80, 70)).toBe('better')
    expect(trend(70, 70)).toBe('same')
    expect(trend(60, 70)).toBe('worse')
  })
})

describe('результаты в базе', async () => {
  const { grammarRepo } = await import('../repo.js')

  it('последний, лучший, сколько раз; прошлый процент — для сравнения', async () => {
    expect((await grammarRepo.saveResult('en', 'past-simple', 60)).prev).toBeNull()
    const { prev, row } = await grammarRepo.saveResult('en', 'past-simple', 40)
    expect(prev).toBe(60)
    expect(row).toMatchObject({ last: 40, best: 60, count: 2 })
    await grammarRepo.markVerbs('en', ['go'])
    expect(Object.keys(await grammarRepo.recentVerbs('en'))).toEqual(['go'])
    expect([...(await grammarRepo.all('en')).keys()]).toEqual(['past-simple'])
    // дни тренировок — для «Активности»
    await grammarRepo.markDay('en')
    await grammarRepo.markDay('en')
    expect(Object.values(await grammarRepo.days('en'))).toEqual([2])
  })
})

describe('что на очереди', async () => {
  const { nextTopic, daysSince } = await import('./result.js')
  const tenses = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const now = new Date(2026, 10, 15, 12)
  const at  = days => new Date(2026, 10, 15 - days, 9).toISOString()

  it('дни считаются по календарю', () => {
    expect(daysSince(at(0), now)).toBe(0)
    expect(daysSince(at(1), now)).toBe(1)
  })

  it('пора повторить (самое давнее) → новое → ничего', () => {
    const stats = new Map([['a', { practiced_at: at(8) }], ['b', { practiced_at: at(10) }]])
    expect(nextTopic(tenses, stats, now)).toMatchObject({ kind: 'due', tense: { id: 'b' }, days: 10 })
    expect(nextTopic(tenses, new Map([['a', { practiced_at: at(2) }]]), now)).toMatchObject({ kind: 'new', tense: { id: 'b' } })
    const all = new Map(tenses.map(x => [x.id, { practiced_at: at(1) }]))
    expect(nextTopic(tenses, all, now)).toBeNull()
  })
})
