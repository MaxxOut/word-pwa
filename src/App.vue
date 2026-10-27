<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNav from './shared/components/AppNav.vue'
import UiFeedbackHost from './shared/ui/UiFeedbackHost.vue'
import { navIndex } from './shared/components/navItems.js'
import { useSwipeNav } from './shared/components/useSwipeNav.js'

const route  = useRoute()
const router = useRouter()

// занятие (изучение, повторение) — во весь экран, без меню
const immersive = computed(() => !!route.meta.immersive)

// между разделами меню — сдвиг в сторону раздела, остальное — растворение
const transition = ref('page')
router.beforeEach((to, from) => {
  const a = navIndex(from.name)
  const b = navIndex(to.name)
  transition.value = a === -1 || b === -1 || a === b ? 'page' : b > a ? 'slide-next' : 'slide-prev'
})

const mainRef = ref(null)
useSwipeNav(mainRef, router, route)

// при смене экрана прокрутка уходит наверх — уходящий экран сдвигаем, чтобы он не прыгнул
function onBeforeLeave(el) {
  el.style.top = `${-window.scrollY}px`
}

// следующий экран въезжает вплотную к уходящему (после свайпа — с места, где отпустили)
function onAfterEnter() {
  mainRef.value?.style.removeProperty('--swipe-dx')
}
</script>

<template>
  <AppNav v-if="!immersive" />
  <main ref="mainRef" class="main" :class="{ 'main--immersive': immersive }">
    <!-- старый и новый экран на время перехода лежат в одной ячейке сетки и перетекают друг в друга;
         обёртка .page нужна — у экранов по нескольку корней -->
    <div class="pages">
      <RouterView v-slot="{ Component, route: r }">
        <Transition :name="transition" @before-leave="onBeforeLeave" @after-enter="onAfterEnter">
          <!-- ключ — экран; у книги ещё и её id, иначе из книги в книгу экран не пересоздастся -->
        <div :key="r.params.id ? `${r.name}-${r.params.id}` : r.name" class="page">
            <component :is="Component" />
          </div>
        </Transition>
      </RouterView>
    </div>
  </main>
  <UiFeedbackHost />
</template>

<style>
.main {
  width: 100%;
  max-width: calc(var(--content-w) + 2rem);
  margin: 0 auto;
  padding: 0 1rem calc(var(--nav-h) + 1.5rem + env(safe-area-inset-bottom));
  /* сдвинутый экран не даёт горизонтальной прокрутки; clip, а не hidden, — sticky шапка работает */
  overflow-x: clip;
}

.pages { display: grid; }
.page { grid-area: 1 / 1; min-width: 0; position: relative; }

.main--immersive .pages { flex: 1; }
.main--immersive .page {
  display: flex;
  flex-direction: column;
}

/* уходящий экран не ловит нажатия */
.page-leave-active, .slide-next-leave-active, .slide-prev-leave-active { pointer-events: none; }

.page-enter-active { transition: opacity 0.25s ease-out; }
.page-leave-active { transition: opacity 0.15s ease-in; }
.page-enter-from, .page-leave-to { opacity: 0; }

/* слайдер: экраны едут вплотную друг к другу. --swipe-dx — где отпустили палец (useSwipeNav);
   !important — перебить положение, оставленное свайпом */
.slide-next-enter-active, .slide-prev-enter-active,
.slide-next-leave-active, .slide-prev-leave-active {
  /* мягкий разгон и торможение — резкий старт выглядел как прыжок */
  transition: transform 0.42s cubic-bezier(0.45, 0, 0.2, 1) !important;
  will-change: transform;
}
.slide-next-enter-from { transform: translateX(calc(100% + 1rem + var(--swipe-dx, 0px))); }
.slide-prev-enter-from { transform: translateX(calc(-100% - 1rem + var(--swipe-dx, 0px))); }
.slide-next-leave-to { transform: translateX(calc(-100% - 1rem)) !important; opacity: 1 !important; }
.slide-prev-leave-to { transform: translateX(calc(100% + 1rem)) !important; opacity: 1 !important; }

.main--immersive {
  /* снизу отступ даёт подвал занятия (.stage-footer) */
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: 0;
}

@media (min-width: 840px) {
  .main:not(.main--immersive) { padding-left: 7rem; max-width: calc(var(--content-w) + 8rem); padding-bottom: 2rem; }
}
</style>
