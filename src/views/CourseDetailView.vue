<script setup>
import { computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import AppShell from "../components/AppShell.vue"
import LessonList from "../components/LessonList.vue"
import SubscriptionPlans from "../components/SubscriptionPlans.vue"
import SkeletonCard from "../components/ui/SkeletonCard.vue"
import { useLmsStore } from "../stores/lms"

const lms = useLmsStore()
const route = useRoute()
const router = useRouter()
const courseData = computed(() => lms.currentCourse)
const dashboardCourse = computed(() => lms.dashboard?.courses?.find((course) => course.id === route.params.courseId))
const course = computed(() => dashboardCourse.value || courseData.value?.course)
const lessons = computed(() => dashboardCourse.value?.lessons || courseData.value?.lessons || [])
const firstLesson = computed(() => lessons.value?.[0])
const hasActiveSubscription = computed(() => Boolean(lms.dashboard?.subscription?.active || courseData.value?.purchased))

onMounted(async () => {
  await Promise.all([lms.loadDashboard(), lms.loadCourse(route.params.courseId), lms.loadPlans()])
})
</script>

<template>
  <AppShell>
    <SkeletonCard v-if="lms.loading" type="course-detail" />
    <section v-else-if="lms.error" class="card border-red-300 p-8 text-red-500">{{ lms.error }}</section>
    <SubscriptionPlans v-else-if="!hasActiveSubscription" />
    <div v-else-if="course" class="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section class="card overflow-hidden">
        <img v-if="course.thumbnail" :src="course.thumbnail" alt="" class="h-72 w-full object-cover" />
        <div v-else class="grid h-72 place-items-center bg-slate-100 text-5xl font-black text-slate-300 dark:bg-slate-800 dark:text-slate-700">F</div>
        <div class="p-6">
          <p class="text-sm font-black uppercase text-cyan-500">Formula Course</p>
          <h2 class="mt-2 text-3xl font-black">{{ course.title }}</h2>
          <p class="mt-2 text-sm font-bold text-cyan-600 dark:text-cyan-300">{{ course.instructor || "Formula Faculty" }}</p>
          <p class="mt-4 max-w-3xl text-slate-500 dark:text-slate-400">{{ course.description }}</p>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-xs font-black uppercase text-slate-500">Lessons</p>
              <p class="mt-1 text-xl font-black">{{ course.lessonCount || lessons.length }}</p>
            </div>
            <div class="rounded-lg bg-slate-100 p-4 dark:bg-slate-800">
              <p class="text-xs font-black uppercase text-slate-500">Duration</p>
              <p class="mt-1 text-xl font-black">{{ course.totalDuration || "0 min" }}</p>
            </div>
          </div>
          <div class="mt-6 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-2 rounded-full bg-cyan-500" :style="{ width: `${course.progress?.completionPercentage || courseData?.progress?.completionPercentage || 0}%` }" />
          </div>
          <p class="mt-2 text-sm font-bold">{{ course.progress?.completionPercentage || courseData?.progress?.completionPercentage || 0 }}% complete</p>
          <button v-if="firstLesson" class="btn-primary mt-6" @click="router.push(`/lessons/${firstLesson.id}`)">Continue watching</button>
        </div>
      </section>

      <aside class="space-y-5">
        <LessonList :lessons="lessons" @watch="router.push(`/lessons/${$event.id}`)" />
      </aside>
    </div>
  </AppShell>
</template>
