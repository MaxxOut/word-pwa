<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TOPICS, textsOf } from './content/index.js'
import { useLibraryStore } from '@/core/library/store.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'
import TextsMenu from './TextsMenu.vue'
import ContinueReading from './ContinueReading.vue'
import { userTextsOf } from './texts.js'

// корень «Чтения»: темы текущей библиотеки и внешние книги (свои тексты — третьим цветом)
const { t }   = useI18n()
const library = useLibraryStore()

const mineCount = ref(0)
watch(() => library.current?.id, async id => {
  mineCount.value = id ? (await userTextsOf(id)).length : 0
}, { immediate: true })

const topics = computed(() => {
  const texts = textsOf(library.current?.id)
  return TOPICS
    .map(topic => ({ ...topic, count: texts.filter(x => x.topic === topic.id).length }))
    .filter(topic => topic.count)
})
</script>

<template>
  <AppTopBar :title="t('reading.title')" :library="false">
    <TextsMenu v-if="topics.length" />
  </AppTopBar>

  <ContinueReading in-section class="continue" />

  <div class="topics">
    <RouterLink
        v-for="topic in topics"
        :key="topic.id"
        v-ripple
        class="topic"
        :to="{ name: 'reading-topic', params: { topic: topic.id } }"
    >
      <span class="topic-head">
        <span class="topic-icon"><AppIcon :name="topic.icon" size="1.75rem" /></span>
        <span class="num topic-count" :aria-label="t('reading.texts', { n: topic.count })">{{ topic.count }}</span>
      </span>
      <span class="topic-title">{{ t(`reading.topics.${topic.id}`) }}</span>
    </RouterLink>

    <RouterLink v-ripple class="topic topic--mine" :to="{ name: 'reading-mine' }">
      <span class="topic-head">
        <span class="topic-icon"><AppIcon name="book" size="1.75rem" /></span>
        <span class="num topic-count">{{ mineCount }}</span>
      </span>
      <span class="topic-title">{{ t('reading.mine.section') }}</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.continue { margin-bottom: 0.5rem; }

.topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5rem;
}

.topic {
  display: grid;
  align-content: start;
  min-width: 0;
  gap: 0.25rem;
  min-height: 8rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  /* цвет текущей библиотеки, как плитка «Учить» на главной */
  background: var(--primary-c);
  color: var(--on-primary-c);
  text-decoration: none;
}

/* свои книги — третьим цветом */
.topic--mine { background: var(--tertiary-c); color: var(--on-tertiary-c); }
.topic--mine .topic-icon { background: var(--tertiary); color: var(--tertiary-c); }

.topic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.topic-count {
  font-size: 1.75rem;
  opacity: 0.75;
}

.topic-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: var(--primary);
  color: var(--on-primary);
}

/* длинное название («Программирование») переносится по слогам, а не выталкивает плитку за экран */
.topic-title {
  font-family: var(--font-title);
  font-weight: 700;
  line-height: 1.2;
  hyphens: auto;
  overflow-wrap: anywhere;
}
</style>
