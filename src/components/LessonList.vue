<script setup>
import LazyThumbnail from "./LazyThumbnail.vue"

defineProps({
  lessons: { type: Array, default: () => [] },
})

defineEmits(["watch"])
</script>

<template>
  <section class="card p-5">
    <h3 class="text-xl font-black">Lessons</h3>
    <div class="mt-5 space-y-3">
      <article v-for="lesson in lessons" :key="lesson.id" class="flex gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <div class="h-20 w-28 shrink-0 overflow-hidden rounded-lg">
          <LazyThumbnail
            :src="lesson.thumbnail"
            :alt="lesson.title"
            :lesson-id="lesson.id"
            :duration-seconds="lesson.durationSeconds"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-black uppercase text-cyan-500">Lesson {{ lesson.order }}</p>
          <h4 class="mt-1 truncate font-black">{{ lesson.title }}</h4>
          <p class="mt-1 text-sm text-slate-500">{{ lesson.duration }} · {{ lesson.completed ? "Completed" : "In progress" }}</p>
        </div>
        <button class="btn-primary self-center px-4 py-2" type="button" @click="$emit('watch', lesson)">Watch</button>
      </article>
    </div>
  </section>
</template>
