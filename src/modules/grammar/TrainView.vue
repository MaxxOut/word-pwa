<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { findTense, tensesOf } from './tenses/index.js'
import { makeSession } from './tenses/generate.js'
import { percentOf, trend } from './tenses/result.js'
import { grammarRepo } from './repo.js'
import { useLibraryStore } from '@/core/library/store.js'
import { speak, canSpeak } from '@/shared/utils/browser.js'
import { confirm } from '@/shared/ui/feedback.js'
import { goBack } from '@/shared/utils/navigation.js'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiProgress from '@/shared/ui/UiProgress.vue'
import UiSpinner from '@/shared/ui/UiSpinner.vue'

// тренировка времени: 10 предложений «выбери форму». Верно — дальше само; неверно — правильный
// вариант и «Дальше». Итог: процент верных и сравнение с прошлой тренировкой; «Ещё 10» — новая.
// id = 'mixed' — смешанная: все потренированные времена вперемешку, время угадывается по маркеру.
// Её итог — отдельной строкой (_mixed), а каждому времени из неё — свой процент (это тоже повторение)
const props = defineProps({
  id: { type: String, required: true },
})

const router        = useRouter()
const { t }         = useI18n()
const library       = useLibraryStore()

const libraryId = library.current?.id
const mixed     = props.id === 'mixed'
const tense     = mixed ? { name: t('grammar.mixed.title'), active: true } : findTense(libraryId, props.id)

const items    = ref([])
const index    = ref(0)
const chosen   = ref(null)   // выбранный вариант текущего задания
const correct  = ref(0)
const mistakes = ref([])     // { item, chosen } — в итоге: ваш вариант и правильный
const result   = ref(null)   // { percent, prev, trend }

const item     = computed(() => items.value[index.value])
const answered = computed(() => chosen.value !== null)
const isLast   = computed(() => index.value === items.value.length - 1)
const progress = computed(() => (items.value.length ? ((index.value + (answered.value ? 1 : 0)) / items.value.length) * 100 : 0))

if (!tense?.active) router.replace({ name: 'grammar-tenses' })

// смешанная — по потренированным временам; меньше двух — смешивать нечего
async function topics() {
  if (!mixed) return props.id
  const stats = await grammarRepo.all(libraryId)
  return tensesOf(libraryId).filter(x => x.active && stats.has(x.id)).map(x => x.id)
}

async function start() {
  const recent = await grammarRepo.recentVerbs(libraryId).catch(() => ({}))
  const tenses = await topics()
  if (mixed && tenses.length < 2) return router.replace({ name: 'grammar-tenses' })
  items.value    = makeSession(tenses, { recent })
  index.value    = 0
  chosen.value   = null
  correct.value  = 0
  mistakes.value = []
  result.value   = null
}

onMounted(() => tense?.active && start())

// после ответа — правильная форма в пропуске
const gapText = computed(() => (answered.value ? item.value.answer : '…'))

// маркер времени в хвосте — выделяем: он подсказывает время
const afterParts = computed(() => {
  const { after, marker } = item.value
  const i = after.lastIndexOf(marker)
  return i === -1 ? [after, '', ''] : [after.slice(0, i), marker, after.slice(i + marker.length)]
})

function optionState(option) {
  if (!answered.value) return null
  if (option === item.value.answer) return 'correct'
  if (option === chosen.value) return 'wrong'
  return 'dim'
}

let timer = null

function choose(option) {
  if (answered.value) return
  chosen.value = option
  if (option === item.value.answer) {
    correct.value++
    timer = setTimeout(next, 900)
  } else {
    mistakes.value.push({ item: item.value, chosen: option })
  }
}

function next() {
  clearTimeout(timer)
  if (isLast.value) return finish()
  index.value++
  chosen.value = null
}

// «Итог» нажали дважды — сохраняем один раз
let finishing = false

