import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/core/db.js'
import { settingsRepo } from './repo.js'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('settings', () => {
  it('concurrent updates of different sections do not overwrite each other', async () => {
    await Promise.all([
      settingsRepo.update({ learning: { words_per_session: 7 } }),
      settingsRepo.update({ repeat: { days_known: 30 } }),
      settingsRepo.update({ appearance: 'dark' }),
    ])
    const s = await settingsRepo.get()
    expect(s.learning.words_per_session).toBe(7)
    expect(s.repeat.days_known).toBe(30)
    expect(s.appearance).toBe('dark')
  })

  it('drops sections of removed modules', async () => {
    await db.meta.put({ key: 'settings', value: { gone_module: { x: 1 }, text_size: 'l' } })
    const s = await settingsRepo.get()
    expect(s.gone_module).toBeUndefined()
    expect(s.text_size).toBe('l')
  })
})
