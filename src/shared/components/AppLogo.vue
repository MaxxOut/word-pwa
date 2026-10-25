<template>
  <div class="logo" @click="router.push({ name: 'home' })">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="8" fill="var(--color-accent)"/>
      <text x="14" y="20" text-anchor="middle" font-size="16" font-weight="bold" fill="white">W</text>
    </svg>
    <span class="logo-text">WordApp</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0 0.25rem;
}
.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
</style>
