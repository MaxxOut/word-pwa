<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { wordsRepo } from '@/core/words/repo.js'
import { DuplicateWordError } from '@/core/words/errors.js'
import { MAX_FORMS, normalizeWord } from '@/core/words/domain.js'
import { lookupReferences } from '@/core/reference/reference.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import { toast, confirm } from '@/shared/ui/feedback.js'
import UiSheet from '@/shared/ui/UiSheet.vue'
import UiInput from '@/shared/ui/UiInput.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiSwitch from '@/shared/ui/UiSwitch.vue'
import TranslateActions from '@/core/translate/TranslateActions.vue'

const props = defineProps({
  libraryId: { type: String, default: null },
  langCode:  { type: String, default: null },
})

const emit = defineEmits(['saved'])

const { t, locale } = useI18n()

const visible   = ref(false)
const saving    = ref(false)
const editing   = ref(null)
const wordError = ref('')
const wordInput = ref(null)
const opened    = ref(0) // номер открытия: блок перевода пересоздаётся — запрос по прошлому слову не долетит

const emptyForm = () => ({
  word:          '',
  transcription: '',
  translation:   [''],
  examples:      [],
  is_learned:    false,
  is_ignored:    false,
  forms:         [],
})

// форма в полях: перевод — одной строкой через запятую
const formToFields = f => ({
  word:          f.word,
  translation:   (f.translation ?? []).join(', '),
  transcription: f.transcription ?? '',
  note:          f.note ?? '',
})
const fieldsToForm = f => ({ ...f, translation: f.translation.split(',') })

const form = ref(emptyForm())

function open(word = null) {
  editing.value   = word
  wordError.value = ''
  form.value = word
    ? {
        word:          word.word,
        transcription: word.transcription ?? '',
        translation:   word.translation?.length ? [...word.translation] : [''],
        examples:      [...(word.examples ?? [])],
        is_learned:    word.is_learned,
        is_ignored:    word.is_ignored,
        forms:         (word.forms ?? []).map(formToFields),
      }
    : emptyForm()
  opened.value++
  visible.value = true
  // новое слово — сразу клавиатура
  if (!word) nextTick(() => wordInput.value?.focus())
}

