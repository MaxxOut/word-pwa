// «Назад» на Android закрывает открытую шторку/диалог, а не уходит со страницы.
// При открытии добавляем запись в историю (тот же адрес, номер слоя в state),
// при «Назад» закрываем слои выше номера в state. Закрыли кнопкой — убираем запись сами.

const layers = [] // функции закрытия, по порядку открытия

window.addEventListener('popstate', () => {
  const depth = history.state?.layer ?? 0
  while (layers.length > depth) layers.pop()()
})

export function pushLayer(close) {
  layers.push(close)
  // копируем state роутера, чтобы не сбить его учёт позиций
  history.pushState({ ...history.state, layer: layers.length }, '')
}

// закрытие из интерфейса; если с тех пор ушли на другой экран — историю не трогаем
export function popLayer(close) {
  const index = layers.lastIndexOf(close)
  if (index === -1) return
  layers.splice(index, 1)
  if (history.state?.layer === index + 1) history.back()
}
