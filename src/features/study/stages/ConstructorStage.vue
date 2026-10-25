<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { shuffle } from '../../../domain/words.js'
import { icon } from '../../../shared/utils/icons.js'

const props = defineProps({
  words:        { type: Array,  required: true },
  allWords:     { type: Array,  required: true },
  title:        { type: String, default: '' },
  extraLetters: { type: Number, default: 0 },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const queue        = ref([...props.words])
const currentIndex = ref(0)
const errorIds     = ref(new Set())
const doneCount    = ref(0)

const assembled       = ref('')
const completed       = ref(false)
const flash           = ref(null) // success | error
const shuffledLetters = ref([])   // { char, used, wrong }

const current = computed(() => queue.value[currentIndex.value])

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
  flash.value           = null
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
    errorIds.value.add(current.value.id)
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
  errorIds.value.add(current.value.id)

  const letter = shuffledLetters.value.find(l => !l.used && l.char.toLowerCase() === nextChar.toLowerCase())
  if (letter) letter.used = true
  assembled.value += nextChar

  if (assembled.value.length === current.value.word.length) onWordComplete()
}

function onWordComplete() {
  completed.value = true
  flash.value     = 'success'

  // если была ошибка — в конец очереди
  if (errorIds.value.has(current.value.id)) queue.value.push({ ...current.value })
  else doneCount.value++

  setTimeout(next, 1500)
}

function next() {
  if (currentIndex.value >= queue.value.length - 1) {
    emit('done', [...errorIds.value])
    return
  }
  currentIndex.value++
  initWord()
}

initWord()

watch(() => props.words, () => {
  queue.value        = [...props.words]
  currentIndex.value = 0
  initWord()
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
      <div class="prompt">{{ current.translation?.join(', ') }}</div>
      <div class="assembled" :class="flash && `assembled--${flash}`">
        {{ assembled || '...' }}
      </div>
      <div v-if="current.has_error" class="had-errors">⚠ {{ t('stages.hadErrors') }}</div>
    </el-card>

    <!-- места под буквы -->
    <div class="slots">
      <div v-for="(_, i) in current.word.split('')" :key="i" class="slot">
        {{ assembled[i] ?? '' }}
      </div>
    </div>

    <!-- буквы -->
    <div class="letters">
      <button
          v-for="(letter, i) in shuffledLetters"
          :key="i"
          type="button"
          class="letter"
          :class="{ 'letter--used': letter.used, 'letter--wrong': letter.wrong }"
          @click="pressLetter(letter)"
      >
        {{ letter.char }}
      </button>
    </div>

    <div class="stage-footer">
      <el-button :disabled="!assembled || completed" @click="backspace">
        ← {{ t('stages.erase') }}
      </el-button>
      <el-button :disabled="completed" @click="showHint">
        {{ t('stages.hint') }}
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

.prompt {
  color: var(--el-text-color-secondary);
  margin-bottom: 0.5rem;
}

.assembled {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.25rem;
  min-height: 2.75rem;
  color: var(--el-text-color-primary);
  transition: color 0.3s;
}

.assembled--success { color: var(--el-color-success); }
.assembled--error   { color: var(--el-color-danger); }

.had-errors {
  color: var(--el-color-danger);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.slots,
.letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.375rem;
  margin-bottom: 1rem;
}

.letters {
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.slot {
  width: 2rem;
  height: 2.25rem;
  border-bottom: 2px solid var(--el-border-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
}

.letter {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 6px;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font: inherit;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.letter--used {
  opacity: 0.2;
  cursor: default;
  background: var(--el-fill-color-light);
}

.letter--wrong {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
  color: var(--el-color-danger);
}
</style>
