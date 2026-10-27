<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { libraries as librariesRepo, words as wordsRepo, maintenance } from '../../data/index.js'
import { stringifyWordsCsv } from '../../domain/csv.js'
import { STATUS, wordStatus } from '../../domain/words.js'
import { downloadText } from '../../shared/utils/browser.js'
import { useSettingsStore } from '../../stores/settings.js'
import { useLibraryStore } from '../../stores/library.js'
import { toast, confirm } from '../../shared/ui/feedback.js'
import { STAGES, REPEAT_STAGES } from '../study/stages.js'
import AppTopBar from '../../shared/components/AppTopBar.vue'
import ImportDialog from '../words/ImportDialog.vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiSegmented from '../../shared/ui/UiSegmented.vue'
import UiStepper from '../../shared/ui/UiStepper.vue'
import UiSwitch from '../../shared/ui/UiSwitch.vue'

const { t }         = useI18n()
const settingsStore = useSettingsStore()
const library       = useLibraryStore()

const version = __APP_VERSION__

// копия для полей; изменения сохраняются сами
const form = ref(null)

function fill(val) {
  form.value = {
    locale:     val.locale,
    appearance: val.appearance,
    text_size:  val.text_size,
    learning:   { ...val.learning },
    repeat:     { ...val.repeat },
    stages:     { ...val.stages },
    repeat_stages: { ...val.repeat_stages },
  }
}
fill(settingsStore.settings)

let saveTimer = null
watch(form, value => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      await settingsStore.update(value)
    } catch {
      toast.error(t('errors.save'))
    }
  }, 300)
}, { deep: true })

const APPEARANCE = computed(() => [
  { value: 'light',  label: t('settings.light'), icon: 'light' },
  { value: 'dark',   label: t('settings.dark'), icon: 'dark' },
  { value: 'system', label: t('settings.system'), icon: 'system' },
])

const TEXT_SIZES = [
  { value: 's',  label: 'S' },
  { value: 'm',  label: 'M' },
  { value: 'l',  label: 'L' },
  { value: 'xl', label: 'XL' },
]

const LOCALES = computed(() => [
  { value: null, label: t('settings.languageAuto') },
  { value: 'ru', label: 'RU' },
  { value: 'uk', label: 'UA' },
])

const libName = computed(() => library.current?.short_name)

const importDialog = ref(null)

// экспорт = резервная копия библиотеки с прогрессом
async function exportWords() {
  const id  = library.current.id
  const all = await wordsRepo.all(id)
  all.sort((a, b) => a.word.localeCompare(b.word))
  downloadText(`words_${id}_${new Date().toISOString().slice(0, 10)}.csv`, stringifyWordsCsv(all))
}

// слова без перевода — отдать ИИ заполнить и импортировать обратно с заменой
async function exportUntranslated() {
  const id   = library.current.id
  const list = (await wordsRepo.all(id)).filter(w => wordStatus(w) === STATUS.UNTRANSLATED)
  if (!list.length) return toast(t('settings.noUntranslated'))
  list.sort((a, b) => a.word.localeCompare(b.word))
  downloadText(
    `untranslated_${id}_${new Date().toISOString().slice(0, 10)}.csv`,
    stringifyWordsCsv(list, { progress: false }),
  )
}

async function resetProgress() {
  const lib = library.current
  const ok  = await confirm({
    message:     t('settings.resetProgressConfirm', { lib: lib.short_name }),
    confirmText: t('settings.reset'),
    danger:      true,
  })
  if (!ok) return
  await librariesRepo.resetProgress(lib.id)
  toast.success(t('settings.done'))
}

async function clearLibrary() {
  const lib = library.current
  const ok  = await confirm({
    message:     t('settings.clearLibraryConfirm', { lib: lib.short_name }),
    confirmText: t('settings.clear'),
    danger:      true,
  })
  if (!ok) return
  await librariesRepo.clear(lib.id)
  await library.load()
  toast.success(t('settings.done'))
}

async function wipeAll() {
  const ok = await confirm({
    message:     t('settings.wipeAllConfirm'),
    confirmText: t('settings.wipe'),
    danger:      true,
  })
  if (!ok) return
  await maintenance.wipeAll()
  try { localStorage.clear() } catch {}
  location.reload()
}
</script>

