import Dexie from 'dexie'

export const DB_NAME = 'words'

// Схема базы = таблицы ядра + таблицы модулей (modules/*/schema.js).
// Схема изменилась (в том числе модуль добавлен или удалён) — поднять SCHEMA_VERSION
// и дописать новую версию в SCHEMAS (tests/architecture.test.js). Dexie сам создаст новые таблицы
// и удалит те, которых в схеме больше нет.
export const SCHEMA_VERSION = 2

// фиксированные библиотеки — id совпадает с кодом языка; цвета — в теме (--en, --de)
export const LIBRARIES = [
  { id: 'en', lang_code: 'en', short_name: 'EN' },
  { id: 'de', lang_code: 'de', short_name: 'DE' },
]

const CORE_TABLES = {
  libraries: 'id',
  words:     'id, library_id, [library_id+word_lc]',
  meta:      'key', // настройки и служебные значения
}

// tables модуля: { имя: { schema, library?: ['reset', 'clear'] } }
// library — что делать с записями библиотеки при сбросе прогресса / очистке: удалить
const moduleSchemas = import.meta.glob('../modules/*/schema.js', { eager: true, import: 'tables' })

export const MODULE_TABLES = Object.assign({}, ...Object.values(moduleSchemas))

export function composeSchema() {
  const schema = { ...CORE_TABLES }
  for (const [name, table] of Object.entries(MODULE_TABLES)) {
    if (schema[name]) throw new Error(`table "${name}" is declared twice`)
    schema[name] = table.schema
  }
  return schema
}

export const db = new Dexie(DB_NAME)

db.version(SCHEMA_VERSION).stores(composeSchema())

// при первом запуске (и после очистки) — создать библиотеки
db.on('ready', async () => {
  const existing = await db.libraries.toCollection().primaryKeys()
  const missing  = LIBRARIES.filter(l => !existing.includes(l.id))
  if (missing.length) await db.libraries.bulkAdd(missing)
})

// полностью удалить базу — после этого страницу нужно перезагрузить
export async function wipeDatabase() {
  // при закрытии Dexie отклоняет свои внутренние промисы — после удаления
  // страница всё равно перезагружается, поэтому эти ошибки гасим
  window.addEventListener('unhandledrejection', e => {
    if (e.reason?.name === 'DatabaseClosedError') e.preventDefault()
  })
  db.close()
  await Dexie.delete(DB_NAME)
}
