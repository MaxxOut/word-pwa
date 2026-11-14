<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/core/settings/store.js'
import { toast } from '@/shared/ui/feedback.js'
import UiButton from '@/shared/ui/UiButton.vue'
import { translateOnline, googleTranslateUrl, parseAiLine, isPromptPasted, TranslateLimitError } from './translate.js'
import { buildPrompt } from './prompt.js'

// три способа перевести слово — всегда все три:
// онлайн (MyMemory) → emit('online', текст); Google Переводчик — вручную;
// промпт для ИИ → поле для ответа → emit('ai', { word, translation, transcription, examples })
const props = defineProps({
  word:    { type: String, required: true },
  from:    { type: String, required: true }, // язык слова: en | de
  context: { type: String, default: '' },    // предложение из текста — ИИ выберет нужное значение
})

const emit = defineEmits(['online', 'ai'])

const i18n          = useI18n()
const { t, locale } = i18n
const settingsStore = useSettingsStore()

const loading = ref(false)
const pasting = ref(false) // промпт скопирован — ждём ответ
const prompt  = ref('')    // не скопировался — показать, чтобы скопировать вручную
let copied    = ''         // последний промпт — отличить его от ответа, если вставили его
const answer  = ref('')
const error   = ref('')

const text = () => props.word.trim()

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
  const value = copied = buildPrompt(i18n, { word: text(), context: props.context, from: props.from, to: locale.value })
  error.value  = ''
  answer.value = ''
  try {
    await navigator.clipboard.writeText(value)
    prompt.value = ''
  } catch {
    prompt.value = value
  }
  pasting.value = true
}

function apply() {
  const row = parseAiLine(answer.value, { prompt: copied })
  if (!row) {
    error.value = t(isPromptPasted(answer.value, copied) ? 'translate.promptPasted' : 'translate.badAnswer')
    return
  }
  pasting.value = false
  emit('ai', row)
}

watch(answer, () => { error.value = '' })

// вставили разбираемый ответ — применяем сразу; вставили промпт — сразу сказать;
// набирают руками или не разобрался — кнопка
// (setTimeout — текст попадает в поле уже после события paste)
function onPaste() {
  setTimeout(() => {
    if (parseAiLine(answer.value, { prompt: copied }) || isPromptPasted(answer.value, copied)) apply()
  })
}
</script>

<template>
  <div class="translate">
    <div class="buttons">
      <UiButton class="tr-btn" variant="tonal" :loading="loading" :disabled="!word.trim()" @click="online">
        {{ t('translate.online') }}
      </UiButton>
      <UiButton class="tr-btn" variant="tonal" :disabled="!word.trim()" @click="google">
        {{ t('translate.google') }}
      </UiButton>
      <UiButton class="tr-btn" variant="tonal" :disabled="!word.trim()" @click="copyPrompt">
        {{ t('translate.ai') }}
      </UiButton>
    </div>

    <div v-if="pasting" class="paste">
      <div class="muted small">{{ prompt ? t('translate.copyFailed') : t('translate.copied') }}</div>
      <textarea v-if="prompt" class="area" readonly rows="4" :value="prompt" @focus="$event.target.select()" />
      <textarea
          v-model="answer"
          class="area"
          rows="2"
          :placeholder="t('translate.answer')"
          :aria-label="t('translate.answer')"
          autocomplete="off"
          spellcheck="false"
          @paste="onPaste"
      />
      <div v-if="error" class="error small">{{ error }}</div>
      <UiButton class="tr-btn" variant="filled" :disabled="!answer.trim()" @click="apply">
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
