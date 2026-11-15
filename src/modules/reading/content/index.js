// тексты для чтения. Темы фиксированные, названия — в i18n (reading.topics.<id>).
// Текст — файл <библиотека>/<имя>.text.js: свои тексты и чужие со свободной лицензией
// (источник и лицензия — в source), абзацы разделены пустой строкой.
// В приложении — только каталог (catalog.js, npm run texts); сам текст — отдельный файл сборки,
// скачивается по требованию (офлайн-кэш приложения его не берёт — globIgnores в vite.config.js)
import CATALOG from './catalog.js'

export const TOPICS = [
  { id: 'tales',   icon: 'castle' },
  { id: 'science', icon: 'science' },
  { id: 'life',    icon: 'coffee' },
  { id: 'tech',    icon: 'code' },
]

const FILES = import.meta.glob('./*/*.text.js', { import: 'default' })

export function textsOf(libraryId) {
  return CATALOG.filter(t => t.library_id === libraryId)
}

export function findText(id) {
  return CATALOG.find(t => t.id === id) ?? null
}

// скачать текст с сайта
export async function fetchText(entry) {
  const text = await FILES[`./${entry.file}.text.js`]()
  return { ...text, library_id: entry.library_id }
}
