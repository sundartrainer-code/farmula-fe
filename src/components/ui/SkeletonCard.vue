<script setup>
defineProps({
  type: { type: String, default: "course" },
  count: { type: Number, default: 1 },
})
</script>

<template>
  <div v-if="type === 'course-grid'" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    <article v-for="item in count" :key="item" class="card overflow-hidden">
      <div class="skeleton-shimmer h-44" />
      <div class="space-y-4 p-5">
        <div class="flex items-center justify-between">
          <div class="skeleton-shimmer h-7 w-20 rounded-full" />
          <div class="skeleton-shimmer h-4 w-16 rounded-full" />
        </div>
        <div class="skeleton-shimmer h-6 w-4/5 rounded" />
        <div class="skeleton-shimmer h-4 w-full rounded" />
        <div class="skeleton-shimmer h-4 w-3/4 rounded" />
        <div class="skeleton-shimmer h-2 w-full rounded-full" />
        <div class="skeleton-shimmer h-11 w-full rounded-lg" />
      </div>
    </article>
  </div>

  <div v-else-if="type === 'dashboard'" class="space-y-8">
    <section class="rounded-lg bg-white p-6 shadow-xl dark:bg-slate-900">
      <div class="skeleton-shimmer h-4 w-40 rounded" />
      <div class="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div class="w-full max-w-2xl space-y-4">
          <div class="skeleton-shimmer h-9 w-3/4 rounded" />
          <div class="skeleton-shimmer h-4 w-full rounded" />
          <div class="skeleton-shimmer h-4 w-2/3 rounded" />
        </div>
        <div class="skeleton-shimmer h-12 w-36 rounded-lg" />
      </div>
    </section>
    <section class="card p-6">
      <div class="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div class="space-y-3">
          <div class="skeleton-shimmer h-4 w-32 rounded" />
          <div class="skeleton-shimmer h-8 w-56 rounded" />
          <div class="skeleton-shimmer h-4 w-72 rounded" />
        </div>
        <div class="skeleton-shimmer h-12 w-32 rounded-lg" />
      </div>
      <div class="skeleton-shimmer mt-5 h-2 w-full rounded-full" />
    </section>
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="item in 3" :key="item" class="card overflow-hidden">
        <div class="skeleton-shimmer h-44" />
        <div class="space-y-4 p-5">
          <div class="flex items-center justify-between">
            <div class="skeleton-shimmer h-7 w-20 rounded-full" />
            <div class="skeleton-shimmer h-4 w-16 rounded-full" />
          </div>
          <div class="skeleton-shimmer h-6 w-4/5 rounded" />
          <div class="skeleton-shimmer h-4 w-full rounded" />
          <div class="skeleton-shimmer h-4 w-3/4 rounded" />
          <div class="skeleton-shimmer h-2 w-full rounded-full" />
          <div class="skeleton-shimmer h-11 w-full rounded-lg" />
        </div>
      </article>
    </div>
  </div>

  <div v-else-if="type === 'course-detail'" class="grid gap-6 xl:grid-cols-[1fr_360px]">
    <section class="card overflow-hidden">
      <div class="skeleton-shimmer h-72" />
      <div class="space-y-5 p-6">
        <div class="skeleton-shimmer h-4 w-36 rounded" />
        <div class="skeleton-shimmer h-9 w-3/5 rounded" />
        <div class="skeleton-shimmer h-4 w-full rounded" />
        <div class="skeleton-shimmer h-4 w-4/5 rounded" />
        <div class="skeleton-shimmer h-16 w-full rounded-lg" />
        <div class="skeleton-shimmer h-2 w-full rounded-full" />
        <div class="skeleton-shimmer h-12 w-44 rounded-lg" />
      </div>
    </section>
    <aside class="card p-5">
      <div class="skeleton-shimmer h-7 w-28 rounded" />
      <div class="mt-6 space-y-3">
        <div v-for="item in 5" :key="item" class="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div class="skeleton-shimmer h-4 w-16 rounded" />
          <div class="skeleton-shimmer mt-3 h-5 w-4/5 rounded" />
          <div class="skeleton-shimmer mt-2 h-4 w-28 rounded" />
        </div>
      </div>
    </aside>
  </div>

  <div v-else-if="type === 'lesson'" class="grid gap-6 xl:grid-cols-[1fr_340px]">
    <section>
      <div class="skeleton-shimmer h-4 w-40 rounded" />
      <div class="skeleton-shimmer mt-3 h-9 w-2/3 rounded" />
      <div class="skeleton-shimmer mt-3 h-4 w-4/5 rounded" />
      <div class="skeleton-shimmer mt-6 aspect-video w-full rounded-lg" />
    </section>
    <aside class="card p-5">
      <div class="skeleton-shimmer h-7 w-28 rounded" />
      <div class="skeleton-shimmer mt-5 h-4 w-full rounded" />
      <div class="skeleton-shimmer mt-3 h-4 w-4/5 rounded" />
      <div class="skeleton-shimmer mt-6 h-12 w-full rounded-lg" />
    </aside>
  </div>

  <div v-else-if="type === 'pricing'" class="mt-10 grid gap-6 md:grid-cols-3">
    <article v-for="item in count" :key="item" class="flex min-h-[33rem] flex-col rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900/70">
      <div class="skeleton-shimmer h-8 w-36 rounded" />
      <div class="skeleton-shimmer mt-10 h-14 w-44 rounded" />
      <div class="skeleton-shimmer mt-4 h-4 w-32 rounded" />
      <div class="mt-10 space-y-4">
        <div v-for="line in 4" :key="line" class="flex items-center gap-3">
          <div class="skeleton-shimmer h-6 w-6 rounded-full" />
          <div class="skeleton-shimmer h-4 w-48 rounded" />
        </div>
      </div>
      <div class="mt-auto space-y-4 pt-10">
        <div class="skeleton-shimmer h-14 w-full rounded-lg" />
      </div>
    </article>
  </div>

  <article v-else class="card overflow-hidden">
    <div class="skeleton-shimmer h-48" />
    <div class="space-y-4 p-5">
      <div class="skeleton-shimmer h-5 w-4/5 rounded-full" />
      <div class="skeleton-shimmer h-4 w-3/5 rounded-full" />
      <div class="flex items-center justify-between pt-3">
        <div class="skeleton-shimmer h-4 w-20 rounded-full" />
        <div class="skeleton-shimmer h-10 w-24 rounded-lg" />
      </div>
    </div>
  </article>
</template>
