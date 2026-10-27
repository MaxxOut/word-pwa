<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { stats as statsRepo } from '../../data/index.js'
import { useLibraryStore } from '../../stores/library.js'
import { needRefresh, dismissed, applyUpdate, dismissUpdate } from '../../shared/utils/update.js'
import AppTopBar from '../../shared/components/AppTopBar.vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiIconButton from '../../shared/ui/UiIconButton.vue'
import UiEmpty from '../../shared/ui/UiEmpty.vue'
import UiSpinner from '../../shared/ui/UiSpinner.vue'

const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()

const stats = ref(null)

const learnedPercent = computed(() => {
  if (!stats.value?.words) return 0
  return Math.round((stats.value.learned / stats.value.words) * 100)
})

async function load() {
  if (!library.current) return
  stats.value = await statsRepo.library(library.current.id)
}

watch(() => library.current?.id, load, { immediate: true })
</script>

<template>
  <AppTopBar brand />

  <Transition name="banner">
    <section v-if="needRefresh && !dismissed" class="update" role="status">
      <UiIconButton icon="close" :label="t('common.close')" @click="dismissUpdate" />
      <span class="grow">{{ t('home.updateReady') }}</span>
      <UiButton variant="filled" @click="applyUpdate">{{ t('home.update') }}</UiButton>
    </section>
  </Transition>

  <UiSpinner v-if="!stats" />

  <UiEmpty v-else-if="!stats.words" :title="t('home.empty')" :text="t('home.emptyHint')">
    <UiButton variant="filled" icon="add" @click="router.push({ name: 'words' })">
      {{ t('home.addWords') }}
    </UiButton>
  </UiEmpty>

  <div v-else class="bento">
    <section class="tile tile--hero tile--learn">
      <div class="label">{{ t('home.newWords') }}</div>
      <div class="num value">{{ stats.new }}</div>
      <UiButton variant="filled" :disabled="!stats.new" @click="router.push({ name: 'study' })">
        {{ t('home.study') }}
      </UiButton>
    </section>

    <section class="tile tile--hero tile--repeat">
      <div class="label">{{ t('home.due') }}</div>
      <div class="num value">{{ stats.due }}</div>
      <UiButton variant="outlined" :disabled="!stats.due" @click="router.push({ name: 'repeat' })">
        {{ t('home.repeat') }}
      </UiButton>
    </section>

    <section class="tile tile--progress">
      <div
          class="ring"
          :style="{ '--p': learnedPercent }"
          role="img"
          :aria-label="t('home.learnedPercent', { n: learnedPercent })"
      >
        <span class="num">{{ learnedPercent }}%</span>
      </div>
      <div class="facts">
        <div><b class="num">{{ stats.learned }}</b> {{ t('home.learnedOf', { total: stats.words }) }}</div>
        <div><b class="num">{{ stats.ignored }}</b> {{ t('home.ignored') }}</div>
        <RouterLink
            v-if="stats.untranslated"
            class="facts-link"
            :to="{ name: 'words', query: { status: 'untranslated' } }"
        >
          <b class="num">{{ stats.untranslated }}</b> {{ t('home.untranslated') }}
        </RouterLink>
        <div v-else><b class="num">0</b> {{ t('home.untranslated') }}</div>
      </div>
    </section>

    <section class="tile">
      <div class="label">{{ t('home.activity') }}</div>
      <!-- столбик дня из двух этажей: снизу — учил, сверху — повторял (было/не было) -->
      <div class="bars">
        <div
            v-for="day in stats.activity"
            :key="day.date"
            class="bar"
            :title="t('home.activityDay', { date: day.date, studied: day.studied, repeated: day.repeated })"
        >
          <span class="part" :class="{ 'part--repeated': day.repeated }" />
          <span class="part" :class="{ 'part--studied': day.studied }" />
        </div>
      </div>
      <div class="legend">
        <span><i class="dot part--studied" />{{ t('home.legendStudied') }}</span>
        <span><i class="dot part--repeated" />{{ t('home.legendRepeated') }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.update {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 0.25rem;
  border-radius: 0.5rem;
  background: var(--primary-c);
  color: var(--on-primary-c);
  font-weight: 500;
}
.banner-enter-active, .banner-leave-active { transition: opacity 0.25s, transform 0.25s; }
.banner-enter-from, .banner-leave-to { opacity: 0; transform: translateY(-0.5rem); }

.bento {
  display: grid;
  gap: 0.5rem;
}

.tile {
  display: grid;
  gap: 0.25rem;
  padding: 1rem 1.125rem;
  border-radius: 0.5rem;
  background: var(--container);
}

.label {
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
  color: var(--muted);
}

/* подпись сверху, крупная цифра и кнопка снизу */
.tile--hero {
  grid-template-columns: 1fr auto;
  grid-template-areas: "label label" "value action";
  align-items: end;
  row-gap: 0.75rem;
}
.tile--hero .label { grid-area: label; }
.tile--hero .value { grid-area: value; font-size: 2.5rem; }
.tile--hero > :last-child { grid-area: action; }
.tile--learn  { background: var(--primary-c); color: var(--on-primary-c); }
.tile--learn .label { color: inherit; opacity: 0.8; }
.tile--repeat { background: var(--container-hi); }

.value { font-size: 2rem; }

.tile--progress {
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

.bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 4.5rem;
  margin-top: 0.375rem;
}
.bar {
  flex: 1;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
}
.part {
  border-radius: 2px;
  background: var(--container-hi);
}
.part--studied  { background: var(--primary); }
.part--repeated { background: color-mix(in srgb, var(--primary) 45%, var(--container-hi)); }

.legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
}
.legend span { display: inline-flex; align-items: center; gap: 0.375rem; }
.dot { width: 0.625rem; height: 0.625rem; border-radius: 0.1875rem; }

@media (min-width: 600px) {
  .bento { grid-template-columns: 1fr 1fr; }
  .tile--progress, .tile:last-child { grid-column: span 2; }
}
</style>
