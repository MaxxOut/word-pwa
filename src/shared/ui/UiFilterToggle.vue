<script setup>
import UiIconButton from './UiIconButton.vue'

// кнопка панели фильтров в шапке; точка — фильтр включён, но панель свёрнута
const open = defineModel({ type: Boolean, default: false })

defineProps({
  label:    { type: String,  required: true },
  active:   { type: Boolean, default: false },
  controls: { type: String,  default: null }, // id панели
})
</script>

<template>
  <span class="toggle">
    <UiIconButton
        icon="filter"
        :label="label"
        :variant="open ? 'tonal' : 'standard'"
        :aria-expanded="open"
        :aria-controls="controls"
        @click="open = !open"
    />
    <span v-if="active && !open" class="dot" />
  </span>
</template>

<style scoped>
.toggle { position: relative; display: inline-flex; }

.dot {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--primary);
  pointer-events: none;
}
</style>
