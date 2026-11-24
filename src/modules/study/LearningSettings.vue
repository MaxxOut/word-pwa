<script setup>
import { useI18n } from 'vue-i18n'
import { useSettingsForm } from '@/core/settings/useSettingsForm.js'
import UiStepper from '@/shared/ui/UiStepper.vue'
import UiSwitch from '@/shared/ui/UiSwitch.vue'
import { canSpeak } from '@/shared/utils/browser.js'
import { STAGES } from './stages.js'

const { t } = useI18n()
const form  = useSettingsForm(['learning', 'stages', 'speech'])
</script>

<template>
  <section class="card settings-section">
    <h3>{{ t('study.settings.learning') }}</h3>
    <UiStepper
        v-model="form.learning.words_per_session"
        :label="t('study.settings.wordsPerSession')"
        :min="1"
        :max="10"
    />
    <UiStepper
        v-model="form.learning.extra_letters"
        :label="t('study.settings.extraLetters')"
        :hint="t('study.settings.extraLettersHint')"
        :min="0"
        :max="5"
    />
    <UiStepper
        v-model="form.learning.choices"
        :label="t('study.settings.choices')"
        :hint="t('study.settings.choicesHint')"
        :min="4"
        :max="8"
    />
    <h4 class="settings-sub">{{ t('study.settings.stages') }}</h4>
    <UiSwitch v-for="s in STAGES" :key="s.key" v-model="form.stages[s.key]" :label="t(s.title)" />
    <template v-if="canSpeak()">
      <h4 class="settings-sub">{{ t('study.settings.speech') }}</h4>
      <UiSwitch v-model="form.speech.auto" :label="t('study.settings.autoSpeak')" :hint="t('study.settings.autoSpeakHint')" />
    </template>
  </section>
</template>
