<script setup>
import { onMounted, ref } from "vue"
import AppShell from "../components/AppShell.vue"
import LazyThumbnail from "../components/LazyThumbnail.vue"
import { api } from "../services/api"

const error = ref("")
const lessons = ref([])
const savingOrder = ref(false)
let draggedIndex = -1

async function loadLessons() {
  const response = await api.get("/api/admin/lessons")
  lessons.value = response.data.lessons || []
}

function dragStart(index) {
  draggedIndex = index
}

async function dropAt(index) {
  if (draggedIndex < 0 || draggedIndex === index) return
  const reordered = [...lessons.value]
  const [moved] = reordered.splice(draggedIndex, 1)
  reordered.splice(index, 0, moved)
  lessons.value = reordered.map((lesson, sortOrder) => ({ ...lesson, sortOrder }))
  draggedIndex = -1
  savingOrder.value = true
  try {
    const response = await api.patch("/api/admin/lessons/order", {
      lessons: lessons.value.map(({ id, sortOrder }) => ({ id, sortOrder })),
    })
    lessons.value = response.data.lessons
  } catch (requestError) {
    error.value = requestError.response?.data?.message || "Unable to save lesson order."
    await loadLessons()
  } finally {
    savingOrder.value = false
  }
}

onMounted(() => loadLessons().catch((requestError) => {
  error.value = requestError.response?.data?.message || "Unable to load lessons."
}))
</script>

<template>
  <AppShell>
    <section class="space-y-6">
      <header>
        <p class="text-sm font-black uppercase text-cyan-500">Administration</p>
        <h1 class="mt-1 text-3xl font-black">Lesson Management</h1>
      </header>

      <article class="card p-6">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black">Lesson Order</h2>
            <p class="mt-1 text-sm text-slate-500">Drag lessons into their teaching sequence.</p>
          </div>
          <span v-if="savingOrder" class="text-sm font-bold text-cyan-500">Saving...</span>
        </div>
        <p v-if="error" class="mt-5 rounded-lg bg-red-500/10 p-4 text-red-500" role="alert">{{ error }}</p>
        <div class="mt-5 space-y-2">
          <article
            v-for="(lesson, index) in lessons"
            :key="lesson.id"
            draggable="true"
            class="grid cursor-grab grid-cols-[32px_96px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
            @dragstart="dragStart(index)"
            @dragover.prevent
            @drop="dropAt(index)"
          >
            <span class="text-center font-black text-slate-400">⋮⋮</span>
            <LazyThumbnail :src="lesson.thumbnailUrl" :alt="lesson.title" />
            <div class="min-w-0">
              <p class="truncate font-black">{{ lesson.title }}</p>
              <p class="mt-1 text-xs text-slate-500">Order {{ lesson.sortOrder }} · {{ lesson.durationFormatted }}</p>
            </div>
          </article>
        </div>
      </article>
    </section>
  </AppShell>
</template>
