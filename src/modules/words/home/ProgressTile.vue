<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { wordStats } from '@/core/words/domain.js'

const props = defineProps({ words: { type: Array, required: true } })

const { t } = useI18n()

const stats   = computed(() => wordStats(props.words))
const percent = computed(() =>
  stats.value.words ? Math.round((stats.value.learned / stats.value.words) * 100) : 0,
)
</script>

<template>
  <section v-if="stats.words" class="tile tile--wide progress">
    <div
        class="ring"
        :style="{ '--p': percent }"
        role="img"
        :aria-label="t('words.home.learnedPercent', { n: percent })"
    >
      <span class="num">{{ percent }}%</span>
    </div>
    <div class="facts">
      <div><b class="num">{{ stats.learned }}</b> {{ t('words.home.learnedOf', { total: stats.words }) }}</div>
      <div><b class="num">{{ stats.ignored }}</b> {{ t('words.home.ignored') }}</div>
      <RouterLink
          v-if="stats.untranslated"
          class="facts-link"
          :to="{ name: 'words', query: { status: 'untranslated' } }"
      >
        <b class="num">{{ stats.untranslated }}</b> {{ t('words.home.untranslated') }}
      </RouterLink>
      <div v-else><b class="num">0</b> {{ t('words.home.untranslated') }}</div>
    </div>
  </section>
</template>

<style scoped>
.progress {
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 1rem;
}

.ring {
  width: 5rem;
  height: 5rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(var(--primary) calc(var(--p) * 1%), var(--container-hi) 0);
}
.ring span {
  display: grid;
  place-items: center;
  width: 3.875rem;
  height: 3.875rem;
  border-radius: 50%;
  background: var(--container);
  font-size: 0.9375rem;
}

.facts {
  display: grid;
  gap: 0.125rem;
  font-size: 0.875rem;
  color: var(--muted);
}
.facts b { color: var(--on); }
.facts-link { color: inherit; text-decoration: underline; text-underline-offset: 0.2em; }
</style>
