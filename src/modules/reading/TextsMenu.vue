<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readingRepo } from './repo.js'
import { saved, loadSaved, downloadAll, removeTexts, savedStats } from './texts.js'
import { useLibraryStore } from '@/core/library/store.js'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiSheet from '@/shared/ui/UiSheet.vue'
import { confirm, toast } from '@/shared/ui/feedback.js'
import { needRefresh } from '@/shared/utils/update.js'

// меню «Чтения»: тексты библиотеки на телефоне — скачать все, удалить прочитанные / все
const { t, locale } = useI18n()
const library = useLibraryStore()

const open     = ref(false)
const finished = ref(new Set()) // id дочитанных текстов
const progress = ref(null)      // { done, total } — идёт загрузка

watch(open, async value => {
  if (!value || !library.current) return
  await loadSaved()
  const list = await readingRepo.all(library.current.id)
  finished.value = new Set(list.filter(p => p.finished).map(p => p.text_id))
})

// saved реактивный — сводка пересчитывается по ходу загрузки и удаления
const stats = computed(() => savedStats(library.current?.id, finished.value))

const size = bytes => new Intl.NumberFormat(locale.value, {
  style: 'unit', unit: 'kilobyte', maximumFractionDigits: 0,
}).format(Math.max(1, Math.round(bytes / 1024)))

async function loadAll() {
  progress.value = { done: 0, total: 0 }
  try {
    await downloadAll(library.current.id, (done, total) => { progress.value = { done, total } })
    toast.success(t('reading.downloaded'))
  } catch {
    toast.error(t(needRefresh.value ? 'reading.needUpdate' : 'reading.offline'))
  } finally {
    progress.value = null
  }
}

async function remove(ids, message) {
  if (!await confirm({ message, confirmText: t('common.delete'), danger: true })) return
  await removeTexts(ids)
  toast(t('reading.removed', { n: ids.length }))
}

function removeFinished() {
  remove(stats.value.finished, t('reading.removeFinishedConfirm', { n: stats.value.finished.length }))
}

function removeAll() {
  remove(stats.value.saved, t('reading.removeAllConfirm', { n: stats.value.saved.length }))
}
</script>

<template>
  <UiIconButton icon="more" :label="t('reading.onPhone')" @click="open = true" />

  <UiSheet v-model="open" :title="t('reading.onPhone')">
    <p class="muted summary">
      {{ t('reading.savedOf', { n: stats.saved.length, total: stats.total }) }}
      <template v-if="stats.saved.length"> · {{ size(stats.savedBytes) }}</template>
    </p>
    <div class="actions">
      <UiButton
          block
          icon="cloud-download"
          :loading="!!progress"
          :disabled="!stats.missingBytes"
          @click="loadAll"
      >
        <template v-if="progress">{{ t('reading.downloading', { n: progress.done, total: progress.total }) }}</template>
        <template v-else-if="stats.missingBytes">{{ t('reading.downloadAll', { size: size(stats.missingBytes) }) }}</template>
        <template v-else>{{ t('reading.allSaved') }}</template>
      </UiButton>
      <UiButton block variant="outlined" icon="delete-sweep" :disabled="!stats.finished.length || !!progress" @click="removeFinished">
        {{ t('reading.removeFinished', { n: stats.finished.length }) }}
      </UiButton>
      <UiButton block variant="danger" icon="delete" :disabled="!stats.saved.length || !!progress" @click="removeAll">
        {{ t('reading.removeAll') }}
      </UiButton>
    </div>
  </UiSheet>
</template>

<style scoped>
.summary { margin-bottom: 1rem; }
.actions {
  display: grid;
  gap: 0.5rem;
}
</style>
