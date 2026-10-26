<script setup>
// переключатель с подписью: вся строка нажимается
const model = defineModel({ type: Boolean, default: false })

defineProps({
  label:    { type: String,  default: '' },
  // для переключателя без видимой подписи
  ariaLabel: { type: String, default: undefined },
  hint:     { type: String,  default: '' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <label class="switch-row" :class="{ 'switch-row--disabled': disabled }">
    <span v-if="label || hint || $slots.default" class="switch-text">
      <span>{{ label }}<slot /></span>
      <span v-if="hint" class="switch-hint">{{ hint }}</span>
    </span>
    <input v-model="model" type="checkbox" role="switch" class="sr-only" :disabled="disabled" :aria-label="ariaLabel">
    <span class="switch" :class="{ 'switch--on': model }" aria-hidden="true">
      <span class="thumb" />
    </span>
  </label>
</template>

<style scoped>
.switch-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--touch);
  cursor: pointer;
}
.switch-row--disabled { opacity: 0.5; cursor: default; }

.switch-text { flex: 1; min-width: 0; display: grid; }
.switch-hint { font-size: 0.8125rem; color: var(--muted); }

.switch {
  position: relative;
  width: 3.25rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 1rem;
  background: var(--container-hi);
  box-shadow: inset 0 0 0 2px var(--outline);
  transition: background-color 0.15s;
}
.thumb {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--muted);
  transition: all 0.15s;
}
.switch--on { background: var(--primary); box-shadow: none; }
.switch--on .thumb {
  top: 0.25rem;
  left: 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--on-primary);
}

input:focus-visible + .switch { outline: 2px solid var(--primary); outline-offset: 2px; }
</style>
