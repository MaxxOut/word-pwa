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
          class="chip seg-item"
          :class="{ 'chip--on': o.value === model }"
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

.seg-item { flex: 1; gap: 0.375rem; }
.chip--on { font-weight: 600; }
</style>
