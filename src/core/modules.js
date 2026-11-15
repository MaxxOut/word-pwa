// Реестр модулей. Модуль — папка modules/<id>/, подключается сама, если в ней есть index.js.
// Удалить модуль = удалить папку: вместе с ней уходят его экраны, плитки, настройки,
// переводы (locales/), таблицы (schema.js) и умолчания (settings.js).
//
// index.js модуля экспортирует по умолчанию (все поля необязательны):
//   routes      — маршруты vue-router; имена — с префиксом модуля или его id
//   nav         — [{ route, icon, label, order }] пункты нижнего меню
//   home        — [{ component, order }] плитки главной; получают проп words (слова библиотеки или null)
//   settingsTabs — [{ id, icon, label, order }] свои вкладки настроек
//   settings    — [{ tab, component, order }] карточки на вкладке настроек (своей или ядра: general, data)
//   dataActions — [{ component, order }] строки в карточке «Данные» (вкладка data)
//   icons       — { имя: svg } свои иконки для AppIcon
//   references  — [{ id, label, search }] справочники для поиска в «Словах», книге, карточке слова
//                 (описание — core/reference/reference.js)
//
// Модули не импортируют друг друга: общее — только через ядро (core/*) и shared/*.
import { registerIcons } from '@/shared/components/AppIcon.vue'

const found = import.meta.glob('../modules/*/index.js', { eager: true, import: 'default' })

export const modules = Object.entries(found).map(([path, def]) => ({
  id: path.match(/modules\/([^/]+)\//)[1],
  ...def,
}))

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)

function collect(key) {
  return modules
    .flatMap(m => (m[key] ?? []).map(item => ({ ...item, module: m.id })))
    .sort(byOrder)
}

export const moduleRoutes     = modules.flatMap(m => m.routes ?? [])
export const moduleNav        = collect('nav')
export const homeTiles        = collect('home')
export const settingsTabs     = collect('settingsTabs')
export const settingsSections = collect('settings')
export const dataActions      = collect('dataActions')
export const referenceSources = collect('references')

for (const m of modules) if (m.icons) registerIcons(m.icons)
