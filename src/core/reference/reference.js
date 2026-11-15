// Справочники модулей (поле references в index.js): встроенные данные — не слова пользователя,
// статуса и прогресса у них нет. Ядро опрашивает все и отдаёт «Словам», книге и карточке слова;
// нет модуля — нет и блока.
//
// source: { id, label — ключ перевода заголовка блока, search(libraryId, text, { locale, exact }) → items }
//   exact: true  — text целиком совпадает с любой формой (книга, карточка слова)
//          false — поиск по началу формы или перевода («Слова»)
// item: { key, title, subtitle, word — данные слова для словаря (с forms), to — маршрут карточки в модуле }
import { referenceSources } from '@/core/modules.js'

export function lookupReferences(libraryId, text, { locale, exact = false, limit = 5 } = {}) {
  if (!libraryId || !text?.trim()) return []
  return referenceSources
    .map(src => ({ id: `${src.module}:${src.id}`, label: src.label, items: src.search(libraryId, text, { locale, exact }).slice(0, limit) }))
    .filter(group => group.items.length)
}
