<script setup>
import { useI18n } from 'vue-i18n'
import UiIconButton from '../../../shared/ui/UiIconButton.vue'
import UiProgress from '../../../shared/ui/UiProgress.vue'

// шапка занятия: закрыть, заголовок, счётчик и полоса прогресса
defineProps({
  title:    { type: String, required: true },
  counter:  { type: String, default: '' },
  progress: { type: Number, default: null }, // 0–100, null — без полосы
})

defineEmits(['exit'])

const { t } = useI18n()
</script>

<template>
  <header class="stage-top">
    <div class="stage-row">
      <UiIconButton icon="close" :label="t('study.exit')" @click="$emit('exit')" />
      <h2 class="grow">{{ title }}</h2>
      <span v-if="counter" class="num counter">{{ counter }}</span>
      <slot />
    </div>
    <UiProgress v-if="progress !== null" :value="progress" />
  </header>
</template>

<style scoped>
.stage-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  gap: 0.5rem;
  padding: 0.5rem 0 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--bg);
}

.stage-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: -0.5rem;
}

h2 {
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.counter {
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  font-size: 0.875rem;
}
</style>
