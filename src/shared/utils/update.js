import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

// новая версия скачивается в фоне; на главной — плашка «Обновить».
// Не обновили — версия включится сама при следующем полном запуске.
export const needRefresh = ref(false)
export const dismissed   = ref(false)

let updateSW = null

export function initUpdates() {
  updateSW = registerSW({
    onNeedRefresh() {
      needRefresh.value = true
    },
    // PWA на телефоне живёт в памяти днями — проверяем, когда приложение снова на экране
    onRegisteredSW(_url, registration) {
      if (!registration) return
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      })
    },
  })
}

export function applyUpdate() {
  updateSW?.(true)
}

export function dismissUpdate() {
  dismissed.value = true
}
