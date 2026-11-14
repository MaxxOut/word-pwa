<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { wordsRepo } from '@/core/words/repo.js'
import { useLibraryStore } from '@/core/library/store.js'
import { homeTiles } from '@/core/modules.js'
import { needRefresh, dismissed, applyUpdate, dismissUpdate } from '@/shared/utils/update.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiSpinner from '@/shared/ui/UiSpinner.vue'

// главная — плитки модулей (поле home в index.js модуля). Слова библиотеки грузим один раз
// и отдаём всем плиткам; остальное плитка грузит сама
const { t }   = useI18n()
const library = useLibraryStore()

const words = ref(null)

async function load() {
  if (!library.current) return
  words.value = await wordsRepo.all(library.current.id)
}

watch(() => library.current?.id, load, { immediate: true })
</script>

<template>
  <AppTopBar brand />

  <Transition name="banner">
    <section v-if="needRefresh && !dismissed" class="update" role="status">
      <UiIconButton icon="close" :label="t('common.close')" @click="dismissUpdate" />
      <span class="grow">{{ t('home.updateReady') }}</span>
      <UiButton variant="filled" @click="applyUpdate">{{ t('home.update') }}</UiButton>
    </section>
  </Transition>

  <UiSpinner v-if="!words" />

  <div v-else class="bento">
    <component :is="tile.component" v-for="tile in homeTiles" :key="`${tile.module}-${tile.order}`" :words="words" />
  </div>
</template>

<style scoped>
.update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.25rem;
  border-radius: 0.5rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  font-weight: 500;
}
.banner-enter-active, .banner-leave-active { transition: opacity 0.25s, transform 0.25s; }
.banner-enter-from, .banner-leave-to { opacity: 0; transform: translateY(-0.5rem); }

.bento {
  display: grid;
  gap: 0.5rem;
}
</style>

<style>
/* общий вид плиток главной — ими пользуются плитки модулей */
.tile {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--container);
  box-shadow: var(--shadow-card);
}

.tile-label {
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.tile-value { font-size: 2rem; }

/* подпись сверху, крупная цифра и кнопка снизу */
.tile--hero {
  grid-template-columns: 1fr auto;
  grid-template-areas: "label label" "value action";
  align-items: center;
  row-gap: 0.125rem;
  padding-block: 0.75rem;
}
.tile--hero .tile-label { grid-area: label; }
.tile--hero .tile-value { grid-area: value; font-size: 2.5rem; }
.tile--hero > :last-child { grid-area: action; }

/* на широком экране плитки в две колонки; широкая — на всю строку.
   Пустая главная (.home-empty) — всё, что после неё, тоже на всю строку */
@media (min-width: 600px) {
  .bento { grid-template-columns: 1fr 1fr; }
  .tile--wide, .home-empty, .home-empty ~ * { grid-column: 1 / -1; }
}
</style>
