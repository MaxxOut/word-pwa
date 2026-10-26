<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppIcon from './AppIcon.vue'
import AppLogo from './AppLogo.vue'

// телефон — нижнее меню, широкий экран — боковая панель (rail)
const route = useRoute()
const { t } = useI18n()

const ITEMS = [
  { name: 'home',     icon: 'home' },
  { name: 'words',    icon: 'words' },
  { name: 'study',    icon: 'study' },
  { name: 'repeat',   icon: 'repeat' },
  { name: 'settings', icon: 'settings' },
]
</script>

<template>
  <nav class="nav" :aria-label="t('nav.label')">
    <AppLogo class="nav-logo" size="2.5rem" />
    <RouterLink
        v-for="item in ITEMS"
        :key="item.name"
        v-ripple
        :to="{ name: item.name }"
        class="nav-item"
        :class="{ 'nav-item--on': route.name === item.name }"
        :aria-current="route.name === item.name ? 'page' : undefined"
    >
      <span class="pill">
        <AppIcon :name="route.name === item.name ? `${item.icon}-fill` : item.icon" />
      </span>
      <span class="nav-label">{{ t(`nav.${item.name}`) }}</span>
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
  grid-template-columns: repeat(5, 1fr);
  background: var(--container);
}

.nav-logo { display: none; }

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

.nav-item--on { background: var(--primary-c); color: var(--on-primary-c); font-weight: 700; }

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
  .nav-item { min-height: 0; padding: 0.75rem 0.125rem; }
}
</style>
