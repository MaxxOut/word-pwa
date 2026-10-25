<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { icon } from '../../../shared/utils/icons.js'

const props = defineProps({
  words:    { type: Array,  required: true },
  allWords: { type: Array,  required: true },
  title:    { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const queue        = ref([...props.words])
const currentIndex = ref(0)
const errorIds     = ref(new Set())
const doneCount    = ref(0)

const answer    = ref('')
const checked   = ref(false)
const isCorrect = ref(false)
const inputRef  = ref(null)

const current = computed(() => queue.value[currentIndex.value])
const isLast  = computed(() => currentIndex.value === queue.value.length - 1)

// показываем перевод — пользователь вводит слово
const prompt        = computed(() => current.value.translation?.join(', ') || current.value.word)
const correctAnswer = computed(() => current.value.word)

function fail() {
  errorIds.value.add(current.value.id)
  queue.value.push({ ...current.value })
}

function check() {
  if (!answer.value.trim()) return
  isCorrect.value = answer.value.trim().toLowerCase() === correctAnswer.value.toLowerCase()
  checked.value   = true
  if (isCorrect.value) doneCount.value++
  else fail()
}

function showHint() {
  answer.value    = correctAnswer.value
  checked.value   = true
  isCorrect.value = false
  fail()
}

function next() {
  if (isLast.value) {
    emit('done', [...errorIds.value])
    return
  }
  currentIndex.value++
  resetState()
}

function onEnter() {
  if (checked.value) next()
  else check()
}

function resetState() {
  answer.value    = ''
  checked.value   = false
  isCorrect.value = false
  nextTick(() => inputRef.value?.focus())
}

nextTick(() => inputRef.value?.focus())

watch(() => props.words, () => {
  queue.value        = [...props.words]
  currentIndex.value = 0
  resetState()
})
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
      <div class="label">{{ t('stages.enterWord') }}</div>
      <div class="prompt">{{ prompt }}</div>
      <div v-if="current.transcription" class="label">{{ current.transcription }}</div>
      <div v-if="current.has_error" class="had-errors">⚠ {{ t('stages.hadErrors') }}</div>
    </el-card>

    <el-input
        ref="inputRef"
        v-model="answer"
        :placeholder="t('stages.inputPlaceholder')"
        size="large"
        class="answer"
        :class="checked && (isCorrect ? 'answer--success' : 'answer--error')"
        :disabled="checked"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
        @keyup.enter="onEnter"
    />

    <div v-if="checked" class="verdict">
      <el-tag v-if="isCorrect" type="success" size="large">✓ {{ t('stages.correct') }}</el-tag>
      <div v-else>
        <el-tag type="danger" size="large">✗ {{ t('stages.wrong') }}</el-tag>
        <div class="correct-answer">
          {{ t('stages.correctAnswer') }} <strong>{{ correctAnswer }}</strong>
        </div>
      </div>
    </div>

    <div class="stage-footer">
      <el-button :disabled="checked" @click="showHint">{{ t('stages.hint') }}</el-button>
      <el-button v-if="!checked" type="primary" :disabled="!answer.trim()" @click="check">
        {{ t('stages.check') }}
      </el-button>
      <el-button v-else type="primary" @click="next">
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

.label {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 0.5rem;
}

.prompt {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.had-errors {
  color: var(--el-color-danger);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.answer {
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.answer--success :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px var(--el-color-success) inset; }
.answer--error   :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px var(--el-color-danger) inset; }

.verdict {
  text-align: center;
  margin-bottom: 1rem;
}

.correct-answer {
  margin-top: 0.5rem;
  color: var(--el-text-color-regular);
}
</style>
