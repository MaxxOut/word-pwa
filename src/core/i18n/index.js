import { createI18n } from 'vue-i18n'
import ru from './ru.js'
import uk from './uk.js'

export const LOCALES = ['ru', 'uk']

// переводы модуля лежат в modules/<id>/locales/<lang>.js и доступны только как <id>.*
const moduleLocales = import.meta.glob('../../modules/*/locales/*.js', { eager: true, import: 'default' })

export function composeMessages() {
  const messages = { ru: { ...ru }, uk: { ...uk } }
  for (const [path, value] of Object.entries(moduleLocales)) {
    const [, id, lang] = path.match(/modules\/([^/]+)\/locales\/([^/]+)\.js$/)
    if (!messages[lang]) continue
    if (id in messages[lang]) throw new Error(`i18n: namespace "${id}" is taken`)
    messages[lang][id] = value
  }
  return messages
}

// язык телефона: украинский — uk, всё остальное — ru
export function detectLocale() {
  const langs = navigator.languages ?? [navigator.language]
  return langs.some(l => l?.toLowerCase().startsWith('uk')) ? 'uk' : 'ru'
}

export const i18n = createI18n({
  legacy:         false,
  locale:         detectLocale(),
  fallbackLocale: 'ru',
  messages:       composeMessages(),
})

// null — по языку телефона
export function setLocale(code) {
  const locale = LOCALES.includes(code) ? code : detectLocale()
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}
