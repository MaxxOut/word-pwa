<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiInput from '@/shared/ui/UiInput.vue'
import StageHeader from './StageHeader.vue'
import StageCard from './StageCard.vue'
import { useStageQueue } from './useStageQueue.js'
import { useAutoSpeak } from './autoSpeak.js'
import { contextOf } from '../domain.js'

// в контексте: пример слова с пропуском, над пропуском — перевод; вписать слово в той форме,
// что в примере. Слова без подходящего примера сюда не попадают (stages.js → pick)
const props = defineProps({
  words: { type: Array,  required: true },
  title: { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, isLast, counter, progress, fail, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const answer    = ref('')
const checked   = ref(false)
const isCorrect = ref(false)
const inputRef  = ref(null)

const ctx           = computed(() => contextOf(current.value))
const correctAnswer = computed(() => ctx.value.match)
const translation   = computed(() => current.value.translation?.[0] ?? '')

function check() {
  if (!answer.value.trim()) return
  isCorrect.value = answer.value.trim().toLowerCase() === correctAnswer.value.toLowerCase()
  checked.value   = true
  if (isCorrect.value) succeed()
  else fail()
}

function showHint() {
  answer.value    = correctAnswer.value
  checked.value   = true
  isCorrect.value = false
  fail()
}

function next() {
  if (!nextWord()) return
  answer.value    = ''
  checked.value   = false
  isCorrect.value = false
  nextTick(() => inputRef.value?.focus())
}

const onEnter = () => (checked.value ? next() : check())

nextTick(() => inputRef.value?.focus())

const { say } = useAutoSpeak()
watch(checked, done => done && say(`${ctx.value.before}${ctx.value.match}${ctx.value.after}`))
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
    <div class="muted small">{{ t('study.stages.contextHint') }}</div>
    <p class="sentence">
      {{ ctx.before }}<span class="blank" :class="checked && (isCorrect ? 'blank--ok' : 'blank--bad')">
        <span class="blank-tr">{{ translation }}</span>
        <span class="blank-word">{{ checked ? correctAnswer : '' }}</span>
      </span>{{ ctx.after }}
    </p>
  </StageCard>

  <UiInput
      ref="inputRef"
      v-model="answer"
      class="answer"
      :placeholder="t('study.stages.inputPlaceholder')"
      :state="checked ? (isCorrect ? 'success' : 'error') : null"
      :disabled="checked"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="go"
      @enter="onEnter"
  />

  <div v-if="checked" class="verdict" :class="isCorrect ? 'verdict--ok' : 'verdict--bad'" role="status">
    <AppIcon :name="isCorrect ? 'check' : 'close'" />
    <span v-if="isCorrect">{{ t('study.stages.correct') }}</span>
    <span v-else>{{ t('study.stages.correctAnswer') }} <b>{{ correctAnswer }}</b></span>
  </div>

  <div class="stage-footer">
    <template v-if="!checked">
      <UiButton variant="outlined" icon="hint" @click="showHint">{{ t('study.stages.hint') }}</UiButton>
      <UiButton variant="filled" :disabled="!answer.trim()" @click="check">{{ t('study.stages.check') }}</UiButton>
    </template>
    <UiButton v-else variant="filled" @click="next">
      {{ isLast ? t('study.stages.finish') : t('study.stages.next') }}
    </UiButton>
  </div>
</template>

<style scoped>
.sentence {
  font-size: 1.25rem;
  line-height: 2.75;
}

/* пропуск: черта под словом, перевод — мелко над ней */
.blank {
  position: relative;
  display: inline-block;
  min-width: 5rem;
  padding: 0 0.25rem;
  border-bottom: 2px solid var(--primary);
  line-height: 1.4;
  vertical-align: baseline;
}
.blank-tr {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  color: var(--primary);
  font-size: 0.8125rem;
  white-space: nowrap;
}
.blank-word { font-weight: 700; }
.blank--ok  { border-color: var(--success); color: var(--success); }
.blank--bad { border-color: var(--error);   color: var(--error); }

.answer :deep(input) { font-size: 1.25rem; }

.verdict {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-m);
}
.verdict--ok  { background: var(--success-c); color: var(--on-success-c); animation: pop 0.3s; }
.verdict--bad { background: var(--error-c);   color: var(--on-error-c);   animation: shake 0.35s; }
</style>
