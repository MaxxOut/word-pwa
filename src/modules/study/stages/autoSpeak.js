import { computed } from 'vue'
import { useSettingsStore } from '@/core/settings/store.js'
import { useLibraryStore } from '@/core/library/store.js'
import { canSpeak, speak } from '@/shared/utils/browser.js'

// автоозвучка слова в занятиях: включается в настройках и кнопкой в шапке этапа (это одна настройка)
export function useAutoSpeak() {
  const settingsStore = useSettingsStore()
  const library       = useLibraryStore()

  const on = computed(() => canSpeak() && !!settingsStore.settings.speech?.auto)

  function say(text) {
    if (on.value) speak(text, library.current?.lang_code)
  }

  function toggle() {
    if (on.value) window.speechSynthesis.cancel()
    settingsStore.update({ speech: { auto: !on.value } })
  }

  return { on, say, toggle }
}
