<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '@/shared/components/AppIcon.vue'
import UiButton from '@/shared/ui/UiButton.vue'
import UiIconButton from '@/shared/ui/UiIconButton.vue'
import UiEmpty from '@/shared/ui/UiEmpty.vue'
import UiSpinner from '@/shared/ui/UiSpinner.vue'
import StageHeader from './StageHeader.vue'
import { pickSet, replaceInSet, addToSet } from '../domain.js'

// выбор слов: сразу готовый набор из N (настройка) — заменить слово, «+» / «−»;
// «Показать все слова» — полный список с отметками. Размер набора — от MIN до MAX
const MIN = 1
const MAX = 10

const props = defineProps({
  newWords:        { type: Array,   required: true },
  loading:         { type: Boolean, default: false },
  wordsPerSession: { type: Number,  required: true },
})

defineEmits(['start', 'exit'])

const { t }    = useI18n()
const router   = useRouter()
const selected = ref([])
const showAll  = ref(false)

const limit  = computed(() => Math.min(MAX, props.newWords.length))
const byId   = computed(() => new Map(props.newWords.map(w => [w.id, w])))
const picked = computed(() => selected.value.map(id => byId.value.get(id)).filter(Boolean))

watch(() => props.newWords, pool => {
  selected.value = pickSet(pool, Math.min(props.wordsPerSession, MAX))
}, { immediate: true })

function replace(id) {
  selected.value = replaceInSet(selected.value, id, props.newWords) ?? selected.value
}
const add    = () => { selected.value = addToSet(selected.value, props.newWords) }
const remove = id => { selected.value = selected.value.filter(x => x !== id) }

function toggle(id) {
  if (selected.value.includes(id)) remove(id)
  else if (selected.value.length < MAX) selected.value = [...selected.value, id]
}
</script>

<template>
  <StageHeader
      :title="t('study.selectTitle')"
      :counter="`${selected.length}`"
      @exit="$emit('exit')"
  />

  <UiSpinner v-if="loading" />

  <UiEmpty
      v-else-if="!newWords.length"
      icon="study"
      :title="t('study.noWords')"
      :text="t('study.notEnoughHint')"
  >
    <!-- экран слов — из модуля words: нет модуля — нет и кнопки -->
    <UiButton
        v-if="router.hasRoute('words')"
        variant="filled"
        icon="add"
        @click="router.push({ name: 'words' })"
    >
      {{ t('word.addWords') }}
    </UiButton>
  </UiEmpty>

  <template v-else-if="!showAll">
    <ul class="list">
      <li v-for="w in picked" :key="w.id" class="row">
        <span class="grow pick-text">
          <b>{{ w.word }}</b>
          <span class="muted small">{{ w.translation?.join(', ') }}</span>
        </span>
        <UiIconButton
            icon="replace"
            :label="t('study.replace')"
            :disabled="selected.length >= newWords.length"
            @click="replace(w.id)"
        />
        <UiIconButton
            icon="minus"
            :label="t('study.removeWord')"
            :disabled="selected.length <= MIN"
            @click="remove(w.id)"
        />
      </li>
    </ul>

    <div class="more">
      <UiButton variant="tonal" icon="add" :disabled="selected.length >= limit" @click="add">
        {{ t('study.addWord') }}
      </UiButton>
      <UiButton variant="text" @click="showAll = true">{{ t('study.showAll') }}</UiButton>
    </div>
  </template>

  <template v-else>
    <p class="muted hint">{{ t('study.selectHint', { n: MAX }) }}</p>

    <ul class="list">
      <li v-for="w in newWords" :key="w.id">
        <button
            v-ripple
            type="button"
            class="pick"
            :class="{ 'pick--on': selected.includes(w.id) }"
            :disabled="!selected.includes(w.id) && selected.length >= MAX"
            :aria-pressed="selected.includes(w.id)"
            @click="toggle(w.id)"
        >
          <span class="box" aria-hidden="true">
            <AppIcon v-if="selected.includes(w.id)" name="check" size="1.125rem" />
          </span>
          <span class="grow pick-text">
            <b>{{ w.word }}</b>
            <span class="muted small">{{ w.translation?.join(', ') }}</span>
          </span>
          <span v-if="w.transcription" class="muted small">[{{ w.transcription }}]</span>
        </button>
      </li>
    </ul>
  </template>

  <div v-if="!loading && newWords.length" class="stage-footer">
    <UiButton
        variant="filled"
        block
        :disabled="selected.length < MIN"
        @click="$emit('start', selected)"
    >
      {{ t('study.start') }}
    </UiButton>
  </div>
</template>

<style scoped>
.hint { margin-bottom: 0.75rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-height: 3.5rem;
  padding: 0.375rem 0.25rem 0.375rem 1rem;
  border-radius: var(--radius-m);
  background: var(--container);
}

.more {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.pick {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.625rem 1rem;
  border: 0;
  border-radius: var(--radius-m);
  background: var(--container);
  text-align: left;
  transition: background-color 0.15s;
}
.pick--on { background: var(--primary-c); color: var(--on-primary-c); }
.pick--on .muted { color: inherit; opacity: 0.8; }
.pick:disabled { opacity: 0.45; cursor: default; }

.pick-text { display: grid; min-width: 0; }
.pick-text b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.box {
  display: grid;
  place-items: center;
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  border-radius: 0.375rem;
  box-shadow: inset 0 0 0 2px currentColor;
}
.pick--on .box { background: var(--primary); color: var(--on-primary); box-shadow: none; }
</style>
