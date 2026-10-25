<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { repeat as repeatRepo } from '../../data/index.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useLibraryStore } from '../../stores/library.js'
import { activeStages } from './stages.js'
import StudyResult from './stages/StudyResult.vue'

const router        = useRouter()
const { t }         = useI18n()
const settingsStore = useSettingsStore()
const library       = useLibraryStore()

// в повторении — только прямой и обратный перевод
const stages = computed(() => activeStages(settingsStore.settings, ['direct', 'reverse']))

const loadingWords = ref(true)
const saving       = ref(false)
const notEnough    = ref(null) // { required, count }
const repeatWords  = ref([])
const extraWords   = ref([])
const failedIds    = ref(new Set())

const step       = ref('stages')
const stageIndex = ref(0)

const currentStage = computed(() => stages.value[stageIndex.value])
const allWords     = computed(() => [...repeatWords.value, ...extraWords.value])

async function fetchWords() {
  loadingWords.value = true
  try {
    const data = await repeatRepo.start(library.current.id)
    if (!data.hasEnough) {
      notEnough.value = { required: data.required, count: data.count }
      return
    }
    repeatWords.value = data.words.map(w => ({ ...w, has_error: false }))
    extraWords.value  = data.extraWords
    step.value        = stages.value.length ? 'stages' : 'result'
  } catch {
    ElMessage.error(t('errors.load'))
  } finally {
    loadingWords.value = false
  }
}

function onStageDone(errorIds) {
  errorIds.forEach(id => {
    failedIds.value.add(id)
    const word = repeatWords.value.find(w => w.id === id)
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
    const repeated = repeatWords.value.filter(w => !failedIds.value.has(w.id)).map(w => w.id)
    const failed   = repeatWords.value.filter(w => failedIds.value.has(w.id)).map(w => w.id)
    await repeatRepo.complete(library.current.id, repeated, failed)
    ElMessage.success(t('repeat.completed'))
    router.push({ name: 'home' })
  } catch {
    ElMessage.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

async function confirmExit() {
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
    <div v-if="loadingWords" v-loading="true" class="loading" />

    <el-empty v-else-if="notEnough" :description="t('repeat.notEnough')">
      <template #description>
        <p>{{ t('repeat.required', { n: notEnough.required }) }}</p>
        <p class="muted">{{ t('repeat.readyNow', { n: notEnough.count }) }}</p>
      </template>
      <el-button type="primary" @click="router.push({ name: 'home' })">
        {{ t('common.toHome') }}
      </el-button>
    </el-empty>

    <component
        v-else-if="step === 'stages'"
        :is="currentStage.component"
        :key="currentStage.key"
        :words="repeatWords"
        :all-words="allWords"
        :mode="currentStage.mode"
        :title="t(currentStage.title)"
        @done="onStageDone"
        @exit="confirmExit"
    />

    <StudyResult
        v-else-if="step === 'result'"
        :words="repeatWords"
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

.loading {
  height: 200px;
}

.muted {
  color: var(--el-text-color-secondary);
  margin-top: 0.25rem;
}
</style>
