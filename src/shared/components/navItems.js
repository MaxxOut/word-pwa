// разделы нижнего меню — в этом же порядке переключаются свайпом.
// Учить и Повторять — с главной (там будет другое меню)
export const NAV_ITEMS = [
  { name: 'home',     icon: 'home' },
  { name: 'words',    icon: 'words' },
  { name: 'settings', icon: 'settings' },
]

export const navIndex = name => NAV_ITEMS.findIndex(i => i.name === name)
