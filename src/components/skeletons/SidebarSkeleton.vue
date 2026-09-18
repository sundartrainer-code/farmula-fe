<template>
  <aside class="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
    <div class="flex items-center gap-3">
      <div class="skeleton-shimmer h-11 w-11 rounded-lg" />
      <div class="space-y-2">
        <div class="skeleton-shimmer h-6 w-28 rounded" />
        <div class="skeleton-shimmer h-3 w-32 rounded" />
      </div>
    </div>
    <div class="mt-10 space-y-3">
      <div v-for="item in 5" :key="item" class="skeleton-shimmer h-12 rounded-lg" />
    </div>
  </aside>
</template>
