<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import {
  BookOpen,
  Check,
  CirclePlay,
  Crown,
  Play,
  Settings,
} from "@lucide/vue"
import LazyThumbnail from "./LazyThumbnail.vue"
import { useAuthStore } from "../stores/auth"
import { formatVideoTime, relativeTime } from "../utils/video"

const props = defineProps({
  subscription: { type: Object, required: true },
  stats: { type: Object, default: () => ({}) },
  recentVideos: { type: Array, default: () => [] },
})

const emit = defineEmits(["play-video"])
const router = useRouter()
const auth = useAuthStore()
const firstName = computed(() => (auth.user?.displayName || auth.user?.email || "Student").split(" ")[0])
const continueVideo = computed(() => props.recentVideos.find((video) => video.watchedSeconds > 0) || props.recentVideos[0])
const progress = computed(() => Math.max(0, Math.min(100, Number(props.stats.overallProgress || 0))))
const recentActivity = computed(() => props.recentVideos.slice(0, 3).map((video) => ({
  id: video.id,
  label: video.completed ? `Completed ${video.title}` : `Watched ${video.title}`,
  time: relativeTime(video.lastWatchedAt),
  completed: video.completed,
})))
</script>

<template>
  <section class="dashboard-premium space-y-5">
   
    <div class="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <article class="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 text-white shadow-xl">
        <div class="grid gap-5 p-6 sm:grid-cols-2 xl:grid-cols-[auto_1.5fr_repeat(2,1fr)]">
          <span class="grid h-16 w-16 place-items-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-400">
            <Crown :size="34" />
          </span>
          <div class="min-w-0">
            <p class="text-xs text-slate-400">Current Plan</p>
            <h2 class="mt-1 truncate text-xl font-black">{{ subscription.plan }}</h2>
            <p class="mt-1 text-sm text-slate-400">Renews on {{ new Date(subscription.expiryDate).toLocaleDateString() }}</p>
          </div>
          <div class="border-slate-800 xl:border-l xl:pl-5">
            <p class="text-xs text-slate-400">Days Remaining</p>
            <p class="mt-2 text-2xl font-black">{{ subscription.remainingDays }}</p>
          </div>
          <div class="border-slate-800 xl:border-l xl:pl-5">
            <p class="text-xs text-slate-400">Videos Completed</p>
            <p class="mt-2 text-2xl font-black"><span class="text-emerald-400">{{ stats.completedVideos || 0 }}</span> / {{ stats.totalVideos || 0 }}</p>
          </div>
        </div>
        <div class="border-t border-slate-800 p-6">
          <div class="flex justify-between text-sm font-bold"><span>Overall Progress</span><span>{{ progress }}%</span></div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div class="h-full rounded-full bg-cyan-400 transition-[width] duration-700" :style="{ width: `${progress}%` }" />
          </div>
        </div>
      </article>

      <article class="rounded-lg border border-slate-800 bg-slate-900 p-5 text-white shadow-xl">
        <h2 class="font-black">Quick Actions</h2>
        <div class="mt-4 space-y-3">
          <button class="flex w-full items-center gap-3 text-left" type="button" @click="continueVideo && emit('play-video', continueVideo)">
            <span class="grid h-11 w-11 place-items-center rounded-lg bg-cyan-500 text-slate-950"><CirclePlay /></span>
            <span><strong class="block">Continue Learning</strong><small class="text-slate-400">Pick up where you left off</small></span>
          </button>
          <button class="flex w-full items-center gap-3 text-left" type="button" @click="router.push('/pricing')">
            <span class="grid h-11 w-11 place-items-center rounded-lg bg-amber-500/20 text-amber-400"><Settings /></span>
            <span><strong class="block">Manage Subscription</strong><small class="text-slate-400">Update or extend your plan</small></span>
          </button>
        </div>
      </article>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article class="rounded-lg border border-emerald-500/30 bg-slate-900 p-5 text-white">
        <div class="flex min-w-0 items-start justify-between gap-4"><div class="min-w-0"><p class="font-black text-emerald-400">Courses</p><p class="mt-3 text-3xl font-black">{{ stats.totalCourses || 0 }}</p><p class="mt-2 text-sm text-emerald-400">Active</p></div><BookOpen class="shrink-0 text-emerald-400" :size="40" /></div>
      </article>
      <article class="rounded-lg border border-violet-500/30 bg-slate-900 p-5 text-white">
        <div class="flex min-w-0 items-start justify-between gap-4"><div class="min-w-0"><p class="font-black text-violet-400">Videos</p><p class="mt-3 text-3xl font-black">{{ stats.totalVideos || 0 }}</p><p class="mt-2 text-sm text-slate-400">{{ stats.completedVideos || 0 }} completed</p></div><CirclePlay class="shrink-0 text-violet-400" :size="40" /></div>
      </article>
      <article class="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-slate-900 p-5 text-white">
        <div><p class="font-black text-cyan-400">Total Progress</p><p class="mt-3 text-3xl font-black">{{ progress }}%</p></div>
        <div class="grid h-20 w-20 place-items-center rounded-full border-[10px] border-cyan-400/20 text-lg font-black">{{ progress }}%</div>
      </article>
    </div>

    <div class="grid min-w-0 items-stretch gap-5 xl:grid-cols-7">
      <article class="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-5 text-white xl:col-span-4">
        <h2 class="text-lg font-black">Continue Watching</h2>
        <div v-if="continueVideo" class="mt-5 grid min-w-0 gap-4 2xl:grid-cols-[minmax(180px,210px)_minmax(0,1fr)]">
          <div class="relative overflow-hidden rounded-lg"><LazyThumbnail :src="continueVideo.thumbnailUrl" :alt="continueVideo.title" :lesson-id="continueVideo.id" :duration-seconds="continueVideo.durationSeconds" /><span class="absolute inset-0 grid place-items-center"><Play class="rounded-full bg-white p-3 text-slate-950" :size="52" fill="currentColor" /></span><span class="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-black">{{ continueVideo.durationFormatted }}</span></div>
          <div class="flex min-w-0 flex-col justify-center overflow-hidden">
            <h3 class="line-clamp-2 font-black">{{ continueVideo.title }}</h3>
            <div class="mt-4 flex min-w-0 items-center justify-between gap-3 text-xs text-slate-400"><span class="truncate">{{ formatVideoTime(continueVideo.watchedSeconds) }} / {{ continueVideo.durationFormatted }}</span><span class="shrink-0">{{ continueVideo.progressPercent }}%</span></div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div class="h-full bg-cyan-400" :style="{ width: `${continueVideo.progressPercent}%` }" /></div>
            <button class="btn-primary mt-4 w-full whitespace-nowrap" type="button" @click="emit('play-video', continueVideo)">Continue →</button>
          </div>
        </div>
      </article>

      <article class="min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-5 text-white xl:col-span-3">
        <h2 class="text-lg font-black">Recent Activity</h2>
        <div class="mt-4 divide-y divide-slate-800">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex min-w-0 items-center gap-3 py-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg" :class="activity.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-500/20 text-violet-400'"><Check v-if="activity.completed" :size="18" /><Play v-else :size="18" /></span>
            <p class="min-w-0 flex-1 truncate text-sm font-bold">{{ activity.label }}</p><span class="shrink-0 text-xs text-slate-500">{{ activity.time }}</span>
          </div>
        </div>
      </article>

    </div>
  </section>
</template>
