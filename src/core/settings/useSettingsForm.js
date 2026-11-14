import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from './store.js'
import { toast } from '@/shared/ui/feedback.js'

// копия части настроек для полей; изменения сохраняются сами (с задержкой)
export function useSettingsForm(keys) {
  const { t }         = useI18n()
  const settingsStore = useSettingsStore()

  const copy = value => (value && typeof value === 'object' ? { ...value } : value)
  const form = ref(Object.fromEntries(keys.map(k => [k, copy(settingsStore.settings[k])])))

  let saveTimer = null
  watch(form, value => {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        await settingsStore.update(value)
      } catch {
        toast.error(t('errors.save'))
      }
    }, 300)
  }, { deep: true })

  return form
}
