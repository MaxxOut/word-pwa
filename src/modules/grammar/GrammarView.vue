<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { verbsOf } from './verbs.js'
import { useLibraryStore } from '@/core/library/store.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import AppIcon from '@/shared/components/AppIcon.vue'

// корень «Грамматики»: справочники и (потом) правила — плитками, как темы «Чтения»
const { t }   = useI18n()
const library = useLibraryStore()

const verbCount = computed(() => verbsOf(library.current?.id).length)
</script>

<template>
  <AppTopBar :title="t('grammar.title')" :library="false" />

  <div class="sections">
    <RouterLink v-ripple class="section" :to="{ name: 'grammar-verbs' }">
      <span class="section-head">
        <span class="section-icon"><AppIcon name="verbs" size="1.75rem" /></span>
        <span class="num section-count">{{ verbCount }}</span>
      </span>
      <span class="section-title">{{ t('grammar.verbs') }}</span>
    </RouterLink>

    <div class="section section--soon" aria-disabled="true">
      <span class="section-head">
        <span class="section-icon"><AppIcon name="rule" size="1.75rem" /></span>
        <span class="soon">{{ t('grammar.soon') }}</span>
      </span>
      <span class="section-title">{{ t('grammar.rules') }}</span>
    </div>
  </div>
</template>

<style scoped>
.sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.5rem;
}

.section {
  display: grid;
  align-content: start;
  min-width: 0;
  gap: 0.25rem;
  min-height: 8rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  text-decoration: none;
}
.section--soon {
  background: var(--container);
  color: var(--muted);
  box-shadow: var(--shadow-card);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-count {
  font-size: 1.75rem;
  opacity: 0.75;
}

.section-icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: var(--primary);
  color: var(--on-primary);
}
.section--soon .section-icon {
  background: var(--container-hi);
  color: var(--muted);
}

.soon {
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  font-size: 0.75rem;
  font-weight: 700;
}

.section-title {
  font-family: var(--font-title);
  font-weight: 700;
  line-height: 1.2;
  hyphens: auto;
  overflow-wrap: anywhere;
}
</style>
