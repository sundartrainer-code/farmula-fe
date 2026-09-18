<script setup>
defineProps({
  course: { type: Object, required: true },
})

defineEmits(["continue"])
</script>

<template>
  <article class="card overflow-hidden">
    <img :src="course.thumbnail" :alt="course.title" class="h-44 w-full object-cover" />
    <div class="p-5">
      <div class="flex items-center justify-between gap-3">
        <span class="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-600 dark:text-cyan-300">{{ course.lessonCount }} lessons</span>
        <span class="text-sm font-bold text-slate-500 dark:text-slate-400">{{ course.totalDuration }}</span>
      </div>
      <h3 class="mt-4 text-xl font-black">{{ course.title }}</h3>
      <p class="mt-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">{{ course.instructor }}</p>
      <p class="mt-2 line-clamp-2 text-slate-500 dark:text-slate-400">{{ course.description }}</p>
      <div class="mt-5 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
        <div class="h-2 rounded-full bg-cyan-500" :style="{ width: `${course.progress?.completionPercentage || 0}%` }" />
      </div>
      <p class="mt-2 text-sm font-bold text-slate-500">{{ course.progress?.completionPercentage || 0 }}% complete</p>
      <button class="btn-primary mt-5 w-full" type="button" @click="$emit('continue', course)">
        Continue Learning
      </button>
    </div>
  </article>
</template>
