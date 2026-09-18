<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import AppShell from "../components/AppShell.vue"
import LessonPlaylist from "../components/LessonPlaylist.vue"
import VideoPlayer from "../components/VideoPlayer.vue"
import LessonSkeleton from "../components/skeletons/LessonSkeleton.vue"
import { api } from "../services/api"
import { useDashboardStore } from "../stores/dashboard"
import { useVideoStore } from "../stores/video"

const route = useRoute()
const router = useRouter()
const dashboard = useDashboardStore()
const videoStore = useVideoStore()
const countdown = ref(0)
const prefersReducedData = Boolean(navigator.connection?.saveData)
let countdownTimer
let progressSaveQueue = Promise.resolve()

const lessons = computed(() => videoStore.videos)
const currentIndex = computed(() => lessons.value.findIndex((lesson) => lesson.id === route.params.lessonId))
const lesson = computed(() => lessons.value[currentIndex.value] || null)
const previousLesson = computed(() => currentIndex.value > 0 ? lessons.value[currentIndex.value - 1] : null)
const nextLesson = computed(() => currentIndex.value >= 0 ? lessons.value[currentIndex.value + 1] || null : null)

function saveProgress(position, completed = false) {
  const lessonId = lesson.value?.id
  if (!lessonId) return Promise.resolve()

  progressSaveQueue = progressSaveQueue
    .catch(() => {})
    .then(async () => {
      await api.put(`/progress/${lessonId}`, {
        currentTime: position,
        completed,
      })
      videoStore.updateProgress(lessonId, position, completed)
    })
    .catch(() => {})

  return progressSaveQueue
}

function selectLesson(item) {
  router.push(`/lessons/${item.id}`)
}

function cancelCountdown() {
  window.clearInterval(countdownTimer)
  countdown.value = 0
}

function startNextCountdown() {
  if (!nextLesson.value) return
  cancelCountdown()
  countdown.value = 5
  countdownTimer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value > 0) return
    const target = nextLesson.value
    cancelCountdown()
    if (target) selectLesson(target)
  }, 1000)
}

onMounted(async () => {
  await Promise.all([
    dashboard.load().catch(() => null),
    videoStore.load().catch(() => null),
  ])
  if (!lesson.value && lessons.value.length) router.replace(`/lessons/${lessons.value[0].id}`)
})

watch(() => route.params.lessonId, cancelCountdown)
onBeforeUnmount(cancelCountdown)
</script>

<template>
  <AppShell>
    <LessonSkeleton v-if="dashboard.loading || videoStore.loading" />
    <section v-else-if="lesson" class="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
      <main class="min-w-0">
        <div class="relative">
          <VideoPlayer
            :key="lesson.id"
            :lesson-id="lesson.id"
            :start-seconds="lesson.watchedSeconds"
            :autoplay="!prefersReducedData"
            @progress="saveProgress($event)"
            @completed="saveProgress($event, true)"
            @ended="startNextCountdown"
          />
          <div v-if="countdown" class="absolute inset-0 z-40 grid place-items-center bg-black/80 text-center text-white">
            <div>
              <p class="text-sm font-black uppercase text-cyan-400">Next lesson</p>
              <p class="mt-2 text-6xl font-black">{{ countdown }}</p>
              <button class="btn-muted mt-4" type="button" @click="cancelCountdown">Cancel</button>
            </div>
          </div>
        </div>

        <header class="mt-6 min-w-0">
          <p class="text-sm font-black uppercase text-cyan-500">{{ lesson.courseName }}</p>
          <h1 class="mt-2 break-words text-2xl font-black sm:text-3xl">{{ lesson.title }}</h1>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>{{ lesson.isIntroduction ? "Introduction" : `Episode ${lesson.lessonNumber}` }}</span>
            <span>{{ lesson.durationFormatted }}</span>
            <span>{{ lesson.progressPercent }}% complete</span>
          </div>
          <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-full rounded-full bg-cyan-500 transition-[width] duration-500" :style="{ width: `${lesson.progressPercent}%` }" />
          </div>
        </header>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <button class="btn-muted" :disabled="!previousLesson" type="button" @click="previousLesson && selectLesson(previousLesson)">← Previous Lesson</button>
          <button class="btn-primary" :disabled="!nextLesson" type="button" @click="nextLesson && selectLesson(nextLesson)">Next Lesson →</button>
        </div>

      </main>

      <LessonPlaylist :lessons="lessons" :current-id="lesson.id" @select="selectLesson" />
    </section>
  </AppShell>
</template>
