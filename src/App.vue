<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNav from './shared/components/AppNav.vue'
import UiFeedbackHost from './shared/ui/UiFeedbackHost.vue'

const route = useRoute()

// занятие (изучение, повторение) — во весь экран, без меню
const immersive = computed(() => !!route.meta.immersive)
</script>

<template>
  <AppNav v-if="!immersive" />
  <main class="main" :class="{ 'main--immersive': immersive }">
    <RouterView />
  </main>
  <UiFeedbackHost />
</template>

<style>
.main {
  width: 100%;
  max-width: calc(var(--content-w) + 2rem);
  margin: 0 auto;
  padding: 0 1rem calc(var(--nav-h) + 1.5rem + env(safe-area-inset-bottom));
}

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
