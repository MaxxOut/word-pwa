<template>
  <!-- десктоп сайдбар -->
  <aside v-if="!isMobile" class="sidebar">
    <SidebarContent />
  </aside>

  <!-- мобила — хедер + drawer -->
  <template v-else>
    <header class="mobile-header">
      <el-button :icon="icon('menu')" text @click="drawerOpen = true" />
      <AppLogo />
      <span class="mobile-header-spacer" />
    </header>

    <el-drawer
        v-model="drawerOpen"
        direction="ltr"
        :with-header="false"
        size="260px"
    >
      <SidebarContent @navigate="drawerOpen = false" />
    </el-drawer>
  </template>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { icon } from '../utils/icons.js'
import SidebarContent from './SidebarContent.vue'
import AppLogo from './AppLogo.vue'

const drawerOpen = ref(false)
const isMobile   = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  z-index: 100;
}

.mobile-header-spacer {
  width: 32px;
}
</style>
