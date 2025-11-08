<template>
  <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl animate-pulse">
    <div class="mb-4 overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 h-48"></div>
    
    <div class="flex items-center gap-2 mb-2">
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
    </div>

    <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>

    <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
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

