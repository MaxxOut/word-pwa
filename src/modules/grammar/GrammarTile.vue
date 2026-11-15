<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { grammarRepo } from './repo.js'
import { tensesOf } from './tenses/index.js'
import { nextTopic, whenKey } from './tenses/result.js'
import { useLibraryStore } from '@/core/library/store.js'
import { useSettingsStore } from '@/core/settings/store.js'
import UiButton from '@/shared/ui/UiButton.vue'

// плитка главной — что на очереди: время, которому пора на повторение (самое давнее) — с прошлым
// процентом и сколько дней назад; иначе следующее не тренированное; иначе плитки нет
defineProps({ words: { type: Array, default: null } })

const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()
const settings = useSettingsStore()

const next = ref(null) // { kind: 'due' | 'new', tense, row?, days? }

watch(() => library.current?.id, async id => {
  const tenses = tensesOf(id).filter(x => x.active)
  const days = settings.settings.grammar?.repeat_days
  next.value = tenses.length ? nextTopic(tenses, await grammarRepo.all(id), new Date(), days) : null
}, { immediate: true })

function open() {
  const { kind, tense } = next.value
  router.push({ name: kind === 'due' ? 'grammar-train' : 'grammar-tense', params: { id: tense.id } })
}
</script>

<template>
  <section v-if="next" class="tile-grammar">
    <div class="label">{{ t(next.kind === 'due' ? 'grammar.home.due' : 'grammar.home.new') }}</div>
    <b class="title">{{ next.tense.name }}</b>
    <template v-if="next.kind === 'due'">
      <span class="small">{{ t('grammar.home.last', { n: next.row.last }) }}</span>
      <span class="muted small">{{ t(whenKey(next.days), { n: next.days }) }}</span>
    </template>
    <span v-else class="muted small">{{ t('grammar.home.notYet') }}</span>
    <UiButton variant="outlined" class="action" @click="open">
      {{ next.kind === 'due' ? t('grammar.tenses.train') : t('grammar.home.startBtn') }}
    </UiButton>
  </section>
</template>

<style scoped>
.tile-grammar {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  /* свой цвет раздела — плитки главной не одинаковые */
  background: var(--teal-c);
  color: var(--on-teal-c);
  box-shadow: var(--shadow-card);
}

.label {
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  color: var(--muted);
}

/* на цветном фоне серый плохо читается — приглушаем цвет самой плитки */
.tile-grammar .label, .tile-grammar .muted { color: inherit; opacity: 0.75; }

.title {
  font-family: var(--font-title);
  font-size: 1.125rem;
}

.action { justify-self: end; margin-top: 0.5rem; }
</style>
