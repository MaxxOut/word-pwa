<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import UiButton from '@/shared/ui/UiButton.vue'
import StageHeader from './StageHeader.vue'
import StageCard from './StageCard.vue'
import { useStageQueue } from './useStageQueue.js'
import { useAutoSpeak } from './autoSpeak.js'

// знакомство: слово, перевод, пример, под ними буквы по порядку — пройти каждую (тап или клавиатура),
// чтобы прочувствовать написание до проверок. Ошибок здесь нет
const props = defineProps({
  words: { type: Array,  required: true },
  title: { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, isLast, counter, progress, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const isLetter = ch => /[\p{L}\p{N}]/u.test(ch)

const chars = computed(() => [...current.value.word])
const pos   = ref(0) // следующая буква
const done  = computed(() => pos.value >= chars.value.length)
const wrong = ref(false)

// пробелы, дефисы, апострофы проходим сами
function skipNonLetters() {
  while (pos.value < chars.value.length && !isLetter(chars.value[pos.value])) pos.value++
}

function press(i) {
  if (i !== pos.value || done.value) return
  pos.value++
  skipNonLetters()
}

function onKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (done.value) {
    if (e.key === 'Enter') next()
    return
  }
  if (e.key.length !== 1) return
  if (e.key.toLowerCase() === chars.value[pos.value].toLowerCase()) press(pos.value)
  else {
    wrong.value = true
    setTimeout(() => { wrong.value = false }, 300)
  }
}

function next() {
  if (nextWord()) start()
}

function start() {
  pos.value = 0
  skipNonLetters()
}

const example = computed(() => current.value.examples?.[0])

const { say } = useAutoSpeak()
watch(index, () => say(current.value.word), { immediate: true })
watch(done, d => {
  if (d) {
    succeed()
    say(current.value.word)
  }
})

start()
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <StageHeader
      :title="title"
      sound
      :counter="counter"
      :progress="progress"
      @exit="$emit('exit')"
  />

  <StageCard :key="index">
    <div class="word">{{ current.word }}</div>
    <div v-if="current.transcription" class="muted">[{{ current.transcription }}]</div>
    <div class="translation">{{ current.translation?.join(', ') }}</div>
    <div v-if="example" class="muted small example">{{ example }}</div>
  </StageCard>

  <p class="muted small hint">{{ t('study.stages.introHint') }}</p>

  <div :key="index" class="letters" :class="{ 'letters--wrong': wrong, 'letters--done': done }">
    <template v-for="(ch, i) in chars" :key="i">
      <span v-if="!isLetter(ch)" class="gap">{{ ch === ' ' ? '' : ch }}</span>
      <button
          v-else
          v-ripple
          type="button"
          class="letter"
          :class="{ 'letter--passed': i < pos, 'letter--next': i === pos }"
          :disabled="i !== pos"
          @click="press(i)"
      >
        {{ ch }}
      </button>
    </template>
  </div>

  <div class="stage-footer">
    <UiButton variant="filled" :disabled="!done" @click="next">
      {{ isLast ? t('study.stages.finish') : t('study.stages.next') }}
    </UiButton>
  </div>
</template>

<style scoped>
.word {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.translation { font-size: 1.125rem; }
.example { font-style: italic; }

.hint { margin-bottom: 0.5rem; text-align: center; }

.letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
}
.letters--wrong { animation: shake 0.3s; }

.gap { width: 0.75rem; align-self: center; text-align: center; }

.letter {
  width: 2.75rem;
  height: 3rem;
  border: 0;
  border-radius: 0.75rem;
  background: var(--container);
  color: var(--muted);
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  user-select: none;
  transition: background-color 0.15s, color 0.15s;
}
.letter:disabled { cursor: default; }
.letter--next { background: var(--primary-c); color: var(--on-primary-c); box-shadow: inset 0 0 0 2px var(--primary); }
.letter--passed { background: var(--primary); color: var(--on-primary); }
.letters--done .letter { background: var(--success-c); color: var(--on-success-c); }

@keyframes shake {
  25% { transform: translateX(-0.25rem); }
  75% { transform: translateX(0.25rem); }
}
</style>
