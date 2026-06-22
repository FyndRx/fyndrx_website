<template>
  <div class="py-12 space-y-8 animate-pulse">

    <!-- Main info card -->
    <div class="bg-white dark:bg-[#161c2c] rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xl overflow-hidden">
      <div class="p-8">
        <div class="flex flex-col gap-10 md:flex-row">

          <!-- Image -->
          <div class="w-full md:w-1/3 shrink-0">
            <div class="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <!-- Details -->
          <div class="flex-1 space-y-5">
            <div class="flex gap-2 flex-wrap">
              <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            </div>
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-2/3"></div>
            <div class="flex items-center gap-4">
              <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-36"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            <!-- Form / brand tabs -->
            <div class="flex gap-2 flex-wrap">
              <div v-for="i in 4" :key="i" class="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-20"></div>
            </div>
            <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-44"></div>
          </div>

        </div>
      </div>
    </div>

    <!-- Pharmacies card -->
    <div class="bg-white dark:bg-[#161c2c] rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-xl">
      <div class="p-8">
        <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
        <div class="space-y-3">
          <div
            v-for="i in 4"
            :key="i"
            class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5"></div>
              <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div class="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-28 shrink-0"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Related medications -->
    <div>
      <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-52 mb-6"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 4"
          :key="i"
          class="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md"
        >
          <div class="h-36 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
          <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

  </div>
</template>
