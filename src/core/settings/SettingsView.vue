<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { librariesRepo } from '@/core/library/repo.js'
import { wipeDatabase } from '@/core/db.js'
import { useLibraryStore } from '@/core/library/store.js'
import { settingsSections, dataActions } from '@/core/modules.js'
import { toast, confirm } from '@/shared/ui/feedback.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiSegmented from '@/shared/ui/UiSegmented.vue'
import { useSettingsForm } from './useSettingsForm.js'

// карточки модулей (поле settings) — между «Интерфейсом» и «Данными»;
// строки модулей в «Данных» (поле dataActions) — перед сбросом и очисткой
const { t }   = useI18n()
const library = useLibraryStore()
const form    = useSettingsForm(['locale', 'appearance', 'text_size'])
const version = __APP_VERSION__

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
  await wipeDatabase()
  try { localStorage.clear() } catch {}
  location.reload()
}
</script>

<template>
  <AppTopBar :title="t('settings.title')" :library="false" />

  <div class="sections">
    <section class="card settings-section">
      <h3>{{ t('settings.interface') }}</h3>
      <UiSegmented v-model="form.appearance" :label="t('settings.theme')" :options="APPEARANCE" />
      <UiSegmented v-model="form.text_size" :label="t('settings.textSize')" :options="TEXT_SIZES" />
      <UiSegmented v-model="form.locale" :label="t('settings.language')" :options="LOCALES" />
    </section>

    <component :is="s.component" v-for="s in settingsSections" :key="`${s.module}-${s.order}`" />

    <section class="card settings-section">
      <h3>{{ t('settings.data') }}</h3>
      <component :is="a.component" v-for="a in dataActions" :key="`${a.module}-${a.order}`" />
      <div class="settings-action">
        <div class="grow">
          <div>{{ t('settings.resetProgress', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.resetProgressHint') }}</div>
        </div>
        <UiButton variant="outlined" @click="resetProgress">{{ t('settings.reset') }}</UiButton>
      </div>
      <div class="settings-action">
        <div class="grow">
          <div>{{ t('settings.clearLibrary', { lib: libName }) }}</div>
          <div class="muted small">{{ t('settings.clearLibraryHint') }}</div>
        </div>
        <UiButton variant="outlined" class="danger" @click="clearLibrary">{{ t('settings.clear') }}</UiButton>
      </div>
      <div class="settings-action">
        <div class="grow">
          <div>{{ t('settings.wipeAll') }}</div>
          <div class="muted small">{{ t('settings.wipeAllHint') }}</div>
        </div>
        <UiButton variant="danger" @click="wipeAll">{{ t('settings.wipe') }}</UiButton>
      </div>
    </section>

    <p class="version muted small">WordApp {{ version }}</p>
  </div>
</template>

<style scoped>
.sections {
  display: grid;
  gap: 0.75rem;
}

.danger { color: var(--error); }

.version { text-align: center; }
</style>

<style>
/* общий вид карточек настроек — ими пользуются карточки и строки модулей */
.settings-section {
  display: grid;
  gap: 0.75rem;
  border-radius: 0.5rem;
  padding: 1rem 1.125rem;
}

.settings-sub {
  margin-top: 0.5rem;
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 700;
}

.settings-action {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.settings-action + .settings-action {
  padding-top: 0.75rem;
  border-top: 1px solid var(--container-hi);
}
</style>
