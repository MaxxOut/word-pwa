<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { findTense } from './tenses/index.js'
import { grammarRepo } from './repo.js'
import { daysSince, whenKey } from './tenses/result.js'
import { levelsOf, levelFor } from './tenses/levels.js'
import { useLibraryStore } from '@/core/library/store.js'
import { useSettingsStore } from '@/core/settings/store.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import AppTopBar from '@/core/shell/AppTopBar.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiSegmented from '@/shared/ui/UiSegmented.vue'
import AppIcon from '@/shared/components/AppIcon.vue'

// время: смысл, когда употребляется, формулы, маркеры, подводные камни, примеры; внизу — тренировка.
// Уже тренировались — результат и «Тренировать» ещё и сверху: повторить можно в любой момент.
// Над нижней кнопкой — уровень фраз (запоминается в настройках, общий для всех времён)
const props = defineProps({
  id: { type: String, required: true },
})

const router        = useRouter()
const { t, locale } = useI18n()
const library       = useLibraryStore()
const settings      = useSettingsStore()

const tense = computed(() => findTense(library.current?.id, props.id))
const th    = computed(() => tense.value?.theory)

// неготовое время или сменили библиотеку (в немецкой времён нет) — к списку, а не пустая страница
watch(tense, value => {
  if (!value?.active) router.replace({ name: 'grammar-tenses' })
}, { immediate: true })

const stats = ref(null)
watch(() => library.current?.id, async id => {
  stats.value = id ? await grammarRepo.get(id, props.id) ?? null : null
}, { immediate: true })

// уровни, для которых у времени есть фразы
const levels = computed(() => levelsOf(props.id).map(value => ({ value, label: `${value} · ${t(`grammar.tenses.levels.${value}`)}` })))
const level  = computed({
  get: () => levelFor(props.id, settings.settings.grammar?.level ?? 1),
  set: value => settings.update({ grammar: { level: value } }),
})

function train() {
  router.push({ name: 'grammar-train', params: { id: props.id } })
}
</script>

<template>
  <template v-if="th">
    <AppTopBar :title="tense.name" :back="{ name: 'grammar-tenses' }" />

    <p class="meaning">{{ th.meaning[locale] }}</p>

    <section v-if="stats" class="stats">
      <!-- сколько было тренировок и когда последняя -->
      <span class="grow">
        {{ t('grammar.tenses.times', { n: stats.count }) }}<br>
        {{ t('grammar.tenses.lastWhen', { when: t(whenKey(daysSince(stats.practiced_at)), { n: daysSince(stats.practiced_at) }) }) }}
      </span>
      <UiButton variant="filled" icon="train" @click="train">{{ t('grammar.tenses.train') }}</UiButton>
    </section>

    <section class="block">
      <h3>{{ t('grammar.tenses.uses') }}</h3>
      <ul class="bullets">
        <li v-for="(u, i) in th.uses[locale]" :key="i">{{ u }}</li>
      </ul>
    </section>

    <section class="block">
      <h3>{{ t('grammar.tenses.form') }}</h3>
      <div class="forms" lang="en">
        <template v-for="row in th.form" :key="row[0]">
          <span class="sign num">{{ row[0] }}</span>
          <span>{{ row[1] }}<br><span class="muted">{{ row[2] }}</span></span>
        </template>
      </div>
    </section>

    <section class="block">
      <h3>{{ t('grammar.tenses.markers') }}</h3>
      <div class="markers" lang="en">
        <span v-for="m in th.markers" :key="m" class="marker">{{ m }}</span>
      </div>
    </section>

    <section class="block note">
      <h3><AppIcon name="hint" size="1.25rem" /> {{ t('grammar.tenses.notes') }}</h3>
      <ul class="bullets">
        <li v-for="(n, i) in th.notes[locale]" :key="i">{{ n }}</li>
      </ul>
    </section>

    <section class="block">
      <h3>{{ t('grammar.tenses.examples') }}</h3>
      <div v-for="(e, i) in th.examples" :key="i" class="example">
        <div class="example-row">
          <span class="grow" lang="en">{{ e[0] }}</span>
          <UiIconButton v-if="canSpeak()" icon="speak" :label="t('grammar.speak')" @click="speak(e[0], 'en')" />
        </div>
        <div class="muted">{{ locale === 'uk' ? e[2] : e[1] }}</div>
      </div>
    </section>

    <section v-if="levels.length > 1" class="block level">
      <UiSegmented v-model="level" :options="levels" :label="t('grammar.tenses.level')" />
      <p class="muted small">{{ t(`grammar.tenses.levelHint.${level}`) }}</p>
    </section>

    <div class="stage-footer">
      <UiButton variant="filled" icon="train" @click="train">{{ t('grammar.tenses.train') }}</UiButton>
    </div>
  </template>
</template>

<style scoped>
.meaning {
  margin-bottom: 1rem;
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.625rem 0.625rem 0.625rem 1rem;
  border-radius: var(--radius-m);
  background: var(--primary-c);
  color: var(--on-primary-c);
}
.stats .grow { line-height: 1.45; }

.block {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-m);
  /* на тон темнее фона экрана — как зоны в карточке слова */
  background: var(--container-hi);
}
.block h3 {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.9375rem;
}
.level { background: var(--surface); box-shadow: var(--shadow-card); }
.note { background: var(--primary-c); color: var(--on-primary-c); }

.bullets {
  display: grid;
  gap: 0.375rem;
  padding-left: 1.125rem;
  line-height: 1.45;
}

.forms {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 0.75rem;
  line-height: 1.45;
}
.sign {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary);
}

.markers {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.marker {
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--surface);
  font-size: 0.9375rem;
}

.example { display: grid; gap: 0.125rem; }
.example + .example { padding-top: 0.5rem; border-top: 1px solid var(--outline); }
.example-row { display: flex; align-items: center; gap: 0.25rem; margin-right: -0.5rem; }
</style>
