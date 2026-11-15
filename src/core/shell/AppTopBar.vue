<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { goBack } from '@/shared/utils/navigation.js'
import AppLogo from '@/shared/components/AppLogo.vue'
import LibraryChip from '@/core/shell/LibraryChip.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'

// шапка экрана: логотип, заголовок (на главной — название приложения),
// действия экрана (слот), чип библиотеки; слот below — прилипает вместе с шапкой
const props = defineProps({
  title:   { type: String,  default: '' },
  brand:   { type: Boolean, default: false },
  library: { type: Boolean, default: true },
  // куда «назад», если открыли не из приложения (по ссылке) — тогда вместо логотипа стрелка
  back:    { type: Object,  default: null },
})

const router = useRouter()

// длинный заголовок («Неправильные глаголы») уменьшается, чтобы влезть, но не мельче 60 %;
// дальше — многоточие
const MIN_SCALE = 0.6
const titleEl   = ref(null)

function fit() {
  const el = titleEl.value
  if (!el) return
  el.style.fontSize = ''
  if (el.scrollWidth <= el.clientWidth) return
  const base = parseFloat(getComputedStyle(el).fontSize)
  el.style.fontSize = `${base * Math.max(MIN_SCALE, el.clientWidth / el.scrollWidth)}px`
}

const resizer = new ResizeObserver(() => fit())
onMounted(() => titleEl.value && resizer.observe(titleEl.value))
onBeforeUnmount(() => resizer.disconnect())
watch(() => props.title, () => nextTick(fit))
</script>

<template>
  <header class="top sticky-top">
    <div class="top-row">
      <UiIconButton v-if="back" icon="back" class="back-btn" :label="$t('common.back')" @click="goBack(router, back)" />
      <RouterLink v-else v-ripple :to="{ name: 'home' }" class="home-link" :aria-label="$t('nav.home')">
        <AppLogo />
      </RouterLink>
      <h1 ref="titleEl" class="top-title">{{ brand ? 'WordApp' : title }}</h1>
      <slot />
      <LibraryChip v-if="library" />
    </div>
    <slot name="below" />
  </header>
</template>

<style scoped>
/* на всю ширину колонки, включая поля по бокам — иначе по краям видно прокрутку */
.top {
  position: sticky;
  top: 0;
  z-index: 20;
  margin: 0 -1rem 0.5rem;
  padding: env(safe-area-inset-top) 1rem 0;
  background: var(--bg);
}

.top-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: var(--top-h);
}

.home-link {
  display: grid;
  place-items: center;
  width: var(--touch);
  height: var(--touch);
  /* зона нажатия шире логотипа — заголовок подтягиваем ближе */
  margin: 0 -0.25rem 0 -0.5rem;
  border-radius: 50%;
}

.back-btn { margin: 0 -0.25rem 0 -0.5rem; }

.top-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
