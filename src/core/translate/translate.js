// перевод слова на лету: онлайн-переводчик, Google Переводчик, промпт для любого ИИ-чата.
// Нужен и книге, и карточке слова — поэтому в ядре
import { parseWordsCsv } from '@/core/words/csv.js'

export class TranslateLimitError extends Error {}

// MyMemory: без ключа, из браузера. Лимит — 5000 символов в день на IP
// (с e-mail в параметре de — 50 000 на e-mail)
export async function translateOnline(text, from, to, { email } = {}) {
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', `${from}|${to}`)
  if (email) url.searchParams.set('de', email)

  const res  = await fetch(url)
  const data = await res.json().catch(() => null)
  const out  = data?.responseData?.translatedText?.trim() ?? ''

  // лимит сервис сообщает то кодом, то текстом вместо перевода
  if (res.status === 429 || data?.responseStatus === 429 || data?.quotaFinished || /^MYMEMORY WARNING/i.test(out)) {
    throw new TranslateLimitError()
  }
  if (!res.ok || !out || Number(data?.responseStatus) !== 200) throw new Error('translate failed')
  return out
}

export function googleTranslateUrl(text, from, to) {
  const url = new URL('https://translate.google.com/')
  url.searchParams.set('sl', from)
  url.searchParams.set('tl', to)
  url.searchParams.set('text', text)
  url.searchParams.set('op', 'translate')
  return url.toString()
}

// вставили не ответ, а сам промпт (в буфере ещё он): в тексте есть строка промпта
// после строки со словом
export function isPromptPasted(answer, prompt) {
  if (!prompt) return false
  return prompt.split('\n').slice(2).some(line => line.trim() && answer.includes(line.trim()))
}

const MAX_WORD  = 40 // символов
const MAX_WORDS = 4  // слово может быть и выражением: give up, das Auto

// ответ ИИ → строка слова в формате CSV или null.
// ИИ любит обрамлять ответ ``` и кавычками — снимаем, берём первую строку с «;».
// prompt — скопированный промпт: если вставили его, это не ответ
export function parseAiLine(answer, { prompt } = {}) {
  if (isPromptPasted(answer ?? '', prompt)) return null
  const line = (answer ?? '')
    .split(/\r?\n/)
    .map(s => s.trim().replace(/^`+|`+$/g, '').trim())
    .find(s => s.includes(';'))
  if (!line) return null

  const [row] = parseWordsCsv(line.replace(/^[«"](.*)[»"]$/, '$1'))
  if (!row?.word || !row.translation.length) return null
  // слово — это слово или короткое выражение, а не фраза из другого текста
  if (row.word.length > MAX_WORD || row.word.split(/\s+/).length > MAX_WORDS || row.word.includes(':')) return null
  // в транскрипции скобки оставляем как есть, лишние колонки (прогресс) не берём
  return {
    word:          row.word,
    translation:   row.translation,
    transcription: row.transcription,
    examples:      row.examples,
  }
}
