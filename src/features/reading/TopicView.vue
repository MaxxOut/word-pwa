<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { reading as readingRepo } from '../../data/index.js'
import { textsOf } from '../../content/reading/index.js'
import { LEVELS, readStatus } from '../../domain/reading.js'
import { useLibraryStore } from '../../stores/library.js'
import AppTopBar from '../../shared/components/AppTopBar.vue'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiIconButton from '../../shared/ui/UiIconButton.vue'
import UiEmpty from '../../shared/ui/UiEmpty.vue'

const props = defineProps({
  topic: { type: String, required: true },
})

const { t }   = useI18n()
const library = useLibraryStore()

const progress = ref(new Map()) // text_id → запись о чтении

async function loadProgress() {
  if (!library.current) return
  const list = await readingRepo.all(library.current.id)
  progress.value = new Map(list.map(p => [p.text_id, p]))
}
watch(() => library.current?.id, loadProgress, { immediate: true })

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
  return { kind: readStatus(p), percent: p?.percent ?? 0 }
}

// уровень A — зелёный, B — акцент, C — нейтральный
const levelClass = level => `level--${level[0].toLowerCase()}`
</script>

<template>
  <AppTopBar :title="t(`reading.topics.${topic}`)" :back="{ name: 'reading' }">
    <span class="tools-toggle">
      <UiIconButton
          icon="filter"
          :label="t('reading.filters')"
          :variant="toolsOpen ? 'tonal' : 'standard'"
          :aria-expanded="toolsOpen"
          aria-controls="topic-tools"
          @click="toolsOpen = !toolsOpen"
      />
      <span v-if="hasFilters && !toolsOpen" class="tools-dot" />
    </span>

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
        <span class="status" :class="`status--${statusOf(text).kind}`">
          {{ t(`reading.status.${statusOf(text).kind}`, { n: statusOf(text).percent }) }}
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

.tools-toggle { position: relative; display: inline-flex; }
.tools-dot {
  position: absolute;
  top: 0.625rem;
  right: 0.625rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--primary);
  pointer-events: none;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border: 0;
  border-radius: 0.625rem;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--outline);
  font-size: 0.875rem;
  font-weight: 500;
}
.chip--on { background: var(--primary-c); color: var(--on-primary-c); box-shadow: none; }

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

.status {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.status--new      { background: var(--primary-c); color: var(--on-primary-c); }
.status--reading  { background: var(--container-hi); color: var(--on); }
.status--finished { background: var(--success-c); color: var(--on-success-c); }
</style>
