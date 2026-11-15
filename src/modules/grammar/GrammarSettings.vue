<script setup>
import { useI18n } from 'vue-i18n'

// вкладка «Грамматика» в настройках — пока пустая
const { t } = useI18n()
</script>

<template>
  <section class="card settings-section">
    <h3>{{ t('grammar.title') }}</h3>
    <p class="muted">{{ t('grammar.settings.soon') }}</p>
  </section>
</template>
