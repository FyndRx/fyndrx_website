<template>
  <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl animate-pulse">
    <div class="flex items-start gap-4 mb-4">
      <div class="flex-shrink-0 w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
      <div class="flex-1 space-y-2">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div class="flex gap-2">
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    </div>

    <div class="space-y-2 mb-4">
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
      <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
    </div>

    <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
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

