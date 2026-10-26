<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { repeat as repeatRepo } from '../../data/index.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useLibraryStore } from '../../stores/library.js'
import { toast, confirm } from '../../shared/ui/feedback.js'
import { activeStages, REPEAT_STAGES } from './stages.js'
import UiButton from '../../shared/ui/UiButton.vue'
import UiEmpty from '../../shared/ui/UiEmpty.vue'
import UiSpinner from '../../shared/ui/UiSpinner.vue'
import StageHeader from './stages/StageHeader.vue'
import StudyResult from './stages/StudyResult.vue'

const router        = useRouter()
const { t }         = useI18n()
const settingsStore = useSettingsStore()
const library       = useLibraryStore()

const stages = computed(() => activeStages(settingsStore.settings.repeat_stages, REPEAT_STAGES))

const loadingWords = ref(true)
const saving       = ref(false)
const finished     = ref(false)
const notEnough    = ref(null) // { required, count }
const repeatWords  = ref([])
const extraWords   = ref([])
const failedIds    = ref(new Set())

const step       = ref('stages')
const stageIndex = ref(0)

const currentStage = computed(() => stages.value[stageIndex.value])
const allWords     = computed(() => [...repeatWords.value, ...extraWords.value])
const started      = computed(() => !loadingWords.value && !notEnough.value)

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
    toast.error(t('errors.load'))
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
    finished.value = true
    toast.success(t('repeat.completed'))
    router.push({ name: 'home' })
  } catch {
    toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

function exit() {
  router.push({ name: 'home' })
}

onBeforeRouteLeave(() => {
  if (!started.value || finished.value) return true
  return confirm({
    message:     t('study.exitConfirm'),
    confirmText: t('study.exitYes'),
    cancelText:  t('study.exitNo'),
    danger:      true,
    history:     false,
  })
})

onMounted(fetchWords)
</script>

<template>
  <template v-if="loadingWords || notEnough">
    <StageHeader :title="t('nav.repeat')" @exit="exit" />
    <UiSpinner v-if="loadingWords" />
    <UiEmpty
        v-else
        icon="repeat"
        :title="t('repeat.notEnough')"
        :text="`${t('repeat.required', { n: notEnough.required })}. ${t('repeat.readyNow', { n: notEnough.count })}`"
    >
      <UiButton variant="filled" @click="exit">{{ t('common.toHome') }}</UiButton>
    </UiEmpty>
  </template>

  <component
      :is="currentStage.component"
      v-else-if="step === 'stages'"
      :key="currentStage.key"
      :words="repeatWords"
      :all-words="allWords"
      :mode="currentStage.mode"
      :title="t(currentStage.title)"
      @done="onStageDone"
      @exit="exit"
  />

  <StudyResult
      v-else-if="step === 'result'"
      :words="repeatWords"
      :failed-ids="failedIds"
      :saving="saving"
      @toggle="toggleResult"
      @complete="completeSession"
      @exit="exit"
  />
</template>
