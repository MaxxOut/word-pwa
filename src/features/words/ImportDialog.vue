<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { words as wordsRepo } from '../../data/index.js'
import { parseWordsCsv } from '../../domain/csv.js'

const props = defineProps({
  libraryId: { type: String, default: null },
})

const emit = defineEmits(['imported'])

const { t } = useI18n()

const visible   = ref(false)
const loading   = ref(false)
const strategy  = ref('skip')
const file      = ref(null)
const result    = ref(null)
const uploadRef = ref(null)

function open() {
  visible.value = true
}

function reset() {
  file.value     = null
  result.value   = null
  strategy.value = 'skip'
  uploadRef.value?.clearFiles()
}

async function submit() {
  if (!file.value) return

  loading.value = true
  try {
    const rows = parseWordsCsv(await file.value.text())
    if (!rows.length) {
      ElMessage.warning(t('import.noRows'))
      return
    }
    result.value = await wordsRepo.import(props.libraryId, rows, strategy.value)
    ElMessage.success(t('import.done', { n: result.value.imported }))
    emit('imported')
  } catch {
    ElMessage.error(t('import.failed'))
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <el-dialog
      v-model="visible"
      :title="t('import.title')"
      width="min(480px, 95vw)"
      @closed="reset"
  >
    <el-form label-position="top">
      <el-form-item :label="t('import.file')">
        <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".csv,.txt"
            :on-change="f => (file = f.raw)"
            :on-remove="() => (file = null)"
        >
          <el-button>{{ t('import.choose') }}</el-button>
          <template #tip>
            <div class="tip">{{ t('import.format') }}</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item :label="t('import.duplicates')">
        <el-radio-group v-model="strategy">
          <el-radio value="skip">{{ t('import.skip') }}</el-radio>
          <el-radio value="replace">{{ t('import.replace') }}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <el-alert
        v-if="result"
        :title="t('import.result', result)"
        type="success"
        show-icon
        :closable="false"
    />

    <template #footer>
      <el-button @click="visible = false">{{ t('common.close') }}</el-button>
      <el-button type="primary" :loading="loading" :disabled="!file" @click="submit">
        {{ t('import.submit') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.tip {
  color: var(--el-text-color-secondary);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}
</style>
