<template>
  <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl animate-pulse">
    <div class="flex items-start justify-between mb-4">
      <div class="space-y-2 flex-1">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
    </div>

    <div class="space-y-3 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-32"></div>
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

