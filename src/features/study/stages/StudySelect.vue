<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AppIcon from '../../../shared/components/AppIcon.vue'
import UiButton from '../../../shared/ui/UiButton.vue'
import UiEmpty from '../../../shared/ui/UiEmpty.vue'
import UiSpinner from '../../../shared/ui/UiSpinner.vue'
import StageHeader from './StageHeader.vue'

const props = defineProps({
  newWords:        { type: Array,   required: true },
  loading:         { type: Boolean, default: false },
  wordsPerSession: { type: Number,  required: true },
})

defineEmits(['start', 'exit'])

const { t }    = useI18n()
const router   = useRouter()
const selected = ref([])

function toggle(id) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) {
    if (selected.value.length < props.wordsPerSession) selected.value.push(id)
  } else {
    selected.value.splice(idx, 1)
  }
}

const isFull = () => selected.value.length >= props.wordsPerSession
</script>

<template>
  <StageHeader
      :title="t('study.selectTitle')"
      :counter="`${selected.length} / ${wordsPerSession}`"
      @exit="$emit('exit')"
  />

  <UiSpinner v-if="loading" />

  <UiEmpty
      v-else-if="newWords.length < wordsPerSession"
      icon="study"
      :title="t('study.notEnough', { n: wordsPerSession })"
      :text="t('study.notEnoughHint')"
  >
    <UiButton variant="filled" icon="add" @click="router.push({ name: 'words' })">{{ t('home.addWords') }}</UiButton>
  </UiEmpty>

  <template v-else>
    <p class="muted hint">{{ t('study.selectHint', { n: wordsPerSession }) }}</p>

    <ul class="list">
      <li v-for="w in newWords" :key="w.id">
        <button
            v-ripple
            type="button"
            class="pick"
            :class="{ 'pick--on': selected.includes(w.id) }"
            :disabled="!selected.includes(w.id) && isFull()"
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

    <div class="stage-footer">
      <UiButton
          variant="filled"
          block
          :disabled="selected.length < wordsPerSession"
          @click="$emit('start', selected)"
      >
        {{ t('study.start') }}
      </UiButton>
    </div>
  </template>
</template>

<style scoped>
.hint { margin-bottom: 0.75rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
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
