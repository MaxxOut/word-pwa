import { createRouter, createWebHashHistory } from 'vue-router'
import { moduleRoutes } from '@/core/modules.js'
import HomeView from '@/core/home/HomeView.vue'
import SettingsView from '@/core/settings/SettingsView.vue'

// hash-режим: работает на статическом хостинге без настройки сервера.
// meta.immersive — экран во весь экран, без нижнего меню (занятия, книга)
const routes = [
  { path: '/',         name: 'home',     component: HomeView },
  ...moduleRoutes,
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})
