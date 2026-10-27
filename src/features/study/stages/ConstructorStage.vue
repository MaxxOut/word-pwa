<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { shuffle } from '../../../domain/words.js'
import UiButton from '../../../shared/ui/UiButton.vue'
import StageHeader from './StageHeader.vue'
import StageCard from './StageCard.vue'
import { useStageQueue } from './useStageQueue.js'

const props = defineProps({
  words:        { type: Array,  required: true },
  allWords:     { type: Array,  required: true },
  title:        { type: String, default: '' },
  extraLetters: { type: Number, default: 0 },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, counter, progress, markError, fail, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const assembled       = ref('')
const completed       = ref(false)
const attemptFailed   = ref(false) // ошибка в этой попытке, а не когда-то раньше
const shuffledLetters = ref([])    // { char, used, wrong }

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

function generateLetters(word) {
  const letters = word.split('').map(char => ({ char, used: false, wrong: false }))
  for (let i = 0; i < props.extraLetters; i++) {
    letters.push({ char: ALPHABET[Math.floor(Math.random() * ALPHABET.length)], used: false, wrong: false })
  }
  return shuffle(letters)
}

function initWord() {
  assembled.value       = ''
  completed.value       = false
  attemptFailed.value   = false
  shuffledLetters.value = generateLetters(current.value.word)
}

function pressLetter(letter) {
  if (letter.used || completed.value) return

  const expected = current.value.word[assembled.value.length]

  if (letter.char.toLowerCase() === expected.toLowerCase()) {
    letter.used = true
    assembled.value += letter.char
    if (assembled.value.length === current.value.word.length) onWordComplete()
  } else {
    letter.wrong = true
    attemptFailed.value = true
    markError()
    setTimeout(() => { letter.wrong = false }, 500)
  }
}

function backspace() {
  if (!assembled.value) return
  const lastChar  = assembled.value.at(-1).toLowerCase()
  assembled.value = assembled.value.slice(0, -1)
  const used = shuffledLetters.value.filter(l => l.used && l.char.toLowerCase() === lastChar).at(-1)
  if (used) used.used = false
}

function showHint() {
  const nextChar = current.value.word[assembled.value.length]
  attemptFailed.value = true
  markError()

  const letter = shuffledLetters.value.find(l => !l.used && l.char.toLowerCase() === nextChar.toLowerCase())
  if (letter) letter.used = true
  assembled.value += nextChar

  if (assembled.value.length === current.value.word.length) onWordComplete()
}

function onWordComplete() {
  completed.value = true

  // ошиблись в этой попытке — слово ещё раз в конце очереди
  if (attemptFailed.value) fail()
  else succeed()

  setTimeout(() => {
    if (nextWord()) initWord()
  }, 1200)
}

initWord()
</script>

<template>
  <StageHeader
      :title="title"
      :counter="counter"
      :progress="progress"
      @exit="$emit('exit')"
  />

  <StageCard :key="index" :had-errors="current.has_error">
    <div class="muted">{{ current.translation?.join(', ') }}</div>
    <!-- места под буквы -->
    <div class="slots" :class="{ 'slots--done': completed }" aria-live="polite">
      <span v-for="(_, i) in current.word.split('')" :key="i" class="slot">{{ assembled[i] ?? '' }}</span>
    </div>
  </StageCard>

  <div class="letters">
    <button
        v-for="(letter, i) in shuffledLetters"
        :key="i"
        v-ripple
        type="button"
        class="letter"
        :class="{ 'letter--used': letter.used, 'letter--wrong': letter.wrong }"
        :disabled="letter.used || completed"
        @click="pressLetter(letter)"
    >
      <!-- все строчные: заглавная подсказала бы первую букву -->
      {{ letter.char.toLowerCase() }}
    </button>
  </div>

  <div class="stage-footer">
    <UiButton variant="outlined" icon="backspace" :disabled="!assembled || completed" @click="backspace">
      {{ t('stages.erase') }}
    </UiButton>
    <UiButton variant="outlined" icon="hint" :disabled="completed" @click="showHint">
      {{ t('stages.hint') }}
    </UiButton>
  </div>
</template>

<style scoped>
.slots {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
}
.slot {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2.5rem;
  border-bottom: 2px solid var(--outline);
  font-family: var(--font-title);
  font-size: 1.375rem;
  font-weight: 700;
  transition: color 0.2s, border-color 0.2s;
}
.slots--done .slot { color: var(--success); border-color: var(--success); }

.letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.letter {
  width: 3rem;
  height: 3rem;
  border: 0;
  border-radius: 0.75rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  user-select: none;
  transition: opacity 0.2s, background-color 0.2s;
}
.letter--used { opacity: 0.2; }
.letter:disabled { cursor: default; }
.letter--wrong {
  background: var(--error-c);
  color: var(--on-error-c);
  animation: shake 0.3s;
}

@keyframes shake {
  25% { transform: translateX(-0.25rem); }
  75% { transform: translateX(0.25rem); }
}
</style>
