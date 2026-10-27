<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { words as wordsRepo } from '../../data/index.js'
import { STATUS, wordStatus } from '../../domain/words.js'
import { useLibraryStore } from '../../stores/library.js'
import { speak, canSpeak } from '../../shared/utils/browser.js'
import { toast } from '../../shared/ui/feedback.js'
import AppTopBar from '../../shared/components/AppTopBar.vue'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiIconButton from '../../shared/ui/UiIconButton.vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiInput from '../../shared/ui/UiInput.vue'
import UiEmpty from '../../shared/ui/UiEmpty.vue'
import UiSpinner from '../../shared/ui/UiSpinner.vue'
import ImportDialog from './ImportDialog.vue'
import WordDialog from './WordDialog.vue'

const PAGE = 30

const route   = useRoute()
const { t }   = useI18n()
const library = useLibraryStore()

const libraryId = computed(() => library.current?.id)
const langCode  = computed(() => library.current?.lang_code)

const words   = ref([])
const total   = ref(0)
const page    = ref(1)
const loading = ref(false)
const search  = ref('')
// фильтр — несколько статусов сразу; ничего не выбрано = все слова
const statuses = ref(Object.values(STATUS).includes(route.query.status) ? [route.query.status] : [])
const sort     = ref('new')
// панель поиска и фильтров свёрнута; пришли с фильтром (с главной) — сразу открыта
const toolsOpen = ref(statuses.value.length > 0)

const wordDialog   = ref(null)
const importDialog = ref(null)

const FILTERS = [STATUS.NEW, STATUS.LEARNED, STATUS.UNTRANSLATED, STATUS.IGNORED]

const SORTS = {
  alpha:     { field: 'word',       dir: 'asc',  letter: 'A',      arrow: 'south' },
  alphaDesc: { field: 'word',       dir: 'desc', letter: 'Z',      arrow: 'south' },
  new:       { field: 'created_at', dir: 'desc', icon: 'schedule', arrow: 'south' },
  old:       { field: 'created_at', dir: 'asc',  icon: 'schedule', arrow: 'north' },
}

const hasFilters = computed(() => !!search.value.trim() || statuses.value.length > 0)

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchWords(), 250)
}

// more — дописать следующую страницу к списку
async function fetchWords(more = false) {
  if (!libraryId.value) return
  const nextPage = more ? page.value + 1 : 1
  loading.value = true
  try {
    const result = await wordsRepo.page(libraryId.value, {
      page:    nextPage,
      perPage: PAGE,
      search:  search.value,
      // «Знаю» — только если их фильтр включён
      statuses: statuses.value.length ? statuses.value : FILTERS.filter(s => s !== STATUS.IGNORED),
      sort:     SORTS[sort.value].field,
      sortDir:  SORTS[sort.value].dir,
    })
    words.value = more ? [...words.value, ...result.items] : result.items
    total.value = result.total
    page.value  = nextPage
  } catch {
    toast.error(t('errors.load'))
  } finally {
    loading.value = false
  }
}

function toggleStatus(value) {
  const i = statuses.value.indexOf(value)
  if (i === -1) statuses.value.push(value)
  else statuses.value.splice(i, 1)
  fetchWords()
}

function setSort(value) {
  if (sort.value === value) return
  sort.value = value
  fetchWords()
}

// после правки — перечитать уже показанные страницы
async function onChanged() {
  const shown = page.value
  await fetchWords()
  for (let p = 1; p < shown && words.value.length < total.value; p++) await fetchWords(true)
  library.load()
}

watch(libraryId, () => fetchWords(), { immediate: true })
</script>

