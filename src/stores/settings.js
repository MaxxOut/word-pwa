import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settings as settingsRepo } from '../data/index.js'
import { DEFAULT_SETTINGS } from '../domain/settings.js'
import { setLocale } from '../i18n/index.js'

// тема, размер текста и цвет библиотеки — атрибуты на <html>, дальше работает CSS
function applyLook(settings) {
  const { appearance: theme, text_size, current_library_id } = settings
  current = settings
  const root = document.documentElement
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
  else delete root.dataset.theme
  root.dataset.textSize = text_size
  root.dataset.lib      = current_library_id

  // цвет системной панели телефона — как фон приложения в текущей теме
  const bg = getComputedStyle(root).getPropertyValue('--bg').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
}

let current = null

// тема «как в системе»: система переключилась — обновить цвет панели
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (current) applyLook(current)
})

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(structuredClone(DEFAULT_SETTINGS))

  async function load() {
    settings.value = await settingsRepo.get()
    setLocale(settings.value.locale)
    applyLook(settings.value)
  }

  async function update(patch) {
    settings.value = await settingsRepo.update(patch)
    if ('locale' in patch) setLocale(settings.value.locale)
    applyLook(settings.value)
  }

  return { settings, load, update }
})
