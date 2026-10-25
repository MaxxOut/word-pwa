<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { words as wordsRepo } from '../../data/index.js'
import { STATUS, wordStatus } from '../../domain/words.js'
import { stringifyWordsCsv } from '../../domain/csv.js'
import { useLibraryStore } from '../../stores/library.js'
import { downloadText, speak, canSpeak, formatDate } from '../../shared/utils/browser.js'
import { icon } from '../../shared/utils/icons.js'
import ImportDialog from './ImportDialog.vue'
import WordDialog from './WordDialog.vue'

const route     = useRoute()
const { t, locale } = useI18n()
const library   = useLibraryStore()

const libraryId = computed(() => library.current?.id)
const langCode  = computed(() => library.current?.lang_code)

const words       = ref([])
const loading     = ref(false)
const total       = ref(0)
const perPage     = ref(20)
const currentPage = ref(1)
const search      = ref('')
const status      = ref(Object.values(STATUS).includes(route.query.status) ? route.query.status : null)
const sortBy      = ref('created_at')
const sortDir     = ref('desc')

const wordDialog   = ref(null)
const importDialog = ref(null)

const STATUS_TAGS = {
  [STATUS.NEW]:          'warning',
  [STATUS.LEARNED]:      'success',
  [STATUS.IGNORED]:      'info',
  [STATUS.UNTRANSLATED]: 'danger',
}

const hasFilters = computed(() => !!search.value || status.value !== null)

let searchTimer = null
function debouncedFetch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchWords(1), 300)
}

async function fetchWords(page = 1) {
  if (!libraryId.value) return
  currentPage.value = page
  loading.value = true
  try {
    const result = await wordsRepo.page(libraryId.value, {
      page,
      perPage: perPage.value,
      search:  search.value,
      status:  status.value,
      sort:    sortBy.value,
      sortDir: sortDir.value,
    })
    words.value = result.items
    total.value = result.total
  } catch {
    ElMessage.error(t('errors.load'))
  } finally {
    loading.value = false
  }
}

function handleSort({ prop, order }) {
  sortBy.value  = order ? prop : 'created_at'
  sortDir.value = order === 'ascending' ? 'asc' : 'desc'
  fetchWords(1)
}

async function deleteWord(id) {
  try {
    await wordsRepo.remove(id)
    ElMessage.success(t('words.deleted'))
    const lastPage = Math.ceil((total.value - 1) / perPage.value) || 1
    fetchWords(Math.min(currentPage.value, lastPage))
    library.load()
  } catch {
    ElMessage.error(t('errors.delete'))
  }
}

async function exportWords() {
  const all = await wordsRepo.all(libraryId.value)
  all.sort((a, b) => a.word.localeCompare(b.word))
  downloadText(`words_${libraryId.value}_${new Date().toISOString().slice(0, 10)}.csv`, stringifyWordsCsv(all))
}

function onChanged() {
  fetchWords(currentPage.value)
  library.load()
}

watch(libraryId, () => fetchWords(1), { immediate: true })
</script>

<template>
  <div class="words">
    <div class="words-header">
      <h2>{{ t('words.title') }} · {{ library.current?.short_name }}</h2>

      <div class="words-actions">
        <el-button :icon="icon('export')" :disabled="!library.current?.words_count" @click="exportWords">
          {{ t('words.export') }}
        </el-button>
        <el-button :icon="icon('import')" @click="importDialog.open()">
          {{ t('words.import') }}
        </el-button>
        <el-button type="primary" :icon="icon('add')" @click="wordDialog.open()">
          {{ t('words.add') }}
        </el-button>
      </div>
    </div>

    <!-- фильтры -->
    <div class="filters">
      <el-input
          v-model="search"
          :placeholder="t('words.search')"
          clearable
          class="filter-search"
          @input="debouncedFetch"
          @clear="fetchWords(1)"
      />
      <el-select v-model="status" :placeholder="t('words.status')" clearable class="filter-status" @change="fetchWords(1)">
        <el-option v-for="s in Object.values(STATUS)" :key="s" :label="t(`status.${s}`)" :value="s" />
      </el-select>
      <el-select v-model="perPage" class="filter-per-page" @change="fetchWords(1)">
        <el-option :value="10" label="10" />
        <el-option :value="20" label="20" />
        <el-option :value="50" label="50" />
      </el-select>
    </div>

    <!-- пусто -->
    <el-empty v-if="!loading && !total" :description="hasFilters ? t('words.nothingFound') : t('words.empty')">
      <div v-if="!hasFilters" class="empty-actions">
        <el-button type="primary" @click="wordDialog.open()">{{ t('words.add') }}</el-button>
        <el-button @click="importDialog.open()">{{ t('words.import') }}</el-button>
      </div>
    </el-empty>

    <template v-else>
      <el-table
          :data="words"
          v-loading="loading"
          border stripe
          class="words-table"
          @sort-change="handleSort"
      >
        <el-table-column prop="word" :label="t('words.word')" min-width="140" sortable="custom" />
        <el-table-column :label="t('words.translation')" min-width="160">
          <template #default="{ row }">
            {{ row.translation?.join(', ') || '—' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('words.transcription')" width="150">
          <template #default="{ row }">
            {{ row.transcription || '—' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('words.examples')" min-width="200">
          <template #default="{ row }">
            <span v-if="row.examples?.length">
              {{ row.examples[0] }}
              <el-tag v-if="row.examples.length > 1" size="small" class="more-tag">
                +{{ row.examples.length - 1 }}
              </el-tag>
            </span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('words.status')" width="130">
          <template #default="{ row }">
            <el-tag :type="STATUS_TAGS[wordStatus(row)]" size="small">
              {{ t(`status.${wordStatus(row)}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="t('words.added')" width="150" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.created_at, locale) }}
          </template>
        </el-table-column>
        <el-table-column :label="t('words.actions')" width="150" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <el-button v-if="canSpeak()" size="small" :icon="icon('speak')" @click="speak(row.word, langCode)" />
              <el-button size="small" :icon="icon('edit')" @click="wordDialog.open(row)" />
              <el-popconfirm
                  :title="t('words.confirmDelete')"
                  :confirm-button-text="t('common.yes')"
                  :cancel-button-text="t('common.no')"
                  @confirm="deleteWord(row.id)"
              >
                <template #reference>
                  <el-button size="small" type="danger" :icon="icon('delete')" />
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-if="total > perPage"
          class="pagination"
          layout="prev, pager, next, total"
          :total="total"
          :page-size="perPage"
          :current-page="currentPage"
          @current-change="fetchWords"
      />
    </template>

    <WordDialog ref="wordDialog" :library-id="libraryId" :lang-code="langCode" @saved="onChanged" />
    <ImportDialog ref="importDialog" :library-id="libraryId" @imported="onChanged" />
  </div>
</template>

<style scoped>
.words {
  max-width: 1100px;
  margin: 0 auto;
}

.words-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.words-header h2 {
  font-size: 1.5rem;
}

.words-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.words-actions .el-button + .el-button {
  margin-left: 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-search   { flex: 1 1 14rem; }
.filter-status   { width: 11rem; }
.filter-per-page { width: 5rem; }

.words-table {
  width: 100%;
}

.more-tag {
  margin-left: 0.25rem;
}

.actions {
  display: flex;
  gap: 2px;
}

.actions .el-button + .el-button {
  margin-left: 0;
}

.empty-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.pagination {
  margin-top: 1.25rem;
  justify-content: flex-end;
}
</style>
