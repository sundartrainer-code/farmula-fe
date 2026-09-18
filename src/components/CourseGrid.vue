<script setup>
import CourseCard from "./CourseCard.vue"

defineProps({
  courses: { type: Array, default: () => [] },
})

defineEmits(["continue"])
</script>

<template>
  <!-- <section>
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-black uppercase text-cyan-500">My Courses</p>
        <h2 class="mt-1 text-3xl font-black">Continue your learning</h2>
      </div>
    </div>

    <div v-if="courses.length" class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <CourseCard v-for="course in courses" :key="course.id" :course="course" @continue="$emit('continue', $event)" />
    </div>

    <section v-else class="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p class="text-sm font-black uppercase text-cyan-500">No courses assigned</p>
      <h3 class="mt-3 text-3xl font-black">No courses have been assigned yet.</h3>
      <p class="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">
        Assigned courses will appear here as soon as they are added.
      </p>
    </section>
  </section> -->
</template>
