<script setup>
import LazyThumbnail from "./LazyThumbnail.vue"
import { formatVideoTime, relativeTime } from "../utils/video"

defineProps({
  video: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})

defineEmits(["play"])

</script>

<template>
  <article class="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-2xl dark:border-white/10 dark:bg-slate-900/90 dark:hover:shadow-cyan-950/30">
    <LazyThumbnail
      :src="video.thumbnailUrl"
      :alt="video.title"
      :lesson-id="video.id"
      :duration-seconds="video.durationSeconds"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div class="absolute inset-0 grid place-items-center">
        <span class="grid h-12 w-12 place-items-center rounded-full bg-white/90 pl-1 text-xl text-slate-950 shadow-xl transition group-hover:scale-110">▶</span>
      </div>
      <span class="absolute bottom-3 right-3 rounded-md bg-black/85 px-2 py-1 text-xs font-black text-white">
        {{ video.durationFormatted }}
      </span>
    </LazyThumbnail>

    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <div class="flex min-w-0 items-center gap-2">
        <span class="max-w-[70%] truncate rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-black text-cyan-300">
          {{ video.courseName }}
        </span>
        <span class="shrink-0 text-xs font-bold text-slate-400">Episode {{ video.lessonNumber }}</span>
      </div>

      <h2 class="mt-3 line-clamp-2 min-h-[3rem] break-words text-base font-black leading-6 text-slate-950 dark:text-white" :title="video.title">
        {{ video.title }}
      </h2>

      <div class="mt-4">
        <div class="flex items-center justify-between gap-3 text-xs font-bold text-slate-400">
          <span>{{ formatVideoTime(video.watchedSeconds) }} / {{ video.durationFormatted }}</span>
          <span>{{ video.progressPercent }}%</span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
          <div
            class="h-full rounded-full bg-cyan-400 transition-[width] duration-700"
            :style="{ width: `${video.progressPercent}%` }"
          />
        </div>
      </div>

      <p class="mt-3 truncate text-xs text-slate-500">
        {{ relativeTime(video.lastWatchedAt) }}
      </p>

      <button class="btn-primary mt-auto w-full pt-3" type="button" @click="$emit('play', video)">
        {{ video.watchedSeconds > 0 ? "Continue Watching →" : "Watch Lesson →" }}
      </button>
    </div>
  </article>
</template>
