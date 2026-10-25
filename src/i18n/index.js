import { computed } from 'vue'
import { createI18n } from 'vue-i18n'
import elRu from 'element-plus/es/locale/lang/ru.mjs'
import elUk from 'element-plus/es/locale/lang/uk.mjs'
import ru from './locales/ru.js'
import uk from './locales/uk.js'

export const LOCALES = ['ru', 'uk']

const elementLocales = { ru: elRu, uk: elUk }

// язык телефона: украинский — uk, всё остальное — ru
export function detectLocale() {
  const langs = navigator.languages ?? [navigator.language]
  return langs.some(l => l?.toLowerCase().startsWith('uk')) ? 'uk' : 'ru'
}

export const i18n = createI18n({
  legacy:         false,
  locale:         detectLocale(),
  fallbackLocale: 'ru',
  messages:       { ru, uk },
})

// null — по языку телефона
export function setLocale(code) {
  const locale = LOCALES.includes(code) ? code : detectLocale()
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}

export const elementLocale = computed(() => elementLocales[i18n.global.locale.value])
