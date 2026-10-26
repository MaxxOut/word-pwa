<script setup>
import AppIcon from '../components/AppIcon.vue'

// label обязателен — для экранных дикторов и подсказки
defineProps({
  icon:     { type: String,  required: true },
  label:    { type: String,  required: true },
  variant:  { type: String,  default: 'standard' }, // standard | tonal | danger
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
      v-ripple
      type="button"
      class="icon-btn"
      :class="`icon-btn--${variant}`"
      :aria-label="label"
      :title="label"
      :disabled="disabled"
  >
    <AppIcon :name="icon" />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-grid;
  place-items: center;
  width: var(--touch);
  height: var(--touch);
  flex-shrink: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  transition: background-color 0.15s;
}
.icon-btn--tonal  { background: var(--container-hi); color: var(--on); }
.icon-btn--danger { color: var(--error); }

.icon-btn:not(:disabled):active { background: color-mix(in srgb, currentColor 14%, transparent); }
@media (hover: hover) {
  .icon-btn:not(:disabled):hover { background: color-mix(in srgb, currentColor 8%, transparent); }
}
.icon-btn:disabled { opacity: 0.38; cursor: default; }
</style>
