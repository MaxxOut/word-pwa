<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { words as wordsRepo } from '../../data/index.js'
import { parseWordsCsv } from '../../domain/csv.js'
import { useLibraryStore } from '../../stores/library.js'
import { toast } from '../../shared/ui/feedback.js'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiSheet from '../../shared/ui/UiSheet.vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiSegmented from '../../shared/ui/UiSegmented.vue'

const props = defineProps({
  libraryId: { type: String, default: null },
})

const emit = defineEmits(['imported'])

const { t }   = useI18n()
const library = useLibraryStore()

const visible  = ref(false)
const loading  = ref(false)
const strategy = ref('skip')
const file     = ref(null)
const result   = ref(null)

const STRATEGIES = computed(() => [
  { value: 'skip',    label: t('import.skip') },
  { value: 'replace', label: t('import.replace') },
])

function open() {
  visible.value = true
}

function reset() {
  file.value     = null
  result.value   = null
  strategy.value = 'skip'
}

function onFile(e) {
  file.value   = e.target.files[0] ?? null
  result.value = null
  e.target.value = '' // чтобы тот же файл можно было выбрать снова
}

async function submit() {
  if (!file.value) return

  loading.value = true
  try {
    const rows = parseWordsCsv(await file.value.text())
    if (!rows.length) {
      toast.error(t('import.noRows'))
      return
    }
    result.value = await wordsRepo.import(props.libraryId, rows, strategy.value)
    emit('imported')
  } catch {
    toast.error(t('import.failed'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <UiSheet v-model="visible" :title="t('import.title')" @closed="reset">
    <div class="stack body">
      <p class="target">
        {{ t('import.into') }}
        <b>{{ library.current?.short_name }} · {{ library.current && t(`libraries.${library.current.id}`) }}</b>
      </p>

      <label class="file">
        <input type="file" accept=".csv,.txt,text/csv,text/plain" class="sr-only" @change="onFile">
        <AppIcon name="import" />
        <span class="grow file-name">{{ file?.name ?? t('import.choose') }}</span>
      </label>
      <p class="muted small">{{ t('import.format') }}</p>

      <UiSegmented v-model="strategy" :label="t('import.duplicates')" :options="STRATEGIES" />

      <div v-if="result" class="result" role="status">
        {{ t('import.result', result) }}
      </div>
    </div>

    <template #footer>
      <UiButton variant="text" @click="visible = false">{{ t('common.close') }}</UiButton>
      <UiButton variant="filled" :loading="loading" :disabled="!file || !!result" @click="submit">
        {{ t('import.submit') }}
      </UiButton>
    </template>
  </UiSheet>
</template>

<style scoped>
.body { gap: 1rem; }

.target { font-size: 0.9375rem; }

.file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0 1rem;
  border-radius: var(--radius-m);
  border: 2px dashed var(--outline);
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
}
.file:focus-within { border-color: var(--primary); }
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.result {
  padding: 0.875rem 1rem;
  border-radius: var(--radius-m);
  background: var(--success-c);
  color: var(--on-success-c);
}
</style>
