<script setup>
import { shallowRef, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getText, isUserText } from './texts.js'
import { findText } from './content/index.js'
import { goBack } from '@/shared/utils/navigation.js'
import { needRefresh, applyUpdate } from '@/shared/utils/update.js'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiSpinner from '@/shared/ui/UiSpinner.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import BookView from './BookView.vue'

// открыть текст: с телефона или скачать; не скачался — «нужен интернет».
// Вышла новая версия — файлов старой на сайте уже нет: скачать можно только после обновления
const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const { t }  = useI18n()

// своя книга (user-…) в каталоге не значится — только на телефоне
const entry  = findText(props.id)
const own    = isUserText(props.id)
const text   = shallowRef(null)
const failed = ref(false)

if (!entry && !own) router.replace({ name: 'reading' })

onMounted(async () => {
  if (!entry && !own) return
  try {
    text.value = await getText(props.id)
    if (!text.value) router.replace({ name: 'reading' }) // свою книгу удалили
  } catch {
    failed.value = true
  }
})

function back() {
  goBack(router, entry ? { name: 'reading-topic', params: { topic: entry.topic } } : { name: 'reading-mine' })
}

// неудачный import() браузер запоминает до перезагрузки — повтор только так
function retry() {
  location.reload()
}
</script>

<template>
  <BookView v-if="text" :text="text" />

  <div v-else-if="entry || own" class="loading">
    <header class="loading-top">
      <UiIconButton icon="back" :label="t('common.back')" @click="back" />
      <h2 class="loading-title">{{ entry?.title }}</h2>
    </header>
    <UiEmpty v-if="failed && needRefresh" icon="cloud-off" :title="t('reading.needUpdate')">
      <UiButton icon="refresh" @click="applyUpdate">{{ t('reading.update') }}</UiButton>
    </UiEmpty>
    <UiEmpty v-else-if="failed" icon="cloud-off" :title="t('reading.offline')">
      <UiButton icon="refresh" @click="retry">{{ t('reading.retry') }}</UiButton>
    </UiEmpty>
    <UiSpinner v-else />
  </div>
</template>

<style scoped>
.loading-top {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0 -0.5rem;
  padding: 0.5rem 0 0;
}
.loading-title {
  font-size: 1.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