<template>
  <AppTopBar :title="t('settings.title')" :library="false" />

  <div class="sections">
    <section class="card section">
      <h3>{{ t('settings.interface') }}</h3>
      <UiSegmented v-model="form.appearance" :label="t('settings.theme')" :options="APPEARANCE" />
      <UiSegmented v-model="form.text_size" :label="t('settings.textSize')" :options="TEXT_SIZES" />
      <UiSegmented v-model="form.locale" :label="t('settings.language')" :options="LOCALES" />
    </section>

    <section class="card section">
      <h3>{{ t('settings.learning') }}</h3>
      <UiStepper
          v-model="form.learning.words_per_session"
          :label="t('settings.wordsPerSession')"
          :min="1"
          :max="10"
      />
      <UiStepper
          v-model="form.learning.extra_letters"
          :label="t('settings.extraLetters')"
          :hint="t('settings.extraLettersHint')"
          :min="0"
          :max="5"
      />
      <h4 class="sub">{{ t('settings.stages') }}</h4>
      <UiSwitch v-for="s in STAGES" :key="s.key" v-model="form.stages[s.key]" :label="t(s.title)" />
    </section>

    <section class="card section">
      <h3>{{ t('settings.repeat') }}</h3>
      <UiStepper
          v-model="form.repeat.words_per_session"
          :label="t('settings.wordsPerSession')"
          :min="4"
          :max="20"
      />
      <UiStepper
          v-model="form.repeat.days_after_learning"
          :label="t('settings.daysAfterLearning')"
          :hint="t('settings.daysAfterLearningHint', { n: form.repeat.days_after_learning })"
          :min="1"
          :max="30"
      />
      <UiStepper
          v-model="form.repeat.days_after_repeat"
          :label="t('settings.daysAfterRepeat')"
          :hint="t('settings.daysAfterRepeatHint', { n: form.repeat.days_after_repeat })"
          :min="1"
          :max="60"
      />
      <UiStepper
          v-model="form.repeat.days_known"
          :label="t('settings.daysKnown')"
          :hint="t('settings.daysKnownHint', { n: form.repeat.days_known })"
          :min="5"
          :max="90"
          :step="5"
      />
      <h4 class="sub">{{ t('settings.stages') }}</h4>
      <UiSwitch
          v-for="s in REPEAT_STAGES"
          :key="s.key"
          v-model="form.repeat_stages[s.key]"
          :label="t(s.title)"
      />
    </section>

    <section class="card section">
      <h3>{{ t('settings.data') }}</h3>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.importWords', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.importHint') }}</div>
        </div>
        <UiButton variant="outlined" icon="import" @click="importDialog.open()">{{ t('words.import') }}</UiButton>
      </div>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.exportWords', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.exportHint') }}</div>
        </div>
        <UiButton
            variant="outlined"
            icon="export"
            :disabled="!library.current?.words_count"
            @click="exportWords"
        >
          {{ t('words.export') }}
        </UiButton>
      </div>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.exportUntranslated', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.exportUntranslatedHint') }}</div>
        </div>
        <UiButton
            variant="outlined"
            icon="export"
            :disabled="!library.current?.words_count"
            @click="exportUntranslated"
        >
          {{ t('words.export') }}
        </UiButton>
      </div>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.resetProgress', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.resetProgressHint') }}</div>
        </div>
        <UiButton variant="outlined" @click="resetProgress">{{ t('settings.reset') }}</UiButton>
      </div>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.clearLibrary', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.clearLibraryHint') }}</div>
        </div>
        <UiButton variant="outlined" class="danger" @click="clearLibrary">{{ t('settings.clear') }}</UiButton>
      </div>
      <div class="action">
        <div class="grow">
          <div>{{ t('settings.wipeAll') }}</div>
          <div class="muted small">{{ t('settings.wipeAllHint') }}</div>
        </div>
        <UiButton variant="danger" @click="wipeAll">{{ t('settings.wipe') }}</UiButton>
      </div>
    </section>

    <p class="version muted small">WordApp {{ version }}</p>
  </div>

  <ImportDialog ref="importDialog" :library-id="library.current?.id" @imported="library.load()" />
</template>

<style scoped>
.sections {
  display: grid;
  gap: 0.75rem;
}

.section {
  display: grid;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 1rem 1.125rem;
}

.sub {
  margin-top: 0.5rem;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 700;
}

.action {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.action + .action {
  padding-top: 0.75rem;
  border-top: 1px solid var(--container-hi);
}

.danger { color: var(--error); }

.version { text-align: center; }
</style>
