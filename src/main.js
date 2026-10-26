import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// шрифт локально: только латиница и кириллица, без лишних наборов
import '@fontsource/montserrat-alternates/latin-400.css'
import '@fontsource/montserrat-alternates/cyrillic-400.css'
import '@fontsource/montserrat-alternates/latin-500.css'
import '@fontsource/montserrat-alternates/cyrillic-500.css'
import '@fontsource/montserrat-alternates/latin-600.css'
import '@fontsource/montserrat-alternates/cyrillic-600.css'
import '@fontsource/montserrat-alternates/latin-700.css'
import '@fontsource/montserrat-alternates/cyrillic-700.css'
import App from './App.vue'
import router from './router/index.js'
import { i18n } from './i18n/index.js'
import { useSettingsStore } from './stores/settings.js'
import { useLibraryStore } from './stores/library.js'
import './shared/styles/main.css'

async function boot() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(i18n)
  app.use(ElementPlus)
  app.use(router)

  // настройки и библиотеки нужны всем экранам — грузим до показа
  await useSettingsStore().load()
  await useLibraryStore().load()

  app.mount('#app')
}

boot()
