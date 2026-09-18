<template>
  <section class="card max-w-3xl p-6">
    <div class="skeleton-shimmer h-8 w-48 rounded" />
    <div class="mt-6 space-y-4">
      <div v-for="item in 5" :key="item" class="skeleton-shimmer h-14 rounded-lg" />
    </div>
  </section>
</template>
