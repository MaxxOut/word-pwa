<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { icon } from '../../../shared/utils/icons.js'

const props = defineProps({
  newWords:        { type: Array,   required: true },
  loading:         { type: Boolean, default: false },
  wordsPerSession: { type: Number,  required: true },
})

defineEmits(['start', 'exit'])

const { t }    = useI18n()
const router   = useRouter()
const selected = ref([])

function toggle(id) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) {
    if (selected.value.length < props.wordsPerSession) selected.value.push(id)
  } else {
    selected.value.splice(idx, 1)
  }
}
</script>

<template>
  <div>
    <div class="stage-header">
      <div class="stage-title">
        <el-button :icon="icon('back')" @click="$emit('exit')" />
        <h2>{{ t('study.selectTitle') }}</h2>
      </div>
      <el-button
          type="primary"
          :disabled="selected.length < wordsPerSession"
          @click="$emit('start', selected)"
      >
        {{ t('study.start', { selected: selected.length, total: wordsPerSession }) }}
      </el-button>
    </div>

    <div v-if="loading" v-loading="true" class="loading" />

    <el-empty v-else-if="newWords.length < wordsPerSession" :description="t('study.notEnough', { n: wordsPerSession })">
      <el-button type="primary" @click="router.push({ name: 'words' })">{{ t('home.addWords') }}</el-button>
    </el-empty>

    <div v-else>
      <el-alert
          :title="t('study.selectHint', { n: wordsPerSession })"
          type="info"
          show-icon
          :closable="false"
          class="hint"
      />

      <el-table :data="newWords" border stripe class="table" @row-click="row => toggle(row.id)">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox
                :model-value="selected.includes(row.id)"
                :disabled="!selected.includes(row.id) && selected.length >= wordsPerSession"
                @click.stop
                @change="toggle(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="word" :label="t('words.word')" />
        <el-table-column :label="t('words.translation')">
          <template #default="{ row }">
            {{ row.translation?.join(', ') || '—' }}
          </template>
        </el-table-column>
        <el-table-column :label="t('words.transcription')" width="150">
          <template #default="{ row }">
            {{ row.transcription || '—' }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.loading { height: 200px; }
.hint    { margin-bottom: 1rem; }
.table   { width: 100%; }
</style>
