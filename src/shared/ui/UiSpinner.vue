<template>
  <div class="spinner-wrap" role="status">
    <span class="spinner" />
    <span class="sr-only">{{ $t('common.loading') }}</span>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: grid;
  place-items: center;
  padding: 3rem 0;
}
.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid var(--primary-c);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
