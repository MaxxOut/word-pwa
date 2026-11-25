<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { readingRepo } from './repo.js'
import { userTextsOf, removeUserText } from './texts.js'
import { useLibraryStore } from '@/core/library/store.js'
import { confirm, toast } from '@/shared/ui/feedback.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'
import UiSheet from '@/shared/ui/UiSheet.vue'
import AddTextSheet from './AddTextSheet.vue'
import { keepShared, takeShared } from './share.js'

// внешние книги: свои тексты пользователя — только на телефоне, без уровня и темы, своим цветом.
// share — открыли через «Поделиться» (?title=&text=&url=): сразу шторка с этим текстом
const props = defineProps({
  share: { type: Boolean, default: false },
})

const route   = useRoute()
const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()

const texts    = ref([])
const progress = ref(new Map())
const sheet    = ref(null)
const howTo    = ref(false) // подсказка «Как добавить книгу»

async function load() {
  if (!library.current) return
  const id = library.current.id
  const [list, stages] = await Promise.all([userTextsOf(id), readingRepo.stages(id)])
  texts.value    = list
  progress.value = stages
}
watch(() => library.current?.id, load, { immediate: true })

// экран с другим маршрутом — новый экземпляр (ключ экрана — имя маршрута): шторку открывает уже он.
// Адрес «Поделиться» убираем — «Назад» и повторный запуск не откроют её снова
onMounted(() => {
  if (props.share) {
    const { title, text, url } = route.query
    keepShared({ title, text, url })
    router.replace({ name: 'reading-mine' })
    return
  }
  const shared = takeShared()
  if (shared) sheet.value.open(shared)
})

function statusOf(text) {
  const p = progress.value.get(text.id)
  return { kind: p?.stage ?? 'new', percent: p?.percent ?? 0 }
}

async function remove(text) {
  if (!await confirm({ message: t('reading.mine.removeConfirm', { title: text.title }), confirmText: t('common.delete'), danger: true })) return
  await removeUserText(text.id)
  toast(t('reading.removed', { n: 1 }))
  load()
}
</script>

<template>
  <AppTopBar :title="t('reading.mine.section')" :back="{ name: 'reading' }" :library="false">
    <UiIconButton icon="info" :label="t('reading.mine.howTo')" @click="howTo = true" />
    <UiIconButton icon="add" :label="t('reading.mine.addTitle')" @click="sheet.open()" />
  </AppTopBar>

  <UiEmpty v-if="!texts.length" icon="book" :title="t('reading.mine.empty')" :text="t('reading.mine.emptyHint')">
    <UiButton variant="filled" icon="add" @click="sheet.open()">{{ t('reading.mine.addTitle') }}</UiButton>
    <UiButton variant="text" icon="info" @click="howTo = true">{{ t('reading.mine.howTo') }}</UiButton>
  </UiEmpty>

  <ul v-else class="list">
    <li v-for="text in texts" :key="text.id" class="item">
      <RouterLink v-ripple class="item-main" :to="{ name: 'reader', params: { id: text.id } }">
        <span class="item-icon"><AppIcon name="book" size="1.5rem" /></span>
        <span class="item-body">
          <b class="item-title">{{ text.title }}</b>
          <span class="small item-meta">
            {{ t('reading.chapters', { n: text.chapters }) }} · {{ t('reading.mine.words', { n: text.words }) }}
          </span>
        </span>
        <span class="status" :class="`status--${statusOf(text).kind}`">
          {{ t(`reading.status.${statusOf(text).kind}`, { n: statusOf(text).percent }) }}
        </span>
      </RouterLink>
      <UiIconButton icon="delete" :label="t('reading.mine.remove')" @click="remove(text)" />
    </li>
  </ul>

  <AddTextSheet ref="sheet" />

  <!-- способы добавить книгу: руководства нет — объясняем здесь -->
  <UiSheet v-model="howTo" :title="t('reading.mine.howTo')">
    <dl class="how">
      <template v-for="k in ['share', 'file', 'paste', 'store']" :key="k">
        <dt>{{ t(`reading.mine.how.${k}Title`) }}</dt>
        <dd>{{ t(`reading.mine.how.${k}`) }}</dd>
      </template>
    </dl>
  </UiSheet>
</template>

<style scoped>
.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

/* свои книги — третьим цветом, как плитка раздела */
.item {
  display: flex;
  align-items: center;
  padding-right: 0.25rem;
  border-radius: var(--radius-m);
  background: var(--tertiary-c);
  color: var(--on-tertiary-c);
  box-shadow: var(--shadow-card);
}
.item :deep(.icon-btn) { color: inherit; }

.item-main {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0.5rem 0.875rem 1rem;
  border-radius: var(--radius-m);
  color: inherit;
  text-decoration: none;
}

.item-icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: var(--tertiary);
  color: var(--tertiary-c);
}

.item-body {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
}
.item-title {
  font-size: 1.0625rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta { opacity: 0.8; }

.status {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--surface);
  color: var(--on);
}
.status--read    { background: var(--teal-c); color: var(--on-teal-c); }
.status--learned { background: var(--success-c); color: var(--on-success-c); }

.how {
  display: grid;
  gap: 0.25rem;
}
.how dt {
  margin-top: 0.75rem;
  font-weight: 700;
}
.how dt:first-child { margin-top: 0; }
.how dd { line-height: 1.45; }
</style>
