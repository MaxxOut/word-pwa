<script setup>
import { ref, computed, useId, useAttrs } from 'vue'
import AppIcon from '../components/AppIcon.vue'

// атрибуты (autocomplete, inputmode…) — на сам input, class и style — на обёртку
defineOptions({ inheritAttrs: false })

const attrs      = useAttrs()
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs
  return rest
})

const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  label:       { type: String,  default: '' },
  placeholder: { type: String,  default: '' },
  hint:        { type: String,  default: '' },
  error:       { type: String,  default: '' },
  icon:        { type: String,  default: null },
  clearable:   { type: Boolean, default: false },
  multiline:   { type: Boolean, default: false },
  disabled:    { type: Boolean, default: false },
  type:        { type: String,  default: 'text' },
  state:       { type: String,  default: null }, // success | error — подсветка рамки
})

const emit = defineEmits(['enter', 'clear'])

const id    = useId()
const input = ref(null)

function clear() {
  model.value = ''
  emit('clear')
  input.value?.focus()
}

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="field" :class="[$attrs.class, { 'field--error': error || state === 'error', 'field--success': state === 'success' }]" :style="$attrs.style">
    <label v-if="label" :for="id" class="field-label">{{ label }}</label>
    <div class="field-box" :class="{ 'field-box--disabled': disabled }">
      <AppIcon v-if="icon" :name="icon" size="1.25rem" class="field-icon" />
      <textarea
          v-if="multiline"
          :id="id"
          ref="input"
          v-model="model"
          :placeholder="placeholder"
          :disabled="disabled"
          rows="2"
          v-bind="inputAttrs"
      />
      <input
          v-else
          :id="id"
          ref="input"
          v-model="model"
          :type="type"
          :placeholder="placeholder"
          :disabled="disabled"
          v-bind="inputAttrs"
          @keydown.enter="emit('enter')"
      >
      <button
          v-if="clearable && model"
          type="button"
          class="field-clear"
          :aria-label="$t('common.clear')"
          @click="clear"
      >
        <AppIcon name="close" size="1.25rem" />
      </button>
    </div>
    <div v-if="error || hint" class="field-hint">{{ error || hint }}</div>
  </div>
</template>

<style scoped>
.field { display: grid; gap: 0.375rem; min-width: 0; }

.field-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--touch);
  padding: 0 0.875rem;
  border-radius: var(--radius-s);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--outline);
  transition: box-shadow 0.15s;
}
.field-box:focus-within { box-shadow: inset 0 0 0 2px var(--primary); }
.field-box--disabled { opacity: 0.6; }

.field--error   .field-box { box-shadow: inset 0 0 0 2px var(--error); }
.field--success .field-box { box-shadow: inset 0 0 0 2px var(--success); }

input, textarea {
  flex: 1;
  min-width: 0;
  border: 0;
  background: none;
  outline: none;
  font-size: 1rem;
  padding: 0.75rem 0;
}
textarea { resize: vertical; min-height: 4rem; }
input::placeholder, textarea::placeholder { color: var(--muted); opacity: 0.7; }

.field-icon { color: var(--muted); }

.field-clear {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin-right: -0.375rem;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--muted);
}

.field-hint {
  font-size: 0.75rem;
  color: var(--muted);
  padding-left: 0.25rem;
}
.field--error .field-hint { color: var(--error); }
</style>
