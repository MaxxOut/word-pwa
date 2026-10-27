import { createApp } from 'vue'
import { createPinia } from 'pinia'
// шрифты локально: Roboto Flex — текст, Montserrat Alternates — заголовки и цифры
import '@fontsource-variable/roboto-flex'
import '@fontsource/montserrat-alternates/latin-700.css'
import '@fontsource/montserrat-alternates/cyrillic-700.css'
import App from './App.vue'
import InstallView from './features/install/InstallView.vue'
import { isStandalone, webAllowed } from './shared/utils/install.js'
import router from './router/index.js'
import { i18n } from './i18n/index.js'
import { ripple } from './shared/ui/ripple.js'
import './shared/utils/scrollEdges.js'
import { useSettingsStore } from './stores/settings.js'
import { useLibraryStore } from './stores/library.js'
import './shared/styles/main.css'

async function boot() {
  // во вкладке браузера — только экран установки (тема и язык из настроек)
  if (!isStandalone && !webAllowed) {
    const app = createApp(InstallView)
    app.use(createPinia())
    app.use(i18n)
    app.directive('ripple', ripple)
    await useSettingsStore().load()
    app.mount('#app')
    return
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(i18n)
  app.directive('ripple', ripple)
  app.use(router)

  // настройки и библиотеки нужны всем экранам — грузим до показа
  await useSettingsStore().load()
  await useLibraryStore().load()

  app.mount('#app')

  // просим браузер не удалять данные при нехватке места (молча, без запроса)
  navigator.storage?.persist?.().catch(() => {})
}

boot()
