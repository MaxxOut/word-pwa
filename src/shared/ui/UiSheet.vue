<script setup>
import { ref, watch, onBeforeUnmount, useId } from 'vue'
import UiIconButton from './UiIconButton.vue'
import { pushLayer, popLayer, nextZ } from './backClose.js'

// на телефоне — шторка снизу, на широком экране — диалог по центру.
// dialog — всегда по центру (подтверждения)
const open = defineModel({ type: Boolean, default: false })

const props = defineProps({
  title:  { type: String,  default: '' },
  dialog: { type: Boolean, default: false },
  // false — без записи в истории (подтверждение внутри перехода роутера)
  history: { type: Boolean, default: true },
})

const emit = defineEmits(['closed'])

const titleId = useId()
const zIndex  = ref(100)

// закрыли «Назад» — запись истории уже снята
function closeFromBack() {
  open.value = false
}

watch(open, (value, old) => {
  if (value && !old) zIndex.value = nextZ()
  if (value && !old && props.history) pushLayer(closeFromBack)
  if (!value && old) {
    if (props.history) popLayer(closeFromBack)
    emit('closed')
  }
})

onBeforeUnmount(() => {
  if (open.value && props.history) popLayer(closeFromBack)
})

function onKey(e) {
  if (e.key === 'Escape') open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
          v-if="open"
          class="overlay"
          :class="{ 'overlay--dialog': dialog }"
          :style="{ zIndex }"
          @click.self="open = false"
          @keydown="onKey"
      >
        <div class="sheet" role="dialog" aria-modal="true" :aria-labelledby="title ? titleId : undefined">
          <div v-if="!dialog" class="handle" aria-hidden="true" />
          <header v-if="title" class="sheet-head">
            <h2 :id="titleId">{{ title }}</h2>
            <UiIconButton v-if="!dialog" icon="close" :label="$t('common.close')" @click="open = false" />
          </header>
          <div class="sheet-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="sheet-foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: var(--scrim);
}

.sheet {
  width: 100%;
  max-width: 36rem;
  max-height: calc(100dvh - 2rem - env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -0.5rem 2rem rgb(0 0 0 / 0.2);
}

.handle {
  width: 2.25rem;
  height: 0.25rem;
  margin: 0.75rem auto 0;
  border-radius: 0.125rem;
  background: var(--outline);
}

.sheet-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem 0.25rem 1.25rem;
}
.sheet-head h2 { flex: 1; min-width: 0; font-size: 1.25rem; }

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1rem;
  overscroll-behavior: contain;
}

.sheet-foot {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid var(--container-hi);
}

/* диалог и широкий экран — по центру */
.overlay--dialog { align-items: center; padding: 1.5rem; }
.overlay--dialog .sheet {
  max-width: 24rem;
  border-radius: var(--radius-xl);
  padding-bottom: 0;
}
.overlay--dialog .sheet-head { padding: 1.5rem 1.5rem 0.25rem; }
.overlay--dialog .sheet-body { padding: 0.5rem 1.5rem 0.5rem; color: var(--muted); }
.overlay--dialog .sheet-foot { border-top: 0; padding: 1rem 1.5rem 1.25rem; }

@media (min-width: 840px) {
  .overlay { align-items: center; padding: 2rem; }
  .sheet { border-radius: var(--radius-xl); padding-bottom: 0; }
  .handle { display: none; }
}

.sheet-enter-active, .sheet-leave-active { transition: background-color 0.2s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform 0.2s ease-out, opacity 0.2s; }
.sheet-enter-from, .sheet-leave-to { background: transparent; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(2rem); opacity: 0; }
</style>
