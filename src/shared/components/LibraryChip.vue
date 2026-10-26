<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLibraryStore } from '../../stores/library.js'
import AppIcon from './AppIcon.vue'

// компактный чип «EN» в шапке; по нажатию — список библиотек
const { t }   = useI18n()
const library = useLibraryStore()

const open = ref(false)
const root = ref(null)

async function choose(id) {
  open.value = false
  if (id !== library.current?.id) await library.select(id)
}

function onDocClick(e) {
  if (!root.value?.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="root" class="lib" @keydown.esc="open = false">
    <button
        v-ripple
        type="button"
        class="chip"
        :aria-label="t('library.choose', { lib: library.current && t(`libraries.${library.current.id}`) })"
        aria-haspopup="menu"
        :aria-expanded="open"
        @click="open = !open"
    >
      {{ library.current?.short_name }}
    </button>

    <Transition name="menu">
      <ul v-if="open" class="menu" role="menu">
        <li v-for="lib in library.libraries" :key="lib.id" role="none">
          <button
              type="button"
              v-ripple
              role="menuitemradio"
              class="menu-item"
              :aria-checked="lib.id === library.current?.id"
              @click="choose(lib.id)"
          >
            <span class="badge" :class="`badge--${lib.id}`">{{ lib.short_name }}</span>
            <span class="grow">{{ t(`libraries.${lib.id}`) }}</span>
            <span class="muted small num">{{ lib.words_count }}</span>
            <AppIcon v-if="lib.id === library.current?.id" name="check" size="1.25rem" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.lib { position: relative; }

.chip {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 0;
  border-radius: 0.5rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  font-family: var(--font-title);
  font-size: 0.875rem;
  font-weight: 700;
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  z-index: 50;
  min-width: 15rem;
  padding: 0.5rem 0;
  list-style: none;
  border-radius: var(--radius-m);
  background: var(--container);
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 0.2);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: var(--touch);
  padding: 0 1rem;
  border: 0;
  background: none;
  text-align: left;
}
.menu-item:active { background: var(--container-hi); }

.badge {
  font-family: var(--font-title);
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 0.5rem;
  padding: 0.125rem 0.4375rem;
}
.badge--en { background: var(--en-c); color: var(--on-en-c); }
.badge--de { background: var(--de-c); color: var(--on-de-c); }

.menu-enter-active, .menu-leave-active { transition: opacity 0.15s, transform 0.15s; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-0.25rem); }
</style>
