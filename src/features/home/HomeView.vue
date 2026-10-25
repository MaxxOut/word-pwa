<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { stats as statsRepo } from '../../data/index.js'
import { useLibraryStore } from '../../stores/library.js'

const router  = useRouter()
const { t }   = useI18n()
const library = useLibraryStore()

const loading = ref(false)
const stats   = ref(null)

const learnedPercent = computed(() => {
  if (!stats.value?.words) return 0
  return Math.round((stats.value.learned / stats.value.words) * 100)
})

const maxActivity = computed(() =>
  Math.max(1, ...(stats.value?.activity ?? []).map(d => d.studied + d.repeated)),
)

async function load() {
  if (!library.current) return
  loading.value = true
  try {
    stats.value = await statsRepo.library(library.current.id)
  } finally {
    loading.value = false
  }
}

watch(() => library.current?.id, load, { immediate: true })
</script>

<template>
  <div class="home" v-loading="loading">

    <div class="home-header">
      <h2>{{ t('home.hello') }}</h2>
      <el-tag v-if="library.current" :color="library.current.color" effect="dark" class="lib-tag">
        {{ library.current.short_name }}
      </el-tag>
    </div>

    <template v-if="stats">
      <!-- пустая библиотека -->
      <el-empty v-if="!stats.words" :description="t('home.empty')">
        <el-button type="primary" @click="router.push({ name: 'words' })">
          {{ t('home.addWords') }}
        </el-button>
      </el-empty>

      <template v-else>
        <div class="tiles">
          <el-card class="tile tile--accent" shadow="never">
            <div class="tile-body">
              <div>
                <div class="tile-label">{{ t('home.newWords') }}</div>
                <div class="tile-value">{{ stats.new }}</div>
              </div>
              <el-button type="primary" :disabled="!stats.new" @click="router.push({ name: 'study' })">
                {{ t('home.study') }}
              </el-button>
            </div>
          </el-card>

          <el-card class="tile" shadow="never">
            <div class="tile-body">
              <div>
                <div class="tile-label">{{ t('home.due') }}</div>
                <div class="tile-value">{{ stats.due }}</div>
              </div>
              <el-button :disabled="!stats.due" @click="router.push({ name: 'repeat' })">
                {{ t('home.repeat') }}
              </el-button>
            </div>
          </el-card>

          <el-card class="tile" shadow="never">
            <div class="progress">
              <el-progress
                  type="circle"
                  :percentage="learnedPercent"
                  :width="80"
                  :color="library.current.color"
              />
              <div class="progress-stats">
                <div>{{ t('home.learnedOf', { learned: stats.learned, total: stats.words }) }}</div>
                <div>{{ t('home.ignored', { n: stats.ignored }) }}</div>
                <div>
                  <el-link type="warning" underline="never" @click="router.push({ name: 'words', query: { status: 'untranslated' } })">
                    {{ t('home.untranslated', { n: stats.untranslated }) }}
                  </el-link>
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="tile" shadow="never">
            <div class="tile-label">{{ t('home.activity') }}</div>
            <div class="activity">
              <div
                  v-for="day in stats.activity"
                  :key="day.date"
                  class="activity-bar"
                  :class="{ 'activity-bar--empty': !(day.studied + day.repeated) }"
                  :style="{
                    height: `${Math.max(6, ((day.studied + day.repeated) / maxActivity) * 100)}%`,
                    backgroundColor: (day.studied + day.repeated) ? library.current.color : undefined,
                  }"
                  :title="`${day.date}: +${day.studied} / ↻${day.repeated}`"
              />
            </div>
          </el-card>
        </div>
      </template>
    </template>

  </div>
</template>

<style scoped>
.home {
  max-width: 640px;
  margin: 0 auto;
  min-height: 200px;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.home-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.lib-tag {
  border: none;
  color: var(--el-text-color-primary);
  font-weight: 700;
}

.tiles {
  display: grid;
  gap: 0.75rem;
}

.tile {
  border-radius: 1.25rem;
}

.tile--accent {
  background: var(--el-color-primary-light-9);
}

.tile-body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.tile-label {
  font-size: 0.8125rem;
  color: var(--el-text-color-secondary);
}

.tile-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.progress {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.progress-stats {
  display: grid;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
}

.activity {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 3.5rem;
  margin-top: 0.5rem;
}

.activity-bar {
  flex: 1;
  border-radius: 3px 3px 1px 1px;
}

.activity-bar--empty {
  background: var(--el-fill-color);
}
</style>
