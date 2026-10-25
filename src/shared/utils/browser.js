// мелкие обёртки над API браузера

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const url  = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const VOICES = { en: 'en-US', de: 'de-DE' }

export function canSpeak() {
  return 'speechSynthesis' in window
}

export function speak(text, langCode) {
  if (!canSpeak() || !text) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang  = VOICES[langCode] ?? langCode ?? 'en-US'
  utterance.rate  = 0.9
  window.speechSynthesis.speak(utterance)
}

export function formatDate(iso, locale) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}
