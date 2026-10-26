<script setup>
import UiIconButton from './UiIconButton.vue'

// число кнопками − / + : на телефоне удобнее, чем поле ввода
const model = defineModel({ type: Number, required: true })

const props = defineProps({
  label: { type: String, default: '' },
  hint:  { type: String, default: '' },
  min:   { type: Number, default: 0 },
  max:   { type: Number, default: 100 },
})

function step(delta) {
  model.value = Math.min(props.max, Math.max(props.min, model.value + delta))
}
</script>

<template>
  <div class="stepper-row">
    <div class="stepper-text">
      <span>{{ label }}</span>
      <span v-if="hint" class="stepper-hint">{{ hint }}</span>
    </div>
    <div class="stepper">
      <UiIconButton icon="minus" :label="$t('common.less')" :disabled="model <= min" @click="step(-1)" />
      <span class="num value">{{ model }}</span>
      <UiIconButton icon="add" :label="$t('common.more')" :disabled="model >= max" @click="step(1)" />
    </div>
  </div>
</template>

<style scoped>
.stepper-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--touch);
}
.stepper-text { flex: 1; min-width: 0; display: grid; }
.stepper-hint { font-size: 0.8125rem; color: var(--muted); }

.stepper {
  display: flex;
  align-items: center;
  border-radius: 1.5rem;
  background: var(--container-hi);
}
.value {
  min-width: 2rem;
  text-align: center;
  font-size: 1.125rem;
}
</style>