async function finish() {
  if (finishing) return
  finishing = true
  const percent = percentOf(correct.value, items.value.length)
  const { prev } = await grammarRepo.saveResult(libraryId, mixed ? '_mixed' : props.id, percent)
  if (mixed) {
    // каждому времени — процент по его заданиям
    const failed = new Set(mistakes.value.map(m => m.item))
    for (const id of new Set(items.value.map(x => x.tense))) {
      const own = items.value.filter(x => x.tense === id)
      await grammarRepo.saveResult(libraryId, id, percentOf(own.filter(x => !failed.has(x)).length, own.length))
    }
  }
  await grammarRepo.markVerbs(libraryId, items.value.filter(x => x.irregular).map(x => x.verb)).catch(() => {})
  await grammarRepo.markDay(libraryId).catch(() => {})
  result.value = { percent, prev, trend: trend(percent, prev) }
  finishing = false
}

function exit() {
  goBack(router, mixed ? { name: 'grammar-tenses' } : { name: 'grammar-tense', params: { id: props.id } })
}

// ушли посреди тренировки — спросить (результат не сохранится). Автопереход после верного ответа
// гасим, только если ушли: «Остаться» — он должен сработать, иначе экран застрянет без кнопки «Дальше»
onBeforeRouteLeave(async () => {
  if (result.value || index.value === 0 && !answered.value) {
    clearTimeout(timer)
    return true
  }
  const ok = await confirm({
    message:     t('grammar.train.exitConfirm'),
    confirmText: t('grammar.train.exitYes'),
    cancelText:  t('grammar.train.exitNo'),
    danger:      true,
    history:     false,
  })
  if (ok) clearTimeout(timer)
  return ok
})
</script>

<template>
  <div v-if="tense?.active" class="train">
    <header class="top sticky-top">
      <div class="top-row">
        <UiIconButton icon="close" :label="t('grammar.train.exit')" @click="exit" />
        <h2 class="grow">{{ tense.name }}</h2>
        <span v-if="!result && items.length" class="num counter">{{ index + 1 }} / {{ items.length }}</span>
      </div>
      <UiProgress v-if="!result" :value="progress" />
    </header>

    <UiSpinner v-if="!items.length" />

    <!-- итог -->
    <template v-else-if="result">
      <section class="result">
        <div class="num result-percent">{{ result.percent }}%</div>
        <div class="muted">{{ t('grammar.train.score', { n: correct, total: items.length }) }}</div>
        <p class="result-comment">{{ t(`grammar.train.trend.${result.trend}`, { prev: result.prev, now: result.percent }) }}</p>
      </section>

      <section v-if="mistakes.length" class="mistakes">
        <h3>{{ t('grammar.train.mistakes') }}</h3>
        <div v-for="(m, i) in mistakes" :key="i" class="mistake">
          <div class="mistake-row">
            <span class="mistake-label">{{ t('grammar.train.yours') }}</span>
            <span lang="en"><template v-if="m.item.before">{{ m.item.before }} </template><b class="pick pick--wrong">{{ m.chosen }}</b> {{ m.item.after }}</span>
          </div>
          <div class="mistake-row">
            <span class="mistake-label">{{ t('grammar.train.right') }}</span>
            <span class="grow" lang="en"><template v-if="m.item.before">{{ m.item.before }} </template><b class="pick pick--right">{{ m.item.answer }}</b> {{ m.item.after }}</span>
            <UiIconButton v-if="canSpeak()" class="mistake-say" icon="speak" :label="t('grammar.speak')" @click="speak(m.item.sentence, 'en')" />
          </div>
        </div>
      </section>

      <div class="stage-footer">
        <UiButton variant="outlined" @click="exit">{{ t('grammar.train.exit') }}</UiButton>
        <UiButton variant="filled" icon="train" @click="start">{{ t('grammar.train.again') }}</UiButton>
      </div>
    </template>

    <!-- задание -->
    <template v-else>
      <section :key="index" class="card" lang="en">
        <p class="sentence">
          <template v-if="item.before">{{ item.before }} </template>
          <span class="gap" :class="answered && (chosen === item.answer ? 'gap--ok' : 'gap--fix')">{{ gapText }}</span>
          {{ ' ' }}{{ afterParts[0] }}<b class="marker">{{ afterParts[1] }}</b>{{ afterParts[2] }}
        </p>
        <div class="card-foot">
          <span class="grow" />
          <UiIconButton v-if="answered && canSpeak()" icon="speak" :label="t('grammar.speak')" @click="speak(item.sentence, 'en')" />
        </div>
      </section>

      <div :key="`o${index}`" class="options" lang="en">
        <button
            v-for="option in item.options"
            :key="option"
            v-ripple
            type="button"
            class="option"
            :class="optionState(option) && `option--${optionState(option)}`"
            :aria-disabled="answered"
            @click="choose(option)"
        >
          <span class="grow">{{ option }}</span>
          <AppIcon v-if="optionState(option) === 'correct'" name="check" />
          <AppIcon v-else-if="optionState(option) === 'wrong'" name="close" />
        </button>
      </div>

      <div v-if="answered && chosen !== item.answer" class="stage-footer">
        <UiButton variant="filled" @click="next">
          {{ isLast ? t('grammar.train.finish') : t('grammar.train.next') }}
        </UiButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.train {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - env(safe-area-inset-top));
}

