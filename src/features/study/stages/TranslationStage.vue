<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { shuffle } from '../../../domain/words.js'
import { icon } from '../../../shared/utils/icons.js'

const props = defineProps({
  words:    { type: Array, required: true },
  allWords: { type: Array, required: true },
  mode:     { type: String, default: 'direct' }, // direct | reverse
  title:    { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

// очередь — копия слов, ошибочные добавляются в конец
const queue        = ref([...props.words])
const currentIndex = ref(0)
const errorIds     = ref(new Set())
const answered     = ref(false)
const selected     = ref(null)
const hintUsed     = ref(false)
const doneCount    = ref(0)

const current = computed(() => queue.value[currentIndex.value])
const isLast  = computed(() => currentIndex.value === queue.value.length - 1)

const translationOf = w => w.translation?.[0] ?? w.word
const answerOf      = w => (props.mode === 'direct' ? translationOf(w) : w.word)

const question = computed(() =>
  props.mode === 'direct' ? current.value.word : translationOf(current.value),
)
const correctAnswer = computed(() => answerOf(current.value))

// 1 правильный + 3 случайных из других слов — собираются один раз на слово
const options = ref([])

function buildOptions() {
  const wrong = shuffle(props.allWords.filter(w => w.id !== current.value.id))
    .map(answerOf)
    .filter((v, i, arr) => v !== correctAnswer.value && arr.indexOf(v) === i)
    .slice(0, 3)
    .map(value => ({ value, correct: false }))

  options.value = shuffle([...wrong, { value: correctAnswer.value, correct: true }])
}

function optionType(option) {
  if (!answered.value) return ''
  if (option.correct) return 'success'
  if (selected.value === option.value) return 'danger'
  return ''
}

function fail() {
  errorIds.value.add(current.value.id)
  queue.value.push({ ...current.value })
}

function selectOption(option) {
  if (answered.value) return
  selected.value = option.value
  answered.value = true
  if (option.correct) doneCount.value++
  else fail()
}

function showHint() {
  hintUsed.value = true
  answered.value = true
  fail()
}

function next() {
  if (isLast.value) {
    emit('done', [...errorIds.value])
    return
  }
  currentIndex.value++
  answered.value = false
  selected.value = null
  hintUsed.value = false
  buildOptions()
}

buildOptions()
</script>

<template>
  <div>
    <div class="stage-header">
      <div class="stage-title">
        <el-button :icon="icon('back')" @click="$emit('exit')" />
        <h2>{{ title }}</h2>
      </div>
      <el-tag>{{ currentIndex + 1 }} / {{ queue.length }}</el-tag>
    </div>

    <el-progress :percentage="Math.round((doneCount / words.length) * 100)" class="progress" />

    <el-card class="question">
      <div class="question-text">{{ question }}</div>
      <div v-if="current.has_error" class="had-errors">⚠ {{ t('stages.hadErrors') }}</div>
    </el-card>

    <div class="options">
      <el-button
          v-for="option in options"
          :key="option.value"
          class="option"
          :type="optionType(option)"
          :class="{ 'option--answered': answered }"
          @click="selectOption(option)"
      >
        {{ option.value }}
      </el-button>
    </div>

    <div class="stage-footer">
      <el-button :disabled="answered || hintUsed" @click="showHint">
        {{ t('stages.hint') }}
      </el-button>
      <el-button v-if="answered" type="primary" @click="next">
        {{ isLast ? t('stages.finish') : t('stages.next') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.progress { margin-bottom: 1.5rem; }

.question {
  text-align: center;
  margin-bottom: 1.5rem;
}

.question-text {
  font-size: 2rem;
  font-weight: 700;
}

.had-errors {
  color: var(--el-color-danger);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.option {
  width: 100%;
  min-height: 3.5rem;
  font-size: 1rem;
  white-space: normal;
  margin-left: 0 !important;
}

/* после ответа не блокируем (disabled бледнит цвета), а просто гасим реакцию */
.option--answered {
  pointer-events: none;
}
</style>
