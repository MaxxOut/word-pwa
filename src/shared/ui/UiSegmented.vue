<script setup>
// сегментированная кнопка: выбор одного из 2–4 вариантов. options: [{ value, label }]
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
        {{ o.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.seg-wrap { display: grid; gap: 0.375rem; }

.seg {
  display: flex;
  border-radius: 1.375rem;
  box-shadow: inset 0 0 0 1px var(--outline);
  overflow: hidden;
}

.seg-item {
  flex: 1;
  min-height: 2.75rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  background: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--muted);
  transition: background-color 0.15s;
}
.seg-item + .seg-item { border-left: 1px solid var(--outline); }
.seg-item--on { background: var(--primary-c); color: var(--on-primary-c); }
</style>
