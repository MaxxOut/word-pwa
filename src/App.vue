<script setup>
import AppSidebar from './shared/components/AppSidebar.vue'
import { elementLocale } from './i18n/index.js'
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <div class="app-layout">
      <AppSidebar />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </el-config-provider>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  min-height: 100vh;
  max-width: 1440px;
  margin: 0 auto;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
  padding: 1.5rem;
}

/* мобила */
@media (max-width: 768px) {
  .app-main {
    padding: 1rem;
    margin-top: 56px;
  }
}
</style>
