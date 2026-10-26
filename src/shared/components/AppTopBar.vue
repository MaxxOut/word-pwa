<script setup>
import AppLogo from './AppLogo.vue'
import LibraryChip from './LibraryChip.vue'

// шапка экрана: логотип, заголовок (на главной — название приложения),
// действия экрана (слот), чип библиотеки; слот below — прилипает вместе с шапкой
defineProps({
  title:   { type: String,  default: '' },
  brand:   { type: Boolean, default: false },
  library: { type: Boolean, default: true },
})
</script>

<template>
  <header class="top sticky-top">
    <div class="top-row">
      <RouterLink v-ripple :to="{ name: 'home' }" class="home-link" :aria-label="$t('nav.home')">
        <AppLogo />
      </RouterLink>
      <h1 class="top-title">{{ brand ? 'WordApp' : title }}</h1>
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
