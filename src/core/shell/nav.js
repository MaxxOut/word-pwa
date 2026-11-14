import { moduleNav } from '@/core/modules.js'

// разделы нижнего меню — в этом же порядке переключаются свайпом.
// Главная — первой, настройки — последними, между ними — пункты модулей по order
export const NAV_ITEMS = [
  { route: 'home', icon: 'home', label: 'nav.home' },
  ...moduleNav,
  { route: 'settings', icon: 'settings', label: 'nav.settings' },
]

export const navIndex = name => NAV_ITEMS.findIndex(i => i.route === name)
