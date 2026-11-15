// времена по библиотекам: английские — список и теория; немецкие — пока нет (раздел «Скоро»)
import { TENSES, TENSE_GROUPS } from './en.js'
import { THEORY } from './theory.js'

const BY_LIBRARY = { en: TENSES }

export function tensesOf(libraryId) {
  return BY_LIBRARY[libraryId] ?? []
}

// по группам: [{ group, tenses }] — пустые группы не показываем
export function tenseGroupsOf(libraryId) {
  const list = tensesOf(libraryId)
  return TENSE_GROUPS
    .map(group => ({ group, tenses: list.filter(x => x.group === group) }))
    .filter(g => g.tenses.length)
}

export function findTense(libraryId, id) {
  const tense = tensesOf(libraryId).find(x => x.id === id)
  return tense ? { ...tense, theory: THEORY[id] ?? null } : null
}
