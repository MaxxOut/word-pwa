<script setup>
import { useI18n } from 'vue-i18n'
import { installPrompt, installed, install, isIos } from '../../shared/utils/install.js'
import AppLogo from '../../shared/components/AppLogo.vue'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiButton from '../../shared/ui/UiButton.vue'

// вместо приложения во вкладке браузера: кнопка установки или инструкция
const { t } = useI18n()
</script>

<template>
  <main class="install">
    <AppLogo size="4.5rem" />
    <h1>WordApp</h1>
    <p class="muted">{{ t('install.text') }}</p>

    <div v-if="installed" class="card step">
      <AppIcon name="check" />
      <span>{{ t('install.done') }}</span>
    </div>

    <UiButton v-else-if="installPrompt" variant="filled" icon="export" @click="install">
      {{ t('install.button') }}
    </UiButton>

    <ol v-else-if="isIos" class="card steps">
      <li>{{ t('install.ios1') }}</li>
      <li>
        <i18n-t keypath="install.ios2" tag="span">
          <template #icon><AppIcon name="share" size="1.25rem" class="inline-icon" /></template>
        </i18n-t>
      </li>
      <li>{{ t('install.ios3') }}</li>
      <li>{{ t('install.ios4') }}</li>
    </ol>

    <ol v-else class="card steps">
      <li>
        <i18n-t keypath="install.other1" tag="span">
          <template #icon><AppIcon name="more" size="1.25rem" class="inline-icon" /></template>
        </i18n-t>
      </li>
      <li>{{ t('install.other2') }}</li>
    </ol>

    <p v-if="!installed" class="muted small">{{ t('install.already') }}</p>
  </main>
</template>

<style scoped>
.install {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 1rem;
  min-height: 100dvh;
  max-width: 26rem;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top) + 2rem) 1.5rem calc(env(safe-area-inset-bottom) + 2rem);
  text-align: center;
}

.steps {
  display: grid;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem 1rem 2.5rem;
  border-radius: 0.5rem;
  text-align: left;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  text-align: left;
}

.inline-icon { vertical-align: -0.25rem; }
</style>
