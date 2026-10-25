import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settings as settingsRepo } from '../data/index.js'
import { DEFAULT_SETTINGS } from '../domain/settings.js'
import { setLocale } from '../i18n/index.js'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(structuredClone(DEFAULT_SETTINGS))

  async function load() {
    settings.value = await settingsRepo.get()
    setLocale(settings.value.locale)
  }

  async function update(patch) {
    settings.value = await settingsRepo.update(patch)
    if ('locale' in patch) setLocale(settings.value.locale)
  }

  return { settings, load, update }
})
