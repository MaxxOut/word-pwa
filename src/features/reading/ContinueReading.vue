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
    <b v-if="last" class="title">{{ last.text.title }}</b>
    <span v-if="last" class="muted small meta">
      {{ last.text.chapters[last.progress.chapter]?.title || last.text.level }} · {{ last.progress.percent }}%
    </span>
    <span v-else class="muted meta">{{ t('reading.start') }}</span>
    <UiButton variant="outlined" class="action" @click="open">
      {{ last ? t('reading.continueBtn') : t('reading.startBtn') }}
    </UiButton>
  </section>
</template>

<style scoped>
/* подпись, название и глава на всю ширину, кнопка под ними справа */
.read {
  display: grid;
  grid-template-areas: "label" "title" "meta" "action";
  gap: 0.25rem 0.75rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--container);
  box-shadow: var(--shadow-card);
}

.label {
  grid-area: label;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.title {
  grid-area: title;
  font-family: var(--font-title);
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta { grid-area: meta; min-width: 0; }
.action { grid-area: action; justify-self: end; margin-top: 0.5rem; }
</style>
