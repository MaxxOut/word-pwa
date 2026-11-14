<script setup>
import { useI18n } from 'vue-i18n'
import { useSettingsForm } from '@/core/settings/useSettingsForm.js'
import UiStepper from '@/shared/ui/UiStepper.vue'
import UiSwitch from '@/shared/ui/UiSwitch.vue'
import { REPEAT_STAGES } from './stages.js'

const { t } = useI18n()
const form  = useSettingsForm(['repeat', 'repeat_stages'])
</script>

<template>
  <section class="card settings-section">
    <h3>{{ t('study.settings.repeat') }}</h3>
    <UiStepper
        v-model="form.repeat.words_per_session"
        :label="t('study.settings.wordsPerSession')"
        :min="4"
        :max="20"
    />
    <UiStepper
        v-model="form.repeat.days_after_learning"
        :label="t('study.settings.daysAfterLearning')"
        :hint="t('study.settings.daysAfterLearningHint', { n: form.repeat.days_after_learning })"
        :min="1"
        :max="30"
    />
    <UiStepper
        v-model="form.repeat.days_after_repeat"
        :label="t('study.settings.daysAfterRepeat')"
        :hint="t('study.settings.daysAfterRepeatHint', { n: form.repeat.days_after_repeat })"
        :min="1"
        :max="60"
    />
    <UiStepper
        v-model="form.repeat.days_known"
        :label="t('study.settings.daysKnown')"
        :hint="t('study.settings.daysKnownHint', { n: form.repeat.days_known })"
        :min="5"
        :max="90"
        :step="5"
    />
    <h4 class="settings-sub">{{ t('study.settings.stages') }}</h4>
    <UiSwitch
        v-for="s in REPEAT_STAGES"
        :key="s.key"
        v-model="form.repeat_stages[s.key]"
        :label="t(s.title)"
    />
  </section>
</template>
