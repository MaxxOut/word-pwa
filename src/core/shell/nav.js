import { moduleNav, settingsTabs } from '@/core/modules.js'

// разделы нижнего меню — в этом же порядке переключаются свайпом.
// Главная — первой, настройки — последними, между ними — пункты модулей по order
export const NAV_ITEMS = [
  { route: 'home', icon: 'home', label: 'nav.home' },
  ...moduleNav,
  { route: 'settings', icon: 'settings', label: 'nav.settings' },
]

// вкладки настроек: свои у ядра (общее, данные) и у модулей (поле settingsTabs в index.js)
export const SETTINGS_TABS = [
  { id: 'general', icon: 'tune', label: 'settings.tabs.general', order: 0 },
  ...settingsTabs,
  { id: 'data', icon: 'database', label: 'settings.tabs.data', order: 1000 },
].sort((a, b) => a.order - b.order)

export const tabOf = route => {
  const tab = route.params.tab
  return SETTINGS_TABS.some(t => t.id === tab) ? tab : SETTINGS_TABS[0].id
}

const inSettings = route => route.name === 'settings'

// пункты нижнего меню экрана: в настройках — вкладки настроек (и «Назад» перед ними)
export function menuOf(route) {
  if (inSettings(route)) {
    return SETTINGS_TABS.map(t => ({
      key: t.id, icon: t.icon, label: t.label, on: tabOf(route) === t.id,
      to: { name: 'settings', params: { tab: t.id } }, replace: true,
    }))
  }
  return NAV_ITEMS.map(i => ({
    key: i.route, icon: i.icon, label: i.label, on: route.name === i.route,
    to: i.route === 'settings' ? { name: 'settings', params: { tab: SETTINGS_TABS[0].id } } : { name: i.route },
  }))
}

// место экрана в своём ряду для свайпа и направления перехода: { row, i } или null.
// В настройках ряд — вкладки; при переходе из разделов меню настройки — последний раздел
export function slotOf(route, from = null) {
  if (inSettings(route) && (!from || inSettings(from))) {
    return { row: 'settings', i: SETTINGS_TABS.findIndex(t => t.id === tabOf(route)) }
  }
  const i = NAV_ITEMS.findIndex(n => n.route === route.name)
  return i === -1 ? null : { row: 'main', i }
}

// сосед по свайпу: dir = 1 — следующий, -1 — предыдущий
export function neighbourOf(route, dir) {
  const items = menuOf(route)
  const i     = items.findIndex(x => x.on)
  if (i === -1) return null
  return items[i + dir] ?? null
}
