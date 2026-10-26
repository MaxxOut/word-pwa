<script setup>
import AppIcon from '../components/AppIcon.vue'

defineProps({
  icon:  { type: String, default: 'words' },
  title: { type: String, required: true },
  text:  { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <span class="empty-icon"><AppIcon :name="icon" size="2rem" /></span>
    <h3>{{ title }}</h3>
    <p v-if="text" class="muted">{{ text }}</p>
    <div v-if="$slots.default" class="empty-actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  text-align: center;
}
.empty-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.5rem;
  border-radius: 50%;
  background: var(--primary-c);
  color: var(--on-primary-c);
}
.empty p { max-width: 22rem; }
.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>
