<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { libraries as librariesRepo, maintenance } from '../../data/index.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useLibraryStore } from '../../stores/library.js'
import { STAGES } from '../study/stages.js'

const { t }         = useI18n()
const settingsStore = useSettingsStore()
const library       = useLibraryStore()
const saving        = ref(false)

const version = __APP_VERSION__

const form = ref(null)

watch(
  () => settingsStore.settings,
  (val) => {
    form.value = {
      locale:   val.locale ?? 'auto', // в el-select null не выбирается
      learning: { ...val.learning },
      repeat:   { ...val.repeat },
      stages:   { ...val.stages },
    }
  },
  { immediate: true },
)

async function save() {
  saving.value = true
  try {
    await settingsStore.update({
      ...form.value,
      locale: form.value.locale === 'auto' ? null : form.value.locale,
    })
    ElMessage.success(t('settings.saved'))
  } catch {
    ElMessage.error(t('errors.save'))
  } finally {
    saving.value = false
  }
}

// подтверждение для необратимых действий
async function confirmDanger(message) {
  try {
    await ElMessageBox.confirm(message, t('common.confirm'), {
      confirmButtonText:  t('common.yes'),
      cancelButtonText:   t('common.no'),
      confirmButtonClass: 'el-button--danger',
      type: 'warning',
    })
    return true
  } catch {
    return false
  }
}

async function resetProgress() {
  const lib = library.current
  if (!await confirmDanger(t('settings.resetProgressConfirm', { lib: lib.short_name }))) return
  await librariesRepo.resetProgress(lib.id)
  ElMessage.success(t('settings.done'))
}

async function clearLibrary() {
  const lib = library.current
  if (!await confirmDanger(t('settings.clearLibraryConfirm', { lib: lib.short_name }))) return
  await librariesRepo.clear(lib.id)
  await library.load()
  ElMessage.success(t('settings.done'))
}

async function wipeAll() {
  if (!await confirmDanger(t('settings.wipeAllConfirm'))) return
  await maintenance.wipeAll()
  try { localStorage.clear() } catch {}
  location.reload()
}
</script>

<template>
  <div class="settings">
    <h2>{{ t('settings.title') }}</h2>

    <el-card shadow="never">
      <template #header>{{ t('settings.interface') }}</template>
      <el-form label-position="top">
        <el-form-item :label="t('settings.language')">
          <el-select v-model="form.locale" class="select">
            <el-option value="auto" :label="t('settings.languageAuto')" />
            <el-option value="ru" label="Русский" />
            <el-option value="uk" label="Українська" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>{{ t('settings.learning') }}</template>
      <el-form label-position="top">
        <el-form-item :label="t('settings.wordsPerSession')">
          <el-input-number v-model="form.learning.words_per_session" :min="1" :max="10" />
          <span class="hint">{{ t('settings.range', { min: 1, max: 10 }) }}</span>
        </el-form-item>
        <el-form-item :label="t('settings.extraLetters')">
          <el-input-number v-model="form.learning.extra_letters" :min="0" :max="5" />
          <span class="hint">{{ t('settings.extraLettersHint') }}</span>
        </el-form-item>
        <el-form-item :label="t('settings.stages')">
          <div class="stages">
            <el-checkbox v-for="s in STAGES" :key="s.key" v-model="form.stages[s.key]">
              {{ t(s.title) }}
            </el-checkbox>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>{{ t('settings.repeat') }}</template>
      <el-form label-position="top">
        <el-form-item :label="t('settings.wordsPerSession')">
          <el-input-number v-model="form.repeat.words_per_session" :min="4" :max="20" />
          <span class="hint">{{ t('settings.range', { min: 4, max: 20 }) }}</span>
        </el-form-item>
        <el-form-item :label="t('settings.daysAfterLearning')">
          <el-input-number v-model="form.repeat.days_after_learning" :min="1" :max="30" />
          <span class="hint">{{ t('settings.daysAfterLearningHint', { n: form.repeat.days_after_learning }) }}</span>
        </el-form-item>
        <el-form-item :label="t('settings.daysAfterRepeat')">
          <el-input-number v-model="form.repeat.days_after_repeat" :min="1" :max="60" />
          <span class="hint">{{ t('settings.daysAfterRepeatHint', { n: form.repeat.days_after_repeat }) }}</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-button type="primary" :loading="saving" class="save" @click="save">
      {{ t('common.save') }}
    </el-button>

    <el-card shadow="never">
      <template #header>{{ t('settings.data') }}</template>
      <div class="danger-list">
        <div class="danger-row">
          <div>
            <div>{{ t('settings.resetProgress', { lib: library.current?.short_name }) }}</div>
            <div class="hint">{{ t('settings.resetProgressHint') }}</div>
          </div>
          <el-button @click="resetProgress">{{ t('settings.reset') }}</el-button>
        </div>
        <div class="danger-row">
          <div>
            <div>{{ t('settings.clearLibrary', { lib: library.current?.short_name }) }}</div>
            <div class="hint">{{ t('settings.clearLibraryHint') }}</div>
          </div>
          <el-button type="danger" plain @click="clearLibrary">{{ t('settings.clear') }}</el-button>
        </div>
        <div class="danger-row">
          <div>
            <div>{{ t('settings.wipeAll') }}</div>
            <div class="hint">{{ t('settings.wipeAllHint') }}</div>
          </div>
          <el-button type="danger" @click="wipeAll">{{ t('settings.wipe') }}</el-button>
        </div>
      </div>
    </el-card>

    <div class="version">WordApp {{ version }}</div>
  </div>
</template>

<style scoped>
.settings {
  max-width: 600px;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
}

.settings h2 {
  font-size: 1.5rem;
}

.select {
  width: 14rem;
}

.hint {
  margin-left: 0.75rem;
  font-size: 0.8125rem;
  color: var(--el-text-color-secondary);
}

.danger-row .hint {
  margin-left: 0;
}

.stages {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1rem;
}

.save {
  justify-self: start;
}

.danger-list {
  display: grid;
  gap: 1rem;
}

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.version {
  text-align: center;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}
</style>
