<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { words as wordsRepo, DuplicateWordError } from '../../data/index.js'
import { speak, canSpeak } from '../../shared/utils/browser.js'
import { icon } from '../../shared/utils/icons.js'

const props = defineProps({
  libraryId: { type: String, default: null },
  langCode:  { type: String, default: null },
})

const emit = defineEmits(['saved'])

const { t } = useI18n()

const visible = ref(false)
const saving  = ref(false)
const editing = ref(null)
const formRef = ref(null)

const emptyForm = () => ({
  word:          '',
  transcription: '',
  translation:   [''],
  examples:      [],
  is_learned:    false,
  is_ignored:    false,
})

const form = ref(emptyForm())

const rules = {
  word: [{ required: true, message: () => t('words.enterWord'), trigger: 'blur' }],
}

function open(word = null) {
  editing.value = word
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
}

function reset() {
  form.value    = emptyForm()
  editing.value = null
  formRef.value?.clearValidate()
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    if (editing.value) {
      await wordsRepo.update(editing.value.id, form.value)
      ElMessage.success(t('words.updated'))
    } else {
      await wordsRepo.create(props.libraryId, form.value)
      ElMessage.success(t('words.created'))
    }
    visible.value = false
    emit('saved')
  } catch (err) {
    ElMessage.error(err instanceof DuplicateWordError ? t('words.duplicate') : t('errors.save'))
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog
      v-model="visible"
      :title="editing ? t('words.editTitle') : t('words.addTitle')"
      width="min(560px, 95vw)"
      @closed="reset"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="submit"
    >
      <el-form-item :label="t('words.word')" prop="word">
        <el-input v-model="form.word" placeholder="apple" />
      </el-form-item>

      <el-form-item :label="t('words.transcription')">
        <el-input v-model="form.transcription" placeholder="ˈæp.əl" />
      </el-form-item>

      <el-form-item :label="t('words.translations')">
        <div class="list">
          <div v-for="(_, i) in form.translation" :key="i" class="list-row">
            <el-input v-model="form.translation[i]" :placeholder="t('words.translationPlaceholder')" />
            <el-button :icon="icon('delete')" @click="form.translation.splice(i, 1)" />
          </div>
          <el-button size="small" @click="form.translation.push('')">{{ t('words.addTranslation') }}</el-button>
        </div>
      </el-form-item>

      <el-form-item :label="t('words.examples')">
        <div class="list">
          <div v-for="(_, i) in form.examples" :key="i" class="list-row">
            <el-input v-model="form.examples[i]" placeholder="I eat an apple" />
            <el-button v-if="canSpeak()" :icon="icon('speak')" @click="speak(form.examples[i], langCode)" />
            <el-button :icon="icon('delete')" @click="form.examples.splice(i, 1)" />
          </div>
          <el-button size="small" @click="form.examples.push('')">{{ t('words.addExample') }}</el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="editing" :label="t('words.status')">
        <el-checkbox v-model="form.is_learned">{{ t('status.learned') }}</el-checkbox>
        <el-checkbox v-model="form.is_ignored">{{ t('words.ignore') }}</el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="saving" @click="submit">
        {{ editing ? t('common.save') : t('words.create') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.list {
  display: grid;
  gap: 0.5rem;
  width: 100%;
}

.list-row {
  display: flex;
  gap: 0.5rem;
}

.list-row .el-button + .el-button {
  margin-left: 0;
}

.list > .el-button {
  justify-self: start;
}
</style>
