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

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})
