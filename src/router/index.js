import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../features/home/HomeView.vue'
import WordsView from '../features/words/WordsView.vue'
import StudyView from '../features/study/StudyView.vue'
import RepeatView from '../features/study/RepeatView.vue'
import SettingsView from '../features/settings/SettingsView.vue'

// hash-режим: работает на статическом хостинге без настройки сервера
const routes = [
  { path: '/',         name: 'home',     component: HomeView },
  { path: '/words',    name: 'words',    component: WordsView },
  { path: '/study',    name: 'study',    component: StudyView },
  { path: '/repeat',   name: 'repeat',   component: RepeatView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
