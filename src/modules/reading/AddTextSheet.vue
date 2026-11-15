<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { addUserText } from './texts.js'
import { parseFile, parsePlain, textWords } from './importText.js'
import { useLibraryStore } from '@/core/library/store.js'
import { toast } from '@/shared/ui/feedback.js'
import { historySettled } from '@/shared/ui/backClose.js'
import UiSheet from '@/shared/ui/UiSheet.vue'
import UiInput from '@/shared/ui/UiInput.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import AppIcon from '@/shared/components/AppIcon.vue'

// добавить внешнюю книгу: файл (.txt, .fb2) или вставленный текст (и «Поделиться» с Android).
// Главы режутся сами (importText.js); после сохранения — сразу в книгу
const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()

const visible   = ref(false)
const title     = ref('')
const pasted    = ref('')
const file      = ref(null)  // { name, chapters } — разобранный файл
const libraryId = ref(null)
const link      = ref('')    // поделились только ссылкой — текст из неё не достать
const saving    = ref(false)
const reading   = ref(false)
const error     = ref('')

const chapters = computed(() => file.value?.chapters ?? (pasted.value.trim() ? parsePlain(pasted.value) : []))
const words    = computed(() => textWords(chapters.value))

// prefill — из «Поделиться»: { title, text, url }. Chrome присылает ссылку на страницу в text —
// одна ссылка вместо текста: показываем подсказку, а не делаем книгу из адреса
function open(prefill = {}) {
  const onlyLink = /^\s*https?:\/\/\S+\s*$/.test(prefill.text ?? '')
  const text     = onlyLink ? '' : prefill.text ?? ''
  title.value     = prefill.title ?? ''
  pasted.value    = text
  link.value      = !text ? (prefill.url || (onlyLink ? prefill.text.trim() : '')) : ''
  file.value      = null
  error.value     = ''
  libraryId.value = library.current?.id
  visible.value   = true
}

defineExpose({ open })

async function onFile(e) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  reading.value = true
  error.value   = ''
  try {
    const book = parseFile(f.name, await f.arrayBuffer())
    if (!book.chapters.length) throw new Error('empty')
    file.value = { name: f.name, chapters: book.chapters }
    if (!title.value.trim()) title.value = book.title
  } catch {
    error.value = t('reading.mine.badFile')
  } finally {
    reading.value = false
  }
}

async function save() {
  if (!title.value.trim()) {
    error.value = t('reading.mine.needTitle')
    return
  }
  if (!words.value) return
  saving.value = true
  try {
    const id = await addUserText({ libraryId: libraryId.value, title: title.value.trim(), chapters: chapters.value })
    visible.value = false
    // шторка закрывается шагом назад по истории — дождаться, иначе он уведёт из книги
    await nextTick()
    await historySettled()
    toast.success(t('reading.mine.added'))
    // библиотека книги — текущей (книга с английским текстом читается в EN)
    if (libraryId.value !== library.current?.id) await library.select(libraryId.value)
    router.push({ name: 'reader', params: { id } })
  } catch {
    toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UiSheet v-model="visible" :title="t('reading.mine.addTitle')">
    <div class="form">
      <!-- файл -->
      <div v-if="file" class="file">
        <AppIcon name="book" size="1.5rem" />
        <span class="grow">
          <b class="file-name">{{ file.name }}</b>
          <span class="muted small">{{ t('reading.chapters', { n: chapters.length }) }} · {{ t('reading.mine.words', { n: words }) }}</span>
        </span>
        <UiIconButton icon="close" :label="t('common.remove')" @click="file = null" />
      </div>
      <label v-else class="pick" v-ripple>
        <AppIcon name="import" size="1.25rem" />
        <span>{{ reading ? t('common.loading') : t('reading.mine.fromFile') }}</span>
        <span class="muted small">.txt, .fb2</span>
        <input type="file" accept=".txt,.fb2,text/plain" class="sr-only" @change="onFile">
      </label>

      <UiInput
          v-model="title"
          :label="t('reading.mine.title')"
          :placeholder="t('reading.mine.titlePlaceholder')"
          autocomplete="off"
      />

      <div class="libs" role="radiogroup" :aria-label="t('reading.mine.library')">
        <button
            v-for="l in library.libraries"
            :key="l.id"
            v-ripple
            type="button"
            role="radio"
            class="chip"
            :class="{ 'chip--on': libraryId === l.id }"
            :aria-checked="libraryId === l.id"
            @click="libraryId = l.id"
        >
          {{ l.short_name }}
        </button>
      </div>

      <template v-if="!file">
        <p v-if="link" class="link small">{{ t('reading.mine.linkOnly') }}<br><span class="muted">{{ link }}</span></p>
        <UiInput
            v-model="pasted"
            multiline
            rows="8"
            :label="t('reading.mine.paste')"
            :placeholder="t('reading.mine.pastePlaceholder')"
        />
        <span v-if="words" class="muted small">
          {{ t('reading.chapters', { n: chapters.length }) }} · {{ t('reading.mine.words', { n: words }) }}
        </span>
      </template>

      <div v-if="error" class="error small">{{ error }}</div>
      <p class="muted small">{{ t('reading.mine.shareHint') }}</p>
    </div>

    <template #footer>
      <UiButton variant="filled" icon="add" :loading="saving" :disabled="!words" @click="save">
        {{ t('reading.mine.save') }}
      </UiButton>
    </template>
  </UiSheet>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.75rem;
}

.pick {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 1px dashed var(--outline);
  border-radius: var(--radius-m);
  cursor: pointer;
}

.file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  border-radius: var(--radius-m);
  background: var(--tertiary-c);
  color: var(--on-tertiary-c);
}
.file .grow { display: grid; }
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.libs { display: flex; gap: 0.5rem; }

.link {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--container);
  overflow-wrap: anywhere;
}

.error { color: var(--error); }
</style>
