<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import StageHeader from './StageHeader.vue'
import StageCard from './StageCard.vue'
import { useStageQueue } from './useStageQueue.js'
import { useAutoSpeak } from './autoSpeak.js'

// знакомство: слово с переводом, звучит — и через пару секунд следующее само (тап — сразу). Ошибок здесь нет
const props = defineProps({
  words: { type: Array,  required: true },
  title: { type: String, default: '' },
})

const emit = defineEmits(['done', 'exit'])

const { t } = useI18n()

const { index, current, counter, progress, succeed, next: nextWord } =
  useStageQueue(props.words, errorIds => emit('done', errorIds))

const SHOW_MS = 2000

let timer = 0
function next() {
  clearTimeout(timer)
  succeed()
  nextWord()
}

const { say } = useAutoSpeak()
watch(index, () => {
  say(current.value.word)
  timer = setTimeout(next, SHOW_MS)
}, { immediate: true })

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <StageHeader
      :title="title"
      sound
      :counter="counter"
      :progress="progress"
      @exit="$emit('exit')"
  />

  <StageCard :key="index" class="intro" @click="next">
    <div class="word">{{ current.word }}</div>
    <div v-if="current.transcription" class="muted">[{{ current.transcription }}]</div>
    <div class="translation">{{ current.translation?.join(', ') }}</div>
  </StageCard>

  <p class="muted small hint">{{ t('study.stages.introHint') }}</p>
</template>

<style scoped>
.intro { cursor: pointer; }
.word {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.translation { font-size: 1.125rem; }
.hint { text-align: center; }
</style>
