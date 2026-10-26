import { describe, it, expect } from 'vitest'
import { useStageQueue } from '../src/features/study/stages/useStageQueue.js'

const words = [{ id: 'a' }, { id: 'b' }]

describe('useStageQueue', () => {
  it('repeats a failed word at the end and reports it', () => {
    let result = null
    const q = useStageQueue(words, ids => { result = ids })

    q.fail()                          // a — ошибка, ещё раз в конце
    expect(q.next()).toBe(true)
    q.succeed()                       // b
    expect(q.next()).toBe(true)
    expect(q.current.value.id).toBe('a')
    expect(q.counter.value).toBe('3 / 3')
    q.succeed()                       // a со второго раза
    expect(q.next()).toBe(false)

    expect(result).toEqual(['a'])
    expect(q.progress.value).toBe(100)
  })

  it('markError records the word without requeueing', () => {
    let result = null
    const q = useStageQueue(words, ids => { result = ids })
    q.markError()
    q.succeed()
    q.next()
    q.succeed()
    expect(q.next()).toBe(false)
    expect(result).toEqual(['a'])
  })
})
