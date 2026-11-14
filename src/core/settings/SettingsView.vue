<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { librariesRepo } from '@/core/library/repo.js'
import { wipeDatabase } from '@/core/db.js'
import { useLibraryStore } from '@/core/library/store.js'
import { settingsSections, dataActions } from '@/core/modules.js'
import { SETTINGS_TABS } from '@/core/shell/nav.js'
import { CHANGELOG } from '@/core/changelog.js'
import { isEmail } from '@/core/translate/translate.js'
import { toast, confirm } from '@/shared/ui/feedback.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiInput from '@/shared/ui/UiInput.vue'
import UiSegmented from '@/shared/ui/UiSegmented.vue'
import { useSettingsForm } from './useSettingsForm.js'

// настройки по вкладкам (меню внизу — core/shell/AppNav):
// general — интерфейс, переводчик, удалить всё, о приложении; data — строки модулей (dataActions),
// сброс и очистка библиотеки; остальные вкладки — карточки модулей (поле settings в index.js)
const props = defineProps({
  tab: { type: String, default: 'general' },
})

const { t, locale } = useI18n()
const library       = useLibraryStore()
const form          = useSettingsForm(['locale', 'appearance', 'text_size', 'translate_email'])
const version       = __APP_VERSION__

const current  = computed(() => (SETTINGS_TABS.some(x => x.id === props.tab) ? props.tab : 'general'))
const sections = computed(() => settingsSections.filter(s => s.tab === current.value))

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

// дата без времени — в UTC, иначе западнее Гринвича покажется на день раньше
const formatDate = iso => new Date(iso).toLocaleDateString(locale.value, { timeZone: 'UTC' })

// «О приложении» — свёрнут, видна только версия
const aboutOpen = ref(false)
</script>

<template>
  <AppTopBar :title="t('settings.title')" :library="current === 'data'" />

  <div class="sections">
    <template v-if="current === 'general'">
      <section class="card settings-section">
        <h3>{{ t('settings.interface') }}</h3>
        <UiSegmented v-model="form.appearance" :label="t('settings.theme')" :options="APPEARANCE" />
        <UiSegmented v-model="form.text_size" :label="t('settings.textSize')" :options="TEXT_SIZES" />
        <UiSegmented v-model="form.locale" :label="t('settings.language')" :options="LOCALES" />
      </section>

      <section class="card settings-section">
        <h3>{{ t('settings.translator') }}</h3>
        <UiInput
            v-model.trim="form.translate_email"
            type="email"
            :label="t('settings.translateEmail')"
            :hint="t('settings.translateEmailHint')"
            :error="form.translate_email && !isEmail(form.translate_email) ? t('settings.translateEmailBad') : ''"
            placeholder="name@example.com"
            autocomplete="email"
        />
      </section>
    </template>

    <component :is="s.component" v-for="s in sections" :key="`${s.module}-${s.order}`" />

    <section v-if="current === 'data'" class="card settings-section">
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
    </section>

    <template v-if="current === 'general'">
      <section class="card settings-section">
        <div class="settings-action">
          <div class="grow">
            <div>{{ t('settings.wipeAll') }}</div>
            <div class="muted small">{{ t('settings.wipeAllHint') }}</div>
          </div>
          <UiButton variant="danger" @click="wipeAll">{{ t('settings.wipe') }}</UiButton>
        </div>
      </section>

      <section class="card settings-section">
        <button
            v-ripple
            type="button"
            class="about-head"
            :aria-expanded="aboutOpen"
            @click="aboutOpen = !aboutOpen"
        >
          <h3 class="grow">{{ t('settings.about') }}</h3>
          <span class="muted">WordApp {{ version }}</span>
          <AppIcon name="dropdown" class="chevron" :class="{ 'chevron--open': aboutOpen }" />
        </button>
        <template v-if="aboutOpen">
          <div v-for="v in CHANGELOG" :key="v.version" class="release">
            <div class="release-head"><b>{{ v.version }}</b> <span class="muted small">{{ formatDate(v.date) }}</span></div>
            <ul class="release-items small">
              <li v-for="item in v.items[locale] ?? v.items.ru" :key="item">{{ item }}</li>
            </ul>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>

<style scoped>
.sections {
  display: grid;
  gap: 0.75rem;
}

.danger { color: var(--error); }

.about-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin: -0.25rem 0;
  padding: 0.25rem 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
}
.chevron { transition: transform 0.2s; }
.chevron--open { transform: rotate(180deg); }

.release { display: grid; gap: 0.25rem; }
.release + .release { padding-top: 0.75rem; border-top: 1px solid var(--container-hi); }
.release-head { display: flex; align-items: baseline; gap: 0.5rem; }
.release-items { padding-left: 1.125rem; color: var(--muted); }
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
