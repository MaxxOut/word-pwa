import { db } from '@/core/db.js'
import { mergeSettings, withDefaults } from './defaults.js'

const SETTINGS_KEY = 'settings'

export const settingsRepo = {
  async get() {
    const row = await db.meta.get(SETTINGS_KEY)
    return withDefaults(row?.value)
  },

  // в транзакции: формы настроек сохраняются независимо, и одновременные
  // сохранения иначе затирали бы друг друга (прочитали старое — записали поверх)
  update(patch) {
    // JSON-копия: реактивные объекты Vue (Proxy) IndexedDB сохранить не может
    const clean = JSON.parse(JSON.stringify(patch))
    return db.transaction('rw', db.meta, async () => {
      const value = mergeSettings(await settingsRepo.get(), clean)
      await db.meta.put({ key: SETTINGS_KEY, value })
      return value
    })
  },
}
