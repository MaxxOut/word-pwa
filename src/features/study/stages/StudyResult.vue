<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { icon } from '../../../shared/utils/icons.js'

const props = defineProps({
  words:     { type: Array,   required: true },
  failedIds: { type: Object,  required: true }, // Set
  saving:    { type: Boolean, default: false },
})

defineEmits(['toggle', 'complete', 'exit'])

const { t } = useI18n()

const learnedCount = computed(() =>
  props.words.filter(w => !props.failedIds.has(w.id)).length,
)
</script>

<template>
  <div>
    <div class="stage-header">
      <div class="stage-title">
        <el-button :icon="icon('back')" @click="$emit('exit')" />
        <h2>{{ t('result.title') }}</h2>
      </div>
      <el-button type="primary" :loading="saving" @click="$emit('complete')">
        {{ t('result.save') }}
      </el-button>
    </div>

    <el-alert
        :title="t('result.learned', { n: learnedCount, total: words.length })"
        :type="learnedCount === words.length ? 'success' : 'warning'"
        show-icon
        :closable="false"
        class="summary"
    />

    <el-table :data="words" border stripe class="table">
      <el-table-column prop="word" :label="t('words.word')" />
      <el-table-column :label="t('words.translation')">
        <template #default="{ row }">
          {{ row.translation?.join(', ') || '—' }}
        </template>
      </el-table-column>
      <el-table-column :label="t('result.errors')" width="130">
        <template #default="{ row }">
          <el-tag v-if="row.has_error" type="danger" size="small">{{ t('result.hadErrors') }}</el-tag>
          <el-tag v-else type="success" size="small">{{ t('result.clean') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('result.result')" width="220">
        <template #default="{ row }">
          <el-switch
              :model-value="!failedIds.has(row.id)"
              :active-text="t('status.learned')"
              :inactive-text="t('result.again')"
              @change="$emit('toggle', row.id)"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.summary { margin-bottom: 1rem; }
.table   { width: 100%; }
</style>
