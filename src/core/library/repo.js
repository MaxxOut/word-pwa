import { db, LIBRARIES, MODULE_TABLES } from '@/core/db.js'
import { NotFoundError } from '@/core/words/errors.js'
import { nowIso } from '@/shared/utils/dates.js'

// таблицы модулей, записи которых удаляются при сбросе / очистке библиотеки
function moduleTables(action) {
  return Object.entries(MODULE_TABLES)
    .filter(([, t]) => t.library?.includes(action))
    .map(([name]) => db.table(name))
}

export const librariesRepo = {
  // в порядке LIBRARIES (английский первым), а не по алфавиту id
  async list() {
    const order = LIBRARIES.map(l => l.id)
    const libs  = (await db.libraries.toArray())
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    return Promise.all(libs.map(async lib => ({
      ...lib,
      words_count: await db.words.where('library_id').equals(lib.id).count(),
    })))
  },

  async get(id) {
    const lib = await db.libraries.get(id)
    if (!lib) throw new NotFoundError(`library ${id}`)
    return lib
  },

  // сбросить прогресс: слова остаются, отметки и даты обнуляются, история модулей удаляется
  async resetProgress(id) {
    const tables = moduleTables('reset')
    await db.transaction('rw', db.words, ...tables, async () => {
      await db.words.where('library_id').equals(id).modify({
        is_learned: false, learned_at: null, repeated_at: null, updated_at: nowIso(),
      })
      for (const t of tables) await t.where('library_id').equals(id).delete()
    })
  },

  // удалить все слова и историю библиотеки
  async clear(id) {
    const tables = moduleTables('clear')
    await db.transaction('rw', db.words, ...tables, async () => {
      await db.words.where('library_id').equals(id).delete()
      for (const t of tables) await t.where('library_id').equals(id).delete()
    })
  },
}
