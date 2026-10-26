<script setup>
// логотип: буква W из Montserrat Alternates (контур), цвета — из темы.
// Тот же контур в public/icon.svg (иконка приложения)
defineProps({
  size: { type: String, default: '2rem' },
})
</script>

<template>
  <svg class="logo" :style="{ width: size, height: size }" viewBox="0 0 512 512" aria-hidden="true">
    <rect width="512" height="512" rx="112" class="logo-bg" />
    <path class="logo-w" d="M378.6 135.0L434.0 135.0L434.0 275.4Q434.0 325.0 407.1 351.0Q380.3 377.0 331.0 377.0L331.0 377.0Q306.5 377.0 287.3 369.9Q268.1 362.8 255.8 349.8L255.8 349.8Q243.3 362.8 224.2 369.9Q205.2 377.0 181.0 377.0L181.0 377.0Q131.7 377.0 104.9 351.0Q78.0 325.0 78.0 275.4L78.0 275.4L78.0 135.0L133.1 135.0L133.1 273.7Q133.1 302.6 145.0 316.4Q156.9 330.1 180.3 330.1L180.3 330.1Q228.3 330.1 228.3 273.7L228.3 273.7L228.3 135.0L283.4 135.0L283.4 273.7Q283.4 330.1 331.6 330.1L331.6 330.1Q378.6 330.1 378.6 273.7L378.6 273.7L378.6 135.0Z" />
  </svg>
</template>

<style scoped>
.logo { flex-shrink: 0; display: block; }
.logo-bg { fill: var(--primary); }
.logo-w  { fill: var(--on-primary); }
</style>
