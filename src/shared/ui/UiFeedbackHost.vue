<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { feedback } from './feedback.js'
import UiSheet from './UiSheet.vue'
import UiButton from './UiButton.vue'

const { t } = useI18n()

// диалог открыт, пока есть запрос; закрытие без ответа = «нет»
const open    = ref(false)
const current = ref(null)

watch(() => feedback.confirm, value => {
  if (!value) return
  current.value = value
  open.value    = true
})

function answer(result) {
  current.value?.resolve(result)
  feedback.confirm = null
  open.value = false
}

function onClosed() {
  if (feedback.confirm) answer(false)
}
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="item in feedback.toasts" :key="item.id" class="toast" :class="`toast--${item.type}`">
        {{ item.text }}
      </div>
    </TransitionGroup>
  </div>

  <UiSheet v-model="open" dialog :history="current?.history !== false" :title="current?.title || t('common.confirm')" @closed="onClosed">
    {{ current?.message }}
    <template #footer>
      <UiButton variant="text" @click="answer(false)">{{ current?.cancelText || t('common.no') }}</UiButton>
      <UiButton :variant="current?.danger ? 'danger' : 'filled'" @click="answer(true)">
        {{ current?.confirmText || t('common.yes') }}
      </UiButton>
    </template>
  </UiSheet>
</template>

<style scoped>
.toasts {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-h) + 1rem + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 200;
  display: grid;
  gap: 0.5rem;
  width: max-content;
  max-width: calc(100vw - 2rem);
  pointer-events: none;
}

.toast {
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-s);
  background: var(--on);
  color: var(--surface);
  font-size: 0.9375rem;
  box-shadow: 0 0.25rem 1rem rgb(0 0 0 / 0.25);
}
.toast--error   { background: var(--error-c);   color: var(--on-error-c); }
.toast--success { background: var(--success-c); color: var(--on-success-c); }

@media (min-width: 840px) {
  .toasts { bottom: 1.5rem; }
}

.toast-enter-active, .toast-leave-active { transition: all 0.2s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(0.5rem); }
</style>