async function submit() {
  if (!form.value.word.trim()) {
    wordError.value = t('words.enterWord')
    return
  }
  wordError.value = ''

  saving.value = true
  const data = { ...form.value, forms: form.value.forms.map(fieldsToForm) }
  try {
    if (editing.value) {
      await wordsRepo.update(editing.value.id, data)
      toast.success(t('words.updated'))
    } else {
      await wordsRepo.create(props.libraryId, data)
      toast.success(t('word.created'))
    }
    visible.value = false
    emit('saved')
  } catch (err) {
    if (err instanceof DuplicateWordError) wordError.value = t('word.duplicate')
    else toast.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

async function remove() {
  const ok = await confirm({
    message:     t('words.confirmDelete', { word: editing.value.word }),
    confirmText: t('common.delete'),
    danger:      true,
  })
  if (!ok) return
  try {
    await wordsRepo.remove(editing.value.id)
    toast(t('words.deleted'))
    visible.value = false
    emit('saved')
  } catch {
    toast.error(t('errors.delete'))
  }
}

// онлайн-перевод — в первое пустое поле перевода (или новым)
function onOnline(text) {
  const list = form.value.translation
  const i    = list.findIndex(s => !s.trim())
  if (i === -1) list.push(text)
  else list[i] = text
}

// ответ ИИ заполняет форму, сохраняет пользователь. Начальную форму (peeped → peep)
// подставляем только в новое слово — у существующего слово не меняем
function onAi(row) {
  const f = form.value
  // правим слово, а ответ про другое (в буфере старый ответ) — не подменять перевод молча
  if (editing.value && normalizeWord(row.word) !== normalizeWord(f.word)) {
    toast.error(t('words.aiOtherWord', { word: row.word }))
    return
  }
  if (!editing.value) f.word = row.word
  f.translation = [...row.translation]
  if (!f.transcription.trim() && row.transcription) f.transcription = row.transcription
  f.examples = [...new Set([...f.examples.filter(s => s.trim()), ...row.examples])]
}

// слово есть в справочнике (неправильный глагол), а форм у него не хватает — заполнить из справочника.
// Так подтягиваются и глаголы, добавленные раньше обычным словом
const reference = computed(() => {
  const libraryId = editing.value?.library_id ?? props.libraryId
  const item = lookupReferences(libraryId, form.value.word, { locale: locale.value, exact: true, limit: 1 })[0]?.items[0]
  if (!item || normalizeWord(item.word.word) !== normalizeWord(form.value.word)) return null
  // само слово — тоже «есть» (come — came — come)
  const have    = new Set([form.value.word, ...form.value.forms.map(f => f.word)].map(normalizeWord))
  const missing = item.word.forms.filter(f => !have.has(normalizeWord(f.word)))
  return { item, missing: missing.slice(0, Math.max(0, MAX_FORMS - form.value.forms.length)) }
})

function fillForms() {
  const { item, missing } = reference.value
  form.value.forms.push(...missing.map(formToFields))
  if (!form.value.transcription.trim() && item.word.transcription) form.value.transcription = item.word.transcription
}

// выделить форму в отдельное слово — сразу в базе (форма должна быть уже сохранена у слова)
const savedForm = f => editing.value?.forms?.some(x => x.word.toLowerCase() === f.word.trim().toLowerCase())

async function detach(i) {
  const f = form.value.forms[i]
  try {
    const { word, created } = await wordsRepo.detachForm(editing.value.id, f.word, fieldsToForm(f))
    editing.value = word
    form.value.forms.splice(i, 1)
    toast.success(t('words.forms.detached', { word: created.word }))
    emit('saved')
  } catch (err) {
    if (err instanceof DuplicateWordError) toast.error(t('words.forms.detachDuplicate', { word: f.word }))
    else toast.error(t('errors.save'))
  }
}

defineExpose({ open })
</script>

<template>
  <UiSheet v-model="visible" :title="editing ? t('words.editTitle') : t('words.addTitle')">
    <!-- зоны: слово и переводы / примеры / формы / статус -->
    <form class="form" @submit.prevent="submit">
      <div class="group zone">
        <div class="row">
          <UiInput
              ref="wordInput"
              v-model="form.word"
              class="grow"
              :label="t('word.word')"
              :error="wordError"
              placeholder="apple"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
          />
          <UiIconButton
              v-if="canSpeak()"
              class="speak"
              icon="speak"
              :label="t('words.speak')"
              :disabled="!form.word.trim()"
              @click="speak(form.word, langCode)"
          />
        </div>

        <UiInput
            v-model="form.transcription"
            :label="t('words.transcription')"
            placeholder="ˈæp.əl"
            autocomplete="off"
        />

        <fieldset class="group">
          <legend class="field-label">{{ t('words.translations') }}</legend>
          <div v-for="(_, i) in form.translation" :key="i" class="row">
            <UiInput
                v-model="form.translation[i]"
                class="grow"
                :placeholder="t('words.translationPlaceholder')"
                :aria-label="t('words.translation')"
                autocomplete="off"
            />
            <UiIconButton icon="close" :label="t('common.remove')" @click="form.translation.splice(i, 1)" />
          </div>
          <UiButton variant="text" icon="add" class="add" @click="form.translation.push('')">
            {{ t('words.addTranslation') }}
          </UiButton>
          <TranslateActions
              :key="opened"
              v-if="libraryId || editing"
              :word="form.word"
              :from="editing?.library_id ?? libraryId"
              :context="form.examples.find(s => s.trim()) ?? ''"
              @online="onOnline"
              @ai="onAi"
          />
        </fieldset>
      </div>

      <fieldset class="group zone">
        <legend class="field-label">{{ t('words.examples') }}</legend>
        <div v-for="(_, i) in form.examples" :key="i" class="row">
          <UiInput
              v-model="form.examples[i]"
              class="grow"
              multiline
              placeholder="I eat an apple"
              :aria-label="t('words.example')"
          />
          <UiIconButton
              v-if="canSpeak()"
              icon="speak"
              :label="t('words.speak')"
              @click="speak(form.examples[i], langCode)"
          />
          <UiIconButton icon="close" :label="t('common.remove')" @click="form.examples.splice(i, 1)" />
        </div>
        <UiButton variant="text" icon="add" class="add" @click="form.examples.push('')">
          {{ t('words.addExample') }}
        </UiButton>
      </fieldset>

      <!-- формы слова: dogs, went → go. Не учатся отдельно -->
      <fieldset class="group zone">
        <legend class="field-label">{{ t('words.forms.title') }}</legend>
        <div v-if="reference?.missing.length" class="ref">
          <span>{{ t('reference.irregular', { title: reference.item.title }) }}</span>
          <UiButton variant="text" icon="add" class="add" @click="fillForms">
            {{ t('reference.fillForms', { n: reference.missing.length }) }}
          </UiButton>
        </div>
        <div v-for="(f, i) in form.forms" :key="i" class="form-card">
          <div class="row">
            <UiInput
                v-model="f.word"
                class="grow"
                :placeholder="t('words.forms.word')"
                :aria-label="t('words.forms.word')"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
            />
            <UiIconButton icon="close" :label="t('common.remove')" @click="form.forms.splice(i, 1)" />
          </div>
          <UiInput v-model="f.translation" :placeholder="t('words.translation')" :aria-label="t('words.translation')" autocomplete="off" />
          <UiInput v-model="f.transcription" :placeholder="t('words.transcription')" :aria-label="t('words.transcription')" autocomplete="off" />
          <UiInput v-model="f.note" :placeholder="t('words.forms.note')" :aria-label="t('words.forms.note')" autocomplete="off" />
          <!-- только у сохранённой формы: выделение сразу пишет в базу -->
          <UiButton v-if="savedForm(f)" variant="text" icon="split" class="add" @click="detach(i)">
            {{ t('words.forms.detach') }}
          </UiButton>
        </div>
        <UiButton
            variant="text"
            icon="add"
            class="add"
            :disabled="form.forms.length >= MAX_FORMS"
            @click="form.forms.push(formToFields({ word: '' }))"
        >
          {{ t('words.forms.add') }}
        </UiButton>
      </fieldset>

      <div v-if="editing" class="group zone">
        <UiSwitch v-model="form.is_learned" :label="t('status.learned')" />
        <UiSwitch v-model="form.is_ignored" :label="t('words.ignore')" :hint="t('words.ignoreHint')" />
      </div>

      <!-- Enter в поле отправляет форму -->
      <button type="submit" hidden />
    </form>

    <template #footer>
      <UiButton v-if="editing" variant="text" icon="delete" class="delete" @click="remove">
        {{ t('common.delete') }}
      </UiButton>
      <UiButton variant="filled" :loading="saving" @click="submit">
        {{ editing ? t('common.save') : t('words.create') }}
      </UiButton>
    </template>
  </UiSheet>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1rem;
}

.row { align-items: flex-start; }
.speak { margin-top: 1.5rem; }

.group {
  display: grid;
  gap: 0.5rem;
  /* у fieldset по умолчанию min-width: min-content — широкие поля раздвигали шторку */
  min-width: 0;
  border: 0;
}
.group legend { margin-bottom: 0.375rem; }

/* зона — своя подложка, чтобы длинная карточка читалась по частям */
.zone {
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: var(--container);
}
.zone legend { float: left; width: 100%; padding: 0; }

.add { justify-self: start; }

.form-card {
  display: grid;
  /* колонка не шире карточки: иначе её раздвигает собственная ширина полей ввода */
  grid-template-columns: minmax(0, 1fr);
  gap: 0.375rem;
  min-width: 0;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
}
/* поля в строке сжимаются, а не раздвигают шторку */
.form-card .grow { min-width: 0; flex: 1 1 0; }

.delete { color: var(--error); margin-right: auto; }

/* подсказка из справочника — его цветом */
.ref {
  display: grid;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: var(--tertiary-c);
  color: var(--on-tertiary-c);
  font-size: 0.9375rem;
}
.ref .add { color: inherit; }
</style>
