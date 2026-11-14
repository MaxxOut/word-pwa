<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { wordStats } from '@/core/words/domain.js'
import UiButton from '@/shared/ui/UiButton.vue'

const props = defineProps({ words: { type: Array, required: true } })

const router = useRouter()
const { t }  = useI18n()

const count = computed(() => wordStats(props.words).new)
</script>

<template>
  <section v-if="words.length" class="tile tile--hero learn">
    <div class="tile-label">{{ t('study.home.newWords') }}</div>
    <div class="num tile-value">{{ count }}</div>
    <UiButton variant="filled" :disabled="!count" @click="router.push({ name: 'study' })">
      {{ t('study.home.study') }}
    </UiButton>
  </section>
</template>

<style scoped>
.learn { background: var(--primary-c); color: var(--on-primary-c); }
.learn .tile-label { color: inherit; opacity: 0.8; }
</style>
