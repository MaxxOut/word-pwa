// встроенные тексты для чтения. Темы фиксированные, названия — в i18n (reading.topics.<id>)
import en from './en.js'
import de from './de.js'

export const TOPICS = [
  { id: 'tales',   icon: 'castle' },
  { id: 'science', icon: 'science' },
  { id: 'life',    icon: 'coffee' },
]

const BY_LIBRARY = { en, de }

// библиотека текста — по файлу, в котором он лежит
for (const [libraryId, list] of Object.entries(BY_LIBRARY)) {
  for (const text of list) text.library_id = libraryId
}

export function textsOf(libraryId) {
  return BY_LIBRARY[libraryId] ?? []
}

export function findText(id) {
  for (const list of Object.values(BY_LIBRARY)) {
    const text = list.find(t => t.id === id)
    if (text) return text
  }
  return null
}
