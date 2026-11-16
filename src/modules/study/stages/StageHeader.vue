<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/core/settings/store.js'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiProgress from '@/shared/ui/UiProgress.vue'
import { canSpeak } from '@/shared/utils/browser.js'
import { useAutoSpeak } from './autoSpeak.js'

// шапка занятия: закрыть, заголовок, счётчик, полоса прогресса; под ней — тема и автоозвучка
defineProps({
  title:    { type: String, required: true },
  counter:  { type: String, default: '' },
  progress: { type: Number, default: null }, // 0–100, null — без полосы
  sound:    { type: Boolean, default: false }, // кнопки темы и автоозвучки — в этапах со словами
})

defineEmits(['exit'])

const { t } = useI18n()
const autoSpeak = useAutoSpeak()
const settingsStore = useSettingsStore()

// тема «как в системе» переключается на противоположную той, что сейчас видна
const dark = computed(() => {
  const theme = settingsStore.settings.appearance
  return theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
})

function toggleTheme() {
  settingsStore.update({ appearance: dark.value ? 'light' : 'dark' })
}
</script>

<template>
  <header class="stage-top sticky-top">
    <div class="stage-row">
      <UiIconButton icon="close" :label="t('study.exit')" @click="$emit('exit')" />
      <h2 class="grow">{{ title }}</h2>
      <span v-if="counter" class="num counter">{{ counter }}</span>
      <slot />
    </div>
    <UiProgress v-if="progress !== null" :value="progress" />
    <div v-if="sound" class="stage-tools">
      <UiIconButton
          :icon="dark ? 'light' : 'dark'"
          :label="t(dark ? 'study.theme.light' : 'study.theme.dark')"
          @click="toggleTheme"
      />
      <UiIconButton
          v-if="canSpeak()"
          :icon="autoSpeak.on.value ? 'speak' : 'mute'"
          :label="t(autoSpeak.on.value ? 'study.sound.off' : 'study.sound.on')"
          @click="autoSpeak.toggle()"
      />
    </div>
  </header>
</template>

<style scoped>
.stage-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  gap: 0.5rem;
  margin: 0 -1rem 0.5rem;
  padding: 0.5rem 1rem 0.75rem;
  background: var(--bg);
}

.stage-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: -0.5rem;
}

.stage-tools {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin: -0.25rem -0.5rem -0.5rem 0;
}

h2 {
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.counter {
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  font-size: 0.875rem;
}
</style>
