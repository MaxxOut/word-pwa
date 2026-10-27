<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TOPICS, textsOf } from '../../content/reading/index.js'
import { useLibraryStore } from '../../stores/library.js'
import AppTopBar from '../../shared/components/AppTopBar.vue'
import AppIcon from '../../shared/components/AppIcon.vue'
import UiEmpty from '../../shared/ui/UiEmpty.vue'

// корень «Чтения»: темы текущей библиотеки
const { t }   = useI18n()
const library = useLibraryStore()

const topics = computed(() => {
  const texts = textsOf(library.current?.id)
  return TOPICS
    .map(topic => ({ ...topic, count: texts.filter(x => x.topic === topic.id).length }))
    .filter(topic => topic.count)
})
</script>

<template>
  <AppTopBar :title="t('reading.title')" />

  <UiEmpty v-if="!topics.length" icon="reading" :title="t('reading.empty')" />

  <div v-else class="topics">
    <RouterLink
        v-for="topic in topics"
        :key="topic.id"
        v-ripple
        class="topic"
        :to="{ name: 'reading-topic', params: { topic: topic.id } }"
    >
      <span class="topic-icon"><AppIcon :name="topic.icon" size="1.75rem" /></span>
      <span class="topic-title">{{ t(`reading.topics.${topic.id}`) }}</span>
      <span class="muted small">{{ t('reading.texts', { n: topic.count }) }}</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.topics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5rem;
}

.topic {
  display: grid;
  align-content: start;
  gap: 0.25rem;
  min-height: 8rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--container);
  color: inherit;
  text-decoration: none;
}

.topic-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
  border-radius: 0.75rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
}

.topic-title {
  font-family: var(--font-title);
  font-weight: 700;
  line-height: 1.2;
}
</style>
