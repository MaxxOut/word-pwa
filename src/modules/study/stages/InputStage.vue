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
import { speak } from '@/shared/utils/browser.js'
import { useLibraryStore } from '@/core/library/store.js'

// ввод слова по переводу; mode 'listen' — «На слух»: слово звучит, перевода нет до ответа.
// Транскрипция — только после ответа, иначе подсказывает написание
const props = defineProps({
  words:    { type: Array,  required: true },
  allWords: { type: Array,  required: true },
  title:    { type: String, default: '' },
  mode:     { type: String, default: null }, // null | listen
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, isLast, counter, progress, fail, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const answer    = ref('')
const checked   = ref(false)
const isCorrect = ref(false)
const inputRef  = ref(null)

// показываем перевод — пользователь вводит слово
const prompt        = computed(() => current.value.translation?.join(', ') || current.value.word)
const correctAnswer = computed(() => current.value.word)

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
  if (nextWord()) resetState()
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

const listen  = computed(() => props.mode === 'listen')
const library = useLibraryStore()
const { say } = useAutoSpeak()

// на слух озвучка нужна всегда, без оглядки на автоозвучку
const play = () => speak(current.value.word, library.current?.lang_code)
if (listen.value) watch(index, play, { immediate: true })
else watch(checked, done => done && say(correctAnswer.value))

// «На слух» можно пропустить целиком (учу ночью, в тишине) — без ошибок
const skipStage = () => emit('done', [])
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
    <template v-if="listen">
      <div class="muted small">{{ t('study.stages.listenWord') }}</div>
      <UiButton variant="tonal" icon="speak" class="play" @click="play">{{ t('study.stages.listenAgain') }}</UiButton>
      <div v-if="checked" class="muted">{{ prompt }}</div>
    </template>
    <template v-else>
      <div class="muted small">{{ t('study.stages.enterWord') }}</div>
      <div class="prompt">{{ prompt }}</div>
    </template>
    <div v-if="checked && current.transcription" class="muted">[{{ current.transcription }}]</div>
  </StageCard>

  <div v-if="listen" class="skip">
    <UiButton variant="text" icon="skip" @click="skipStage">{{ t('study.stages.skipStage') }}</UiButton>
  </div>

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
.play { margin: 0.25rem 0; }
.skip { display: flex; justify-content: flex-end; margin: -0.5rem 0 0.5rem; }

.prompt {
  font-family: var(--font-title);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

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
