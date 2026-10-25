<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLibraryStore } from '../../stores/library.js'
import AppLogo from './AppLogo.vue'
import AppIcon from './AppIcon.vue'

const router  = useRouter()
const route   = useRoute()
const { t }   = useI18n()
const library = useLibraryStore()

const emit = defineEmits(['navigate'])

const items = [
  { name: 'home',     icon: 'home',     label: 'nav.home' },
  { name: 'words',    icon: 'words',    label: 'nav.words' },
  { name: 'study',    icon: 'study',    label: 'nav.study' },
  { name: 'repeat',   icon: 'repeat',   label: 'nav.repeat' },
  { name: 'settings', icon: 'settings', label: 'nav.settings' },
]

function navigate(name) {
  router.push({ name })
  emit('navigate')
}
</script>

<template>
  <div class="sidebar-inner">

    <div class="sidebar-logo">
      <AppLogo />
    </div>

    <!-- активная библиотека -->
    <el-select
        class="library-select"
        :model-value="library.current?.id"
        @change="library.select"
    >
      <el-option
          v-for="lib in library.libraries"
          :key="lib.id"
          :value="lib.id"
          :label="lib.short_name"
      >
        <span class="lib-option">
          <span class="lib-dot" :style="{ backgroundColor: lib.color }" />
          {{ lib.short_name }} · {{ t(`libraries.${lib.id}`) }}
        </span>
      </el-option>
    </el-select>

    <el-menu :default-active="route.name" class="sidebar-menu">
      <el-menu-item
          v-for="item in items"
          :key="item.name"
          :index="item.name"
          @click="navigate(item.name)"
      >
        <AppIcon :name="item.icon" />
        <span>{{ t(item.label) }}</span>
      </el-menu-item>
    </el-menu>

  </div>
</template>

<style scoped>
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem 0;
}

.sidebar-logo {
  padding: 0 1rem 1rem;
  border-bottom: 1px solid var(--el-border-color);
}

.library-select {
  margin: 0.75rem 1rem;
  width: auto;
}

.lib-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.lib-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
}
</style>
