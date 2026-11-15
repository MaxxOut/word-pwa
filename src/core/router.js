import { createRouter, createWebHashHistory } from 'vue-router'
import { moduleRoutes } from '@/core/modules.js'
import HomeView from '@/core/home/HomeView.vue'
import SettingsView from '@/core/settings/SettingsView.vue'

// hash-режим: работает на статическом хостинге без настройки сервера.
// meta.immersive — экран во весь экран, без нижнего меню (занятия, книга)
const routes = [
  { path: '/',         name: 'home',     component: HomeView },
  ...moduleRoutes,
  // настройки — вкладками (core/shell/nav.js → SETTINGS_TABS)
  { path: '/settings', redirect: '/settings/general' },
  { path: '/settings/:tab', name: 'settings', component: SettingsView, props: true },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})

// «Поделиться» на Android (share_target в манифесте) открывает приложение с ?title=&text=&url= —
// отдаём это маршруту модуля с meta.share (нет такого — просто запуск)
export function takeShare() {
  const params = new URLSearchParams(location.search)
  if (!params.has('text') && !params.has('url')) return
  history.replaceState(null, '', location.pathname + location.hash)
  const target = router.getRoutes().find(r => r.meta.share)
  if (!target) return
  router.replace({ name: target.name, query: Object.fromEntries(['title', 'text', 'url'].map(k => [k, params.get(k) ?? ''])) })
}

export default router
