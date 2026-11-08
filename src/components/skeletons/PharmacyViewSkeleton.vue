<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900 animate-pulse">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">

      <!-- Back button -->
      <div class="mb-6">
        <div class="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>

      <!-- Hero card -->
      <div class="mb-12 overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-3xl h-[450px] relative">
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <!-- Top-right badges -->
        <div class="absolute top-8 right-8 flex gap-3">
          <div class="h-9 w-24 bg-white/20 rounded-full"></div>
        </div>

        <!-- Bottom info overlay -->
        <div class="absolute bottom-0 left-0 right-0 p-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div class="flex items-end gap-6">
              <!-- Logo -->
              <div class="w-16 h-16 rounded-2xl bg-white/20 shrink-0"></div>
              <div class="space-y-3 pb-1">
                <!-- Name -->
                <div class="h-8 w-64 bg-white/25 rounded-xl"></div>
                <!-- Tagline -->
                <div class="h-4 w-40 bg-white/15 rounded-lg"></div>
                <!-- Stats row -->
                <div class="flex gap-6 pt-1">
                  <div class="h-4 w-20 bg-white/15 rounded"></div>
                  <div class="h-4 w-24 bg-white/15 rounded"></div>
                  <div class="h-4 w-16 bg-white/15 rounded"></div>
                </div>
              </div>
            </div>
            <!-- Action buttons -->
            <div class="flex gap-3">
              <div class="h-10 w-28 bg-white/20 rounded-xl"></div>
              <div class="h-10 w-28 bg-white/20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-column grid -->
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">

        <!-- Left: Main content (2 cols) -->
        <div class="lg:col-span-2 space-y-12">

          <!-- Tab card -->
          <div class="bg-white/70 backdrop-blur-md dark:bg-gray-800/60 rounded-3xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-white/10 shadow-card">
            <!-- Tab nav -->
            <div class="border-b border-gray-200/70 dark:border-white/10 px-6 sm:px-8">
              <div class="flex gap-8 py-4">
                <div class="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>

            <!-- Tab content: Overview skeleton -->
            <div class="p-6 sm:p-8 space-y-10">

              <!-- Facility Profile -->
              <div class="space-y-4">
                <div class="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="bg-white/60 dark:bg-white/5 p-6 rounded-2xl ring-1 ring-gray-200/70 dark:ring-white/10 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>

              <!-- Operating Hours -->
              <div class="space-y-4">
                <div class="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="bg-white/60 dark:bg-white/5 p-6 rounded-2xl ring-1 ring-gray-200/70 dark:ring-white/10 space-y-3">
                  <div v-for="i in 7" :key="i" class="flex justify-between items-center">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                  </div>
                </div>
              </div>

              <!-- Quick Connect -->
              <div class="space-y-4">
                <div class="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-5 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-gray-800/60 ring-1 ring-gray-200/70 dark:ring-white/10 shadow-sm">
                    <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl shrink-0"></div>
                    <div class="space-y-2">
                      <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Map card -->
          <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>

        </div>

        <!-- Right: Inventory panel (1 col) -->
        <div class="space-y-6">
          <div class="bg-white/70 backdrop-blur-md dark:bg-gray-800/60 rounded-3xl ring-1 ring-gray-200/70 dark:ring-white/10 shadow-card p-6 space-y-6">
            <!-- Heading -->
            <div class="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <!-- Search bar -->
            <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <!-- Filter chips -->
            <div class="flex flex-wrap gap-2">
              <div v-for="i in 4" :key="i" class="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            </div>
            <!-- Medication cards -->
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="i in 4"
                :key="i"
                class="rounded-2xl overflow-hidden ring-1 ring-gray-200/70 dark:ring-white/10"
              >
                <div class="h-32 bg-gray-200 dark:bg-gray-700"></div>
                <div class="p-4 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div class="flex justify-between items-center pt-1">
                    <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
