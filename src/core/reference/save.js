// найденное в справочнике → словарь (без реестра модулей — его можно вызывать откуда угодно)
import { wordsRepo } from '@/core/words/repo.js'
import { normalizeWord } from '@/core/words/domain.js'
import { confirm } from '@/shared/ui/feedback.js'

// формы из справочника, которых у слова словаря нет: пусто — слово уже как в справочнике.
// Само слово тоже считается (come — came — come: форму come словарь не хранит)
export function missingForms(word, data) {
  const have = new Set([word?.word ?? '', ...(word?.forms ?? []).map(f => f.word)].map(normalizeWord))
  return data.forms.filter(f => !have.has(normalizeWord(f.word)))
}

// в словарь: слова нет — создать с формами; есть — перевод, транскрипцию, примеры и формы заменить
// данными справочника (отметки и даты изучения остаются). → { word, created }
export async function saveReferenceWord(libraryId, data) {
  const existing = await wordsRepo.find(libraryId, data.word)
  if (!existing) return { word: await wordsRepo.create(libraryId, data), created: true }
  const { translation, transcription, examples, forms } = data
  return { word: await wordsRepo.update(existing.id, { translation, transcription, examples, forms }), created: false }
}

// то же, но слово уже есть — сначала спросить: его данные будут заменены. Отказ → null
export async function saveReferenceWordAsk(libraryId, data, t) {
  const existing = await wordsRepo.find(libraryId, data.word)
  if (existing && !await confirm({
    title:       t('reference.replaceTitle', { word: existing.word }),
    message:     t('reference.replaceConfirm'),
    confirmText: t('reference.replace'),
  })) return null
  return saveReferenceWord(libraryId, data)
}
