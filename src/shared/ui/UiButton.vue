<script setup>
import AppIcon from '../components/AppIcon.vue'

// variant: filled | tonal | outlined | text | danger
defineProps({
  variant: { type: String,  default: 'tonal' },
  icon:    { type: String,  default: null },
  loading: { type: Boolean, default: false },
  disabled:{ type: Boolean, default: false },
  block:   { type: Boolean, default: false },
  type:    { type: String,  default: 'button' },
})
</script>

<template>
  <button
      v-ripple
      :type="type"
      class="btn"
      :class="[`btn--${variant}`, { 'btn--block': block, 'btn--loading': loading }]"
      :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner" />
    <AppIcon v-else-if="icon" :name="icon" size="1.25rem" />
    <span v-if="$slots.default" class="label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.25rem;
  border: 0;
  border-radius: 1.375rem;
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1.2;
  text-align: center;
  transition: background-color 0.15s, opacity 0.15s, filter 0.15s;
  user-select: none;
}
.btn:has(.label):has(.icon, .spinner) { padding-left: 1rem; }

.btn--filled   { background: var(--primary);   color: var(--on-primary); }
.btn--tonal    { background: var(--primary-c); color: var(--on-primary-c); }
.btn--outlined { background: transparent; color: var(--on); box-shadow: inset 0 0 0 1px var(--outline); }
.btn--text     { background: transparent; color: var(--primary); padding-inline: 0.75rem; }
.btn--danger   { background: var(--error); color: var(--on-error); }

.btn:not(:disabled):active { filter: brightness(0.92); }
@media (hover: hover) {
  .btn:not(:disabled):hover { filter: brightness(0.96); }
}

.btn:disabled { opacity: 0.38; cursor: default; }
.btn--loading:disabled { opacity: 0.7; }
.btn--block { width: 100%; }

.spinner {
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
