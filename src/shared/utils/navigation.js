// «Назад» в шапке: пришли из приложения — шаг назад по истории,
// открыли по ссылке (истории нет) — на запасной экран
export function goBack(router, fallback) {
  if (window.history.state?.back) router.back()
  else router.push(fallback)
}
