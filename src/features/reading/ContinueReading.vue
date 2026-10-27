<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { reading as readingRepo } from '../../data/index.js'
import { findText } from '../../content/reading/index.js'
import { useLibraryStore } from '../../stores/library.js'
import UiButton from '../../shared/ui/UiButton.vue'

// плитка главной: последняя открытая книга на запомненном месте; нет такой — в «Чтение»
const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()

const last = ref(null) // { text, progress }

async function load() {
  if (!library.current) return
  const progress = await readingRepo.last(library.current.id)
  const text     = progress && findText(progress.text_id)
  last.value = text ? { text, progress } : null
}
watch(() => library.current?.id, load, { immediate: true })

function open() {
  if (last.value) router.push({ name: 'reader', params: { id: last.value.text.id } })
  else router.push({ name: 'reading' })
}
</script>

<template>
  <section class="read">
    <div class="label">{{ last ? t('reading.continue') : t('reading.title') }}</div>
    <div class="info">
      <template v-if="last">
        <b class="title">{{ last.text.title }}</b>
        <span class="muted small">
          {{ last.text.chapters[last.progress.chapter]?.title || last.text.level }} · {{ last.progress.percent }}%
        </span>
      </template>
      <span v-else class="muted">{{ t('reading.start') }}</span>
    </div>
    <UiButton variant="outlined" @click="open">
      {{ last ? t('reading.continueBtn') : t('reading.startBtn') }}
    </UiButton>
  </section>
</template>

<style scoped>
/* как плитки главной: подпись сверху, текст и кнопка снизу */
.read {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: "label label" "info action";
  align-items: end;
  gap: 0.75rem 0.75rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--container);
}

.label {
  grid-area: label;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.info {
  grid-area: info;
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.title {
  font-family: var(--font-title);
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
