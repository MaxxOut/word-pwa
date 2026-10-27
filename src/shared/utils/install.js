import { ref } from 'vue'

// приложение работает только установленным (PWA): данные во вкладке браузер может стереть,
// а из вкладки и из приложения легко получить две разные базы. В режиме разработки — и как сайт.

export const isStandalone =
  matchMedia('(display-mode: standalone)').matches ||
  matchMedia('(display-mode: fullscreen)').matches ||
  navigator.standalone === true // iOS Safari

export const webAllowed = import.meta.env.DEV

export const isIos =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad «как ПК»

// событие установки приходит рано — ловим сразу при загрузке модуля
export const installPrompt = ref(null)
export const installed     = ref(false)

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  installPrompt.value = e
})

window.addEventListener('appinstalled', () => {
  installPrompt.value = null
  installed.value     = true
})

export async function install() {
  const prompt = installPrompt.value
  if (!prompt) return
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') {
    installPrompt.value = null
    installed.value     = true
  }
}
