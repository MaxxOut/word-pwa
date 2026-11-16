<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/core/settings/store.js'
import { toast } from '@/shared/ui/feedback.js'
import UiButton from '@/shared/ui/UiButton.vue'
import { translateOnline, googleTranslateUrl, parseAiLine, isPromptPasted, TranslateLimitError } from './translate.js'
import { buildPrompt } from './prompt.js'

// три способа перевести слово — всегда все три:
// онлайн (MyMemory) → emit('online', текст); Google Переводчик — вручную;
// промпт для ИИ → «Вставить ответ» из буфера → emit('ai', { word, translation, transcription, examples }).
// Кнопка видна всегда — ответ можно вставить и без нового копирования промпта.
// Поле ввода — только если буфер прочитать не дали: в книге клавиатура закрывала поле внизу экрана
const props = defineProps({
  word:    { type: String, required: true },
  from:    { type: String, required: true }, // язык слова: en | de
  context: { type: String, default: '' },    // предложение из текста — ИИ выберет нужное значение
  // промпт для этого слова уже скопирован (пузырь закрывался, пока ходили в чат) — сразу поле ответа,
  // промпт заново не копируем, чтобы не затереть ответ в буфере
  waiting: { type: Boolean, default: false },
})

const emit = defineEmits(['online', 'ai', 'copied'])

const i18n          = useI18n()
const { t, locale } = i18n
const settingsStore = useSettingsStore()

const loading = ref(false)
const pasting = ref(props.waiting) // промпт скопирован — подсказка, что делать дальше
const prompt  = ref('')    // не скопировался — показать, чтобы скопировать вручную
let copied    = props.waiting ? makePrompt() : '' // последний промпт — отличить его от ответа, если вставили его
const answer  = ref('')
const error   = ref('')
const manual  = ref(false) // буфер не прочитался — поле для ручной вставки

function text() {
  return props.word.trim()
}

function makePrompt() {
  return buildPrompt(i18n, { word: text(), context: props.context, from: props.from, to: locale.value })
}

async function online() {
  if (!text()) return
  loading.value = true
  try {
    const email = settingsStore.settings.translate_email
    emit('online', await translateOnline(text(), props.from, locale.value, { email }))
  } catch (err) {
    toast.error(t(err instanceof TranslateLimitError ? 'translate.limit' : 'translate.failed'))
  } finally {
    loading.value = false
  }
}

function google() {
  if (!text()) return
  window.open(googleTranslateUrl(text(), props.from, locale.value), '_blank', 'noopener')
}

async function copyPrompt() {
  if (!text()) return
  const value = copied = makePrompt()
  error.value  = ''
  try {
    await navigator.clipboard.writeText(value)
    prompt.value = ''
    emit('copied') // только если правда в буфере — иначе при повторном открытии было бы «скопирован»
  } catch {
    prompt.value = value
  }
  pasting.value = true
}

// чтобы узнать вставленный вместо ответа промпт — и если его скопировали до закрытия пузыря
const promptText = () => copied || makePrompt()

function apply() {
  const row = parseAiLine(answer.value, { prompt: promptText() })
  if (!row) {
    error.value = t(isPromptPasted(answer.value, promptText()) ? 'translate.promptPasted' : 'translate.badAnswer')
    return
  }
  pasting.value = false
  emit('ai', row)
}

async function pasteAnswer() {
  try {
    answer.value = await navigator.clipboard.readText()
  } catch {
    manual.value = true
    return
  }
  if (answer.value.trim()) apply()
  else error.value = t('translate.emptyClipboard')
}

// вставили разбираемый ответ — применяем сразу; вставили промпт — сразу сказать;
// набирают руками или не разобрался — кнопка
// (setTimeout — текст попадает в поле уже после события paste)
function onPaste() {
  setTimeout(() => {
    if (parseAiLine(answer.value, { prompt: promptText() }) || isPromptPasted(answer.value, promptText())) apply()
  })
}
</script>

<template>
  <div class="translate">
    <div class="buttons">
      <UiButton
          class="tr-btn"
          variant="tonal"
          icon="translate"
          :aria-label="t('translate.online')"
          :title="t('translate.online')"
          :loading="loading"
          :disabled="!word.trim()"
          @click="online"
      />
      <UiButton
          class="tr-btn"
          variant="tonal"
          icon="g-translate"
          :aria-label="t('translate.google')"
          :title="t('translate.google')"
          :disabled="!word.trim()"
          @click="google"
      />
      <UiButton class="tr-btn" variant="tonal" :disabled="!word.trim()" @click="copyPrompt">
        {{ t('translate.ai') }}
      </UiButton>
    </div>

    <div class="paste">
      <div v-if="pasting" class="muted small">{{ prompt ? t('translate.copyFailed') : t('translate.copied') }}</div>
      <textarea v-if="prompt" class="area" readonly rows="4" :value="prompt" @focus="$event.target.select()" />
      <UiButton v-if="!manual" class="tr-btn" variant="filled" icon="paste" @click="pasteAnswer">
        {{ t('translate.pasteAnswer') }}
      </UiButton>
      <textarea
          v-else
          v-model="answer"
          class="area"
          rows="1"
          :placeholder="t('translate.answer')"
          :aria-label="t('translate.answer')"
          autocomplete="off"
          spellcheck="false"
          @input="error = ''"
          @paste="onPaste"
      />
      <div v-if="error" class="error small">{{ error }}</div>
      <UiButton v-if="manual && answer.trim()" class="tr-btn" variant="filled" @click="apply">
        {{ t('translate.apply') }}
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.translate { display: grid; gap: 0.5rem; }

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tr-btn {
  min-height: 2.25rem;
  padding: 0.25rem 0.875rem;
  font-size: 0.8125rem;
}

.paste { display: grid; gap: 0.375rem; }
.paste .tr-btn { justify-self: end; }

.area {
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: 1px solid var(--outline);
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--on);
  font: inherit;
  font-size: 0.875rem;
  resize: none;
}
.area:focus { outline: none; border-color: var(--primary); }

.error { color: var(--error); }
</style>
