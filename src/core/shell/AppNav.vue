<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon, { hasIcon } from '@/shared/components/AppIcon.vue'
import AppLogo from '@/shared/components/AppLogo.vue'
import { goBack } from '@/shared/utils/navigation.js'
import { menuOf } from '@/core/shell/nav.js'

// телефон — нижнее меню, широкий экран — боковая панель (rail).
// В настройках — свои пункты: «Назад» (той же ширины, что и пункты — меню не дёргается) и вкладки
// настроек; вкладки сменяют друг друга без истории, поэтому «Назад» уводит туда, откуда пришли
const route  = useRoute()
const router = useRouter()
const { t }  = useI18n()

const items    = computed(() => menuOf(route))
const settings = computed(() => route.name === 'settings')

// у активного — закрашенная иконка, если такая есть
const iconOf = item => (item.on && hasIcon(`${item.icon}-fill`) ? `${item.icon}-fill` : item.icon)
</script>

<template>
  <nav
      class="nav sticky-bottom"
      :aria-label="t('nav.label')"
      :style="{ '--nav-count': items.length + (settings ? 1 : 0) }"
  >
    <AppLogo v-if="!settings" class="nav-logo" size="2.5rem" />
    <button v-else v-ripple type="button" class="nav-item nav-back" @click="goBack(router, { name: 'home' })">
      <span class="pill"><AppIcon name="back" /></span>
      <span class="nav-label">{{ t('common.back') }}</span>
    </button>
    <RouterLink
        v-for="item in items"
        :key="item.key"
        v-ripple
        :to="item.to"
        :replace="item.replace"
        class="nav-item"
        :class="{ 'nav-item--on': item.on }"
        :aria-current="item.on ? 'page' : undefined"
    >
      <span class="pill">
        <AppIcon :name="iconOf(item)" />
      </span>
      <span class="nav-label">{{ t(item.label) }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(var(--nav-count), 1fr);
  background: var(--container);
}

.nav-logo { display: none; }

.nav-back {
  border: 0;
  background: none;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted);
}

.nav-item {
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.125rem;
  min-width: 0;
  min-height: var(--nav-h);
  /* блоки вплотную, фон активного доходит до краёв и до низа (под полосой жестов) */
  padding: 0.75rem 0.125rem calc(0.75rem + env(safe-area-inset-bottom));
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}

.pill {
  display: grid;
  place-items: center;
  height: 2rem;
}

.nav-label {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* активный — фоном и залитой иконкой; жирный шрифт не нужен: длинные подписи («Грамматика») от него не влезают */
.nav-item--on { background: var(--primary-c); color: var(--on-primary-c); }

@media (min-width: 840px) {
  .nav {
    top: 0;
    right: auto;
    width: 6rem;
    grid-template-columns: 1fr;
    grid-auto-rows: min-content;
    padding: 1rem 0;
  }
  .nav-logo { justify-self: center; margin-bottom: 1.5rem; }
  .nav-back { margin-bottom: 1rem; }
  .nav-item { min-height: 0; padding: 0.75rem 0.125rem; }
}
</style>
