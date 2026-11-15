// «Назад» в шапке — всегда на родительский экран (как ссылка), а не «куда-то по истории»:
// предыдущая запись истории и есть родитель — шаг назад (история не растёт); иначе (пришли свайпом,
// с главной, по ссылке) — заменить адрес на родителя: без лишней записи, «Назад» не ходит по кругу
export function goBack(router, parent) {
  if (window.history.state?.back === router.resolve(parent).fullPath) router.back()
  else router.replace(parent)
}
