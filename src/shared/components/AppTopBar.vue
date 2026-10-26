<script setup>
import AppLogo from './AppLogo.vue'
import LibraryChip from './LibraryChip.vue'

// шапка экрана: логотип, заголовок (на главной — название приложения),
// действия экрана (слот), чип библиотеки
defineProps({
  title:   { type: String,  default: '' },
  brand:   { type: Boolean, default: false },
  library: { type: Boolean, default: true },
})
</script>

<template>
  <header class="top">
    <RouterLink v-ripple :to="{ name: 'home' }" class="home-link" :aria-label="$t('nav.home')">
      <AppLogo />
    </RouterLink>
    <h1 class="top-title">{{ brand ? 'WordApp' : title }}</h1>
    <slot />
    <LibraryChip v-if="library" />
  </header>
</template>

<style scoped>
.top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: var(--top-h);
  padding: env(safe-area-inset-top) 0 0;
  margin-bottom: 0.5rem;
  background: var(--bg);
}
.home-link {
  display: grid;
  place-items: center;
  width: var(--touch);
  height: var(--touch);
  margin-left: -0.5rem;
  border-radius: 50%;
}
.top-title {
  flex: 1;
  min-width: 0;
  margin-left: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
