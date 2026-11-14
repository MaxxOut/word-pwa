<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { wordsRepo } from '@/core/words/repo.js'
import { STATUS, wordStatus } from '@/core/words/domain.js'
import { useLibraryStore } from '@/core/library/store.js'
import { downloadText } from '@/shared/utils/browser.js'
import { toast } from '@/shared/ui/feedback.js'
import UiButton from '@/shared/ui/UiButton.vue'
import { stringifyWordsCsv } from '@/core/words/csv.js'
import ImportDialog from './ImportDialog.vue'

// строки карточки «Данные» в настройках: импорт, экспорт, слова без перевода
const { t }   = useI18n()
const library = useLibraryStore()

const libName      = computed(() => library.current?.short_name)
const importDialog = ref(null)

// экспорт = резервная копия библиотеки с прогрессом
async function exportWords() {
  const id  = library.current.id
  const all = await wordsRepo.all(id)
  all.sort((a, b) => a.word.localeCompare(b.word))
  downloadText(`words_${id}_${new Date().toISOString().slice(0, 10)}.csv`, stringifyWordsCsv(all))
}

// слова без перевода — отдать ИИ заполнить и импортировать обратно с заменой
async function exportUntranslated() {
  const id   = library.current.id
  const list = (await wordsRepo.all(id)).filter(w => wordStatus(w) === STATUS.UNTRANSLATED)
  if (!list.length) return toast(t('words.data.noUntranslated'))
  list.sort((a, b) => a.word.localeCompare(b.word))
  downloadText(
    `untranslated_${id}_${new Date().toISOString().slice(0, 10)}.csv`,
    stringifyWordsCsv(list, { progress: false }),
  )
}
</script>

<template>
  <div class="settings-action">
    <div class="grow">
      <div>{{ t('words.data.importWords', { lib: libName }) }}</div>
      <div class="muted small">{{ t('words.data.importHint') }}</div>
    </div>
    <UiButton variant="outlined" icon="import" @click="importDialog.open()">{{ t('words.import') }}</UiButton>
  </div>
  <div class="settings-action">
    <div class="grow">
      <div>{{ t('words.data.exportWords', { lib: libName }) }}</div>
      <div class="muted small">{{ t('words.data.exportHint') }}</div>
    </div>
    <UiButton
        variant="outlined"
        icon="export"
        :disabled="!library.current?.words_count"
        @click="exportWords"
    >
      {{ t('words.export') }}
    </UiButton>
  </div>
  <div class="settings-action">
    <div class="grow">
      <div>{{ t('words.data.exportUntranslated', { lib: libName }) }}</div>
      <div class="muted small">{{ t('words.data.exportUntranslatedHint') }}</div>
    </div>
    <UiButton
        variant="outlined"
        icon="export"
        :disabled="!library.current?.words_count"
        @click="exportUntranslated"
    >
      {{ t('words.export') }}
    </UiButton>
  </div>

  <ImportDialog ref="importDialog" :library-id="library.current?.id" @imported="library.load()" />
</template>
