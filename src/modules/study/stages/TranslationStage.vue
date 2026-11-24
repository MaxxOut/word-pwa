<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { shuffle } from '@/shared/utils/shuffle.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import StageHeader from './StageHeader.vue'
import StageCard from './StageCard.vue'
import { useStageQueue } from './useStageQueue.js'
import { useAutoSpeak } from './autoSpeak.js'
import { useSettingsStore } from '@/core/settings/store.js'
import { pickDistractors } from '../domain.js'

const props = defineProps({
  words:    { type: Array, required: true },
  allWords: { type: Array, required: true },
  mode:     { type: String, default: 'direct' }, // direct | reverse
  title:    { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, isLast, counter, progress, fail, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const answered = ref(false)
const selected = ref(null)

const translationOf = w => w.translation?.[0] ?? w.word
const answerOf      = w => (props.mode === 'direct' ? translationOf(w) : w.word)

const question = computed(() =>
  props.mode === 'direct' ? current.value.word : translationOf(current.value),
)
const correctAnswer = computed(() => answerOf(current.value))

// 1 правильный + (N−1) других (N — настройка 4–8): сначала слова занятия, потом похожей длины —
// чтобы не угадывать исключением знакомых. Собираются один раз на слово
const settingsStore = useSettingsStore()
const choices = computed(() => settingsStore.settings.learning?.choices ?? 4)
const options = ref([])

function buildOptions() {
  const other = w => w.id !== current.value.id
  const wrong = pickDistractors(
    correctAnswer.value,
    props.words.filter(other),
    props.allWords.filter(other),
    choices.value - 1,
    answerOf,
  ).map(value => ({ value, correct: false }))

  options.value = shuffle([...wrong, { value: correctAnswer.value, correct: true }])
}

function optionState(option) {
  if (!answered.value) return null
  if (option.correct) return 'correct'
  if (selected.value === option.value) return 'wrong'
  return 'dim'
}

function selectOption(option) {
  if (answered.value) return
  selected.value = option.value
  answered.value = true
  if (option.correct) succeed()
  else fail()
}

function showHint() {
  answered.value = true
  fail()
}

function next() {
  if (!nextWord()) return
  answered.value = false
  selected.value = null
  buildOptions()
}

buildOptions()

// с изучаемого языка — слово звучит сразу, на него — после ответа
const { say } = useAutoSpeak()
if (props.mode === 'direct') watch(index, () => say(current.value.word), { immediate: true })
else watch(answered, done => done && say(current.value.word))
</script>

<template>
  <StageHeader
      :title="title"
      sound
      :counter="counter"
      :progress="progress"
      @exit="$emit('exit')"
  />

  <StageCard :key="index" :had-errors="current.has_error">
    <div class="question-text">{{ question }}</div>
  </StageCard>

  <div :key="index" class="options" :class="{ 'options--grid': options.length > 4 }">
    <button
        v-for="option in options"
        :key="option.value"
        v-ripple
        type="button"
        class="option"
        :class="optionState(option) && `option--${optionState(option)}`"
        :aria-disabled="answered"
        @click="selectOption(option)"
    >
      <span class="grow">{{ option.value }}</span>
      <AppIcon v-if="optionState(option) === 'correct'" name="check" />
      <AppIcon v-else-if="optionState(option) === 'wrong'" name="close" />
    </button>
  </div>

  <div class="stage-footer">
    <UiButton v-if="!answered" variant="outlined" icon="hint" @click="showHint">
      {{ t('study.stages.hint') }}
    </UiButton>
    <UiButton v-else variant="filled" @click="next">
      {{ isLast ? t('study.stages.finish') : t('study.stages.next') }}
    </UiButton>
  </div>
</template>

<style scoped>
.question-text {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.options {
  display: grid;
  gap: 0.5rem;
  animation: rise-in 0.3s 0.05s ease-out backwards;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--outline);
  font-size: 1.0625rem;
  text-align: left;
  transition: background-color 0.15s, opacity 0.15s;
}
.options--grid { grid-template-columns: 1fr 1fr; }
.options--grid .option { min-height: 3rem; padding: 0.5rem 0.75rem; font-size: 1rem; overflow-wrap: anywhere; }
.option[aria-disabled="true"] { cursor: default; }

.option--correct { background: var(--success-c); color: var(--on-success-c); box-shadow: none; animation: pop 0.3s; }
.option--wrong   { background: var(--error-c);   color: var(--on-error-c);   box-shadow: none; animation: shake 0.35s; }
.option--dim     { opacity: 0.5; }
</style>
