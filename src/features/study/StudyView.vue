<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { study as studyRepo } from '../../data/index.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useLibraryStore } from '../../stores/library.js'
import { activeStages } from './stages.js'
import StudySelect from './stages/StudySelect.vue'
import StudyResult from './stages/StudyResult.vue'

const router        = useRouter()
const { t }         = useI18n()
const settingsStore = useSettingsStore()
const library       = useLibraryStore()

const wordsPerSession = computed(() => settingsStore.settings.learning.words_per_session)
const stages          = computed(() => activeStages(settingsStore.settings))

const loadingWords = ref(false)
const saving       = ref(false)
const newWords     = ref([])
const extraWords   = ref([])
const studyWords   = ref([])
const failedIds    = ref(new Set())

const step       = ref('select') // select | stages | result
const stageIndex = ref(0)

const currentStage = computed(() => stages.value[stageIndex.value])
const allWords     = computed(() => [...newWords.value, ...extraWords.value])

async function fetchWords() {
  loadingWords.value = true
  try {
    const data = await studyRepo.start(library.current.id)
    newWords.value   = data.newWords
    extraWords.value = data.extraWords
  } catch {
    ElMessage.error(t('errors.load'))
  } finally {
    loadingWords.value = false
  }
}

function onStart(selectedIds) {
  studyWords.value = newWords.value
    .filter(w => selectedIds.includes(w.id))
    .map(w => ({ ...w, has_error: false }))
  failedIds.value  = new Set()
  stageIndex.value = 0
  step.value       = stages.value.length ? 'stages' : 'result'
}

function onStageDone(errorIds) {
  errorIds.forEach(id => {
    failedIds.value.add(id)
    const word = studyWords.value.find(w => w.id === id)
    if (word) word.has_error = true
  })

  if (stageIndex.value < stages.value.length - 1) stageIndex.value++
  else step.value = 'result'
}

function toggleResult(id) {
  if (failedIds.value.has(id)) failedIds.value.delete(id)
  else failedIds.value.add(id)
}

async function completeSession() {
  saving.value = true
  try {
    const learnedIds = studyWords.value
      .filter(w => !failedIds.value.has(w.id))
      .map(w => w.id)
    await studyRepo.complete(library.current.id, learnedIds)
    ElMessage.success(t('study.completed'))
    router.push({ name: 'home' })
  } catch {
    ElMessage.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

async function confirmExit() {
  if (step.value === 'select') {
    router.push({ name: 'home' })
    return
  }
  try {
    await ElMessageBox.confirm(t('study.exitConfirm'), t('common.confirm'), {
      confirmButtonText: t('common.yes'),
      cancelButtonText:  t('common.no'),
      type: 'warning',
    })
    router.push({ name: 'home' })
  } catch {}
}

onMounted(fetchWords)
</script>

<template>
  <div class="session">
    <StudySelect
        v-if="step === 'select'"
        :new-words="newWords"
        :loading="loadingWords"
        :words-per-session="wordsPerSession"
        @start="onStart"
        @exit="confirmExit"
    />

    <component
        v-else-if="step === 'stages'"
        :is="currentStage.component"
        :key="currentStage.key"
        :words="studyWords"
        :all-words="allWords"
        :mode="currentStage.mode"
        :title="t(currentStage.title)"
        :extra-letters="settingsStore.settings.learning?.extra_letters ?? 0"
        @done="onStageDone"
        @exit="confirmExit"
    />

    <StudyResult
        v-else-if="step === 'result'"
        :words="studyWords"
        :failed-ids="failedIds"
        :saving="saving"
        @toggle="toggleResult"
        @complete="completeSession"
        @exit="confirmExit"
    />
  </div>
</template>

<style scoped>
.session {
  max-width: 700px;
  margin: 0 auto;
}
</style>
