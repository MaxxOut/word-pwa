// «Поделиться» → внешние книги: данные из адреса доживают до экрана «Внешние книги»
// (адрес с ними заменяется — открывается новый экран, он и забирает)
let shared = null

export function keepShared(data) {
  shared = data
}

export function takeShared() {
  const data = shared
  shared = null
  return data
}
