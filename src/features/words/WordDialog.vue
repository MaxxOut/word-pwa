<script setup>
import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { words as wordsRepo, DuplicateWordError } from '../../data/index.js'
import { speak, canSpeak } from '../../shared/utils/browser.js'
import { toast, confirm } from '../../shared/ui/feedback.js'
import UiSheet from '../../shared/ui/UiSheet.vue'
import UiInput from '../../shared/ui/UiInput.vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiIconButton from '../../shared/ui/UiIconButton.vue'
import UiSwitch from '../../shared/ui/UiSwitch.vue'

const props = defineProps({
  libraryId: { type: String, default: null },
  langCode:  { type: String, default: null },
})

const emit = defineEmits(['saved'])

const { t } = useI18n()

const visible   = ref(false)
const saving    = ref(false)
const editing   = ref(null)
const wordError = ref('')
const wordInput = ref(null)

const emptyForm = () => ({
  word:          '',
  transcription: '',
  translation:   [''],
  examples:      [],
  is_learned:    false,
  is_ignored:    false,
})

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
      }
    : emptyForm()
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
  try {
    if (editing.value) {
      await wordsRepo.update(editing.value.id, form.value)
      toast.success(t('words.updated'))
    } else {
      await wordsRepo.create(props.libraryId, form.value)
      toast.success(t('words.created'))
    }
    visible.value = false
    emit('saved')
  } catch (err) {
    if (err instanceof DuplicateWordError) wordError.value = t('words.duplicate')
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

defineExpose({ open })
</script>

<template>
  <UiSheet v-model="visible" :title="editing ? t('words.editTitle') : t('words.addTitle')">
    <form class="form" @submit.prevent="submit">
      <div class="row">
        <UiInput
            ref="wordInput"
            v-model="form.word"
            class="grow"
            :label="t('words.word')"
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
      </fieldset>

      <fieldset class="group">
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

      <div v-if="editing" class="group">
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
  border: 0;
}
.group legend { margin-bottom: 0.375rem; }

.add { justify-self: start; }

.delete { color: var(--error); margin-right: auto; }
</style>
