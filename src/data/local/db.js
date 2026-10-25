import Dexie from 'dexie'

export const DB_NAME = 'words'

// фиксированные библиотеки — id совпадает с кодом языка
export const LIBRARIES = [
  { id: 'en', lang_code: 'en', short_name: 'EN', color: '#93c5fd' },
  { id: 'de', lang_code: 'de', short_name: 'DE', color: '#fdba74' },
]

export const db = new Dexie(DB_NAME)

db.version(1).stores({
  libraries: 'id',
  words:     'id, library_id, [library_id+word_lc]',
  sessions:  '[library_id+date], library_id, date',
  meta:      'key', // настройки и служебные значения
})

// при первом запуске (и после очистки) — создать библиотеки
db.on('ready', async () => {
  const existing = await db.libraries.toCollection().primaryKeys()
  const missing  = LIBRARIES.filter(l => !existing.includes(l.id))
  if (missing.length) await db.libraries.bulkAdd(missing)
})