.top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  gap: 0.5rem;
  margin: 0 -1rem 0.75rem;
  padding: 0.5rem 1rem 0.75rem;
  background: var(--bg);
}
.top-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: -0.5rem;
}
.top h2 {
  font-size: 1.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.counter {
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  font-size: 0.875rem;
}

.card {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1.25rem 1rem 0.5rem;
  border-radius: var(--radius-l);
  background: var(--surface);
  box-shadow: var(--shadow-card);
  animation: rise-in 0.3s ease-out;
}
.sentence {
  font-size: 1.375rem;
  line-height: 1.5;
}
.gap {
  display: inline-block;
  min-width: 3.5rem;
  padding: 0 0.375rem;
  border-bottom: 2px solid var(--primary);
  font-weight: 700;
  text-align: center;
}
.gap--ok  { border-color: var(--success); color: var(--success); }
.gap--fix { border-color: var(--error); color: var(--error); }
.marker { color: var(--primary); }

.card-foot {
  display: flex;
  align-items: center;
  min-height: var(--touch);
  margin-right: -0.5rem;
}

.options {
  display: grid;
  gap: 0.5rem;
  animation: rise-in 0.3s 0.05s ease-out backwards;
}
.option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--surface);
  box-shadow: inset 0 0 0 1px var(--outline);
  font-size: 1.0625rem;
  text-align: left;
  transition: background-color 0.15s, opacity 0.15s;
}
.option[aria-disabled="true"] { cursor: default; }
.option--correct { background: var(--success-c); color: var(--on-success-c); box-shadow: none; animation: pop 0.3s; }
.option--wrong   { background: var(--error-c);   color: var(--on-error-c);   box-shadow: none; animation: shake 0.35s; }
.option--dim     { opacity: 0.5; }

.result {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  padding: 1.5rem 1rem;
  border-radius: var(--radius-l);
  background: var(--primary-c);
  color: var(--on-primary-c);
  text-align: center;
}
.result .muted { color: inherit; opacity: 0.8; }
.result-percent {
  font-size: 3.5rem;
  line-height: 1;
}
.result-comment {
  margin-top: 0.5rem;
  font-size: 1.0625rem;
  font-weight: 600;
}

.mistakes {
  display: grid;
  gap: 0.375rem;
  margin-top: 1rem;
}
.mistakes h3 { font-size: 0.9375rem; }
.mistake {
  display: grid;
  gap: 0.375rem;
  padding: 0.625rem 0.5rem 0.625rem 0.875rem;
  border-radius: var(--radius-m);
  background: var(--container-hi);
}
.mistake-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}
.mistake-label {
  flex-shrink: 0;
  width: 5.5rem;
  font-size: 0.8125rem;
  color: var(--muted);
}
.mistake-say { width: 2.25rem; height: 2.25rem; margin: -0.375rem 0; }

/* выбранный вариант — красным, правильный — зелёным */
.pick {
  padding: 0 0.25rem;
  border-radius: 0.25rem;
}
.pick--wrong { background: var(--error-c); color: var(--on-error-c); text-decoration: line-through; }
.pick--right { background: var(--success-c); color: var(--on-success-c); }
</style>