<template>
  <AppTopBar :title="t('words.title')">
    <span class="tools-toggle">
      <UiIconButton
          icon="filter"
          :label="t('words.filters')"
          :variant="toolsOpen ? 'tonal' : 'standard'"
          :aria-expanded="toolsOpen"
          aria-controls="word-tools"
          @click="toolsOpen = !toolsOpen"
      />
      <!-- фильтр включён, но панель свёрнута -->
      <span v-if="hasFilters && !toolsOpen" class="tools-dot" />
    </span>

    <template #below>
      <div v-show="toolsOpen" id="word-tools" class="tools">
        <UiInput
            v-model="search"
            icon="search"
            :placeholder="t('words.search')"
            clearable
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            @update:model-value="onSearch"
            @clear="fetchWords()"
        />
        <div class="filters" role="group" :aria-label="t('words.status')">
          <button
              v-for="s in FILTERS"
              :key="s"
              v-ripple
              type="button"
              class="filter"
              :class="{ 'filter--on': statuses.includes(s) }"
              :aria-pressed="statuses.includes(s)"
              @click="toggleStatus(s)"
          >
            <AppIcon v-if="statuses.includes(s)" name="check" size="1.125rem" />
            {{ t(`status.${s}`) }}
          </button>
        </div>
        <div class="summary">
          <span class="muted small grow">
            {{ t('words.count', { n: total }) }}
          </span>
          <div class="sorts" role="radiogroup" :aria-label="t('words.sort')">
            <button
                v-for="(o, key) in SORTS"
                :key="key"
                v-ripple
                type="button"
                role="radio"
                class="sort"
                :class="{ 'sort--on': sort === key }"
                :aria-checked="sort === key"
                :aria-label="t(`words.sorts.${key}`)"
                :title="t(`words.sorts.${key}`)"
                @click="setSort(key)"
            >
              <span v-if="o.letter" class="sort-letter">{{ o.letter }}</span>
              <AppIcon v-else :name="o.icon" size="1.25rem" />
              <AppIcon :name="o.arrow" size="0.875rem" class="sort-arrow" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </AppTopBar>

  <UiSpinner v-if="loading && !words.length" />

  <UiEmpty
      v-else-if="!total"
      :icon="hasFilters ? 'search' : 'words'"
      :title="hasFilters ? t('words.nothingFound') : t('words.empty')"
      :text="hasFilters ? '' : t('words.emptyHint')"
  >
    <template v-if="!hasFilters">
      <UiButton variant="filled" icon="add" @click="wordDialog.open()">{{ t('words.add') }}</UiButton>
      <UiButton variant="outlined" icon="import" @click="importDialog.open()">{{ t('words.import') }}</UiButton>
    </template>
  </UiEmpty>

  <template v-else>
    <ul class="list">
      <li v-for="w in words" :key="w.id" class="item">
        <button v-ripple type="button" class="item-main" @click="wordDialog.open(w)">
          <span class="item-word">
            <b>{{ w.word }}</b>
            <span v-if="w.transcription" class="muted small">[{{ w.transcription }}]</span>
          </span>
          <span class="item-tr" :class="{ 'item-tr--none': !w.translation?.length }">
            {{ w.translation?.join(', ') || t('status.untranslated') }}
          </span>
        </button>
        <span class="status" :class="`status--${wordStatus(w)}`">{{ t(`status.${wordStatus(w)}`) }}</span>
        <UiIconButton v-if="canSpeak()" icon="speak" :label="t('words.speak')" @click="speak(w.word, langCode)" />
      </li>
    </ul>

    <div v-if="words.length < total" class="more">
      <UiButton variant="outlined" :loading="loading" @click="fetchWords(true)">
        {{ t('words.showMore', { n: Math.min(PAGE, total - words.length) }) }}
      </UiButton>
    </div>
  </template>

  <!-- в body: при сдвиге экрана (transform) position: fixed внутри него ломается -->
  <Teleport to="body">
    <button v-ripple type="button" class="fab" :aria-label="t('words.add')" @click="wordDialog.open()">
      <AppIcon name="add" size="1.75rem" />
    </button>
  </Teleport>

  <WordDialog ref="wordDialog" :library-id="libraryId" :lang-code="langCode" @saved="onChanged" />
  <ImportDialog ref="importDialog" :library-id="libraryId" @imported="onChanged" />
</template>

<style scoped>
.tools {
  display: grid;
  gap: 0.75rem;
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

/* фильтры — 2×2, можно выбрать несколько */
.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.filter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 2.5rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 0.625rem;
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--outline);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}
.filter--on {
  background: var(--primary-c);
  color: var(--on-primary-c);
  box-shadow: none;
}

.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* сортировка — отдельные чипы, один клик */
.sorts {
  display: flex;
  gap: 0.375rem;
}
.sort {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.5rem;
  border: 0;
  border-radius: 0.625rem;
  background: none;
  box-shadow: inset 0 0 0 1px var(--outline);
  color: var(--muted);
}
.sort--on { background: var(--primary-c); color: var(--on-primary-c); box-shadow: none; }
.sort-arrow { margin-left: -0.125rem; }
.sort-letter {
  /* толщина как у иконок Material Symbols (вес 400) */
  font-family: var(--font-text);
  font-size: 1.125rem;
  font-weight: 450;
  line-height: 1;
}

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-right: 0.25rem;
  border-radius: var(--radius-m);
  background: var(--container);
}

.item-main {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  border-radius: var(--radius-m) 0 0 var(--radius-m);
  display: grid;
  gap: 0.125rem;
  padding: 0.75rem 0.5rem 0.75rem 1rem;
  border: 0;
  background: none;
  text-align: left;
}
.item-word {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}
.item-word b {
  font-size: 1.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-tr {
  font-size: 0.875rem;
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-tr--none { font-style: italic; }

.status {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
}
.status--new          { background: var(--primary-c); color: var(--on-primary-c); }
.status--learned      { background: var(--success-c); color: var(--on-success-c); }
.status--ignored      { background: var(--container-hi); color: var(--muted); }
.status--untranslated { background: var(--error-c); color: var(--on-error-c); }

.more {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.fab {
  position: fixed;
  right: 1rem;
  bottom: calc(var(--nav-h) + 1rem + env(safe-area-inset-bottom));
  z-index: 25;
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border: 0;
  border-radius: 1rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  box-shadow: 0 0.25rem 0.75rem rgb(0 0 0 / 0.2);
}

@media (min-width: 840px) {
  .fab { bottom: 2rem; right: 2rem; }
}
</style>
