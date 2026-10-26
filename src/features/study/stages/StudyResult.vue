<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppIcon from '../../../shared/components/AppIcon.vue'
import UiButton from '../../../shared/ui/UiButton.vue'
import UiSwitch from '../../../shared/ui/UiSwitch.vue'
import StageHeader from './StageHeader.vue'

const props = defineProps({
  words:     { type: Array,   required: true },
  failedIds: { type: Object,  required: true }, // Set
  saving:    { type: Boolean, default: false },
})

defineEmits(['toggle', 'complete', 'exit'])

const { t } = useI18n()

const learnedCount = computed(() =>
  props.words.filter(w => !props.failedIds.has(w.id)).length,
)
</script>

<template>
  <StageHeader :title="t('result.title')" @exit="$emit('exit')" />

  <section class="summary" :class="{ 'summary--all': learnedCount === words.length }">
    <div class="num big">{{ learnedCount }} / {{ words.length }}</div>
    <div>{{ t('result.learnedLabel') }}</div>
  </section>

  <p class="muted small hint">{{ t('result.hint') }}</p>

  <ul class="list">
    <li v-for="w in words" :key="w.id" class="item">
      <div class="grow item-text">
        <b>{{ w.word }}</b>
        <span class="muted small">{{ w.translation?.join(', ') || '—' }}</span>
        <span v-if="w.has_error" class="had-errors">
          <AppIcon name="warning" size="0.875rem" /> {{ t('result.hadErrors') }}
        </span>
      </div>
      <UiSwitch
          :model-value="!failedIds.has(w.id)"
          :aria-label="t('result.learnedSwitch', { word: w.word })"
          @update:model-value="$emit('toggle', w.id)"
      />
    </li>
  </ul>

  <div class="stage-footer">
    <UiButton variant="filled" :loading="saving" @click="$emit('complete')">
      {{ t('result.save') }}
    </UiButton>
  </div>
</template>

<style scoped>
.summary {
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  padding: 1.5rem 1rem;
  margin-bottom: 0.75rem;
  border-radius: 0.5rem;
  background: var(--container-hi);
  text-align: center;
}
.summary--all { background: var(--success-c); color: var(--on-success-c); }
.big { font-size: 2.5rem; }

.hint { margin-bottom: 0.5rem; }

.list {
  display: grid;
  gap: 0.375rem;
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-m);
  background: var(--container);
}

.item-text { display: grid; min-width: 0; }

.had-errors {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--error);
  font-size: 0.75rem;
}
</style>
