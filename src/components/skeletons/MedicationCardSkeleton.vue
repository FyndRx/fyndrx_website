<template>
  <div class="p-5 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10 animate-pulse">
    <div class="mb-4 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700 h-48"></div>

    <div class="flex items-center gap-2 mb-2">
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
    </div>

    <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>

    <div class="flex items-center justify-between pt-4 border-t border-gray-200/70 dark:border-white/10">
      <div class="space-y-2">
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
