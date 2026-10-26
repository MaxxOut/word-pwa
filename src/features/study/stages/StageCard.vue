<script setup>
import AppIcon from '../../../shared/components/AppIcon.vue'

// карточка вопроса этапа; hadErrors — пометка «в этом слове уже ошибались»
defineProps({
  hadErrors: { type: Boolean, default: false },
})
</script>

<template>
  <section class="stage-card">
    <slot />
    <div v-if="hadErrors" class="had-errors">
      <AppIcon name="warning" size="1rem" /> {{ $t('stages.hadErrors') }}
    </div>
  </section>
</template>

<style scoped>
.stage-card {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  background: var(--container);
  text-align: center;
}

.had-errors {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--error);
  font-size: 0.8125rem;
}
</style>
