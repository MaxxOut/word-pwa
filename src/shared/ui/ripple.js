// v-ripple — волна от точки нажатия (Material). Цвет — currentColor элемента.
// Метка — атрибут data-ripple, а не класс: Vue перезаписывает class при перерисовке.
// Волна живёт в своём слое, обрезанном по форме элемента (border-radius: inherit).

function layerOf(el) {
  let layer = el.querySelector(':scope > .ripple-layer')
  if (!layer) {
    layer = document.createElement('span')
    layer.className = 'ripple-layer'
    layer.setAttribute('aria-hidden', 'true')
    el.appendChild(layer)
  }
  return layer
}

function onDown(e) {
  const el = e.currentTarget
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') return

  const rect = el.getBoundingClientRect()
  const size = Math.hypot(rect.width, rect.height) * 2
  const wave = document.createElement('span')
  wave.className = 'ripple-wave'
  wave.style.width = wave.style.height = `${size}px`
  wave.style.left  = `${e.clientX - rect.left - size / 2}px`
  wave.style.top   = `${e.clientY - rect.top - size / 2}px`
  layerOf(el).appendChild(wave)

  // исчезает после отпускания, но не раньше, чем дорастёт
  const born = performance.now()
  const fade = () => {
    window.removeEventListener('pointerup', fade)
    window.removeEventListener('pointercancel', fade)
    setTimeout(() => {
      wave.classList.add('ripple-wave--out')
      setTimeout(() => wave.remove(), 300)
    }, Math.max(0, 250 - (performance.now() - born)))
  }
  window.addEventListener('pointerup', fade)
  window.addEventListener('pointercancel', fade)
}

export const ripple = {
  mounted(el) {
    el.setAttribute('data-ripple', '')
    el.addEventListener('pointerdown', onDown)
  },
  unmounted(el) {
    el.removeEventListener('pointerdown', onDown)
  },
}
