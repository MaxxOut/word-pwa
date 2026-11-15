<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { tenseGroupsOf } from './tenses/index.js'
import { THEORY } from './tenses/theory.js'
import { grammarRepo } from './repo.js'
import { daysSince, whenKey } from './tenses/result.js'
import { useLibraryStore } from '@/core/library/store.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import UiButton from '@/shared/ui/UiButton.vue'

// список времён: потренированные — цветом библиотеки и с последним процентом, готовые без
// тренировки — рамкой, остальные — серым фоном с меткой «Скоро» (чтобы не казалось, что времён всего три)
const { t, locale } = useI18n()
const library = useLibraryStore()

const groups = computed(() => tenseGroupsOf(library.current?.id))

// смешанная тренировка — когда потренировано хотя бы два времени
const practiced = computed(() => groups.value.flatMap(g => g.tenses).filter(x => x.active && stats.value.has(x.id)).length)
const stats  = ref(new Map()) // тема → результат тренировок

watch(() => library.current?.id, async id => {
  stats.value = id ? await grammarRepo.all(id) : new Map()
}, { immediate: true })
</script>

<template>
  <AppTopBar :title="t('grammar.tenses.title')" :back="{ name: 'grammar' }" />

  <section class="mixed">
    <span class="grow">
      <b>{{ t('grammar.mixed.title') }}</b>
      <span class="muted small mixed-hint">{{ practiced >= 2 ? t('grammar.mixed.hint') : t('grammar.mixed.need') }}</span>
    </span>
    <UiButton
        variant="filled"
        icon="train"
        :disabled="practiced < 2"
        @click="$router.push({ name: 'grammar-train', params: { id: 'mixed' } })"
    >
      {{ t('grammar.tenses.train') }}
    </UiButton>
  </section>

  <section v-for="g in groups" :key="g.group" class="group">
  <ul class="list">
    <li v-for="tense in g.tenses" :key="tense.id">
      <RouterLink
          v-if="tense.active"
          v-ripple
          class="item"
          :class="stats.has(tense.id) ? 'item--done' : 'item--new'"
          :to="{ name: 'grammar-tense', params: { id: tense.id } }"
      >
        <span class="item-main">
          <b class="item-title">{{ tense.name }}</b>
          <span class="small item-sub">{{ THEORY[tense.id]?.meaning[locale] }}</span>
        </span>
        <!-- когда была последняя тренировка: «последняя / тренировка / была сегодня» -->
        <span v-if="stats.has(tense.id)" class="last">
          <span class="last-label">{{ t('grammar.tenses.lastLine1') }}</span>
          <span class="last-label">{{ t('grammar.tenses.lastLine2') }}</span>
          <span class="last-label last-when">{{ t('grammar.tenses.was') }} {{ t(whenKey(daysSince(stats.get(tense.id).practiced_at)), { n: daysSince(stats.get(tense.id).practiced_at) }) }}</span>
        </span>
      </RouterLink>
      <div v-else class="item item--soon" aria-disabled="true">
        <span class="item-main">
          <b class="item-title">{{ tense.name }}</b>
        </span>
        <span class="soon">{{ t('grammar.soon') }}</span>
      </div>
    </li>
  </ul>
  </section>
</template>

<style scoped>
.mixed {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 0.75rem 0.75rem 1rem;
  border-radius: var(--radius-m);
  background: var(--container-hi);
}
.mixed .grow { display: grid; gap: 0.125rem; }

/* группы (simple, continuous…) — без заголовков, отступом */
.group + .group { margin-top: 1.5rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-m);
  color: inherit;
  text-decoration: none;
}
/* потренировано — цветом библиотеки */
.item--done {
  background: var(--primary-c);
  color: var(--on-primary-c);
}
/* готово, но ещё не тренировалось — рамкой */
.item--new { box-shadow: inset 0 0 0 1.5px var(--primary); }
/* «Скоро» — серым фоном: не путается с рамкой «готово, не тренировалось» */
.item--soon { background: var(--container-hi); color: var(--muted); }

.item-sub { opacity: 0.8; }
/* последняя тренировка — своей карточкой внутри плашки (на тон темнее, в обеих темах), не сливается с названием */
.last {
  flex-shrink: 0;
  display: grid;
  justify-items: end;
  margin: -0.25rem -0.375rem -0.25rem 0;
  padding: 0.375rem 0.625rem;
  border-radius: 0.75rem;
  background: rgb(0 0 0 / 0.1);
  text-align: right;
  line-height: 1.15;
}
.last-label { font-size: 0.75rem; }
.last-when { font-weight: 700; }

.item-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 0.125rem;
}
.item-title { font-size: 1.0625rem; }

.soon {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
  background: var(--surface);
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
