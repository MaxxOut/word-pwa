<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import StageHeader from './StageHeader.vue'
import { OUTCOME } from '../domain.js'

// итог повторения: у каждого слова — что с ним дальше. По умолчанию (defaultOutcome):
// без ошибки — как было, с ошибкой — «нужно закрепить», у «Знаю» — обычное выученное
const props = defineProps({
  words:    { type: Array,   required: true },
  outcomes: { type: Object,  required: true }, // { id: OUTCOME }
  saving:   { type: Boolean, default: false },
})

const emit = defineEmits(['set', 'complete', 'exit'])

const { t } = useI18n()

// «Знаю» — только у слов «Знаю»
const options = w => [
  ...(w.is_ignored ? [OUTCOME.KNOWN] : []),
  OUTCOME.OK, OUTCOME.SOON, OUTCOME.NEW,
]

const remembered = computed(() =>
  props.words.filter(w => [OUTCOME.OK, OUTCOME.KNOWN].includes(props.outcomes[w.id])).length,
)
</script>

<template>
  <StageHeader :title="t('study.result.title')" @exit="emit('exit')" />

  <section class="summary" :class="{ 'summary--all': remembered === words.length }">
    <div class="num big">{{ remembered }} / {{ words.length }}</div>
    <div>{{ t('study.repeat.remembered') }}</div>
  </section>

  <ul class="list">
    <li v-for="w in words" :key="w.id" class="item">
      <div class="item-text">
        <b>{{ w.word }}</b>
        <span class="muted small">{{ w.translation?.join(', ') || '—' }}</span>
        <span v-if="w.has_error" class="had-errors">
          <AppIcon name="warning" size="0.875rem" /> {{ t('study.result.hadErrors') }}
        </span>
      </div>
      <div class="chips" role="radiogroup" :aria-label="w.word">
        <button
            v-for="o in options(w)"
            :key="o"
            v-ripple
            type="button"
            role="radio"
            class="chip"
            :class="{ 'chip--on': outcomes[w.id] === o }"
            :aria-checked="outcomes[w.id] === o"
            @click="emit('set', w.id, o)"
        >
          {{ t(`study.repeat.outcome.${o}`) }}
        </button>
      </div>
    </li>
  </ul>

  <div class="stage-footer">
    <UiButton variant="filled" :loading="saving" @click="emit('complete')">
      {{ t('study.result.save') }}
    </UiButton>
  </div>
</template>

<style scoped>
.summary {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  padding: 1.5rem 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  text-align: center;
}
.summary--all { background: var(--success-c); color: var(--on-success-c); }
.big { font-size: 2.5rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: grid;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-m);
  background: var(--container);
}

.item-text { display: grid; min-width: 0; }

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
/* компактнее общих чипов — варианты помещаются в строку */
.chip {
  min-height: 2.25rem;
  padding: 0 0.625rem;
  font-size: 0.8125rem;
}

.had-errors {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--error);
  font-size: 0.75rem;
}
</style>
