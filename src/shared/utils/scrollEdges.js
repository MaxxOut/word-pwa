// тени у прилипших панелей: атрибуты на <html>, дальше работает CSS (main.css)
//   data-scrolled   — страница прокручена от верха → тень под шапкой (.sticky-top)
//   data-more-below — ниже есть содержимое → тень над нижней панелью (.sticky-bottom)

function update() {
  const el = document.documentElement
  el.toggleAttribute('data-scrolled', el.scrollTop > 0)
  el.toggleAttribute('data-more-below', el.scrollTop + window.innerHeight < el.scrollHeight - 1)
}

window.addEventListener('scroll', update, { passive: true })
window.addEventListener('resize', update)
// содержимое выросло или ужалось (подгрузили слова, развернули фильтры)
new ResizeObserver(update).observe(document.body)
update()
