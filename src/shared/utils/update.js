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
    // PWA на телефоне живёт в памяти днями — проверяем, когда приложение снова на экране,
    // и раз в полчаса, пока оно открыто
    onRegisteredSW(_url, registration) {
      if (!registration) return
      const check = () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      }
      document.addEventListener('visibilitychange', check)
      setInterval(check, 30 * 60 * 1000)
    },
  })
}

export function applyUpdate() {
  updateSW?.(true)
}

export function dismissUpdate() {
  dismissed.value = true
}
