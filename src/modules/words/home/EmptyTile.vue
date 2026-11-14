<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiButton from '@/shared/ui/UiButton.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'

// пустая библиотека — вместо плиток приглашение добавить слова
defineProps({ words: { type: Array, required: true } })

const router = useRouter()
const { t }  = useI18n()
</script>

<template>
  <UiEmpty v-if="!words.length" class="home-empty" :title="t('words.home.empty')" :text="t('words.home.emptyHint')">
    <UiButton variant="filled" icon="add" @click="router.push({ name: 'words' })">
      {{ t('word.addWords') }}
    </UiButton>
  </UiEmpty>
</template>
