<template>
  <section class="card max-w-3xl p-6">
    <div class="flex items-center gap-4">
      <div class="skeleton-shimmer h-16 w-16 rounded-full" />
      <div class="space-y-3">
        <div class="skeleton-shimmer h-7 w-48 rounded" />
        <div class="skeleton-shimmer h-4 w-64 rounded" />
      </div>
    </div>
    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      <div v-for="item in 4" :key="item" class="skeleton-shimmer h-20 rounded-lg" />
    </div>
  </section>
</template>
