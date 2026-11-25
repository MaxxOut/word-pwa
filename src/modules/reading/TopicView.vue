<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readingRepo } from './repo.js'
import { textsOf } from './content/index.js'
import { saved, loadSaved } from './texts.js'
import { LEVELS } from './domain.js'
import { useLibraryStore } from '@/core/library/store.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiFilterToggle from '@/shared/ui/UiFilterToggle.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'

const props = defineProps({
  topic: { type: String, required: true },
})

const { t }   = useI18n()
const library = useLibraryStore()

const progress = ref(new Map()) // text_id → { stage, percent }

async function loadProgress() {
  if (!library.current) return
  progress.value = await readingRepo.stages(library.current.id)
}
watch(() => library.current?.id, loadProgress, { immediate: true })
loadSaved()

const texts = computed(() => textsOf(library.current?.id).filter(x => x.topic === props.topic))

// фильтр уровней (несколько сразу, ничего = все) и сортировка — как в «Словах»
const toolsOpen = ref(false)
const levels    = ref([])
const sort      = ref('levelAsc')

const SORTS = {
  levelAsc:  (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level),
  levelDesc: (a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level),
  new:       (a, b) => b.added.localeCompare(a.added),
}
const SORT_ICONS = { levelAsc: 'north', levelDesc: 'south', new: 'schedule' }

const presentLevels = computed(() => LEVELS.filter(l => texts.value.some(x => x.level === l)))

const shown = computed(() => texts.value
  .filter(x => !levels.value.length || levels.value.includes(x.level))
  .sort(SORTS[sort.value]))

const hasFilters = computed(() => levels.value.length > 0)

function toggleLevel(level) {
  const i = levels.value.indexOf(level)
  if (i === -1) levels.value.push(level)
  else levels.value.splice(i, 1)
}

function statusOf(text) {
  const p = progress.value.get(text.id)
  return { kind: p?.stage ?? 'new', percent: p?.percent ?? 0 }
}

// уровень A — зелёный, B — акцент, C — нейтральный
const levelClass = level => `level--${level[0].toLowerCase()}`
</script>

<template>
  <AppTopBar :title="t(`reading.topics.${topic}`)" :back="{ name: 'reading' }" :library="false">
    <UiFilterToggle v-model="toolsOpen" :label="t('reading.filters')" :active="hasFilters" controls="topic-tools" />

    <template #below>
      <div v-show="toolsOpen" id="topic-tools" class="tools">
        <div class="chips" role="group" :aria-label="t('reading.level')">
          <button
              v-for="l in presentLevels"
              :key="l"
              v-ripple
              type="button"
              class="chip"
              :class="{ 'chip--on': levels.includes(l) }"
              :aria-pressed="levels.includes(l)"
              @click="toggleLevel(l)"
          >
            {{ l }}
          </button>
        </div>
        <div class="chips" role="radiogroup" :aria-label="t('reading.sort')">
          <button
              v-for="(_, key) in SORTS"
              :key="key"
              v-ripple
              type="button"
              role="radio"
              class="chip"
              :class="{ 'chip--on': sort === key }"
              :aria-checked="sort === key"
              @click="sort = key"
          >
            <AppIcon :name="SORT_ICONS[key]" size="1rem" />
            {{ t(`reading.sorts.${key}`) }}
          </button>
        </div>
      </div>
    </template>
  </AppTopBar>

  <UiEmpty v-if="!shown.length" icon="search" :title="t('reading.nothing')" />

  <ul v-else class="list">
    <li v-for="text in shown" :key="text.id">
      <RouterLink v-ripple class="item" :to="{ name: 'reader', params: { id: text.id } }">
        <span class="level" :class="levelClass(text.level)">{{ text.level }}</span>
        <span class="item-main">
          <b class="item-title">{{ text.title }}</b>
          <span v-if="text.chapters.length > 1" class="muted small">
            {{ t('reading.chapters', { n: text.chapters.length }) }}
          </span>
        </span>
        <!-- статус, под ним облако — не скачан: откроется только с интернетом -->
        <span class="side">
          <span class="status" :class="`status--${statusOf(text).kind}`">
            {{ t(`reading.status.${statusOf(text).kind}`, { n: statusOf(text).percent }) }}
          </span>
          <span v-if="!saved.has(text.id)" class="cloud" :title="t('reading.notSaved')">
            <AppIcon name="cloud-download" size="1.25rem" />
            <span class="sr-only">{{ t('reading.notSaved') }}</span>
          </span>
        </span>
      </RouterLink>
    </li>
  </ul>
</template>

<style scoped>
.tools {
  display: grid;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-m);
  background: var(--container);
  box-shadow: var(--shadow-card);
  color: inherit;
  text-decoration: none;
}

.level {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  font-family: var(--font-text);
  font-weight: 700;
  font-size: 0.9375rem;
}
.level--a { background: var(--success-c); color: var(--on-success-c); }
.level--b { background: var(--primary-c); color: var(--on-primary-c); }
.level--c { background: var(--container-hi); color: var(--on); }

.item-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
}
.item-title {
  font-size: 1.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side {
  flex-shrink: 0;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
}

.cloud {
  display: inline-flex;
  color: var(--muted);
}

.status {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.status--new      { background: var(--primary-c); color: var(--on-primary-c); }
.status--reading  { background: var(--container-hi); color: var(--on); }
.status--read    { background: var(--teal-c); color: var(--on-teal-c); }
.status--learned { background: var(--success-c); color: var(--on-success-c); }
</style>
