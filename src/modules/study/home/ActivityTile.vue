<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLibraryStore } from '@/core/library/store.js'
import { activity } from '../repo.js'

defineProps({ words: { type: Array, required: true } })

const { t }   = useI18n()
const library = useLibraryStore()

const days = ref(null)

async function load() {
  if (!library.current) return
  days.value = await activity(library.current.id, 30)
}
watch(() => library.current?.id, load, { immediate: true })
</script>

<template>
  <section v-if="words.length && days" class="tile tile--wide">
    <div class="tile-label">{{ t('study.home.activity') }}</div>
    <!-- столбик дня из двух этажей: снизу — учил, сверху — повторял (было/не было) -->
    <div class="bars">
      <div
          v-for="day in days"
          :key="day.date"
          class="bar"
          :title="t('study.home.activityDay', { date: day.date, studied: day.studied, repeated: day.repeated })"
      >
        <span class="part" :class="{ 'part--repeated': day.repeated }" />
        <span class="part" :class="{ 'part--studied': day.studied }" />
      </div>
    </div>
    <div class="legend">
      <span><i class="dot part--studied" />{{ t('study.home.legendStudied') }}</span>
      <span><i class="dot part--repeated" />{{ t('study.home.legendRepeated') }}</span>
    </div>
  </section>
</template>

<style scoped>
.bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 3rem;
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
</style>
