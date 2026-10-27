import { onMounted, onBeforeUnmount } from 'vue'
import { NAV_ITEMS, navIndex } from './navItems.js'

// свайп влево/вправо по экрану — соседний раздел меню; экран едет за пальцем.
// От самого края не ловим — там системный жест «назад».
const EDGE      = 24   // px от края экрана
const LOCK      = 10   // px, после которых понятно направление жеста
const THRESHOLD = 0.25 // доля ширины экрана, чтобы перелистнуть
const FLICK     = 0.5  // px/мс — быстрый взмах листает и на коротком пути

export function useSwipeNav(rootRef, router, route) {
  let start = null // { x, y, t, page, el }
  let dx = 0
  let horizontal = null

  function neighbour(dir) {
    const i = navIndex(route.name)
    if (i === -1) return null
    return NAV_ITEMS[i + dir]?.name ?? null
  }

  function canStart(e) {
    if (e.touches.length !== 1 || route.meta.immersive || navIndex(route.name) === -1) return false
    const x = e.touches[0].clientX
    if (x < EDGE || x > window.innerWidth - EDGE) return false
    // поле ввода и всё, что отмечено data-no-swipe, не трогаем
    return !e.target.closest('input, textarea, [data-no-swipe]')
  }

  function onStart(e) {
    if (!canStart(e)) return
    const el = rootRef.value?.querySelector('.page')
    if (!el) return
    const tch = e.touches[0]
    start      = { x: tch.clientX, y: tch.clientY, t: e.timeStamp, el }
    dx         = 0
    horizontal = null
  }

  function onMove(e) {
    if (!start) return
    const tch = e.touches[0]
    const mx  = tch.clientX - start.x
    const my  = tch.clientY - start.y

    if (horizontal === null) {
      if (Math.abs(mx) < LOCK && Math.abs(my) < LOCK) return
      horizontal = Math.abs(mx) > Math.abs(my) * 1.5
      if (!horizontal) { start = null; return }
    }

    e.preventDefault() // не прокручивать список, пока листаем
    // в сторону, где раздела нет, — тянется с сопротивлением
    dx = neighbour(mx < 0 ? 1 : -1) ? mx : mx / 4
    start.el.style.transition = 'none'
    start.el.style.transform  = `translateX(${dx}px)`
  }

  function onEnd(e) {
    if (!start) return
    const { el, t } = start
    start = null
    if (!horizontal) return

    const speed  = Math.abs(dx) / Math.max(e.timeStamp - t, 1)
    const target = neighbour(dx < 0 ? 1 : -1)
    if (target && (Math.abs(dx) > window.innerWidth * THRESHOLD || speed > FLICK)) {
      // дальше — переход страницы (App.vue): уходящий едет из текущего положения,
      // новый — вплотную к нему
      rootRef.value.style.setProperty('--swipe-dx', `${dx}px`)
      router.push({ name: target })
      return
    }
    // не дотянули — вернуть на место
    el.style.transition = 'transform 0.2s'
    el.style.transform  = ''
    el.addEventListener('transitionend', () => { el.style.transition = '' }, { once: true })
  }

  onMounted(() => {
    const root = rootRef.value
    root.addEventListener('touchstart', onStart, { passive: true })
    root.addEventListener('touchmove', onMove, { passive: false })
    root.addEventListener('touchend', onEnd)
    root.addEventListener('touchcancel', onEnd)
  })

  onBeforeUnmount(() => {
    const root = rootRef.value
    root?.removeEventListener('touchstart', onStart)
    root?.removeEventListener('touchmove', onMove)
    root?.removeEventListener('touchend', onEnd)
    root?.removeEventListener('touchcancel', onEnd)
  })
}
