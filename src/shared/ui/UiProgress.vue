<script setup>
// линейный прогресс, value 0–100
defineProps({
  value: { type: Number, default: 0 },
})
</script>

<template>
  <div class="progress" role="progressbar" :aria-valuenow="Math.round(value)" aria-valuemin="0" aria-valuemax="100">
    <div class="bar" :style="{ width: `${Math.min(100, Math.max(0, value))}%` }" />
  </div>
</template>

<style scoped>
.progress {
  height: 0.375rem;
  border-radius: 0.1875rem;
  background: var(--container-hi);
  overflow: hidden;
}
.bar {
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
  transition: width 0.3s;
}
</style>
