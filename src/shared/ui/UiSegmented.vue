<script setup>
import AppIcon from '../components/AppIcon.vue'

// выбор одного из 2–4 вариантов отдельными чипами. options: [{ value, label, icon? }]
const model = defineModel({ type: [String, Number, null], default: null })

defineProps({
  options: { type: Array, required: true },
  label:   { type: String, default: '' },
})
</script>

<template>
  <div class="seg-wrap">
    <span v-if="label" class="field-label">{{ label }}</span>
    <div class="seg" role="radiogroup" :aria-label="label">
      <button
          v-for="o in options"
          :key="String(o.value)"
          v-ripple
          type="button"
          role="radio"
          class="seg-item"
          :class="{ 'seg-item--on': o.value === model }"
          :aria-checked="o.value === model"
          @click="model = o.value"
      >
        <AppIcon v-if="o.icon" :name="o.icon" size="1.125rem" />
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.seg-wrap { display: grid; gap: 0.375rem; }

.seg {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.seg-item {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 2.5rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 0.625rem;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--outline);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.15s;
}
.seg-item--on {
  background: var(--primary-c);
  color: var(--on-primary-c);
  box-shadow: none;
  font-weight: 600;
}
</style>
