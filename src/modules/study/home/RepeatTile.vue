<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/core/settings/store.js'
import UiButton from '@/shared/ui/UiButton.vue'
import { dueCount } from '../domain.js'

const props = defineProps({ words: { type: Array, required: true } })

const router        = useRouter()
const { t }         = useI18n()
const settingsStore = useSettingsStore()

const count = computed(() => dueCount(props.words, settingsStore.settings.repeat))
</script>

<template>
  <section v-if="words.length" class="tile tile--hero repeat">
    <div class="tile-label">{{ t('study.home.due') }}</div>
    <div class="num tile-value">{{ count }}</div>
    <UiButton variant="outlined" :disabled="!count" @click="router.push({ name: 'repeat' })">
      {{ t('study.home.repeat') }}
    </UiButton>
  </section>
</template>

<style scoped>
.repeat { background: var(--container-hi); }
</style>
