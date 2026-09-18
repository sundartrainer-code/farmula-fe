<script setup>
import { nextTick, ref, watch } from "vue"
import LazyThumbnail from "./LazyThumbnail.vue"

const props = defineProps({
  lessons: { type: Array, default: () => [] },
  currentId: { type: String, required: true },
})

defineEmits(["select"])

const listRef = ref(null)

watch(() => props.currentId, async () => {
  await nextTick()
  const list = listRef.value
  const current = list?.querySelector("[data-current-lesson='true']")
  if (!list || !current) return

  list.scrollTo({
    top: current.offsetTop - list.offsetTop - 8,
    behavior: "smooth",
  })
}, { immediate: true })
</script>

<template>
  <aside class="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <header class="border-b border-slate-200 p-4 dark:border-slate-800">
      <p class="text-xs font-black uppercase text-cyan-400">Course Content</p>
      <h2 class="mt-1 text-lg font-black text-slate-950 dark:text-white">{{ lessons.length }} lessons</h2>
    </header>
    <div ref="listRef" class="max-h-[calc(100vh-15rem)] overflow-y-auto p-2">
      <button
        v-for="lesson in lessons"
        :key="lesson.id"
        type="button"
        class="mb-2 grid w-full min-w-0 grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-lg border p-2 text-left transition"
        :class="lesson.id === currentId
          ? 'border-cyan-400 bg-cyan-400/10'
          : 'border-transparent hover:bg-slate-800'"
        :data-current-lesson="lesson.id === currentId"
        @click="$emit('select', lesson)"
      >
        <div class="relative">
          <LazyThumbnail
            :src="lesson.thumbnailUrl"
            :alt="lesson.title"
            :lesson-id="lesson.id"
            :duration-seconds="lesson.durationSeconds"
          />
          <span class="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-black text-white">
            {{ lesson.durationFormatted }}
          </span>
        </div>
        <div class="min-w-0 py-1">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-black uppercase text-cyan-400">
              {{ lesson.isIntroduction ? "Introduction" : `Episode ${lesson.lessonNumber}` }}
            </p>
            <span v-if="lesson.completed" class="text-sm font-black text-emerald-400" aria-label="Completed">✓</span>
          </div>
          <p class="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-950 dark:text-white">{{ lesson.title }}</p>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-slate-700">
            <div class="h-full rounded-full bg-cyan-400" :style="{ width: `${lesson.progressPercent}%` }" />
          </div>
          <p class="mt-1 text-[11px] text-slate-400">{{ lesson.progressPercent }}% complete</p>
        </div>
      </button>
    </div>
  </aside>
</template>
