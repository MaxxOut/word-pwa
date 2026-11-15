<script setup>
import { useI18n } from 'vue-i18n'
import { useSettingsForm } from '@/core/settings/useSettingsForm.js'
import UiStepper from '@/shared/ui/UiStepper.vue'

// вкладка «Грамматика» в настройках
const { t } = useI18n()
const form  = useSettingsForm(['grammar'])
</script>

<template>
  <section class="card settings-section">
    <h3>{{ t('grammar.title') }}</h3>
    <UiStepper
        v-model="form.grammar.repeat_days"
        :label="t('grammar.settings.repeatDays')"
        :hint="t('grammar.settings.repeatDaysHint', { n: form.grammar.repeat_days })"
        :min="1"
        :max="30"
    />
  </section>
</template>
